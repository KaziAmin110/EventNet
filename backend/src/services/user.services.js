import { db } from "../database/db.js";

export const getByEmail = async (email) => {
  try {
    const res = await db.query(`SELECT * FROM "User" WHERE email = $1`, [
      email,
    ]);

    if (res.rows[0]) {
      const user = {
        id: res.rows[0].id,
        name: res.rows[0].name,
        password: res.rows[0].password,
      };
      return user;
    }

    // No Such User associated with Email
    return null;
  } catch (error) {
    throw new Error(error.message);
  }
};

// export const getPasswordByEmail = async (email) => {
//   try {
//     const res = await db.query(`SELECT password FROM "User" WHERE email = $1`, [
//       email,
//     ]);
//     password = res.rows[0].password;
//     return password;
//   } catch (error) {
//     return {
//       error: error.message,
//       status: 500,
//     };
//   }
// };

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
