import { SUPABASE_KEY, SUPABASE_URL } from '../../config/env.js';
import {createClient} from "@supabase/supabase-js";
import fetch from 'node-fetch';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let feedUrl = "https://events.ucf.edu/feed.json";

const populateDatabase = async()=>{
    try{

        // Fetch the event data from the UCF events feed.
        const res = await fetch(feedUrl);
        const allEvents = await res.json();

        // Mapping our data from the UCF event feed json to our RSO_Event table in the database.
        const mappedData = allEvents.map(e => ({
            event_id: e.event_id,
            rso_id: null,
            event_categories: e.category,
            contact_phone: e.contact_phone,
            location: e.location,
            latitude: null,
            longitute: null,
            event_name: e.title,
            event_rating: null,
            description: e.description,
            contact_email: e.contact_email,
            time: e.starts,
        }));

        // Inserting our mapped data into the database.
        const{data,err} = await supabase.from('RSO_Event').insert(mappedData);

    }
    catch(err){
        console.log(err, "Encountered an error when attempting to populate the database");
    }
}

export {supabase};
