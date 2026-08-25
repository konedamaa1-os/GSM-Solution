import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, Plus, Trash2, User, Store, Globe, HelpCircle, Check, Copy } from 'lucide-react';

const Settings = () => {
  const { settings, updateSettings, currentShop, updateShopDomain, employees, addEmployee, deleteEmployee } = useAppContext();
  
  const [shopSettings, setShopSettings] = useState(settings || {
    name: '',
    address: '',
    phone: '',
    email: '',
    termsAndConditions: '',
    shop_id: ''
  });

  // Domain & Branding state
  const [slug, setSlug] = useState(currentShop?.slug || '');
  const [customDomain, setCustomDomain] = useState(currentShop?.custom_domain || '');
  const [brandColor, setBrandColor] = useState(currentShop?.brand_color || '#2563eb');
  const [domainMessage, setDomainMessage] = useState('');
  const [domainError, setDomainError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setDomainMessage('');
    setDomainError('');

    const res = await updateShopDomain(slug, customDomain, brandColor);
    if (res.success) {
      setDomainMessage('Configuration du domaine et de la marque enregistrée !');
      setTimeout(() => setDomainMessage(''), 4000);
    } else {
      setDomainError(res.error || 'Erreur lors de la sauvegarde du domaine.');
    }
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const previewLocalParamUrl = `${window.location.origin}/?shop=${slug || 'mon-atelier'}`;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Paramètres de l'Atelier</h2>

      {message && (
        <div style={{ padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      {/* 1. Shop Profile Info */}
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
            Enregistrer les informations
          </button>
        </form>
      </div>

      {/* 2. Custom Domain & Branding Card */}
      <div className="card" style={{ marginBottom: '2rem', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }}>
        <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af' }}>
          <Globe size={20} />
          Nom de Domaine & Identité Visuelle de l'Atelier
        </h3>

        {domainMessage && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {domainMessage}
          </div>
        )}
        {domainError && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {domainError}
          </div>
        )}

        <form onSubmit={handleSaveDomain}>
          <div className="form-row">
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Identifiant / Sous-domaine de l'atelier</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="ex: atelier-paris"
                  required
                />
              </div>
              <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                Donne accès direct au portail : <a href={previewLocalParamUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{previewLocalParamUrl}</a>
              </small>
            </div>

            <div className="form-group">
              <label>Couleur du thème</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="color" 
                  value={brandColor}
                  onChange={e => setBrandColor(e.target.value)}
                  style={{ width: '45px', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>{brandColor}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Nom de Domaine Personnalisé Propre (Optionnel)</span>
              <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '10px' }}>Pro</span>
            </label>
            <input 
              type="text" 
              className="form-control" 
              value={customDomain}
              onChange={e => setCustomDomain(e.target.value.toLowerCase().trim())}
              placeholder="ex: mon-atelier-reparation.fr ou app.monatelier.com"
            />
            <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
              Si vous avez acheté votre propre nom de domaine chez OVH, Hostinger, Namecheap...
            </small>
          </div>

          {/* DNS Instructions Box */}
          {customDomain && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={16} color="#2563eb" /> Instructions de configuration DNS pour {customDomain} :
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0 0 0.75rem 0' }}>
                Ajoutez les enregistrements suivants dans la zone DNS de votre registrar pour pointer votre domaine vers Vercel :
              </p>

              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                  <span><strong>Type :</strong> CNAME &nbsp;|&nbsp; <strong>Nom :</strong> {customDomain.includes('.') && customDomain.split('.').length > 2 ? customDomain.split('.')[0] : '@'} &nbsp;|&nbsp; <strong>Cible :</strong> <code>cname.vercel-dns.com</code></span>
                  <button type="button" onClick={() => copyToClipboard('cname.vercel-dns.com', 'cname')} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                    {copiedField === 'cname' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                  <span><strong>Type :</strong> A (Domaine racine) &nbsp;|&nbsp; <strong>Nom :</strong> @ &nbsp;|&nbsp; <strong>Cible :</strong> <code>76.76.21.21</code></span>
                  <button type="button" onClick={() => copyToClipboard('76.76.21.21', 'ip')} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                    {copiedField === 'ip' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} />
            Enregistrer le Domaine & la Marque
          </button>
        </form>
      </div>

      {/* 3. Team Management Card */}
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
