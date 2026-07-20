import { useNavigate } from 'react-router-dom';
import { Store, Clock, Users, TrendingUp, ChevronRight, Check, Wrench, Receipt } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backgroundColor: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '1rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#6366f1', color: 'white', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', color: 'white' }}>GSM SOLUTION</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                color: '#94a3b8', 
                background: 'none', 
                border: 'none', 
                fontSize: '0.95rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'white'}
              onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              Connexion
            </button>
            <button 
              onClick={() => navigate('/inscription')}
              style={{ 
                backgroundColor: '#6366f1', 
                color: 'white', 
                border: 'none', 
                padding: '0.625rem 1.25rem', 
                borderRadius: '8px', 
                fontSize: '0.95rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
            >
              Créer une boutique
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        position: 'relative',
        padding: '8rem 2rem 6rem 2rem', 
        background: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            backgroundColor: 'rgba(99, 102, 241, 0.1)', 
            border: '1px solid rgba(99, 102, 241, 0.2)', 
            padding: '0.35rem 1rem', 
            borderRadius: '99px',
            marginBottom: '2rem',
            color: '#818cf8',
            fontSize: '0.875rem',
            fontWeight: 600
          }}>
            <Store size={14} />
            <span>Logiciel SaaS Multi-Boutiques</span>
          </div>

          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
            fontWeight: 800, 
            lineHeight: 1.1,
            color: 'white', 
            margin: '0 0 1.5rem 0',
            letterSpacing: '-0.02em'
          }}>
            Gérez vos boutiques de réparation <br />
            <span style={{ 
              background: 'linear-gradient(to right, #818cf8, #c084fc)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent'
            }}>
              comme un pro
            </span>
          </h1>

          <p style={{ 
            fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', 
            color: '#94a3b8', 
            lineHeight: 1.6,
            maxWidth: '700px',
            margin: '0 auto 3rem auto'
          }}>
            La plateforme tout-en-un pour éditer des factures professionnelles, suivre les statuts des réparations en temps réel, gérer vos techniciens et faire grandir votre activité.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/inscription')}
              style={{ 
                backgroundColor: '#6366f1', 
                color: 'white', 
                border: 'none', 
                padding: '1rem 2rem', 
                borderRadius: '10px', 
                fontSize: '1.05rem', 
                fontWeight: 700, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
              }}
            >
              Démarrer l'essai gratuit
              <ChevronRight size={18} />
            </button>
            
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                color: '#f8fafc', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                padding: '1rem 2rem', 
                borderRadius: '10px', 
                fontSize: '1.05rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
            >
              Se connecter
            </button>
          </div>

        </div>
      </section>

      {/* Sleek Mock Interface Preview */}
      <section style={{ padding: '0 2rem 6rem 2rem' }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          backgroundColor: '#1e293b', 
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}>
          {/* Header Bar */}
          <div style={{ backgroundColor: '#0f172a', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '1rem' }}>https://gsmsolution.vercel.app/dashboard</div>
          </div>
          {/* Mock UI Contents */}
          <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem' }}>
            {/* Sidebar */}
            <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ height: '35px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', width: '80%' }}></div>
              <div style={{ height: '30px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderLeft: '3px solid #6366f1', borderRadius: '0 6px 6px 0' }}></div>
              <div style={{ height: '30px', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}></div>
              <div style={{ height: '30px', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}></div>
              <div style={{ height: '30px', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}></div>
            </div>
            {/* Main content */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Réparations actives</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginTop: '0.25rem' }}>24</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Chiffre d'Affaires</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e', marginTop: '0.25rem' }}>1 450 €</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Taux de Réussite</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a855f7', marginTop: '0.25rem' }}>96%</div>
                </div>
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ height: '15px', backgroundColor: 'rgba(255, 255, 255, 0.08)', width: '30%', borderRadius: '4px' }}></div>
                  <div style={{ height: '15px', backgroundColor: 'rgba(255, 255, 255, 0.08)', width: '10%', borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <div style={{ height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', width: '40%', borderRadius: '4px' }}></div>
                    <div style={{ height: '12px', backgroundColor: 'rgba(34, 197, 94, 0.2)', width: '15%', borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <div style={{ height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', width: '50%', borderRadius: '4px' }}></div>
                    <div style={{ height: '12px', backgroundColor: 'rgba(99, 102, 241, 0.2)', width: '15%', borderRadius: '4px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" style={{ padding: '6rem 2rem', backgroundColor: '#0b0f19' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', margin: '0 0 1rem 0' }}>Conçu pour les spécialistes de la réparation</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Toutes les fonctionnalités dont vous avez besoin pour administrer sereinement votre activité de réparation de smartphones et d'ordinateurs.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#6366f1', marginBottom: '1.25rem' }}>
                <Receipt size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem', marginTop: 0 }}>Facturation intuitive</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem', margin: 0 }}>Créez et imprimez des factures professionnelles en quelques secondes avec gestion des dépôts et conditions de garantie éditables.</p>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#a855f7', marginBottom: '1.25rem' }}>
                <Clock size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem', marginTop: 0 }}>Suivi des réparations</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem', margin: 0 }}>Suivez les statuts des téléphones déposés (Reçu, En cours, Prêt, Livré) pour offrir une transparence totale à vos clients.</p>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#22c55e', marginBottom: '1.25rem' }}>
                <Users size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem', marginTop: 0 }}>Gestion des employés</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem', margin: 0 }}>Affectez des rôles (Manager, Employé) pour encadrer les droits d'accès à la base de données et suivre les actions effectuées.</p>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#f59e0b', marginBottom: '1.25rem' }}>
                <TrendingUp size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem', marginTop: 0 }}>Rapports financiers</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem', margin: 0 }}>Visualisez en direct l'évolution de vos bénéfices, le volume des ventes et déterminez les réparations les plus rentables.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', margin: '0 0 1rem 0' }}>Des tarifs transparents et adaptés</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Démarrez gratuitement et faites évoluer votre abonnement selon vos besoins.</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
            
            {/* Starter Plan */}
            <div style={{ backgroundColor: '#1e293b', padding: '2.5rem 2rem', borderRadius: '16px', width: '320px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Starter</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '1rem 0 1.5rem 0' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>0 €</span>
                <span style={{ color: '#94a3b8' }}>/ mois</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', flex: 1 }}>Idéal pour les réparateurs indépendants qui débutent.</p>
              <ul style={{ padding: 0, margin: '0 0 2.5rem 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}><Check size={16} style={{ color: '#22c55e' }} /> 1 Boutique</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}><Check size={16} style={{ color: '#22c55e' }} /> Jusqu'à 50 factures/mois</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}><Check size={16} style={{ color: '#22c55e' }} /> Suivi de base</li>
              </ul>
              <button 
                onClick={() => navigate('/inscription')}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Sélectionner
              </button>
            </div>

            {/* Pro Plan */}
            <div style={{ backgroundColor: '#1e293b', padding: '2.5rem 2rem', borderRadius: '16px', width: '320px', display: 'flex', flexDirection: 'column', border: '2px solid #6366f1', position: 'relative', transform: 'scale(1.05)' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#6366f1', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '99px', textTransform: 'uppercase' }}>Populaire</div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase' }}>Pro</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '1rem 0 1.5rem 0' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>19 €</span>
                <span style={{ color: '#94a3b8' }}>/ mois</span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '2rem', flex: 1 }}>Parfait pour les boutiques de réparation actives et les petites équipes.</p>
              <ul style={{ padding: 0, margin: '0 0 2.5rem 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}><Check size={16} style={{ color: '#22c55e' }} /> Boutiques illimitées</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}><Check size={16} style={{ color: '#22c55e' }} /> Factures & Clients illimités</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}><Check size={16} style={{ color: '#22c55e' }} /> Suivi en temps réel complet</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}><Check size={16} style={{ color: '#22c55e' }} /> Statistiques avancées</li>
              </ul>
              <button 
                onClick={() => navigate('/inscription')}
                style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
              >
                Essayer gratuitement
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0b0f19', padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#64748b', fontSize: '0.875rem' }}>
        <p>© 2026 GSM SOLUTION. Tous droits réservés. Développé pour booster l'activité des réparateurs.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
