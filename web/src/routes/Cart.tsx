import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  type CartDTO,
} from "../api/cart";
import { useCartStore } from "../store/cart";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function FallbackImage(
  props: React.ImgHTMLAttributes<HTMLImageElement> & { fallbackText?: string }
) {
  const { fallbackText, alt, onError, ...rest } = props;
  return (
    <img
      {...rest}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        if (!el.dataset.fallbackShown) {
          el.dataset.fallbackShown = "1";
          el.src = `https://placehold.co/120x120?text=${encodeURIComponent(
            fallbackText || String(alt || "Image")
          )}`;
        }
        onError?.(e);
      }}
    />
  );
}

export default function Cart() {
  const qc = useQueryClient();
  const ensureCartId = useCartStore((s) => s.ensureCartId);

  // Make sure guests have a cart id before first fetch
  useEffect(() => {
    ensureCartId();
  }, [ensureCartId]);

  const query = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    staleTime: 10_000,
  });

  const mutUpdate = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const mutRemove = useMutation({
    mutationFn: (itemId: string) => removeFromCart(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const mutClear = useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const cart = query.data as CartDTO | undefined;

  const subtotal = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  }, [cart]);

  return (
    <section className="px-6 md:px-10 lg:px-16 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-bold">Your Cart</h1>

        {/* States */}
        {query.isLoading ? (
          <div className="mt-6 rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
            Loading cart…
          </div>
        ) : query.isError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
            Failed to load cart. Please try again.
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-gray-200 p-6 text-gray-700 dark:border-gray-800 dark:text-gray-300">
            Your cart is empty.{" "}
            <Link to="/items" className="font-semibold underline">
              Continue shopping →
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
            {/* Lines */}
            <div className="space-y-4">
              {cart.items.map((line) => (
                <div
                  key={line.item.id}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
                    <FallbackImage
                      src={line.item.imageUrl}
                      alt={line.item.name}
                      fallbackText={line.item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {line.item.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {line.item.category}
                        </p>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatINR(line.item.price)}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-xl ring-1 ring-gray-300 dark:ring-gray-700">
                        <button
                          type="button"
                          className="px-2 py-1 text-sm"
                          onClick={() =>
                            mutUpdate.mutate({
                              itemId: line.item.id,
                              quantity: line.qty - 1,
                            })
                          }
                          disabled={mutUpdate.isPending}
                          title="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-3 text-sm tabular-nums">{line.qty}</span>
                        <button
                          type="button"
                          className="px-2 py-1 text-sm"
                          onClick={() =>
                            mutUpdate.mutate({
                              itemId: line.item.id,
                              quantity: line.qty + 1,
                            })
                          }
                          disabled={mutUpdate.isPending}
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="text-sm text-red-600 hover:underline dark:text-red-400"
                        onClick={() => mutRemove.mutate(line.item.id)}
                        disabled={mutRemove.isPending}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <aside className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-base font-semibold">Order Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <dt>Shipping</dt>
                  <dd>Free over ₹999</dd>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <dt>Taxes</dt>
                  <dd>Calculated at checkout</dd>
                </div>
              </dl>

              <button
                type="button"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                title="Proceed to checkout (demo)"
                onClick={() => alert("Checkout flow is out of scope for now.")}
              >
                Checkout
              </button>

              <div className="mt-4 flex items-center justify-between gap-3">
                <Link
                  to="/items"
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                >
                  ← Continue shopping
                </Link>
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:underline dark:text-gray-300"
                  onClick={() => mutClear.mutate()}
                  disabled={mutClear.isPending}
                >
                  Clear cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
