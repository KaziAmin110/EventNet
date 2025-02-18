import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/env.js";
import { getByEmail, createUser } from "../services/user.js";

// Implement Sign Up Logic
export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check Valid Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error("Invalid Email Format");
      error.statusCode = 408;
      throw error;
    }

    // Check If Email already exists within the database
    const existingUser = await getByEmail(email);

    if (existingUser) {
      const error = new Error("Email Already Exists");
      error.statusCode = 409;
      throw error;
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await createUser(name, email, hashedPassword);

    const newUser = await getByEmail(email); // Fetch user again to get its ID

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      sucess: true,
      message: "User Created Successfully",
      data: {
        token,
        user: {
          name,
          email,
        },
      },
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

// Implement Sign In Logic
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await getByEmail(email);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid Password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ email: email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.status(200).json({
      success: true,
      message: "User Signed In Successfully",
      data: {
        token,
        email,
      },
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

// Implement Sign Out Logic
export const signOut = async (req, res, next) => {};
