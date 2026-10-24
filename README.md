# Utsav Campus Event Portal

Utsav is a React and JavaScript frontend connected to the existing Express and MongoDB backend. The frontend keeps pages and reusable controls in small JSX files; the backend keeps routes, controllers, models, validation, and middleware in separate folders.

## Project map

```text
api/index.js                 Vercel entry that loads the Express app
client/
  index.html                 Browser page and React mount point
  vite.config.js             Frontend development server and API proxy
  src/
    main.jsx                 Starts React and loads the shared stylesheet
    App.jsx                  Application routes
    pages.jsx                Shared not-found and access-denied pages
    components.jsx           Page layout, access checks, and notifications
    api.js                   Account, event, and registration API requests
    index.css                Main stylesheet and responsive design
    pages/                   Larger home, event, account, and admin pages
    components/              Reusable cards, navigation, forms, and controls
    schemas/                 Login, signup, and event form validation
    contexts/                Shared login state
    hooks/                   Reusable toast hook
    lib/                     Dates, images, and department constants
server/
  src/
    index.js                 Express app and middleware setup
    routes/                  API URL to controller mapping
    controllers/             Request handling and business operations
    models/                  MongoDB models
    validators/              Server-side request validation
    middleware/              Login, role checks, uploads, and errors
    utils/                   Database, JWT, image, and async helpers
  dist/                      JavaScript copied here for deployment
  tests/                     API deployment smoke tests
  uploads/                   Existing event poster files
```

## Install and configure

The frontend uses plain CSS and has no Tailwind package, configuration, or build step. The main stylesheet is `client/src/index.css`; its descriptive classes preserve the current layout and responsive design.

1. Install Node.js and start a MongoDB database locally or create an Atlas database.
2. From the project root, install both sets of dependencies:

   ```powershell
   npm ci --prefix server
   npm ci --prefix client
   ```

3. Create the local server settings file:

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

4. Edit `server/.env`. Set `MONGODB_URI` to your local or Atlas connection string. Set `JWT_SECRET` to a long random value. For local development, keep `PORT=5000`, `NODE_ENV=development`, and `CLIENT_URL=http://localhost:5173`.
5. Keep `server/.env` private and out of Git. The checked-in `.env.example` is only a template.

## Start the application

Open two terminals at the project root.

In the first terminal, start the API:

```powershell
npm run dev --prefix server
```

In the second terminal, start the frontend:

```powershell
npm run dev --prefix client
```

Open `http://localhost:5173`. Vite forwards `/api` and `/uploads` requests to the Express server on port 5000. Check `http://localhost:5000/api/health` for the API health response.

For the production build and preview:

```powershell
npm run build
npm run preview --prefix client
```

## Create a demo admin account

Use a new or disposable test database. The seed script creates `admin@college.edu` with the password `Admin@1234` if that account does not exist:

```powershell
npm run seed --prefix server
```

Change the demo password before using that account outside a local practical demonstration. Sign up through the site to create a student account.

## Test the main features

Run the build and automated server tests:

```powershell
npm run build
npm test
```

The server tests start a local HTTP server and mock database calls; they do not modify a live database. They cover authentication requirements, API errors, image upload limits, image serving, and JSON 404 behavior.

Manual browser checks with a configured database:

1. Open the home page. Search for an event, choose a department, and change the date filter.
2. Sign up as a student, sign out, and sign in again. Confirm invalid email and short passwords show validation messages.
3. Open an event, register, then check **My Events** and cancel the registration.
4. Sign in with the demo admin. Open the admin dashboard, create an event with and without an image, edit it, inspect its registrations, and delete a disposable event.
5. Refresh a nested route such as `/events/<event-id>` and confirm the page loads.

The automated checks do not perform these database-backed browser flows. Run the manual steps against a disposable database before presenting the complete application.

## Troubleshooting

- **Frontend says the API is unavailable:** confirm the server is running on port 5000 and `CLIENT_URL` is `http://localhost:5173`.
- **Database unavailable:** confirm MongoDB is running and `MONGODB_URI` includes the correct database name and credentials.
- **Login fails after changing `JWT_SECRET`:** sign in again; existing login cookies were signed with the previous secret.
- **Event posters do not load:** check the `/uploads` request in the browser and confirm the server is running. Existing bundled posters are in `server/uploads/events`.
- **Admin routes redirect:** sign in with an account whose database role is `admin`; signing up creates a student account.

## PHP validation demonstration

`php-demo/validation.php` is a separate learning example. It checks a name and email on form submission and safely escapes displayed values. It does not use the portal database or API; all real authentication and event validation stay in the Express backend.

If PHP is installed, start the demo from the project root:

```powershell
php -S localhost:8000 -t php-demo
```

Then open `http://localhost:8000/validation.php`.
