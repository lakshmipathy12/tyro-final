# Tyro Final - Setup Instructions

## 1. Prerequisites
- Node.js installed
- PostgreSQL installed and running
- PgAdmin 4 (optional, for viewing DB)

## 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Rename `.env.example` in the root (or backend, check location) to `.env`.
   - Update `DATABASE_URL` with your Postgres credentials.
   - Example: `postgresql://postgres:yourpassword@localhost:5432/tyro_final?schema=public`

4. Push Database Schema:
   ```bash
   npx prisma db push
   ```
   *This command creates the tables in your PostgreSQL database.*

5. Start the Backend Server:
   ```bash
   npm run dev
   ```
   *Server should run on http://localhost:5000*

## 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Development Server:
   ```bash
   npm run dev
   ```
   *Frontend should run on http://localhost:5173*

## 4. Initial Usage
1. Go to `http://localhost:5173`
2. You will be redirected to Login.
3. Since there are no users, you can manually create an Admin in the database using Prisma Studio or SQL, OR use the `/api/auth/register` endpoint (initially open) to create your first user.
   - **Tip**: To use Prisma Studio: `cd backend` -> `npx prisma studio`.
4. Login with your credentials.
5. Try Clocking In (requires location permission for Office mode).

## 5. Notes
- Geofencing is set to `13.119133, 80.151252` with 100m radius.
- JWT tokens are stored in HTTP-Only cookies.
