"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ProductCard } from "../components/ProductCard";
import { TestimonialCard } from "../components/TestimonialCard";
import type { Product, ProductListResponse } from "../types/product";
import type { Review, ReviewListResponse } from "../types/review";

const API_URL = import.meta.env.VITE_API_URL;

const SHOP_CATEGORIES: string[] = [
  "T-shirt",
  "Hoodie",
  "Sweatpants",
  "Jeans",
  "Shirt",
];
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
  const data: ProductListResponse = await res.json();
  return data.items;
}
async function fetchReviews(url: string): Promise<Review[]> {
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
  const data: ReviewListResponse = await res.json();
  return data.reviews;
}

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts(API_URL + "/api/products/featured");
        setFeatured(data);
      } catch {
        setFeaturedError("Featured products could not be loaded.");
      } finally {
        setIsFeaturedLoading(false);
      }
    }
    async function loadReviews() {
      try {
        const data = await fetchReviews(API_URL + "/api/reviews");
        setReviews(data);
      } catch {
        setReviewsError("Customer reviews could not be loaded.");
      } finally {
        setIsReviewsLoading(false);
      }
    }
    loadProducts();
    loadReviews();
  }, []);

  return (
    <main className="overflow-hidden">
      <section className="bg-[#f2f0f1]">
        <div className="mx-auto flex w-full flex-col md:grid md:min-h-125 md:w-[calc(100%-48px)] md:grid-cols-[1.1fr_0.9fr] lg:mx-0 lg:min-h-145 lg:w-full lg:grid-cols-2 lg:pl-[max(32px,calc((100%-1240px)/2))]">
          <div className="z-10 self-center px-6 pt-10.5 pb-8 md:px-0 md:py-14">
            <p className="mb-3.5 text-[13px] font-bold tracking-[0.13em] text-[#555] uppercase">
              SHOP.CO
            </p>
            <h1 className="m-0 max-w-162.5 text-[clamp(38px,12vw,52px)] leading-[0.98] font-extrabold tracking-[-0.065em] md:text-[clamp(42px,5.2vw,64px)]">
              FIND CLOTHES THAT MATCH YOUR STYLE
            </h1>
            <p className="mt-4.5 mb-5.5 max-w-135 text-sm leading-[1.7] text-[#5b5b5b] md:mt-6 md:mb-7 md:text-[15px]">
              Browse our clothing categories and find a style that feels like
              you.
            </p>
            <a
              className="flex min-h-13 w-full items-center justify-center rounded-full border border-black bg-black px-7 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-transparent hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#555] md:inline-flex md:min-w-47.5 md:w-auto"
              href="/category/all"
            >
              Shop Now
            </a>
          </div>
          <div
            className="relative min-h-82.5 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=90')] bg-cover bg-position-[center_39%] before:absolute before:inset-0 before:bg-[linear-gradient(180deg,#f2f0f1_0%,transparent_18%)] md:min-h-125 md:bg-position-[center_36%] md:before:bg-[linear-gradient(90deg,#f2f0f1_0%,transparent_20%)] lg:min-h-145"
            role="img"
            aria-label="Models wearing clothing"
          >
            <span
              className="absolute top-[10%] right-[7%] z-10 text-[64px] leading-none md:top-[14%] md:right-[8%] md:text-[92px]"
              aria-hidden="true"
            >
              ✳
            </span>
            <span
              className="absolute top-[44%] left-[7%] z-10 text-4xl leading-none md:top-[46%] md:left-[8%] md:text-[50px]"
              aria-hidden="true"
            >
              ✳
            </span>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="featured-products-heading"
        className="mx-auto w-[calc(100%-36px)] py-13 md:w-[calc(100%-64px)] md:py-18"
      >
        <h2
          className="mb-7.5 text-center text-[30px] font-extrabold leading-none tracking-[-0.055em] md:mb-11 md:text-[clamp(30px,4vw,42px)]"
          id="featured-products-heading"
        >
          FEATURED PRODUCTS
        </h2>
        <div
          aria-busy={isFeaturedLoading}
          className="grid grid-cols-2 gap-x-3.5 gap-y-6.5 md:grid-cols-4 md:gap-5"
        >
          {isFeaturedLoading ? (
            Array.from({ length: 4 }, (_, index) => (
              <article aria-hidden="true" className="min-w-0" key={index}>
                <div className="aspect-[1/1.13] animate-pulse rounded-2xl bg-[#f0f0f0]" />
                <div className="mt-3.5 h-4 w-3/4 animate-pulse rounded bg-[#f0f0f0]" />
                <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-[#f0f0f0]" />
              </article>
            ))
          ) : featuredError ? (
            <p className="col-span-full py-8 text-center text-sm text-black/60">
              {featuredError}
            </p>
          ) : (
            featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>
      </section>

      <section
        className="mx-auto mb-6 w-[calc(100%-36px)] rounded-3xl bg-[#f0f0f0] px-5 py-8.5 md:mb-12 md:w-[calc(100%-64px)] md:rounded-4xl md:p-12 lg:w-[min(1240px,calc(100%-64px))] lg:p-16"
        id="categories"
      >
        <h2 className="mb-7.5 text-center text-[30px] font-extrabold leading-none tracking-[-0.055em] md:mb-10 md:text-[clamp(30px,4vw,42px)]">
          SHOP BY CATEGORY
        </h2>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 md:gap-5">
          {SHOP_CATEGORIES.map((category) => (
            <Link
              className="flex min-h-28 min-w-0 items-center justify-between gap-3 rounded-xl bg-white p-4 text-lg leading-tight font-bold transition-colors hover:bg-black hover:text-white min-[420px]:min-h-32 min-[420px]:p-5 md:min-h-40 md:rounded-2xl md:p-7 md:text-2xl"
              to={`/category/${category.toLowerCase()}`}
              key={category}
            >
              <span className="wrap-break-word">{category}</span>
              <span aria-hidden="true" className="shrink-0">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-[calc(100%-36px)] py-12 md:w-[calc(100%-64px)] md:py-16">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
          <article className="rounded-2xl border border-[#eee] p-5 md:p-6">
            <h3 className="mb-2 text-base font-bold">Fast delivery</h3>
            <p className="m-0 text-sm leading-[1.6] text-[#666]">
              We work to get your order to you as quickly as possible.
            </p>
          </article>
          <article className="rounded-2xl border border-[#eee] p-5 md:p-6">
            <h3 className="mb-2 text-base font-bold">Easy exchanges</h3>
            <p className="m-0 text-sm leading-[1.6] text-[#666]">
              Need a different fit? We make exchanging your items simple.
            </p>
          </article>
          <article className="rounded-2xl border border-[#eee] p-5 md:p-6">
            <h3 className="mb-2 text-base font-bold">Premium quality</h3>
            <p className="m-0 text-sm leading-[1.6] text-[#666]">
              Find thoughtfully selected pieces made with quality in mind.
            </p>
          </article>
          <article className="rounded-2xl border border-[#eee] p-5 md:p-6">
            <h3 className="mb-2 text-base font-bold">14-day returns</h3>
            <p className="m-0 text-sm leading-[1.6] text-[#666]">
              Return eligible items within 14 days.
            </p>
          </article>
        </div>
      </section>

      <section
        aria-labelledby="testimonials-heading"
        className="mx-auto w-[calc(100%-36px)] pb-16 md:w-[calc(100%-64px)] md:pb-24 lg:w-[min(1240px,calc(100%-64px))]"
      >
        <h2
          className="mb-7.5 text-center text-[30px] leading-none font-extrabold tracking-[-0.055em] md:mb-10 md:text-[clamp(30px,4vw,42px)]"
          id="testimonials-heading"
        >
          OUR HAPPY CUSTOMERS
        </h2>
        <div
          aria-busy={isReviewsLoading}
          className="grid gap-4 md:grid-cols-3 md:gap-5"
        >
          {isReviewsLoading ? (
            Array.from({ length: 3 }, (_, index) => (
              <article
                aria-hidden="true"
                className="min-h-52 animate-pulse rounded-2xl border border-black/10 p-5 md:p-6"
                key={index}
              >
                <div className="mb-4 h-5 w-28 rounded bg-[#f0f0f0]" />
                <div className="mb-3 h-5 w-2/5 rounded bg-[#f0f0f0]" />
                <div className="mb-2 h-4 w-full rounded bg-[#f0f0f0]" />
                <div className="h-4 w-4/5 rounded bg-[#f0f0f0]" />
              </article>
            ))
          ) : reviewsError ? (
            <p className="col-span-full py-8 text-center text-sm text-black/60">
              {reviewsError}
            </p>
          ) : (
            reviews.map((review) => (
              <TestimonialCard key={review._id} review={review} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
