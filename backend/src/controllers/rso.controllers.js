import {
  addRsoInPendingDB,
  isRSOAlreadyPending,
  sendInvitationEmail,
} from "../services/rso.services.js";
import {
  isUniversityStudent,
  getUniByAttribute,
} from "../services/uni.services.js";

export const createRSO = async (req, res, next) => {
  try {
    const user_id = req.user;
    const { rso_name, uni_id } = req.body;

    const university = await getUniByAttribute("uni_id", uni_id);
    const isStudent = await isUniversityStudent(user_id, uni_id);
    const isPending = await isRSOAlreadyPending(rso_name, user_id, uni_id);
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

    await addRsoInPendingDB(user_id, uni_id, rso_name);

    return res.status(201).json({
      success: true,
      message: "Added Pending RSO Successfully",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};
