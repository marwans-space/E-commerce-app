import { createBrowserRouter, RouterProvider } from "react-router";
import { RootLayout } from "./components/RootLayout";
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

function App() {
  return <RouterProvider router={router} />;
}

export default App;
