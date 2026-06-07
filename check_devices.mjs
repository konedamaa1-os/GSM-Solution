import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isktjjgmyayargjvyfdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDevices() {
  const { data, error } = await supabase.from('tb_devices').select('*');
  console.log("Devices in DB:", data);
  if (error) console.error(error);
}

checkDevices();
