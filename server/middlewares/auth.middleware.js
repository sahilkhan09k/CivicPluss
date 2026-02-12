import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new apiError(401, "Unauthorized request")
    }

    try {
        const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedInfo?._id).select("-password -refreshToken")

        if (!user) {
            throw new apiError(401, "Invalid access token provided")
        }

        // Check if user is banned
        if (user.isBanned) {
            throw new apiError(403, "Your account has been permanently banned due to multiple fake reports")
        }

        req.user = user
        next()
    } catch (error) {
        if (error instanceof apiError) {
            throw error;
        }
        throw new apiError(401, "Invalid or expired access token")
    }
})

// Optional JWT verification - doesn't throw error if no token
export const optionalVerifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        // No token, continue without user
        req.user = null;
        return next();
    }

    try {
        const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedInfo?._id).select("-password -refreshToken")

        if (user && !user.isBanned) {
            req.user = user;
        } else {
            req.user = null;
        }
    } catch (error) {
        // Invalid token, continue without user
        req.user = null;
    }
    
    next();
})