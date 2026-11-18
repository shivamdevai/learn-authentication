import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateRefreshSession } from "../../middlewares/validateRefreshSession.middleware.js";

const router = Router();

// POST : api/v1/auth/register
router.post(`/register`, authController.register);

// POST : api/v1/auth/login
router.post(`/login`, authController.login);

// GET : api/v1/auth/get-me
router.get(`/get-me`, authMiddleware, authController.getMe);

// GET : api/v1/auth/refresh-token
router.get(`/refresh-token`, validateRefreshSession, authController.refreshToken);

// GET : api/v1/auth/logout
router.get(`/logout`, validateRefreshSession, authController.logout);

// GET : api/v1/auth/logout-all
router.get(`/logout-all`, validateRefreshSession, authController.logoutAll);

// POST : api/v1/auth/verify-email
router.post(`/verify-email`, authController.verifyEmail);

export default router;
