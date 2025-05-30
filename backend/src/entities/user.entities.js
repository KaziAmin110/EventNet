import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  ACCESS_SECRET,
  ACCESS_EXPIRES_IN,
  REFRESH_SECRET,
  REFRESH_EXPIRES_IN,
} from "../../config/env.js";

/*
  A high level abstraction of a user that encapsulates its core business logic while remaining independent 
  of lower-level components of the application such as the database.  
*/
class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  // Handles given user password hashing
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Compares the given user password with the hashed password
  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Provides a token so a user can be authenticated
  generateAccessToken() {
    return jwt.sign({ userId: this.id }, ACCESS_SECRET, {
      expiresIn: ACCESS_EXPIRES_IN,
    });
  }

  generateRefreshToken() {
    return jwt.sign({ userId: this.id }, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES_IN,
    });
  }
}

export default User;
