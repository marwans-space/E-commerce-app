# SHOP.CO Store

A full-stack fashion storefront for browsing products, managing a shopping cart and wishlist, placing orders, writing reviews, and administering the catalog.

## Features

- Browse featured products, search the catalog, and filter products by category
- View product details, pricing, colors, and sizes
- Register and log in with JWT cookie authentication
- Add items to a persistent shopping cart
- Save and remove products from a wishlist
- Complete checkout and view order history
- Update profile information and change passwords
- Submit product reviews
- Manage products, featured listings, and order statuses through the admin area
- Responsive layouts for mobile, tablet, and desktop

## Product Search

Use the search field in the site header to search products by name, description,
or category. Search results are displayed on the catalog page and can be
combined with category filters.

The public product endpoint accepts optional query parameters:

```text
GET /api/products?q=hoodie
GET /api/products?category=hoodie
GET /api/products?q=warm&category=hoodie
```

Only listed products are returned. Search terms are case-insensitive.

## Admin Area

Administrators can open `/admin` to access:

- **Dashboard** - total users, products, and orders, plus recent orders
- **Products** - create products, view paginated products, update product
  details, mark products as featured, and unlist products
- **Orders** - view paginated orders and update order statuses

All admin API routes require an authenticated user with the `admin` role:

```text
GET    /api/admin/dashboard
GET    /api/admin/products?page=1&pageSize=10
POST   /api/admin/products
PATCH  /api/admin/products/:id
PATCH  /api/admin/products/:id/featured
DELETE /api/admin/products/:id
GET    /api/admin/orders?page=1&pageSize=10
PATCH  /api/admin/orders/:id
```

Deleting a product is a soft delete: it is unlisted from the storefront while
order history is preserved. The product is also removed from existing carts and
wishlists.

## Tech Stack

### Client

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- React Hook Form and Zod

### Server

- Node.js
- Express 5
- MongoDB and the MongoDB Node.js driver
- JSON Web Tokens
- bcrypt
- Zod
- Cookie-based authentication

## Project Structure

```text
client/
  src/
    components/  Shared layout and UI components
    pages/       Storefront, account, checkout, and admin pages
    queries/     TanStack Query definitions
    types/       Shared TypeScript types
server/
  config/        Environment configuration
  middleware/    Authentication and authorization
  routes/        REST API route handlers
  utils/         Server utilities
```

## Prerequisites

- Node.js 20 or newer
- npm
- A MongoDB database

## Environment Variables

Create `server/.env` with the following values:

```dotenv
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=store
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
CLIENT_URL=http://localhost:5173
```

Create `client/.env` with the API base URL:

```dotenv
VITE_API_URL=http://localhost:3000
```

## Installation

Install the server dependencies:

```bash
cd server
npm install
```

Install the client dependencies:

```bash
cd client
npm install
```

## Running Locally

Start the API server:

```bash
cd server
npm start
```

In a separate terminal, start the Vite development server:

```bash
cd client
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Available Client Scripts

From the `client` directory:

```bash
npm run dev      # Start the development server
npm run build    # Type-check and create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## API Overview

The API is grouped under `/auth` and `/api`.

- `/auth` - registration, login, logout, and authenticated-user data
- `/api/products` - product browsing, search, category filtering, and product details
- `/api/cart` - cart retrieval and updates
- `/api/wishlist` - wishlist retrieval and removal
- `/api/profile` - profile management
- `/api/orders` - order checkout and history
- `/api/reviews` - product reviews
- `/api/admin` - administrative product and account operations

Protected routes require authentication and appropriate user or admin authorization.
