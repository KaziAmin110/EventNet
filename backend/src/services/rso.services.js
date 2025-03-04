import { EVENTS_EMAIL, EVENTS_PASSWORD } from "../../config/env.js";
import { supabase } from "../database/db.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EVENTS_EMAIL,
    pass: EVENTS_PASSWORD,
  },
});

export const sendInvitationEmail = async (
  recieverEmail,
  inviteeId,
  rso_name
) => {
  try {
    const acceptLink = `http://localhost:5500/accept-invite?inviteeId=${inviteeId}&orgName=${encodeURIComponent(
      rso_name
    )}`;

    const mailOptions = {
      from: EVENTS_EMAIL,
      to: recipientEmail,
      subject: `Invitation to Join ${orgName}`,
      html: `
          <p>You have been invited to join <strong>${orgName}</strong>.</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="${acceptLink}">Accept Invitation</a>
          <p>If you did not expect this invite, you can ignore this email.</p>
        `,
    };
    await transporter.sendMail(mailOptions);
    return { message: `Invitation sent to ${recieverEmail}` };
  } catch (err) {
    return {
      error: err.message,
      status: 500,
    };
  }
};

// Inserts a student in the Student Table with uni_id
export const addRsoInPendingDB = async (user_id, uni_id, rso_name) => {
  try {
    console.log(1);
    const { data, error } = await supabase
      .from("pending_rso") // Table name
      .insert([{ rso_name, user_id, uni_id }]);
    if (error) {
      console.log(error);
      return { error: error.message, status: 500 };
    }

    return { message: "Pending RSO Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Get University by Attribute
export const isRSOAlreadyPending = async (rso_name, user_id, uni_id) => {
  try {
    const { data, error } = await supabase
      .from("pending_rso")
      .select("*")
      .eq("rso_name", rso_name)
      .eq("user_id", user_id)
      .eq("uni_id", uni_id)
      .single();

    if (data) {
      return true;
    }

    // No RSO Associated with Given rso_name
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};
