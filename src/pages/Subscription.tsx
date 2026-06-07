import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, AlertTriangle, Star, Shield } from 'lucide-react';

const Subscription = () => {
  const { settings, updateSettings } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const currentPlan = settings.subscription_plan || 'Standard';
  const status = settings.subscription_status || 'active';
  const endDate = settings.subscription_end_date ? new Date(settings.subscription_end_date).toLocaleDateString() : 'Non définie';

  const handleUpgrade = async (plan: 'Standard' | 'Professionnelle') => {
    setLoading(true);
    try {
      // In a real app, this would redirect to a payment gateway
      // For now, we simulate an update
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      await updateSettings({
        ...settings,
        subscription_plan: plan,
        subscription_end_date: oneYearFromNow.toISOString(),
        subscription_status: 'active'
      });
      setMessage(`Votre abonnement ${plan} a été activé avec succès !`);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Mon Abonnement</h2>

      {message && (
        <div style={{ padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {message}
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Statut actuel
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              Forfait : <span style={{ color: 'var(--primary-color)' }}>{currentPlan}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {status === 'active' ? (
                <span style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={16} /> Actif jusqu'au {endDate}</span>
              ) : (
                <span style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={16} /> Expiré le {endDate}</span>
              )}
            </div>
          </div>
          {status === 'expired' && (
            <button className="btn btn-primary" onClick={() => handleUpgrade(currentPlan as any)}>
              Renouveler maintenant
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Standard Plan */}
        <div className="card" style={{ border: currentPlan === 'Standard' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', position: 'relative' }}>
          {currentPlan === 'Standard' && (
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.25rem 1rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
              Forfait Actuel
            </div>
          )}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Star size={24} color="#f59e0b" />
              Standard
            </h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>50 000 CFA <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ an</span></div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
            <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="#10b981" /> Gestion des réparations</li>
            <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="#10b981" /> Impressions de factures</li>
            <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="#10b981" /> Jusqu'à 2 employés</li>
            <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>❌ Module de Comptabilité</li>
            <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>❌ Suivi des paiements</li>
          </ul>
          <button 
            className="btn" 
            style={{ width: '100%', backgroundColor: currentPlan === 'Standard' ? '#f3f4f6' : 'var(--primary-color)', color: currentPlan === 'Standard' ? 'var(--text-secondary)' : 'white' }}
            disabled={currentPlan === 'Standard' || loading}
            onClick={() => handleUpgrade('Standard')}
          >
            {currentPlan === 'Standard' ? 'Déjà actif' : 'Choisir ce forfait'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="card" style={{ border: currentPlan === 'Professionnelle' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', position: 'relative' }}>
          {currentPlan === 'Professionnelle' && (
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.25rem 1rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
              Forfait Actuel
            </div>
          )}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Shield size={24} color="#3b82f6" />
              Professionnelle
            </h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>150 000 CFA <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ an</span></div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
            <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="#10b981" /> Tout le plan Standard</li>
            <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="#10b981" /> Employés illimités</li>
            <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="#10b981" /> Module de Comptabilité</li>
            <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="#10b981" /> Suivi des factures impayées</li>
            <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="#10b981" /> Filtres par période</li>
          </ul>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', backgroundColor: currentPlan === 'Professionnelle' ? '#f3f4f6' : 'var(--primary-color)', color: currentPlan === 'Professionnelle' ? 'var(--text-secondary)' : 'white' }}
            disabled={currentPlan === 'Professionnelle' || loading}
            onClick={() => handleUpgrade('Professionnelle')}
          >
            {currentPlan === 'Professionnelle' ? 'Déjà actif' : 'Mettre à niveau (Pro)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
