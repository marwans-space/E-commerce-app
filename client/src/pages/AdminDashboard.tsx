import { useEffect, useState } from "react";
import { Link } from "react-router";
import API_URL from "../config.ts";

type RecentOrder = {
  _id: string;
  orderNo: number;
  userName: string;
  totalPrice: number | string;
  status: string;
};

type DashboardData = {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: RecentOrder[];
};

const initialDashboard: DashboardData = {
  totalOrders: 0,
  totalProducts: 0,
  totalUsers: 0,
  recentOrders: [],
};

function formatOrderPrice(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `$${value.toFixed(2)}`;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? `$${parsed.toFixed(2)}` : "Missing price";
  }
  return "Missing price";
}

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch(`${API_URL}/api/admin/dashboard`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setDashboard(await response.json());
      } catch {
        setError("Dashboard data could not be loaded. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const metrics = [
    { label: "Total orders", value: dashboard.totalOrders },
    { label: "Total products", value: dashboard.totalProducts },
    { label: "Total users", value: dashboard.totalUsers },
  ];

  return (
    <section className="mx-auto w-[calc(100%-36px)] max-w-310 py-8 md:w-[calc(100%-48px)] md:py-12 lg:w-[min(1240px,calc(100%-64px))]">
      <div className="mb-7">
        <p className="mb-2 text-xs font-bold tracking-[0.12em] text-black/45 uppercase">
          Admin
        </p>
        <h1 className="text-3xl leading-tight font-extrabold tracking-[-1.2px] md:text-[42px]">
          Dashboard
        </h1>
      </div>

      {error ? (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <article
            className="rounded-2xl border border-black/10 bg-white p-5 md:p-6"
            key={metric.label}
          >
            <p className="text-sm text-black/55">{metric.label}</p>
            <p className="mt-3 text-3xl font-bold">
              {isLoading ? "—" : metric.value}
            </p>
          </article>
        ))}
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-5 md:px-6">
          <h2 className="text-xl font-bold">Recent orders</h2>
          <Link
            className="text-sm font-semibold underline underline-offset-4"
            to="/admin/orders"
          >
            View all
          </Link>
        </div>
        {isLoading ? (
          <p className="p-6 text-sm text-black/55">Loading recent orders...</p>
        ) : dashboard.recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-black/55">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-black/10">
            {dashboard.recentOrders.map((order) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-6"
                key={order._id}
              >
                <div>
                  <p className="font-semibold">Order #{order.orderNo}</p>
                  <p className="text-sm text-black/55">{order.userName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatOrderPrice(order.totalPrice)}</p>
                  <p className="text-sm text-black/55">{order.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
