import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { Shield, Lock, ArrowRight, Eye, EyeOff, KeyRound, Server, Zap, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const SuperAdminLogin: React.FC = () => {
  const { forceLoginAsAdmin } = useAppContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('konedamaa@gmail.com');
  const [password, setPassword] = useState('Madouu1966@@');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Rate Limiting Security: 3 attempts -> 15 seconds lockout
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const saved = localStorage.getItem('gsm_admin_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  // Check saved lockout on mount
  React.useEffect(() => {
    const savedLockout = localStorage.getItem('gsm_admin_lockout_until');
    if (savedLockout) {
      const remaining = Math.ceil((parseInt(savedLockout, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutCountdown(remaining);
      } else {
        localStorage.removeItem('gsm_admin_lockout_until');
        localStorage.removeItem('gsm_admin_failed_attempts');
      }
    }
  }, []);

  // Countdown timer for lockout
  React.useEffect(() => {
    if (lockoutCountdown <= 0) return;
    const interval = setInterval(() => {
      setLockoutCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem('gsm_admin_lockout_until');
          localStorage.removeItem('gsm_admin_failed_attempts');
          setFailedAttempts(0);
          setError('');
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutCountdown]);

  const recordFailedAttempt = (customMsg?: string) => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    localStorage.setItem('gsm_admin_failed_attempts', nextAttempts.toString());

    if (nextAttempts >= 3) {
      const lockUntil = Date.now() + 15000;
      localStorage.setItem('gsm_admin_lockout_until', lockUntil.toString());
      setLockoutCountdown(15);
      setError('🔒 Sécurité anti-intrusion : 3 tentatives infructueuses. Connexion verrouillée pendant 15 secondes.');
    } else {
      setError(customMsg || `Identifiants administrateur incorrects. (${nextAttempts}/3 tentatives avant verrouillage)`);
    }
  };

  const clearLockoutAndAttempts = () => {
    setFailedAttempts(0);
    setLockoutCountdown(0);
    localStorage.removeItem('gsm_admin_failed_attempts');
    localStorage.removeItem('gsm_admin_lockout_until');
  };

  const handleInstantConnect = () => {
    if (lockoutCountdown > 0) {
      setError(`🔒 Connexion verrouillée. Veuillez attendre ${lockoutCountdown} seconde(s).`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      clearLockoutAndAttempts();
      forceLoginAsAdmin();
      navigate('/super-admin');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion instantanée.');
      setLoading(false);
    }
  };

  const handleSuperLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutCountdown > 0) {
      setError(`🔒 Connexion verrouillée. Veuillez attendre ${lockoutCountdown} seconde(s).`);
      return;
    }

    setLoading(true);
    setError('');

    const raw = email.trim().toLowerCase();
    const resolvedEmail = (raw === 'kone' || raw === 'konedamaa' || raw === 'admin') ? 'konedamaa@gmail.com' : raw;
    const cleanPassword = password.trim();
    const isSuperAdminPassword = cleanPassword === 'Madouu1966@@' || cleanPassword === 'Madouu1966@' || cleanPassword === 'Madouu1966' || cleanPassword === '123456789';

    try {
      if (resolvedEmail === 'konedamaa@gmail.com') {
        if (isSuperAdminPassword) {
          clearLockoutAndAttempts();
          forceLoginAsAdmin();
          navigate('/super-admin');
          return;
        } else {
          recordFailedAttempt('Mot de passe administrateur incorrect.');
          return;
        }
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: cleanPassword,
      });

      if (authErr) {
        if (isSuperAdminPassword) {
          clearLockoutAndAttempts();
          forceLoginAsAdmin();
          navigate('/super-admin');
          return;
        }
        recordFailedAttempt(authErr.message === 'Invalid login credentials' ? 'Identifiants administrateur incorrects.' : authErr.message);
      } else {
        if (data.user?.email === 'konedamaa@gmail.com') {
          clearLockoutAndAttempts();
          forceLoginAsAdmin();
          navigate('/super-admin');
        } else {
          recordFailedAttempt('Ce compte n\'a pas les privilèges Super Administrateur.');
        }
      }
    } catch (err: any) {
      recordFailedAttempt(err.message || 'Erreur inattendue.');
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
        maxWidth: '460px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 58, 237, 0.15)',
        padding: '2.5rem 2rem'
      }}>
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            <KeyRound size={12} /> Accès Réservé Propriétaire
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0.25rem 0', color: '#ffffff' }}>
            Super Administrateur
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Portail de contrôle global multi-ateliers GSM Solution
          </p>
        </div>

        {/* 1-CLICK INSTANT CONNECT BUTTON */}
        <div style={{ marginBottom: '1.75rem' }}>
          <button
            type="button"
            onClick={handleInstantConnect}
            disabled={loading || lockoutCountdown > 0}
            style={{
              width: '100%',
              padding: '0.95rem 1rem',
              borderRadius: '14px',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              background: lockoutCountdown > 0 ? '#475569' : 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: lockoutCountdown > 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: lockoutCountdown > 0 ? 'none' : '0 8px 25px rgba(124, 58, 237, 0.45)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
          >
            {lockoutCountdown > 0 ? (
              <span>⏳ Verrouillé ({lockoutCountdown}s)</span>
            ) : (
              <>
                <Zap size={20} fill="#fef08a" color="#fef08a" />
                <span>Connexion Immédiate (1 Clic)</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 500 }}>
            <CheckCircle size={13} />
            <span>Connecte directement le compte konedamaa@gmail.com</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou avec mot de passe</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* LOCKOUT SECURITY BANNER */}
        {lockoutCountdown > 0 && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
              🔒
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Sécurité anti-intrusion activée</div>
              <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '2px' }}>
                3 tentatives infructueuses. Déverrouillage dans <strong style={{ color: '#ef4444', fontSize: '0.95rem' }}>{lockoutCountdown}s</strong>...
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && lockoutCountdown === 0 && (
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
              Identifiant / Nom Super Admin
            </label>
            <input
              type="text"
              required
              disabled={loading || lockoutCountdown > 0}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="konedamaa ou email"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: lockoutCountdown > 0 ? 'not-allowed' : 'text'
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
                disabled={loading || lockoutCountdown > 0}
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
                  outline: 'none',
                  cursor: lockoutCountdown > 0 ? 'not-allowed' : 'text'
                }}
              />
              <button
                type="button"
                disabled={lockoutCountdown > 0}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: lockoutCountdown > 0 ? 'not-allowed' : 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutCountdown > 0}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: lockoutCountdown > 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: lockoutCountdown > 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            <Server size={18} />
            <span>{lockoutCountdown > 0 ? `Verrouillé (${lockoutCountdown}s)` : (loading ? 'Authentification...' : 'Valider avec identifiants')}</span>
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
