import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, Plus, Trash2, Users, Store, Globe, HelpCircle, Check, Copy, Phone, ShieldCheck, Wrench, Briefcase, Key, Lock, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const { 
    settings, updateSettings, currentShop, updateShopDomain, 
    employees, deleteEmployee, createTechnicianWithAccount 
  } = useAppContext();
  
  const [shopSettings, setShopSettings] = useState({
    name: settings?.name || '',
    address: settings?.address || '',
    phone: settings?.phone || '',
    phone2: settings?.phone2 || '',
    phone3: settings?.phone3 || '',
    email: settings?.email || '',
    termsAndConditions: settings?.termsAndConditions || '',
    shop_id: settings?.shop_id || ''
  });

  // Domain & Branding state
  const [slug, setSlug] = useState(currentShop?.slug || '');
  const [customDomain, setCustomDomain] = useState(currentShop?.custom_domain || '');
  const [brandColor, setBrandColor] = useState(currentShop?.brand_color || '#2563eb');
  const [domainMessage, setDomainMessage] = useState('');
  const [domainError, setDomainError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Employee creation state
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [newEmployeePhone, setNewEmployeePhone] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('Technicien');
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [employeeCreatedCard, setEmployeeCreatedCard] = useState<{ name: string; email: string; password: string; role: string } | null>(null);

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...shopSettings,
      shop_id: currentShop?.id || ''
    });
    setMessage('Paramètres et contacts de l\'atelier enregistrés avec succès !');
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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim() || !newEmployeeEmail.trim() || !newEmployeePassword.trim()) {
      setErrorMessage('Veuillez remplir le nom, l\'email et le mot de passe.');
      return;
    }

    setCreatingEmployee(true);
    setErrorMessage('');
    setMessage('');

    const res = await createTechnicianWithAccount(
      newEmployeeName.trim(),
      newEmployeeEmail.trim(),
      newEmployeePassword.trim(),
      newEmployeePhone.trim() || undefined,
      newEmployeeRole
    );

    setCreatingEmployee(false);

    if (res.success) {
      setEmployeeCreatedCard({
        name: newEmployeeName.trim(),
        email: newEmployeeEmail.trim().toLowerCase(),
        password: newEmployeePassword.trim(),
        role: newEmployeeRole
      });
      setNewEmployeeName('');
      setNewEmployeeEmail('');
      setNewEmployeePassword('');
      setNewEmployeePhone('');
      setNewEmployeeRole('Technicien');
      setMessage('Compte technicien créé avec succès ! Il peut désormais se connecter.');
    } else {
      setErrorMessage(res.error || 'Erreur lors de la création du compte.');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const previewLocalParamUrl = `${window.location.origin}/?shop=${slug || 'mon-atelier'}`;

  const getRoleBadge = (role: string) => {
    if (role.toLowerCase().includes('manager') || role.toLowerCase().includes('direct')) {
      return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: <ShieldCheck size={14} />, label: 'Direction / Gérant' };
    }
    if (role.toLowerCase().includes('caisse') || role.toLowerCase().includes('accueil')) {
      return { bg: '#fef3c7', color: '#b45309', border: '#fde68a', icon: <Briefcase size={14} />, label: 'Caisse / Accueil' };
    }
    return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', icon: <Wrench size={14} />, label: 'Technicien / Réparateur' };
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
        Paramètres & Gestion de l'Atelier
      </h2>

      {message && (
        <div style={{ padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {message}
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid #fecaca' }}>
          {errorMessage}
        </div>
      )}

      {/* 1. Shop Profile Info & 3 Contact Numbers */}
      <div className="card" style={{ marginBottom: '2rem', borderRadius: '16px' }}>
        <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Store size={20} color="#2563eb" />
          Informations de la Boutique & Contacts
        </h3>
        <form onSubmit={handleSaveSettings}>
          
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Nom de la boutique</label>
              <input 
                type="text" 
                className="form-control" 
                value={shopSettings.name}
                onChange={e => setShopSettings({...shopSettings, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group" style={{ flex: 2 }}>
              <label>Email de l'atelier</label>
              <input 
                type="email" 
                className="form-control" 
                value={shopSettings.email}
                onChange={e => setShopSettings({...shopSettings, email: e.target.value})}
                required
              />
            </div>
          </div>

          {/* 3 CONTACT NUMBERS */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              <Phone size={16} color="#2563eb" /> 3 Numéros de Contact Officiels (Visibles sur Factures & Devis)
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#475569' }}>📞 Contact 1 (Principal / Appels)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={shopSettings.phone}
                  onChange={e => setShopSettings({...shopSettings, phone: e.target.value})}
                  placeholder="ex: +225 07 00 00 00 01"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#475569' }}>💬 Contact 2 (WhatsApp / Pro)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={shopSettings.phone2}
                  onChange={e => setShopSettings({...shopSettings, phone2: e.target.value})}
                  placeholder="ex: +225 05 00 00 00 02"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#475569' }}>🚨 Contact 3 (Urgence / Service Client)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={shopSettings.phone3}
                  onChange={e => setShopSettings({...shopSettings, phone3: e.target.value})}
                  placeholder="ex: +225 01 00 00 00 03"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Adresse physique</label>
            <input 
              type="text" 
              className="form-control" 
              value={shopSettings.address}
              onChange={e => setShopSettings({...shopSettings, address: e.target.value})}
              placeholder="ex: Rue du Commerce, Abidjan"
              required
            />
          </div>

          <div className="form-group">
            <label>Conditions Générales (Pied de Facture)</label>
            <textarea 
              className="form-control" 
              rows={3}
              value={shopSettings.termsAndConditions}
              onChange={e => setShopSettings({...shopSettings, termsAndConditions: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} />
            Enregistrer les Coordonnées de l'Atelier
          </button>
        </form>
      </div>

      {/* 2. Team & Technicians Management Card */}
      <div className="card" style={{ marginBottom: '2rem', borderRadius: '16px' }}>
        <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#2563eb" />
          Création & Gestion des Techniciens & Employés
        </h3>
        
        {/* RECAP CARD AFTER TECHNICIAN CREATION */}
        {employeeCreatedCard && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, color: '#166534', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} /> Identifiants de connexion créés pour {employeeCreatedCard.name} :
              </h4>
              <button onClick={() => setEmployeeCreatedCard(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Email : <strong>{employeeCreatedCard.email}</strong></span>
                <button type="button" onClick={() => copyToClipboard(employeeCreatedCard.email, 'email')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>
                  {copiedField === 'email' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Mot de passe : <strong>{employeeCreatedCard.password}</strong></span>
                <button type="button" onClick={() => copyToClipboard(employeeCreatedCard.password, 'pwd')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>
                  {copiedField === 'pwd' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <small style={{ color: '#15803d', marginTop: '6px', display: 'block' }}>
              Le technicien peut maintenant se connecter directement avec son rôle <strong>{employeeCreatedCard.role}</strong> !
            </small>
          </div>
        )}

        {/* CREATION FORM */}
        <form onSubmit={handleAddEmployee} style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: 700 }}>
            ➕ Créer un nouveau compte technicien ou employé
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nom complet *</label>
              <input 
                type="text" 
                className="form-control" 
                value={newEmployeeName}
                onChange={e => setNewEmployeeName(e.target.value)}
                placeholder="ex: Yao Kouadio Paul"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email de connexion *</label>
              <input 
                type="email" 
                className="form-control" 
                value={newEmployeeEmail}
                onChange={e => setNewEmployeeEmail(e.target.value)}
                placeholder="ex: tech.yao@atelier.com"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Mot de passe initial *</label>
              <input 
                type="text" 
                className="form-control" 
                value={newEmployeePassword}
                onChange={e => setNewEmployeePassword(e.target.value)}
                placeholder="ex: tech1234"
                required
                minLength={6}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Téléphone direct</label>
              <input 
                type="text" 
                className="form-control" 
                value={newEmployeePhone}
                onChange={e => setNewEmployeePhone(e.target.value)}
                placeholder="ex: 07 00 00 00 00"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Rôle & Niveau</label>
              <select 
                className="form-control"
                value={newEmployeeRole}
                onChange={e => setNewEmployeeRole(e.target.value)}
              >
                <option value="Technicien">🔧 Technicien (Niveau 2)</option>
                <option value="Caisse">💼 Caisse / Réception (Niveau 1)</option>
                <option value="Manager">👑 Manager / Gérant (Niveau 3)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={creatingEmployee}
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 20px', fontWeight: 700 }}
            >
              <Plus size={18} />
              {creatingEmployee ? 'Création du compte...' : 'Créer le Technicien'}
            </button>
          </div>
        </form>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#475569', fontWeight: 600 }}>
            Membres de l'équipe ({employees.length})
          </h4>
          
          {employees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              Aucun technicien ou employé créé pour cet atelier.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {employees.map(emp => {
                const badge = getRoleBadge(emp.role);
                return (
                  <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>{emp.email}</span>
                          {emp.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Phone size={12} /> {emp.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      <button 
                        onClick={() => deleteEmployee(emp.id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px', color: '#ef4444', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', cursor: 'pointer' }}
                        title="Supprimer l'employé"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Custom Domain & Branding Card */}
      <div className="card" style={{ marginBottom: '2rem', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
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
                Accès direct : <a href={previewLocalParamUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{previewLocalParamUrl}</a>
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
              placeholder="ex: mon-atelier-reparation.com ou www.gsmsolutiondivo.xyz"
            />
          </div>

          {/* DNS Instructions Box */}
          {customDomain && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={16} color="#2563eb" /> Instructions de configuration DNS pour {customDomain} :
              </h4>

              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                  <span><strong>Type :</strong> CNAME &nbsp;|&nbsp; <strong>Nom :</strong> {customDomain.includes('.') && customDomain.split('.').length > 2 ? customDomain.split('.')[0] : 'www'} &nbsp;|&nbsp; <strong>Cible :</strong> <code>cname.vercel-dns.com</code></span>
                  <button type="button" onClick={() => copyToClipboard('cname.vercel-dns.com', 'cname')} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                    {copiedField === 'cname' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                  <span><strong>Type :</strong> A &nbsp;|&nbsp; <strong>Nom :</strong> @ &nbsp;|&nbsp; <strong>Cible :</strong> <code>76.76.21.21</code></span>
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
    </div>
  );
};

export default Settings;
