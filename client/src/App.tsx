import { useLayoutEffect, useState } from "react";
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router";
import { Cart } from "./pages/cart";
import { Category } from "./pages/category";
import { Contact } from "./pages/contact";
import { FAQ } from "./pages/faq";
import { Home } from "./pages/home";
import { Login } from "./pages/login.tsx";
import { Product } from "./pages/product";
import { Profile } from "./pages/profile";
import { Register } from "./pages/register";
import { Wishlist } from "./pages/wishlist";
import { NotFound } from "./pages/NotFound";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "cart", element: <Cart /> },
      { path: "category/:categorySlug", element: <Category /> },
      { path: "product/:productId", element: <Product /> },
      { path: "wishlist", element: <Wishlist /> },
      { path: "profile", element: <Profile /> },
      { path: "contact", element: <Contact /> },
      { path: "faq", element: <FAQ /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function RootLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { key } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [key]);

  return (
    <div id="top" className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50 border-b border-[#f1f1f1] bg-white">
        <div className="mx-auto flex w-[calc(100%-36px)] min-h-19.5 flex-wrap items-center justify-between gap-x-2 gap-y-3 py-4 md:w-[calc(100%-48px)] md:flex-nowrap md:gap-6 md:py-0 lg:w-[min(1240px,calc(100%-64px))] lg:gap-9 lg:min-h-22">
          <Link
            className="order-1 shrink-0 text-[27px] leading-none font-extrabold tracking-[-1.6px] md:order-0 md:text-[32px]"
            to="/"
            aria-label="SHOP.CO home"
          >
            SHOP.CO
          </Link>

          <nav
            id="main-navigation"
            className={`${isMenuOpen ? "flex" : "hidden"} order-5 w-full items-center justify-between gap-2 border-t border-[#f1f1f1] pt-3 text-[13px] font-medium text-[#252525] md:order-0 md:flex md:w-auto md:shrink-0 md:justify-center md:gap-[clamp(18px,2.3vw,30px)] md:border-0 md:pt-0 md:text-[15px]`}
            aria-label="Main navigation"
          >
            <Link
              className="relative whitespace-nowrap py-2.5 after:absolute after:right-0 after:bottom-1 after:left-0 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100 focus-visible:after:scale-x-100"
              to="/"
            >
              Home
            </Link>
            <Link
              className="relative whitespace-nowrap py-2.5 after:absolute after:right-0 after:bottom-1 after:left-0 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100 focus-visible:after:scale-x-100"
              to="/category/all"
            >
              Shop All
            </Link>
            <Link
              className="relative whitespace-nowrap py-2.5 after:absolute after:right-0 after:bottom-1 after:left-0 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100 focus-visible:after:scale-x-100"
              to="/contact"
            >
              Contact Us
            </Link>
            <Link
              className="relative whitespace-nowrap py-2.5 after:absolute after:right-0 after:bottom-1 after:left-0 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100 focus-visible:after:scale-x-100"
              to="/faq"
            >
              FAQ
            </Link>
          </nav>

          <form
            className={`${isSearchOpen ? "flex" : "hidden"} order-6 h-12 w-full flex-1 items-center gap-3 rounded-full bg-[#f0f0f0] px-4 md:order-0 md:flex md:max-w-90`}
            id="site-search"
            role="search"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5 shrink-0 stroke-[#777] [stroke-linecap:round] stroke-[1.7]"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.2 4.2" />
            </svg>
            <input
              className="w-full min-w-0 bg-transparent text-sm text-black outline-none placeholder:text-[#777]"
              aria-label="Search products"
              placeholder="Search for products..."
            />
          </form>

          <button
            className="order-2 grid size-8.5 shrink-0 place-items-center bg-transparent text-black transition-colors hover:text-[#777] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#555] md:hidden"
            type="button"
            aria-label={isSearchOpen ? "Close search" : "Open search"}
            aria-expanded={isSearchOpen}
            aria-controls="site-search"
            onClick={() => setIsSearchOpen((open) => !open)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5.75 stroke-current [stroke-linecap:round] stroke-[1.8]"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.2 4.2" />
            </svg>
          </button>

          <nav
            className="order-3 ml-auto flex items-center gap-2.25 md:order-0 md:ml-0 md:gap-5"
            aria-label="Your account"
          >
            <Link
              className="grid size-6 place-items-center text-black transition duration-200 hover:-translate-y-0.5 hover:text-[#666] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#555] md:size-7"
              to="/wishlist"
              aria-label="Wishlist"
            >
              <svg
                className="size-5.25 stroke-current [stroke-linecap:round] [stroke-linejoin:round] stroke-[1.7] md:size-5.75"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M20.8 8.7c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10a4.7 4.7 0 0 1 8.8-2.3 4.7 4.7 0 0 1 8.8 2.3Z" />
              </svg>
            </Link>
            <Link
              className="grid size-6 place-items-center text-black transition duration-200 hover:-translate-y-0.5 hover:text-[#666] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#555] md:size-7"
              to="/cart"
              aria-label="Shopping cart"
            >
              <svg
                className="size-5.25 stroke-current [stroke-linecap:round] [stroke-linejoin:round] stroke-[1.7] md:size-5.75"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M3 4h2l2.1 11.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6" />
                <circle cx="10" cy="20" r="1.2" />
                <circle cx="18" cy="20" r="1.2" />
              </svg>
            </Link>
            <Link
              className="grid size-6 place-items-center text-black transition duration-200 hover:-translate-y-0.5 hover:text-[#666] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#555] md:size-7"
              to="/login"
              aria-label="Your profile"
            >
              <svg
                className="size-5.25 stroke-current [stroke-linecap:round] [stroke-linejoin:round] stroke-[1.7] md:size-5.75"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
              </svg>
            </Link>
          </nav>

          <button
            className="order-4 grid size-8.5 shrink-0 place-items-center bg-transparent text-black transition-colors hover:text-[#777] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#555] md:hidden"
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5.75 stroke-current [stroke-linecap:round] [stroke-linejoin:round] stroke-[1.8]"
            >
              {isMenuOpen ? (
                <path d="m6 6 12 12M18 6 6 18" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </header>
      <Outlet />
      <footer className="bg-[#f0f0f0] px-6 pt-11 pb-5 text-black md:px-8 md:pt-16 lg:px-[max(32px,calc((100%-1240px)/2))]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 border-b border-[#d9d9d9] pb-9 md:grid-cols-[1.5fr_1fr_1fr] md:gap-9 md:pb-13 lg:grid-cols-[minmax(260px,2fr)_repeat(2,minmax(170px,1fr))] lg:gap-[clamp(48px,9vw,120px)]">
          <div className="col-span-full max-w-85 md:col-span-1">
            <Link
              className="mb-5.5 inline-block text-[28px] leading-none font-extrabold tracking-[-1.6px] md:text-[32px]"
              to="/"
            >
              SHOP.CO
            </Link>
            <p className="m-0 text-[15px] leading-[1.7] text-[#666]">
              Your everyday wardrobe, made simple. Discover the pieces you’ll
              reach for again and again.
            </p>
          </div>

          <div id="information">
            <h2 className="mt-1 mb-5.5 text-[13px] font-bold tracking-[0.08em] uppercase md:text-[15px]">
              Information
            </h2>
            <ul className="m-0 grid list-none gap-3.25 p-0">
              <li>
                <a
                  className="text-[13px] text-[#666] transition-colors hover:text-black md:text-sm"
                  href="/contact"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  className="text-[13px] text-[#666] transition-colors hover:text-black md:text-sm"
                  href="/faq"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div id="footer-categories">
            <h2 className="mt-1 mb-5.5 text-[13px] font-bold tracking-[0.08em] uppercase md:text-[15px]">
              Categories
            </h2>
            <ul className="m-0 grid list-none gap-3.25 p-0">
              <li>
                <Link
                  className="text-[13px] text-[#666] transition-colors hover:text-black md:text-sm"
                  to="/category/t-shirts"
                >
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link
                  className="text-[13px] text-[#666] transition-colors hover:text-black md:text-sm"
                  to="/category/shirts"
                >
                  Shirts
                </Link>
              </li>
              <li>
                <Link
                  className="text-[13px] text-[#666] transition-colors hover:text-black md:text-sm"
                  to="/category/hoodies"
                >
                  Hoodies
                </Link>
              </li>
              <li>
                <Link
                  className="text-[13px] text-[#666] transition-colors hover:text-black md:text-sm"
                  to="/category/sweatpants"
                >
                  Sweatpants
                </Link>
              </li>
              <li>
                <Link
                  className="text-[13px] text-[#666] transition-colors hover:text-black md:text-sm"
                  to="/category/jeans"
                >
                  Jeans
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-5 md:flex-row md:items-center md:gap-6">
          <p className="m-0 text-[13px] text-[#666]">
            © {new Date().getFullYear()} SHOP.CO. Made by{" "}
            <a href="https://linkedin.com/in/marwannasser" target="_blank">
              Marwan
            </a>
            .
          </p>
          <div className="flex gap-2.5" aria-label="Social links">
            <a
              className="grid size-8 place-items-center rounded-full border border-[#d3d3d3] text-black transition duration-200 hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#555]"
              href="https://www.instagram.com/marwannasser_/"
              target="_blank"
              aria-label="Instagram"
            >
              <svg
                className="size-4 stroke-current [stroke-linecap:round] [stroke-linejoin:round] stroke-[1.6]"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
              </svg>
            </a>
            <a
              className="grid size-8 place-items-center rounded-full border border-[#d3d3d3] text-black transition duration-200 hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#555]"
              href="https://www.facebook.com/qtmariofb"
              target="_blank"
              aria-label="Facebook"
            >
              <svg
                className="size-4 fill-current"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.2V13H10v8h3.4Z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
