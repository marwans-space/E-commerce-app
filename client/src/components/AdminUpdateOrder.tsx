import { useState } from "react";
import API_URL from "../config.ts";

const statuses = ["In Process", "pending", "processing", "shipped", "delivered", "cancelled"] as const;

export function AdminUpdateOrder() {
  const [id, setId] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("pending");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!id.trim()) {
      setMessage("Order ID is required.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${id.trim()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Order status could not be updated.");
      setMessage("Order status updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order status could not be updated.");
    }
  }

  return (
    <form className="grid gap-5 md:max-w-2xl" onSubmit={submit}>
      <div>
        <h2 className="text-xl font-bold">Update order</h2>
        <p className="mt-1 text-sm text-black/55">Enter the order _id and select the new status.</p>
      </div>
      <label className="text-sm font-medium">
        Order _id
        <input className="mt-2 w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm" value={id} onChange={(event) => setId(event.target.value)} />
      </label>
      <label className="text-sm font-medium">
        Status
        <select className="mt-2 w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm" value={status} onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])}>
          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <div className="flex items-center gap-4">
        <button className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white" type="submit">Update status</button>
        {message && <p className="text-sm text-black/60">{message}</p>}
      </div>
    </form>
  );
}
