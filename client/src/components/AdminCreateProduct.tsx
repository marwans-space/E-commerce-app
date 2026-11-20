import { useState } from "react";
import { z } from "zod";
import API_URL from "../config.ts";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  description: z.string().trim().min(1, "Description is required."),
  category: z.string().trim().min(1, "Category is required."),
  price: z
    .string()
    .trim()
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), "Enter a valid price with up to 2 decimals.")
    .transform(Number)
    .refine((value) => value > 0, "Price must be greater than 0."),
  instructions: z.string().trim().min(1, "Instructions are required."),
  imgs: z
    .string()
    .trim()
    .min(1, "Three image URLs are required.")
    .refine(
      (value) =>
        value.split(",").map((item) => item.trim()).filter(Boolean).length === 3,
      "Enter exactly three image URLs.",
    ),
  color: z.string().trim().min(1, "Enter at least one color."),
  size: z.string().trim().min(1, "Enter at least one size."),
  stock: z
    .string()
    .trim()
    .min(1, "Enter at least one stock entry.")
    .refine(
      (value) =>
        value
          .split("\n")
          .every((line) => {
            const [color, size, quantity] = line.split(",").map((part) => part.trim());
            return color && size && /^\d+$/.test(quantity) && Number(quantity) >= 0;
          }),
      "Use color, size, quantity on each line.",
    ),
  isListed: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormValues = z.input<typeof productSchema>;

const initialValues: ProductFormValues = {
  name: "",
  description: "",
  category: "",
  price: "",
  instructions: "",
  imgs: "",
  color: "",
  size: "",
  stock: "",
  isListed: true,
  isFeatured: false,
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;
}

export function AdminCreateProduct() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  function updateValue(field: keyof ProductFormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      return;
    }
    setErrors({});
    try {
      const response = await fetch(`${API_URL}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...parsed.data,
          imgs: parsed.data.imgs
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          color: parsed.data.color.split(",").map((value) => value.trim()),
          size: parsed.data.size.split(",").map((value) => value.trim()),
          stock: parsed.data.stock.split("\n").map((line) => {
            const [color, size, quantity] = line.split(",").map((part) => part.trim());
            return { color, size, quantity: Number(quantity) };
          }),
        }),
      });
      if (!response.ok) throw new Error("Product could not be created.");
      setValues(initialValues);
      setStatus("Product created successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Product could not be created.");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-black";

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={submit}>
      <h2 className="text-xl font-bold md:col-span-2">Create product</h2>
      {(
        [
          ["name", "Name", "text"],
          ["category", "Category", "text"],
          ["price", "Price", "text"],
        ] as const
      ).map(([field, label, type]) => (
        <label className="text-sm font-medium" key={field}>
          {label}
          <input
            className={inputClass}
            type={type}
            value={values[field]}
            onChange={(event) => updateValue(field, event.target.value)}
          />
          <FieldError message={errors[field]} />
        </label>
      ))}
      <label className="text-sm font-medium md:col-span-2">
        Image URLs
        <input
          className={inputClass}
          type="text"
          placeholder="https://example.com/image-1.jpg, https://example.com/image-2.jpg, https://example.com/image-3.jpg"
          value={values.imgs}
          onChange={(event) => updateValue("imgs", event.target.value)}
        />
        <p className="mt-1 text-xs text-black/45">
          Enter exactly three URLs separated by commas.
        </p>
        <FieldError message={errors.imgs} />
      </label>
      {(
        [
          ["description", "Description"],
          ["instructions", "Instructions"],
        ] as const
      ).map(([field, label]) => (
        <label className="text-sm font-medium md:col-span-2" key={field}>
          {label}
          <textarea
            className={`${inputClass} min-h-24`}
            value={values[field]}
            onChange={(event) => updateValue(field, event.target.value)}
          />
          <FieldError message={errors[field]} />
        </label>
      ))}
      {(
        [
          ["color", "Colors (comma separated)"],
          ["size", "Sizes (comma separated)"],
        ] as const
      ).map(([field, label]) => (
        <label className="text-sm font-medium" key={field}>
          {label}
          <input
            className={inputClass}
            value={values[field]}
            onChange={(event) => updateValue(field, event.target.value)}
          />
          <FieldError message={errors[field]} />
        </label>
      ))}
      <label className="text-sm font-medium md:col-span-2">
        Stock
        <textarea
          className={`${inputClass} min-h-28 font-mono`}
          placeholder={"black, S, 15\nblack, M, 20\nwhite, L, 5"}
          value={values.stock}
          onChange={(event) => updateValue("stock", event.target.value)}
        />
        <p className="mt-1 text-xs text-black/45">One entry per line: color, size, quantity</p>
        <FieldError message={errors.stock} />
      </label>
      <div className="flex gap-6 md:col-span-2">
        {(["isListed", "isFeatured"] as const).map((field) => (
          <label className="flex items-center gap-2 text-sm font-medium" key={field}>
            <input
              checked={values[field]}
              type="checkbox"
              onChange={(event) => updateValue(field, event.target.checked)}
            />
            {field === "isListed" ? "Listed" : "Featured"}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-4 md:col-span-2">
        <button className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white" type="submit">
          Create product
        </button>
        {status && <p className="text-sm text-black/60">{status}</p>}
      </div>
    </form>
  );
}
