import { Issue } from "../models/issue.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { validateCity } from "../constants.js";

const getUserProfile = asyncHandler(async (req, res) => {
    const user = req?.user;

    if(!user) {
        throw new apiError(401, "Unauthorized request");
    }

    return res.status(200)
    .json(new apiResponse(200, user, "User profile fetched successfully"))
});

const getUserIssues = asyncHandler(async (req, res) => {
    const userId = req?.user?._id;

    if(!userId) {
        throw new apiError(401, "Unauthorized request");
    }

    const issues = await Issue.find({reportedBy: userId})
    .sort({createdAt: -1});

    return res.status(200)
    .json(new apiResponse(200, issues, "User issues fetched successfully"))
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { name, city } = req.body;

    const updateData = {};
    
    if (name) {
        updateData.name = name;
    }
    
    if (city !== undefined) {
        if (!validateCity(city)) {
            throw new apiError(400, "Invalid city selection");
        }
        updateData.city = city;
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new apiError(404, "User not found");
    }

    return res.status(200)
        .json(new apiResponse(200, user, "Profile updated successfully"));
});


export {getUserProfile, getUserIssues, updateUserProfile};