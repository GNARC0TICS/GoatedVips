import { Request, Response, NextFunction } from "express";

// This middleware assumes that express-session is set up and req.session is available.
// It also assumes that a successful admin login (e.g., for the Goombas panel)
// will set req.session.isAdmin = true;

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Admin access required for this resource." });
}; 