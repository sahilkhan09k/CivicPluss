import mongoose from "mongoose";
import { Issue } from "../models/issue.model.js";
import { User } from "../models/user.model.js";
import { BannedEmail } from "../models/bannedEmail.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { aiAnalyzeIssue, aiAnalyzeIssueHybrid } from "../utils/aiAnalyzeIssue.js";
import { analyzeImageSeverity } from "../utils/aiAnalyzeImage.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { validateIssueContent } from "../utils/spamDetection.js";

// Helper function to get city filter based on user role
const getCityFilter = (user) => {
    // If no user (public access), return no filter
    if (!user) {
        return {};
    }
    if (user.role === 'super_admin') {
        return {}; // No filter for super admin
    }
    return { city: user.city };
};

const getPriorityLabel = (score) => {
    if (score >= 70) return "High";
    if (score >= 45) return "Medium";
    return "Low";
};

const calculateBaseScore = ({
    severity,
    frequency,
    locationImpact,
    timePending
}) => {
    return Math.round(
        severity * 0.50 +
        locationImpact * 0.30 +
        frequency * 0.10 +
        timePending * 0.10
    );
};

const getLocationImpact = (text = "") => {
    const lower = text.toLowerCase();
    if (lower.includes("hospital") || lower.includes("school")) return 90;
    if (lower.includes("station") || lower.includes("main road")) return 75;
    if (lower.includes("market")) return 65;
    return 40;
};

const getFrequencyScore = (count) => {
    if (count >= 7) return 100;
    if (count >= 4) return 75;
    if (count >= 2) return 50;
    return 20;
};

const getTimeScore = () => 10;


