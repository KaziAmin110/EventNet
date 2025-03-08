import { RSO_SECRET } from "../../config/env.js";
import {
  addRsoAsPendingDB,
  isRSOAlreadyPending,
  sendInvitationEmail,
  getRsoByAttribute,
  addRSOInviteDB,
  isRSOMember,
  leaveRsoDB,
  updateRsoMembers,
  getAllRsosDB,
  joinRsoDB,
  updateRsoStatus,
} from "../services/rso.services.js";
import {
  isUniversityStudent,
  getUniByAttribute,
  getStudentByAttribute,
} from "../services/uni.services.js";
import {
  createAdmin,
  getAdminByAttribute,
  getUserByAttribute,
} from "../services/users.services.js";
import jwt from "jsonwebtoken";

// Allows Student to create a pending RSO
export const createRSO = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { uni_id } = req.params;
    const { rso_name } = req.body;

    const university = await getUniByAttribute("uni_id", uni_id);
    const isStudent = await isUniversityStudent(user_id, uni_id);
    const isPending = await isRSOAlreadyPending(rso_name, uni_id);
    const user = await getUserByAttribute("id", user_id);

    // Checks whether uni_id is valid
    if (!university) {
      const error = new Error("Create RSO Failed - University not in Database");
      error.statusCode = 403;
      throw error;
    }
    // Checks to see if User is already a student at that University
    if (!isStudent) {
      const error = new Error(
        "Create RSO Failed - User is not a student at the university"
      );
      error.statusCode = 400;
      throw error;
    }

    // Checks if RSO Creation Request is Already Pending
    if (isPending) {
      const error = new Error(
        "Create RSO Failed - RSO Request already pending"
      );
      error.statusCode = 400;
      throw error;
    }

    const admin_id = await createAdmin(
      user_id,
      user.name,
      user.email,
      uni_id,
      "pending"
    );

    const data = await addRsoAsPendingDB(admin_id, uni_id, rso_name);

    return res.status(201).json({
      success: true,
      message: "Added Pending RSO Successfully",
      data,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Invites a User to join a RSO through an accept-token sent to the User's Email
export const inviteToRSO = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { rso_id, uni_id } = req.params;
    const { inviteeEmail } = req.body;

    const invitee = await getStudentByAttribute("email", inviteeEmail);
    const rso = await getRsoByAttribute("rso_id", rso_id);
    const admin = await getAdminByAttribute("user_id", user_id);

    // Check Existence of RSO and Invitee
    if (!rso) {
      const error = new Error("Invitation Error - Not a valid RSO");
    }

    if (!invitee) {
      const error = new Error(
        "Invitation Error - Invitee is not associated with a university"
      );
      error.statusCode = 400;
      throw error;
    }

    if (!admin) {
      const error = new Error("Invitation Error - User is not an admin");
      error.statusCode = 400;
      throw error;
    }

    // Checks if User is an admin of the rso
    if (admin.admin_id !== rso.admin_id) {
      const error = new Error(
        "Invitation Error - User does not have admin access for the RSO"
      );
      error.statusCode = 403;
      throw error;
    }

    // Checks if invitee attends the same university as rso
    if (uni_id !== invitee.uni_id) {
      const error = new Error(
        "Invitation Error - Invitee does not attend RSO host university"
      );
      error.statusCode = 403;
      throw error;
    }

    // Sending Accept Link Logic
    await addRSOInviteDB(invitee.user_id, rso_id, "pending", user_id, rso_id);
    await sendInvitationEmail(
      inviteeEmail,
      rso.rso_name,
      invitee.user_id,
      rso_id
    );

    return res.status(200).json({
      success: true,
      message: "Join RSO Email Sent Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Allows a Student to Join an RSO using an RSO accept-token
export const joinRSO = async (req, res, next) => {
  try {
    const { accept_token } = req.body;

    if (!accept_token) {
      const error = new Error(
        "Join Unsuccessful - 'accept-token' not sent in request body"
      );
      error.statusCode = 400;
      throw error;
    }

    const decoded = jwt.verify(accept_token, RSO_SECRET);
    const { user_id, rso_id } = decoded;

    const user = await getUserByAttribute("id", user_id);
    const rso = await getRsoByAttribute("rso_id", rso_id);
    const isMember = await isRSOMember(user_id, rso_id);

    // Checks whether user_id is valid
    if (!user) {
      const error = new Error("Join Unsuccessful - User not in Database");
      error.statusCode = 403;
      throw error;
    }
    // Checks whether uni_id is valid
    if (!rso) {
      const error = new Error("Join Unsuccessful - RSO not in Database");
      error.statusCode = 403;
      throw error;
    }

    // Checks to see if User is already a member of the RSO
    if (isMember) {
      const error = new Error(
        "Join Unsuccesful - User is already a member of the RSO"
      );
      error.statusCode = 400;
      throw error;
    }

    // Join Uni by adding entry in student table
    await joinRsoDB(user_id, rso_id);
    rso.num_members = await updateRsoMembers(
      rso_id,
      rso.num_members,
      "increment"
    );

    // If RSO is now valid (4 Members)
    if (rso.num_members === 4) {
      await updateRsoStatus(rso_id, "valid");
    }

    return res.status(201).json({
      success: true,
      message: "Joined RSO Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Gets ALL RSO's at a Given University
export const getAllRSOs = async (req, res, next) => {
  try {
    const user = req.user;
    const { uni_id } = req.params;

    // Extract Page Number from request or default to 1
    const page = parseInt(req.body.page) || 1;
    const pageSize = 10;

    // Calculation of Start and End Range for Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    const rsoInfo = await getAllRsosDB(uni_id, start, end);

    return res.status(200).json({
      success: true,
      data: rsoInfo.data,
      pagination: data.pagination,
      message: "RSOs Information Returned Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Allows a RSO Member to Leave an RSO
export const leaveRSO = async (req, res, next) => {
  try {
    // Get user_id from refresh token
    const user_id = req.user;
    const { rso_id } = req.params;

    const user = await getUserByAttribute("id", user_id);
    const rso = await getRsoByAttribute("rso_id", rso_id);
    const isMember = await isRSOMember(user_id, rso_id);

    // Checks whether user_id is valid
    if (!user) {
      const error = new Error("Join Unsuccessful - User not in Database");
      error.statusCode = 403;
      throw error;
    }
    // Checks whether uni_id is valid
    if (!rso) {
      const error = new Error("Join Unsuccessful - RSO not in Database");
      error.statusCode = 403;
      throw error;
    }
    // Checks to see if User is already a student at that University
    if (!isMember) {
      const error = new Error(
        "Leave Unsuccesful - User is not a member of the given RSO"
      );
      error.statusCode = 400;
      throw error;
    }

    // Leave Uni by removing entry from student table
    await leaveRsoDB(user_id, rso_id);
    await updateRsoMembers(rso_id, rso.num_members, "decrement");

    return res.status(200).json({
      success: true,
      message: "User left RSO Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};
