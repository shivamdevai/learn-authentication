import mongoose from "mongoose";
import User from "../user/user.model.js";
import Otp from "./otp.model.js";
import Session from "./session.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../services/token.service.js";
import { cookieOptions } from "../../config/cookie.js";
import { sendEmail } from "../../services/email.service.js";
import { generateOTP, getOTPHtml } from "../../utils/otp.util.js";
import { compareHash } from "../../utils/hash.util.js";

// --------------------------------------------------------------
//  REGISTER
// ---------------------------------------------------------------
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const isAlreadyRegistered = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (isAlreadyRegistered) {
      return res
        .status(409)
        .json({ success: false, message: "User already registered" });
    }

    const hashedPassword = await hashString(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const otp = generateOTP();
    const otpHtml = getOTPHtml(otp);
    const hashedOtp = await hashString(otp);
    await Otp.findOneAndUpdate(
      { userId: user._id },
      {
        otpHash: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      {
        upsert: true,
        new: true,
      },
    );

    await sendEmail(
      user.email,
      "OTP Verification",
      `Your OTP code is ${otp}`,
      otpHtml,
    );

    return res.status(201).json({
      success: true,
      message:
        "An OTP has been sent to your email. Please verify your account.",
      isVerified: user.isVerified,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------------
//  LOGIN
// ---------------------------------------------------------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Inavalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Email is not verified",
      });
    }

    const isPasswordValid = await compareHash(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Inavalid email or password",
      });
    }

    const sessionId = new mongoose.Types.ObjectId();

    const accessToken = generateAccessToken(user._id, sessionId);
    const refreshToken = generateRefreshToken(user._id, sessionId);

    const hashedRefreshToken = await hashString(refreshToken);

    await Session.create({
      _id: sessionId,
      userId: user._id,
      refreshTokenHash: hashedRefreshToken,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged in Successfully",
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------------
//  GETME
// ---------------------------------------------------------------
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------------
//  ROTATION TOKENS
// ---------------------------------------------------------------
export const refreshToken = async (req, res, next) => {
  try {
    const newAccessToken = generateAccessToken(req.auth.id, req.auth.sessionId);

    const newRefreshToken = generateRefreshToken(
      req.auth.id,
      req.auth.sessionId,
    );

    const hashedRefreshToken = await hashString(newRefreshToken);

    req.session.refreshTokenHash = hashedRefreshToken;
    await req.session.save();

    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "New access token generated successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------------
//  LOGOUT
// ---------------------------------------------------------------
export const logout = async (req, res, next) => {
  try {
    req.session.revoked = true;
    await req.session.save();
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------------
//  LOGOUT FROM ALL DEVICES
// ---------------------------------------------------------------
export const logoutAll = async (req, res, next) => {
  try {
    await Session.updateMany(
      {
        userId: req.auth.id,
        revoked: false,
      },
      { revoked: true },
    );
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logout from all devices successfully",
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------------
//  VERIFY EMAIL
// ---------------------------------------------------------------
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    const otpDoc = await Otp.findOne({
      userId: user._id,
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (otpDoc.expiresAt < new Date()) {
      await otpDoc.deleteOne();

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const isOtpValid = await compareHash(otp, otpDoc.otpHash);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;

    await user.save();

    await otpDoc.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};
