import { isRSOAdmin } from "../services/rso.services.js";
import {
  createUniversityEventDB,
  createRSOEventDB,
  createPublicEventRequestDB,
  createUserComment,
  createUserRating,
  createNewAverageRatingToEvents,
  createEventDB,
  approvePublicEventDB,
  getPublicEventsWithStatusDB,
  getEventInfoDB,
  getEventCommentsDB,
  getUserEventCommentsDB,
  getNonUserEventCommentsDB,
  isValidUserEvent,
  isValidUserComment,
  isEventConflict,
  updateCommentsInEventsDB,
  updateEventCommentDB,
  deleteEventCommentDB,
} from "../services/events.services.js";
import { isUniversityAdmin } from "../services/uni.services.js";
import { isUserRole } from "../services/users.services.js";
import {
  isValidEmailFormat,
  isValidPhoneFormat,
} from "../services/auth.services.js";

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
      contact_phone,
      contact_email,
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

    // Check valid phone and email formats if they exist
    if (contact_phone && !isValidPhoneFormat(contact_phone)) {
      const error = new Error(
        "Invalid Phone Format: String must only contain digits (0-9) and must contain 10 values."
      );
      error.statusCode = 400;
      throw error;
    }

    if (contact_email && !isValidEmailFormat(contact_email)) {
      const error = new Error(
        "Invalid Email Format: Email must be in the form <string@astring.string>"
      );
      error.statusCode = 400;
      throw error;
    }

    // Checks to see if Event Time and Location Conflicts with Existing Events
    const isConflict = await isEventConflict(location, start_date, end_date);

    if (isConflict) {
      const error = new Error(
        "Event Time and Location Conflicts with Existing Event"
      );
      error.statusCode = 400;
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
    const event_id = await createEventDB(
      event_name.trim().toLowerCase(),
      description,
      latitude,
      longitude,
      location,
      start_date,
      end_date,
      event_categories,
      "university",
      contact_phone,
      contact_email
    );

    await createUniversityEventDB(event_id, user_id, uni_id);

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
      contact_phone,
      contact_email,
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

    // Check valid phone and email formats if they exist
    if (contact_phone && !isValidPhoneFormat(contact_phone)) {
      const error = new Error(
        "Invalid Phone Format: String must only contain digits (0-9) and must contain 10 values."
      );
      error.statusCode = 400;
      throw error;
    }

    if (contact_email && !isValidEmailFormat(contact_email)) {
      const error = new Error(
        "Invalid Email Format: Email must be in the form <string@astring.string>"
      );
      error.statusCode = 400;
      throw error;
    }

    // Checks to see if Event Time and Location Conflicts with Existing Events
    const isConflict = await isEventConflict(location, start_date, end_date);

    if (isConflict) {
      const error = new Error(
        "Event Time and Location Conflicts with Existing Event"
      );
      error.statusCode = 400;
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
    const event_id = await createEventDB(
      event_name.trim().toLowerCase(),
      description,
      latitude,
      longitude,
      location,
      start_date,
      end_date,
      event_categories,
      "rso",
      contact_phone,
      contact_email
    );
    await createRSOEventDB(uni_id, user_id, rso_id, event_id);

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
      contact_phone,
      contact_email,
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

    // Check valid phone and email formats if they exist
    if (contact_phone && !isValidPhoneFormat(contact_phone)) {
      const error = new Error(
        "Invalid Phone Format: String must only contain digits (0-9) and must contain 10 values."
      );
      error.statusCode = 400;
      throw error;
    }

    if (contact_email && !isValidEmailFormat(contact_email)) {
      const error = new Error(
        "Invalid Email Format: Email must be in the form <string@astring.string>"
      );
      error.statusCode = 400;
      throw error;
    }

    // Checks to see if Event Time and Location Conflicts with Existing Events
    const isConflict = await isEventConflict(location, start_date, end_date);

    if (isConflict) {
      const error = new Error(
        "Event Time and Location Conflicts with Existing Event"
      );
      error.statusCode = 400;
      throw error;
    }

    // Insert University Event into DB
    const event_id = await createEventDB(
      event_name.trim().toLowerCase(),
      description,
      latitude,
      longitude,
      location,
      start_date,
      end_date,
      event_categories ? event_categories : null,
      "public",
      contact_phone,
      contact_email
    );

    await createPublicEventRequestDB(user_id, event_id);

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

// Logic for Adding a Comment to an Event
export const createEventComment = async (req, res) => {
  try {
    const user_id = req.user;
    const { event_id } = req.params;
    const { text } = req.body;

    // Check for Required Body Info
    if (!text) {
      const error = new Error("One or more required fields missing (text)");
      error.statusCode = 403;
      throw error;
    }

    // Check to see if User can comment on this event
    const isValidEvent = await isValidUserEvent(user_id, event_id);

    if (!isValidEvent) {
      const error = new Error("User not Authorized to Comment on Event");
      error.statusCode = 403;
      throw error;
    }

    // Add Comment into DB Tables events and comments
    await createUserComment(event_id, user_id, text);
    const event_comments = await getEventCommentsDB(event_id);
    await updateCommentsInEventsDB(event_id, event_comments);

    return res.status(201).json({
      success: true,
      message: "Event Comment Added Successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Logic for Adding a Rating to an Event
export const createEventRating = async (req, res) => {
  try {
    const user_id = req.user;
    const { event_id } = req.params;
    const { rating } = req.body;

    // Check for Required Body Info
    if (!rating) {
      const error = new Error("One or more required fields missing (rating)");
      error.statusCode = 403;
      throw error;
    }

    // Check to see if User can comment on this event
    const isValidEvent = await isValidUserEvent(user_id, event_id);
    if (!isValidEvent) {
      const error = new Error("User not Authorized to Give Rating on Event");
      error.statusCode = 403;
      throw error;
    }

    // Add Rating into DB Tables events and ratings

    await createUserRating(event_id, user_id, rating);
    await createNewAverageRatingToEvents(event_id);

    return res.status(201).json({
      success: true,
      message: "Event Rating Added Successfully",
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
      data: result,
      message: "Gathered Pending Public Events Successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Logic for Getting Individual Event Info
export const getEventInfo = async (req, res) => {
  try {
    const user_id = req.user;
    const { event_id } = req.params;

    // Checks if User has Permission to View Event
    const isUserEvent = await isValidUserEvent(user_id, event_id);
    if (!isUserEvent) {
      const err = new Error("User does not have permission to view event");
      err.statusCode = 403;
      throw err;
    }

    // Get Event Info From DB
    const result = await getEventInfoDB(event_id);
    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }

    // Success Response
    return res.status(200).json({
      success: true,
      data: result,
      message: "Gathered Event Info Successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Logic for Getting All User Comments of an Individual Event
export const getUserEventComments = async (req, res) => {
  try {
    const user_id = req.user;
    const { event_id } = req.params;

    // Checks if User has Permission to View Event
    const isUserEvent = await isValidUserEvent(user_id, event_id);
    if (!isUserEvent) {
      const err = new Error("User does not have permission to view event");
      err.statusCode = 403;
      throw err;
    }

    // Get Event Info From DB
    const userComments = await getUserEventCommentsDB(user_id, event_id);
    if (userComments.error) {
      return res
        .status(userComments.status)
        .json({ success: false, message: userComments.error });
    }

    // Success Response
    return res.status(200).json({
      success: true,
      data: userComments,
      message: "Gathered User Event Comments Successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Logic for Getting All Comments of an Individual Event
export const getEventComments = async (req, res) => {
  try {
    const user_id = req.user;
    const { event_id } = req.params;

    // Checks if User has Permission to View Event
    const isUserEvent = await isValidUserEvent(user_id, event_id);
    if (!isUserEvent) {
      const err = new Error("User does not have permission to view event");
      err.statusCode = 403;
      throw err;
    }

    // Get Event Info From DB
    const [userComments, nonUserComments] = await Promise.all([
      getUserEventCommentsDB(user_id, event_id),
      getNonUserEventCommentsDB(user_id, event_id),
    ]);

    if (userComments.error) {
      return res
        .status(userComments.status)
        .json({ success: false, message: userComments.error });
    }

    if (nonUserComments.error) {
      return res
        .status(nonUserComments.status)
        .json({ success: false, message: nonUserComments.error });
    }

    // Success Response
    return res.status(200).json({
      success: true,
      data: [...userComments, ...nonUserComments],
      message: "Gathered User Event Comments Successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Logic for Updating a Comment on an Event
export const updateEventComment = async (req, res) => {
  try {
    const user_id = req.user;
    const { event_id, comment_id } = req.params;
    const { text } = req.body;

    // Verify User Permission to Access Event and Event Comment
    const isUserEvent = await isValidUserEvent(user_id, event_id);

    if (!isUserEvent) {
      const error = new Error("User Does Not Have Access to this Event");
      error.statusCode = 403;
      throw error;
    }

    const isUserComment = await isValidUserComment(user_id, comment_id);

    if (!isUserComment) {
      const error = new Error(
        "User Does Not Have Permission to Access Comment"
      );
      error.statusCode = 403;
      throw error;
    }

    // Updates Event in Comments Table and Updates Events Table
    await updateEventCommentDB(comment_id, text);
    const event_comments = await getEventCommentsDB(event_id);
    await updateCommentsInEventsDB(event_id, event_comments);

    return res.status(200).json({
      status: true,
      message: "Comment Updated Successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: false,
      message: error.message,
    });
  }
};

// Logic for Deleting a Comment on an Event
export const deleteEventComment = async (req, res) => {
  try {
    const user_id = req.user;
    const { event_id, comment_id } = req.params;

    // Verify User Permission to Access Event and Event Comment
    const isUserEvent = await isValidUserEvent(user_id, event_id);

    if (!isUserEvent) {
      const error = new Error("User Does Not Have Access to this Event");
      error.statusCode = 403;
      throw error;
    }

    const isUserComment = await isValidUserComment(user_id, comment_id);

    if (!isUserComment) {
      const error = new Error(
        "User Does Not Have Permission to Access Comment"
      );
      error.statusCode = 403;
      throw error;
    }

    // Removes Event from Comments Table and Updates Events Table
    await deleteEventCommentDB(comment_id);
    const event_comments = await getEventCommentsDB(event_id);
    await updateCommentsInEventsDB(event_id, event_comments);

    return res.status(200).json({
      status: true,
      message: "Comment Deleted Successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: false,
      message: error.message,
    });
  }
};
