import jwt from "jsonwebtoken";
export default function authenticate(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    // TODO(security): pin the algorithm: jwt.verify(token, secret, { algorithms: ["HS256"] })
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // TODO(security): the role comes from the token and stays valid for 24h. Demoting an admin or deleting a user
    // has no effect until the token expires. For admin routes (at least), load the user from the DB here (or in
    // authorize) and use the current role, and reject if the user no longer exists.
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// TODO (optional): optionalAuthenticate middleware (sets req.user if a valid token exists, never rejects),
// needed for guest checkout and for routes that behave differently for logged-in users.
