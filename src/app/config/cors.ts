import cors from "cors";
import { env } from "./env";

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches the exact CLIENT_URL or is a vercel preview deployment
    if (
      origin === env.clientUrl || 
      origin.endsWith('.vercel.app') || 
      origin.includes('localhost')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Accept"],
};
