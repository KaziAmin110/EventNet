/*
  A high level abstraction of a Admin that encapsulates its core business logic while remaining independent 
  of lower-level components of the application such as the database.  
*/
class Admin {
  constructor(admin_id, name, email, uni_id, user_id) {
    this.admin_id = admin_id;
    this.name = name;
    this.email = email;
    this.uni_id = uni_id;
    this.user_id = user_id;
  }
}

export default Admin;
