import { EVENTS_EMAIL, EVENTS_PASSWORD, RSO_SECRET } from "../../config/env.js";
import { supabase } from "../database/db.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

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
  user_id,
  rso_id
) => {
  try {
    const inviteToken = jwt.sign({ user_id, rso_id }, RSO_SECRET, {
      expiresIn: "7d", // Token Expires in 7 Days
    });

    const acceptLink = `http://127.0.0.1/rso/accept-invite?token=${inviteToken}`;

    const mailOptions = {
      from: EVENTS_EMAIL,
      to: recieverEmail,
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
  invite_status,
  accept_token,
  expire_date
) => {
  try {
    const { data, error } = await supabase
      .from("invites_rso") // Table name
      .insert([{ rso_id, user_id, accept_token, expire_date, invite_status }])
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

// Inserts a Member in the RSO Table with rso_id
export const joinRsoDB = async (user_id, rso_id) => {
  try {
    const { data, error } = await supabase
      .from("joins_rso") // Table name
      .insert([{ user_id, rso_id }]);
    if (error) {
      return { error: error.message, status: 500 };
    }

    return { message: "Member Added Successfully", data, status: 201 };
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

// Checks If a User is Part of a Particular RSO
export const isRSOMember = async (user_id, rso_id) => {
  try {
    const { data, error } = await supabase
      .from("joins_rso")
      .select("user_id, rso_id")
      .eq("user_id", user_id)
      .eq("rso_id", rso_id)
      .single();

    if (data) {
      return true;
    }

    return false;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Removes a Member of the RSO from the joins_rso table with the rso_id
export const leaveRsoDB = async (user_id, rso_id) => {
  try {
    const { data, error } = await supabase
      .from("joins_rso")
      .delete()
      .eq("rso_id", rso_id)
      .eq("user_id", user_id);

    if (error) {
      return { error: error.message, status: 500 };
    }

    return { message: "User Removed from RSO Successfully", data, status: 200 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Updates the number of members of a RSO (Increment or Decrement)
export const updateRsoMembers = async (rso_id, num_members, mode) => {
  try {
    if (mode === "increment") {
      const { data, error } = await supabase
        .from("university")
        .update({ num_members: num_members + 1 })
        .eq("rso_id", rso_id);
    } else if (mode === "decrement") {
      const { data, error } = await supabase
        .from("university")
        .update({ num_members: num_members - 1 })
        .eq("rso_id", rso_id);
    } else {
      return { error: error.message, status: 500 };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get ALL RSOs at a Given University
export const getAllRsosDB = async (uni_id, start, end) => {
  try {
    // Fetch Data with pagination
    const { data, error, count } = await supabase
      .from("rso")
      .select("*", { count: "exact" })
      .eq("uni_id", uni_id)
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
    throw new Error(err.message);
  }
};
