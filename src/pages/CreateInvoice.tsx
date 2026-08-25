import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Save, Phone, User, Smartphone, DollarSign, Wrench, ShieldCheck, Sparkles } from 'lucide-react';

const CreateInvoice = () => {
  const { invoices, addInvoice, employees, deviceModels, commonIssues, activeEmployee, settings } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerPhone2: '',
    customerPhone3: '',
    deviceBrand: '',
    deviceModel: '',
    deviceSerial: '',
    deviceIssue: '',
    devicePassword: '',
    deviceAccessories: '',
    employeeId: activeEmployee ? activeEmployee.id : (employees.length > 0 ? employees[0].id : ''),
    price: '',
    warrantyMonths: '3',
    notes: ''
  });

  // Extraire les clients uniques pour l'auto-complétion
  const uniqueCustomers = useMemo(() => {
    const map = new Map();
    invoices.forEach(inv => {
      if (inv.customer && inv.customer.phone) {
        map.set(inv.customer.phone, inv.customer);
      }
    });
    return Array.from(map.values());
  }, [invoices]);

  // Auto-assign connected technician / employee by default
  useEffect(() => {
    if (activeEmployee && (!formData.employeeId || formData.employeeId === '')) {
      setFormData(prev => ({ ...prev, employeeId: activeEmployee.id }));
    } else if (!formData.employeeId && employees.length > 0) {
      setFormData(prev => ({ ...prev, employeeId: employees[0].id }));
    }
  }, [employees, activeEmployee]);

  // Dynamic & auto-learning brand suggestions
  const dynamicBrands = useMemo(() => {
    const fromModels = deviceModels.map(m => m.brand);
    const fromInvoices = invoices.map(i => i.device?.brand).filter(Boolean);
    const defaultBrands = ['Apple', 'Samsung', 'Tecno', 'Infinix', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo', 'Itel', 'Redmi', 'Google Pixel', 'Realme', 'Honor', 'Sony', 'Nokia', 'Motorola', 'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'MacBook'];
    return Array.from(new Set([...fromModels, ...fromInvoices, ...defaultBrands])).sort((a, b) => a.localeCompare(b));
  }, [deviceModels, invoices]);

  // Dynamic & auto-learning model suggestions
  const dynamicModels = useMemo(() => {
    const brandLower = formData.deviceBrand.trim().toLowerCase();
    const fromModels = deviceModels
      .filter(m => !brandLower || m.brand.toLowerCase() === brandLower)
      .map(m => m.model);
    const fromInvoices = invoices
      .filter(i => !brandLower || i.device?.brand?.toLowerCase() === brandLower)
      .map(i => i.device?.model)
      .filter(Boolean);
    
    return Array.from(new Set([...fromModels, ...fromInvoices])).sort((a, b) => a.localeCompare(b));
  }, [deviceModels, invoices, formData.deviceBrand]);

  // Dynamic & auto-learning issues / pannes suggestions
  const dynamicIssues = useMemo(() => {
    const fromIssues = commonIssues.map(i => i.name);
    const fromInvoices = invoices.map(i => i.device?.issue).filter(Boolean);
    const defaultIssues = [
      'Écran cassé / Tactile HS',
      'Batterie à remplacer',
      'Connecteur de charge défectueux',
      'Caméra arrière / avant défectueuse',
      'Micro / Haut-parleur muet',
      'Téléphone tombé dans l\'eau (Désoxydation)',
      'Problème de charge / Ne s\'allume plus',
      'Bouton Power / Volume bloqué',
      'Vitre arrière fissurée',
      'Déblocage / Schéma oublié',
      'Problème Réseau / Wi-Fi',
      'Changement Châssis / Coque',
      'Flashage / Réinstallation Système'
    ];
    return Array.from(new Set([...fromIssues, ...fromInvoices, ...defaultIssues])).sort((a, b) => a.localeCompare(b));
  }, [commonIssues, invoices]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-fill price if a common issue with default price is selected
    if (name === 'deviceIssue') {
      const issue = commonIssues.find(i => i.name.toLowerCase() === value.trim().toLowerCase());
      if (issue && issue.default_price) {
        setFormData(prev => ({ ...prev, [name]: value, price: issue.default_price!.toString() }));
        return;
      }
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-remplissage des contacts si le téléphone correspond à un client existant
      if (name === 'customerPhone') {
        const existingCustomer = uniqueCustomers.find(c => c.phone === value);
        if (existingCustomer) {
          newData.customerName = existingCustomer.name;
          newData.customerPhone2 = existingCustomer.phone2 || '';
          newData.customerPhone3 = existingCustomer.phone3 || '';
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newInvoice = {
      customer: {
        id: crypto.randomUUID(),
        name: formData.customerName,
        phone: formData.customerPhone,
        phone2: formData.customerPhone2 || undefined,
        phone3: formData.customerPhone3 || undefined,
        email: '',
        address: ''
      },
      device: {
        brand: formData.deviceBrand.trim(),
        model: formData.deviceModel.trim(),
        serialNumber: formData.deviceSerial.trim(),
        issue: formData.deviceIssue.trim(),
        password: formData.devicePassword.trim(),
        accessories: formData.deviceAccessories.trim(),
      },
      employeeId: formData.employeeId,
      price: Number(formData.price),
      warrantyMonths: Number(formData.warrantyMonths),
      status: 'In Progress' as const,
      paymentStatus: 'Impayé' as const,
      notes: formData.notes
    };
    
    const success = await addInvoice(newInvoice as any);

    if (success) {
      navigate('/');
    }
  };

  const currentPlan = settings?.subscription_plan || 'Standard';
  const isLimitReached = currentPlan === 'Standard' && invoices.length >= 20;

  if (isLimitReached) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #f87171' }}>
        <h2 style={{ color: '#991b1b', marginBottom: '1rem' }}>Limite atteinte (Plan Standard)</h2>
        <p style={{ color: '#7f1d1d', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Vous avez atteint la limite de 20 factures de votre forfait Standard. Pour continuer à gérer votre activité et créer des factures en illimité, veuillez passer au forfait Professionnel.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/abonnement')}>
          Découvrir le plan Professionnel
        </button>
      </div>
    );
  }

  const assignedEmployee = employees.find(e => e.id === formData.employeeId) || activeEmployee;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Nouvelle Fiche & Facture de Réparation
        </h2>

        {/* CONNECTED TECHNICIAN BADGE */}
        {assignedEmployee && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.85rem',
            color: '#1e40af',
            fontWeight: 600
          }}>
            <Wrench size={15} color="#2563eb" />
            <span>Responsable prise en charge : <strong>{assignedEmployee.name}</strong></span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        
        {/* 1. INFORMATIONS CLIENT & 3 CONTACTS */}
        <div className="card" style={{ marginBottom: '1.5rem', borderRadius: '16px' }}>
          <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#2563eb" />
            Informations Client & Contacts
          </h3>
          
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Nom Complet du Client *</label>
            <input 
              type="text" 
              name="customerName" 
              required 
              className="form-control" 
              placeholder="ex: Yao Koffi Paul"
              value={formData.customerName} 
              onChange={handleChange} 
            />
          </div>

          {/* 3 Contact Phone Numbers */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              <Phone size={15} color="#2563eb" /> 3 Numéros de Contact Client
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569' }}>
                  📱 Contact 1 (Principal) *
                </label>
                <input 
                  type="tel" 
                  name="customerPhone" 
                  list="phones-list" 
                  required 
                  className="form-control" 
                  placeholder="ex: 07 00 00 00 01" 
                  value={formData.customerPhone} 
                  onChange={handleChange} 
                />
                <datalist id="phones-list">
                  {uniqueCustomers.map((c: any) => (
                    <option key={c.phone} value={c.phone}>{c.name}</option>
                  ))}
                </datalist>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569' }}>
                  💬 Contact 2 (WhatsApp / Pro)
                </label>
                <input 
                  type="tel" 
                  name="customerPhone2" 
                  className="form-control" 
                  placeholder="ex: 05 00 00 00 02" 
                  value={formData.customerPhone2} 
                  onChange={handleChange} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569' }}>
                  🚨 Contact 3 (Urgence / Famille)
                </label>
                <input 
                  type="tel" 
                  name="customerPhone3" 
                  className="form-control" 
                  placeholder="ex: 01 00 00 00 03" 
                  value={formData.customerPhone3} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. DÉTAILS APPAREIL & PANNE (AUTO-CATALOGUE INTELLIGENT) */}
        <div className="card" style={{ marginBottom: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Smartphone size={20} color="#2563eb" />
              Détails de l'Appareil & Panne
            </h3>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '3px 8px', borderRadius: '10px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Auto-apprentissage activé
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marque de l'appareil *</label>
              <input 
                type="text" 
                name="deviceBrand" 
                list="brands-list" 
                required 
                className="form-control" 
                placeholder="Tapez ou choisissez (ex: Apple, Samsung...)" 
                value={formData.deviceBrand} 
                onChange={handleChange} 
              />
              <datalist id="brands-list">
                {dynamicBrands.map(brand => <option key={brand} value={brand} />)}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">Modèle exact *</label>
              <input 
                type="text" 
                name="deviceModel" 
                list="models-list" 
                required 
                className="form-control" 
                placeholder="Tapez ou choisissez (ex: iPhone 13, Spark 10...)" 
                value={formData.deviceModel} 
                onChange={handleChange} 
              />
              <datalist id="models-list">
                {dynamicModels.map(model => <option key={model} value={model} />)}
              </datalist>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Numéro de Série / IMEI (Optionnel)</label>
              <input type="text" name="deviceSerial" className="form-control" placeholder="ex: 3568912..." value={formData.deviceSerial} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe / Code de verrouillage</label>
              <input type="text" name="devicePassword" className="form-control" placeholder="ex: 1234 ou Code PIN" value={formData.devicePassword} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description de la Panne *</label>
            <input 
              type="text" 
              name="deviceIssue" 
              list="issues-list" 
              required 
              className="form-control" 
              placeholder="Tapez la panne ou sélectionnez dans la liste (ex: Écran cassé...)" 
              value={formData.deviceIssue} 
              onChange={handleChange} 
            />
            <datalist id="issues-list">
              {dynamicIssues.map((issue, idx) => <option key={idx} value={issue} />)}
            </datalist>
            <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              💡 Toute nouvelle marque, modèle ou panne saisie sera automatiquement mémorisée dans le menu déroulant !
            </small>
          </div>
          
          <div className="form-group">
            <label className="form-label">Accessoires laissés (ex: Chargeur, Coque, Carte SIM)</label>
            <input type="text" name="deviceAccessories" className="form-control" placeholder="ex: Coque rouge, sans chargeur" value={formData.deviceAccessories} onChange={handleChange} />
          </div>
        </div>

        {/* 3. FACTURATION & TECHNICIEN RESPONSABLE */}
        <div className="card" style={{ marginBottom: '1.5rem', borderRadius: '16px' }}>
          <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} color="#2563eb" />
            Attribution & Facturation
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                Technicien / Responsable de prise en charge *
              </label>
              <select 
                name="employeeId" 
                required 
                className="form-control" 
                value={formData.employeeId} 
                onChange={handleChange}
                style={{ fontWeight: 600, border: '2px solid #93c5fd' }}
              >
                <option value="" disabled>Sélectionner un technicien...</option>
                {employees.map(emp => {
                  const isCurrent = activeEmployee?.id === emp.id;
                  return (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role}) {isCurrent ? '⭐ (Vous - Connecté)' : ''}
                    </option>
                  );
                })}
              </select>
              <small style={{ color: '#2563eb', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                Automatiquement assigné au compte technicien actuellement connecté.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Garantie offerte (Mois) *</label>
              <input type="number" name="warrantyMonths" min="0" required className="form-control" value={formData.warrantyMonths} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prix convenu (FCFA) *</label>
              <input type="number" name="price" min="0" required className="form-control" placeholder="ex: 25000" value={formData.price} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Notes ou observations pour l'atelier</label>
            <textarea name="notes" className="form-control" style={{ minHeight: '60px' }} placeholder="Observations particulières..." value={formData.notes} onChange={handleChange}></textarea>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Annuler</button>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontWeight: 700 }}>
            <Save size={18} />
            Enregistrer & Créer la Facture
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
