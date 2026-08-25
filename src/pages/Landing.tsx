import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Smartphone, FileText, Users, CreditCard, Shield, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Landing = () => {
  const { user, forceLoginAsAdmin } = useAppContext();
  const navigate = useNavigate();

  const [isBackdoorOpen, setIsBackdoorOpen] = React.useState(false);
  const [backdoorUsername, setBackdoorUsername] = React.useState('');
  const [backdoorPassword, setBackdoorPassword] = React.useState('');
  const [backdoorError, setBackdoorError] = React.useState('');

  const handleOpenBackdoor = () => {
    setIsBackdoorOpen(true);
    setBackdoorError('');
    setBackdoorUsername('');
    setBackdoorPassword('');
  };

  const handleBackdoorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (backdoorUsername === 'konedamaa@gmail.com' && backdoorPassword === 'Madouu1966') {
      forceLoginAsAdmin();
      setIsBackdoorOpen(false);
      navigate('/super-admin');
    } else {
      setBackdoorError('Identifiants super-admin invalides.');
    }
  };

  const features = [
    {
      icon: <FileText size={24} style={{ color: 'var(--primary-color)' }} />,
      title: 'Facturation Instantanée',
      description: 'Générez des factures de réparation professionnelles en moins de 30 secondes pour vos clients.'
    },
    {
      icon: <Wrench size={24} style={{ color: '#10b981' }} />,
      title: 'Suivi des Réparations',
      description: "Suivez l'état d'avancement de chaque appareil de l'atelier : En attente, En cours, Terminé, Annulé."
    },
    {
      icon: <Users size={24} style={{ color: '#f59e0b' }} />,
      title: 'Gestion Client & Historique',
      description: 'Recherchez un client par nom ou téléphone et retrouvez l\'historique complet de ses réparations.'
    },
    {
      icon: <Smartphone size={24} style={{ color: '#3b82f6' }} />,
      title: 'Catalogue Appareils & Pannes',
      description: 'Enregistrez vos pannes fréquentes et modèles récurrents pour accélérer la saisie de nouvelles factures.'
    },
    {
      icon: <Shield size={24} style={{ color: '#8b5cf6' }} />,
      title: 'Sécurité & Rôles',
      description: 'Droits d\'accès configurés pour les techniciens (réparateurs) et les responsables de boutique (managers).'
    },
    {
      icon: <CreditCard size={24} style={{ color: '#ec4899' }} />,
      title: 'Module Comptabilité',
      description: 'Analysez vos revenus réels journaliers, hebdomadaires ou mensuels en fonction des paiements encaissés.'
    }
  ];

  const faqs = [
    {
      q: 'Puis-je utiliser GSM SOLUTION sur plusieurs boutiques ?',
      a: 'Le plan Professionnel vous permet de créer plusieurs boutiques sous le même compte et d\'ajouter autant d\'employés que nécessaire.'
    },
    {
      q: 'Comment fonctionne la limite de factures du plan Standard ?',
      a: 'Le plan Standard est idéal pour tester notre service ou pour les petites activités, limité à un maximum de 20 factures au total. Au-delà, vous devrez passer au plan Professionnel.'
    },
    {
      q: 'Mes données clients sont-elles sécurisées ?',
      a: 'Oui, toutes vos données de facturation et de clientèle sont stockées de façon sécurisée avec chiffrement de bout en bout grâce à la technologie cloud.'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: 'var(--font-family)', transition: 'background-color 0.25s ease' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div 
          onDoubleClick={handleOpenBackdoor} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary-color)', cursor: 'default', userSelect: 'none' }}
          title="Double-cliquez pour l'accès super-admin"
        >
          <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <Wrench size={20} />
          </div>
          <span>GSM SOLUTION</span>
        </div>
        
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Fonctionnalités</a>
          <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Tarifs</a>
          <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>FAQ</a>
        </nav>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Tableau de bord <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                Connexion
              </Link>
              <Link to="/inscription" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Essai Gratuit
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem 4rem 2rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: '9999px', backgroundColor: 'var(--stat-blue-bg)', color: 'var(--primary-color)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
          ✨ Logiciel de gestion tout-en-un pour ateliers de réparation
        </div>
        
        <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Gérez votre atelier de réparation de téléphones en toute simplicité
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '750px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
          Générez des factures professionnelles, suivez le statut des réparations en temps réel, gérez vos techniciens et optimisez votre comptabilité.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
              Accéder au Tableau de Bord
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/inscription')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                Créer mon compte
              </button>
              <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                Démo Interactive
              </button>
            </>
          )}
        </div>

        {/* Dashboard Mockup Preview */}
        <div style={{ marginTop: '5rem', position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', background: 'var(--surface-color)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
          </div>
          <div style={{ width: '100%', height: '350px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Smartphone size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem', opacity: 0.8 }} />
              <h3 style={{ color: 'var(--text-primary)' }}>Interface Intuitive de Gestion</h3>
              <p style={{ fontSize: '0.9rem' }}>Tableau de bord comptable, suivi des pannes, fiches d'appareils et tickets clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '6rem 2rem', backgroundColor: 'var(--surface-color)', transition: 'background-color 0.25s ease' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Tout ce dont vous avez besoin pour réussir</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Découvrez les modules développés spécifiquement pour simplifier le travail quotidien de votre équipe.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ marginBottom: 0, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-color)', height: '100%' }}>
                <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-color)', width: 'fit-content' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Des tarifs transparents, sans engagement</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Choisissez la formule la plus adaptée à la taille de votre commerce.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            
            {/* Standard Plan */}
            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', border: '1px solid var(--border-color)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={20} color="#f59e0b" /> Standard
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: 'var(--bg-color)', color: 'var(--text-secondary)' }}>Boutique test</span>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>50 000 CFA <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ an</span></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Parfait pour démarrer et tester les fonctionnalités</p>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><CheckCircle size={16} color="#10b981" /> Accès complet aux modules</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><CheckCircle size={16} color="#10b981" /> Suivi de réparations</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>⚠️ Limité à 20 factures au total</li>
              </ul>
              <button onClick={() => navigate('/inscription')} className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>
                Commencer maintenant
              </button>
            </div>

            {/* Pro Plan */}
            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', border: '2px solid var(--primary-color)', position: 'relative', transform: 'scale(1.02)' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.35rem 1.25rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recommandé
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={20} color="var(--primary-color)" /> Professionnelle
                </h3>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>150 000 CFA <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ an</span></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Pour les boutiques en pleine croissance</p>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><CheckCircle size={16} color="#10b981" /> Factures de réparation illimitées</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><CheckCircle size={16} color="#10b981" /> Employés et techniciens illimités</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><CheckCircle size={16} color="#10b981" /> Export de données comptables</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><CheckCircle size={16} color="#10b981" /> Support prioritaire 24/7</li>
              </ul>
              <button onClick={() => navigate('/inscription')} className="btn btn-primary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>
                Choisir le plan Pro
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '6rem 2rem', backgroundColor: 'var(--surface-color)', transition: 'background-color 0.25s ease' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Questions Fréquentes</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Retrouvez les réponses aux questions les plus courantes sur notre logiciel.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: 600 }}>{f.q}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(79, 70, 229, 0.05))', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>Prêt à moderniser votre atelier ?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Rejoignez dès aujourd'hui les professionnels qui nous font confiance pour la gestion de leur boutique.</p>
          <button onClick={() => navigate('/inscription')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            Créer mon compte gratuitement
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            <Wrench size={18} style={{ color: 'var(--primary-color)' }} />
            <span>GSM SOLUTION</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} GSM SOLUTION. Tous droits réservés.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Mentions légales</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Confidentialité</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>

      {/* Backdoor Super-Admin Login Modal */}
      {isBackdoorOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '380px', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', marginBottom: 0 }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
              <Shield size={20} />
              Accès Super-Administrateur
            </h3>
            
            {backdoorError && (
              <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--stat-red-bg)', color: 'var(--stat-red-text)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {backdoorError}
              </div>
            )}

            <form onSubmit={handleBackdoorSubmit}>
              <div className="form-group">
                <label className="form-label">Identifiant</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={backdoorUsername}
                  onChange={e => setBackdoorUsername(e.target.value)}
                  placeholder="konedamaa@gmail.com"
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Mot de passe</label>
                <input 
                  type="password" 
                  className="form-control" 
                  required 
                  value={backdoorPassword}
                  onChange={e => setBackdoorPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsBackdoorOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;
