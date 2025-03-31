import { supabase } from "../database/db.js";
import redisClient from "../../config/redis.config.js";

// Inserts a new university event in the university_events table
export const createUniversityEventDB = async (
  event_name,
  description,
  latitude,
  longitude,
  location,
  start_date,
  end_date,
  uni_id,
  admin_id,
  event_categories = null
) => {
  try {
    const { data, error } = await supabase
      .from("university_events") // Table name
      .insert([
        {
          event_name,
          description,
          latitude,
          longitude,
          event_categories,
          start_date,
          end_date,
          uni_id,
          admin_id,
          location,
        },
      ]);
    if (error) {
      console.error(error.message);
      return { error: error.message, status: 500 };
    }

    return {
      message: "University Event Added Successfully",
      data,
      status: 201,
    };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts a new RSO event in the rso_events table
export const createRSOEventDB = async (
  event_name,
  description,
  latitude,
  longitude,
  location,
  start_date,
  end_date,
  uni_id,
  admin_id,
  rso_id,
  event_categories = null
) => {
  try {
    const { data, error } = await supabase
      .from("rso_events") // Table name
      .insert([
        {
          event_name,
          description,
          latitude,
          longitude,
          event_categories,
          start_date,
          end_date,
          uni_id,
          admin_id,
          rso_id,
          location,
        },
      ]);
    if (error) {
      console.error(error.message);
      return { error: error.message, status: 500 };
    }

    return { message: "RSO Event Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts a new Public Event in the public_events table
export const createPublicEventRequestDB = async (
  event_name,
  description,
  latitude,
  longitude,
  location,
  start_date,
  end_date,
  admin_id,
  event_categories = null
) => {
  try {
    const { data, error } = await supabase
      .from("public_events") // Table name
      .insert([
        {
          event_name,
          description,
          latitude,
          longitude,
          event_categories,
          start_date,
          end_date,
          admin_id,
          location,
        },
      ]);
    if (error) {
      console.error(error.message);
      return { error: error.message, status: 500 };
    }

    return { message: "Public Event Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};
