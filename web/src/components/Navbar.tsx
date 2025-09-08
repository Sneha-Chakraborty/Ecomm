import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { logout } from "../api/auth";
import { getCart } from "../api/cart";
import { useCartStore } from "../store/cart";

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);

  // Ensure a guest has a cartId so cart queries work
  const ensureCartId = useCartStore((s) => s.ensureCartId);
  // Call once when navbar mounts
  // (React StrictMode may call twice in dev — harmless)
  ensureCartId();

  // Cart count (sum of quantities). Works for guests & logged-in.
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    staleTime: 10_000,
  });
  const cartCount = cartQuery.data
    ? cartQuery.data.items.reduce((sum, line) => sum + line.qty, 0)
    : 0;

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearUser();
      navigate("/", { replace: true });
    }
  }

  const activeLink = (to: string) =>
    pathname.startsWith(to)
      ? "text-gray-900 dark:text-gray-100"
      : "hover:underline";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-black/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:px-10 lg:px-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-extrabold tracking-tight">
            Ecomm
          </Link>
          <nav className="hidden gap-4 text-sm font-medium sm:flex">
            <Link to="/items" className={activeLink("/items")}>
              Shop
            </Link>

            {/* Cart link with count badge */}
            <Link to="/cart" className={`relative ${activeLink("/cart")}`}>
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-700 dark:text-gray-300 sm:inline">
                Hi, <span className="font-semibold">{user.name.split(" ")[0]}</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
