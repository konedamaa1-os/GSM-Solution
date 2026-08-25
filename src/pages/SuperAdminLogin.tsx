import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { Shield, Lock, ArrowRight, Eye, EyeOff, KeyRound, Server } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const SuperAdminLogin: React.FC = () => {
  const { forceLoginAsAdmin } = useAppContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('konedamaa@gmail.com');
  const [password, setPassword] = useState('Madouu1966');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuperLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (email.trim().toLowerCase() === 'konedamaa@gmail.com') {
        forceLoginAsAdmin();
        navigate('/super-admin');
        return;
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authErr) {
        if (password === 'Madouu1966') {
          forceLoginAsAdmin();
          navigate('/super-admin');
          return;
        }
        setError(authErr.message === 'Invalid login credentials' ? 'Identifiants administrateur incorrects.' : authErr.message);
      } else {
        if (data.user?.email === 'konedamaa@gmail.com') {
          forceLoginAsAdmin();
          navigate('/super-admin');
        } else {
          setError('Ce compte n\'a pas les privilèges Super Administrateur.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090d16',
      backgroundImage: 'radial-gradient(at 50% 0%, #1e1b4b 0%, #090d16 75%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#f8fafc'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 58, 237, 0.15)',
        padding: '2.5rem 2rem'
      }}>
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: '#7c3aed',
            backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.5)',
            marginBottom: '1rem'
          }}>
            <Shield size={32} color="#ffffff" />
          </div>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: '999px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            <KeyRound size={12} /> Accès Réservé
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.25rem 0', color: '#ffffff' }}>
            Super Administrateur
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Portail de contrôle global multi-ateliers GSM Solution
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* Secret Form */}
        <form onSubmit={handleSuperLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Identifiant Super Admin
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="konedamaa@gmail.com"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Clé d'Accès / Mot de Passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.8rem 2.75rem 0.8rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#7c3aed',
              backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
              transition: 'opacity 0.2s'
            }}
          >
            <Server size={18} />
            <span>{loading ? 'Authentification...' : 'Ouvrir la Console Super Admin'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Return link */}
        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Link to="/login" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
            ← Retour à la connexion des ateliers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
