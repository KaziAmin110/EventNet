import { db } from "../database/db.js";

export const getByEmail = async (email) => {
  try {
    const res = await db.query(`SELECT * FROM "User" WHERE email = $1`, [
      email,
    ]);
    return res.rows[0];
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};

export const createUser = async (name, email, password) => {
  try {
    await db.query(
      `INSERT INTO "User" (name, email, password)
            VALUES ($1, $2, $3)`,
      [name, email, password]
    );
    return;
  } catch (error) {
    return {
      error: error.message,
      status: 500,
    };
  }
};
