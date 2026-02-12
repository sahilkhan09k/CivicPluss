import { Router } from "express";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../utils/requireAdmin.js";
import {
    createIssue,
    getAllIssues,
    getIssueById,
    updateIssueStatus,
    getAdminIssueStats,
    getIssuesByPriority,
    reportIssueAsFake,
    getHomeStats
} from "../controllers/issue.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/postIssue", verifyJWT, upload.single("imageUrl"), createIssue);

router.get("/getAllIssue", optionalVerifyJWT, getAllIssues);

router.get("/homeStats", optionalVerifyJWT, getHomeStats);

router.get("/getIssue/:issueId", verifyJWT, getIssueById);

router.put("/updateStatus/:issueId", verifyJWT, requireAdmin, updateIssueStatus);

router.get("/adminStats", verifyJWT, requireAdmin, getAdminIssueStats);

router.get("/getIssuesByPriority", verifyJWT, requireAdmin, getIssuesByPriority);

router.put("/reportAsFake/:issueId", verifyJWT, requireAdmin, reportIssueAsFake);

export default router;
