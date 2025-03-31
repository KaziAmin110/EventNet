import { isUserRole } from "../services/users.services.js";
import {
  createUniversityEventDB,
  createRSOEventDB,
} from "../services/events.services.js";

// Logic for Creating a Private University Event
export const createUniversityEvent = async (req, res) => {
  try {
    // Get User Information through Middleware (JWT) and request headers
    const user_id = req.user;
    const { uni_id } = req.params;
    const {
      event_name,
      description,
      latitude,
      longitude,
      location,
      start_date,
      end_date,
      event_categories,
    } = req.body;

    // Check for Required Body Info
    if (
      !event_name ||
      !description ||
      !latitude ||
      !longitude ||
      !start_date ||
      !end_date ||
      !location
    ) {
      const error = new Error(
        "One or more required fields missing. (event_name, description, latitude, longitude, start_date, end_date, location)"
      );

      error.statusCode = 403;
      throw error;
    }

    // Checks if User has Permision to Create Event
    const isAdmin = await isUserRole("admin", user_id);

    if (!isAdmin) {
      const error = new Error("User Unauthorized to Create a University Event");
      error.statusCode = 403;
      throw error;
    }

    // Insert University Event into DB
    await createUniversityEventDB(
      event_name.trim().toLowerCase(),
      description,
      latitude,
      longitude,
      location,
      start_date,
      end_date,
      uni_id,
      event_categories ? event_categories : null
    );

    return res.status(201).json({
      success: true,
      message: "University Event created successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Logic for Creating a Private RSO Event
export const createRSOEvent = async (req, res) => {
  try {
    // Get User Information through Middleware (JWT) and request headers
    const user_id = req.user;
    const { uni_id, rso_id } = req.params;
    const {
      event_name,
      description,
      latitude,
      longitude,
      location,
      start_date,
      end_date,
      event_categories,
    } = req.body;

    // Check for Required Body Info
    if (
      !event_name ||
      !description ||
      !latitude ||
      !longitude ||
      !start_date ||
      !end_date ||
      !location
    ) {
      const error = new Error(
        "One or more required fields missing. (event_name, description, latitude, longitude, start_date, end_date, location)"
      );

      error.statusCode = 403;
      throw error;
    }

    // Checks if User has Permision to Create Event
    const isAdmin = await isUserRole("admin", user_id);

    if (!isAdmin) {
      const error = new Error("User Unauthorized to Create a University Event");
      error.statusCode = 403;
      throw error;
    }

    // Insert University Event into DB
    await createRSOEventDB(
      event_name.trim().toLowerCase(),
      description,
      latitude,
      longitude,
      location,
      start_date,
      end_date,
      uni_id,
      rso_id,
      event_categories ? event_categories : null
    );

    return res.status(201).json({
      success: true,
      message: "University Event created successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
