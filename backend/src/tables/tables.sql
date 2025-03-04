CREATE TYPE event_category AS ENUM('social', 'fundraising', 'gbm');

CREATE TABLE User {
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255)
};

CREATE TABLE SuperAdmin (
    super_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES User(id)
);

CREATE TABLE University (
    uni_id SERIAL PRIMARY KEY,
    uni_name VARCHAR(255) UNIQUE NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL, 
    description TEXT,
    num_students INT,
    pictures TEXT[] -- Array of image url
);

CREATE TABLE Admin (
    admin_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    uni_id INT NOT NULL,  
    user_id INT NOT NULL,
    FOREIGN KEY(uni_id) REFERENCES University(uni_id),
    FOREIGN KEY(user_id) REFERENCES User(id)
);

CREATE TABLE Student (
    stu_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    uni_id INT NOT NULL,
    user_id INT NOT NULL,  
    FOREIGN KEY(uni_id) REFERENCES University(uni_id),
    FOREIGN KEY(user_id) REFERENCES User(id)
);

CREATE TABLE RSO (
    rso_id SERIAL PRIMARY KEY,
    rso_name VARCHAR(255) NOT NULL,
    admin_id INT NOT NULL,
    FOREIGN KEY(admin_id) REFERENCES Admin(user_id)
);

CREATE TABLE JoinRSO (
    join_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    rso_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Student(user_id),
    FOREIGN KEY (rso_id) REFERENCES RSO(rso_id)
);

CREATE TABLE Public_Event (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    event_comments TEXT[],
    event_rating DECIMAL(3,2),
    event_categories event_category,
    time TIMESTAMP NOT NULL,
    admin_id INT NOT NULL,

    FOREIGN KEY (admin_id) REFERENCES Admin(user_id)
);

CREATE TABLE Private_Event (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    event_rating DECIMAL(3,2),
    event_comments TEXT[],
    event_categories event_category,
    time TIMESTAMP NOT NULL,
    admin_id INT NOT NULL,
    uni_id INT NOT NULL,

    FOREIGN KEY (admin_id) REFERENCES Admin(user_id),
    FOREIGN KEY (uni_id) REFERENCES University(uni_id)
);

CREATE TABLE RSO_Event (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    event_rating DECIMAL(3,2),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    event_categories event_category,
    time TIMESTAMP NOT NULL,
    rso_id INT NOT NULL,

    FOREIGN KEY (rso_id) REFERENCES RSO(rso_id)
);

CREATE TABLE Comment (
    comment_id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    user_id INT NOT NULL,
    public_event_id INT NOT NULL,
    private_event_id INT NOT NULL,
    rso_event_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Student(user_id),
    FOREIGN KEY (public_event_id) REFERENCES Public_Event(event_id),
    FOREIGN KEY (private_event_id) REFERENCES Private_Event(event_id),
    FOREIGN KEY (rso_event_id) REFERENCES RSO_Event(event_id)
);

CREATE TABLE Rate (
    rating_id SERIAL PRIMARY KEY,
    rating DECIMAL(3,2) NOT NULL,
    user_id INT NOT NULL,
    public_event_id INT NOT NULL,
    private_event_id INT NOT NULL,
    rso_event_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Student(user_id),
    FOREIGN KEY (public_event_id) REFERENCES Public_Event(event_id),
    FOREIGN KEY (private_event_id) REFERENCES Private_Event(event_id),
    FOREIGN KEY (rso_event_id) REFERENCES RSO_Event(event_id)
);

CREATE TABLE pending_rsos (
  id SERIAL PRIMARY KEY,
  inviter_id INT REFERENCES users(id) ON DELETE CASCADE,
  org_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  num_accepted INT DEFAULT 0
);

