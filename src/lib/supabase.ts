import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://trzdaliffwztpvptffmj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyemRhbGlmZnd6dHB2cHRmZm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjg1OTQsImV4cCI6MjA5OTk0NDU5NH0.GkzqGC8nzxbSMDOCVWeSP081a25KpMNmYvQEYOpgRT0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
