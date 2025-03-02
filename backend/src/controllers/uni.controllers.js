import {
  createUniversityDB,
  joinUniversityDB,
} from "../services/uni.services.js";
import { getUserByAttribute, isUserRole } from "../services/users.services.js";

// Endpoint which Allows SuperAdmin to Create a new University Profile
export const createUniversityProfile = async (req, res, next) => {
  try {
    // Get User-Id through refresh Token from Bearer
    const user_id = req.user;
    const {
      uni_name,
      latitude,
      longitude,
      description,
      num_students,
      pictures,
    } = req.body;
    // Verify SuperAdmin Status
    const isSuperAdmin = await isUserRole("super_admin", user_id);

    if (!isSuperAdmin) {
      const error = new Error("User does not have SuperAdmin Status");
      error.statusCode = 403;
      throw error;
    }

    // Create University
    await createUniversityDB(
      uni_name,
      latitude,
      longitude,
      description,
      num_students,
      pictures
    );

    return res.status(201).json({
      success: true,
      message: "University created successfully",
      data: {
        user_id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

export const joinUniversity = async (req, res, next) => {
  try {
    // Get user_id from refresh token
    const user_id = req.user;
    const { uni_id } = req.body;

    const user = await getUserByAttribute("id", user_id);

    if (!user) {
      const error = new Error("Join Invalid - User not in Database");
      error.statusCode = 403;
      throw error;
    }


    // Join Uni by adding entry in student table
    await joinUniversityDB(user_id, uni_id, user.name, user.email);

    res.status(201).json({
      success: true,
      message: "User joined successfully",
      data: {
        user_id: user.id,
        uni_id: uni_id,
      },
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

export const getAllUniversities = async () => {
  try {
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};
