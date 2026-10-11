import { Link } from "react-router";

export function Product() {
  return (
    <main className="mx-auto min-h-[45vh] w-[calc(100%-36px)] max-w-310 py-10 text-black md:w-[calc(100%-48px)] md:py-16 lg:w-[min(1240px,calc(100%-64px))]">
      <p className="mb-3 text-sm text-black/50">
        <Link className="hover:text-black" to="/">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        Product
      </p>
      <h1 className="text-[32px] leading-tight font-extrabold tracking-[-1.5px] md:text-[40px]">
        Product details
      </h1>
      <p className="mt-3 text-sm text-black/60 md:text-base">
        Product details are not available yet.
      </p>
    </main>
  );
}
