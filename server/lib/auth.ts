import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

// Lazy initialization - create auth instance only when first accessed
let authInstance: ReturnType<typeof betterAuth> | null = null;

function getAuth() {
  if (!authInstance) {
    // Use ATLAS_URL which is already in your .env file
    const mongoUri = process.env.MONGODB_URI || process.env.ATLAS_URL;

    if (!mongoUri) {
      throw new Error(
        'MongoDB URI is not defined. Please set MONGODB_URI or ATLAS_URL in your .env file'
      );
    }

    const client = new MongoClient(mongoUri);

    authInstance = betterAuth({
      database: mongodbAdapter(client.db()),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          redirectURI: `${process.env.APP_URL}/api/auth/callback/google`,
        },
        facebook: {
          clientId: process.env.FACEBOOK_CLIENT_ID as string,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
          redirectURI: `${process.env.APP_URL}/api/auth/callback/facebook`,
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day (update session every day)
      },
      user: {
        additionalFields: {
          phoneNumber: {
            type: 'string',
            required: false,
          },
          profileImage: {
            type: 'string',
            required: false,
          },
        },
      },
      trustedOrigins: [
        process.env.CLIENT_URL as string,
        'http://localhost:5173',
      ],
    });
  }

  return authInstance;
}

export const auth = getAuth();
