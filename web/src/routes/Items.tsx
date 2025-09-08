// web/src/routes/Items.tsx
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listItems } from "../api/items";
import { addToCart } from "../api/cart";
import { useCartStore } from "../store/cart";
import type { ItemDTO, ListParams, SortValue, ItemsListResponse } from "../types/item";

/* ---------- Config ---------- */
const CATEGORIES = [
  { label: "Women Apparel", value: "women apparel" },
  { label: "Men Apparel", value: "men apparel" },
  { label: "Sports", value: "sports" },
  { label: "Electronics", value: "electronics" },
  { label: "Home & Living", value: "home & living" },
  { label: "Accessories", value: "accessories" },
] as const;

const SORTS: { label: string; value: SortValue }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Relevance (when searching)", value: "relevance" },
];

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

/* Safe image with placeholder */
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
          el.src = `https://placehold.co/600x600?text=${encodeURIComponent(
            fallbackText || String(alt || "Image")
          )}`;
        }
        onError?.(e);
      }}
    />
  );
}

/* Card */
function ProductCard({
  item,
  onAdd,
  adding,
  added,
}: {
  item: ItemDTO;
  onAdd: () => void;
  adding: boolean;
  added: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white ring-1 ring-transparent transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
        <FallbackImage
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          fallbackText={item.name}
        />
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {item.name}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
        </div>
        <div className="shrink-0 text-sm font-bold text-gray-900 dark:text-gray-100">
          {formatINR(item.price)}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          disabled={adding}
          title="Add to cart"
        >
          {adding ? "Adding…" : added ? "Added ✓" : "Add to Cart"}
        </button>
        <Link
          to="#"
          className="hidden rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white sm:inline-flex"
        >
          View
        </Link>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function Items() {
  const [sp, setSp] = useSearchParams();
  const qc = useQueryClient();
  const ensureCartId = useCartStore((s) => s.ensureCartId);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // Read params from URL (gives string)
  const q = sp.get("q") || "";
  const category = sp.getAll("category"); // supports multiple (?category=a&category=b)
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const sort = (sp.get("sort") as SortValue | null) || "newest";
  const page = Number(sp.get("page") || "1");
  const limit = Number(sp.get("limit") || "12");

  // Build params for API
  const params: ListParams = useMemo(
    () => ({
      q: q || undefined,
      category: category.length === 0 ? undefined : category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
      page,
      limit,
    }),
    [q, category, minPrice, maxPrice, sort, page, limit]
  );

  const query = useQuery<ItemsListResponse, Error>({
    queryKey: ["items", params],
    queryFn: () => listItems(params),
    staleTime: 10_000,
  });

  // Add-to-cart mutation
  const addMut = useMutation({
    mutationFn: (vars: { itemId: string; quantity?: number }) => {
      // Make sure a guest has a cartId before calling API
      ensureCartId();
      return addToCart({ itemId: vars.itemId, quantity: vars.quantity ?? 1 });
    },
    onSuccess: (_data, vars) => {
      setLastAddedId(vars.itemId);
      // Clear the "Added" label after a short delay
      setTimeout(() => setLastAddedId((id) => (id === vars.itemId ? null : id)), 1200);
      // Refresh any cart-dependent UI
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Helpers to write params
  function updateParams(next: Partial<Record<string, string | string[] | null>>) {
    const copy = new URLSearchParams(sp); // current
    for (const [k, v] of Object.entries(next)) {
      copy.delete(k);
      if (v == null) continue;
      if (Array.isArray(v)) {
        for (const el of v) copy.append(k, el);
      } else {
        copy.set(k, v);
      }
    }
    if (!("page" in next)) {
      copy.set("page", "1");
    }
    setSp(copy, { replace: true });
  }

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / query.data.pageSize));
  }, [query.data]);

  /* UI */
  return (
    <section className="px-6 md:px-10 lg:px-16 py-8 md:py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold">Filters</h2>

          {/* Search */}
          <div className="mt-4">
            <label htmlFor="q" className="block text-sm font-medium">
              Search
            </label>
            <input
              id="q"
              type="text"
              defaultValue={q}
              placeholder="Search products…"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const input = e.currentTarget as HTMLInputElement;
                  updateParams({ q: input.value || null });
                }
              }}
              onBlur={(e) => updateParams({ q: e.currentTarget.value || null })}
            />
          </div>

          {/* Category */}
          <div className="mt-4">
            <span className="block text-sm font-medium">Category</span>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {CATEGORIES.map((c) => {
                const selected = category.includes(c.value);
                return (
                  <button
                    key={c.value}
                    onClick={() => {
                      // Toggle multi-select
                      const next = new Set(category);
                      if (next.has(c.value)) next.delete(c.value);
                      else next.add(c.value);
                      const arr = Array.from(next);
                      updateParams({ category: arr.length ? arr : null });
                    }}
                    className={`rounded-xl px-3 py-2 text-sm text-left ring-1 transition ${
                      selected
                        ? "bg-emerald-50 ring-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:ring-emerald-800 dark:text-emerald-200"
                        : "bg-white ring-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div className="mt-4">
            <span className="block text-sm font-medium">Price range (₹)</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min"
                defaultValue={minPrice || ""}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                onBlur={(e) =>
                  updateParams({
                    minPrice: e.currentTarget.value ? String(Math.max(0, Number(e.currentTarget.value))) : null,
                  })
                }
              />
              <input
                type="number"
                min={0}
                placeholder="Max"
                defaultValue={maxPrice || ""}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                onBlur={(e) =>
                  updateParams({
                    maxPrice: e.currentTarget.value ? String(Math.max(0, Number(e.currentTarget.value))) : null,
                  })
                }
              />
            </div>
          </div>

          {/* Sort */}
          <div className="mt-4">
            <label htmlFor="sort" className="block text-sm font-medium">
              Sort by
            </label>
            <select
              id="sort"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <button
            onClick={() => setSp(new URLSearchParams(), { replace: true })}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            type="button"
          >
            Clear all
          </button>
        </aside>

        {/* Results */}
        <div className="min-w-0">
          {/* Category quick pills */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => {
              const selected = category.includes(c.value);
              return (
                <button
                  key={c.value}
                  onClick={() => updateParams({ category: [c.value] })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                    selected
                      ? "bg-gray-900 text-white ring-gray-900 dark:bg-gray-100 dark:text-gray-900"
                      : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                  }`}
                  title={c.label}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Header / counts */}
          <div className="mt-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Catalog</h1>
            {query.data ? (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {query.data.total} result{query.data.total === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>

          {/* Grid */}
          <div className="mt-4">
            {query.isPending ? (
              <SkeletonGrid />
            ) : query.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
                Failed to load items. Please try again.
              </div>
            ) : query.data && query.data.items.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {query.data.items.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onAdd={() => addMut.mutate({ itemId: item.id, quantity: 1 })}
                      adding={addMut.isPending}
                      added={lastAddedId === item.id}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                No items match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Loading skeletons */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="mt-2 h-8 w-full rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
