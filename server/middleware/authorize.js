// TODO: `jwt` is imported but never used here, remove the import
import jwt from "jsonwebtoken";
export default function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// TODO(security): see authenticate.js, the role checked here is the one stored in the token, not the current one in the DB.
// TODO (optional): a helper like authorizeSelfOrAdmin for routes where a user may act on their own resource
// (e.g. cancel own order) and an admin on any.
