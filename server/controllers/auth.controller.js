import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { BannedEmail } from "../models/bannedEmail.model.js";
import { OTP } from "../models/otp.model.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { validateCity } from "../constants.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new apiError(404, "User not found");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};


export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, city } = req.body;

  if (!name || !email || !password) {
    throw new apiError(400, "All fields are required");
  }

  if (!city || !validateCity(city)) {
    throw new apiError(400, "City is required and must be valid");
  }

  const bannedEmail = await BannedEmail.findOne({ email: email.toLowerCase() });
  if (bannedEmail) {
    throw new apiError(403, "This email address has been permanently banned from the platform due to multiple fake reports. You cannot create a new account with this email.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new apiError(409, "User already exists");
  }

  const user = await User.create({ name, email, password, city, isEmailVerified: false });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await OTP.create({ email, otp });
  
  try {
    await sendOTPEmail(email, otp);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const safeUser = await User.findById(user._id).select("-password -refreshToken");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 45 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json(new apiResponse(201, safeUser.toObject(), "User registered successfully. Please verify your email."));
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(400, "All fields are required");
  }

  const bannedEmail = await BannedEmail.findOne({ email: email.toLowerCase() });
  if (bannedEmail) {
    throw new apiError(403, "This email address has been permanently banned from the platform due to multiple fake reports. You cannot access your account.");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new apiError(401, "Invalid credentials");

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) throw new apiError(401, "Invalid credentials");

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  };

  const safeUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 45 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json(new apiResponse(200, safeUser.toObject(), "Login successful"));
});


export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 }
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "Logged out successfully"));
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized request");
  }

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new apiError(401, "Invalid refresh token");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...options,
      maxAge: 45 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json(new apiResponse(200, {}, "Access token refreshed"));
});


export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new apiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new apiError(400, "Email already verified");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.findOneAndDelete({ email });
  await OTP.create({ email, otp });

  await sendOTPEmail(email, otp);

  return res.status(200).json(new apiResponse(200, {}, "OTP sent successfully"));
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new apiError(400, "Email and OTP are required");
  }

  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    throw new apiError(400, "Invalid or expired OTP");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "User not found");
  }

  user.isEmailVerified = true;
  await user.save();

  await OTP.findOneAndDelete({ email });

  return res.status(200).json(new apiResponse(200, {}, "Email verified successfully"));
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new apiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new apiError(400, "Email already verified");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.findOneAndDelete({ email });
  await OTP.create({ email, otp });

  await sendOTPEmail(email, otp);

  return res.status(200).json(new apiResponse(200, {}, "OTP resent successfully"));
});
