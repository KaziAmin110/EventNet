import User from "../entities/user.entities.js";
import {
  getUserByAttribute,
  createSuperAdmin,
  isUserRole,
} from "../services/users.services.js";

// Grants a User SuperAdmin Role
export const createRole = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { role, uni_id } = req.body;

    // Checks Whether User Exists in the Database
    const user = await getUserByAttribute("id", user_id);
    if (!user) {
      const error = new Error("User Doesnt Exist");
      error.statusCode = 409;
      throw error;
    }

    // Checks whether user already has the desired role
    const isRoleAssigned = await isUserRole(role, user_id);
    if (isRoleAssigned) {
      return res.status(200).json({
        success: true,
        message: `User is already a ${role}`,
      });
    }

    // Assignment of role to User
    if (role === "super_admin") {
      await createSuperAdmin(user_id, user.name, user.email);
    } else if (role === "admin") {
      const error = new Error("Endpoint Not Finished");
      error.statusCode = 403;
      throw error;
    } else if (role === "student") {
      const error = new Error("Endpoint Not Finished");
      error.statusCode = 403;
      throw error;
    } else {
      const error = new Error(
        "Invalid Role: (role: super_admin | admin | student)"
      );
      error.statusCode = 400;
      throw error;
    }
    // Role Assigned to User Successfully
    return res.status(201).json({
      success: true,
      message: `User granted ${role} successfully`,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Uses Bearer Token to get the User Information (user_id, name, email)
export const getUserInfo = async (req, res, next) => {
  try {
    // Get User-Id through refresh Token from Bearer
    const user_id = req.user;
    const user = await getUserByAttribute("id", user_id);

    if (!user) {
      const error = new Error("Get User failed - Invalid JWT Token");
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "User Info gathered Successfully",
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
