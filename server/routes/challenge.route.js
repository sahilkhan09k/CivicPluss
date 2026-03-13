import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    submitChallenge,
    getChallengeQueue,
    reviewChallenge,
    getChallengeHistory,
    getUserChallenges
} from "../controllers/challenge.controller.js";

const router = Router();

// Submit a new challenge (requires authentication and photo upload)
router.post("/submit", verifyJWT, upload.single("challengePhoto"), submitChallenge);

// Get challenge queue for super admin review (requires authentication and super_admin role)
router.get("/queue", verifyJWT, getChallengeQueue);

// Review a challenge (requires authentication and super_admin role)
router.put("/review/:challengeId", verifyJWT, reviewChallenge);

// Get challenge history with filtering and stats (requires authentication and super_admin role)
router.get("/history", verifyJWT, getChallengeHistory);

// Get all challenges for authenticated user (requires authentication)
router.get("/user", verifyJWT, getUserChallenges);

export default router;
