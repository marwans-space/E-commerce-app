import { MongoClient, ObjectId } from "mongodb";
import env from "./config/env.js";

const client = new MongoClient(env.MONGO_URI);
const db = client.db(env.DB_NAME);

export const Users = db.collection("users");
export const Products = db.collection("products");
export const Orders = db.collection("orders");
export const Reviews = db.collection("reviews");
const Counters = db.collection("counters");

export async function connectDB() {
  await client.connect();
  try {
    // makes duplicate emails fail with error code 11000
    await Users.createIndex({ email: 1 }, { unique: true });

    await Products.createIndexes([
      // keyword search (MongoDB allows only one text index per collection)
      { key: { name: "text", description: "text" } },
      { key: { category: 1 } },
      // public queries always filter on isListed, the home page also on isFeatured
      { key: { isListed: 1, isFeatured: 1 } },
    ]);

    await Orders.createIndexes([
      // "my orders"
      { key: { userId: 1 } },
      // never two orders with the same number (fix addOrder's orderNo first,
      // and delete test orders that already have a bad orderNo)
      { key: { orderNo: 1 }, unique: true },
      // admin list: filter by status, newest first
      { key: { status: 1, createdAt: -1 } },
    ]);
  } catch (error) {
    console.error("❌ Failed to create database indexes:", error.message);
    throw error;
  }
  console.log("✅ Database connected successfully");
}

async function nextOrderNo() {
  const counter = await Counters.findOneAndUpdate(
    { _id: "orderNo" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return counter.seq; // driver v5: counter.value.seq
}
export async function getUserByEmail(email) {
  return await Users.findOne({ email });
}

export async function addUser({ name, email, passwordHash }) {
  const user = {
    name,
    email,
    passwordHash,
    profileImg: null,
    address: null,
    number: null,
    cart: [],
    wishlist: [],
    role: "user", // always set on the server, never from req.body
  };
  const { insertedId } = await Users.insertOne(user);
  return {
    _id: insertedId,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function getProductById(id) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) return null;
  return await Products.findOne({ _id: new ObjectId(id) });
}
export async function getUserById(id) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) return null;
  return await Users.findOne(
    { _id: new ObjectId(id) },
    { projection: { passwordHash: 0 } },
  );
}
export async function addOrder({
  userId,
  userName,
  userNumber,
  shippingAddress,
  items,
  totalPrice,
}) {
  const order = {
    userId: userId ?? null,
    userName,
    userNumber,
    shippingAddress,
    items,
    totalPrice,
    status: "In Process",
    createdAt: new Date(),
    orderNo: (await nextOrderNo()) ?? 1,
  };
  const { insertedId } = await Orders.insertOne(order);
  return {
    ...order,
    _id: insertedId,
  };
}
export async function getOrderById(id) {
  const userId = new ObjectId(id);
  return await Orders.find(
    { userId: userId },
    { sort: { createdAt: -1 } },
  ).toArray();
}
