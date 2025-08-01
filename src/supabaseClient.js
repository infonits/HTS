import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // your Supabase URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
