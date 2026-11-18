import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const generateAccessToken = (userId, sessionId) => {
  return jwt.sign({ id: userId, sessionId }, config.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId, sessionId) => {
  return jwt.sign({ id: userId, sessionId }, config.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.REFRESH_TOKEN_SECRET);
};
