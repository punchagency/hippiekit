import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports that use them
dotenv.config();

// Debug: Check if env vars are loaded
console.log('🔍 Environment check:');
console.log(
  '- RESEND_API_KEY:',
  process.env.RESEND_API_KEY ? '✅ Found' : '❌ Missing'
);
console.log(
  '- MONGODB_URI:',
  process.env.MONGODB_URI ? '✅ Found' : '❌ Missing'
);
console.log('- CLIENT_URL:', process.env.CLIENT_URL || 'Using default');

import express, { Request, Response } from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';

// MongoDB connection is handled by Better Auth's MongoDB adapter
// No need for separate connectDB()

const PORT = process.env.PORT || 8000;
const app = express();

const allowedOrigins = [
  'http://192.168.1.24:5173', // your browser dev server
  'capacitor://localhost', // required for Android/iOS
];

// CORS configuration - allow credentials for Better Auth
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Mount Better Auth handler BEFORE express.json() middleware
// This is critical - express.json() will cause Better Auth to hang
// Express v5 uses *splat instead of * for catch-all routes
app.all('/api/auth/*splat', toNodeHandler(auth));

// Mount express.json() AFTER Better Auth handler
app.use(express.json());

// Health check route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API is running...' });
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
