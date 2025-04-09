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
  getAllRSOMembers,
  getNewRsoAdmin,
  updateRsosAdmin,
  updateRsoEventsAdmin,
  getRsoInvitesData,
  isRSOAdmin,
  isUserAlreadyInvited,
  isUniversityRSO,
  removeInviteStatus,
} from "../services/rso.services.js";
import {
  isUniversityStudent,
  isValidUniversity,
  getStudentByAttribute,
} from "../services/uni.services.js";
import {
  createAdmin,
  deleteAdmin,
  getAdminByAttribute,
  getUserByAttribute,
} from "../services/users.services.js";
import jwt from "jsonwebtoken";
import redisClient from "../../config/redis.config.js";
import { emailQueue } from "../queues/email.queue.js";
import {
  deleteEventFromDB,
  deleteRSOEventsFromDB,
} from "../services/events.services.js";

const VALID_MEMBER_NUMBER = 5;

// Allows Student to create a pending RSO
export const createRSO = async (req, res) => {
  try {
    const user_id = req.user;
    const { uni_id } = req.params;
    const { rso_name } = req.body;
    let admin;

    const [university, isStudent, isPending, user, adminResult] =
      await Promise.all([
        isValidUniversity(uni_id),
        isUniversityStudent(user_id, uni_id),
        isRSOAlreadyPending(rso_name, uni_id),
        getUserByAttribute("id", user_id),
        getAdminByAttribute("user_id", user_id),
      ]);

    admin = adminResult; // Assign the resolved value to admin
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
        "Create RSO Failed - RSO Request Is Already Pending"
      );
      error.statusCode = 400;
      throw error;
    }

    // Makes User into an Admin if not already an Admin
    if (!admin) {
      admin = await createAdmin(user_id, user.name, user.email, uni_id);
    }

    // **Check if admin.admin_id exists before using it**
    if (!admin || !admin.admin_id) {
      throw new Error("Create RSO Failed - Admin Value Null (Backend Issue)");
    }

    const data = await addRsoAsPendingDB(
      admin.admin_id,
      uni_id,
      rso_name,
      user_id
    );

    await joinRsoDB(user_id, data.rso_id, uni_id);

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

