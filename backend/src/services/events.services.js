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
  event_type
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

// Inserts a Comment in the Events Table
export const createCommentToEvents = async (event_id, text) => {
  try {
    const { data: existingEvent, error } = await supabase
      .from("events")
      .select("event_comments")
      .eq("event_id", event_id)
      .single();

    if (error) {
      throw error;
    }

    if (!existingEvent) {
      const err = new Error("Event Not Found");
      err.status = false;
      err.statusCode = 404;
      throw err;
    }

    // Initialize or append to the event_comments array
    const updatedComments = existingEvent.event_comments
      ? [...existingEvent.event_comments, text]
      : [text];

    // Update Events Table with New Comments Array
    const { data, error: updateError } = await supabase
      .from("events")
      .update({
        event_comments: updatedComments,
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
export const createRatingToEvents = async (event_id, rating) => {
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
    const { data } = await supabase.rpc("get_user_university_events", {
      user_id_input: user_id,
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

// Returns total rating sum and number of ratings for average rating calculation
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

// Checks to see if an event_id exists in the events table
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
