import { supabase } from "../database/db.js";
import redisClient from "../../config/redis.config.js";

// Inserts a new event in the events table
export const createEventDB = async (event_name) => {
  try {
    const { data } = await supabase
      .from("events") // Table name
      .insert([
        {
          event_name,
        },
      ])
      .select("id")
      .single();

    if (!data) {
      const err = new Error("Event Created Unsuccessfully");
      err.status = false;
      err.statusCode = 400;
      throw err;
    }

    return data.id;
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};
// Inserts a new university event in the university_events table
export const createUniversityEventDB = async (
  event_name,
  description,
  latitude,
  longitude,
  location,
  start_date,
  end_date,
  uni_id,
  admin_id,
  event_categories = null,
  event_id
) => {
  try {
    const { data } = await supabase
      .from("university_events") // Table name
      .insert([
        {
          event_name,
          description,
          latitude,
          longitude,
          event_categories,
          start_date,
          end_date,
          uni_id,
          admin_id,
          location,
          event_id,
        },
      ]);

    if (!data || data.length == 0) {
      const err = new Error("Public Event Not Found");
      err.status = false;
      err.statusCode = 404;
      throw err;
    }

    return {
      message: "University Event Added Successfully",
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

// Inserts a new RSO event in the rso_events table
export const createRSOEventDB = async (
  event_name,
  description,
  latitude,
  longitude,
  location,
  start_date,
  end_date,
  uni_id,
  admin_id,
  rso_id,
  event_categories = null,
  event_id
) => {
  try {
    const { data } = await supabase
      .from("rso_events") // Table name
      .insert([
        {
          event_name,
          description,
          latitude,
          longitude,
          event_categories,
          start_date,
          end_date,
          uni_id,
          admin_id,
          rso_id,
          location,
          event_id,
        },
      ]);

    if (!data || data.length == 0) {
      const err = new Error("Public Event Not Found");
      err.status = false;
      err.statusCode = 404;
      throw err;
    }

    return { message: "RSO Event Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts a new Public Event Request in the public_events table
export const createPublicEventRequestDB = async (
  event_name,
  description,
  latitude,
  longitude,
  location,
  start_date,
  end_date,
  admin_id,
  event_categories = null,
  event_id
) => {
  try {
    const { data } = await supabase
      .from("public_events") // Table name
      .insert([
        {
          event_name,
          description,
          latitude,
          longitude,
          event_categories,
          start_date,
          end_date,
          admin_id,
          location,
          event_id,
        },
      ]);

    if (!data || data.length == 0) {
      const err = new Error("Public Event Not Found");
      err.status = false;
      err.statusCode = 404;
      throw err;
    }

    return { message: "Public Event Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Approves a new Public Event Request from the public_events table
export const approvePublicEventDB = async (event_id) => {
  try {
    const { data, error } = await supabase
      .from("public_events") // Table name
      .update({ status: "valid" })
      .eq("public_event_id", event_id)
      .select();

    if (!data || data.length == 0) {
      const err = new Error("Public Event Not Found");
      err.status = false;
      err.statusCode = 404;
      throw err;
    }
    return { message: "Public Event Approved Successfully", data, status: 200 };
  } catch (error) {
    return {
      error: error.message,
      status: error.statusCode || 500,
    };
  }
};

// Gets All Pending Public Events from the public_events table
export const getPublicEventsWithStatusDB = async (status) => {
  try {
    const { data } = await supabase
      .from("public_events") // Table name
      .select(
        "public_event_id, event_name, description, latitude, longitude, event_rating, event_comments, start_date, end_date, location, event_categories"
      )
      .eq("status", status);

    if (!data) {
      const err = new Error("Public Event Not Found");
      err.status = false;
      err.statusCode = 404;
      throw err;
    }

    return data;
  } catch (error) {
    return {
      error: error.message,
      status: error.statusCode || 500,
    };
  }
};

// Gets All RSO Events Visible to the User
export const getRSOEventsDB = async (user_id) => {
  try {
    // Inner Join Query between rso_events and joins_rso tables
    const { data } = await supabase.rpc("get_user_rso_events", {
      user_id_input: user_id,
    });

    // Invalid Query
    if (!data) {
      const err = new Error("Public Event Not Found");
      err.status = false;
      err.statusCode = 404;
      throw err;
    }

    return data;
  } catch (error) {
    return {
      error: error.message,
      status: error.statusCode || 500,
    };
  }
};

// Gets All Private University Events Visible to the User
export const getUniversityEventsDB = async (user_id) => {
  try {
    // Inner Join Query between University_events and student tables
    const { data, error } = await supabase.rpc("get_user_university_events", {
      user_id_input: user_id,
    });

    if (!data) {
      const err = new Error("Public Event Not Found");
      console.log(1);
      err.status = false;
      err.statusCode = 404;
      throw err;
    }
    return data;
  } catch (error) {
    return {
      error: error.message,
      status: error.statusCode || 500,
    };
  }
};
