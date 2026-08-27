import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Smartphone, Wrench, Plus, Trash2 } from 'lucide-react';

const Catalog = () => {
  const { deviceModels, commonIssues, addDeviceModel, deleteDeviceModel, addCommonIssue, deleteCommonIssue } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'models' | 'issues'>('models');
  
  // Model state
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  
  // Issue state
  const [newIssueName, setNewIssueName] = useState('');
  const [newIssuePrice, setNewIssuePrice] = useState('');

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand || !newModel) return;
    await addDeviceModel({ brand: newBrand.trim().toUpperCase(), model: newModel.trim().toUpperCase() });
    setNewBrand('');
    setNewModel('');
  };

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueName) return;
    await addCommonIssue({ 
      name: newIssueName.trim().toUpperCase(), 
      default_price: newIssuePrice ? parseFloat(newIssuePrice) : undefined 
    });
    setNewIssueName('');
    setNewIssuePrice('');
  };

  return (
    <div className="catalog-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Catalogue</h1>
          <p className="page-subtitle">Gérez vos modèles d'appareils et pannes fréquentes pour une facturation plus rapide.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'models' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('models')}
        >
          <Smartphone size={20} /> Modèles d'Appareils
        </button>
        <button 
          className={`btn ${activeTab === 'issues' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('issues')}
        >
          <Wrench size={20} /> Pannes Fréquentes
        </button>
      </div>

      {activeTab === 'models' && (
        <div className="grid">
          <div className="card">
            <h2 className="section-title">Ajouter un Modèle</h2>
            <form onSubmit={handleAddModel}>
              <div className="form-group">
                <label className="form-label">Marque (ex: Apple, Samsung)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newBrand} 
                  onChange={e => setNewBrand(e.target.value.toUpperCase())} 
                  required 
                  placeholder="APPLE"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Modèle</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newModel} 
                  onChange={e => setNewModel(e.target.value.toUpperCase())} 
                  required 
                  placeholder="IPHONE 13 PRO"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={20} /> Ajouter au catalogue
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="section-title">Modèles Enregistrés</h2>
            {deviceModels.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Aucun modèle enregistré pour le moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {deviceModels.map(model => (
                  <div key={model.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{model.brand}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{model.model}</div>
                    </div>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => { if(window.confirm('Supprimer ce modèle ?')) deleteDeviceModel(model.id); }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="grid">
          <div className="card">
            <h2 className="section-title">Ajouter une Panne</h2>
            <form onSubmit={handleAddIssue}>
              <div className="form-group">
                <label className="form-label">Nom de la panne</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newIssueName} 
                  onChange={e => setNewIssueName(e.target.value.toUpperCase())} 
                  required 
                  placeholder="REMPLACEMENT ÉCRAN"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prix standard indicatif (€)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={newIssuePrice} 
                  onChange={e => setNewIssuePrice(e.target.value)} 
                  placeholder="150"
                  min="0"
                  step="0.01"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={20} /> Ajouter au catalogue
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="section-title">Pannes Enregistrées</h2>
            {commonIssues.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Aucune panne enregistrée pour le moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {commonIssues.map(issue => (
                  <div key={issue.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{issue.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {issue.default_price ? `${issue.default_price.toFixed(2)} €` : 'Prix sur devis'}
                      </div>
                    </div>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => { if(window.confirm('Supprimer cette panne ?')) deleteCommonIssue(issue.id); }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
