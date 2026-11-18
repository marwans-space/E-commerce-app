# SHOP.CO Store

A full-stack fashion storefront for browsing products, managing a shopping cart and wishlist, placing orders, writing reviews, and administering the catalog.

## Features

- Browse featured products and filter the catalog by category
- View product details, pricing, colors, and sizes
- Register and log in with JWT cookie authentication
- Add items to a persistent shopping cart
- Save and remove products from a wishlist
- Complete checkout and view order history
- Update profile information and change passwords
- Submit product reviews
- Manage products and store content through the admin area
- Responsive layouts for mobile, tablet, and desktop

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
- `/api/products` - product browsing and product details
- `/api/cart` - cart retrieval and updates
- `/api/wishlist` - wishlist retrieval and removal
- `/api/profile` - profile management
- `/api/orders` - order checkout and history
- `/api/reviews` - product reviews
- `/api/admin` - administrative product and account operations

Protected routes require authentication and appropriate user or admin authorization.
