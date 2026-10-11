import { Link } from "react-router";

export function Wishlist() {
  return (
    <main className="mx-auto min-h-[45vh] w-[calc(100%-36px)] max-w-310 py-10 text-black md:w-[calc(100%-48px)] md:py-16 lg:w-[min(1240px,calc(100%-64px))]">
      <h1 className="text-[32px] leading-tight font-extrabold tracking-[-1.5px] md:text-[40px]">
        WISHLIST
      </h1>
      <p className="mt-3 text-sm text-black/60 md:text-base">
        Your saved items will appear here when wishlist support is connected.
      </p>
      <Link
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-medium text-white transition-colors hover:bg-black/80"
        to="/"
      >
        Continue shopping
      </Link>
    </main>
  );
}
