import * as Accordion from "@radix-ui/react-accordion";
import { Link, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import meQueryOptions from "../queries/query.ts";
import type { User } from "../types/user";
import { useEffect, useState } from "react";
import API_URL from "../config.ts";

type OrderItem = {
  productId: string;
  name?: string;
  size?: string | string[];
  color?: string | string[];
  quantity: number;
  img?: string;
};

type Order = {
  _id: string;
  orderNo: string | number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type ProductSummary = {
  _id: string;
  name: string;
  imgs: string[];
};

async function getMyOrders(url: string): Promise<Order[]> {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);
  return await res.json();
}

async function getProducts(): Promise<ProductSummary[]> {
  const res = await fetch(API_URL + "/api/products", {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);
  const data: { categories: ProductSummary[] } = await res.json();
  return data.categories;
}

function getItemOption(value: OrderItem["size"] | OrderItem["color"]) {
  return Array.isArray(value) ? value.join(", ") : value;
}

function formatOrderDate(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString();
}

export function Profile() {
  const { data, isPending, isError, refetch } = useQuery(meQueryOptions());
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user: User | null | undefined = data;
  const initial = user?.name?.trim().charAt(0).toUpperCase() || "U";
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [ordersRetry, setOrdersRetry] = useState(0);
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logOut() {
    if (!window.confirm("Are you sure you want to log out?")) return;

    setLogoutError("");
    setIsLoggingOut(true);
    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(
          `Logout failed. Please try again. (Status ${res.status})`,
        );
      }
      queryClient.removeQueries({ queryKey: ["me"] });
      await navigate("/", { replace: true });
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Unable to log out. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadOrders() {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const data = await getMyOrders(API_URL + "/api/orders/me");
        const needsProductDetails = data.some((order) =>
          order.items.some((item) => !item.name || !item.img),
        );
        const products = needsProductDetails ? await getProducts() : [];
        const productsById = new Map(
          products.map((product) => [product._id, product]),
        );
        const enrichedOrders = data.map((order) => ({
          ...order,
          items: order.items.map((item) => {
            const product = productsById.get(item.productId);
            return {
              ...item,
              name: item.name ?? product?.name,
              img: item.img ?? product?.imgs?.[0],
            };
          }),
        }));
        if (isActive) setOrders(enrichedOrders);
      } catch (error) {
        if (isActive) {
          setOrdersError(
            error instanceof Error
              ? error.message
              : "Unable to load your orders.",
          );
        }
      } finally {
        if (isActive) setOrdersLoading(false);
      }
    }
    loadOrders();
    return () => {
      isActive = false;
    };
  }, [ordersRetry]);
  return (
    <main className="mx-auto min-h-[45vh] w-[calc(100%-36px)] max-w-310 py-8 text-black md:w-[calc(100%-48px)] md:py-12 lg:w-[min(1240px,calc(100%-64px))]">
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex items-center gap-2 text-sm text-black/50"
      >
        <Link className="transition-colors hover:text-black" to="/">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-black">My account</span>
      </nav>

      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end md:mb-9">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-black/45 uppercase">
            SHOP.CO / ACCOUNT
          </p>
          <h1 className="text-[32px] leading-[1.05] font-extrabold tracking-[-1.5px] md:text-[40px]">
            MY ACCOUNT
          </h1>
          <p className="max-w-90 text-sm leading-relaxed text-black/55">
            Manage your personal details and keep track of your shopping.
          </p>
        </div>
      </header>

      {isPending ? (
        <section
          className="rounded-[20px] border border-black/10 px-5 py-14 text-center text-sm text-black/55"
          role="status"
        >
          Loading your account...
        </section>
      ) : isError || !user ? (
        <section
          className="rounded-[20px] border border-black/10 px-5 py-14 text-center"
          role="alert"
        >
          <h2 className="mb-2 text-xl font-bold">
            We couldn’t load your account
          </h2>
          <p className="mb-6 text-sm text-black/55">
            Please check your connection and try again.
          </p>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            type="button"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="overflow-hidden rounded-[20px] border border-black/10">
              <div className="bg-[#f0f0f0] px-5 py-7 sm:px-8 sm:py-9">
                <div className="flex items-center gap-4 sm:gap-5">
                  {user.profileImg ? (
                    <img
                      src={user.profileImg}
                      alt=""
                      className="h-32 w-32 shrink-0 rounded-full border border-black/10 object-cover"
                    />
                  ) : (
                    <div
                      className="grid h-32 w-32 shrink-0 place-items-center rounded-full bg-black text-4xl font-bold text-white"
                      aria-hidden="true"
                    >
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-semibold tracking-[0.12em] text-black/45 uppercase">
                      Welcome back
                    </p>
                    <h2 className="truncate text-xl font-bold tracking-[-0.5px] sm:text-2xl">
                      {user.name}
                    </h2>
                    <span className="mt-2 inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium capitalize text-black/65">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-black/10">
                <Link
                  className="group px-5 py-5 transition-colors hover:bg-black/3 sm:px-8"
                  to="/cart"
                >
                  <span className="block text-2xl font-bold tracking-[-1px]">
                    {user.cart?.length ?? 0}
                  </span>
                  <span className="mt-1 flex items-center justify-between text-sm text-black/55">
                    Cart items
                    <span
                      aria-hidden="true"
                      className="text-base transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
                <Link
                  className="group px-5 py-5 transition-colors hover:bg-black/3 sm:px-8"
                  to="/wishlist"
                >
                  <span className="block text-2xl font-bold tracking-[-1px]">
                    {user.wishlist?.length ?? 0}
                  </span>
                  <span className="mt-1 flex items-center justify-between text-sm text-black/55">
                    Saved items
                    <span
                      aria-hidden="true"
                      className="text-base transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </div>
            </section>

            <section className="rounded-[20px] border border-black/10 px-5 py-6 sm:px-8 sm:py-8">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-[-0.4px] sm:text-xl">
                  Personal details
                </h2>
              </div>
              <p className="mb-5 text-sm text-black/50">
                Your information at a glance.
              </p>
              <div className="mb-5 flex flex-wrap gap-2">
                <button
                  className="inline-flex min-h-10 hover:cursor-pointer items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                  type="button"
                >
                  Edit Profile
                </button>
                <button
                  className="inline-flex min-h-10 hover:cursor-pointer items-center justify-center rounded-full border border-black/15 px-5 text-sm font-medium text-black transition-colors hover:border-black hover:bg-black/3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                  type="button"
                >
                  Change Password
                </button>
                <button
                  className="ml-auto cursor-pointer inline-flex min-h-10 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoggingOut}
                  onClick={() => void logOut()}
                  type="button"
                >
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
              {logoutError && (
                <p className="mb-5 text-sm text-red-600" role="alert">
                  {logoutError}
                </p>
              )}
              <dl className="divide-y divide-black/10 border-y border-black/10">
                <div className="grid gap-1 py-4 sm:grid-cols-[minmax(120px,0.7fr)_minmax(0,1.3fr)] sm:gap-4">
                  <dt className="text-xs font-semibold tracking-[0.08em] text-black/45 uppercase">
                    Full name
                  </dt>
                  <dd className="m-0 text-sm font-medium">
                    {user.name || "Not provided"}
                  </dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[minmax(120px,0.7fr)_minmax(0,1.3fr)] sm:gap-4">
                  <dt className="text-xs font-semibold tracking-[0.08em] text-black/45 uppercase">
                    Delivery address
                  </dt>
                  <dd className="m-0 text-sm leading-relaxed font-medium">
                    {user.address || "Not provided"}
                  </dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[minmax(120px,0.7fr)_minmax(0,1.3fr)] sm:gap-4">
                  <dt className="text-xs font-semibold tracking-[0.08em] text-black/45 uppercase">
                    Phone number
                  </dt>
                  <dd className="m-0 text-sm font-medium">
                    {user.number || "Not provided"}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="mt-6 rounded-[20px] border border-black/10 px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-5">
              <h2 className="text-lg font-bold tracking-[-0.4px] sm:text-xl">
                Your orders
              </h2>
              <p className="mt-1 text-sm text-black/50">
                View order status and the items in each order.
              </p>
            </div>

            {ordersLoading ? (
              <p className="py-5 text-sm text-black/55" role="status">
                Loading your orders...
              </p>
            ) : ordersError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="mb-3 text-sm text-red-700" role="alert">
                  We couldn’t load your orders. {ordersError}
                </p>
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/15 px-5 text-sm font-medium transition-colors hover:border-black hover:bg-black/3"
                  onClick={() => setOrdersRetry((retry) => retry + 1)}
                  type="button"
                >
                  Try again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <p className="py-5 text-sm text-black/55">
                You haven’t placed any orders yet.
              </p>
            ) : (
              <Accordion.Root
                className="divide-y divide-black/10 border-y border-black/10"
                collapsible
                type="single"
              >
                {orders.map((order) => (
                  <Accordion.Item key={order._id} value={order._id}>
                    <Accordion.Header>
                      <Accordion.Trigger className="group flex w-full flex-wrap items-center justify-between gap-3 py-5 text-left transition-colors hover:text-black/60">
                        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="font-semibold">
                            Order #{order.orderNo}
                          </span>
                          <span className="rounded-full border border-black/10 bg-[#f0f0f0] px-3 py-1 text-xs font-medium">
                            {order.status}
                          </span>
                          <span className="text-sm text-black/50">
                            {formatOrderDate(order.createdAt)}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="grid size-9 shrink-0 place-items-center rounded-full border border-black/10 transition-transform group-data-[state=open]:rotate-45"
                        >
                          +
                        </span>
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_250ms_ease-out]">
                      <ul className="m-0 list-none divide-y divide-black/10 border-t border-black/10 p-0">
                        {order.items.map((item, index) => (
                          <li
                            className="flex items-center gap-4 py-4"
                            key={`${item.productId}-${index}`}
                          >
                            {item.img ? (
                              <img
                                alt={item.name ?? "Ordered product"}
                                className="size-16 shrink-0 rounded-lg bg-[#f0f0f0] object-cover sm:size-20"
                                src={item.img}
                              />
                            ) : (
                              <div
                                aria-hidden="true"
                                className="grid size-16 shrink-0 place-items-center rounded-lg bg-[#f0f0f0] text-xs text-black/40 sm:size-20"
                              >
                                No image
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-semibold">
                                {item.name ?? "Unavailable product"}
                              </h3>
                              <p className="mt-1 text-xs text-black/55">
                                {[
                                  getItemOption(item.size),
                                  getItemOption(item.color),
                                ]
                                  .filter(Boolean)
                                  .join(" · ") || "Standard"}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-medium">
                              Qty: {item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            )}
          </section>
        </>
      )}
    </main>
  );
}
