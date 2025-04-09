/*
  A high level abstraction of a RSO that encapsulates its core business logic while remaining independent 
  of lower-level components of the application such as the database.  
*/
class RSO_Class {
  constructor(
    rso_id,
    rso_name,
    admin_id,
    num_members,
    uni_id,
    rso_status,
    admin_user_id,
    members
  ) {
    (this.rso_id = rso_id),
      (this.rso_name = rso_name),
      (this.admin_id = admin_id),
      (this.num_members = num_members),
      (this.uni_id = uni_id),
      (this.rso_status = rso_status),
      (this.admin_user_id = admin_user_id),
      (this.members = members);
  }
}

export default RSO_Class;
