import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://isywzktyczipracoyaqa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_sYlV6KFFtEJeXphniDxeZw_gS7M2sJt';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
