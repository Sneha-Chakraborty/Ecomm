import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./routes/Home";
import Signup from "./routes/Signup";
import Login from "./routes/Login";
import Items from "./routes/Items";
import Cart from "./routes/Cart";
import { useAuthStore } from "./store/auth";

export default function App() {
  // Hydrate user from HttpOnly cookie session on first load / refresh
  useEffect(() => {
    useAuthStore.getState().fetchMe();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-100">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Catalog & Cart */}
          <Route path="/items" element={<Items />} />
          <Route path="/cart" element={<Cart />} />

          {/* Auth */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
