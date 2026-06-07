import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://isktjjgmyayargjvyfdt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA');

async function checkSchema() {
  const { data, error } = await supabase.from('tb_employees').select('*').limit(1);
  console.log("Employees Data:", data);
  console.log("Error:", error);
}

checkSchema();
