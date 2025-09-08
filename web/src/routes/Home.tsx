// web/src/routes/Home.tsx
import { Link } from "react-router-dom";
import { useMemo } from "react";

type Category = {
  key: string;
  label: string;     // display label
  slug: string;      // query value expected by backend (lowercased)
  image: string;
  fallback?: string;
};

type FeaturedProduct = {
  id: string;
  title: string;
  price: number;
  image: string;
  badge?: string;
};

export default function Home() {
  // Categories → slugs match backend: women apparel, men apparel, sports, electronics, home & living, accessories
  const categories = useMemo<Category[]>(
    () => [
      {
        key: "women",
        label: "Women Apparel",
        slug: "women apparel",
        image:
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80",
        fallback:
          "https://images.unsplash.com/photo-1520975922215-cadf5273b33c?auto=format&fit=crop&w=1600&q=80",
      },
      {
        key: "men",
        label: "Men Apparel",
        slug: "men apparel",
        image:
          "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1600&q=80",
      },
      {
        key: "sports",
        label: "Sports",
        slug: "sports",
        image:
          "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80",
      },
      {
        key: "electronics",
        label: "Electronics",
        slug: "electronics",
        image:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
      },
      {
        key: "home",
        label: "Home & Living",
        slug: "home & living",
        image:
          "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=1600&q=80",
      },
      {
        key: "accessories",
        label: "Accessories",
        slug: "accessories",
        image:
          "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    []
  );

  const featured = useMemo<FeaturedProduct[]>(
    () => [
      {
        id: "f1",
        title: "Air Mesh Running Shoes",
        price: 3999,
        image:
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1600&q=80",
        badge: "New",
      },
      {
        id: "f2",
        title: "Classic Leather Tote",
        price: 2499,
        image:
          "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "f3",
        title: "Noise-Cancel Headphones",
        price: 5999,
        image:
          "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1600&q=80",
        badge: "Trending",
      },
      {
        id: "f4",
        title: "Minimal Desk Lamp",
        price: 1299,
        image:
          "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(14,165,233,0.10),transparent)]"
      />

      {/* Hero */}
      <section className="relative px-6 md:px-10 lg:px-16 pt-10 md:pt-16">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block rounded-full bg-cyan-50 text-cyan-700 px-3 py-1 text-xs font-semibold ring-1 ring-cyan-100">
              🎉 End of Season Sale · Up to 50% Off
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Discover products you{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                love
              </span>
              , at prices you{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                deserve
              </span>
              .
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Curated styles, smart gadgets, and home essentials. Free shipping
              over ₹999. Easy returns within 7 days.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/items"
                className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-gray-900/10 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/30"
              >
                Shop Now
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600 sm:flex sm:flex-wrap sm:gap-6">
              <FeaturePill icon="🚚" label="Free Shipping" />
              <FeaturePill icon="↩️" label="7-Day Returns" />
              <FeaturePill icon="🔒" label="Secure Checkout" />
              <FeaturePill icon="💬" label="24×7 Support" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-cyan-100 to-emerald-100 blur-2xl" />
            <div className="overflow-hidden rounded-3xl ring-1 ring-gray-200">
              {/* Collage */}
              <div className="grid grid-cols-2 gap-2">
                <FallbackImage
                  src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80"
                  alt="Lifestyle apparel"
                  fallbackText="Lifestyle apparel"
                  className="h-48 w-full object-cover md:h-60"
                  loading="lazy"
                  decoding="async"
                />
                <FallbackImage
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80"
                  alt="Laptop workspace"
                  fallbackText="Laptop workspace"
                  className="h-48 w-full object-cover md:h-60"
                  loading="lazy"
                  decoding="async"
                />
                <FallbackImage
                  src="https://images.unsplash.com/photo-1512203492609-8f5d0b4e2d08?auto=format&fit=crop&w=1600&q=80"
                  fallbackSrc="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80"
                  alt="Beauty kit"
                  fallbackText="Beauty kit"
                  className="h-40 w-full object-cover md:h-52"
                  loading="lazy"
                  decoding="async"
                />
                <FallbackImage
                  src="https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=1600&q=80"
                  alt="Wooden stool"
                  fallbackText="Wooden stool"
                  className="h-40 w-full object-cover md:h-52"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 md:px-10 lg:px-16 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">Shop by category</h2>
            <Link
              to="/items"
              className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
            >
              View all →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link
                key={c.key}
                to={`/items?category=${encodeURIComponent(c.slug)}`}
                className="group relative overflow-hidden rounded-2xl ring-1 ring-gray-200 hover:ring-gray-300 focus:outline-none"
              >
                <FallbackImage
                  src={c.image}
                  fallbackSrc={c.fallback}
                  alt={c.label}
                  fallbackText={c.label}
                  className="h-36 w-full object-cover md:h-48 transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/0" />
                <div className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                  {c.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="px-6 md:px-10 lg:px-16 pb-14 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">Featured picks</h2>
            <Link
              to="/items"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Explore catalog →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white hover:ring-gray-300"
              >
                <div className="relative">
                  <FallbackImage
                    src={p.image}
                    alt={p.title}
                    fallbackText={p.title}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  {p.badge ? (
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-gray-200">
                      {p.badge}
                    </span>
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 text-sm font-semibold">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    ₹{p.price.toLocaleString("en-IN")}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        console.log("Add to cart (wire later):", p.id)
                      }
                      className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/items/${p.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-6 md:px-10 lg:px-16 pb-16">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-cyan-600 p-6 md:p-10">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="text-white">
              <h3 className="text-2xl font-bold">Get 10% off your first order</h3>
              <p className="mt-1 text-white/90">
                Join our newsletter for exclusive drops, early deals, and style
                tips—no spam, we promise.
              </p>
            </div>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const input = form.elements.namedItem(
                  "email"
                ) as HTMLInputElement;
                console.log("Join newsletter (wire later):", input?.value);
                input.value = "";
              }}
            >
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border-0 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 lg:px-16 pb-10">
        <div className="mx-auto max-w-7xl border-t border-gray-200 pt-6 text-sm text-gray-600">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p>© {new Date().getFullYear()} Ecomm. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-gray-900">
                Login
              </Link>
              <Link to="/signup" className="hover:text-gray-900">
                Create Account
              </Link>
              <Link to="/items" className="hover:text-gray-900">
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeaturePill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
      <span aria-hidden="true">{icon}</span>
      <span className="font-medium">{label}</span>
    </span>
  );
}

function FallbackImage(
  props: React.ImgHTMLAttributes<HTMLImageElement> & {
    fallbackText?: string;
    fallbackSrc?: string;
  }
) {
  const { fallbackText, fallbackSrc, alt, onError, ...rest } = props;

  return (
    <img
      {...rest}
      alt={alt}
      loading={rest.loading ?? "lazy"}
      decoding={rest.decoding ?? "async"}
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;

        // 1) Try the provided backup image once (if any)
        if (!el.dataset.backupTried && fallbackSrc) {
          el.dataset.backupTried = "1";
          el.src = fallbackSrc;
          return;
        }

        // 2) Fall back to a text placeholder (only once)
        if (!el.dataset.fallbackShown) {
          el.dataset.fallbackShown = "1";
          el.src = `https://placehold.co/800x600?text=${encodeURIComponent(
            fallbackText || String(alt || "Image")
          )}`;
          return;
        }

        onError?.(e);
      }}
    />
  );
}