export const createIssue = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Check if user has a city
    if (!req.user.city) {
        throw new apiError(400, "Please update your profile with a city before reporting issues");
    }

    const lastIssue = await Issue.findOne({ reportedBy: userId })
        .sort({ createdAt: -1 });

    if (lastIssue) {
        const diffInMinutes =
            (Date.now() - new Date(lastIssue.createdAt).getTime()) / (1000 * 60);

        if (diffInMinutes < 15) {
            const remaining = Math.ceil(15 - diffInMinutes);
            throw new apiError(
                429,
                `Please wait ${remaining} minutes before reporting another issue`
            );
        }
    }

    const todayCount = await Issue.countDocuments({
        reportedBy: userId,
        createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
    });

    if (todayCount >= 5) {
        throw new apiError(429, "Daily issue limit reached");
    }

    const { title, description, lat, lng, category: userCategory } = req.body;

    if (!title || !description || !lat || !lng) {
        throw new apiError(400, "All required fields must be provided");
    }

    // Validate title and description for spam
    const contentValidation = validateIssueContent(title, description);
    if (!contentValidation.isValid) {
        throw new apiError(400, contentValidation.error);
    }

    if (!req.file?.path) {
        throw new apiError(400, "Image is required");
    }

    console.log("🔍 Starting hybrid AI analysis (Image + Text)...");

    // Step 1: Upload image to Cloudinary first
    const uploadedImage = await uploadOnCloudinary(req.file.path);
    if (!uploadedImage) {
        throw new apiError(500, "Image upload failed");
    }

    // Step 2: Analyze image for visual severity using Cloudinary URL
    const imageAnalysis = await analyzeImageSeverity(uploadedImage.secure_url);
    console.log("📊 Image Analysis Result:", imageAnalysis);

    // Check if image is relevant to civic issues
    if (imageAnalysis.isRelevant === false) {
        throw new apiError(400, imageAnalysis.error || "The uploaded image is not related to civic infrastructure issues");
    }

    // Step 3: Analyze text for context and urgency
    const textAnalysis = await aiAnalyzeIssue(`${title}. ${description}`, userCategory);
    console.log("📊 Text Analysis Result:", textAnalysis);

    // Check if description is relevant to civic issues
    if (textAnalysis.isRelevant === false) {
        throw new apiError(400, textAnalysis.error || "The description is not related to civic infrastructure issues");
    }

    // Step 4: Combine image and text severity (Hybrid Approach)
    // Since image AI is unavailable, we use text analysis as primary source
    // Text severity: 80% weight (AI-powered analysis)
    // Image baseline: 20% weight (confirms image was uploaded)
    const imageSeverity = imageAnalysis.severity || 5;
    const textSeverity = textAnalysis.textSeverity || 5;
    
    const combinedSeverity = Math.round(
        (textSeverity * 0.8) + (imageSeverity * 0.2)
    );
    
    const finalSeverity = Math.min(10, Math.max(1, combinedSeverity));
    const severityScore = finalSeverity * 10; // Convert to 0-100 scale

    console.log(`🎯 Hybrid Severity: Image=${imageSeverity} (baseline), Text=${textSeverity} (AI), Combined=${finalSeverity}`);

    const location = {
        lat: Number(lat),
        lng: Number(lng)
    };

    const RADIUS_IN_METERS = 50;
    const METERS_TO_DEGREES = 0.00045;

    const latRange = RADIUS_IN_METERS * METERS_TO_DEGREES;
    const lngRange = RADIUS_IN_METERS * METERS_TO_DEGREES;

    const nearbyIssuesCount = await Issue.countDocuments({
        "location.lat": {
            $gte: location.lat - latRange,
            $lte: location.lat + latRange
        },
        "location.lng": {
            $gte: location.lng - lngRange,
            $lte: location.lng + lngRange
        }
    });

    if (nearbyIssuesCount >= 8) {
        throw new apiError(
            409,
            "Multiple issues already reported at this location. Please support existing reports."
        );
    }

    const existingCount = await Issue.countDocuments({
        status: { $ne: "Resolved" }
    });

    const frequencyScore = getFrequencyScore(existingCount);
    const locationImpact = getLocationImpact(description);
    const timeScore = getTimeScore();
    const aiBoost = textAnalysis.urgencyBoost || 0;

    const baseScore = calculateBaseScore({
        severity: severityScore,
        frequency: frequencyScore,
        locationImpact,
        timePending: timeScore
    });

    const finalScore = Math.min(100, baseScore + aiBoost);
    const priority = getPriorityLabel(finalScore);

    const issue = await Issue.create({
        title,
        description,
        imageUrl: uploadedImage.secure_url,
        category: textAnalysis.category,
        city: req.user.city, // Auto-tag with user's city
        location,
        priorityScore: finalScore,
        priority,
        scoreBreakdown: {
            severity: severityScore,
            frequency: frequencyScore,
            locationImpact,
            timePending: timeScore,
            aiAdjustment: aiBoost
        },
        reportedBy: userId
    });

    console.log(`✅ Issue created with priority score: ${finalScore} (${priority})`);

    return res
        .status(201)
        .json(new apiResponse(201, {
            issue,
            aiAnalysis: {
                imageSeverity,
                textSeverity,
                combinedSeverity: finalSeverity,
                category: textAnalysis.category,
                confidence: imageAnalysis.confidence,
                explanation: textAnalysis.explanation
            }
        }, "Issue created successfully with AI analysis"));
});

export const getAllIssues = asyncHandler(async (req, res) => {
    const cityFilter = getCityFilter(req.user);
    
    const issues = await Issue.find(cityFilter)
        .populate("reportedBy", "name email")
        .sort({ priorityScore: -1, createdAt: -1 });

    return res
        .status(200)
        .json(new apiResponse(200, issues, "Issues fetched successfully"));
});


export const getIssueById = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        throw new apiError(400, "Invalid issue ID");
    }

    const issue = await Issue.findById(issueId)
        .populate("reportedBy", "name email");

    if (!issue) {
        throw new apiError(404, "Issue not found");
    }

    return res
        .status(200)
        .json(new apiResponse(200, issue, "Issue fetched successfully"));
});


export const updateIssueStatus = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Progress", "Resolved"].includes(status)) {
        throw new apiError(400, "Invalid status value");
    }

    // Verify issue belongs to admin's city (unless super admin)
    const cityFilter = getCityFilter(req.user);
    
    const issue = await Issue.findOne({
        _id: issueId,
        ...cityFilter
    });

    if (!issue) {
        throw new apiError(404, "Issue not found or not in your city");
    }

    issue.status = status;
    await issue.save();

    return res
        .status(200)
        .json(new apiResponse(200, issue, "Issue status updated"));
});


