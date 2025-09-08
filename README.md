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


### 🔐 Auth Flow (summary)

Login sets a HttpOnly cookie (token).
On app mount, SPA calls /auth/me to hydrate user in the Zustand store.
Logout clears cookie; Navbar updates.
No tokens in localStorage; cookies flow via Axios withCredentials: true.

### 🛒 Cart Behavior

Guest cart: web/src/store/cart.ts ensures a UUID in localStorage (cartId).
Axios attaches X-Cart-Id on every request; server uses this to load/persist a guest cart.
Logged-in cart: identified by userId in the JWT cookie.
The same UI works for both. Navbar badge uses useQuery(["cart"]).

### 🔗 Key Endpoints

Base: http://localhost:8080/api
Health: GET /health

### Auth

POST /auth/signup { name, email, password } → { user }  
POST /auth/login { email, password } → { user } + cookie  
GET /auth/me → { user }  
POST /auth/logout → 204  

### Items

GET /items?q=&category=&minPrice=&maxPrice=&sort=&page=&limit=
→ { items, total, page, pageSize }  
GET /items/:id  
(admin) POST /items, PATCH /items/:id, DELETE /items/:id (Coming soon).  
Cart (guest or user)  
GET /cart → { cart }  
POST /cart/add { itemId, quantity? } → { cart }  
PATCH /cart/item/:itemId { quantity } → { cart }  
DELETE /cart/item/:itemId → { cart }  
POST /cart/clear → { cart }  
