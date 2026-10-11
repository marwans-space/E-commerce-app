export type ProductCategory =
  | "t-shirts"
  | "shirts"
  | "hoodies"
  | "jeans"
  | "sweatpants"
  | "other";

export type Product = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  instructions: string;
  img: string;
  isListed: boolean;
  isFeatured: boolean;
  color: string;
  size: string;
  reviews: [];
};
