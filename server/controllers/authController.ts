import { Request, Response } from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.js';
import { sendEmail } from '../lib/emailService.js';
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import Account from '../models/Account.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { provider, providerAccountId, name, email, password, phoneNumber } =
      req.body;

    // Validate fields for credentials provider
    if (provider === 'credentials' && !password) {
      throw new Error('Password is required for credential provider');
    }

    // Check if user already exists with email
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    // Create new user (password hashing handled by pre-save hook)
    const [user] = await User.create(
      [
        {
          name,
          email,
          password: provider === 'credentials' ? password : undefined,
          phoneNumber,
        },
      ],
      { session }
    );

    // Link account (no password stored here)
    const existingAccount = await Account.findOne({
      userId: user._id,
      provider,
      providerAccountId,
    }).session(session);

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: user._id,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        token: generateToken(String(user._id)),
      },
      message: 'User registered successfully',
    });
    return;
  } catch (error) {
    console.error('Registration error:', error);

    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    });
    return;
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);

    // Check for user
    const user = await User.findOne({ email })
      .select('+password')
      .session(session);

    if (!user) {
      console.log('❌ User not found:', email);
      await session.abortTransaction();
      session.endSession();
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      console.log('❌ Password mismatch for:', email);
      await session.abortTransaction();
      session.endSession();
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check/create Account entry for credentials provider
    const existingAccount = await Account.findOne({
      userId: user._id,
      provider: 'credentials',
    }).session(session);

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: user._id,
            provider: 'credentials',
            providerAccountId: email, // Use email as providerAccountId for credentials
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    const token = generateToken(String(user._id));
    console.log(
      '✅ Login successful for:',
      email,
      '| User ID:',
      String(user._id)
    );

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        token: token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    console.log('🔍 getMe request - User authenticated:', !!authReq.user);

    if (!authReq.user) {
      console.log('❌ getMe - No user in request');
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const user = await User.findById(authReq.user._id);

    if (!user) {
      console.log('❌ getMe - User not found in DB:', authReq.user._id);
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    console.log('✅ getMe successful for:', user.email);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('❌ getMe error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const user = await User.findById(authReq.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.profileImage = req.body.profileImage || user.profileImage;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          profileImage: updatedUser.profileImage,
          token: generateToken(String(updatedUser._id)),
        },
        message: 'Profile updated successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Send OTP via email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
      return;
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(String(user._id)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedOTP,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    });
  }
};

// @desc    Native Google Sign-In (Android/iOS)
// @route   POST /api/auth/google-signin
// @access  Public
export const googleSignIn = async (
  req: Request,
  res: Response
): Promise<void> => {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { idToken } = req.body;

    if (!idToken) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ success: false, message: 'ID token is required' });
      return;
    }

    // Verify the Google ID token with Google
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${encodeURIComponent(
        idToken
      )}`
    );

    if (!response.ok) {
      await session.abortTransaction();
      session.endSession();
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    const tokenInfo = (await response.json()) as {
      email: string;
      name?: string;
      picture?: string;
      sub: string;
    };

    const { email, name, picture, sub } = tokenInfo;

    if (!email) {
      await session.abortTransaction();
      session.endSession();
      res
        .status(400)
        .json({ success: false, message: 'Email not found in token' });
      return;
    }

    // Check if user exists
    let user = await User.findOne({ email }).session(session);

    if (!user) {
      // Create new user
      [user] = await User.create(
        [
          {
            name: name || email.split('@')[0],
            email,
            password: crypto.randomBytes(32).toString('hex'), // Random password for OAuth users
            phoneNumber: '',
            profileImage: picture,
            isVerified: true,
          },
        ],
        { session }
      );

      // Create Account entry
      await Account.create(
        [
          {
            userId: user._id,
            provider: 'google',
            providerAccountId: sub,
          },
        ],
        { session }
      );
    } else {
      // Update existing user
      user.profileImage = picture || user.profileImage;
      user.isVerified = true;
      await user.save({ session });

      // Check if Google account is already linked
      const existingAccount = await Account.findOne({
        userId: user._id,
        provider: 'google',
        providerAccountId: sub,
      }).session(session);

      if (!existingAccount) {
        // Link Google account to existing user
        await Account.create(
          [
            {
              userId: user._id,
              provider: 'google',
              providerAccountId: sub,
            },
          ],
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    const token = generateToken(String(user._id));
    console.log(
      '✅ Google sign-in/up success for',
      email,
      'User ID:',
      String(user._id)
    );
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        token: generateToken(String(user._id)),
      },
      message: 'Google sign-in successful',
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    });
  }
};

// @desc    Web Google OAuth - Initiate
// @route   GET /api/auth/google
// @access  Public
export const googleOAuthInitiate = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${
      process.env.APP_URL || 'http://localhost:8000'
    }/api/auth/callback/google`;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!clientId) {
      res
        .status(500)
        .json({ success: false, message: 'Google OAuth not configured' });
      return;
    }

    // Build Google OAuth URL
    const googleAuthUrl = new URL(
      'https://accounts.google.com/o/oauth2/v2/auth'
    );
    googleAuthUrl.searchParams.append('client_id', clientId);
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'email profile');
    googleAuthUrl.searchParams.append('access_type', 'online');
    googleAuthUrl.searchParams.append('state', clientUrl); // Pass client URL in state for redirect

    res.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Google OAuth initiate error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    });
  }
};

