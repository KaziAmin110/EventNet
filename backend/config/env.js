import { config } from "dotenv";

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

export const { 
    PORT,
    NODE_ENV,
    DB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    SUPABASE_URL,
    SUPABASE_KEY,
    EVENTS_EMAIL,
    EVENTS_PASSWORD
} = process.env