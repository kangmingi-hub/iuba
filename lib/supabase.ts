import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://isywzktyczipracoyaqa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzeXd6a3R5Y3ppcHJhY295YXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODExODAsImV4cCI6MjA5MTk1NzE4MH0.V81HeozY_-SujorHaw4kdRo884lQNutB29AnjXejBKE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
