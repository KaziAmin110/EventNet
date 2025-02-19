import pkg from 'pg';
import { DB_URI, NODE_ENV } from "../../config/env.js";
import { SUPABASE_KEY, SUPABASE_URL } from '../../config/env.js';
import {createClient} from "@supabase/supabase-js";

// const db = new Pool({
//   connectionString: DB_URI,
// });

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Example: Fetch all users from 'users' table
const connectToDatabase = async () => {
  const { data, error } = await supabase
      .from("User")
      .select("*");

  if (error) {
      console.error("Error fetching users:", error);
  } else {
      console.log("Users:", data);
  }
};

// const connectToDatabase = async () => {

//   try {
//     await db.connect();
//     console.log(`Connected to database in ${NODE_ENV} mode`);
//   } catch (error) {
//     console.error("Error Connecting to Database: ", error);
//     process.exit(1);
//   }
// };

export {connectToDatabase};
