import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Store, ArrowRight, CheckCircle, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperAdmin = () => {
  const { allShops, createShopWithManager, switchShop, currentShop, logout, user } = useAppContext();
  const navigate = useNavigate();
  
  const [shopName, setShopName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!shopName.trim() || !managerName.trim() || !managerEmail.trim() || !managerPassword.trim()) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    try {
      const result = await createShopWithManager(
        shopName.trim(),
        managerName.trim(),
        managerEmail.trim(),
        managerPassword.trim()
      );

      if (result.success) {
        setMessage('La boutique et son manager ont été créés avec succès ! Le manager peut maintenant se connecter directement avec ses identifiants.');
        setShopName('');
        setManagerName('');
        setManagerEmail('');
        setManagerPassword('');
      } else {
        setError(result.error || 'Une erreur est survenue lors de la création de la boutique.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessShop = async (shopId: string) => {
    await switchShop(shopId);
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
      {/* Standalone Super Admin Header */}
      <header style={{ 
        backgroundColor: '#0f172a', 
        color: '#f8fafc', 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '4px solid var(--primary-color, #6366f1)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--primary-color, #6366f1)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
            <Shield size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, letterSpacing: '0.05em' }}>GSM SOLUTION</h1>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Plateforme de Gestion</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Super Administrateur</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.email}</div>
          </div>
          
          <button 
            onClick={() => logout().then(() => navigate('/login'))}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              backgroundColor: '#e11d48', 
              color: 'white', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px', 
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#be123c'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Admin Console */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        
        {/* Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Console d'Administration</h2>
            <p style={{ color: '#64748b', margin: 0 }}>Gérez les boutiques de la plateforme et configurez les comptes managers.</p>
          </div>
          
          {currentShop && (
            <button 
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'white',
                border: '1px solid #cbd5e1',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LayoutDashboard size={18} />
              Accéder à l'application ({currentShop.name})
            </button>
          )}
        </div>

        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bbf7d0' }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: 500 }}>{message}</span>
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fca5a5', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
          
          {/* Create Shop Form Card */}
          <div className="card" style={{ padding: '2rem', height: 'fit-content', backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#0f172a', margin: '0 0 1.5rem 0' }}>
              <Plus size={22} style={{ color: 'var(--primary-color, #6366f1)' }} />
              Créer une nouvelle boutique
            </h3>
            
            <form onSubmit={handleCreateShop}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Nom de la boutique</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={shopName}
                  onChange={e => setShopName(e.target.value)}
                  placeholder="Ex: GSM Repair Center Divo"
                  required
                />
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', margin: '1.5rem 0', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>Création du compte Manager</h4>
                
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ color: '#334155' }}>Nom complet</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    placeholder="Ex: Boua Koné"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ color: '#334155' }}>Adresse Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={managerEmail}
                    onChange={e => setManagerEmail(e.target.value)}
                    placeholder="Ex: boua@gmail.com"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ color: '#334155' }}>Mot de passe du manager</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={managerPassword}
                    onChange={e => setManagerPassword(e.target.value)}
                    placeholder="Définir un mot de passe temporaire"
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                    Ce mot de passe permettra au manager de s'authentifier immédiatement.
                  </span>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer la boutique et son Manager'}
              </button>
            </form>
          </div>

          {/* Shops List Card */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#0f172a', margin: '0 0 1.5rem 0' }}>
              <Store size={22} style={{ color: 'var(--primary-color, #6366f1)' }} />
              Boutiques de la plateforme ({allShops.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {allShops.map(shop => {
                const isActive = currentShop?.id === shop.id;
                return (
                  <div 
                    key={shop.id} 
                    style={{ 
                      padding: '1.25rem', 
                      border: isActive ? '2px solid var(--primary-color, #6366f1)' : '1px solid #e2e8f0', 
                      borderRadius: '10px',
                      backgroundColor: isActive ? '#f0fdf4' : 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: isActive ? '0 2px 4px -1px rgb(0 0 0 / 0.05)' : 'none'
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>
                        {shop.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ID: {shop.id.substring(0, 8)}...
                      </span>
                    </div>

                    <button
                      onClick={() => handleAccessShop(shop.id)}
                      className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        fontSize: '0.825rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {isActive ? 'Boutique Active' : 'Accéder'}
                      {!isActive && <ArrowRight size={14} />}
                    </button>
                  </div>
                );
              })}

              {allShops.length === 0 && (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem 0', fontSize: '0.95rem' }}>
                  Aucune boutique enregistrée pour le moment.
                </p>
              )}
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default SuperAdmin;
