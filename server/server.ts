import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';

// Load environment variables FIRST before any other imports that use them
dotenv.config();

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 8000;
const app = express();

app.use(cors());
app.use(express.json());

// Better Auth routes - lazy loaded to ensure env vars are available
import('./lib/auth.js').then(({ auth }) => {
  app.use('/api/auth', toNodeHandler(auth));
});

// Routes (keep existing auth routes for backwards compatibility)
app.use('/api/auth', authRoutes);

// Health check route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API is running...' });
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
