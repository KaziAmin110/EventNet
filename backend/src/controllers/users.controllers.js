import { SUPERADMIN_SECRET } from "../../config/env.js";
import {
  getUniversityEventsDB,
  getPublicEventsWithStatusDB,
  getRSOEventsDB,
} from "../services/events.services.js";
import {
  getUserByAttribute,
  createSuperAdmin,
  isUserRole,
  getUserRole,
} from "../services/users.services.js";

// Grants a User SuperAdmin Role
export const createSuperAdminRole = async (req, res, next) => {
  try {
    const { user_id, secret_token } = req.body;

    // Check secret_token
    if (secret_token !== SUPERADMIN_SECRET) {
      const error = new Error("Invalid Secret Token - Access Denied");
      error.statusCode = 409;
      throw error;
    }

    // Checks Whether User Exists in the Database
    const user = await getUserByAttribute("id", user_id);
    if (!user) {
      const error = new Error("User Doesnt Exist");
      error.statusCode = 404;
      throw error;
    }

    // Checks whether user already has the desired role
    const isRoleAssigned = await isUserRole("super_admin", user_id);
    if (isRoleAssigned) {
      return res.status(200).json({
        success: true,
        message: `User is already a SuperAdmin`,
      });
    }

    // Assignment of SuperAdmin Role to User
    await createSuperAdmin(user_id, user.name, user.email);

    // Role Assigned to User Successfully
    return res.status(201).json({
      success: true,
      message: "User granted SuperAdmin Successfully",
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

    user.role = await getUserRole(user_id);

    return res.status(200).json({
      success: true,
      message: "User Info gathered Successfully",
      data: {
        user_id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Logic for Getting All Events Which are Visible to the Logged in User
export const getUserEvents = async (req, res) => {
  try {
    const user_id = req.user;

    // Get Valid Public Events, University Events, and RSO Events visible to the User
    const [public_events, university_events, rso_events] = await Promise.all([
      getPublicEventsWithStatusDB("valid"),
      getUniversityEventsDB(user_id),
      getRSOEventsDB(user_id),
    ]);

    const allEvents = [...public_events, ...university_events, ...rso_events];
    return res.status(200).json({
      success: true,
      message: "User Info gathered Successfully",
      data: allEvents,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
