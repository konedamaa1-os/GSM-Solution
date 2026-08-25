import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Phone, Mail, FileText, Trash2 } from 'lucide-react';
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

  const filteredCustomers = uniqueCustomers.filter(({ customer }) => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${name}" et tout son historique de factures ? Cette action est irréversible.`)) {
      const { error } = await deleteCustomer(id);
      if (error) {
        alert("Erreur lors de la suppression. Le client a peut-être des données liées (factures) qui empêchent sa suppression.");
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} />
          Clients
        </h2>
        
        <input 
          type="text" 
          placeholder="Rechercher un client (nom, téléphone)..." 
          className="form-control"
          style={{ maxWidth: '300px', marginBottom: 0 }}
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
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-color)' }}>{customer.name}</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={14} />
                        {customer.phone}
                      </span>
                      {customer.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Mail size={14} />
                          {customer.email}
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
                    Historique
                  </h4>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {invoices.map(invoice => (
                      <Link 
                        key={invoice.id} 
                        to={`/facture/${invoice.id}`}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={16} style={{ color: 'var(--primary-color)' }} />
                            <span style={{ fontWeight: 500 }}>{invoice.invoiceNumber}</span>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {invoice.device.brand} {invoice.device.model} - {new Date(invoice.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {invoice.price.toLocaleString()} CFA
                        </div>
                      </Link>
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
