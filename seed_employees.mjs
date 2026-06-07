import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isktjjgmyayargjvyfdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedEmployees() {
  console.log("Adding more employees...");
  const employees = [
    { name: 'Moussa', role: 'Réparateur' },
    { name: 'Awa', role: 'Réparateur' },
    { name: 'Oumar', role: 'Manager' },
    { name: 'Fatou', role: 'Réparateur' }
  ];
  
  const { data, error } = await supabase.from('tb_employees').insert(employees);
  
  if (error) {
    console.error("Error adding employees:", error);
  } else {
    console.log("Employees added successfully!");
  }
}

seedEmployees();
