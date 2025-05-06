import { supabase } from "../database/db.js";

// Updates Password of Existing User in the Database Based on User Id
export const updateUserPassword = async (attribute, value, newPassword) => {
  try {
    const { error } = await supabase
      .from("users")
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
    const { data, error } = await supabase
      .from("users")
      .update({ refresh_token })
      .eq("id", id)
      .select("refresh_token");

    if (error) {
      return { error: error.message, status: 500 };
    }

    return { data, message: "Refresh Token Updated Successfully", status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts Email, Password Reset Token and Reset Expiration Date in Password_Reset Table
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

// Updates Password Reset Row with New Password Reset Token and Expiration Date
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

// Removes Password Reset Table Entry Based on a Given Attribute and Value
export const removePasswordResetTokenDB = async (attribute, value) => {
  try {
    const { error } = await supabase
      .from("password_reset")
      .delete()
      .eq(attribute, value);
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Checks the Validation of Password Reset Token including whether it exists and whether it has expired
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

// Retrieves Reset Token Based on Attribute
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

// Deletes Refresh Token from Database Based on Attribute
export const deleteResetTokenByAttribute = async (attribute, value) => {
  try {
    const { error } = await supabase
      .from("users")
      .update({ refresh_token: null })
      .eq(attribute, value);

    if (error) {
      return { error: error.message, status: 500 };
    }

    return {
      success: true,
      message: "Reset Token Deleted Successfully",
      status: 201,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Checks whether a given number is in a valid format
export const isValidPhoneFormat = (phone_num) => {
  let isOnlyNumbers = /^\d+$/;
  if (phone_num.length == 10 && isOnlyNumbers.test(phone_num)) return true;

  return false;
};

// Checks whether a given email is in a valid format
export const isValidEmailFormat = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Checks whether a password matches complexity criteria
export const isValidPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?/~\\-])(?=.{8,}).*$/;
  return passwordRegex.test(password);
};

export const generateCode = () => {
  const arr = [];
  for (let i = 0; i < 3; i++) {
    for (let i = 0; i < 4; i++) {
      const charCode = Math.floor(Math.random() * 26) + "A".charCodeAt(0);
      const randomChar = String.fromCharCode(charCode);
      arr.push(randomChar);
    }
    arr.push("-");
  }
  return arr.slice(0, -1).join("");
};
