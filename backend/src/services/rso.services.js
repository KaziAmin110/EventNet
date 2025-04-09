import { EVENTS_EMAIL, EVENTS_PASSWORD, RSO_SECRET } from "../../config/env.js";
import { supabase } from "../database/db.js";
import nodemailer from "nodemailer";
import RSO_Class from "../entities/rso.entities.js";
import redisClient from "../../config/redis.config.js";

// Sends Invitation Email to Recieving User
export const sendInvitationEmail = async (
  recieverEmail,
  rso_name,
  inviteToken
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: EVENTS_EMAIL,
        pass: EVENTS_PASSWORD,
      },
    });

    const acceptLink = `http://localhost:5173/accept-invite.html?token=${inviteToken}`;

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
export const addRsoAsPendingDB = async (
  admin_id,
  uni_id,
  rso_name,
  admin_user_id
) => {
  try {
    const { data, error } = await supabase
      .from("rso") // Table name
      .insert([{ rso_name, admin_id, uni_id, admin_user_id }])
      .select("*")
      .single();

    if (error) {
      console.log(error);
      return { error: error.message, status: 500 };
    }

    return data;
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts a student in the Student Table with uni_id
export const addRSOInviteDB = async (user_id, rso_id, invite_status) => {
  try {
    const { data, error } = await supabase
      .from("invites_rso") // Table name
      .insert([{ rso_id, user_id, invite_status }])
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
export const joinRsoDB = async (user_id, rso_id, uni_id) => {
  try {
    const { data, error } = await supabase
      .from("joins_rso") // Table name
      .insert([{ user_id, rso_id, uni_id }]);
    if (error) {
      return { error: error.message, status: 500 };
    }

    // Invalidate related cache
    await redisClient.del(`user_rsos:${user_id}`);
    await redisClient.del(`rso:membership:${user_id}:${rso_id}`);

    return { message: "Member Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
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

    await redisClient.del(`rso:membership:${user_id}:${rso_id}`);
    await redisClient.del(`user_rsos:${user_id}`);

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
    let updatedMembers;

    if (mode === "increment") {
      const { data, error } = await supabase
        .from("rso")
        .update({ num_members: num_members + 1 })
        .eq("rso_id", rso_id);

      updatedMembers = num_members + 1;
    } else if (mode === "decrement") {
      const { data, error } = await supabase
        .from("rso")
        .update({ num_members: num_members - 1 })
        .eq("rso_id", rso_id);

      updatedMembers = num_members - 1;
    } else {
      return { error: error.message, status: 500 };
    }

    await redisClient.del(`rso:rso_id:${rso_id}`);
    return updatedMembers;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Updates the Status of an RSO
export const updateRsoStatus = async (rso_id, status) => {
  try {
    const { data, error } = await supabase
      .from("rso")
      .update({ rso_status: status })
      .eq("rso_id", rso_id);

    if (!error) {
      await redisClient.del(`rso:rso_id:${rso_id}`);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Updates the Admin of an RSO
export const updateRsosAdmin = async (
  new_admin_id,
  old_admin_id,
  new_admin_user_id
) => {
  try {
    const { data, error } = await supabase
      .from("rso")
      .update({ admin_id: new_admin_id, admin_user_id: new_admin_user_id })
      .eq("admin_id", old_admin_id);

    if (!error) {
      await redisClient.del(`rso:rso_id:${rso_id}`);
    }

    return {
      success: true,
      message: "Updated RSO Table Admin Data Successfully",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Updates the Admin of an RSO
export const updateRsoEventsAdmin = async (old_admin_id, new_admin_user_id) => {
  try {
    const { data, error } = await supabase
      .from("rso_events")
      .update({ admin_id: new_admin_user_id })
      .eq("admin_id", old_admin_id);

    if (!error) {
      await redisClient.del(`rso:rso_id:${rso_id}`);
    }

    return {
      success: true,
      message: "Updated RSO Events Table Admin Data Successfully",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Updates the Invite Status of an RSO
export const updateInviteStatus = async (rso_id, user_id, status) => {
  try {
    const { data, error } = await supabase
      .from("invites_rso")
      .update({ invite_status: status })
      .eq("rso_id", rso_id)
      .eq("user_id", user_id);

    if (!error) {
      if (status === "accepted") {
        await redisClient.del(`user_rsos:${user_id}`);
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get ALL RSOs at a Given University
export const getAllRsosDB = async (uni_id) => {
  try {
    // Fetch data from Supabase if not found in cache
    const { data, error, count } = await supabase
      .from("rso")
      .select("*")
      .eq("uni_id", uni_id);

    if (error) {
      throw new Error(error.message);
    }

    // Prepare the pagination data
    const result = {
      success: true,
      data,
    };

    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Gets all Rsos that a User is a member of
export const getUserRsoDB = async (user_id) => {
  try {
    // Generate cache key based on user_id
    const cacheKey = `user_rsos:${user_id}`;

    // Check if the user RSO data is cached in Redis
    const cachedRsos = await redisClient.get(cacheKey);
    if (cachedRsos !== null) {
      return JSON.parse(cachedRsos); // Return cached data
    }

    // Fetch data from Supabase if not found in cache
    const { data, error } = await supabase
      .from("joins_rso")
      .select("rso_id")
      .eq("user_id", user_id);

    if (error) {
      throw new Error(error.message);
    }

    // Cache the RSOs data in Redis with 5 minutes expiration
    await redisClient.set(cacheKey, JSON.stringify(data), "EX", 300); // 5 minutes expiration

    return data || [];
  } catch (err) {
    throw new Error(err.message);
  }
};

// Retrieves RSO Entity From RSO Table Based on Attribute
export const getRsoByAttribute = async (attribute, value) => {
  try {
    // Generate cache key based on attribute (e.g., "rso:name:RSO Name")
    const cacheKey = `rso:${attribute}:${value}`;

    // Check if RSO data exists in Redis cache
    const cachedRso = await redisClient.get(cacheKey);

    if (cachedRso) {
      return JSON.parse(cachedRso);
    }

    // Fetch RSO from Supabase if not found in cache
    const { data, error } = await supabase
      .from("rso")
      .select(
        "rso_id, rso_name, admin_id, num_members, uni_id, rso_status, admin_user_id"
      )
      .eq(attribute, value)
      .single();

    if (data) {
      const rsoData = new RSO_Class(
        data.rso_id,
        data.rso_name,
        data.admin_id,
        data.num_members,
        data.uni_id,
        data.rso_status,
        data.admin_user_id
      );

      await redisClient.set(cacheKey, JSON.stringify(rsoData), "EX", 300);

      return rsoData;
    }

    // No RSO Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Retrieves All Members of a RSO
export const getAllRSOMembers = async (rso_id) => {
  try {
    const { data, error } = await supabase
      .from("joins_rso")
      .select("user_id")
      .eq("rso_id", rso_id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    return {
      status: error.statusCode,
      message: error.message,
    };
  }
};

// Retrieves Members of a RSO Excluding Admin
export const getRSOMembers = async (admin_id, rso_id) => {
  try {
    const { data, error } = await supabase
      .from("joins_rso")
      .select("user_id")
      .eq("rso_id", rso_id)
      .neq("user_id", admin_id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    return {
      status: error.statusCode,
      message: error.message,
    };
  }
};

// Retrieves New RSO Admin Based on Earliest Join to RSO
export const getNewRsoAdmin = async (rso_id, uni_id) => {
  try {
    const { data, error } = await supabase
      .from("joins_rso")
      .select("user_id")
      .eq("rso_id", rso_id)
      .eq("uni_id", uni_id)
      .order("created_at", {
        ascending: true,
      })
      .single();

    if (error) {
      throw error;
    }

    return data.user_id;
  } catch (error) {
    return {
      status: error.statusCode,
      message: error.message,
    };
  }
};

// // Retrieves RSO Invites Data from the Invites_RSO Table
export const getRsoInvitesData = async (rso_id) => {
  try {
    const { data, error } = await supabase
      .from("invites_rso")
      .select("user_id, invite_status, created_at")
      .eq("rso_id", rso_id);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    return {
      status: error.statusCode,
      message: error.message,
    };
  }
};

// Checks to see if a given Rso already exists
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

// Checks If a User is Part of a Particular RSO
export const isRSOMember = async (user_id, rso_id) => {
  try {
    // Generate a cache key based on user_id and rso_id
    const cacheKey = `rso:membership:${user_id}:${rso_id}`;

    // Check if membership status is already cached in Redis
    const cachedMembership = await redisClient.get(cacheKey);
    if (cachedMembership !== null) {
      return cachedMembership === "true"; // Return true/false based on cached value
    }

    // Query Supabase if membership data is not cached
    const { data, error } = await supabase
      .from("joins_rso")
      .select("user_id, rso_id")
      .eq("user_id", user_id)
      .eq("rso_id", rso_id)
      .single();

    if (data) {
      // Store the membership status in Redis (true/false)
      await redisClient.set(cacheKey, "true", "EX", 300); // 5 minutes expiration

      return true;
    }

    // User is not a member of the RSO, store false in cache
    await redisClient.set(cacheKey, "false", "EX", 300); // 5 minutes expiration
    return false;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Checks If a User is Admin of a Particular RSO
export const isRSOAdmin = async (user_id, rso_id) => {
  try {
    const { data, error } = await supabase
      .from("rso")
      .select("rso_id")
      .eq("rso_id", rso_id)
      .eq("admin_user_id", user_id)
      .single();

    if (data) {
      return true;
    }

    return false;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Checks If a User Is Already Invited to Join an RSO
export const isUserAlreadyInvited = async (user_id, rso_id) => {
  try {
    const { data, error } = await supabase
      .from("invites_rso")
      .select("invite_id")
      .eq("user_id", user_id)
      .eq("rso_id", rso_id);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) return true;

    return false;
  } catch (error) {
    return {
      status: error.statusCode,
      message: error.message,
    };
  }
};

// Checks If a Given RSO Is Part of a University
export const isUniversityRSO = async (uni_id, rso_id) => {
  try {
    const { data, error } = await supabase
      .from("rso")
      .select("rso_id")
      .eq("uni_id", uni_id)
      .eq("rso_id", rso_id)
      .single();

    if (error) throw error;

    return !!data;
  } catch (error) {
    return {
      status: error.statusCode,
      message: error.message,
    };
  }
};

// Removes the Invite Status of an RSO
export const removeInviteStatus = async (rso_id, user_id, status) => {
  try {
    const { data, error } = await supabase
      .from("invites_rso")
      .delete()
      .eq("rso_id", rso_id)
      .eq("user_id", user_id);

    if (!error) {
      if (status === "accepted") {
        await redisClient.del(`user_rsos:${user_id}`);
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Deletes an RSO from the RSO Table
export const deleteRSOFromDB = async (rso_id) => {
  try {
    const { data, error } = await supabase
      .from("rso")
      .delete()
      .eq("rso_id", rso_id);

    if (error) {
      throw error;
    }

    return {
      status: true,
      message: "Removed RSO From Database Successfully.",
    };
  } catch (error) {
    return {
      status: error.statusCode || 500,
      message: error.message || "Delete RSO From DB Service Error",
    };
  }
};
