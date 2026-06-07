import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';

const CreateInvoice = () => {
  const { addInvoice, employees, deviceModels, commonIssues, user } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceBrand: '',
    deviceModel: '',
    deviceSerial: '',
    deviceIssue: '',
    devicePassword: '',
    deviceAccessories: '',
    employeeId: employees.length > 0 ? employees[0].id : '',
    price: '',
    warrantyMonths: '3',
    notes: ''
  });

  React.useEffect(() => {
    if (!formData.employeeId && employees.length > 0) {
      const loggedInEmployee = user?.email ? employees.find(emp => emp.email === user.email) : undefined;
      setFormData(prev => ({ ...prev, employeeId: loggedInEmployee?.id || employees[0].id }));
    }
  }, [employees, formData.employeeId, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-fill price if a common issue is selected
    if (name === 'deviceIssue') {
      const issue = commonIssues.find(i => i.name === value);
      if (issue && issue.default_price) {
        setFormData(prev => ({ ...prev, [name]: value, price: issue.default_price!.toString() }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Get unique brands for the datalist
  const uniqueBrands = Array.from(new Set(deviceModels.map(m => m.brand)));
  // Filter models based on selected brand
  const filteredModels = deviceModels.filter(m => !formData.deviceBrand || m.brand === formData.deviceBrand).map(m => m.model);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await addInvoice({
      customer: {
        id: crypto.randomUUID(),
        name: formData.customerName,
        phone: formData.customerPhone,
        email: '',
        address: ''
      },
      device: {
        brand: formData.deviceBrand,
        model: formData.deviceModel,
        serialNumber: formData.deviceSerial,
        issue: formData.deviceIssue,
        password: formData.devicePassword,
        accessories: formData.deviceAccessories,
      },
      employeeId: formData.employeeId,
      price: Number(formData.price),
      warrantyMonths: Number(formData.warrantyMonths),
      status: 'En cours',
      notes: formData.notes
    });

    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Nouvelle Facture de Réparation</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 className="card-header">Informations Client</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nom Complet *</label>
              <input type="text" name="customerName" required className="form-control" value={formData.customerName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <input type="tel" name="customerPhone" required className="form-control" value={formData.customerPhone} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Détails de l'Appareil & Panne</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marque *</label>
              <input type="text" name="deviceBrand" list="brands-list" required className="form-control" placeholder="ex: Apple, Samsung..." value={formData.deviceBrand} onChange={handleChange} />
              <datalist id="brands-list">
                {uniqueBrands.map(brand => <option key={brand} value={brand} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label className="form-label">Modèle *</label>
              <input type="text" name="deviceModel" list="models-list" required className="form-control" value={formData.deviceModel} onChange={handleChange} />
              <datalist id="models-list">
                {filteredModels.map(model => <option key={model} value={model} />)}
              </datalist>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Numéro de Série / IMEI</label>
              <input type="text" name="deviceSerial" className="form-control" value={formData.deviceSerial} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe / Code</label>
              <input type="text" name="devicePassword" className="form-control" value={formData.devicePassword} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description de la Panne *</label>
            <input type="text" name="deviceIssue" list="issues-list" required className="form-control" placeholder="Tapez ou sélectionnez une panne" value={formData.deviceIssue} onChange={handleChange} />
            <datalist id="issues-list">
              {commonIssues.map(issue => <option key={issue.id} value={issue.name} />)}
            </datalist>
          </div>
          
          <div className="form-group">
            <label className="form-label">Accessoires laissés (ex: Chargeur, Coque)</label>
            <input type="text" name="deviceAccessories" className="form-control" value={formData.deviceAccessories} onChange={handleChange} />
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Réparation & Facturation</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Technicien / Réceptionné par *</label>
              <select name="employeeId" required className="form-control" value={formData.employeeId} onChange={handleChange}>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Garantie (Mois) *</label>
              <input type="number" name="warrantyMonths" required className="form-control" value={formData.warrantyMonths} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prix convenu (CFA/€) *</label>
              <input type="number" name="price" required className="form-control" value={formData.price} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Notes supplémentaires</label>
            <textarea name="notes" className="form-control" style={{ minHeight: '60px' }} value={formData.notes} onChange={handleChange}></textarea>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Annuler</button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            Enregistrer & Créer Facture
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
