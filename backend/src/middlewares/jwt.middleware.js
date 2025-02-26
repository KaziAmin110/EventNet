import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env";

export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "JWT Verification Failed - No token Found" });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
        return res.status(403).json({message: "JWT Verification Failed - Invalid Token"});
    }
    next();
  })
};
