import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/env.js";


 /*
  A high level abstraction of a user that encapsulates its core business logic while remaining independent 
  of lower-level components of the application such as the database.  
*/
class User {
  constructor(id, name, email, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  // Handles given user password hashing
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Compares the given user password with the hashed password
  async comparePassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }
  
  // Provides a token so a user can be authenticated
  generateAuthToken() {
    return jwt.sign({ userId: this.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}

export default User;
