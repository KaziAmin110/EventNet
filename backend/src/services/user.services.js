import { supabase } from "../database/db.js";
import User from "../entities/user.entities.js";

// Retrieves User Entity Based on Email
export const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from("User")
      .select("id, name, email, password")
      .eq("email", email)
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

// Creates a New User in the Database
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

// Updates Password of Existing User in the Database Based on User Id
export const updateUserPassword = async (id, newPassword) => {
  try {
    const { error } = await supabase
      .from("User")
      .update({ password: newPassword })
      .eq("id", id);

    if (error) {
      return { error: error.message, status: 500 };
    }

    return { message: "Password Updated Successfully", status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Updates Refresh Token in DB upon Sign In
export const updateRefreshToken = async (id, refresh_token) => {
  try {
    const { error } = await supabase
      .from("User")
      .update({ refresh_token})
      .eq("id", id);

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
