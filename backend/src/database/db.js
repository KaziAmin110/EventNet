import { SUPABASE_KEY, SUPABASE_URL } from "../../config/env.js";
import { createClient } from "@supabase/supabase-js";
import * as eventService from '../services/events.services.js';


const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let feedUrl = "https://events.ucf.edu/feed.json";

// Insert University function. Needed to populate our database with RSOs and subsequently RSO events from the UCF event feed.
const insertUniversity = async (uni_id, uni_name, latitude, longitude, description, num_students, pictures, domain) => {
  // Checking if the university already exsists by seeing if the given name is in the database.
  const { data: findRes, error: findErr } = await supabase
    .from("university")
    .select("uni_id")
    .eq("uni_name", uni_name)
    .single();

  if (findRes) {
    console.log("University already exists, ", findRes.uni_id);
    return findRes.uni_id;
  }

  // Inserting the university.
  const { data: insertRes, insertErr } = await supabase
    .from("university")
    .insert([{uni_id, uni_name, latitude, longitude, description, num_students, pictures, domain}])
    .single();

  if (insertErr) {
    console.log("Error inserting university:", insertErr);
    return null;
  }

  console.log("University inserted successfully ", insertRes);
  return insertRes.uni_id;
};
let ucfImages = [
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AUy1YQ1vCWkoFOJJB6_S7vj1mJltX3Ybu-auuIA-Zvnu6M9BdY6jMym8_mf1ugZNFtZxnPw-JMRi6LU2G3cOJoWrNi0QX1wFaPc5cVhtcJTNr0KlTizdygiBckp51uJ4Nj8SyOVuJR5MzCfF3xoHgcdRUqc-2uk-OA7EzIe8DM7pT-UCogIN0fmIS2o8&key=AIzaSyBR4EpRWQu8cstxa2BG0dubtfI8NTZiMmo",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AUy1YQ0SV-Yj_Ph77JMTZOouKIyQYUWg1EuiCwqU0-ZVvggoCEFOpw_Y0-EDETb-Ss_DBUGTJnan7dVuYebUFnP2Ybnexg8FjiWIvR2topni5exR3e3EdyQl6oA2d5mtaZGM08eUSxzqTbWWSAn4YwIHuzypq9ROYNqRr9uzzG5MdknNaIwMAnnj_Ffv&key=AIzaSyBR4EpRWQu8cstxa2BG0dubtfI8NTZiMmo",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AUy1YQ15iw7498JEe1XFnEZ-in7ZKC4jHtvTxY2zx_u56PIF_-sMlGJxZDATokHrtum7NZ5kRjMk2aZxBDJgZXnQAaDjZZTm0AcZuuCQVrCiyh3Cp7gDu455Xgv8vlTnIrqSXPUxdvHsBF3Mk4MawRpcqf1DdC9iHZ6EVA_f7HLTVh_JGr9Y35UtXTHk&key=AIzaSyBR4EpRWQu8cstxa2BG0dubtfI8NTZiMmo",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AUy1YQ1Vkr0iZvNfd9ImMxJnGR3cfBMgR0iANXEhDSzMKpBsL4hJnGK4QHfgcgBPkGrY8V7dpST2xwUqR-E_DsSr9-jn2rbbGjao5mwRPSbj-iJ1oyaMro0357tyZ6oBEnU52glMfd3RNRmxu03o8GRE8QPIzETsamBZtYtVWvs4u9-FgTXJxWJmIO0d&key=AIzaSyBR4EpRWQu8cstxa2BG0dubtfI8NTZiMmo",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AUy1YQ0SUtDaNVf3vaCuOKzQ9vAU9XzZ3X_XpTIL6WygbB4hAt3nwr4wTira4T0EymF8uUQ9vwnGr9NEjFveUsmc5hA9B5WeOhTUbgnsOwVRBJNuGMwu4lB5MgiHW7grWISdyPX1RqJ1EuQE4rl7sNEwqSnFxUD9iXlmie9zzsozZLjtnKaq9R9KmGA8&key=AIzaSyBR4EpRWQu8cstxa2BG0dubtfI8NTZiMmo",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AUy1YQ07g7XXwsgFevdlzsezzGQHDy5FIJXHHFysPVX95uqeXi_sthqzB6MIERAMBshGMCvjZTGeGX4Qvf8FbwY3RR7QilfjnUHR8otHd1bmJ7K1ZDX_5qe8pbYHmaKsdw-Dzc1WBQdGer7KVdrVz2LRsa116IBGINB3-W2WVVev15B_2tbtYDF2Nej2&key=AIzaSyBR4EpRWQu8cstxa2BG0dubtfI8NTZiMmo",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AUy1YQ3Kjn1ygSL7qeeDaFeXiOMJVtin0gPKLgUAJdcrEiT4_oWWLMZZZkJZw4r0pQCnxAUDy6rkcLMnleL5gedoDGoWs8YLx-PLHlDasx5jcX8UwyX5_kYP0jcNU3Z_byP8gOOFEkAY7wVLFWlWXRwgKtx5U6OY0NkN792nJ_B4Xc3Om2Tj9RLwep21&key=AIzaSyBR4EpRWQu8cstxa2BG0dubtfI8NTZiMmo",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AUy1YQ2jAyxQ8Vu9aeqvSryppbJRcdqGMh5Py2lRdfU7CN3RC8Xr8EPxVtD3qMhnuQgtVLpwiPw7E0CVF8OcwAseNssTJ5BbDaq1QD0NBDNA_pfGKXKA5J72EirWoFEsdOgSWzaTpt0BlZKnxHgCWkld2VXapP9xhUKjFdtZqTP_fMBRlPwvlcBQ20E&key=AIzaSyBR4EpRWQu8cstxa2BG0dubtfI8NTZiMmo",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AUy1YQ2czh7Yz7LeV6wwL97dEUJT3b5rkAWFNSMpr5ow34wK3f8R-eFqmxSGXwVms1vqMD904eoF7ELUtMNFQWtjV3HvbLGC5xcw6P0T7s60GovLcW577_13GQ30dv8hUkGCazhgGNITXGDQg8xKiqNj6Y4KHo81jHJitaEQ5Y4JYo-qc7_FmX_trbYZ&key=AIzaSyBR4EpRWQu8cstxa2BG0dubtfI8NTZiMmo",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AUy1YQ0mOyJbARAlV0Xak6Lo8_QXBjv-o6Zh6prW3tMfJdDcV0FJz_D0Zng1_T6VF28GGrZqrz9i6hxXEJHLBz2h6Z69_5V-1WMLY5qfBHlTrSLqi280HVV3NEUPB0JZ5muqwwQj8RGtqZkQf3-KlnkQpwFqQ6A1-xCkT1KnzB50Rfg1j7mLVJ0ydZYk&key=AIzaSyBR4EpRWQu8cstxa2BG0dubtfI8NTZiMmo"
];
let uni_id = await insertUniversity(0,"University of Central Florida", 0, 0, "Welcome to UCF", 1, ucfImages, "ucf.edu");

