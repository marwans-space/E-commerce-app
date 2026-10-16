export default function CartSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading cart"
      className="mx-auto w-[calc(100%-36px)] max-w-310 pb-20 pt-6 text-black md:w-[calc(100%-48px)] md:pt-10 lg:w-[min(1240px,calc(100%-64px))]"
    >
      <div className="mb-5 h-4 w-32 animate-pulse rounded bg-[#f0f0f0] md:mb-6" />
      <div className="mb-7 h-10 w-52 animate-pulse rounded bg-[#f0f0f0]" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
        <section className="space-y-4 rounded-[20px] border border-black/10 p-5 sm:p-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              className="flex gap-4 border-b border-black/10 pb-4 last:border-0 last:pb-0"
              key={index}
            >
              <div className="size-24 shrink-0 animate-pulse rounded-xl bg-[#f0f0f0] sm:size-28" />
              <div className="flex flex-1 flex-col justify-between py-1">
                <div className="space-y-2">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#f0f0f0]" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-[#f0f0f0]" />
                </div>
                <div className="h-6 w-16 animate-pulse rounded bg-[#f0f0f0]" />
              </div>
            </div>
          ))}
        </section>
        <section className="space-y-5 rounded-[20px] border border-black/10 p-5 sm:p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-[#f0f0f0]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#f0f0f0]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#f0f0f0]" />
          <div className="h-12 w-full animate-pulse rounded-full bg-[#f0f0f0]" />
          <div className="h-12 w-full animate-pulse rounded-full bg-[#f0f0f0]" />
          <div className="h-12 w-full animate-pulse rounded-full bg-[#f0f0f0]" />
        </section>
      </div>
    </main>
  );
}
