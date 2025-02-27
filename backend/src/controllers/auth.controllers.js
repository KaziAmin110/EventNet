import User from "../entities/user.entities.js";
import {
  EVENTS_EMAIL,
  EVENTS_PASSWORD,
  ACCESS_SECRET,
  REFRESH_SECRET,
  ACCESS_EXPIRES_IN,
} from "../../config/env.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import {
  getUserByAttribute,
  createUser,
  updateUserPassword,
  updateRefreshToken,
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
    const existingUser = await getUserByAttribute("email", email);

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }
    // Hashing our password via the User entity
    const hashedPassword = await User.hashPassword(password);
    // Create new user within the database
    await createUser(name, email, hashedPassword);

    // Retreiving the newly added user by their email
    const newUser = await getUserByAttribute("email", email);

    // Getting the JWT token via the user entity
    const accessToken = newUser.generateAccessToken();

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: {
        accessToken,
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

    const user = await getUserByAttribute("email", email);

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
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    const refreshTokenAge = 24 * 60 * 60 * 1000;

    await updateRefreshToken(user.id, refreshToken);
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "None",
      maxAge: refreshTokenAge,
    });

    res.status(200).json({
      success: true,
      message: "User Signed In Successfully",
      data: {
        accessToken,
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
    const user = await getUserByAttribute("email", email);

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

    if (!id || !token) {
      const error = new Error(
        "One or more required parameters are not present"
      );
      error.statusCode = 400;
      throw error;
    }

    if (!password) {
      const error = new Error("Password Field Not Present in API request");
      error.statusCode = 400;
      throw error;
    }

    jwt.verify(token, ACCESS_SECRET);

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

export const refreshAccess = async (req, res, next) => {
  try {
    // Get Refresh Token from Cookies
    const cookies = req.cookies;

    // Given JWT Cookie Doesnt Exist
    if (!cookies?.jwt) {
      const error = new Error("JWT refresh failed - No JWT Cookie Found");
      error.statusCode = 401;
      throw error;
    }

    const refreshToken = cookies.jwt;
    const user = await getUserByAttribute("refresh_token", refreshToken);

    if (!user) {
      const error = new Error(
        "JWT refresh failed - Unable to Authenticate User"
      );
      error.statusCode = 403;
      throw error;
    }

    jwt.verify(refreshToken, REFRESH_SECRET);
    const accessToken = jwt.sign(user, ACCESS_SECRET, {
      expiresIn: ACCESS_EXPIRES_IN,
    });

    res.status(200).json({
      success: true,
      message: "JWT Refresh Successful",
      data: {
        accessToken,
      },
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};
