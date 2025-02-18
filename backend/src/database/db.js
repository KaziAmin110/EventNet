import pkg from 'pg';
import { DB_URI, NODE_ENV } from "../../config/env.js";


const {Pool} = pkg;


if (!DB_URI) {
  throw new Error("Please define the DB_URI environment variable inside .env.<development/production>.local");
}

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

export {connectToDatabase, db};
