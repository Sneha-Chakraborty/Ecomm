# MERN E-commerce – Monorepo

A full-stack, production-style e-commerce application built with the MERN stack and TypeScript. It includes secure authentication, catalog with filters, and a cart that works for guests (persisted via X-Cart-Id) and logged-in users (persisted by userId).

## ✨ Features

Auth: Signup, Login, Logout, /auth/me hydration (JWT in HttpOnly cookie)

## Catalog:

Listing with search, category filter, price range, sorting, pagination
Item CRUD (admin endpoints are present on server)

## Cart:

Works when not logged in using a stable X-Cart-Id (UUID stored in localStorage)
Works when logged in via server-side user cart
Add / update quantity / remove / clear, subtotal on UI
Responsive SPA UI with a clean, modern design (Tailwind)
Good DX: typed APIs, error handling, validation (Zod), React Query states

## 🧱 Tech Stack

### Frontend

React 18 + TypeScript + Vite
Tailwind CSS
React Router v6
TanStack Query (React Query)
Axios (with interceptors)
Zod + React Hook Form (+ resolvers)
Zustand (auth + cartId)

### Backend

Node.js + Express + TypeScript
MongoDB (Mongoose)
Zod (runtime validation)
JWT (jsonwebtoken) + cookie-parser
bcryptjs
CORS with credentials
dotenv, tsx (dev), tsc (build)


## Local Development

Open two terminals (one for server/, one for web/):

### Backend

cd server
npm install
npm run dev
# → ✅ Mongo connected
#   🚀 Server listening on http://localhost:8080


### Frontend

cd web
npm install
npm run dev
## → Vite on http://localhost:5173


## Open http://localhost:5173.
