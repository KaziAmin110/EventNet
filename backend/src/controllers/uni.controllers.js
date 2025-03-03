import { supabase } from "../database/db.js";
import {
  createUniversityDB,
  getUniByAttribute,
  joinUniversityDB,
  getUniPhotoUrl,
  getUniversityDetails,
  isUniversityStudent,
} from "../services/uni.services.js";
import { getUserByAttribute, isUserRole } from "../services/users.services.js";

// Allows SuperAdmin to Create a new University Profile using the uni_name
export const createUniversityProfile = async (req, res, next) => {
  try {
    // Get User-Id through refresh Token from Bearer
    const user_id = req.user;
    const { uni_name, description, domain } = req.body;

    // Verify SuperAdmin Status
    const isSuperAdmin = await isUserRole("super_admin", user_id);

    if (!isSuperAdmin) {
      const error = new Error("User does not have SuperAdmin Status");
      error.statusCode = 403;
      throw error;
    }

    // Check to See if University Already Exists in Database
    const existingEntry = await getUniByAttribute(
      "uni_name",
      uni_name.toLowerCase()
    );

    if (existingEntry) {
      const error = new Error("University Already Exists in DB");
      error.statusCode = 400;
      throw error;
    }

    const uniData = await getUniversityDetails(uni_name);

    if (!uniData) {
      const error = new Error(
        "Unable to get University Data Through Places API"
      );
      error.statusCode = 403;
      throw error;
    }
    const photoUrls = [];

    for (const reference of uniData.photos) {
      const url = await getUniPhotoUrl(reference);
      if (url) {
        photoUrls.push(url);
      }
    }
    // Insert University into DB
    await createUniversityDB(
      uni_name.toLowerCase(),
      uniData.latitude,
      uniData.longitude,
      description,
      photoUrls,
      domain
    );

    return res.status(201).json({
      success: true,
      message: "University created successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Allows User to join a University
export const joinUniversity = async (req, res, next) => {
  try {
    // Get user_id from refresh token
    const user_id = req.user;
    const { uni_id } = req.body;

    const user = await getUserByAttribute("id", user_id);

    if (!user) {
      const error = new Error("Join Unsuccessful - User not in Database");
      error.statusCode = 403;
      throw error;
    }

    // Checks to see if User is already a student at that University
    const isStudent = await isUniversityStudent(user_id, uni_id);

    if (isStudent) {
      const error = new Error(
        "Join Unsuccesful - User is already a student at the university"
      );
      error.statusCode = 400;
      throw error;
    }

    // Join Uni by adding entry in student table
    await joinUniversityDB(user_id, uni_id, user.name, user.email);

    return res.status(201).json({
      success: true,
      message: "Joined University Successfully",
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

// Returns a list of all universities. has optional page parameter
export const getAllUniversities = async (req, res, next) => {
  try {
    // Extract Page Number from request or default to 1
    const page = parseInt(req.body.page) || 1;
    const pageSize = 10;

    // Calculation of Start and End Range for Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // Fetch Data with pagination
    const { data, error, count } = await supabase
      .from("university")
      .select("*", { count: "exact" })
      .range(start, end);

    if (error) {
      throw new Error(error.message);
    }
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: page,
        pageSize,
      },
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

export const getUniversityInfo = async (req, res, next) => {
  try {
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};
