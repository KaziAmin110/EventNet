import User from "../entities/user.entities.js";
import { EVENTS_EMAIL, EVENTS_PASSWORD, JWT_SECRET } from "../../config/env.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import {
  getUserByEmail,
  createUser,
  updateUserPassword,
} from "../services/user.services.js";

// Allows for the Creation of a New User in the Supabase DB
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = new Error("One or more required fields are not present");
      error.statusCode = 400;
      throw error;
    }
    // Querying the database to see if the given email exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }
    // Hashing our password via the User entity
    const hashedPassword = await User.hashPassword(password);
    // Create new user within the database
    await createUser(name, email, hashedPassword);

    // Retreiving the newly added user by their email
    const newUser = await getUserByEmail(email);

    // Getting the JWT token via the user entity
    const token = newUser.generateAuthToken();

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: {
        token,
        user: {
          name: newUser.name,
          email: newUser.email,
        },
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Allows User to Sign In -- Returns a JWT Token Upon Success
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("One or more required fields are not present");
      error.statusCode = 400;
      throw error;
    }

    const user = await getUserByEmail(email);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Checking if the given password matches the hashed password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      const error = new Error("Invalid Password");
      error.statusCode = 401;
      throw error;
    }

    // Generating the token via the user entity method
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "User Signed In Successfully",
      data: {
        token,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

// Allows User to Sign Out -- Clears JWT Token from Cookies
export const signOut = async (req, res, next) => {};

// Sends Email to User with a Reset Password Link
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!email) {
      const error = new Error("Email field is not present in API Request");
      error.statusCode = 400;
      throw error;
    }

    if (!user) {
      const error = new Error("Email not found");
      error.statusCode = 404;
      throw error;
    }

    const token = user.generateAuthToken();

    // Nodemailer Setup
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EVENTS_EMAIL,
        pass: EVENTS_PASSWORD,
      },
    });
    var mailOptions = {
      from: EVENTS_EMAIL,
      to: email,
      subject: "Reset Your Password",
      text: `http://localhost:5500/reset-password/${user.id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        throw error;
      } else {
        res.status(200).json({
          success: true,
          message: "Reset Email Sent Succesfully",
        });
      }
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Allows User to Reset Their Password
export const resetPassword = async (req, res, next) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    jwt.verify(token, JWT_SECRET);

    if (!password) {
      throw new Error("Password is required");
    }

    const hashedPassword = await User.hashPassword(password);
    await updateUserPassword(id, hashedPassword);

    res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};