// @desc    Web Google OAuth - Callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleOAuthCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      const clientUrl =
        (state as string) || process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientUrl}?error=${encodeURIComponent(error as string)}`);
      return;
    }

    if (!code) {
      const clientUrl =
        (state as string) || process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientUrl}?error=no_code`);
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${
      process.env.APP_URL || 'http://localhost:8000'
    }/api/auth/callback/google`;

    if (!clientId || !clientSecret) {
      const clientUrl =
        (state as string) || process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientUrl}?error=oauth_not_configured`);
      return;
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const clientUrl =
        (state as string) || process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientUrl}?error=token_exchange_failed`);
      return;
    }

    const tokens = (await tokenResponse.json()) as { id_token: string };
    const { id_token } = tokens;

    // Verify ID token and get user info
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`
    );

    if (!userInfoResponse.ok) {
      const clientUrl =
        (state as string) || process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientUrl}?error=invalid_token`);
      return;
    }

    const tokenInfo = (await userInfoResponse.json()) as {
      email: string;
      name?: string;
      picture?: string;
      sub: string;
    };

    const { email, name, picture, sub } = tokenInfo;

    await connectDB();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if user exists or create new user
      let user = await User.findOne({ email }).session(session);

      if (!user) {
        [user] = await User.create(
          [
            {
              name: name || email.split('@')[0],
              email,
              password: crypto.randomBytes(32).toString('hex'),
              phoneNumber: '',
              profileImage: picture,
              isVerified: true,
            },
          ],
          { session }
        );

        // Create Account entry
        await Account.create(
          [
            {
              userId: user._id,
              provider: 'google',
              providerAccountId: sub,
            },
          ],
          { session }
        );
      } else {
        user.profileImage = picture || user.profileImage;
        user.isVerified = true;
        await user.save({ session });

        // Check if Google account is already linked
        const existingAccount = await Account.findOne({
          userId: user._id,
          provider: 'google',
          providerAccountId: sub,
        }).session(session);

        if (!existingAccount) {
          // Link Google account to existing user
          await Account.create(
            [
              {
                userId: user._id,
                provider: 'google',
                providerAccountId: sub,
              },
            ],
            { session }
          );
        }
      }

      await session.commitTransaction();
      session.endSession();

      const jwtToken = generateToken(String(user._id));
      const clientUrl =
        (state as string) || process.env.CLIENT_URL || 'http://localhost:5173';

      console.log('✅ Web Google OAuth success for', email);

      // Redirect to client with token
      res.redirect(`${clientUrl}?token=${jwtToken}`);
    } catch (dbError) {
      await session.abortTransaction();
      session.endSession();
      throw dbError;
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}?error=oauth_failed`);
  }
};
