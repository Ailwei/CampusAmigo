import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { getJwtSecret } from "../config/secrets";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string, lastName: string,firstName: string};
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const JWT_SECRET = getJwtSecret();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      lastName: string;
      firstName: string;
    };
    req.user = decoded;

    next(); 
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
    return;
  }
};
