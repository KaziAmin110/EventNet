import { EVENTS_EMAIL, EVENTS_PASSWORD } from "../../config/env.js";
import { supabase } from "../database/db.js";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EVENTS_EMAIL,
    pass: EVENTS_PASSWORD,
  },
});

// Sends Invitation Email to Recieving User
export const sendInvitationEmail = async (
  recieverEmail,
  rso_name,
  inviteToken
) => {
  try {
    const acceptLink = `https://yourdomain.com/rso/accept-invite?token=${inviteToken}`;

    const mailOptions = {
      from: EVENTS_EMAIL,
      to: recipientEmail,
      subject: `Invitation to Join ${rso_name}`,
      html: `
          <p>You have been invited to join <strong>${rso_name}</strong>.</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="${acceptLink}">Accept Invitation</a>
          <p>If you did not expect this invite, you can ignore this email.</p>
        `,
    };
    await transporter.sendMail(mailOptions);
    return { message: `Invitation sent to ${recieverEmail}`, status: 200 };
  } catch (err) {
    return {
      error: err.message,
      status: 500,
    };
  }
};

// Inserts a student in the Student Table with uni_id
export const addRsoAsPendingDB = async (admin_id, uni_id, rso_name) => {
  try {
    const { data, error } = await supabase
      .from("rso") // Table name
      .insert([{ rso_name, admin_id, uni_id }])
      .select("rso_id, rso_name, admin_id, num_members, uni_id, rso_status")
      .single();
    if (error) {
      console.log(error);
      return { error: error.message, status: 500 };
    }

    return {
      message: "Added RSO as Pending Successfully",
      data,
      status: 201,
    };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts a student in the Student Table with uni_id
export const addRSOInviteDB = async (
  user_id,
  rso_id,
  accept_token,
  expire_date
) => {
  try {
    const { data, error } = await supabase
      .from("invites_rso") // Table name
      .insert([{ rso_id, user_id, accept_token, expire_date }])
      .select("invite_id")
      .single();
    if (error) {
      console.log(error);
      return { error: error.message, status: 500 };
    }

    return {
      message: "Added Invite in DB as Pending Successfully",
      data,
      status: 201,
    };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Get University by Attribute
export const isRSOAlreadyPending = async (rso_name, uni_id) => {
  try {
    const { data, error } = await supabase
      .from("rso")
      .select("rso_status")
      .eq("rso_name", rso_name)
      .eq("uni_id", uni_id)
      .single();

    if (data) {
      if (data.rso_status === "pending") {
        return true;
      }
    }
    // No RSO Associated with Given rso_name
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Retrieves User Entity Based on Attribute
export const getRsoByAttribute = async (attribute, value) => {
  try {
    const { data, error } = await supabase
      .from("rso")
      .select("rso_id, rso_name, admin_id, num_members, uni_id, rso_status")
      .eq(attribute, value)
      .single();

    if (data) {
      return {
        rso_id: data.rso_id,
        rso_name: data.rso_name,
        admin_id: data.admin_id,
        num_members: data.num_members,
        uni_id: data.uni_id,
        rso_status: data.rso_status,
      };
    }

    // No User Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const generateInviteToken = () => {
  return uuidv4(); // Generates a 6-digit OTP
};