// // Inserts a new user with the provided name, email, and password.
// const insertUser = async (name, email, password) => {
//   // Checking if user already exsists by seeing if the given email is in the database.
//   const { data: findRes, error: findErr } = await supabase
//     .from("users")
//     .select("id")
//     .eq("email", email)
//     .single();

//   if (findErr) {
//     console.log("Error, could not fetch the user:", findErr);
//     return null;
//   }

//   if (findRes) {
//     console.log("User already exists, ", findRes.id);
//     return findRes.id;
//   }

//   // Inserting the user.
//   const { data: insertRes, error: insertErr } = await supabase
//     .from("users")
//     .insert([{ name, email, password }])
//     .single();

//   if (insertErr) {
//     console.log("Error, user could not be inserted:", insertErr);
//     return null;
//   }

//   console.log("User inserted successfully", insertRes);
//   return insertRes.id;
// };

// To populate our database with UCF's event feed data we need to create a mock user, and make that user an admin which will then be used to insert RSOs.
// const name = "admin";
// const email = "admin@ucf.edu";
// const password = "test";

// let user_id = await insertUser(name, email, password);

// // Function that allows us to insert an admin into the database by providing the associated user information, such as what university the admin attends.
// const insertAdmin = async (user_id, email, uni_id, name) => {
//   // Checking if the admin already exists in the database by using the provided email.
//   const { data: findRes, error: findErr } = await supabase
//     .from("admin")
//     .select("admin_id")
//     .eq("email", email)
//     .single();

//   if (findRes) {
//     console.log("Admin already exists ", findRes.admin_id);
//     return findRes.admin_id;
//   }

//   // Inserting the admin.
//   const { data: insertRes, error: insertErr } = await supabase
//     .from("admin")
//     .insert([{ user_id, email, uni_id, name }])
//     .single();

//   if (insertErr) {
//     console.log("Error, admin could not be inserted, ", insertErr);
//     return null;
//   }

//   console.log("Admin inserted successfully ", insertRes.user_id);
//   return insertRes.admin_id;
// };

