import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://trzdaliffwztpvptffmj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyemRhbGlmZnd6dHB2cHRmZm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjg1OTQsImV4cCI6MjA5OTk0NDU5NH0.GkzqGC8nzxbSMDOCVWeSP081a25KpMNmYvQEYOpgRT0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkQuery() {
    const { data: invoicesData, error } = await supabase
      .from('tb_invoices')
      .select(`
        *,
        customer:tb_customers(*),
        device:tb_devices(*)
      `)
      .order('date', { ascending: false });
      
    console.log("Error:", error);
    console.log("Data:", JSON.stringify(invoicesData, null, 2));
}

checkQuery();
