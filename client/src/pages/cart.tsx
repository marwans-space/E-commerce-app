import { useState, type FormEvent } from "react";
import { Link } from "react-router";

export type CartItem = {
  productId: string;
  quantity: number;
  name: string | null;
  price: number | null;
  img: string | null;
  color: string | string[] | null;
  size: string | string[] | null;
  isAvailable: boolean;
  lineTotal: number;
};

type CheckoutDetails = {
  shippingAddress: string;
  userNumber: string;
};

type CartProps = {
  cartItems?: CartItem[];
  isLoading?: boolean;
  shippingAddress?: string;
  userNumber?: string;
  onQuantityChange?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
  onPlaceOrder?: (details: CheckoutDetails) => void;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

function getOptionLabel(value: CartItem["color"]) {
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
}

function CartSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading cart"
      className="mx-auto w-[calc(100%-36px)] max-w-310 pb-20 pt-6 text-black md:w-[calc(100%-48px)] md:pt-10 lg:w-[min(1240px,calc(100%-64px))]"
    >
      <div className="mb-5 h-4 w-32 animate-pulse rounded bg-[#f0f0f0] md:mb-6" />
      <div className="mb-7 h-10 w-52 animate-pulse rounded bg-[#f0f0f0]" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
        <section className="space-y-4 rounded-[20px] border border-black/10 p-5 sm:p-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              className="flex gap-4 border-b border-black/10 pb-4 last:border-0 last:pb-0"
              key={index}
            >
              <div className="size-24 shrink-0 animate-pulse rounded-xl bg-[#f0f0f0] sm:size-28" />
              <div className="flex flex-1 flex-col justify-between py-1">
                <div className="space-y-2">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#f0f0f0]" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-[#f0f0f0]" />
                </div>
                <div className="h-6 w-16 animate-pulse rounded bg-[#f0f0f0]" />
              </div>
            </div>
          ))}
        </section>
        <section className="space-y-5 rounded-[20px] border border-black/10 p-5 sm:p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-[#f0f0f0]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#f0f0f0]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#f0f0f0]" />
          <div className="h-12 w-full animate-pulse rounded-full bg-[#f0f0f0]" />
          <div className="h-12 w-full animate-pulse rounded-full bg-[#f0f0f0]" />
          <div className="h-12 w-full animate-pulse rounded-full bg-[#f0f0f0]" />
        </section>
      </div>
    </main>
  );
}

