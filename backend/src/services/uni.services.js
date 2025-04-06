import { supabase } from "../database/db.js";
import University from "../entities/uni.entities.js";
import axios from "axios";
import { GOOGLE_PLACES_API_KEY } from "../../config/env.js";
import redisClient from "../../config/redis.config.js";

// Inserts a new university in the University Table
export const createUniversityDB = async (
  uni_name,
  latitude,
  longitude,
  description,
  pictures,
  domain
) => {
  try {
    const { data, error } = await supabase
      .from("university") // Table name
      .insert([
        {
          uni_name,
          latitude,
          longitude,
          description,
          num_students: 0,
          pictures,
          domain,
        },
      ]);
    if (error) {
      console.log(error.message);
      return { error: error.message, status: 500 };
    }

    return { message: "University Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Inserts a student in the Student Table with uni_id
export const joinUniversityDB = async (user_id, uni_id, name, email) => {
  try {
    const { data, error } = await supabase
      .from("student") // Table name
      .insert([{ user_id, uni_id, name, email }]);

    // Removes Cache If they Exist
    await redisClient.del(`university:student:${user_id}:${uni_id}`);
    await redisClient.del(`user_unis:${user_id}`);

    if (error) {
      throw new Error();
    }

    return { message: "Student Added Successfully", data, status: 201 };
  } catch (error) {
    return console.error(error);
  }
};

// Removes a student in the Student Table with uni_id
export const leaveUniversityDB = async (user_id, uni_id) => {
  try {
    const { data, error, count } = await supabase
      .from("student")
      .delete()
      .eq("uni_id", uni_id)
      .eq("user_id", user_id);

    if (error) {
      return { error: error.message, status: 500 };
    }

    // Removes Cache If they Exist
    await redisClient.del(`university:student:${user_id}:${uni_id}`);
    await redisClient.del(`user_unis:${user_id}`);
    await redisClient.del(`joinable_unis:${user_id}`);

    return { message: "Student Removed Successfully", data, status: 200 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Removes all Rsos that a User is Associated with at a University
export const leaveUniRsosDB = async (user_id, uni_id) => {
  try {
    const { data, error, count } = await supabase
      .from("joins_rso")
      .delete()
      .eq("uni_id", uni_id)
      .eq("user_id", user_id);

    if (error) {
      console.error(error);
      return { error: error.message, status: 500 };
    }

    return data;
  } catch (err) {
    return {
      error: err.message,
      status: 500,
    };
  }
};

// Updates the number of students at a university (Increment or Decrement)
export const updateUniversityStudents = async (uni_id, num_students, mode) => {
  try {
    // Increases uni_id num_students by 1 in Database
    if (mode === "increment") {
      const { data, error } = await supabase
        .from("university")
        .update({ num_students: num_students + 1 })
        .eq("uni_id", uni_id);
    }
    // Decreases uni_id num_students by 1 in Database
    else if (mode === "decrement") {
      const { data, error } = await supabase
        .from("university")
        .update({ num_students: num_students - 1 })
        .eq("uni_id", uni_id);
    } else {
      return { error: "Invalid Update Students", status: 500 };
    }

    // Removes University Cache If they exist
    await redisClient.del(`uni:uni_id:${uni_id}`);

    return { success: true, status: 200 };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Checks If a Student is Part of a Particular University
export const isUniversityStudent = async (user_id, uni_id) => {
  try {
    // Generate a cache key based on user_id and uni_id
    const cacheKey = `university:student:${user_id}:${uni_id}`;

    // Check if the membership status is cached in Redis
    const cachedStudent = await redisClient.get(cacheKey);
    if (cachedStudent !== null) {
      return cachedStudent === "true"; // Return true/false based on cached value
    }

    // Query Supabase if not found in cache
    const { data, error } = await supabase
      .from("student")
      .select("user_id")
      .eq("user_id", user_id)
      .eq("uni_id", uni_id)
      .single();

    if (data) {
      // Store the membership status (true) in Redis with 5 minutes expiration
      await redisClient.set(cacheKey, "true", "EX", 300); // 5 minutes expiration
      return true;
    }

    // If student is not part of the university, store false in cache
    await redisClient.set(cacheKey, "false", "EX", 300); // 5 minutes expiration
    return false;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Checks If a User is an Admin of a Particular University
export const isUniversityAdmin = async (user_id, uni_id) => {
  try {
    // Query Supabase if not found in cache
    const { data, error } = await supabase
      .from("admin")
      .select("user_id")
      .eq("user_id", user_id)
      .eq("uni_id", uni_id)
      .single();

    if (data) {
      return true;
    }

    return false;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const isValidUniversity = async (uni_id) => {
  try {
    // Query Supabase if not found in cache
    const { data, error } = await supabase
      .from("universities")
      .select("uni_id")
      .eq("uni_id", uni_id)
      .single();

    if (data) {
      return true;
    }

    return false;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Get University by Attribute
export const checkUniversityExistence = async (uni_name) => {
  try {
    const cacheKey = `uni_existence:${uni_name}`;
    const cachedUni = await redisClient.get(cacheKey);

    if (cachedUni) {
      return JSON.parse(cachedUni);
    }

    const { data, error } = await supabase
      .from("university")
      .select("uni_id")
      .eq("uni_name", uni_name)
      .single();

    await redisClient.set(cacheKey, JSON.stringify(data), "EX", 300);

    return !!data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get All data from University by Attribute
export const getUniAllInfo = async (attribute, value) => {
  try {
    const cacheKey = `uni:${attribute}:${value}`;
    const cachedUni = await redisClient.get(cacheKey);

    if (cachedUni) {
      return JSON.parse(cachedUni);
    }

    const { data, error } = await supabase
      .from("university")
      .select("*")
      .eq(attribute, value)
      .single();

    if (data) {
      const uni_data = new University(
        data.uni_id,
        data.uni_name,
        data.longitude,
        data.latitude,
        data.description,
        data.num_students,
        data.pictures,
        data.domain
      );

      await redisClient.set(cacheKey, JSON.stringify(uni_data), "EX", 300);
      return uni_data;
    }

    // No University Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Gathers University Info such as Latitude, Longitude, and Photos using Google Place API
export async function getUniversityDetails(universityName) {
  try {
    // Generate cache key based on the university name
    const cacheKey = `university:details:${universityName.toLowerCase()}`;

    // Check if university details are cached in Redis
    const cachedDetails = await redisClient.get(cacheKey);
    if (cachedDetails !== null) {
      return JSON.parse(cachedDetails); // Return the cached data
    }

    // If not found in cache, proceed with API call to Google Places
    const findPlaceUrl =
      "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";
    const findPlaceParams = {
      input: universityName,
      inputtype: "textquery",
      fields: "place_id",
      key: GOOGLE_PLACES_API_KEY,
    };

    const findPlaceResponse = await axios.get(findPlaceUrl, {
      params: findPlaceParams,
    });

    if (
      findPlaceResponse.data.status !== "OK" ||
      !findPlaceResponse.data.candidates ||
      findPlaceResponse.data.candidates.length === 0
    ) {
      return null; // Place not found
    }

    const placeId = findPlaceResponse.data.candidates[0].place_id;

    const detailsUrl =
      "https://maps.googleapis.com/maps/api/place/details/json";
    const detailsParams = {
      place_id: placeId,
      fields: "name,geometry,photos",
      key: GOOGLE_PLACES_API_KEY,
    };

    const detailsResponse = await axios.get(detailsUrl, {
      params: detailsParams,
    });

    if (detailsResponse.data.status !== "OK") {
      return null; // Error getting details
    }

    const universityDetails = detailsResponse.data.result;

    const result = {
      name: universityDetails.name,
      latitude: universityDetails.geometry.location.lat,
      longitude: universityDetails.geometry.location.lng,
      photos: universityDetails.photos
        ? universityDetails.photos.map((photo) => photo.photo_reference)
        : [], // Extract photo references
    };

    // Cache the university details in Redis for future requests
    await redisClient.set(cacheKey, JSON.stringify(result), "EX", 600); // 10 minutes expiration

    return result;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}

// Converts Photo References from Google Places API into URL's that can be stored in the database
export async function getUniPhotoUrl(photoReference, maxWidth = 400) {
  try {
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;

    // You can directly use the photoUrl in an <img> tag or fetch the image data.
    return photoUrl;
  } catch (error) {
    console.error("Error fetching photo:", error);
    return null;
  }
}

// Retrieves User Entity Based on Attribute
export const getStudentByAttribute = async (email, uni_id) => {
  try {
    // Generate cache key based on attribute and value
    const cacheKey = `student:${email}:${uni_id}`;

    // Check if the student data is cached in Redis
    const cachedStudent = await redisClient.get(cacheKey);
    if (cachedStudent !== null) {
      return JSON.parse(cachedStudent); // Return cached data
    }

    // Query Supabase if data is not found in the cache
    const { data, error } = await supabase
      .from("student")
      .select("*")
      .eq("email", email)
      .eq("uni_id", uni_id)
      .single();

    if (data) {
      const student = {
        student_id: data.student_id,
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        uni_id: data.uni_id,
      };

      // Cache the student data in Redis with 5 minutes expiration
      await redisClient.set(cacheKey, JSON.stringify(student), "EX", 300); // 5 minutes expiration
      return student;
    }

    // No User Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Queries all Universities that a User is a student of
export const getUserUniversitiesDB = async (user_id, start, end) => {
  try {
    // // // Generate cache key based on user_id
    const cacheKey = `user_unis:${user_id}`;

    // // // Check if the user RSO data is cached in Redis
    const cachedRsos = await redisClient.get(cacheKey);
    if (cachedRsos !== null) {
      return JSON.parse(cachedRsos); // Return cached data
    }

    // Fetch data from Supabase if not found in cache
    const { data, error, count } = await supabase
      .rpc(
        "get_joined_universities",
        {
          user_id_input: user_id,
        },
        { count: "exact" }
      )
      .range(start, end);

    if (error) {
      throw new Error(error.message);
    }

    // // Cache the RSOs data in Redis with 5 minutes expiration
    await redisClient.set(cacheKey, JSON.stringify(data), "EX", 300); // 5 minutes expiration

    return {
      data: data || [],
      count: count,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

// Queries all Universities that a User Can Join from DB
export const getJoinableUniversitiesDB = async (
  user_id,
  user_email,
) => {
  try {
    // Fetch data from Supabase if not found in cache
    const { data, error, count } = await supabase.rpc(
      "get_joinable_universities",
      {
        user_id_input: user_id,
        user_domain_input: user_email.split("@")[1],
      }
    );

    if (error) {
      throw new Error(error.message);
    }
    return {
      data: data || [],
      count: count,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};
