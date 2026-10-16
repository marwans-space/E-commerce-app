import type { TestimonialCardProps } from "../types/review";

export function TestimonialCard({ review }: TestimonialCardProps) {
  const starCount = Number.isFinite(review.rating)
    ? Math.max(0, Math.min(5, Math.floor(review.rating)))
    : 0;

  return (
    <article className="min-h-52 rounded-2xl border border-black/10 p-5 md:p-6">
      <div
        aria-label={`${starCount} out of 5 stars`}
        className="mb-3 flex gap-1 text-[#ffc633]"
        role="img"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <svg
            aria-hidden="true"
            className={`size-5 ${index < starCount ? "fill-current" : "fill-none stroke-black/25"}`}
            key={index}
            viewBox="0 0 20 20"
          >
            <path
              d="m10 1.6 2.55 5.17 5.7.83-4.12 4.02.97 5.68L10 14.62l-5.1 2.68.97-5.68L1.75 7.6l5.7-.83L10 1.6Z"
              strokeWidth="1.2"
            />
          </svg>
        ))}
      </div>
      <h3 className="mb-2 break-words text-base font-bold">{review.name}</h3>
      <blockquote className="m-0 break-words text-sm leading-[1.65] text-black/60">
        “{review.text}”
      </blockquote>
    </article>
  );
}
