Ecomm Server (API)

TypeScript/Express backend for the MERN e-commerce SPA.
Provides authentication (JWT + HttpOnly cookies), items catalog with filtering, and a cart that works for both guests (via X-Cart-Id) and logged-in users (via userId).

Runtime: Node.js + Express + TypeScript

DB: MongoDB (Mongoose)

Validation: Zod

Auth: JWT (HttpOnly cookie), bcrypt for hashing

CORS: Credentials enabled for the web app

Features

Auth

POST /api/auth/signup — create account

POST /api/auth/login — issues JWT in HttpOnly cookie

GET /api/auth/me — returns current user (from cookie)

POST /api/auth/logout — clears cookie

Items

CRUD endpoints for items, plus public list with filters:

text search (q), category, price range, sorting, pagination

Cart

Works for guests using X-Cart-Id (UUID stored by the frontend)

Works for users via userId from JWT cookie

Endpoints to add/update/remove lines and clear cart

Health

GET /api/health

Tech Stack

Express + TypeScript

Mongoose (MongoDB)

Zod for runtime validation

jsonwebtoken, cookie-parser (HttpOnly cookies)

bcryptjs for password hashing

cors with credentials: true

dotenv for environment variables

tsx for fast dev (npm run dev)


Environment

Create server/.env:

NODE_ENV=development
PORT=8080

# MongoDB connection string (Atlas or local); include your DB name at the end
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.<id>.mongodb.net/ecomm?retryWrites=true&w=majority

# JWT
JWT_SECRET=<a_long_random_string>
JWT_EXPIRES_IN=14d



Scripts

From server/:

npm install

# Dev (watches TS with tsx)
npm run dev



Running Locally

MongoDB

Use MongoDB Atlas or a local MongoDB

Put the full connection string in MONGO_URI

Start API

cd server
npm install
npm run dev


Expected logs:

✅ Mongo connected → <cluster/db>
🚀 Server listening on http://localhost:8080
🩺 Health check:      http://localhost:8080/api/health


Test health

curl http://localhost:8080/api/health


Security Notes

JWT stored in HttpOnly cookie to mitigate XSS token theft

Passwords hashed with bcrypt

Input validated w/ Zod on both body and query

Avoid logging secrets or sensitive data in production.