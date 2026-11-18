import EmptyWishlist from "../components/EmptyWishlist.tsx";
import { useQuery } from "@tanstack/react-query";
import meQueryOptions from "../queries/query.ts";
import type { Wishlist } from "../types/wishlist.ts";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import API_URL from "../config.ts";

function getItemOption(value: Wishlist["size"] | Wishlist["color"]) {
  return Array.isArray(value) ? value.join(", ") : value;
}
async function deleteWishlist(url: string, body: string) {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body,
  });
  if (!res.ok) {
    throw new Error(`HTTP Error! status: ${res.status}`);
  }
  return await res.json();
}

export function Wishlist() {
  const { data } = useQuery(meQueryOptions());
  const queryClient = useQueryClient();
  const wishlist: Wishlist[] = data?.wishlist;
  const navigate = useNavigate();
  if (!wishlist || wishlist.length === 0)
    return (
      <main className="mx-auto w-[calc(100%-36px)] max-w-310 py-10 text-black md:w-[calc(100%-48px)] md:py-16 lg:w-[min(1240px,calc(100%-64px))]">
        <EmptyWishlist />
      </main>
    );
  async function handleDelete(productId: string) {
    await deleteWishlist(
      `${API_URL}/api/wishlist/${productId}`,
      JSON.stringify({ productId }),
    );
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  }
  return (
    <main className="mx-auto min-h-[45vh] w-[calc(100%-36px)] max-w-310 py-10 text-black md:w-[calc(100%-48px)] md:py-16 lg:w-[min(1240px,calc(100%-64px))]">
      <ul className="m-0 list-none divide-y divide-black/10 border-t border-black/10 p-0">
        {wishlist.map((prod, index) => (
          <li
            className="flex items-center gap-4 py-4 rounded-xl  bg-white transition-all duration-300 hover:bg-[#f0f0f0]"
            key={prod.productId + index}
          >
            {prod.img ? (
              <img
                alt={prod.name ?? "Wishlisted product"}
                className="size-16 shrink-0 rounded-lg hover:cursor-pointer mx-2 bg-[#f0f0f0] object-cover sm:size-20"
                onClick={() => navigate("/product/" + prod.productId)}
                src={prod.img}
              />
            ) : (
              <div
                aria-hidden="true"
                className="grid size-16 shrink-0 mx-2 place-prods-center rounded-lg bg-[#f0f0f0] text-xs text-black/40 sm:size-20"
              >
                No image
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3
                className="truncate text-sm font-semibold hover:cursor-pointer"
                onClick={() => navigate("/product/" + prod.productId)}
              >
                {prod.name ?? "Unavailable product"}
              </h3>
              <p
                className="mt-1 text-xs text-black/55 hover:cursor-pointer"
                onClick={() => navigate("/product/" + prod.productId)}
              >
                {[getItemOption(prod.size), getItemOption(prod.color)]
                  .filter(Boolean)
                  .join(" · ") || "Standard"}
              </p>
            </div>
            <button
              className="h-13 mx-2 cursor-pointer rounded-full bg-red-200 px-6 transition-all duration-300 text-sm font-semibold text-red-400 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              id={prod.productId}
              onClick={() => handleDelete(prod.productId)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