export function Cart({
  cartItems = [],
  isLoading = false,
  shippingAddress: initialAddress = "",
  userNumber: initialNumber = "",
  onQuantityChange,
  onRemoveItem,
  onPlaceOrder,
}: CartProps) {
  const [shippingAddress, setShippingAddress] = useState(initialAddress);
  const [userNumber, setUserNumber] = useState(initialNumber);
  const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPlaceOrder?.({ shippingAddress, userNumber });
  }

  if (isLoading) return <CartSkeleton />;

  return (
    <main className="mx-auto min-h-[45vh] w-[calc(100%-36px)] max-w-310 pb-20 pt-6 text-black md:w-[calc(100%-48px)] md:pt-10 lg:w-[min(1240px,calc(100%-64px))]">
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex items-center gap-2 text-sm text-black/50 md:mb-6"
      >
        <Link className="transition-colors hover:text-black" to="/">
          Home
        </Link>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className="size-3.5 stroke-current [stroke-linecap:round] [stroke-linejoin:round] stroke-[1.5]"
        >
          <path d="m6 3 5 5-5 5" />
        </svg>
        <span className="text-black">Cart</span>
      </nav>

      <h1 className="mb-5 text-[32px] leading-[1.05] font-extrabold tracking-[-1.5px] md:mb-7 md:text-[40px]">
        YOUR CART
      </h1>

      {cartItems.length === 0 ? (
        <section className="rounded-[20px] border border-black/10 px-5 py-14 text-center md:py-20">
          <>
            <h2 className="mb-2 text-xl font-bold">Your cart is empty</h2>
            <p className="mb-7 text-sm text-black/60">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-medium text-white transition-colors hover:bg-black/80"
              to="/"
            >
              Continue shopping
            </Link>
          </>
        </section>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <section
            aria-label="Cart items"
            className="rounded-[20px] border border-black/10 p-4 sm:p-6"
          >
            <ul className="m-0 list-none divide-y divide-black/10 p-0">
              {cartItems.map((item) => (
                <li
                  className="flex gap-4 py-4 first:pt-0 last:pb-0 sm:gap-5"
                  key={item.productId}
                >
                  <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-[#f0f0f0] sm:size-28">
                    {item.img ? (
                      <img
                        className="size-full object-cover"
                        src={item.img}
                        alt={item.name ?? "Cart product"}
                      />
                    ) : (
                      <div className="grid size-full place-items-center px-2 text-center text-xs text-black/40">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-0.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold sm:text-lg">
                          {item.name ?? "Unavailable product"}
                        </h2>
                        <p className="mt-1 text-xs text-black/50 sm:text-sm">
                          {[
                            getOptionLabel(item.size),
                            getOptionLabel(item.color),
                          ]
                            .filter(Boolean)
                            .join(" · ") || "Standard"}
                        </p>
                        {!item.isAvailable && (
                          <p className="mt-1 text-xs text-red-700">
                            This product is no longer available.
                          </p>
                        )}
                      </div>
                      <button
                        aria-label={`Remove ${item.name ?? "product"} from cart`}
                        className="cursor-pointer p-1 text-lg leading-none text-red-500 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!onRemoveItem}
                        onClick={() => onRemoveItem?.(item.productId)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <p className="m-0 text-lg font-bold">
                        {formatPrice(item.price ?? 0)}
                      </p>
                      <div className="flex h-9 items-center gap-3 rounded-full bg-[#f0f0f0] px-3">
                        <button
                          aria-label={`Decrease ${item.name ?? "product"} quantity`}
                          className="cursor-pointer text-lg leading-none disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={item.quantity <= 1 || !onQuantityChange}
                          onClick={() =>
                            onQuantityChange?.(item.productId, item.quantity - 1)
                          }
                          type="button"
                        >
                          −
                        </button>
                        <span
                          aria-live="polite"
                          className="min-w-4 text-center text-sm font-medium"
                        >
                          {item.quantity}
                        </span>
                        <button
                          aria-label={`Increase ${item.name ?? "product"} quantity`}
                          className="cursor-pointer text-lg leading-none disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={item.quantity >= 99 || !onQuantityChange}
                          onClick={() =>
                            onQuantityChange?.(item.productId, item.quantity + 1)
                          }
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[20px] border border-black/10 p-5 sm:p-6">
            <h2 className="mb-5 text-xl font-bold tracking-[-0.4px]">
              Order Summary
            </h2>
            <dl className="m-0 space-y-4 border-b border-black/10 pb-5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-black/55">Subtotal</dt>
                <dd className="m-0 font-semibold">{formatPrice(total)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-black/55">Delivery fee</dt>
                <dd className="m-0 font-semibold">{formatPrice(0)}</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between gap-4 py-5">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold">{formatPrice(total)}</span>
            </div>

            <form className="space-y-4" onSubmit={submitOrder}>
              <label
                className="block text-sm font-medium"
                htmlFor="shipping-address"
              >
                Delivery address
                <textarea
                  autoComplete="street-address"
                  className="mt-2 min-h-24 w-full resize-y rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none transition focus:border-black"
                  id="shipping-address"
                  maxLength={300}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  placeholder="Enter your delivery address"
                  required
                  value={shippingAddress}
                />
              </label>
              <label className="block text-sm font-medium" htmlFor="user-number">
                Phone number
                <input
                  autoComplete="tel"
                  className="mt-2 h-12 w-full rounded-xl border border-black/15 px-4 text-sm font-normal outline-none transition focus:border-black"
                  id="user-number"
                  maxLength={20}
                  onChange={(event) => setUserNumber(event.target.value)}
                  placeholder="Enter your phone number"
                  required
                  type="tel"
                  value={userNumber}
                />
              </label>
              <button
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!onPlaceOrder || cartItems.some((item) => !item.isAvailable)}
                type="submit"
              >
                Place order
                <span aria-hidden="true">→</span>
              </button>
            </form>
            {cartItems.some((item) => !item.isAvailable) && (
              <p className="mt-3 text-sm text-red-700">
                Remove unavailable products before placing your order.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
