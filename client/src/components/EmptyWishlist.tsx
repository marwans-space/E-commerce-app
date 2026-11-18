import { Link } from "react-router";

export default function EmptyWishlist() {
  return (
    <section className="flex min-h-[45vh] flex-col items-center justify-center text-center">
      <h1 className="text-[32px] leading-tight font-extrabold tracking-[-1.5px] md:text-[40px]">
        WISHLIST
      </h1>
      <p className="mt-3 text-sm text-black/60 md:text-base">
        Looks like your wishlist is empty!
      </p>
      <p className="mt-3 text-xs text-black/60 md:text-base">
        Wishlist items to save them here
      </p>
      <Link
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-medium text-white transition-colors hover:bg-black/80"
        to="/"
      >
        Continue shopping
      </Link>
    </section>
  );
}
