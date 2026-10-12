import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import meQueryOptions from "../queries/query.ts";

type User = {
  _id: string;
  name: string;
  cart: [];
  wishlist: [];
  profileImg: string;
  role: string;
  address: string;
  number: string;
};

export function Profile() {
  const { data, isPending, isError, refetch } = useQuery(meQueryOptions());
  const user: User | undefined = data?.user;
  const initial = user?.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <main className="mx-auto min-h-[45vh] w-[calc(100%-36px)] max-w-310 py-8 text-black md:w-[calc(100%-48px)] md:py-12 lg:w-[min(1240px,calc(100%-64px))]">
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex items-center gap-2 text-sm text-black/50"
      >
        <Link className="transition-colors hover:text-black" to="/">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-black">My account</span>
      </nav>

      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end md:mb-9">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-black/45 uppercase">
            SHOP.CO / ACCOUNT
          </p>
          <h1 className="text-[32px] leading-[1.05] font-extrabold tracking-[-1.5px] md:text-[40px]">
            MY ACCOUNT
          </h1>
          <p className="max-w-90 text-sm leading-relaxed text-black/55">
            Manage your personal details and keep track of your shopping.
          </p>
        </div>
      </header>

      {isPending ? (
        <section
          className="rounded-[20px] border border-black/10 px-5 py-14 text-center text-sm text-black/55"
          role="status"
        >
          Loading your account...
        </section>
      ) : isError || !user ? (
        <section
          className="rounded-[20px] border border-black/10 px-5 py-14 text-center"
          role="alert"
        >
          <h2 className="mb-2 text-xl font-bold">
            We couldn’t load your account
          </h2>
          <p className="mb-6 text-sm text-black/55">
            Please check your connection and try again.
          </p>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            type="button"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="overflow-hidden rounded-[20px] border border-black/10">
            <div className="bg-[#f0f0f0] px-5 py-7 sm:px-8 sm:py-9">
              <div className="flex items-center gap-4 sm:gap-5">
                {user.profileImg ? (
                  <img
                    src={user.profileImg}
                    alt=""
                    className="h-32 w-32 shrink-0 rounded-full border border-black/10 object-cover"
                  />
                ) : (
                  <div
                    className="grid h-32 w-32 shrink-0 place-items-center rounded-full bg-black text-4xl font-bold text-white"
                    aria-hidden="true"
                  >
                    {initial}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold tracking-[0.12em] text-black/45 uppercase">
                    Welcome back
                  </p>
                  <h2 className="truncate text-xl font-bold tracking-[-0.5px] sm:text-2xl">
                    {user.name}
                  </h2>
                  <span className="mt-2 inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium capitalize text-black/65">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-black/10">
              <Link
                className="group px-5 py-5 transition-colors hover:bg-black/3 sm:px-8"
                to="/cart"
              >
                <span className="block text-2xl font-bold tracking-[-1px]">
                  {user.cart?.length ?? 0}
                </span>
                <span className="mt-1 flex items-center justify-between text-sm text-black/55">
                  Cart items
                  <span
                    aria-hidden="true"
                    className="text-base transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
              <Link
                className="group px-5 py-5 transition-colors hover:bg-black/3 sm:px-8"
                to="/wishlist"
              >
                <span className="block text-2xl font-bold tracking-[-1px]">
                  {user.wishlist?.length ?? 0}
                </span>
                <span className="mt-1 flex items-center justify-between text-sm text-black/55">
                  Saved items
                  <span
                    aria-hidden="true"
                    className="text-base transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </div>
          </section>

          <section className="rounded-[20px] border border-black/10 px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-[-0.4px] sm:text-xl">
                Personal details
              </h2>
            </div>
            <p className="mb-5 text-sm text-black/50">
              Your information at a glance.
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                className="inline-flex min-h-10 hover:cursor-pointer items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                type="button"
              >
                Edit Profile
              </button>
              <button
                className="inline-flex min-h-10 hover:cursor-pointer items-center justify-center rounded-full border border-black/15 px-5 text-sm font-medium text-black transition-colors hover:border-black hover:bg-black/3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                type="button"
              >
                Change Password
              </button>
            </div>
            <dl className="divide-y divide-black/10 border-y border-black/10">
              <div className="grid gap-1 py-4 sm:grid-cols-[minmax(120px,0.7fr)_minmax(0,1.3fr)] sm:gap-4">
                <dt className="text-xs font-semibold tracking-[0.08em] text-black/45 uppercase">
                  Full name
                </dt>
                <dd className="m-0 text-sm font-medium">
                  {user.name || "Not provided"}
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[minmax(120px,0.7fr)_minmax(0,1.3fr)] sm:gap-4">
                <dt className="text-xs font-semibold tracking-[0.08em] text-black/45 uppercase">
                  Delivery address
                </dt>
                <dd className="m-0 text-sm leading-relaxed font-medium">
                  {user.address || "Not provided"}
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[minmax(120px,0.7fr)_minmax(0,1.3fr)] sm:gap-4">
                <dt className="text-xs font-semibold tracking-[0.08em] text-black/45 uppercase">
                  Phone number
                </dt>
                <dd className="m-0 text-sm font-medium">
                  {user.number || "Not provided"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </main>
  );
}
