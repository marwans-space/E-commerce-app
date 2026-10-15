export type ProductCategory =
  | "t-shirts"
  | "shirts"
  | "hoodies"
  | "jeans"
  | "sweatpants"
  | "other";

export type ProductReview = {
  _id: string;
  userId: string;
  name: string;
  text: string;
  rating: number;
};

export type ProductStock = {
  color: string;
  size: string;
  quantity: number;
};

export type Product = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  instructions: string;
  imgs: string[];
  isListed: boolean;
  isFeatured: boolean;
  color: string[];
  size: string[];
  stock?: ProductStock[];
  reviews: ProductReview[];
};

export type ProductCardProps = {
  product: Product;
};

export type ProductListResponse = {
  items: Product[];
};
