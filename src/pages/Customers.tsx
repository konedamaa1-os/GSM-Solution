import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Phone, Mail, FileText, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Customer, Invoice } from '../types';

const Customers = () => {
  const { invoices, deleteCustomer, isManager } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Extraire les clients uniques à partir des factures
  const customersMap = new Map<string, { customer: Customer; invoices: Invoice[] }>();
  
  invoices.forEach(invoice => {
    const custId = invoice.customer.id;
    if (!customersMap.has(custId)) {
      customersMap.set(custId, { customer: invoice.customer, invoices: [] });
    }
    customersMap.get(custId)!.invoices.push(invoice);
  });

  const uniqueCustomers = Array.from(customersMap.values());

  const filteredCustomers = uniqueCustomers.filter(({ customer }) => {
    const term = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(term) ||
      (customer.phone2 && customer.phone2.includes(term)) ||
      (customer.phone3 && customer.phone3.includes(term))
    );
  });

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${name}" et tout son historique de factures ? Cette action est irréversible.`)) {
      const { error } = await deleteCustomer(id);
      if (error) {
        alert("Erreur lors de la suppression. Le client a peut-être des données liées qui empêchent sa suppression.");
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} />
          Clients & Contacts ({uniqueCustomers.length})
        </h2>
        
        <input 
          type="text" 
          placeholder="Rechercher un client (nom, tél 1, tél 2, tél 3)..." 
          className="form-control"
          style={{ maxWidth: '340px', marginBottom: 0 }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card">
        {filteredCustomers.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Aucun client trouvé.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredCustomers.map(({ customer, invoices }) => (
              <div key={customer.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-color)', fontWeight: 700 }}>{customer.name}</h3>
                    
                    {/* 3 Contact Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.6rem' }}>
                      {/* Phone 1 */}
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        backgroundColor: '#eff6ff', 
                        color: '#1d4ed8', 
                        padding: '3px 10px', 
                        borderRadius: '6px', 
                        fontSize: '0.8rem', 
                        fontWeight: 600,
                        border: '1px solid #bfdbfe'
                      }}>
                        <Phone size={12} /> Tél 1 : {customer.phone}
                      </span>

                      {/* Phone 2 */}
                      {customer.phone2 && (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          backgroundColor: '#ecfdf5', 
                          color: '#047857', 
                          padding: '3px 10px', 
                          borderRadius: '6px', 
                          fontSize: '0.8rem', 
                          fontWeight: 600,
                          border: '1px solid #a7f3d0'
                        }}>
                          <MessageSquare size={12} /> WhatsApp : {customer.phone2}
                        </span>
                      )}

                      {/* Phone 3 */}
                      {customer.phone3 && (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          backgroundColor: '#fffbeb', 
                          color: '#b45309', 
                          padding: '3px 10px', 
                          borderRadius: '6px', 
                          fontSize: '0.8rem', 
                          fontWeight: 600,
                          border: '1px solid #fde68a'
                        }}>
                          <AlertCircle size={12} /> Urgence : {customer.phone3}
                        </span>
                      )}

                      {customer.email && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem', padding: '3px 6px' }}>
                          <Mail size={12} /> {customer.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {invoices.length} {invoices.length > 1 ? 'réparations' : 'réparation'}
                    </div>
                    {isManager && (
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem', color: '#ef4444', border: '1px solid var(--border-color)', backgroundColor: 'var(--stat-red-bg)' }}
                        title="Supprimer le client"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Historique des fiches & factures
                  </h4>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {invoices.map(invoice => (
                      <div key={invoice.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', fontSize: '0.875rem' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{invoice.invoiceNumber}</span>
                          <span style={{ margin: '0 0.5rem', color: 'var(--text-secondary)' }}>•</span>
                          <span>{invoice.device.brand} {invoice.device.model} ({invoice.device.issue})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{invoice.price.toLocaleString()} FCFA</span>
                          <Link to={`/facture/${invoice.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FileText size={12} /> Voir
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
