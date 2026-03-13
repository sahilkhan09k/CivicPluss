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
    const { status, resolutionConfirmed } = req.body;

    if (!["Pending", "In Progress", "Resolved"].includes(status)) {
        throw new apiError(400, "Invalid status value");
    }

    // If marking as Resolved, require resolution image and confirmation
    if (status === "Resolved") {
        if (!req.file) {
            throw new apiError(400, "Resolution photo is required when marking issue as resolved");
        }
        
        if (!resolutionConfirmed || resolutionConfirmed !== "true") {
            throw new apiError(400, "You must confirm that the issue is completely resolved");
        }
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

    // Upload resolution image if provided
    if (req.file && status === "Resolved") {
        const resolutionImagePath = req.file.path;
        const resolutionImage = await uploadOnCloudinary(resolutionImagePath);
        
        if (!resolutionImage) {
            throw new apiError(500, "Failed to upload resolution image");
        }
        
        issue.resolutionImageUrl = resolutionImage.url;
        issue.resolutionConfirmed = true;
    }

    // Set admin decision fields for resolved status
    if (status === "Resolved") {
        issue.resolvedBy = req.user._id;
        issue.resolvedAt = new Date();
        // Set admin decision timestamp for challenge system
        issue.adminDecisionTimestamp = new Date();
    }

    const oldStatus = issue.status;
    issue.status = status;
    await issue.save();

    // Send notification to user about status change
    if (oldStatus !== status) {
        try {
            const { notificationService } = await import('../services/notificationService.js');
            await notificationService.notifyIssueStatusChanged({
                issue,
                oldStatus,
                newStatus: status,
                updatedBy: req.user._id
            });
        } catch (notificationError) {
            console.error('Error sending status change notification:', notificationError);
        }
    }

    return res
        .status(200)
        .json(new apiResponse(200, issue, "Issue status updated"));
});


export const getIssuesByPriority = asyncHandler(async (req, res) => {
    const cityFilter = getCityFilter(req.user);
    
    const issues = await Issue.find(cityFilter)
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
    
    // Get all issues for the admin's city
    const allIssues = await Issue.find(cityFilter).populate('reportedBy', 'name email');
    
    // Basic counts
    const totalIssues = allIssues.length;
    const resolvedIssues = allIssues.filter(issue => issue.status === 'Resolved');
    const pendingIssues = allIssues.filter(issue => issue.status === 'Pending');
    const inProgressIssues = allIssues.filter(issue => issue.status === 'In Progress');
    const criticalUnresolved = allIssues.filter(issue => 
        issue.priority === 'High' && issue.status !== 'Resolved'
    );
    
    // Resolution efficiency
    const resolutionEfficiency = totalIssues > 0 
        ? Math.round((resolvedIssues.length / totalIssues) * 100) 
        : 0;
    
    // Calculate average resolution time
    let avgResolutionTime = '0 days';
    if (resolvedIssues.length > 0) {
        const totalResolutionTime = resolvedIssues.reduce((total, issue) => {
            if (issue.resolvedAt && issue.createdAt) {
                const resolutionTime = new Date(issue.resolvedAt) - new Date(issue.createdAt);
                return total + resolutionTime;
            }
            return total;
        }, 0);
        
        const avgTimeMs = totalResolutionTime / resolvedIssues.length;
        const avgTimeDays = Math.round(avgTimeMs / (1000 * 60 * 60 * 24) * 10) / 10; // Round to 1 decimal
        avgResolutionTime = `${avgTimeDays} days`;
    }
    
    // Weekly trend data (last 7 days)
    const weeklyData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const reported = allIssues.filter(issue => {
            const createdAt = new Date(issue.createdAt);
            return createdAt >= dayStart && createdAt <= dayEnd;
        }).length;
        
        const resolved = allIssues.filter(issue => {
            if (!issue.resolvedAt) return false;
            const resolvedAt = new Date(issue.resolvedAt);
            return resolvedAt >= dayStart && resolvedAt <= dayEnd;
        }).length;
        
        weeklyData.push({
            day: days[date.getDay() === 0 ? 6 : date.getDay() - 1], // Convert Sunday=0 to Sunday=6
            reported,
            resolved
        });
    }
    
    // Top problem zones (group by approximate location)
    const zones = {};
    allIssues.forEach(issue => {
        if (!issue.location) return;
        
        // Group by 0.01 degree precision (roughly 1km)
        const zoneLat = Math.round(issue.location.lat * 100) / 100;
        const zoneLng = Math.round(issue.location.lng * 100) / 100;
        const zoneKey = `${zoneLat},${zoneLng}`;
        
        if (!zones[zoneKey]) {
            zones[zoneKey] = {
                count: 0,
                highPriority: 0,
                lat: zoneLat,
                lng: zoneLng
            };
        }
        
        zones[zoneKey].count += 1;
        if (issue.priority === 'High') {
            zones[zoneKey].highPriority += 1;
        }
    });
    
    const topProblemZones = Object.entries(zones)
        .map(([key, data], index) => ({
            zone: `Zone ${index + 1}`,
            issues: data.count,
            priority: data.highPriority > 2 ? 'high' : 
                     data.highPriority > 0 ? 'medium' : 'low',
            location: `${data.lat}, ${data.lng}`,
            lat: data.lat,
            lng: data.lng
        }))
        .sort((a, b) => b.issues - a.issues)
        .slice(0, 5);
    
    // Category distribution
    const categoryStats = {};
    allIssues.forEach(issue => {
        const category = issue.category || 'Other';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    const stats = {
        totalIssues,
        criticalUnresolved: criticalUnresolved.length,
        avgResolutionTime,
        resolutionEfficiency,
        statusBreakdown: {
            pending: pendingIssues.length,
            inProgress: inProgressIssues.length,
            resolved: resolvedIssues.length
        },
        weeklyData,
        topProblemZones,
        categoryStats,
        issuesWithLocation: allIssues.filter(issue => issue.location?.lat && issue.location?.lng)
    };

    return res
        .status(200)
        .json(new apiResponse(200, stats, "Admin stats fetched successfully"));
});


export const reportIssueAsFake = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
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
    // Set admin decision timestamp for challenge system
    issue.adminDecisionTimestamp = new Date();
    // Schedule trust score penalty for 24 hours later (to allow challenge)
    issue.trustScorePenaltyScheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    await issue.save();

    // Send notification to user about spam report
    try {
        const { notificationService } = await import('../services/notificationService.js');
        await notificationService.notifyIssueReportedSpam({
            issue,
            reportedBy: req.user
        });
    } catch (notificationError) {
        console.error('Error sending spam notification:', notificationError);
    }

    const reportingUser = issue.reportedBy;

    if (!reportingUser) {
        throw new apiError(404, "User who reported this issue not found");
    }

    // Don't apply trust score penalty immediately - it will be applied after 24 hours
    // This gives the user time to challenge the admin's decision
    console.log(`📅 Trust score penalty (-25) scheduled for ${issue.trustScorePenaltyScheduledFor}`);

    return res
        .status(200)
        .json(new apiResponse(200, {
            issue,
            user: {
                _id: reportingUser._id,
                name: reportingUser.name,
                email: reportingUser.email,
                trustScore: reportingUser.trustScore, // No immediate change
                isBanned: false
            }
        }, `Issue reported as fake. Trust score penalty (-25) will be applied in 24 hours if not challenged.`));
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
