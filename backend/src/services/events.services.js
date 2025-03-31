import { supabase } from "../database/db.js";
import redisClient from "../../config/redis.config.js";

// Inserts a new university event in the private_event table
export const createUniversityEventDB = async (
  uni_name,
  latitude,
  longitude,
  description,
  pictures,
  domain
) => {
  try {
    const { data, error } = await supabase
      .from("university") // Table name
      .insert([
        {
          uni_name,
          latitude,
          longitude,
          description,
          num_students: 0,
          pictures,
          domain,
        },
      ]);
    if (error) {
      console.log(error.message);
      return { error: error.message, status: 500 };
    }

    return { message: "University Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts a new RSO event in the rso_event table
export const createRSOEventDB = async (
  uni_name,
  latitude,
  longitude,
  description,
  pictures,
  domain
) => {
  try {
    const { data, error } = await supabase
      .from("university") // Table name
      .insert([
        {
          uni_name,
          latitude,
          longitude,
          description,
          num_students: 0,
          pictures,
          domain,
        },
      ]);
    if (error) {
      console.log(error.message);
      return { error: error.message, status: 500 };
    }

    return { message: "University Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};