// Invites a User to join a RSO by sending an accept-token to the User's Email
export const inviteToRSO = async (req, res) => {
  try {
    const user_id = req.user;
    const { rso_id, uni_id } = req.params;
    const { inviteeEmail } = req.body;

    const [invitee, rso] = await Promise.all([
      getStudentByAttribute(inviteeEmail, uni_id),
      getRsoByAttribute("rso_id", rso_id),
    ]);

    if (!invitee) {
      const error = new Error("Invitee does not attend RSO host university");
      error.statusCode = 403;
      throw error;
    }

    // Check Existence of RSO and Invitee
    if (!rso) {
      const error = new Error("Invalid RSO");
    }

    // Checks if User is an admin of the rso
    if (user_id !== rso.admin_user_id) {
      const error = new Error("User is not RSO admin");
      error.statusCode = 403;
      throw error;
    }

    // Checks to see if User is already part of the rso
    const [isAlreadyInvited, isMember] = await Promise.all([
      isUserAlreadyInvited(invitee.user_id, rso_id),
      isRSOMember(invitee.user_id, rso_id),
    ]);

    // Checks to See if User Has Already Been Invited
    if (isAlreadyInvited) {
      const error = new Error(
        "Invite to RSO Failed: User Invite Already Pending."
      );
      error.statusCode = 400;
      throw error;
    }

    if (isMember) {
      const error = new Error("Invitee is already part of the RSO");
      error.statusCode = 400;
      throw error;
    }

    // Generate Invite Token
    const inviteToken = jwt.sign(
      { inviteeId: invitee.user_id, rso_id },
      RSO_SECRET,
      {
        expiresIn: "7d", // Token Expires in 7 Days
      }
    );
    // Save to DB & Send Email in Parallel
    await Promise.all([
      addRSOInviteDB(invitee.user_id, rso_id, "pending"),
      sendInvitationEmail(inviteeEmail, rso.rso_name, inviteToken),
    ]);

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
export const joinRSOFromInvite = async (req, res) => {
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

    const [user, rso, isMember] = await Promise.all([
      getUserByAttribute("id", inviteeId),
      getRsoByAttribute("rso_id", rso_id),
      isRSOMember(inviteeId, rso_id),
    ]);

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
    const [, , newMemberCount] = await Promise.all([
      joinRsoDB(inviteeId, rso_id, rso.uni_id),
      updateInviteStatus(rso_id, inviteeId, "accepted"),
      updateRsoMembers(rso_id, rso.num_members, "increment"),
    ]);

    // Update RSO Status If RSO is now valid
    if (newMemberCount === VALID_MEMBER_NUMBER) {
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

// Allows a Student to Join an RSO using an RSO accept-token
export const joinRSOFromId = async (req, res) => {
  try {
    const user_id = req.user;
    const { uni_id, rso_id } = req.params;

    const [isUniversity, isStudent, rso, isMember] = await Promise.all([
      isValidUniversity(uni_id),
      isUniversityStudent(user_id, uni_id),
      getRsoByAttribute("rso_id", rso_id),
      isRSOMember(user_id, rso_id),
    ]);

    // Checks whether uni_id is valid and rso_id
    if (!isUniversity) {
      const error = new Error("Join Unsuccessful - University not in Database");
      error.statusCode = 403;
      throw error;
    }

    if (!isStudent) {
      const error = new Error(
        "Join Unsuccessful - User is not a student at university"
      );
      error.statusCode = 403;
      throw error;
    }

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
    const [, , newMemberCount] = await Promise.all([
      joinRsoDB(user_id, rso_id, uni_id),
      updateInviteStatus(rso_id, user_id, "accepted"),
      updateRsoMembers(rso_id, rso.num_members, "increment"),
    ]);

    // Update RSO Status If RSO is now valid
    if (newMemberCount === VALID_MEMBER_NUMBER) {
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
export const getAllRSOs = async (req, res) => {
  try {
    const { uni_id } = req.params;

    // Extract Page Number from request or default to 1
    const page = parseInt(req.body.page) || 1;
    const pageSize = 10;

    // Calculation of Start and End Range for Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // Generate cache key based on uni_id, page, and pagination range
    const cacheKey = `rsos:uni:${uni_id}:page:${page}:start:${start}:end:${end}`;

    // Check if the data is cached in Redis
    const cachedRsos = await redisClient.get(cacheKey);
    if (cachedRsos !== null) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedRsos).data,
        pagination: JSON.parse(cachedRsos).pagination,
        message: "University RSOs Retrieved from Cache",
      });
    }

    // Fetch data from the database if not found in cache
    const rsoInfo = await getAllRsosDB(uni_id, start, end, page, pageSize);

    // Cache the result in Redis with 5 minutes expiration
    await redisClient.set(cacheKey, JSON.stringify(rsoInfo), "EX", 300); // 5 minutes expiration

    // Return the fetched data in the response
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
export const getUserRSOs = async (req, res) => {
  try {
    const user_id = req.user;
    const rso_data = await getUserRsoDB(user_id);
    const rso_details = [];

    if (rso_data && rso_data.length > 0) {
      for (const rso of rso_data) {
        const rso_id = rso.rso_id;
        try {
          const rso_detail = await getRsoByAttribute("rso_id", rso_id);
          const members = await getAllRSOMembers(rso_id);

          rso_detail.members = members;
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
export const getRSOInfo = async (req, res) => {
  try {
    const { uni_id, rso_id } = req.params;

    // Check if RSO is valid and can be accessed by User
    const [university, rso] = await Promise.all([
      isValidUniversity(uni_id),
      getRsoByAttribute("rso_id", rso_id),
    ]);

    if (!university) {
      const error = new Error(
        "Get RSO Info Failed - University not in Database"
      );
      error.statusCode = 400;
      throw error;
    }
    if (!rso) {
      const error = new Error("RSO with Given ID Doesnt Exist in the DB");
      error.statusCode = 404;
      throw error;
    }

    // Prepare the RSO info object to return
    rso.members = await getAllRSOMembers(rso_id);

    return res.status(200).json({
      success: true,
      message: "RSO Info Gathered Successfully",
      data: rso,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Gets RSO Info Based on the provided rso_id
export const getRSOInvites = async (req, res) => {
  try {
    const user_id = req.user;
    const { uni_id, rso_id } = req.params;

    // Check if RSO is valid and can be accessed by User
    const [university, rso, isAdmin] = await Promise.all([
      isValidUniversity(uni_id),
      getRsoByAttribute("rso_id", rso_id),
      isRSOAdmin(user_id, rso_id),
    ]);

    if (!university) {
      const error = new Error(
        "Get RSO Invites Failed - University not in Database"
      );
      error.statusCode = 400;
      throw error;
    }
    if (!rso) {
      const error = new Error("RSO with Given ID Doesnt Exist in the DB");
      error.statusCode = 404;
      throw error;
    }

    if (!isAdmin) {
      const error = new Error(
        "User Does Not have Permission to Access RSO Invites"
      );
      error.statusCode = 404;
      throw error;
    }

    // Prepare the RSO info object to return
    const result = await getRsoInvitesData(rso_id);

    return res.status(200).json({
      success: true,
      message: "RSO Invites Gathered Successfully",
      data: result,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

// Logic for RSO Member Leaving an RSO
export const leaveRSO = async (req, res) => {
  try {
    // Get user_id from refresh token
    const user_id = req.user;
    const { uni_id, rso_id } = req.params;

    const [isStudent, rso, isUniRSO, isMember] = await Promise.all([
      isUniversityStudent(user_id, uni_id),
      getRsoByAttribute("rso_id", rso_id),
      isUniversityRSO(uni_id, rso_id),
      isRSOMember(user_id, rso_id),
    ]);

    // Checks whether RSO Request Data is Valid
    if (!isStudent) {
      const error = new Error(
        "Leave RSO Unsuccessful - University not in Database"
      );
      error.statusCode = 403;
      throw error;
    }

    if (!rso) {
      const error = new Error("Leave RSO Unsuccessful - RSO not in Database");
      error.statusCode = 403;
      throw error;
    }

    if (!isUniRSO) {
      const error = new Error(
        "Leave RSO Unsuccessful - RSO is not part of given university"
      );
      error.statusCode = 403;
      throw error;
    }

    // Checks to see If User is a member of the RSO
    if (!isMember) {
      const error = new Error(
        "Leave RSO Unsuccesful - User is not a member of the given RSO"
      );
      error.statusCode = 400;
      throw error;
    }

    // Removes User from joins_rso, rso member_count is decremented, Invites_rso Status Updated
    const [__, newMemberCount, _] = await Promise.all([
      leaveRsoDB(user_id, rso_id),
      updateRsoMembers(rso_id, rso.num_members, "decrement"),
      removeInviteStatus(rso_id, user_id),
    ]);

    // Deletes RSO and RSO Event Fields If New Member Count is Zero
    if (newMemberCount === 0) {
      [_, removed_events_result] = await Promise.all([
        deleteRSOFromDB(rso_id),
        deleteRSOEventsFromDB(rso_id),
      ]);

      const removed_events = removed_events_result;

      // Removes Each Removed Event from Rso_Events from Events Table
      const deleteEventPromises = removed_events.map(async (removed_event) => {
        return deleteEventFromDB(removed_event.event_id);
      });

      await Promise.all(deleteEventPromises);
    } else {
      // Updates RSO Status If RSO is now invalid
      if (newMemberCount < VALID_MEMBER_NUMBER) {
        await updateRsoStatus(rso_id, "pending");
      }

      // Handles Logic for Reassiging Admin Role, If User is Admin
      if (rso.admin_user_id === user_id) {
        // Admin Role Reassignment Logic
        const new_admin_user_id = getNewRsoAdmin(rso_id);
        const new_user = await getUserByAttribute("id", new_admin_user_id);

        const new_admin_id = await createAdmin(
          new_user.id,
          new_user.name,
          new_user.email,
          uni_id
        );

        // Removes Old Admin from Admins Table
        await deleteAdmin(user_id);

        // Updates RSO Fields for New Admin
        await updateRsosAdmin(new_admin_id, rso.admin_id, new_admin_user_id);
        await updateRsoEventsAdmin(rso.admin_user_id, new_admin_user_id);
      }
    }

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
