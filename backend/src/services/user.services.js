import { supabase } from "../database/db.js";
import User from "../entities/user.entities.js";

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


