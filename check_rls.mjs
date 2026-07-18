import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fncuxfakudmamiwbfdiz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY3V4ZmFrdWRtYW1pd2JmZGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNjk0NjksImV4cCI6MjA5ODk0NTQ2OX0.VXgiB-GdlpUPRfPdwpoo-HxhmF_K93DLzvGLXCgzo6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery() {
  const { data, error } = await supabase.from('tb_invoices').select('*');
  console.log("Anon query data:", data?.length);
  console.log("Anon query error:", error);
}

testQuery();
