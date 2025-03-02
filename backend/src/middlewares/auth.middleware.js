import jwt from "jsonwebtoken";
import { ACCESS_SECRET } from "../../config/env.js";

export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          message:
            "Unauthorized: No Token in Auth Header",
        });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or Expired token" });
  }
};
