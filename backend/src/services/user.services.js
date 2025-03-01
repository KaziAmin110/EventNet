import { supabase } from "../database/db.js";
import User from "../entities/user.entities.js";

// Retrieves User Entity Based on Attribute
export const getUserByAttribute = async (attribute, value) => {
  try {
    const { data, error } = await supabase
      .from("User")
      .select("id, name, email, password")
      .eq(attribute, value)
      .single();

    if (data) {
      return new User(data.id, data.name, data.email, data.password);
    }

    // No Such User associated with Email
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Inserts a new User in the Database
export const createUser = async (name, email, password) => {
  try {
    const { data, error } = await supabase
      .from("User") // Table name
      .insert([{ name, email, password }]);
    if (error) {
      return { error: error.message, status: 500 };
    }

    return { message: "User created successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts a New SuperAdmin in the SuperAdmin Table
export const createSuperAdmin = async (user_id, name, email) => {
  try {
    const { data, error } = await supabase
      .from("super_admin") // Table name
      .insert([{ user_id, name, email }]);
    if (error) {
      return { error: error.message, status: 500 };
    }

    return { message: "SuperAdmin created successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts a New Admin in the Admin Table
export const createAdmin = async (name, email, uni_id, user_id) => {
  try {
    const { data, error } = await supabase
      .from("admin") // Table name
      .insert([{ name, email, uni_id, user_id }]);
    if (error) {
      return { error: error.message, status: 500 };
    }

    return { message: "Admin created successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts a New Student in the Student Database
export const createStudent = async (name, email, uni_id, user_id) => {
  try {
    const { data, error } = await supabase
      .from("User") // Table name
      .insert([{ name, email, uni_id, user_id }]);
    if (error) {
      return { error: error.message, status: 500 };
    }

    return { message: "Student created successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};
