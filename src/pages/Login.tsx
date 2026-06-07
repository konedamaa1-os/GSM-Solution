import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wrench } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { forceLoginAsAdmin } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Show exact error message from Supabase to help debug
        setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Wrench size={32} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-color)' }}>GSM SOLUTION</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Connexion à l'espace de gestion</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tontonboua.com"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Mot de passe</label>
            <input 
              type="password" 
              className="form-control" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/mot-de-passe-oublie" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
                Mot de passe oublié ?
              </Link>
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
          <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
            <Link to="/inscription" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
              Pas encore de compte ? S'inscrire
            </Link>
          </div>
          
          <button 
            type="button" 
            onClick={() => { forceLoginAsAdmin(); navigate('/'); }}
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '0.75rem', 
              marginTop: '1.5rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🚧 Accès Rapide Admin (Sans Email)
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
