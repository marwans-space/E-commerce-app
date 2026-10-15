import type { RatingStarsProps } from "../types/review";

export function RatingStars({ rating = 0 }: RatingStarsProps) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => {
        const fillPercent = Math.min(100, Math.max(0, (rating - index) * 100));
        return (
          <svg
            className="size-4"
            key={index}
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              d="m10 1.5 2.58 5.23 5.77.84-4.17 4.06.98 5.75L10 14.66l-5.16 2.72.98-5.75L1.65 7.57l5.77-.84L10 1.5Z"
              fill="#e5e5e5"
            />
            <path
              d="m10 1.5 2.58 5.23 5.77.84-4.17 4.06.98 5.75L10 14.66l-5.16 2.72.98-5.75L1.65 7.57l5.77-.84L10 1.5Z"
              fill="#ffc633"
              style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
            />
          </svg>
        );
      })}
      <span className="sr-only">{rating} out of 5 stars</span>
    </span>
  );
}
