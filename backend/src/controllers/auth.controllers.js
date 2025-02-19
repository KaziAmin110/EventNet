import { getByEmail, createUser } from "../services/user.services.js";
import User from "../entities/user.js";

// Implement Sign Up Logic
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Querying the database to see if the given email exists
    const existingUser = await getByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hashing our password via the User entity
    const hashedPassword = await User.hashPassword(password);

    // Create new user within the database
    await createUser(name, email, hashedPassword);

    // Retreiving the newly added user by their email
    const newUser = await getByEmail(email);

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

    // Checking if the given password matches the hashed password
    const isPasswordValid = await user.comparePassword(password)

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

// Implement Sign Out Logic
export const signOut = async (req, res, next) => {};
