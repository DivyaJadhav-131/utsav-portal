# Deploy Utsav on Vercel

This project deploys the React frontend and Express API together on one domain.
No new storage account is required: new event posters (maximum 4 MB) are stored
in the existing MongoDB database. This is intended for small campus-event images;
image storage and bandwidth count toward your MongoDB plan.

## Vercel setup

1. Commit the updated source and configuration, then import the Git repository.
2. Use the repository root (`.`), not `client` or `server`, as Root Directory.
3. Select framework preset **Other**. The checked-in `vercel.json` sets the install
   command, build command, output folder, API function, and page-refresh routing.
4. Set these **server-only** environment variables in Vercel:
   - `MONGODB_URI`: the same database URI AND database name used locally if you
     want the existing accounts, events, and registrations.
   - `JWT_SECRET`: a strong random secret; do not prefix it with `VITE_`.
   - `NODE_ENV`: `production`.
   - `CLIENT_URL`: the deployed site's HTTPS origin (no trailing slash).
   - `JWT_EXPIRES_IN`: optional, defaults to `7d`.
5. Ensure the MongoDB database user has read/write access, including permission
   to create the `eventimages` collection, and that network rules allow your
   Vercel backend to connect. Do not use a localhost database URI in Vercel.
6. Deploy, then open `/api/health`: it should return `{"status":"ok"}`.
7. Check sign-in, a direct refresh of `/login` and `/events/<existing-id>`, an
   existing poster, a new event image upload, and registration/cancellation.

## Existing data

- Builds do not seed, migrate, clear, or connect to the database.
- Existing event/account/registration documents are unchanged. Local and deployed
  apps using the same database will see each other's edits.
- The five existing `.webp` posters in `server/uploads/events` remain tracked and
  are included in the backend bundle. Keep those files in Git so old image URLs
  continue to work. New uploads go to MongoDB and survive redeploys.
- Updating/deleting an event removes its database-stored poster when appropriate.
  Legacy bundled image files remain unchanged.
- Use a separate database for Preview deployments if you want preview edits
  isolated from production.

## Credentials and Git

The local `server/.env` and generated `dist` folders were removed from the Git
index, not from disk. `.gitignore` and `.vercelignore` exclude secrets from future
commits/uploads. Environment examples contain placeholders only.

**The initial commit already contained `server/.env`. Untracking it does not erase
Git history. Rotate the database credential and JWT secret before publishing this
repository or deployment.** Update your local `.env` and Vercel environment settings
together. A JWT secret change signs existing users out but does not delete accounts.
If the repository was already shared, old credentials must be treated as exposed.
Also replace the seed script's documented default admin password if that account
still uses it. The seed script is never run by deployment.

## Verification

`npm run build` builds both applications. `npm test` rebuilds the server and runs
local API smoke tests with mocked database operations; it does not touch live data.
A real Vercel deployment and database-access check are still required after setting
hosted environment variables.

References:
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/functions/runtimes/node-js
- https://vercel.com/docs/functions/limitations
