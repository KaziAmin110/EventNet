import { SUPABASE_KEY, SUPABASE_URL } from "../../config/env.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// let feedUrl = "https://events.ucf.edu/feed.json";

// // Insert University function. Needed to populate our database with RSOs and subsequently RSO events from the UCF event feed.
// const insertUniversity = async (uni_id, uni_name, latitude, longitude) => {
//   // Checking if the university already exsists by seeing if the given name is in the database.
//   const { data: findRes, error: findErr } = await supabase
//     .from("university")
//     .select("uni_id")
//     .eq("uni_name", uni_name)
//     .single();

//   if (findRes) {
//     console.log("University already exists, ", findRes.uni_id);
//     return findRes.uni_id;
//   }

//   // Inserting the university.
//   const { data: insertRes, insertErr } = await supabase
//     .from("university")
//     .insert([universityData])
//     .single();

//   if (insertErr) {
//     console.log("Error inserting university:", insertErr);
//     return null;
//   }

//   console.log("University inserted successfully ", insertRes);
//   return insertRes.uni_id;
// };

// // let uni_id = await insertUniversity(1, "University of Central Florida", 0, 0);

// // Inserts a new user with the provided name, email, and password.
// const insertUser = async (name, email, password) => {
//   // Checking if user already exsists by seeing if the given email is in the database.
//   const { data: findRes, error: findErr } = await supabase
//     .from("User")
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
//     .from("User")
//     .insert([{ name, email, password }])
//     .single();

//   if (insertErr) {
//     console.log("Error, user could not be inserted:", insertErr);
//     return null;
//   }

//   console.log("User inserted successfully", insertRes);
//   return insertRes.id;
// };

// // // To populate our database with UCF's event feed data we need to create a mock user, and make that user an admin which will then be used to insert RSOs.
// // const name = "admin";
// // const email = "admin@ucf.edu";
// // const password = "test";

// // let user_id = await insertUser(name, email, password);

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

// // Function that allows us to insert an RSO using the provided name and the id of the admin trying to create it.
// const insertRso = async (rsoName, admin_id) => {
//   if (!rsoName || !admin_id) {
//     console.log("Invalid RSO name and or admin id. RSO could not be inserted");
//     return null;
//   }

//   // If the proposed RSO already exists we obtain its id and return it.
//   let rsoIdActual = await findRso(rsoName);
//   if (rsoIdActual) {
//     console.log("The proposed RSO already exsists, ", rsoIdActual);
//     return rsoIdActual;
//   }

//   // Inserting the RSO
//   const { data: insertRes, error: insertErr } = await supabase
//     .from("rso")
//     .insert([{ rso_name: rsoName, admin_id }])
//     .select("rso_id")
//     .single();

//   if (insertErr) {
//     console.log("Error, the RSO could not be inserted:", insertErr);
//     return null;
//   }

//   console.log("RSO inserted successfully", insertRes.rso_id);
//   return insertRes.rso_id;
// };

// // Function that populates our database with RSOs and their respective RSO events pulled from the UCF event feed.
// export const populateDatabase = async () => {
//   try {
//     // Converting the event feed into a json.
//     const res = await fetch(feedUrl);
//     const allEvents = await res.json();

//     // Handles if there no events were found.
//     if (allEvents.length === 0) {
//       console.log("No events found in the feed");
//       return;
//     }

//     // Inserts all RSO and their corresponding events.
//     const feedMapper = await Promise.all(
//       allEvents.map(async (e) => {
//         // Checking for existing RSO based on the events tag which is being used to name the RSOs.
//         let rso_id = await findRso(e.tags[0]);

//         // If the rso couldn't be found we insert it, along with the id of the mock admin creating it.
//         if (!rso_id) {
//           rso_id = await insertRso(e.tags[0], admin_id);
//         }

//         // If the rso_id is invalid there was an issue with its insertion so we can't insert the current RSO event.
//         if (!rso_id) {
//           console.log(
//             "Cannot insert the current event. Its RSO could not be found or inserted"
//           );
//           return null;
//         }

//         /*
//              Verifying if the current event already exsists in the database. Case: Two events may appear with the same id but, they have different start times.
//              Skipping for now.
//             */
//         const { data: findRes, error: findErr } = await supabase
//           .from("rso_event")
//           .select("event_id")
//           .eq("event_id", e.event_id)
//           .maybeSingle();

//         if (findErr) {
//           console.log("Error trying to find the event:", findErr);
//           return null;
//         }

//         if (findRes) {
//           console.log("Duplicate event found, omitting it for now ", findRes);
//           return null;
//         }

//         // Including the current event into the feed mapper.
//         return {
//           event_id: e.event_id,
//           rso_id: rso_id,
//           event_categories: e.event_category || "social",
//           contact_phone: e.contact_phone || null,
//           latitude: e.latitude || 0.0,
//           longitude: e.longitude || 0.0,
//           event_name: e.title || "test",
//           event_rating: e.rating || null,
//           description: e.description || null,
//           contact_email: e.contact_email || null,
//           time: e.starts || new Date(),
//         };
//       })
//     );

//     // Filtering for valid RSO events so they may be inserted into the database.
//     const mappedFeedData = [];
//     for (let e of feedMapper) {
//       if (e !== null) {
//         mappedFeedData.push(e);
//       }
//     }

//     if (mappedFeedData.length === 0) {
//       console.log("Could not insert any events. May already be populated");
//       return;
//     }

//     // Inserting all of the valid RSO events.
//     const { data: insertRes, error: insertErr } = await supabase
//       .from("rso_event")
//       .insert(mappedFeedData);

//     if (insertErr) {
//       console.error("Error, could not insert the RSO event ", insertErr);
//     } else {
//       console.log("UCF Feed RSO events inserted successfully:", insertRes);
//     }
//   } catch (err) {
//     console.log(
//       "Error, could not populate the database with the UCF event feed",
//       err
//     );
//   }
// };

// populateDatabase();

export { supabase };
