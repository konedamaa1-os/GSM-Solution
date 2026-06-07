import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isktjjgmyayargjvyfdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3RqamdteWF5YXJnanZ5ZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAyMTIsImV4cCI6MjA5NTM3NjIxMn0.r3GjiYgDm2z2qL_WNwpNjZVzgxtwvwlX6uz9aVkrTXA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log("Adding default Technician...");
  await supabase.from('tb_employees').insert({ name: 'Adama', role: 'Manager' });

  console.log("Adding default device models...");
  await supabase.from('tb_device_models').insert([
    { brand: 'Apple', model: 'iPhone 13' },
    { brand: 'Apple', model: 'iPhone 14' },
    { brand: 'Samsung', model: 'Galaxy S22' }
  ]);

  console.log("Adding common issues...");
  await supabase.from('tb_common_issues').insert([
    { name: 'Écran cassé', default_price: 50000 },
    { name: 'Batterie à remplacer', default_price: 25000 },
    { name: 'Connecteur de charge HS', default_price: 15000 }
  ]);

  console.log("Done!");
}

seed();
