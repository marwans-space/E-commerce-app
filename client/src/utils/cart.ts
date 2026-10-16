import type { Dispatch, SetStateAction } from "react";
import type { CartItem } from "../types/cart";

const CART_URL = "http://localhost:3434/api/cart";

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

export function getOptionLabel(value: CartItem["color"]) {
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
}

export function calculateSubtotal(cart: CartItem[]) {
  return cart.reduce((acc, product) => acc + product.price * product.quantity, 0);
}

export async function getCart(): Promise<CartItem[]> {
  const res = await fetch(CART_URL, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`HTTP Error!: status: ${res.status}`);
  }
  return await res.json();
}

export async function updateCart(
  productId: string,
  quantity: number,
): Promise<CartItem[]> {
  const res = await fetch(`${CART_URL}/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    throw new Error(`HTTP Error! status:${res.status}`);
  }
  await res.json();
  return getCart();
}

export async function removeCartItem(productId: string): Promise<CartItem[]> {
  const res = await fetch(`${CART_URL}/${encodeURIComponent(productId)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`HTTP Error! status:${res.status}`);
  }
  await res.json();
  return getCart();
}

export async function performCartAction(
  isCartUpdating: boolean,
  action: () => Promise<CartItem[]>,
  errorMessage: string,
  setCart: Dispatch<SetStateAction<CartItem[]>>,
  setIsCartUpdating: Dispatch<SetStateAction<boolean>>,
  setCartActionError: Dispatch<SetStateAction<string>>,
  invalidateCart: () => Promise<unknown>,
): Promise<void> {
  if (isCartUpdating) return;

  setIsCartUpdating(true);
  setCartActionError("");
  try {
    setCart(await action());
    await invalidateCart();
  } catch (error) {
    setCartActionError(
      error instanceof Error ? error.message : errorMessage,
    );
  } finally {
    setIsCartUpdating(false);
  }
}
