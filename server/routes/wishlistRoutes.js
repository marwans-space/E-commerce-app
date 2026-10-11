import express from "express";
import { ObjectId } from "mongodb";
import isObjectId from "../utils/objectId.js";
import { Users, Products, getProductById } from "../db.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// Wishlist with product details. Every wishlist route returns this shape:
// { wishlist: [{ productId, name, price, img, color, size, category, isAvailable }] }
async function getWishlistDetails(userId) {
  const user = await Users.findOne(
    { _id: userId },
    { projection: { wishlist: 1 } },
  );
  if (!user) return null;

  const ids = user.wishlist ?? [];
  const products = await Products.find({ _id: { $in: ids } }).toArray();
  const productById = new Map(products.map((p) => [p._id.toString(), p]));

  const wishlist = ids.map((id) => {
    const product = productById.get(id.toString());
    return {
      productId: id,
      name: product?.name ?? null,
      price: product?.price ?? null,
      img: product?.img ?? null,
      color: product?.color ?? null,
      size: product?.size ?? null,
      category: product?.category ?? null,
      isAvailable: Boolean(product?.isListed),
    };
  });
  return { wishlist };
}

/* ======================================================================
   client/wishlist
   ====================================================================== */

// GET
router.get("/wishlist", authenticate, authorize("user"), async (req, res) => {
  const details = await getWishlistDetails(new ObjectId(req.user.id));
  if (!details) return res.status(404).json({ error: "User not found" });
  return res.status(200).json(details);
});

// POST
// (none)

// PATCH
router.patch(
  "/add-to-wishlist",
  authenticate,
  authorize("user"),
  async (req, res) => {
    // get the the item from req body
    const { productId } = req.body ?? {};
    // check for errors
    const product = await getProductById(productId);
    if (!product || !product.isListed) {
      return res.status(404).json({ error: "Product not found" });
    }
    // get user using id
    const userId = new ObjectId(req.user.id);

    // update user wishlist
    await Users.updateOne(
      { _id: userId },
      { $addToSet: { wishlist: product._id } },
    );
    // 200
    return res.status(200).json(await getWishlistDetails(userId));
  },
);

// DELETE
router.delete(
  "/wishlist/:productId",
  authenticate,
  authorize("user"),
  async (req, res) => {
    const { productId } = req.params;
    if (!isObjectId(productId)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const userId = new ObjectId(req.user.id);
    const pid = new ObjectId(productId);

    const result = await Users.updateOne(
      { _id: userId, wishlist: pid },
      { $pull: { wishlist: pid } },
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Item not in wishlist" });
    }
    return res.status(200).json(await getWishlistDetails(userId));
  },
);

export default router;
