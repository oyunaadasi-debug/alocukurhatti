import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nzdkbibotomtdhxjosme.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_o08BiNvdbNjej1bG4Mb6EA_MZc3Fs9o";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
