import { useEffect, useState } from "react";
import API_URL from "../config.ts";

type OrderItem = {
  productId?: string;
  name?: string;
  size?: string | string[];
  color?: string | string[];
  quantity?: number;
};

type AdminOrder = {
  _id: string;
  orderNo: number;
  userId: string;
  username?: string;
  userName?: string;
  userNumber: string;
  createdAt: string;
  totalPrice: number;
  status: string;
  shippingAddress: string;
  items: OrderItem[];
};

type OrderResponse = {
  items: AdminOrder[];
  page: number;
  totalPages: number;
  total: number;
};

export function AdminOrderList() {
  const [data, setData] = useState<OrderResponse | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch(
          `${API_URL}/api/admin/orders?page=${page}&pageSize=10`,
          { headers: { Accept: "application/json" }, credentials: "include" },
        );
        if (!response.ok) throw new Error("Orders could not be loaded.");
        const body: unknown = await response.json();
        if (
          typeof body !== "object" ||
          body === null ||
          !("items" in body) ||
          !Array.isArray(body.items)
        ) {
          throw new Error("Invalid order response.");
        }
        setData(body as OrderResponse);
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Orders could not be loaded.");
      }
    }
    loadOrders();
  }, [page]);

  return (
    <div>
      <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold">All orders</h2>
          <p className="mt-1 text-sm text-black/55">
            {data ? `${data.total} total orders` : "Loading orders..."}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-black/15 px-4 py-2 text-sm disabled:opacity-40" disabled={page === 1} onClick={() => setPage((current) => current - 1)} type="button">Previous</button>
          <button className="rounded-full border border-black/15 px-4 py-2 text-sm disabled:opacity-40" disabled={!data || page >= data.totalPages} onClick={() => setPage((current) => current + 1)} type="button">Next</button>
        </div>
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : (
        <div className="grid gap-4">
          {data?.items.map((order) => (
            <article className="rounded-xl border border-black/10 p-4" key={order._id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="font-bold">Order #{order.orderNo}</h3>
                  <p className="mt-1 text-xs text-black/50">ID: {order._id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${typeof order.totalPrice === "number" ? order.totalPrice.toFixed(2) : "0.00"}</p>
                  <p className="text-sm text-black/55">{order.status}</p>
                </div>
              </div>
              <dl className="mt-4 grid gap-2 text-sm text-black/70 sm:grid-cols-2">
                <div><dt className="font-semibold text-black">Customer</dt><dd>{order.username ?? order.userName ?? "Unknown"}</dd></div>
                <div><dt className="font-semibold text-black">User ID</dt><dd>{order.userId}</dd></div>
                <div><dt className="font-semibold text-black">Phone number</dt><dd>{order.userNumber}</dd></div>
                <div><dt className="font-semibold text-black">Created</dt><dd>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "Unavailable"}</dd></div>
                <div>
                  <dt className="font-semibold text-black">Status</dt>
                  <dd>{order.status?.trim() || "Unknown"}</dd>
                </div>
                <div className="sm:col-span-2"><dt className="font-semibold text-black">Shipping address</dt><dd>{order.shippingAddress}</dd></div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-black">Items</dt>
                  <dd className="mt-1 grid gap-1">
                    {Array.isArray(order.items) && order.items.length
                      ? order.items.map((item, index) => (
                          <span key={`${item.productId ?? "item"}-${index}`}>
                            {item.name ?? item.productId ?? "Product"} · quantity {item.quantity ?? 0}
                            {item.size ? ` · size ${Array.isArray(item.size) ? item.size.join(", ") : item.size}` : ""}
                            {item.color ? ` · color ${Array.isArray(item.color) ? item.color.join(", ") : item.color}` : ""}
                          </span>
                        ))
                      : "No items"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
      {data && data.totalPages > 1 ? (
        <p className="mt-5 text-center text-sm text-black/55">Page {data.page} of {data.totalPages}</p>
      ) : null}
    </div>
  );
}
