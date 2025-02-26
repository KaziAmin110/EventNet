import { config } from "dotenv";

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

export const { 
    PORT,
    NODE_ENV,
    DB_URI,
    ACCESS_SECRET,
    ACCESS_EXPIRES_IN,
    REFRESH_SECRET,
    REFRESH_EXPIRES_IN,
    SUPABASE_URL,
    SUPABASE_KEY,
    EVENTS_EMAIL,
    EVENTS_PASSWORD
} = process.env