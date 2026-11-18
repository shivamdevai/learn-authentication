import Session from "../modules/auth/session.model.js";
import { verifyRefreshToken } from "../services/token.service.js";
import { compareHash } from "../utils/hash.util.js";

export const validateRefreshSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }
    const decoded = verifyRefreshToken(refreshToken);

    const session = await Session.findById(decoded.sessionId);

    if (!session || session.revoked) {
      return res.status(401).json({
        success: false,
        message: "Session is invalid",
      });
    }

    const isRefreshTokenValid = await compareHash(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    req.auth = decoded;
    req.session = session;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};
