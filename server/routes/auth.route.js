import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, sendOTP, verifyOTP, resendOTP } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/send-otp").post(sendOTP);
router.route("/verify-otp").post(verifyOTP);
router.route("/resend-otp").post(resendOTP);

export default router;