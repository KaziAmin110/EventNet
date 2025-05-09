import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  NODE_ENV,
  DB_URI,
  SUPABASE_URL,
  SUPABASE_KEY,
  ACCESS_SECRET,
  ACCESS_EXPIRES_IN,
  REFRESH_SECRET,
  REFRESH_EXPIRES_IN,
  RSO_SECRET,
  EVENTS_EMAIL,
  EVENTS_PASSWORD,
  SUPERADMIN_SECRET,
  GOOGLE_PLACES_API_KEY,
  REDIS_DEVELOPER_PASSWORD,
} = process.env;
