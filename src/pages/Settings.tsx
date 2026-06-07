import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, Plus, Trash2, User, Store } from 'lucide-react';

const Settings = () => {
  const { settings, updateSettings, employees, addEmployee, deleteEmployee } = useAppContext();
  
  const [shopSettings, setShopSettings] = useState(settings);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('Réparateur');
  const [message, setMessage] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(shopSettings);
    setMessage('Paramètres enregistrés avec succès !');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmployeeName.trim() && newEmployeeEmail.trim()) {
      addEmployee({ name: newEmployeeName.trim(), email: newEmployeeEmail.trim(), role: newEmployeeRole });
      setNewEmployeeName('');
      setNewEmployeeEmail('');
      setNewEmployeeRole('Réparateur');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Paramètres</h2>

      {message && (
        <div style={{ padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Store size={20} />
          Informations de la boutique
        </h3>
        <form onSubmit={handleSaveSettings}>
          <div className="form-group">
            <label>Nom de la boutique</label>
            <input 
              type="text" 
              className="form-control" 
              value={shopSettings.name}
              onChange={e => setShopSettings({...shopSettings, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Téléphone</label>
              <input 
                type="text" 
                className="form-control" 
                value={shopSettings.phone}
                onChange={e => setShopSettings({...shopSettings, phone: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={shopSettings.email}
                onChange={e => setShopSettings({...shopSettings, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Adresse</label>
            <input 
              type="text" 
              className="form-control" 
              value={shopSettings.address}
              onChange={e => setShopSettings({...shopSettings, address: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Conditions Générales (Facture)</label>
            <textarea 
              className="form-control" 
              rows={3}
              value={shopSettings.termsAndConditions}
              onChange={e => setShopSettings({...shopSettings, termsAndConditions: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} />
            Enregistrer
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} />
          Gestion de l'équipe
        </h3>
        
        <form onSubmit={handleAddEmployee} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
            <label>Nom du technicien</label>
            <input 
              type="text" 
              className="form-control" 
              value={newEmployeeName}
              onChange={e => setNewEmployeeName(e.target.value)}
              placeholder="Ex: Jean Dupont"
              required
            />
          </div>
          <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
            <label>Email du technicien</label>
            <input 
              type="email" 
              className="form-control" 
              value={newEmployeeEmail}
              onChange={e => setNewEmployeeEmail(e.target.value)}
              placeholder="Ex: jean@tontonboua.com"
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Rôle</label>
            <select 
              className="form-control"
              value={newEmployeeRole}
              onChange={e => setNewEmployeeRole(e.target.value)}
            >
              <option value="Réparateur">Réparateur</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
            <Plus size={18} />
            Ajouter
          </button>
        </form>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Membres actuels</h4>
          {employees.map(emp => (
            <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{emp.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{emp.role}</div>
              </div>
              <button 
                onClick={() => deleteEmployee(emp.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
