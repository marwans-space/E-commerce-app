import { useState } from "react";
import API_URL from "../config.ts";

export function AdminUpdateProduct() {
  const [id, setId] = useState("");
  const [field, setField] = useState("name");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    if (!id.trim() || !value.trim()) {
      setStatus("Product ID and a new value are required.");
      return;
    }
    const body: Record<string, unknown> = {
      [field]: ["price"].includes(field) ? Number(value) : value,
    };
    if (field === "imgs" || field === "color" || field === "size") {
      body[field] = value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    if (field === "stock") {
      const stock = value
        .split("\n")
        .map((line) => line.split(",").map((item) => item.trim()))
        .filter((parts) => parts.length === 3)
        .map(([color, size, quantity]) => ({
          color,
          size,
          quantity: Number(quantity),
        }))
        .filter((item) => item.color && item.size && Number.isInteger(item.quantity) && item.quantity >= 0);
      if (!stock.length) {
        setStatus("Use one stock entry per line: color, size, quantity");
        return;
      }
      body.stock = stock;
    }
    if (field === "isListed" || field === "isFeatured") {
      body[field] = value === "true";
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/products/${id.trim()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Product could not be updated.");
      setStatus("Product updated successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Product could not be updated.");
    }
  }

  return (
    <form className="grid gap-5 md:max-w-2xl" onSubmit={submit}>
      <div>
        <h2 className="text-xl font-bold">Update product</h2>
        <p className="mt-1 text-sm text-black/55">Enter the product _id and the field to change.</p>
      </div>
      <label className="text-sm font-medium">
        Product _id
        <input className="mt-2 w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm" value={id} onChange={(event) => setId(event.target.value)} />
      </label>
      <label className="text-sm font-medium">
        Field
        <select
          className="mt-2 w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm"
          value={field}
          onChange={(event) => {
            const nextField = event.target.value;
            setField(nextField);
            if (nextField === "isListed" || nextField === "isFeatured") {
              setValue("true");
            } else {
              setValue("");
            }
          }}
        >
          {["name", "description", "category", "price", "instructions", "imgs", "color", "size", "stock", "isListed", "isFeatured"].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      {field === "isListed" || field === "isFeatured" ? (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            checked={value === "true"}
            type="checkbox"
            onChange={(event) => setValue(event.target.checked ? "true" : "false")}
          />
          {field === "isListed" ? "Listed" : "Featured"}
        </label>
      ) : (
        <label className="text-sm font-medium">
          New value
          <input className="mt-2 w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm" value={value} onChange={(event) => setValue(event.target.value)} />
        </label>
      )}
      <div className="flex items-center gap-4">
        <button className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white" type="submit">Update product</button>
        {status && <p className="text-sm text-black/60">{status}</p>}
      </div>
    </form>
  );
}
