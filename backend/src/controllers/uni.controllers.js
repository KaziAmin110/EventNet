import { supabase } from "../database/db.js";
import {
  createUniversityDB,
  isValidUniversity,
  getUniAllInfo,
  joinUniversityDB,
  getUniPhotoUrl,
  getUniversityDetails,
  isUniversityStudent,
  updateUniversityStudents,
  leaveUniversityDB,
  getUserUniversitiesDB,
  getJoinableUniversitiesDB,
  leaveUniRsosDB,
  checkUniversityExistence,
  getUniversityByAttribute,
} from "../services/uni.services.js";
import { getUserByAttribute, isUserRole } from "../services/users.services.js";

// Allows SuperAdmin to Create a new University Profile using the uni_name
export const createUniversityProfile = async (req, res) => {
  try {
    // Get User-Id From Access Token Using Bearer
    const user_id = req.user;
    const { uni_name, description, domain } = req.body;

    // Check for required body
    if (!uni_name || !description) {
      const error = new Error(
        "One or more required fields missing. (uni_name, description)"
      );
      error.statusCode = 403;
      throw error;
    }

    const [isSuperAdmin, existingEntry, uniData] = await Promise.all([
      isUserRole("super_admin", user_id),
      checkUniversityExistence(uni_name.trim().toLowerCase()),
      getUniversityDetails(uni_name),
    ]);

    if (!isSuperAdmin) {
      const error = new Error("User does not have SuperAdmin Status");
      error.statusCode = 403;
      throw error;
    }

    if (existingEntry) {
      const error = new Error("University Already Exists in DB");
      error.statusCode = 400;
      throw error;
    }

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
export const joinUniversity = async (req, res) => {
  try {
    // Get user_id from refresh token
    const user_id = req.user;
    const { uni_id } = req.params;

    const [user, university, isStudent] = await Promise.all([
      getUserByAttribute("id", user_id),
      getUniversityByAttribute("uni_id", uni_id),
      isUniversityStudent(user_id, uni_id),
    ]);

    // Checks whether user_id is valid
    if (!user) {
      const err = new Error("Join Unsuccessful - User not in Database");
      err.statusCode = 403;
      throw err;
    }
    // Checks whether uni_id is valid
    if (!university) {
      const err = new Error("Join Unsuccessful - University not in Database");
      err.statusCode = 403;
      throw err;
    }

    // Checks to see if User is already a student at that University
    if (isStudent) {
      const err = new Error(
        "Join Unsuccesful - User is already a student at the university"
      );
      err.statusCode = 400;
      throw err;
    }

    // Checks if User matches the email domain restriction of the university
    if (university.domain && university.domain !== user.email.split("@")[1]) {
      const err = new Error(
        "Join Unsuccesful - User Email Doesn't Match University Domain Restriction"
      );
      err.statusCode = 400;
      throw err;
    }

    // Join Uni by adding entry in student table
    await Promise.all([
      joinUniversityDB(user_id, uni_id, user.name, user.email),
      updateUniversityStudents(
        uni_id,
        university.num_students,
        "increment"
      ),
    ]);

    return res.status(201).json({
      success: true,
      message: "Joined University Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Returns a list of all universities. has optional page parameter
export const getAllUniversities = async (req, res) => {
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

// Returns information regarding one university
export const getUniversityInfo = async (req, res) => {
  try {
    const uni_id = req.params.uni_id;
    const university = await getUniAllInfo("uni_id", uni_id);

    if (!university) {
      const error = new Error("University with Given ID Doesnt Exist");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "University Info Gathered Successfully",
      data: {
        uni_id: university.id,
        uni_name: university.name,
        latitude: university.latitude,
        longitude: university.longitude,
        description: university.description,
        num_students: university.num_students,
        pictures: university.pictures,
        domain: university.domain,
      },
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Gets All Universities that a User is a student of
export const getUserUniversities = async (req, res) => {
  try {
    const user_id = req.user;

    // Extract Page Number from request or default to 1
    const page = parseInt(req.body.page) || 1;
    const pageSize = 10;

    // Calculation of Start and End Range for Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const uni_data = await getUserUniversitiesDB(user_id, start, end);

    return res.status(200).json({
      success: true,
      data: uni_data.data || [],
      pagination: {
        totalRecords: uni_data.count,
        totalPages: Math.ceil(uni_data.count / pageSize),
        currentPage: uni_data.count == 0 ? 0 : page,
        pageSize,
      },
      message: "User Joined Universities Returned Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Gets All Universities that a User can Join
export const getJoinableUniversities = async (req, res) => {
  try {
    const user_id = req.user;

    // Extract Page Number from request or default to 1
    const page = parseInt(req.body.page) || 1;
    const pageSize = 10;

    // Calculation of Start and End Range for Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const user = await getUserByAttribute("id", user_id);
    const uni_data = await getJoinableUniversitiesDB(
      user_id,
      user.email,
      start,
      end
    );

    return res.status(200).json({
      success: true,
      data: uni_data.data || [],
      pagination: {
        totalRecords: uni_data.count,
        totalPages: Math.ceil(uni_data.count / pageSize),
        currentPage: uni_data.count == 0 ? 0 : page,
        pageSize,
      },
      message: "User Joinable Universities Returned Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Allows User to leave a University and makes the necessary changes
export const leaveUniversity = async (req, res) => {
  try {
    // Get user_id from refresh token
    const user_id = req.user;
    const { uni_id } = req.params;

    const [user, university, isStudent] = await Promise.all([
      getUserByAttribute("id", user_id),
      getUniversityByAttribute("uni_id", uni_id),
      isUniversityStudent(user_id, uni_id),
    ]);

    // Checks whether user_id is valid
    if (!user) {
      const error = new Error("Join Unsuccessful - User not in Database");
      error.statusCode = 403;
      throw error;
    }
    // Checks whether uni_id is valid
    if (!university) {
      const error = new Error("Join Unsuccessful - University not in Database");
      error.statusCode = 403;
      throw error;
    }
    // Checks to see if User is already a student at that University
    if (!isStudent) {
      const error = new Error(
        "Leave Unsuccesful - User is not a student at the university"
      );
      error.statusCode = 400;
      throw error;
    }

    // Updates Necessary Tables for Leave University Operation
    await Promise.all([
      leaveUniversityDB(user_id, uni_id),
      updateUniversityStudents(uni_id, university.num_students, "decrement"),
      leaveUniRsosDB(user_id, uni_id),
    ]);

    return res.status(200).json({
      success: true,
      message: "User left University Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};
