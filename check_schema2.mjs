import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://isktjjgmyayargjvyfdt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA');

async function tryInsertEmail() {
  const { data, error } = await supabase.from('tb_employees').update({ email: 'test@test.com' }).eq('id', '4f1bb90b-6df8-4610-b47c-53b8ea05dc9d');
  console.log("Error:", error);
}

tryInsertEmail();
