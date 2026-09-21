import mongoose from 'mongoose';

let connection: Promise<typeof mongoose> | undefined;
export function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (!connection) {
    const uri = process.env.MONGODB_URI;
    if (!uri && process.env.NODE_ENV === 'production') throw new Error('MONGODB_URI is required');
    connection = mongoose.connect(uri || 'mongodb://127.0.0.1:27017/college_events', {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 5,
    }).catch(error => { connection = undefined; throw error; });
  }
  return connection;
}
