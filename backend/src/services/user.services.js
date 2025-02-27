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

// Retrieves User Entity Based on Attribute
export const getResetTokenByAttribute = async (attribute, value) => {
  try {
    const { data, error } = await supabase
      .from("password_reset")
      .select("email, reset_token, reset_token_expiry")
      .eq(attribute, value)
      .single();

    if (data) {
      return {
        email: data.email,
        reset_token: data.reset_token,
        reset_token_expiry: data.reset_token_expiry,
      };
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
export const updateUserPassword = async (attribute, value, newPassword) => {
  try {
    const { error } = await supabase
      .from("User")
      .update({ password: newPassword })
      .eq(attribute, value);

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
      .update({ refresh_token })
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

export const updatePasswordResetDB = async (
  email,
  reset_token,
  reset_token_expiry
) => {
  try {
    const { error } = await supabase
      .from("password_reset")
      .update({ reset_token, reset_token_expiry })
      .eq("email", email);

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

export const createPasswordResetDB = async (
  email,
  reset_token,
  reset_token_expiry
) => {
  try {
    const { data, error } = await supabase
      .from("password_reset") // Table name
      .insert([{ email, reset_token, reset_token_expiry }]);

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

export const verifyPasswordResetToken = (data) => {
  if (!data) return false;
  // Check that the token hasn't expired
  const now = new Date();
  const expiryDate = new Date(data.reset_token_expiry);

  if (expiryDate > now) {
    return true;
  } else {
    return false;
  }
};
