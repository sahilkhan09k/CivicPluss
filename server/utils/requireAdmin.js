import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAdmin = asyncHandler((req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new apiError(403, "Admin access only");
  }
  next();
});
