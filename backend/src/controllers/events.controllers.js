import { isRSOAdmin } from "../services/rso.services.js";
import {
  createUniversityEventDB,
  createRSOEventDB,
  createPublicEventRequestDB,
  approvePublicEventDB,
  getPublicEventsWithStatusDB,
  createEventDB,
} from "../services/events.services.js";
import { isUniversityAdmin } from "../services/uni.services.js";
import { isUserRole } from "../services/users.services.js";

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
    const isAdmin = await isUniversityAdmin(user_id, uni_id);

    if (!isAdmin) {
      const error = new Error("User is not authorized to create event");
      error.statusCode = 403;
      throw error;
    }

    // Insert University Event into DB
    const event_id = await createEventDB(event_name);

    await createUniversityEventDB(
      event_name.trim().toLowerCase(),
      description,
      latitude,
      longitude,
      location,
      start_date,
      end_date,
      uni_id,
      user_id,
      event_categories ? event_categories : null,
      event_id
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
    const isAdmin = await isRSOAdmin(user_id, rso_id);

    if (!isAdmin) {
      const error = new Error("User Unauthorized to Create a RSO Event");
      error.statusCode = 403;
      throw error;
    }

    // Insert University Event into DB
    const event_id = await createEventDB(event_name);
    await createRSOEventDB(
      event_name.trim().toLowerCase(),
      description,
      latitude,
      longitude,
      location,
      start_date,
      end_date,
      uni_id,
      user_id,
      rso_id,
      event_categories ? event_categories : null,
      event_id
    );

    return res.status(201).json({
      success: true,
      message: "RSO Event created successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Logic for Creating a Public Event Request
export const createPublicEvent = async (req, res) => {
  try {
    const user_id = req.user;
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

    // Insert University Event into DB
    const event_id = await createEventDB(event_name);
    await createPublicEventRequestDB(
      event_name.trim().toLowerCase(),
      description,
      latitude,
      longitude,
      location,
      start_date,
      end_date,
      user_id,
      event_categories ? event_categories : null,
      event_id
    );

    return res.status(201).json({
      success: true,
      message: "Public Event Request Created Successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Logic for SuperAdmin to Approve a Public Event
export const approvePublicEvent = async (req, res) => {
  try {
    const user_id = req.user;
    const { event_id } = req.params;

    // Checks if User has Permision to Create Event
    const isSuperAdmin = await isUserRole("super_admin", user_id);

    if (!isSuperAdmin) {
      const error = new Error(
        "User Is Not Authorized to Approve Public Events"
      );
      error.statusCode = 403;
      throw error;
    }

    // Approve Public Event in DB
    const result = await approvePublicEventDB(event_id);

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }
    return res.status(200).json({
      success: true,
      message: "Public Event Approved Successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Logic for Getting All Pending Public Events
export const getPendingPublicEvents = async (req, res) => {
  try {
    const user_id = req.user;

    // Checks if User has Permision to Create Event
    const isSuperAdmin = await isUserRole("super_admin", user_id);

    if (!isSuperAdmin) {
      const error = new Error("User Is Not Authorized to Get Public Events");
      error.statusCode = 403;
      throw error;
    }

    // Get Pending Public Events from DB
    const result = await getPublicEventsWithStatusDB("pending");

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }
    return res.status(200).json({
      success: true,
      data: result.data,
      message: "Public Event Approved Successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
