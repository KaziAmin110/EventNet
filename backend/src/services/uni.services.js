import { supabase } from "../database/db.js";
import University from "../entities/uni.entities.js";

// Inserts a new university in the University Table
export const createUniversityDB = async (
  uni_name,
  latitude,
  longitude,
  description,
  num_students,
  pictures
) => {
  try {
    const { data, error } = await supabase
      .from("university") // Table name
      .insert([
        { uni_name, latitude, longitude, description, num_students, pictures },
      ]);
    if (error) {
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

// Inserts a student in the Student Table with uni_id
export const joinUniversityDB = async (user_id, uni_id, name, email) => {
  try {
    const { data, error } = await supabase
      .from("student") // Table name
      .insert([{ user_id, uni_id, name, email }]);
    if (error) {
      return { error: error.message, status: 500 };
    }

    return { message: "Student Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Get University by Attribute
export const getUniByAttribute = async (attribute, value) => {
  try {
    const { data, error } = await supabase
      .from("university")
      .select(
        "uni_id, uni_name, longitude, latitude, description, num_students, pictures"
      )
      .eq(attribute, value)
      .single();

    if (data) {
      return new University(
        data.id,
        data.name,
        data.longitude,
        data.latitude,
        data.description,
        data.pictures,
        data.num_students
      );
    }

    // No University Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};
