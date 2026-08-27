import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gulrhstrgfjosxhinehv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_ENgqsdhZ-mOyvr9IJUmNTw_b0GckK5C';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

