import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Wrench size={32} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-color)' }}>TonTon Boua</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Créer un compte</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              Inscription réussie ! Veuillez vérifier vos e-mails pour confirmer votre compte (si activé par l'administrateur), ou connectez-vous directement.
            </div>
            <Link to="/login" className="btn btn-primary" style={{ display: 'block', textDecoration: 'none' }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Confirmer le mot de passe</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginBottom: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
              <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                Vous avez déjà un compte ? Se connecter
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
