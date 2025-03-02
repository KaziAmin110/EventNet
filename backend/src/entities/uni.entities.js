/*
  A high level abstraction of a University that encapsulates its core business logic while remaining independent 
  of lower-level components of the application such as the database.  
*/
class University {
  constructor(
    id,
    name,
    longitude,
    latitude,
    description,
    num_students,
    pictures
  ) {
    this.id = id;
    this.name = name;
    this.longitude = longitude;
    this.latitude = latitude;
    this.description = description;
    this.num_students = num_students;
    this.pictures = pictures;
  }
}

export default University;
