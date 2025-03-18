import { createClient } from '@supabase/supabase-js';

// Access the environment variables. Adjust the names if your build tool requires a specific prefix.
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
