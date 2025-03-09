import { supabase } from "../database/db.js";
import User from "../entities/user.entities.js";

// Retrieves User Entity Based on Attribute
export const getUserByAttribute = async (attribute, value) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, password")
      .eq(attribute, value)
      .single();

    if (data) {
      return new User(data.id, data.name, data.email, data.password);
    }

    // No User Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Checks If user_id exists in a role table
export const isUserRole = async (role, user_id) => {
  try {
    const { data, error } = await supabase
      .from(role)
      .select("name, email")
      .eq("user_id", user_id)
      .single();

    if (data) {
      return true;
    }

    // No User Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Inserts a new User in the Database
export const createUser = async (name, email, password) => {
  try {
    const { data, error } = await supabase
      .from("users") // Table name
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
export const createAdmin = async (user_id, name, email, uni_id) => {
  try {
    const { data, error } = await supabase
      .from("admin") // Table name
      .insert([{ name, email, uni_id, user_id }])
      .select("admin_id")
      .single();

    if (error) {
      return { error: error.message, status: 500 };
    }

    return data;
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Retrieves User Entity Based on Attribute
export const getAdminByAttribute = async (attribute, value) => {
  try {
    const { data, error } = await supabase
      .from("admin")
      .select("admin_id, name, email, uni_id, user_id")
      .eq(attribute, value)
      .single();

    if (data) {
      return {
        admin_id: data.admin_id,
        name: data.name,
        email: data.email,
        uni_id: data.uni_id,
        user_id: data.user_id,
      };
    }

    // No User Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Updates the Status of an Admin
export const updateAdminStatus = async (admin_id, status) => {
  try {
    const { data, error } = await supabase
      .from("admin")
      .update({ status: status })
      .eq("admin_id", admin_id);
  } catch (error) {
    throw new Error(error.message);
  }
};
