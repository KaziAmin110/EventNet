import { supabase } from "../database/db.js";
import User from "../entities/user.entities.js";
import redisClient from "../../config/redis.config.js";
import Admin from "../entities/admin.entities.js";

// Retrieves User Entity Based on Attribute
export const getUserByAttribute = async (attribute, value) => {
  try {
    // Generate cache key based on attribute (Ex. "user:email:user@gmail.com")
    const cacheKey = `user:${attribute}:${value}`;
    const cachedUser = await redisClient.get(cacheKey);

    // Checks if User already exists within Redis Cache
    if (cachedUser) {
      const data = JSON.parse(cachedUser);
      return new User(data.id, data.name, data.email, data.password);
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, password")
      .eq(attribute, value)
      .single();

    if (data) {
      // Store in Redis Cache with expiration (5 minutes)
      await redisClient.set(cacheKey, JSON.stringify(data), "EX", 300);
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
    // Generate cache key based on role & user_id (e.g "role:admin:12345")
    const cacheKey = `role:${role}:${user_id}`;

    // Check if user role exists in Redis Cache
    const cachedRole = await redisClient.get(cacheKey);
    if (cachedRole != null) {
      return JSON.parse(cachedRole);
    }

    const { data, error } = await supabase
      .from(role)
      .select("name, email")
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
    const { data, error } = await supabase
      .from("users") // Table name
      .insert([{ name, email, password }])
      .select("*");

    if (error) {
      return { error: error.message, status: 500 };
    }

    return new User(data.id, data.name, data.email, data.password);
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

// Retrieves User Entity Based on Attribute
export const getAdminByAttribute = async (attribute, value) => {
  try {
    // Generate cache key based on attribute (Ex. "admin:email:admin@gmail.com")
    const cacheKey = `admin:${attribute}:${value}`;
    const cachedUser = await redisClient.get(cacheKey);

    // Checks if User already exists within Redis Cache
    if (cachedUser) {
      const data = JSON.parse(cachedUser);
      return new Admin(
        data.admin_id,
        data.name,
        data.email,
        data.uni_id,
        data.user_id
      );
    }

    const { data, error } = await supabase
      .from("admin")
      .select("admin_id, name, email, uni_id, user_id")
      .eq(attribute, value)
      .single();

    if (data) {
      // Store in Redis Cache with expiration (5 minutes)
      await redisClient.set(cacheKey, JSON.stringify(data), "EX", 300);
    }

    // No User Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};
