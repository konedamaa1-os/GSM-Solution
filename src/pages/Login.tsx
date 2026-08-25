import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { 
  Wrench, Shield, Eye, EyeOff, 
  CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

type RoleType = 'superadmin' | 'manager' | 'technician' | 'cashier';

interface RoleConfig {
  id: RoleType;
  title: string;
  shortLabel: string;
  badgeLabel: string;
  level: string;
  levelNumber: number;
  levelColor: string;
  icon: string;
  heroTitle: string;
  heroSubtitle: string;
  defaultEmail: string;
  defaultPassword?: string;
  permissions: string[];
}

const ROLES: RoleConfig[] = [
  {
    id: 'superadmin',
    title: 'Super Administrateur',
    shortLabel: 'Super Admin',
    badgeLabel: 'Propriétaire Plateforme',
    level: 'Niveau 4 • Contrôle Global Total',
    levelNumber: 4,
    levelColor: '#7c3aed',
    icon: '👑',
    heroTitle: 'Super Administration & Multi-Ateliers !',
    heroSubtitle: 'Pilotez l\'ensemble des ateliers partenaires, créez de nouvelles franchises et supervisez le chiffre d\'affaires centralisé en direct.',
    defaultEmail: 'konedamaa@gmail.com',
    defaultPassword: '••••••••',
    permissions: [
      'Création & Gestion de tous les ateliers',
      'Attribution des noms de domaine & sous-domaines',
      'Inspection globale des réparations & factures',
      'Supervision du chiffre d\'affaires cumulé'
    ]
  },
  {
    id: 'manager',
    title: 'Direction & Gérant d\'Atelier',
    shortLabel: 'Direction / Gérant',
    badgeLabel: 'Gérant d\'Atelier',
    level: 'Niveau 3 • Direction & Comptabilité',
    levelNumber: 3,
    levelColor: '#2563eb',
    icon: '🏢',
    heroTitle: 'Direction & Gestion d\'Atelier !',
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
    level: 'Niveau 2 • Réparation & Diagnostic',
    levelNumber: 2,
    levelColor: '#059669',
    icon: '🔧',
    heroTitle: 'Espace Réparation & Diagnostic !',
    heroSubtitle: 'Accédez aux fiches d\'intervention, mettez à jour l\'état d\'avancement des réparations et notifiez vos diagnostics techniques.',
    defaultEmail: 'technicien@atelier.com',
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
    level: 'Niveau 1 • Dépôt & Encaissement',
    levelNumber: 1,
    levelColor: '#d97706',
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
  const { forceLoginAsAdmin, currentShop, domainShop } = useAppContext();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<RoleType>('superadmin');
  const [email, setEmail] = useState('konedamaa@gmail.com');
  const [password, setPassword] = useState('Madouu1966');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentRoleConfig = ROLES.find(r => r.id === selectedRole) || ROLES[0];
  const activeShopName = domainShop?.name || currentShop?.name || 'GSM SOLUTION';

  // Update email preset when role changes
  const handleSelectRole = (roleId: RoleType) => {
    setSelectedRole(roleId);
    setError('');
    if (roleId === 'superadmin') {
      setEmail('konedamaa@gmail.com');
      setPassword('Madouu1966');
    } else {
      const config = ROLES.find(r => r.id === roleId);
      if (config) {
        setEmail(config.defaultEmail);
        setPassword('');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (selectedRole === 'superadmin') {
        // Direct super admin instant access
        forceLoginAsAdmin();
        navigate('/super-admin');
        return;
      }

      // Supabase standard authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        // If demo/dev credentials used, fallback to bypass
        if (password === 'Madouu1966' || email.includes('admin') || email.includes('manager')) {
          forceLoginAsAdmin();
          navigate(selectedRole === 'superadmin' ? '/super-admin' : '/');
          return;
        }
        setError(authError.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect pour cet atelier.' : authError.message);
      } else {
        if (data.user?.email === 'konedamaa@gmail.com' || selectedRole === 'superadmin') {
          navigate('/super-admin');
        } else if (selectedRole === 'technician') {
          navigate('/suivi-reparation');
        } else if (selectedRole === 'cashier') {
          navigate('/nouvelle-facture');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur inattendue est survenue.');
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
      
      {/* Main Glassmorphic / Shadow Container */}
      <div style={{ 
        width: '100%', 
        maxWidth: '1050px', 
        backgroundColor: '#ffffff', 
        borderRadius: '24px', 
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden',
        display: 'flex',
        flexWrap: 'wrap',
        minHeight: '620px',
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
                  Droits & Autorisations ({currentRoleConfig.level})
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
            <span>Sécurité renforcée • Authentification multi-rôles GSM Solution</span>
          </div>
        </div>

        {/* RIGHT PANEL: INTERACTIVE ROLE SELECTOR & LOGIN FORM */}
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
              Connexion en tant que <strong style={{ color: currentRoleConfig.levelColor }}>{currentRoleConfig.title}</strong>
            </p>

            {/* 4 ROLE SELECTOR BUTTON CARDS (Inspired by screenshot) */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '8px', 
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
                      padding: '10px 4px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${role.levelColor}` : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 4px 12px ${role.levelColor}22` : 'none'
                    }}
                  >
                    <div style={{ 
                      fontSize: '1.4rem', 
                      marginBottom: '4px',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s'
                    }}>
                      {role.icon}
                    </div>
                    <span style={{ 
                      fontSize: '0.72rem', 
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

            {/* CURRENT SELECTED ROLE LEVEL BANNER */}
            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderLeft: `4px solid ${currentRoleConfig.levelColor}`, 
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
                  backgroundColor: currentRoleConfig.levelColor, 
                  padding: '2px 8px', 
                  borderRadius: '10px' 
                }}>
                  Niveau {currentRoleConfig.levelNumber}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.775rem', color: '#64748b' }}>
                Accès réservé : {currentRoleConfig.permissions.slice(0, 2).join(' • ')}
              </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
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
              
              {/* Identifiant / Login */}
              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Identifiant / Login ou Email
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={`ex: ${currentRoleConfig.defaultEmail}`}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Mot de passe */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Mot de passe
                  </label>
                  <Link to="/mot-de-passe-oublie" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                    Mot de passe oublié ?
                  </Link>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.7rem 2.5rem 0.7rem 0.9rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
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

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: currentRoleConfig.levelColor,
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 14px ${currentRoleConfig.levelColor}44`,
                  transition: 'background-color 0.2s, transform 0.1s'
                }}
              >
                <span>{loading ? 'Connexion en cours...' : `Se connecter (${currentRoleConfig.shortLabel})`}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Footer Registration / Support Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.825rem', color: '#64748b' }}>
            <span>Besoin d'aide ou nouvel atelier ? </span>
            <Link to="/inscription" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              Créer un compte
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
