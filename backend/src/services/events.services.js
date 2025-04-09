import { supabase } from "../database/db.js";
import redisClient from "../../config/redis.config.js";

// Inserts a new event in the events table
export const createEventDB = async (
  event_name,
  description,
  latitude,
  longitude,
  location,
  start_date,
  end_date,
  event_categories = null,
  event_type,
  contact_phone = null,
  contact_email = null
) => {
  try {
    const { data } = await supabase
      .from("events") // Table name
      .insert([
        {
          event_name,
          description,
          latitude,
          longitude,
          start_date,
          end_date,
          location,
          event_categories,
          event_type,
          contact_phone,
          contact_email,
        },
      ])
      .select("event_id")
      .single();

    if (!data) {
      const err = new Error("Event Created Unsuccessfully");
      err.status = false;
      err.statusCode = 400;
      throw err;
    }

    return data.event_id;
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};
// Inserts a new university event in the university_events table
export const createUniversityEventDB = async (event_id, admin_id, uni_id) => {
  try {
    const { data } = await supabase
      .from("university_events") // Table name
      .insert([
        {
          uni_id,
          admin_id,
          event_id,
        },
      ])
      .select();

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
export const createRSOEventDB = async (uni_id, admin_id, rso_id, event_id) => {
  try {
    const { data } = await supabase
      .from("rso_events") // Table name
      .insert([
        {
          uni_id,
          admin_id,
          rso_id,
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
export const createPublicEventRequestDB = async (admin_id, event_id) => {
  try {
    const { data } = await supabase
      .from("public_events") // Table name
      .insert([
        {
          admin_id,
          event_id,
        },
      ])
      .select();

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

// Inserts New Comments in the Events Table
export const updateCommentsInEventsDB = async (event_id, event_comments) => {
  try {
    // Update Events Table with New Comments Array
    const { data, error: updateError } = await supabase
      .from("events")
      .update({
        event_comments: event_comments,
      })
      .eq("event_id", event_id)
      .select();

    if (updateError) {
      throw updateError;
    }

    if (!data) {
      const err = new Error("Failed to update event comments");
      err.status = false;
      err.statusCode = 500;
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

// Inserts a Comment in the Comments Table
export const createUserComment = async (event_id, user_id, text) => {
  try {
    // Inner Join Query between University_events and student tables
    const { data } = await supabase.from("comments").insert([
      {
        text,
        user_id,
        event_id,
      },
    ]);

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

// Inserts new Average Rating for Event in events table
export const createNewAverageRatingToEvents = async (event_id) => {
  try {
    const { totalRating, numRatings } = await getAverageRatingInfo(event_id);

    // New Average Rating Calculation
    const newEventRating = totalRating / numRatings;

    // Update Events Table with new Event Rating and num_ratings
    const { data, error } = await supabase
      .from("events")
      .update({
        event_rating: newEventRating,
        num_ratings: numRatings, // Updates Number of Ratings on Event
      })
      .eq("event_id", event_id);

    if (error) {
      const err = new Error("Failed to update event comments");
      err.status = false;
      err.statusCode = 500;
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

// Inserts a Rating in the Ratings Table
export const createUserRating = async (event_id, user_id, rating) => {
  try {
    // Inner Join Query between University_events and student tables
    const { data } = await supabase.from("ratings").insert([
      {
        rating,
        user_id,
        event_id,
      },
    ]);

    if (!data) {
      const err = new Error("Error Adding Ratings Entry");
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

// Approves a new Public Event Request from the public_events table
export const approvePublicEventDB = async (event_id) => {
  try {
    const { data, error } = await supabase
      .from("public_events") // Table name
      .update({ status: "valid" })
      .eq("event_id", event_id)
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

// Checks if User has permission to access this event
export const isValidUserEvent = async (user_id, event_id) => {
  try {
    // Get Valid Public Events, University Events, and RSO Events visible to the User
    const [public_events, university_events, rso_events] = await Promise.all([
      getPublicEventsWithStatusDB("valid"),
      getUniversityEventsDB(user_id),
      getRSOEventsDB(user_id),
    ]);

    const allUserEvents = [
      ...public_events,
      ...university_events,
      ...rso_events,
    ];

    const allUserEventIds = allUserEvents.map((event) => {
      return event.event_id;
    });

    if (allUserEventIds.includes(Number(event_id))) {
      return true;
    }

    return false;
  } catch (error) {
    return {
      error: error.message,
      status: error.statusCode || 500,
    };
  }
};

// Checks if User has permission to access this comment
export const isValidUserComment = async (user_id, comment_id) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("comment_id")
      .eq("user_id", user_id)
      .eq("comment_id", comment_id);

    if (error) {
      throw error;
    }

    if (data && data.length != 0) {
      return true;
    }

    return false;
  } catch (error) {
    return {
      error: error.message,
      status: error.statusCode || 500,
    };
  }
};

// Checks to see if Event Time and Location Conflicts with Existing Event
export const isEventConflict = async (location, start_date, end_date) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("start_date, end_date")
      .eq("location", location);

    if (error) {
      throw error;
    }

    const newEventStart = new Date(start_date);
    const newEventEnd = new Date(end_date);

    for (let event of data) {
      let currentEventStart = new Date(event.start_date);
      let currentEventEnd = new Date(event.end_date);
      // Check if Current Event Location and Time Overlaps Existing Event
      if (
        isTimeConflict(
          newEventStart,
          newEventEnd,
          currentEventStart,
          currentEventEnd
        )
      ) {
        return true;
      }
    }

    return false;
  } catch (error) {
    return {
      error: error.message,
      status: error.statusCode || 500,
    };
  }
};

// Checks if Two Event Time's Overlap
export const isTimeConflict = async (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

// Gets All Pending Public Events from the public_events table
export const getPublicEventsWithStatusDB = async (status) => {
  try {
    const { data } = await supabase.rpc("get_user_public_events", {
      status_input: status,
    });

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
      const err = new Error("RSO Events Not Found");
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
    const { data } = await supabase.rpc("get_user_university_events", {
      user_id_input: user_id,
    });

    if (!data) {
      const err = new Error("University Events Not Found");
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

// Gets (total rating sum and number of ratings) for average rating calculation
export const getAverageRatingInfo = async (event_id) => {
  try {
    const { data } = await supabase
      .from("ratings")
      .select("rating")
      .eq("event_id", event_id);

    if (!data) {
      const err = new Error("Public Event Not Found");
      err.status = false;
      err.statusCode = 404;
      throw err;
    }

    let sumRatings = 0;
    for (const item of data) {
      sumRatings += Number(item.rating);
    }

    return {
      totalRating: sumRatings,
      numRatings: data.length,
    };
  } catch (error) {
    return {
      error: error.message,
      status: error.statusCode || 500,
    };
  }
};

// Gets Event Info From DB
export const getEventInfoDB = async (event_id) => {
  try {
    const { data, err } = await supabase
      .from("events")
      .select(
        "event_name, description, latitude, longitude, event_comments, event_rating, start_date, end_date, location, event_categories, event_type"
      )
      .eq("event_id", event_id)
      .single();

    if (err) {
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

// Gets Comment Info From DB
export const getCommentInfoDB = async (comment_id) => {
  try {
    const { data, err } = await supabase
      .from("comments")
      .select("text, user_id, created_at")
      .eq("comment_id", comment_id)
      .single();

    if (err) {
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

// Gells all Comments from the Comments Table for a specific event
export const getEventCommentsDB = async (event_id) => {
  try {
    // Inner Join Query between University_events and student tables
    const { data } = await supabase
      .from("comments")
      .select(`text`)
      .eq("event_id", event_id);

    if (!data) {
      const err = new Error("Event Not Found");
      err.status = false;
      err.statusCode = 404;
      throw err;
    }

    const comments = data.map((comment) => comment.text);
    return comments;
  } catch (error) {
    return {
      error: error.message,
      status: error.statusCode || 500,
    };
  }
};

// Gells all User Comments from the Comments Table for a specific event
export const getUserEventCommentsDB = async (user_id, event_id) => {
  try {
    // Inner Join Query between University_events and student tables
    const { data } = await supabase
      .from("comments")
      .select(`comment_id, text, created_at`)
      .eq("user_id", user_id)
      .eq("event_id", event_id);

    if (!data) {
      const err = new Error("Event Not Found");
      err.status = false;
      err.statusCode = 404;
      throw err;
    }

    // Adds isUserComment field to data returned
    data.map((indData) => {
      indData["isUserComment"] = true;
    });

    return data;
  } catch (error) {
    return {
      error: error.message,
      status: error.statusCode || 500,
    };
  }
};

// Gells all Non-User Comments from the Comments Table
export const getNonUserEventCommentsDB = async (user_id, event_id) => {
  try {
    // Queries All Non User Based Comments
    const { data } = await supabase
      .from("comments")
      .select("comment_id, text, created_at")
      .neq("user_id", user_id)
      .eq("event_id", event_id);

    if (!data) {
      const err = new Error("Event Not Found");
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

// Updates Event Comment in Comment table
export const updateEventCommentDB = async (comment_id, text) => {
  try {
    const now = new Date();
    const isoTime = now.toISOString();

    const { data, error } = await supabase
      .from("comments")
      .update({
        text,
        created_at: isoTime,
      })
      .eq("comment_id", comment_id);

    if (error) {
      throw error;
    }

    return { success: true, message: "Updated Comment Successfully" };
  } catch (err) {
    return {
      error: err.message,
      status: err.statusCode || 500,
    };
  }
};

// Updates Event Comment in Comment table
export const deleteEventCommentDB = async (comment_id) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .delete()
      .eq("comment_id", comment_id);

    if (error) {
      throw error;
    }

    return { success: true, message: "Deleted Comment Successfully" };
  } catch (err) {
    return {
      error: err.message,
      status: err.statusCode || 500,
    };
  }
};

// Removes All RSO Events From RSO_Events Table
export const deleteRSOEventsFromDB = async (rso_id) => {
  try {
    const { data, error } = await supabase
      .from("rso_events")
      .delete()
      .select("event_id")
      .eq("rso_id", rso_id);
    console.log(data);
    return {
      message: "Rso Event Removed from Database Successfully",
      data: data.length .event_id,
      status: 200,
    };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Removes Events with the Given Event_id
export const deleteEventFromDB = async (event_id) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("event_id", event_id);

    return {
      message: "Event Removed from Database Successfully",
      status: 200,
    };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};
