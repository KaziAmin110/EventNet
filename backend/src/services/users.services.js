import { supabase } from "../database/db.js";
import User from "../entities/user.entities.js";
import redisClient from "../../config/redis.config.js";
import Admin from "../entities/admin.entities.js";

// Retrieves User Entity Based on Attribute
export const getUserByAttribute = async (attribute, value) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name")
      .eq(attribute, value)
      .single();

    if (error && data) {
      console.log(error);
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Retrieves Hashed Password from DB
export const getSignInInfoDB = async (attribute, value) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, password")
      .eq(attribute, value)
      .single();

    if (data) {
      // Store in Redis Cache with expiration (5 minutes)
      return [new User(data.id, data.name, data.email), data.password];
    }

    // No Password Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
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
      return data;
    }

    // No User Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Retrieves User Role
export const getUserRole = async (user_id) => {
  try {
    const [isAdmin, isSuperAdmin, isStudent] = await Promise.all([
      isUserRole("super_admin", user_id),
      isUserRole("admin", user_id),
      isUserRole("student", user_id),
    ]);

    if (isSuperAdmin) {
      return "super_admin";
    } else if (isAdmin) {
      return "admin";
    } else if (isStudent) {
      return "student";
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
    // Generate cache key based on role & user_id (e.g "role:admin:12345")
    const cacheKey = `role:${role}:${user_id}`;

    // Check if user role exists in Redis Cache
    const cachedRole = await redisClient.get(cacheKey);
    if (cachedRole != null) {
      return JSON.parse(cachedRole);
    }

    const { data, error } = await supabase
      .from(role)
      .select("user_id")
      .eq("user_id", user_id)
      .single();

    const roleExists = !!data; // Converts data to boolean

    // Store result in Redis with expiration (5 minutes)
    await redisClient.set(cacheKey, JSON.stringify(roleExists), "EX", 300);

    return roleExists;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Inserts a new User in the Database
export const createUser = async (name, email, password) => {
  try {
    // Hash password before storing it
    const hashedPassword = await User.hashPassword(password);

    const { data, error } = await supabase
      .from("users") // Table name
      .insert([{ name, email, password: hashedPassword }])
      .select("id, name, email")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return new User(data.id, data.name, data.email);
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

    // Invalidates Cache if they exist
    await redisClient.del(`role:admin:${user_id}`);
    await redisClient.del(`role:student:${user_id}`);

    return data;
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
    // Invalidates Cache if they exist
    await redisClient.del(`role:super_admin:${user_id}`);
    await redisClient.del(`role:student:${user_id}`);

    return data;
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Removes Admin From Admin Table
export const deleteAdmin = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("admin") // Table name
      .delete()
      .eq("user_id", user_id);

    if (error) {
      console.log(error);
    }

    // Invalidates Cache if they exist
    await redisClient.del(`role:super_admin:${user_id}`);
    await redisClient.del(`role:student:${user_id}`);
    await redisClient.del(`role:admin:${user_id}`);

    return {
      success: true,
      message: "Admin Removed Successfully",
    };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};
