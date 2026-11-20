import { NavLink, Outlet } from "react-router";

const adminLinks = [
  { label: "Dashboard", to: "/admin" },
  { label: "Products", to: "/admin/products" },
  { label: "Orders", to: "/admin/orders" },
] as const;

export function Admin() {
  return (
    <main className="min-h-screen bg-[#f6f6f6] text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex min-h-20 w-[calc(100%-36px)] max-w-310 flex-col items-stretch justify-center gap-3 py-3 md:w-[calc(100%-48px)] md:flex-row md:items-center md:justify-between md:gap-6 md:py-0 lg:w-[min(1240px,calc(100%-64px))]">
          <NavLink
            className="shrink-0 text-[24px] leading-none font-extrabold tracking-[-1.2px] md:text-[28px]"
            to="/"
            aria-label="SHOP.CO home"
          >
            SHOP.CO
          </NavLink>
          <nav
            className="flex w-full items-center gap-1 overflow-x-auto rounded-full border border-black/10 p-1 md:w-auto"
            aria-label="Admin navigation"
          >
            {adminLinks.map((link) => (
              <NavLink
                end={link.to === "/admin"}
                className={({ isActive }) =>
                  `shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors md:px-5 ${
                    isActive
                      ? "bg-black text-white"
                      : "text-black/55 hover:text-black"
                  }`
                }
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
    </main>
  );
}