export const getIssuesByPriority = asyncHandler(async (req, res) => {
    const cityFilter = getCityFilter(req.user);
    
    const issues = await Issue.find({
        ...cityFilter,
        status: { $ne: "Resolved" }
    })
        .populate("reportedBy", "name email")
        .sort({ priorityScore: -1, createdAt: -1 });

    return res
        .status(200)
        .json(
            new apiResponse(200, issues, "Issues fetched in priority order")
        );
});


export const getAdminIssueStats = asyncHandler(async (req, res) => {
    const cityFilter = getCityFilter(req.user);
    
    const stats = await Issue.aggregate([
        { $match: cityFilter },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    return res
        .status(200)
        .json(new apiResponse(200, stats, "Admin stats fetched"));
});


export const reportIssueAsFake = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    if (req.user.role !== 'admin') {
        throw new apiError(403, "Only admins can report issues as fake");
    }

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        throw new apiError(400, "Invalid issue ID");
    }

    // Apply city filter for admins
    const cityFilter = getCityFilter(req.user);
    
    const issue = await Issue.findOne({
        _id: issueId,
        ...cityFilter
    }).populate("reportedBy");

    if (!issue) {
        throw new apiError(404, "Issue not found or not in your city");
    }

    if (issue.reportedAsFake) {
        throw new apiError(400, "This issue has already been reported as fake");
    }

    issue.reportedAsFake = true;
    issue.reportedAsFakeBy = req.user._id;
    issue.reportedAsFakeAt = new Date();
    await issue.save();

    const reportingUser = issue.reportedBy;

    if (!reportingUser) {
        throw new apiError(404, "User who reported this issue not found");
    }

    reportingUser.trustScore = Math.max(0, reportingUser.trustScore - 25);

    let userDeleted = false;
    let emailBanned = false;

    if (reportingUser.trustScore === 0) {
        try {
            await BannedEmail.create({
                email: reportingUser.email,
                userId: reportingUser._id,
                userName: reportingUser.name,
                reason: 'Multiple fake reports (Trust score reached 0)',
                bannedBy: req.user._id,
                bannedAt: new Date()
            });
            emailBanned = true;
        } catch (err) {
            console.error('Error adding to banned list:', err);
        }

        await User.findByIdAndDelete(reportingUser._id);
        userDeleted = true;

        return res
            .status(200)
            .json(new apiResponse(200, {
                issue,
                user: {
                    _id: reportingUser._id,
                    name: reportingUser.name,
                    email: reportingUser.email,
                    trustScore: 0,
                    deleted: true,
                    emailBanned: true
                }
            }, `Issue reported as fake. User's trust score reduced to 0. User has been permanently banned and deleted from the system. Email ${reportingUser.email} is now blacklisted.`));
    }

    await reportingUser.save();

    return res
        .status(200)
        .json(new apiResponse(200, {
            issue,
            user: {
                _id: reportingUser._id,
                name: reportingUser.name,
                email: reportingUser.email,
                trustScore: reportingUser.trustScore,
                isBanned: false
            }
        }, `Issue reported as fake. User's trust score reduced to ${reportingUser.trustScore}`));
});


export const getHomeStats = asyncHandler(async (req, res) => {
    try {
        const cityFilter = getCityFilter(req.user);
        
        const totalIssues = await Issue.countDocuments(cityFilter);
        const resolvedIssues = await Issue.countDocuments({ ...cityFilter, status: "Resolved" });
        const pendingIssues = await Issue.countDocuments({ ...cityFilter, status: { $ne: "Resolved" } });

        const activeZones = Math.max(1, Math.ceil(pendingIssues / 3));

        console.log('Stats:', { totalIssues, resolvedIssues, pendingIssues, activeZones });

        return res
            .status(200)
            .json(new apiResponse(200, {
                reported: totalIssues,
                resolved: resolvedIssues,
                activeZones: activeZones
            }, "Homepage statistics fetched successfully"));
    } catch (error) {
        console.error('Error fetching home stats:', error);
        throw new apiError(500, "Failed to fetch homepage statistics");
    }
});
