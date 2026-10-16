import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import CartSkeleton from "../components/CartSkeleton";
import { type CartItem } from "../types/cart";
import meQueryOptions from "../queries/query";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const API_URL = import.meta.env.VITE_API_URL;

// ======= Cart =======
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
async function getCart(url: string): Promise<CartItem[]> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`HTTP Error!: status: ${res.status}`);
  }
  return await res.json();
}
async function updateCart(url: string, body: string): Promise<void> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body,
  });
  if (!res.ok) {
    throw new Error(`HTTP Error! status:${res.status}`);
  }
  await res.json();
}
async function removeCartItem(url: string): Promise<void> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`HTTP Error! status:${res.status}`);
  }
  await res.json();
}
// ======= Order ========
const orderSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  shippingAddress: z
    .string()
    .trim()
    .min(1, "Delivery address is required.")
    .max(200),
  userNumber: z
    .string()
    .trim()
    .min(11, "Phone number must be at least 11 characters.")
    .max(20, "Phone number must be at most 20 characters."),
});
type OrderData = {
  name: string;
  shippingAddress: string;
  userNumber: string;
};
async function addOrder(url: string, body: string) {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body,
    });
  } catch {
    throw new Error(
      "Unable to connect. Please check your connection and try again.",
    );
  }
  if (!res.ok) {
    const response: unknown = await res.json().catch(() => null);
    const message =
      response &&
      typeof response === "object" &&
      "error" in response &&
      typeof response.error === "string"
        ? response.error
        : "Unable to place your order. Please try again.";
    throw new Error(message);
  }
  return await res.json();
}
export function Cart() {
  const queryClient = useQueryClient();
  const {
    data: user,
    isPending: isUserLoading,
    isError: isUserError,
  } = useQuery(meQueryOptions());
  const [isLoading, setIsLoading] = useState(false);
  const [isCartUpdating, setIsCartUpdating] = useState(false);
  const [cartActionError, setCartActionError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrderData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: "",
      shippingAddress: "",
      userNumber: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name ?? "",
      shippingAddress: user.address ?? "",
      userNumber: user.number ?? "",
    });
  }, [reset, user]);

  const subtotal = cart.reduce((acc, prod) => {
    const { price, quantity } = prod;
    return acc + price * quantity;
  }, 0);

  async function changeQuantity(productId: string, quantity: number) {
    if (isCartUpdating || quantity < 1 || quantity > 99) return;

    setIsCartUpdating(true);
    setCartActionError("");
    try {
      await updateCart(
        `${API_URL}/api/cart/${encodeURIComponent(productId)}`,
        JSON.stringify({ quantity }),
      );
      setCart(await getCart(API_URL + "/api/cart"));
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (error) {
      setCartActionError(
        error instanceof Error ? error.message : "Unable to update cart",
      );
    } finally {
      setIsCartUpdating(false);
    }
  }

  async function removeItem(productId: string) {
    if (isCartUpdating) return;

    setIsCartUpdating(true);
    setCartActionError("");
    try {
      await removeCartItem(
        `${API_URL}/api/cart/${encodeURIComponent(productId)}`,
      );
      setCart(await getCart(API_URL + "/api/cart"));
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (error) {
      setCartActionError(
        error instanceof Error ? error.message : "Unable to remove item",
      );
    } finally {
      setIsCartUpdating(false);
    }
  }
  const onSubmit = async (data: OrderData) => {
    setOrderSuccess("");
    try {
      await addOrder(API_URL + "/api/add-order", JSON.stringify(data));
      setCart([]);
      setOrderSuccess("Your order was placed successfully.");
      window.scrollTo(0, 0);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (error) {
      setError("root", {
        type: "manual",
        message:
          error instanceof Error
            ? error.message
            : "Unable to place your order. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (isUserLoading || (!user && !isUserError)) return;

    async function loadCart() {
      setIsLoading(true);
      try {
        const data = await getCart(API_URL + "/api/cart");
        setCart(data);
      } catch (error) {
        setCartActionError(
          error instanceof Error ? error.message : "Unable to load cart",
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadCart();
  }, [isUserError, isUserLoading, user]);
  if (isUserLoading || isLoading) return <CartSkeleton />;
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

      {orderSuccess && (
        <p className="mb-5 text-sm text-green-700" role="status">
          {orderSuccess}
        </p>
      )}

      {!user && !isUserError ? (
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
      ) : cart.length === 0 ? (
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
            {cartActionError && (
              <p className="mb-4 text-sm text-red-600" role="alert">
                {cartActionError}
              </p>
            )}
            <ul className="m-0 list-none divide-y divide-black/10 p-0">
              {cart.map((item) => (
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
                      </div>
                      <button
                        aria-label={`Remove ${item.name ?? "product"} from cart`}
                        className="cursor-pointer p-1 text-lg leading-none text-red-500 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={isCartUpdating}
                        onClick={() => removeItem(item.productId)}
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
                          disabled={isCartUpdating || item.quantity <= 1}
                          onClick={() =>
                            changeQuantity(item.productId, item.quantity - 1)
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
                          disabled={isCartUpdating || item.quantity >= 99}
                          onClick={() =>
                            changeQuantity(item.productId, item.quantity + 1)
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
                <dd className="m-0 font-semibold">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-black/55">Delivery fee</dt>
                <dd className="m-0 font-semibold">{formatPrice(20)}</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between gap-4 py-5">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold">
                {formatPrice(subtotal + 20)}
              </span>
            </div>

            <form
              className="space-y-4"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              {errors.root?.message && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.root.message}
                </p>
              )}
              <label className="block text-sm font-medium" htmlFor="name">
                Name
                <input
                  {...register("name")}
                  autoComplete="name"
                  className="mt-2 h-12 w-full resize-y rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none transition focus:border-black"
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  aria-invalid={!!errors.name}
                />
              </label>
              {errors.name?.message && (
                <p className="text-xs text-red-600" role="alert">
                  {errors.name.message}
                </p>
              )}
              <label
                className="block text-sm font-medium"
                htmlFor="shipping-address"
              >
                Delivery address
                <input
                  {...register("shippingAddress")}
                  autoComplete="street-address"
                  className="mt-2 h-12 w-full resize-y rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none transition focus:border-black"
                  id="shipping-address"
                  type="text"
                  placeholder="Enter your delivery address"
                  aria-invalid={!!errors.shippingAddress}
                />
              </label>
              {errors.shippingAddress?.message && (
                <p className="text-xs text-red-600" role="alert">
                  {errors.shippingAddress.message}
                </p>
              )}
              <label
                className="block text-sm font-medium"
                htmlFor="user-number"
              >
                Phone number
                <input
                  {...register("userNumber")}
                  autoComplete="tel"
                  className="mt-2 h-12 w-full rounded-xl border border-black/15 px-4 text-sm font-normal outline-none transition focus:border-black"
                  id="user-number"
                  maxLength={20}
                  placeholder="Enter your phone number"
                  type="tel"
                  aria-invalid={!!errors.userNumber}
                />
              </label>
              {errors.userNumber?.message && (
                <p className="text-xs text-red-600" role="alert">
                  {errors.userNumber.message}
                </p>
              )}
              <button
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Placing order..." : "Place order"}
                <span aria-hidden="true">→</span>
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
