import * as Tabs from "@radix-ui/react-tabs";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";

const categoryTabs = [
  { label: "All", value: "all" },
  { label: "T-Shirts", value: "t-shirt" },
  { label: "Shirts", value: "shirt" },
  { label: "Hoodie", value: "hoodie" },
  { label: "Jeans", value: "jeans" },
  { label: "Sweatpants", value: "sweatpants" },
] as const;
async function fetchProducts(url: string): Promise<Product[]> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`HTTP Error! status: ${res.status}`);
  }
  const data = await res.json();
  return data.items;
}

export function Category() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const activeCategory =
    categoryTabs.find((category) => category.value === categorySlug)?.value ??
    "all";
  const title =
    categoryTabs.find((category) => category.value === activeCategory)?.label ??
    "All";
  function filterProducts(arr: Product[]): Product[] {
    if (activeCategory === "all") return arr;
    return arr.filter((product) => product.category === activeCategory);
  }
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts("http://localhost:3434/api/products");
        setProducts(data);
      } catch {
        setError("Products could not be loaded. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <main className="mx-auto min-h-[45vh] w-[calc(100%-36px)] max-w-310 pb-16 pt-6 text-black md:w-[calc(100%-48px)] md:pb-20 md:pt-10 lg:w-[min(1240px,calc(100%-64px))]">
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex items-center gap-2 text-sm text-black/50"
      >
        <Link className="transition-colors hover:text-black" to="/">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-black">{title}</span>
      </nav>

      <h1 className="mb-6 text-[32px] leading-tight font-extrabold tracking-[-1.5px] md:mb-8 md:text-[40px]">
        {activeCategory === "all" ? "ALL PRODUCTS" : title.toUpperCase()}
      </h1>

      <Tabs.Root
        value={activeCategory}
        onValueChange={(value) => navigate(`/category/${value}`)}
      >
        <Tabs.List
          aria-label="Filter products by category"
          className="mb-7 flex gap-2 overflow-x-auto border-b border-black/10 pb-3 md:mb-9 md:gap-3"
        >
          {categoryTabs.map((category) => (
            <Tabs.Trigger
              className="shrink-0 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black/60 transition-colors hover:border-black hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white md:px-5 md:text-base"
              key={category.value}
              value={category.value}
            >
              {category.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value={activeCategory} className="outline-none">
          <div
            aria-busy={isLoading}
            className="grid grid-cols-2 gap-x-3.5 gap-y-6.5 md:grid-cols-3 md:gap-5 lg:grid-cols-4"
          >
            {isLoading ? (
              Array.from({ length: 8 }, (_, index) => (
                <article aria-hidden="true" className="min-w-0" key={index}>
                  <div className="aspect-[1/1.13] animate-pulse rounded-2xl bg-[#f0f0f0]" />
                  <div className="mt-3.5 h-4 w-3/4 animate-pulse rounded bg-[#f0f0f0]" />
                  <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-[#f0f0f0]" />
                </article>
              ))
            ) : error ? (
              <p className="col-span-full py-12 text-center text-sm text-black/60">
                {error}
              </p>
            ) : filterProducts(products).length > 0 ? (
              filterProducts(products).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-full py-12 text-center text-sm text-black/60">
                No products are available in this category yet.
              </p>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </main>
  );
}
