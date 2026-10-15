import { Link } from "react-router";
import type { ProductCardProps } from "../types/product";

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="min-w-0">
      <Link
        className="group relative block aspect-[1/1.13] overflow-hidden rounded-2xl bg-[#f0f0f0]"
        to={`/product/${product._id}`}
      >
        <img
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.045]"
          src={product.imgs[0]}
          alt={product.name}
          loading="lazy"
        />
      </Link>
      <h3 className="mt-3.5 overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold">
        <Link
          className="hover:underline hover:underline-offset-4"
          to={`/product/${product._id}`}
        >
          {product.name}
        </Link>
      </h3>
      <p className="m-0 text-[21px] font-bold">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        }).format(product.price)}
      </p>
    </article>
  );
}
