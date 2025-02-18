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
      const error = new Error("User Already Exists");
      error.statusCode = 409;
      throw error;
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await createUser(name, email, hashedPassword);

    const token = jwt.sign({ email: email }, JWT_SECRET, {
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
                password
            },
        },
    });

  } catch (error) {
    next(error);
  }
};

// Implement Sign In Logic
export const signIn = async (req, res, next) => {};

// Implement Sign Out Logic
export const signOut = async (req, res, next) => {};
