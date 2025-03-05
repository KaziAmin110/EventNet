import { supabase } from "../database/db.js";
import University from "../entities/uni.entities.js";
import axios from "axios";
import { GOOGLE_PLACES_API_KEY } from "../../config/env.js";

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
    const num_students = 0;
    const { data, error } = await supabase
      .from("university") // Table name
      .insert([
        {
          uni_name,
          latitude,
          longitude,
          description,
          num_students,
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
    if (error) {
      return { error: error.message, status: 500 };
    }

    return { message: "Student Added Successfully", data, status: 201 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
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

    return { message: "Student Removed Successfully", data, status: 200 };
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

// Updates the number of students at a university (Increment or Decrement)
export const updateUniversityStudents = async (uni_id, num_students, mode) => {
  try {
    if (mode === "increment") {
      const { data, error } = await supabase
        .from("university")
        .update({ num_students: num_students + 1 })
        .eq("uni_id", uni_id);
    } else if (mode === "decrement") {
      const { data, error } = await supabase
        .from("university")
        .update({ num_students: num_students - 1 })
        .eq("uni_id", uni_id);
    } else {
      return { error: error.message, status: 500 };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Checks If a Student is Part of a Particular University
export const isUniversityStudent = async (user_id, uni_id) => {
  try {
    const { data, error } = await supabase
      .from("student")
      .select("user_id, uni_id")
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

// Get University by Attribute
export const getUniByAttribute = async (attribute, value) => {
  try {
    const { data, error } = await supabase
      .from("university")
      .select("*")
      .eq(attribute, value)
      .single();

    if (data) {
      return new University(
        data.uni_id,
        data.uni_name,
        data.longitude,
        data.latitude,
        data.description,
        data.num_students,
        data.pictures,
        data.domain
      );
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
export const getStudentByAttribute = async (attribute, value) => {
  try {
    const { data, error } = await supabase
      .from("student")
      .select("student_id, user_id, name, email, uni_id")
      .eq(attribute, value)
      .single();

    if (data) {
      return {
        student_id: data.student_id,
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        uni_id: data.uni_id,
      };
    }

    // No User Associated with Given Attribute
    return false;
  } catch (error) {
    throw new Error(error.message);
  }
};
