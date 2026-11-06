# DriveEasy - React + Vite

A car rental project with User and Admin modules. Authentication, users, and bookings are stored in browser Local Storage for this academic demonstration.

## Run locally

1. Install Node.js (LTS).
2. Open this folder in VS Code.
3. Open the terminal and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite.

## Demo admin account

- Email: `admin@driveeasy.com`
- Password: `Admin@123`

Create a normal User account using the Signup page.

## Modules

- **User:** Sign up, log in, browse/filter cars, book a car, and view only their own bookings.
- **Admin:** Separate admin login, dashboard statistics, view all bookings, and manage car availability.

## Local Storage keys

- `driveeasyUsers`
- `driveeasyCurrentUser`
- `driveeasyBookings`
- `driveeasyCars`

Use the browser's developer tools > Application > Local Storage to inspect the demo data.

## Deploy to Vercel

1. Push this project folder to a GitHub repository.
2. In Vercel, choose **Add New > Project** and import that repository.
3. Vercel should detect **Vite** automatically.
4. Confirm:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click Deploy. The included `vercel.json` supports client-side routes if routes are added later.

## Important academic/demo limitation

Local Storage is browser-specific and is not a secure production authentication system. Passwords in this teaching demo are stored locally so the required Local Storage flow can be demonstrated. A real rental service should use a backend, database, and securely hashed passwords.
