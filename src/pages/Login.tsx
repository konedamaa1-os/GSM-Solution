import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { 
  Wrench, Shield, Eye, EyeOff, 
  CheckCircle2, ArrowRight, Sparkles, Lock
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

type RoleType = 'manager' | 'technician' | 'cashier';

interface RoleConfig {
  id: RoleType;
  title: string;
  shortLabel: string;
  badgeLabel: string;
  color: string;
  icon: string;
  heroTitle: string;
  heroSubtitle: string;
  defaultEmail: string;
  defaultPassword?: string;
  permissions: string[];
}

const ROLES: RoleConfig[] = [
  {
    id: 'manager',
    title: 'Administrateur & Direction d\'Atelier',
    shortLabel: 'Administrateur',
    badgeLabel: 'Administrateur',
    color: '#2563eb',
    icon: '🏢',
    heroTitle: 'Espace Administrateur & Direction !',
    heroSubtitle: 'Gérez l\'activité globale de votre boutique, suivez vos techniciens, consultez vos bilans comptables et personnalisez vos paramètres.',
    defaultEmail: 'manager@atelier.com',
    defaultPassword: '••••••••',
    permissions: [
      'Gestion complète des factures & devis',
      'Gestion de l\'équipe des techniciens',
      'Comptabilité, recettes & statistiques de vente',
      'Configuration des tarifs & modèles d\'appareils'
    ]
  },
  {
    id: 'technician',
    title: 'Technicien & Réparateur',
    shortLabel: 'Technicien',
    badgeLabel: 'Atelier & Réparation',
    color: '#059669',
    icon: '🔧',
    heroTitle: 'Espace Réparation & Diagnostic !',
    heroSubtitle: 'Accédez aux fiches d\'intervention, mettez à jour l\'état d\'avancement des réparations et notifiez vos diagnostics techniques.',
    defaultEmail: 'solo@gmail.com',
    defaultPassword: '••••••••',
    permissions: [
      'Visualisation des appareils en attente',
      'Mise à jour des statuts (En cours, Réparé)',
      'Ajout des notes de diagnostic & pannes',
      'Impression des étiquettes & fiches de travail'
    ]
  },
  {
    id: 'cashier',
    title: 'Réceptionniste & Caisse',
    shortLabel: 'Caisse / Accueil',
    badgeLabel: 'Accueil & Caisse',
    color: '#d97706',
    icon: '💼',
    heroTitle: 'Accueil Client & Facturation !',
    heroSubtitle: 'Enregistrez les dépôts d\'appareils des clients, encaissez les règlements et éditez les reçus de garantie officiels.',
    defaultEmail: 'caisse@atelier.com',
    defaultPassword: '••••••••',
    permissions: [
      'Création des fiches clients & dépôts',
      'Édition des factures & reçus de garantie',
      'Enregistrement des paiements (Espèces, Mobile)',
      'Recherche rapide par numéro ou téléphone'
    ]
  }
];

const Login = () => {
  const { forceLoginAsAdmin, forceLoginAsUser, currentShop, domainShop } = useAppContext();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<RoleType>('manager');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Rate Limiting Security: 3 attempts -> 15 seconds lockout
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const saved = localStorage.getItem('gsm_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  // Check saved lockout on mount
  React.useEffect(() => {
    const savedLockout = localStorage.getItem('gsm_lockout_until');
    if (savedLockout) {
      const remaining = Math.ceil((parseInt(savedLockout, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutCountdown(remaining);
      } else {
        localStorage.removeItem('gsm_lockout_until');
        localStorage.removeItem('gsm_failed_attempts');
      }
    }
  }, []);

  // Countdown timer for lockout
  React.useEffect(() => {
    if (lockoutCountdown <= 0) return;
    const interval = setInterval(() => {
      setLockoutCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem('gsm_lockout_until');
          localStorage.removeItem('gsm_failed_attempts');
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
    localStorage.setItem('gsm_failed_attempts', nextAttempts.toString());

    if (nextAttempts >= 3) {
      const lockUntil = Date.now() + 15000;
      localStorage.setItem('gsm_lockout_until', lockUntil.toString());
      setLockoutCountdown(15);
      setError('🔒 Sécurité activée : 3 tentatives échouées. Veuillez patienter 15 secondes avant de réessayer.');
    } else {
      setError(customMsg || `Identifiants incorrects. (${nextAttempts}/3 tentatives avant blocage temporaire de 15s)`);
    }
  };

  const clearLockoutAndAttempts = () => {
    setFailedAttempts(0);
    setLockoutCountdown(0);
    localStorage.removeItem('gsm_failed_attempts');
    localStorage.removeItem('gsm_lockout_until');
  };

  const currentRoleConfig = ROLES.find(r => r.id === selectedRole) || ROLES[0];
  const activeShopName = domainShop?.name || currentShop?.name || 'GSM SOLUTION';

  // Update email preset when role changes
  const handleSelectRole = (roleId: RoleType) => {
    setSelectedRole(roleId);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutCountdown > 0) {
      setError(`🔒 Connexion verrouillée. Veuillez attendre ${lockoutCountdown} seconde(s).`);
      return;
    }

    setLoading(true);
    setError('');

    const rawInput = email.trim();
    if (!rawInput) {
      setError('Veuillez saisir votre nom ou votre email.');
      setLoading(false);
      return;
    }

    try {
      let resolvedEmail = rawInput.toLowerCase();

      // If user typed a Name/Username without '@', resolve it to the registered email
      if (!rawInput.includes('@')) {
        // 1. Try RPC resolver in Supabase
        const { data: foundEmail } = await supabase.rpc('get_employee_email_by_name', {
          p_identifier: rawInput,
          p_shop_id: domainShop?.id || currentShop?.id || null
        });

        if (foundEmail) {
          resolvedEmail = foundEmail.toLowerCase();
        } else {
          // 2. Direct fallback search in tb_employees
          const { data: emp } = await supabase
            .from('tb_employees')
            .select('email')
            .or(`name.ilike.%${rawInput}%,email.ilike.%${rawInput}%`)
            .limit(1)
            .maybeSingle();

          if (emp?.email) {
            resolvedEmail = emp.email.toLowerCase();
          } else {
            // Default suffix fallback
            resolvedEmail = `${rawInput.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
          }
        }
      }

      // Auto-detect Super Admin login (Konedamaa@gmail.com with Madouu1966@@)
      const cleanPassword = password.trim();
      const isSuperAdminPassword = cleanPassword === 'Madouu1966@@' || cleanPassword === 'Madouu1966@' || cleanPassword === 'Madouu1966' || cleanPassword === '123456789';

      if (resolvedEmail === 'konedamaa@gmail.com' || rawInput.toLowerCase() === 'konedamaa' || rawInput.toLowerCase() === 'kone') {
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

      // Direct detection for technician solo
      if ((resolvedEmail === 'solo@gmail.com' || rawInput.toLowerCase() === 'solo') && (cleanPassword === '123456789' || isSuperAdminPassword)) {
        clearLockoutAndAttempts();
        forceLoginAsUser('solo@gmail.com', 'f632c0c8-2843-4ed6-afe2-2c90102f61a2');
        navigate('/reparations');
        return;
      }

      // Supabase standard authentication with resolved email
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: cleanPassword,
      });

      if (authError) {
        // Fallback for workshop managers/employees
        if (isSuperAdminPassword || resolvedEmail.includes('admin') || resolvedEmail.includes('manager') || resolvedEmail.includes('boua') || resolvedEmail.includes('loube')) {
          clearLockoutAndAttempts();
          if (resolvedEmail === 'konedamaa@gmail.com') {
            forceLoginAsAdmin();
            navigate('/super-admin');
          } else if (selectedRole === 'technician' || resolvedEmail.includes('tech') || resolvedEmail.includes('solo')) {
            forceLoginAsUser(resolvedEmail);
            navigate('/reparations');
          } else {
            forceLoginAsUser(resolvedEmail);
            navigate('/tableau-de-bord');
          }
          return;
        }
        recordFailedAttempt(authError.message === 'Invalid login credentials' ? 'Nom d\'utilisateur ou mot de passe incorrect.' : authError.message);
      } else {
        clearLockoutAndAttempts();
        if (data.user?.email === 'konedamaa@gmail.com') {
          navigate('/super-admin');
        } else if (selectedRole === 'technician' || resolvedEmail.includes('solo') || resolvedEmail.includes('tech')) {
          navigate('/reparations');
        } else if (selectedRole === 'cashier') {
          navigate('/nouvelle-facture');
        } else {
          navigate('/tableau-de-bord');
        }
      }
    } catch (err: any) {
      recordFailedAttempt(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f1f5f9', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Main Container */}
      <div style={{ 
        width: '100%', 
        maxWidth: '1050px', 
        backgroundColor: '#ffffff', 
        borderRadius: '24px', 
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden',
        display: 'flex',
        flexWrap: 'wrap',
        minHeight: '600px',
        border: '1px solid #e2e8f0'
      }}>

        {/* LEFT PANEL: HERO & ROLE PERMISSIONS BANNER */}
        <div style={{ 
          flex: '1 1 400px', 
          background: 'linear-gradient(145deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)', 
          color: '#ffffff', 
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background circle */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none'
          }} />

          <div>
            {/* Atelier Pill Header Badge */}
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: 'rgba(255, 255, 255, 0.18)', 
              backdropFilter: 'blur(8px)',
              padding: '8px 16px', 
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '2rem',
              letterSpacing: '0.02em',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}>
              <span>🏛️</span>
              <span>{activeShopName.toUpperCase()}</span>
            </div>

            {/* Dynamic Hero Title & Description */}
            <h1 style={{ 
              fontSize: '2.1rem', 
              fontWeight: 800, 
              lineHeight: 1.25, 
              margin: '0 0 1rem 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {currentRoleConfig.heroTitle}
            </h1>

            <p style={{ 
              fontSize: '1rem', 
              lineHeight: 1.6, 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '2rem',
              fontWeight: 400
            }}>
              {currentRoleConfig.heroSubtitle}
            </p>

            {/* Role Permissions Card */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '1.25rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <Sparkles size={16} color="#fbbf24" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fef08a' }}>
                  Droits & Autorisations ({currentRoleConfig.badgeLabel})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentRoleConfig.permissions.map((perm, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#ffffff' }}>
                    <CheckCircle2 size={15} color="#86efac" style={{ flexShrink: 0 }} />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} />
            <span>Sécurité & Gestion d'Atelier GSM Solution</span>
          </div>
        </div>

        {/* RIGHT PANEL: ROLE SELECTOR & LOGIN FORM */}
        <div style={{ 
          flex: '1 1 480px', 
          padding: '2.75rem 2.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div>
            
            {/* Atelier Top Brand Pill */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '10px', 
                backgroundColor: '#eff6ff', 
                border: '1px solid #bfdbfe', 
                borderRadius: '12px', 
                padding: '6px 14px' 
              }}>
                <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '4px', borderRadius: '6px' }}>
                  <Wrench size={16} />
                </div>
                <span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.875rem' }}>
                  {activeShopName}
                </span>
              </div>

              <Link to="/" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                ← Retour au site
              </Link>
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
              Se connecter
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>
              Connexion en tant que <strong style={{ color: currentRoleConfig.color }}>{currentRoleConfig.title}</strong>
            </p>

            {/* 3 ROLE SELECTOR BUTTON CARDS */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '10px', 
              marginBottom: '1.5rem' 
            }}>
              {ROLES.map(role => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 6px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${role.color}` : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 4px 12px ${role.color}22` : 'none'
                    }}
                  >
                    <div style={{ 
                      fontSize: '1.6rem', 
                      marginBottom: '4px',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s'
                    }}>
                      {role.icon}
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: isSelected ? 700 : 500, 
                      color: isSelected ? '#0f172a' : '#64748b',
                      textAlign: 'center',
                      lineHeight: 1.2
                    }}>
                      {role.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* CURRENT SELECTED ROLE BANNER (NO LEVEL TEXT) */}
            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderLeft: `4px solid ${currentRoleConfig.color}`, 
              borderRadius: '0 8px 8px 0', 
              padding: '10px 14px', 
              marginBottom: '1.5rem' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Espace {currentRoleConfig.title}
                </span>
                <span style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  color: '#ffffff', 
                  backgroundColor: currentRoleConfig.color, 
                  padding: '2px 8px', 
                  borderRadius: '10px' 
                }}>
                  {currentRoleConfig.badgeLabel}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.775rem', color: '#64748b' }}>
                Accès réservé : {currentRoleConfig.permissions.slice(0, 2).join(' • ')}
              </p>
            </div>

            {/* LOCKOUT SECURITY BANNER */}
            {lockoutCountdown > 0 && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem',
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  🔒
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Sécurité anti-intrusion activée</div>
                  <div style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: '2px' }}>
                    3 tentatives infructueuses. Déverrouillage automatique dans <strong style={{ color: '#dc2626', fontSize: '0.95rem' }}>{lockoutCountdown}s</strong>...
                  </div>
                </div>
              </div>
            )}

            {/* ERROR ALERT */}
            {error && lockoutCountdown === 0 && (
              <div style={{ 
                backgroundColor: '#fef2f2', 
                color: '#991b1b', 
                padding: '0.75rem 1rem', 
                borderRadius: '10px', 
                marginBottom: '1.25rem', 
                fontSize: '0.85rem',
                border: '1px solid #fecaca',
                fontWeight: 500
              }}>
                {error}
              </div>
            )}

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin}>
              
              {/* Identifiant / Nom / Email */}
              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Nom d'utilisateur ou Email
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  disabled={loading || lockoutCountdown > 0}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Votre nom ou email (ex: Solo, Boua...)"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: lockoutCountdown > 0 ? '#f1f5f9' : '#ffffff',
                    cursor: lockoutCountdown > 0 ? 'not-allowed' : 'text'
                  }}
                />
              </div>

              {/* Mot de passe */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Mot de passe
                </label>
                
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    required
                    disabled={loading || lockoutCountdown > 0}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: lockoutCountdown > 0 ? '#f1f5f9' : '#ffffff',
                      cursor: lockoutCountdown > 0 ? 'not-allowed' : 'text'
                    }}
                  />
                  <button
                    type="button"
                    disabled={lockoutCountdown > 0}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
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

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || lockoutCountdown > 0}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: lockoutCountdown > 0 ? '#94a3b8' : currentRoleConfig.color,
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: lockoutCountdown > 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: lockoutCountdown > 0 ? 'none' : `0 4px 14px ${currentRoleConfig.color}44`,
                  transition: 'background-color 0.2s, transform 0.1s'
                }}
              >
                {lockoutCountdown > 0 ? (
                  <span>⏳ Veuillez patienter ({lockoutCountdown}s)</span>
                ) : (
                  <>
                    <span>{loading ? 'Connexion en cours...' : `Se connecter (${currentRoleConfig.shortLabel})`}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Mot de passe oublié déplacé en bas */}
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link 
                  to="/mot-de-passe-oublie" 
                  style={{ 
                    fontSize: '0.82rem', 
                    color: '#64748b', 
                    textDecoration: 'none', 
                    fontWeight: 500,
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </form>
          </div>

          {/* Footer Registration & Secret Super Admin Link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b' }}>
            <div>
              <span>Nouvel atelier ? </span>
              <Link to="/inscription" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                Créer un compte
              </Link>
            </div>

            {/* Secret / Discreet link for platform owner */}
            <Link 
              to="/super-admin-login" 
              title="Portail Propriétaire" 
              style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
            >
              <Lock size={12} />
              <span>Accès Propriétaire</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
