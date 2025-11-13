/**
 * ⚠️ DEPRECATED - NOT IN USE
 *
 * These auth routes are no longer active. We've migrated to Better Auth.
 * All authentication endpoints are now handled by Better Auth at /api/auth/*
 *
 * Better Auth provides these endpoints automatically:
 * - POST /api/auth/sign-up/email - Register with email/password
 * - POST /api/auth/sign-in/email - Login with email/password
 * - POST /api/auth/sign-in/social - OAuth login (Google, Facebook)
 * - POST /api/auth/sign-out - Logout
 * - GET /api/auth/get-session - Get current session
 * - POST /api/auth/send-verification-email - Send verification email
 * - GET /api/auth/verify-email - Verify email with token
 * - POST /api/auth/forget-password - Request password reset
 * - POST /api/auth/reset-password - Reset password with token
 *
 * Kept for reference only. Do not use in new code.
 *
 * See: server/lib/auth.ts for Better Auth configuration
 */

import express, { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyOTP,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router: Router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
