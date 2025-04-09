/*
  A high level abstraction of a University that encapsulates its core business logic while remaining independent 
  of lower-level components of the application such as the database.  
*/
class University {
  constructor(
    uni_id,
    uni_name,
    longitude,
    latitude,
    description,
    num_students,
    pictures,
    domain
  ) {
    this.uni_id = uni_id;
    this.uni_name = uni_name;
    this.longitude = longitude;
    this.latitude = latitude;
    this.description = description;
    this.num_students = num_students;
    this.pictures = pictures;
    this.domain = domain;
  }
}

export default University;
