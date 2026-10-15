export function ProductSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading product"
      className="mx-auto min-h-screen w-[calc(100%-36px)] max-w-310 pb-16 pt-6 text-black md:w-[calc(100%-48px)] md:pb-20 md:pt-10 lg:w-[min(1240px,calc(100%-64px))]"
    >
      <div className="mb-7 h-4 w-36 animate-pulse rounded bg-[#f0f0f0]" />
      <section className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
        <div>
          <div className="aspect-[0.95/1] animate-pulse rounded-[20px] bg-[#f0f0f0] md:rounded-3xl" />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                className="aspect-square animate-pulse rounded-2xl bg-[#f0f0f0]"
                key={index}
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-10 w-4/5 animate-pulse rounded-lg bg-[#f0f0f0]" />
          <div className="h-5 w-2/5 animate-pulse rounded bg-[#f0f0f0]" />
          <div className="h-8 w-1/4 animate-pulse rounded bg-[#f0f0f0]" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-[#f0f0f0]" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-[#f0f0f0]" />
          </div>
          <div className="h-px bg-black/10" />
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-[#f0f0f0]" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  className="size-10 animate-pulse rounded-full bg-[#f0f0f0]"
                  key={index}
                />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-20 animate-pulse rounded bg-[#f0f0f0]" />
            <div className="h-11 w-full animate-pulse rounded-full bg-[#f0f0f0]" />
          </div>
          <div className="h-13 w-full animate-pulse rounded-full bg-[#f0f0f0]" />
        </div>
      </section>
      <section className="mt-14 border-t border-black/10 pt-8 md:mt-20">
        <div className="mb-6 h-12 animate-pulse rounded bg-[#f0f0f0]" />
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              className="h-12 animate-pulse rounded bg-[#f0f0f0]"
              key={index}
            />
          ))}
        </div>
      </section>
      <section className="mt-14 md:mt-20">
        <div className="mb-7 h-8 w-64 animate-pulse rounded bg-[#f0f0f0]" />
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <div className="aspect-[1/1.13] animate-pulse rounded-2xl bg-[#f0f0f0]" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-[#f0f0f0]" />
              <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-[#f0f0f0]" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
