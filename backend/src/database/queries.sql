/* Get Joinable Universities Query */
CREATE FUNCTION get_joinable_universities(user_id_input bigint, user_domain_input text)
RETURNS TABLE (
    uni_id INT,
    uni_name TEXT,
    description TEXT,
    pictures TEXT[],
    num_students INT
) 
LANGUAGE sql 
AS $$
    SELECT university.uni_id, uni_name, description, pictures, num_students
    FROM university
    WHERE university.uni_id NOT IN (
        SELECT student.uni_id
        FROM student
        WHERE user_id = user_id_input
    ) AND (domain IS NULL OR domain = user_domain_input);
$$;

/* Get User Public Events Query */
CREATE FUNCTION get_user_public_events(status_input status)
RETURNS TABLE (
    event_id INT,
    event_name TEXT,
    description TEXT,
    latitude FLOAT,
    longitude FLOAT,
    event_comments TEXT[],
    event_rating FLOAT,
    event_categories TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    location TEXT,
    event_type event_type

) 
LANGUAGE sql 
AS $$
    SELECT events.event_id, event_name, description, latitude, longitude, event_comments, event_rating, event_categories, start_date, end_date, location, event_type
    FROM public_events 
    INNER JOIN events  ON public_events.event_id = events.event_id
    WHERE public_events.status = status_input;
$$;

/* Get User RSO Events Query */
CREATE FUNCTION get_user_rso_events(user_id_input bigint)
RETURNS TABLE (
    event_id INT,
    event_name TEXT,
    description TEXT,
    latitude FLOAT,
    longitude FLOAT,
    event_comments TEXT[],
    event_rating FLOAT,
    event_categories TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    location TEXT,
    event_type event_type
) 
LANGUAGE sql 
AS $$
    SELECT events.event_id, event_name, description, latitude, longitude, event_comments, event_rating, event_categories, start_date, end_date, location, event_type
    FROM rso_events 
    INNER JOIN joins_rso ON rso_events.rso_id = joins_rso.rso_id
    INNER JOIN events ON rso_events.event_id = events.event_id
    WHERE joins_rso.user_id = user_id_input;
$$;

/* Get User University Events Query */
CREATE FUNCTION get_user_university_events(user_id_input bigint)
RETURNS TABLE (
    event_id INT,
    event_name TEXT,
    description TEXT,
    latitude FLOAT,
    longitude FLOAT,
    event_comments TEXT[],
    event_rating FLOAT,
    event_categories TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    location TEXT,
    event_type event_type
) 
LANGUAGE sql 
AS $$
    SELECT events.event_id, event_name, description, latitude, longitude, event_comments, event_rating, event_categories, start_date, end_date, location, event_type
    FROM university_events 
    INNER JOIN student  ON university_events.uni_id = student.uni_id
    INNER JOIN events ON university_events.event_id = events.event_id
    WHERE student.user_id = user_id_input;
$$;

/* Get Joined Universities Query */
CREATE FUNCTION get_joined_universities(user_id_input bigint)
RETURNS TABLE (
    uni_id INT,
    uni_name TEXT,
    description TEXT,
    pictures TEXT[],
    num_students INT
) 
LANGUAGE sql 
AS $$
    SELECT university.uni_id, uni_name, description, pictures, num_students
    FROM university
    INNER JOIN student ON university.uni_id = student.uni_id
    WHERE user_id = user_id_input;
$$;


