Ecomm Web (SPA)

A modern, responsive single-page e-commerce frontend built with React + TypeScript + Vite, styled with Tailwind CSS, data-fetched with TanStack Query, form-validated with Zod + React Hook Form, and client state via Zustand.

This app talks to the backend at http://localhost:8080/api (configurable), supports JWT auth (HttpOnly cookie), and a guest/user cart that persists using a stable X-Cart-Id.

✨ Features

Home / Landing with hero, categories, featured picks

Auth: Signup & Login (JWT cookie), /auth/me hydration on app load

Catalog: /items with search, category filter, price range, sorting, and pagination (URL-driven)

Cart: /cart with quantity stepper, remove, clear, and live subtotal

Guest cart is persisted by a UUID in localStorage sent as X-Cart-Id

Logged-in users use a server cart keyed by userId

Navbar with live cart count and login/logout actions

Production-ready UX: loading & error states, optimistic cues like “Added ✓”

🧱 Tech Stack

React 18 + TypeScript

Vite dev server & build

React Router v6 for routes

@tanstack/react-query for server state

Axios with request/response interceptors

Zod + @hookform/resolvers + react-hook-form for forms & validation

Zustand for small client state (auth & cart id)

Tailwind CSS


Scripts
# from web/
npm install

# start dev server at http://localhost:5173
npm run dev



Authentication Flow

Signup → POST /auth/signup returns { user } and may set a cookie on login only.

Login → POST /auth/login sets a HttpOnly JWT cookie.

Hydrate on load → App calls /auth/me to restore the user.

Logout → POST /auth/logout clears cookie; navbar updates.

Cookies are HttpOnly; there is no token in localStorage.

🛒 Cart Behavior

Guest cart

web/src/store/cart.ts creates/persists a UUID in localStorage (cartId)

Axios interceptor attaches X-Cart-Id on every request

Server uses this id to load/persist a guest cart

Logged-in cart

Server keys by userId from the JWT cookie

The same UI works without changes

Navbar badge uses useQuery(["cart"]) to show the total quantity

🔗 API Endpoints (quick reference)

Configured base: VITE_API_URL (defaults to http://localhost:8080/api)

Health: GET /health

Auth

POST /auth/signup { name, email, password }

POST /auth/login { email, password } → sets cookie

GET /auth/me

POST /auth/logout

Items

GET /items?q=&category=&minPrice=&maxPrice=&sort=&page=&limit=

GET /items/:id

(admin) POST /items, PATCH /items/:id, DELETE /items/:id

Cart (works for guest with X-Cart-Id or logged-in)

GET /cart

POST /cart/add { itemId, quantity? }

PATCH /cart/item/:itemId { quantity }

DELETE /cart/item/:itemId

POST /cart/clear