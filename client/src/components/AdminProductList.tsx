import { useEffect, useState } from "react";
import type { Product } from "../types/product";
import API_URL from "../config.ts";

type ProductResponse = {
  items: Product[];
  page: number;
  totalPages: number;
  total: number;
};

export function AdminProductList() {
  const [data, setData] = useState<ProductResponse | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(
          `${API_URL}/api/admin/products?page=${page}&pageSize=10`,
          { headers: { Accept: "application/json" }, credentials: "include" },
        );
        if (!response.ok) throw new Error("Products could not be loaded.");
        const body: unknown = await response.json();
        if (
          typeof body !== "object" ||
          body === null ||
          !("items" in body) ||
          !Array.isArray(body.items)
        ) {
          throw new Error("Invalid product response.");
        }
        setData(body as ProductResponse);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Products could not be loaded.",
        );
      }
    }
    loadProducts();
  }, [page]);

  return (
    <div>
      <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold">All products</h2>
          <p className="mt-1 text-sm text-black/55">
            {data ? `${data.total} total products` : "Loading products..."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-full border border-black/15 px-4 py-2 text-sm disabled:opacity-40"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            type="button"
          >
            Previous
          </button>
          <button
            className="rounded-full border border-black/15 px-4 py-2 text-sm disabled:opacity-40"
            disabled={!data || page >= data.totalPages}
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : (
        <div className="grid gap-4">
          {data?.items?.map((product) => (
            <article className="rounded-xl border border-black/10 p-4" key={product._id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="mt-1 text-xs text-black/50">ID: {product._id}</p>
                </div>
                <p className="font-semibold">
                  ${typeof product.price === "number" ? product.price.toFixed(2) : "0.00"}
                </p>
              </div>
              <dl className="mt-4 grid gap-2 text-sm text-black/70 sm:grid-cols-2">
                <div><dt className="font-semibold text-black">Description</dt><dd>{product.description}</dd></div>
                <div><dt className="font-semibold text-black">Category</dt><dd>{product.category}</dd></div>
                <div><dt className="font-semibold text-black">Instructions</dt><dd>{product.instructions}</dd></div>
                <div><dt className="font-semibold text-black">Images</dt><dd>{Array.isArray(product.imgs) ? product.imgs.join(", ") : "Not set"}</dd></div>
                <div><dt className="font-semibold text-black">Colors</dt><dd>{Array.isArray(product.color) ? product.color.join(", ") : "Not set"}</dd></div>
                <div><dt className="font-semibold text-black">Sizes</dt><dd>{Array.isArray(product.size) ? product.size.join(", ") : "Not set"}</dd></div>
                <div><dt className="font-semibold text-black">Listed</dt><dd>{product.isListed ? "Yes" : "No"}</dd></div>
                <div><dt className="font-semibold text-black">Featured</dt><dd>{product.isFeatured ? "Yes" : "No"}</dd></div>
                <div><dt className="font-semibold text-black">Reviews</dt><dd>{Array.isArray(product.reviews) ? product.reviews.length : 0}</dd></div>
                <div><dt className="font-semibold text-black">Stock</dt><dd>{Array.isArray(product.stock) ? product.stock.map((item) => `${item.color}/${item.size}: ${item.quantity}`).join(", ") || "Not set" : "Not set"}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
      {data && data.totalPages > 1 ? (
        <p className="mt-5 text-center text-sm text-black/55">
          Page {data.page} of {data.totalPages}
        </p>
      ) : null}
    </div>
  );
}
