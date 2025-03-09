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
  updateInviteStatus,
  getUserRsoDB,
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
    let admin = await getAdminByAttribute("user_id", user_id);

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

    // Makes User into an Admin if not already an Admin
    if (!admin) {
      admin = await createAdmin(user_id, user.name, user.email, uni_id);
    }

    const data = await addRsoAsPendingDB(admin.admin_id, uni_id, rso_name);
    await joinRsoDB(user_id, data.rso_id);

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

    if (!invitee) {
      const error = new Error(
        "Invitation Error - Invitee is not associated with a university"
      );
      error.statusCode = 400;
      throw error;
    }

    // Check Existence of RSO and Invitee
    if (!rso) {
      const error = new Error("Invitation Error - Not a valid RSO");
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
    if (uni_id != invitee.uni_id) {
      const error = new Error(
        "Invitation Error - Invitee does not attend RSO host university"
      );
      error.statusCode = 403;
      throw error;
    }

    // Create Invite Token and Expire Date (7 Days)
    const expire_date = new Date();
    expire_date.setDate(expire_date.getDate() + 7);

    const inviteeId = invitee.user_id;
    const inviteToken = jwt.sign({ inviteeId, rso_id }, RSO_SECRET, {
      expiresIn: "7d", // Token Expires in 7 Days
    });

    // Sending Accept Link Logic
    await addRSOInviteDB(invitee.user_id, rso_id, "pending");
    await sendInvitationEmail(
      inviteeEmail,
      rso.rso_name,
      invitee.user_id,
      rso_id,
      inviteToken
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
    const { inviteeId, rso_id } = decoded;

    const user = await getUserByAttribute("id", inviteeId);
    const rso = await getRsoByAttribute("rso_id", rso_id);
    const isMember = await isRSOMember(inviteeId, rso_id);

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
    await joinRsoDB(inviteeId, rso_id);
    await updateInviteStatus(rso_id, inviteeId, "accepted");
    rso.num_members = await updateRsoMembers(
      rso_id,
      rso.num_members,
      "increment"
    );

    // Update RSO Status If RSO is now valid (4 Members)
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
    const { uni_id } = req.params;

    // Extract Page Number from request or default to 1
    const page = parseInt(req.body.page) || 1;
    const pageSize = 10;

    // Calculation of Start and End Range for Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    const rsoInfo = await getAllRsosDB(uni_id, start, end, page, pageSize);

    return res.status(200).json({
      success: true,
      data: rsoInfo.data,
      pagination: rsoInfo.pagination,
      message: "University RSOs Returned Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Gets All RSOs that a User is a member of
export const getUserRSOs = async (req, res, next) => {
  try {
    const user_id = req.user;
    const rso_data = await getUserRsoDB(user_id);
    const rso_details = [];

    if (rso_data && rso_data.length > 0) {
      for (const rso of rso_data) {
        const rso_id = rso.rso_id;
        try {
          const rso_detail = await getRsoByAttribute("rso_id", rso_id);
          if (rso_detail) {
            rso_details.push(rso_detail);
          }
        } catch (err) {
          console.error(`Error fetching RSO Details of rso_id:${rso_id}`, err);
        }
      }
    }
    return res.status(200).json({
      success: true,
      data: rso_details,
      message: "User RSO Details Returned Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Gets RSO Info Based on the provided rso_id
export const getRSOInfo = async (req, res, next) => {
  try {
    const user_id = req.user;
    const rso_id = req.params.rso_id;
    const rso = await getRsoByAttribute("rso_id", rso_id);
    const isMember = await isRSOMember(user_id, rso_id);

    if (!rso) {
      const error = new Error("RSO with Given ID Doesnt Exist in the DB");
      error.statusCode = 404;
      throw error;
    }

    if (!isMember) {
      const error = new Error(
        "Get RSO Info Failed - User is not a member of the RSO"
      );
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "RSO Info Gathered Successfully",
      data: {
        rso_id: rso.rso_id,
        rso_name: rso.rso_name,
        admin_id: rso.admin_id,
        num_members: rso.num_members,
        uni_id: rso.uni_id,
        status: rso.rso_status,
      },
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
    await updateInviteStatus(rso_id, user_id, "pending");

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