// let admin_id = await insertAdmin(user_id, "admin@ucf.edu", uni_id, "test");

// // Function to help us verify if an RSO already exsists in the database.
// const findRso = async (rsoName) => {
//   if (!rsoName) {
//     console.log("Invalid RSO name.");
//     return null;
//   }

//   // Checking if the RSO exists in the database by using the provided name.
//   const { data: findRes, error: findErr } = await supabase
//     .from("rso")
//     .select("rso_id")
//     .eq("rso_name", rsoName)
//     .order("rso_id", { ascending: true })
//     .limit(1)
//     .maybeSingle();

//   if (findErr) {
//     console.log("Error trying to find the RSO, ", findErr);
//     return null;
//   }
//   if (findRes) {
//     console.log("RSO fetched succesfully ", findRes.rso_id);
//     return findRes.rso_id;
//   } else {
//     console.log("RSO does not exist.");
//     return null;
//   }
// };

// Function that allows us to insert an RSO using the provided name and the id of the admin trying to create it.
// const insertRso = async (rso_name, admin_id, num_members, uni_id, rso_status, admin_user_id) => {
//   if (!rso_name || !admin_id) {
//     console.log("Invalid RSO name and or admin id. RSO could not be inserted");
//     return null;
//   }

//   // If the proposed RSO already exists we obtain its id and return it.
//   let rsoIdActual = await findRso(rso_name);
//   if (rsoIdActual) {
//     console.log("The proposed RSO already exsists, ", rsoIdActual);
//     return rsoIdActual;
//   }

//   // Inserting the RSO
//   const { data: insertRes, error: insertErr } = await supabase
//     .from("rso")
//     .insert([{ rso_name, admin_id, num_members, uni_id, rso_status, admin_user_id}])
//     .select("rso_id")
//     .single();

//   if (insertErr) {
//     console.log("Error, the RSO could not be inserted:", insertErr);
//     return null;
//   }

//   console.log("RSO inserted successfully", insertRes.rso_id);
//   return insertRes.rso_id;
// };

// Function that populates our database with RSOs and their respective RSO events pulled from the UCF event feed.
export const populateDatabase = async () => {
  try {
    // Converting the event feed into a json.
    const res = await fetch(feedUrl);
    const allEvents = await res.json();

    // Handles if there no events were found.
    if (allEvents.length === 0) {
      console.log("No events found in the feed");
      return;
    }

    // Inserts all RSO and their corresponding events.
    const feedMapper = await Promise.all(
      allEvents.map(async (e) => {

        // Including the current event into the feed mapper.
        return {
            event_name: e.title || null,
            description: e.description || null,
            latitude: e.latitude || 0.0,
            longitude: e.longitude || 0.0,
            location: e.location || "Unknown location",              
            start_date: e.starts || new Date(),                      
            end_date: e.ends || e.starts || new Date(),              
            event_categories: null,       
            event_type: "university",
        };
      })
    );

    // Filtering for valid RSO events so they may be inserted into the database.
    const mappedFeedData = [];
    for (let e of feedMapper) {
      if (e !== null) {
        mappedFeedData.push(e);
      }
    }

    if (mappedFeedData.length === 0) {
      console.log("Could not insert any events. May already be populated");
      return;
    }

    // Inserting all of the valid events.
    for (const e of mappedFeedData) {
        const eventRes = await eventService.createEventDB(
          e.event_name,
          e.description,
          e.latitude,
          e.longitude,
          e.location,
          e.start_date,
          e.end_date,
          e.event_categories,
          e.event_type,
          e.contact_phone,
          e.contact_email
        );
        if (eventRes?.error) {
            console.error(`Event: "${e.event_name}" could not be inserted`);
        }   
        else {  
                console.log(`Event: "${e.event_name}" inserted successfully`);
                const publicEventRes = await eventService.createPublicEventRequestDB(24, eventRes);
                if (publicEventRes?.error) {
                    console.error(`Public Event: "${e.event_name}" could not be inserted`);
                } else {
                    console.log(`Public Event: "${e.event_name}" inserted successfully`);
                    const universityEventRes = await eventService.createUniversityEventDB(eventRes, 24, uni_id);
                    if (universityEventRes?.error) {
                        console.error(`University Event: "${e.event_name}" could not be inserted`);
                    } else {
                        console.log(`University Event: "${e.event_name}" inserted successfully`);
                    }
                }
            }
        }
    
  } catch (err) {
    console.log(
      "Error, could not populate the database with the UCF event feed",
      err
    );
  }
};

populateDatabase();

export { supabase };
