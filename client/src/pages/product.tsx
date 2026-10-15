import * as Accordion from "@radix-ui/react-accordion";
import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { ProductSkeleton } from "../components/ProductSkeleton";
import { RatingStars } from "../components/RatingStars";
import type { Product as ProductData } from "../types/product";
import { TestimonialCard } from "../components/TestimonialCard";
import { ProductCard } from "../components/ProductCard";

class ProductNotFoundError extends Error {}

async function getProduct(
  url: string,
  signal: AbortSignal,
): Promise<ProductData> {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    signal,
  });
  if (res.status === 404) {
    throw new ProductNotFoundError("Product not found");
  }
  if (!res.ok) {
    throw new Error(`HTTP Error! status: ${res.status}`);
  }
  return await res.json();
}
async function getFeatured(
  url: string,
  signal: AbortSignal,
): Promise<ProductData[]> {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP Error! status: ${res.status}`);
  }

  const data = await res.json();
  return data.items;
}
async function addToCart(
  productId: string,
  quantity: number,
  color: string,
  size: string,
) {
  const res = await fetch("http://localhost:3434/api/add-to-cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ productId, quantity, color, size }),
  });
  if (!res.ok) {
    throw new Error(`HTTP Error! status: ${res.status}`);
  }
  return await res.json();
}
const sizes = ["XS", "S", "M", "L", "XL", "2XL"];

function getAvailableStock(
  stock: ProductData["stock"],
  color: string,
  size: string,
) {
  const variantStock = stock?.find(
    (variant) => variant.color === color && variant.size === size,
  );
  if (!variantStock || !Number.isInteger(variantStock.quantity)) return 0;
  return Math.max(0, variantStock.quantity);
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

export function Product() {
  const { productId } = useParams();
  const queryClient = useQueryClient();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productError, setProductError] = useState<
    "not-found" | "load-failed" | null
  >(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [featured, setFeatured] = useState<ProductData[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setIsLoading(true);
      setProduct(null);
      setProductError(null);
      try {
        const url = `http://localhost:3434/api/products/${productId}`;
        const data: ProductData = await getProduct(url, controller.signal);
        setProduct(data);
        setSelectedColor("");
        setSelectedSize("");
        setActiveImageIndex(0);
        setQuantity(1);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setProductError(
          err instanceof ProductNotFoundError ? "not-found" : "load-failed",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    async function loadFeatured() {
      try {
        const url = `http://localhost:3434/api/products/featured`;
        const data = await getFeatured(url, controller.signal);
        setFeatured(data);
      } catch (err) {
        if (!controller.signal.aborted) console.error(err);
      }
    }
    loadProduct();
    loadFeatured();
    return () => controller.abort();
  }, [productId]);
  if (!productId) {
    throw new Error("Missing productId route param");
  }
  if (isLoading) return <ProductSkeleton />;
  if (productError || !product) {
    const isNotFound = productError === "not-found";
    return (
      <main className="mx-auto flex min-h-[45vh] w-[calc(100%-36px)] max-w-310 flex-col items-center justify-center px-4 py-16 text-center text-black md:w-[calc(100%-48px)] lg:w-[min(1240px,calc(100%-64px))]">
        <h1 className="text-2xl font-bold">
          {isNotFound ? "Product not found" : "Product could not be loaded"}
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-black/60">
          {isNotFound
            ? "This product may have been removed or is no longer available."
            : "We couldn’t load this product. Please try again later."}
        </p>
        <Link
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/80"
          to="/"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  const currentProduct = product;
  const activeColor = selectedColor || product.color[0] || "";
  const activeSize = selectedSize || product.size[0] || "";
  const activeImage = product.imgs[activeImageIndex];
  const availableStock = getAvailableStock(
    product.stock,
    activeColor,
    activeSize,
  );
  const maxQuantity = Math.min(availableStock, 99);
  const selectedQuantity =
    maxQuantity === 0 ? 0 : Math.min(quantity, maxQuantity);
  const averageRating =
    product.reviews.length === 0
      ? 0
      : Number(
          (
            product.reviews.reduce(
              (total, review) => total + review.rating,
              0,
            ) / product.reviews.length
          ).toFixed(1),
        );

  async function handleAddToCart() {
    if (isAddingToCart || selectedQuantity === 0) return;
    setIsAddingToCart(true);
    setCartMessage(null);
    try {
      await addToCart(
        currentProduct._id,
        selectedQuantity,
        activeColor,
        activeSize,
      );
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      setCartMessage({
        type: "success",
        text: "Added to cart successfuly",
      });
    } catch (err) {
      console.error(err);
      setCartMessage({
        type: "error",
        text: "Could not add this product to your cart. Please try again.",
      });
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-[calc(100%-36px)] max-w-310 pb-16 pt-6 text-black md:w-[calc(100%-48px)] md:pb-20 md:pt-10 lg:w-[min(1240px,calc(100%-64px))]">
      <nav
        aria-label="Breadcrumb"
        className="mb-7 flex items-center gap-2 text-sm text-black/50"
      >
        <Link className="transition-colors hover:text-black" to="/">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-black">{product.name || "Product"}</span>
      </nav>

      <section
        aria-label="Product details"
        className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-12"
      >
        <div className="min-w-0">
          <div className="aspect-[0.95/1] overflow-hidden rounded-[20px] bg-[#f0eeed] md:rounded-3xl">
            {activeImage ? (
              <img
                className="size-full object-cover"
                src={activeImage}
                alt={product.name}
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-black/40">
                Product image
              </div>
            )}
          </div>
          <div
            aria-label="Product images"
            className="mt-4 grid grid-cols-4 gap-3"
          >
            {product.imgs.map((image, index) => (
              <button
                aria-label={`View product image ${index + 1}`}
                aria-pressed={index === activeImageIndex}
                className={`aspect-square cursor-pointer overflow-hidden rounded-2xl bg-[#f0eeed] ${
                  index === activeImageIndex
                    ? "ring-2 ring-black ring-offset-2"
                    : ""
                }`}
                key={`${image}-${index}`}
                onClick={() => setActiveImageIndex(index)}
                type="button"
              >
                <img className="size-full object-cover" src={image} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-black/50 uppercase">
            {product.category}
          </p>
          <h1 className="m-0 text-[32px] leading-[1.05] font-extrabold tracking-[-1.5px] md:text-[40px] lg:text-[44px]">
            {product.name || "Product"}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <RatingStars rating={averageRating} />
            <span className="text-sm font-medium">
              {averageRating.toFixed(1)}
              <span className="text-black/50">/5</span>
            </span>
            <span className="text-sm text-black/50">
              {product.reviews.length === 0
                ? "(No reviews yet)"
                : `(${product.reviews.length} ${
                    product.reviews.length === 1 ? "review" : "reviews"
                  })`}
            </span>
          </div>
          <p className="mt-4 text-[30px] leading-none font-bold tracking-[-1px]">
            {formatPrice(product.price)}
          </p>
          {product.description && (
            <p className="mt-5 max-w-135 text-sm leading-7 text-black/60 md:text-base">
              {product.description}
            </p>
          )}

          <div className="my-6 h-px bg-black/10" />

          {product.color.length > 0 && (
            <fieldset>
              <legend className="mb-4 text-sm text-black/60">
                Choose color
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.color.map((colorName, index) => (
                  <label
                    className="cursor-pointer"
                    key={`${colorName}-${index}`}
                  >
                    <input
                      checked={activeColor === colorName}
                      className="peer sr-only cursor-pointer"
                      name="product-color"
                      onChange={() => {
                        setSelectedColor(colorName);
                        setQuantity(1);
                      }}
                      type="radio"
                      value={colorName}
                    />
                    <span className="inline-flex min-h-11 items-center rounded-full border border-black/15 bg-[#f0f0f0] px-5 text-sm font-medium text-black/65 transition-colors hover:bg-black/10 hover:text-black peer-checked:border-black peer-checked:bg-black peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-black">
                      {colorName}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {product.color.length > 0 && (
            <div className="my-6 h-px bg-black/10" />
          )}

          {product.size.length > 0 && (
            <fieldset>
              <legend className="mb-4 text-sm text-black/60">
                Choose size
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.size.map((size) => (
                  <button
                    aria-pressed={activeSize === size}
                    className={`min-w-12 cursor-pointer rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                      activeSize === size
                        ? "bg-black text-white"
                        : "bg-[#f0f0f0] text-black/60 hover:bg-black/10 hover:text-black"
                    }`}
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
                    type="button"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {(product.color.length > 0 || product.size.length > 0) && (
            <div className="my-6 h-px bg-black/10" />
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex h-13 items-center justify-between rounded-full bg-[#f0f0f0] px-4 sm:w-36">
              <button
                aria-label="Decrease quantity"
                className="flex size-8 cursor-pointer items-center justify-center text-xl font-medium hover:text-black/60 disabled:cursor-not-allowed"
                disabled={selectedQuantity <= 1}
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(1, Math.min(maxQuantity, current - 1)),
                  )
                }
                type="button"
              >
                −
              </button>
              <span
                aria-live="polite"
                className="min-w-6 text-center font-medium"
              >
                {selectedQuantity}
              </span>
              <button
                aria-label="Increase quantity"
                className="flex size-8 cursor-pointer items-center justify-center text-xl font-medium hover:text-black/60 disabled:cursor-not-allowed"
                disabled={selectedQuantity >= maxQuantity}
                onClick={() =>
                  setQuantity((current) => Math.min(maxQuantity, current + 1))
                }
                type="button"
              >
                +
              </button>
            </div>
            <button
              className="h-13 flex-1 cursor-pointer rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isAddingToCart || selectedQuantity === 0}
              type="button"
              onClick={handleAddToCart}
            >
              {isAddingToCart ? "Adding..." : "Add to cart"}
            </button>
          </div>
          {availableStock === 0 && (
            <p className="mt-3 text-sm text-red-700" role="status">
              This variant is out of stock.
            </p>
          )}
          {cartMessage && (
            <p
              className={`mt-3 text-sm ${
                cartMessage.type === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
              role="status"
            >
              {cartMessage.text}
            </p>
          )}
          <p className="mt-4 flex items-center gap-2 text-xs text-black/50">
            {activeSize || activeColor
              ? [activeSize && `Size ${activeSize}`, activeColor]
                  .filter(Boolean)
                  .join(" · ")
              : "No selectable options"}
          </p>
        </div>
      </section>

      <section className="mt-14 border-t border-black/10 pt-8 md:mt-20 md:pt-10">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List
            aria-label="Product information"
            className="grid grid-cols-2 border-b border-black/10"
          >
            <Tabs.Trigger
              className="border-b-2 border-transparent px-3 pb-4 text-center text-sm font-medium text-black/50 transition-colors hover:text-black data-[state=active]:border-black data-[state=active]:text-black md:text-base"
              value="details"
            >
              Product details
            </Tabs.Trigger>
            <Tabs.Trigger
              className="border-b-2 border-transparent px-3 pb-4 text-center text-sm font-medium text-black/50 transition-colors hover:text-black data-[state=active]:border-black data-[state=active]:text-black md:text-base"
              value="reviews"
            >
              Rating &amp; reviews
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content className="pt-4 outline-none" value="details">
            <Accordion.Root collapsible type="single">
              <Accordion.Item
                className="border-b border-black/10"
                value="description"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold transition-colors hover:text-black/60 md:py-6 md:text-lg">
                    Description
                    <span className="text-2xl leading-none font-normal transition-transform group-data-[state=open]:rotate-45">
                      +
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden pb-5 text-sm leading-7 text-black/60 data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_250ms_ease-out] md:pb-6 md:text-base">
                  {product.description ||
                    "Product description will be added soon."}
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item
                className="border-b border-black/10"
                value="instructions"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold transition-colors hover:text-black/60 md:py-6 md:text-lg">
                    Care instructions
                    <span className="text-2xl leading-none font-normal transition-transform group-data-[state=open]:rotate-45">
                      +
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden pb-5 text-sm leading-7 text-black/60 data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_250ms_ease-out] md:pb-6 md:text-base">
                  {product.instructions ||
                    "Care instructions will be added soon."}
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item
                className="border-b border-black/10"
                value="size-chart"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold transition-colors hover:text-black/60 md:py-6 md:text-lg">
                    Size chart
                    <span className="text-2xl leading-none font-normal transition-transform group-data-[state=open]:rotate-45">
                      +
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden pb-5 text-sm leading-7 text-black/60 data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_250ms_ease-out] md:pb-6 md:text-base">
                  <p>
                    Choose the size that you usually wear for a comfortable fit.
                  </p>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-80 border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-black/10 text-black">
                          <th className="py-3 pr-4 font-semibold">Size</th>
                          {sizes.slice(0, 5).map((size) => (
                            <th className="px-3 py-3 font-semibold" key={size}>
                              {size}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th className="py-3 pr-4 font-medium text-black">
                            Fit
                          </th>
                          {sizes.slice(0, 5).map((size) => (
                            <td className="px-3 py-3" key={size}>
                              {size}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item
                className="border-b border-black/10"
                value="shipping"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold transition-colors hover:text-black/60 md:py-6 md:text-lg">
                    Shipping &amp; return policies
                    <span className="text-2xl leading-none font-normal transition-transform group-data-[state=open]:rotate-45">
                      +
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden pb-5 text-sm leading-7 text-black/60 data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_250ms_ease-out] md:pb-6 md:text-base">
                  Shipping times, delivery costs, and return eligibility will be
                  provided here.
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </Tabs.Content>

          <Tabs.Content className="pt-6 outline-none" value="reviews">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4 flex-col">
                <h2 className="m-0 text-xl font-bold tracking-[-0.5px] md:text-2xl">
                  Customer reviews
                </h2>
                <div className="flex gap-4">
                  {product.reviews.length === 0 ? (
                    <p>No ratings or reviews</p>
                  ) : (
                    product.reviews.map((review, index) => (
                      <TestimonialCard key={index} review={review} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </section>

      <section className="mt-14 md:mt-20">
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-1.2px] md:text-[36px]">
            You might also like
          </h2>
          <span className="pb-1 text-sm text-black/45">Featured products</span>
        </div>
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-black/15 px-5 py-12 text-center text-sm text-black/50">
            Featured products will appear here.
          </div>
        ) : (
          <div
            aria-busy={isLoading}
            className="grid grid-cols-2 gap-x-3.5 gap-y-6.5 md:grid-cols-4 md:gap-5"
          >
            {featured.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
