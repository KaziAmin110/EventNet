import {
  addRsoAsPendingDB,
  isRSOAlreadyPending,
  sendInvitationEmail,
  getRsoByAttribute,
  addRsoInviteDB,
  generateOTP,
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

// Allows Student to create
export const createRSO = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { rso_name, uni_id } = req.body;

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

    await createAdmin(user_id, user.name, user.email, uni_id, "pending");
    const admin_data = await getAdminByAttribute("user_id", user_id);
    const data = await addRsoAsPendingDB(admin_data.admin_id, uni_id, rso_name);

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

// Invites a User to join a RSO through a code sent to the User's Email
export const inviteToRSO = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { inviteeEmail, rso_id } = req.body;

    const invitee = await getStudentByAttribute("email", inviteeEmail);
    const user = await getStudentByAttribute("user_id", user_id);
    const rso = await getRsoByAttribute("rso_id", rso_id);

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

    if (!user) {
      ("Invitation Error - User is not associated with the host ");
    }
    // Check if invitee attends the same university as rso
    if (rso.uni_id !== invitee.uni_id) {
      const error = new Error(
        "Invitation Error - Invitee does not attend rso host university"
      );
      error.statusCode = 403;
      throw error;
    }
    const otp = generateOTP();
    const expiryTime = await sendInvitationEmail(
      inviteeEmail,
      invitee.user_id,
      rso.rso_name
    );
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};
