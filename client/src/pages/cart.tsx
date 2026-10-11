import { Link } from "react-router";

export function Cart() {
  return (
    <main className="mx-auto w-[calc(100%-36px)] max-w-310 pb-20 pt-6 text-black md:w-[calc(100%-48px)] md:pt-10 lg:w-[min(1240px,calc(100%-64px))]">
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex items-center gap-2 text-sm text-black/50 md:mb-6"
      >
        <Link className="transition-colors hover:text-black" to="/">
          Home
        </Link>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className="size-3.5 stroke-current [stroke-linecap:round] [stroke-linejoin:round] stroke-[1.5]"
        >
          <path d="m6 3 5 5-5 5" />
        </svg>
        <span className="text-black">Cart</span>
      </nav>

      <h1 className="mb-5 text-[32px] leading-[1.05] font-extrabold tracking-[-1.5px] md:mb-7 md:text-[40px]">
        YOUR CART
      </h1>

      <section className="rounded-[20px] border border-black/10 px-5 py-14 text-center md:py-20">
        <h2 className="mb-2 text-xl font-bold">Your cart is empty</h2>
        <p className="mb-7 text-sm text-black/60">
          Looks like you haven’t added anything to your cart yet.
        </p>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-medium text-white transition-colors hover:bg-black/80"
          to="/"
        >
          Continue shopping
        </Link>
      </section>
    </main>
  );
}
