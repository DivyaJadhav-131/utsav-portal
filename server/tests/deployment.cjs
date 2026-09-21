const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
process.env.NODE_ENV = 'production';
process.env.VERCEL = '1';
process.env.JWT_SECRET = 'deployment-test-only-not-a-real-secret';
const database = require('../dist/utils/database');
// No production database is contacted or modified by these tests.
let databaseAvailable = true;
database.connectDatabase = async () => {
  if (!databaseAvailable) throw new Error('simulated database outage');
};
const app = require('../../api/index');
const mongoose = require('../node_modules/mongoose');
const Image = mongoose.model('EventImage');
const Event = mongoose.model('Event');
const images = new Map();
Image.create = async image => { images.set(image._id, image); return image; };
Image.findById = async id => images.get(id) || null;
Image.deleteOne = async ({ _id }) => { images.delete(_id); };
const storage = require('../dist/utils/imageStorage');
let server, base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });
test('serverless health waits for database and returns no-store', async () => {
  let response = await fetch(base + '/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  databaseAvailable = false;
  try {
    response = await fetch(base + '/api/health');
    assert.equal(response.status, 503);
  } finally { databaseAvailable = true; }
});
test('protected event writes require authentication', async () => {
  const response = await fetch(base + '/api/events', { method: 'POST' });
  assert.equal(response.status, 401);
});
test('async database errors produce JSON instead of hanging', async () => {
  Event.find = () => ({ sort: async () => { throw new Error('test database failure'); } });
  const response = await fetch(base + '/api/events');
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { message: 'Internal server error' });
});
test('stored poster bytes survive subsequent requests and can be removed', async () => {
  const bytes = Buffer.from('test-image-bytes');
  const imagePath = await storage.saveImage({ mimetype: 'image/webp', buffer: bytes });
  const response = await fetch(base + '/uploads/' + imagePath);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/webp');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  await storage.removeImage(imagePath);
  assert.equal((await fetch(base + '/uploads/' + imagePath)).status, 404);
});
test('legacy bundled event photos remain accessible without migration', async () => {
  const folder = path.join(__dirname, '../uploads/events');
  const name = fs.readdirSync(folder).find(name => name.endsWith('.webp'));
  assert.ok(name);
  const response = await fetch(base + '/uploads/events/' + name);
  assert.equal(response.status, 200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), fs.readFileSync(path.join(folder, name)));
});
test('unknown API routes return JSON 404 rather than the frontend', async () => {
  const response = await fetch(base + '/api/does-not-exist');
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: 'Not found' });
});

test('authenticated multipart upload persists poster before publishing event', async () => {
  const { signToken } = require('../dist/utils/jwt');
  Event.create = async data => ({ ...data, _id: 'test-event' });
  const form = new FormData();
  for (const [name, value] of Object.entries({ title: 'Test event', description: 'Deployment upload test', dateTime: '2027-01-01T10:00:00Z', venue: 'Hall A', organizerName: 'Campus', department: 'IT' })) form.set(name, value);
  form.set('image', new Blob(['poster-content'], { type: 'image/png' }), 'poster.png');
  const response = await fetch(base + '/api/events', { method: 'POST', headers: { cookie: `token=${signToken({ userId: 'test-admin', role: 'admin' })}` }, body: form });
  assert.equal(response.status, 201);
  const event = await response.json();
  assert.equal(event.department, 'IT');
  const poster = await fetch(base + '/uploads/' + event.imagePath);
  assert.equal(await poster.text(), 'poster-content');
});
test('oversized and unsupported uploads return handled errors', async () => {
  const { signToken } = require('../dist/utils/jwt');
  const cookie = `token=${signToken({ userId: 'test-admin', role: 'admin' })}`;
  for (const [body, type, name, expected] of [
    ['not-an-image', 'text/plain', 'file.txt', 'Only JPEG, PNG and WebP images are allowed'],
    [Buffer.alloc(4 * 1024 * 1024 + 1), 'image/png', 'large.png', 'Image must not exceed 4 MB'],
  ]) {
    const form = new FormData();
    form.set('image', new Blob([body], { type }), name);
    const response = await fetch(base + '/api/events', { method: 'POST', headers: { cookie }, body: form });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).message, expected);
  }
});
