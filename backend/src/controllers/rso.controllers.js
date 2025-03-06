import {
  addRsoAsPendingDB,
  isRSOAlreadyPending,
  sendInvitationEmail,
  getRsoByAttribute,
  addRSOInviteDB,
  generateInviteToken,
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
    const { inviteeEmail, rso_id } = req.body;

    const invitee = await getStudentByAttribute("email", inviteeEmail);
    const rso = await getRsoByAttribute("rso_id", rso_id);
    const admin = await getAdminByAttribute("user_id", user_id);

    // Check Existence of RSO and Invitee
    if (!rso) {
      const error = new Error("Invitation Error - Not a valid rso");
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
        "Invitation Error - User does not have admin access for the rso"
      );
      error.statusCode = 403;
      throw error;
    }

    // Checks if invitee attends the same university as rso
    if (rso.uni_id !== invitee.uni_id) {
      const error = new Error(
        "Invitation Error - Invitee does not attend rso host university"
      );
      error.statusCode = 403;
      throw error;
    }
    const inviteToken = generateInviteToken();
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 48); // Expiration Date (48 Hours)

    // Sending Accept Link Logic
    await addRSOInviteDB(invitee.user_id, rso_id, inviteToken, expires_at);
    await sendInvitationEmail(inviteeEmail, rso.rso_name, inviteToken);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};
