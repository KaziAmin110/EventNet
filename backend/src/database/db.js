import { Pool } from "pg";
import { DB_URI, NODE_ENV } from "../../config/env.js";

const db = new Pool({
  connectionString: DB_URI,
});

const connectToDatabase = async () => {
  try {
    await db.connect();
    console.log(`Connected to database in ${NODE_ENV} mode`);
  } catch (error) {
    console.error("Error Connecting to Database: ", error);
    process.exit(1);
  }
};

export default connectToDatabase;
