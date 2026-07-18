import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://trzdaliffwztpvptffmj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyemRhbGlmZnd6dHB2cHRmZm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjg1OTQsImV4cCI6MjA5OTk0NDU5NH0.GkzqGC8nzxbSMDOCVWeSP081a25KpMNmYvQEYOpgRT0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin.tontonboua@gmail.com',
    password: 'MotDePasse123!'
  });

  if (error) {
    console.error('Erreur lors de la creation de l\'utilisateur:', error.message);
  } else {
    console.log('Utilisateur créé avec succès !', data.user?.email);
  }
}

createAdmin();
