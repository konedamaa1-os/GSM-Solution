import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Phone, Mail, FileText, Trash2, MessageSquare, AlertCircle, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Customer, Invoice } from '../types';

const Customers = () => {
  const { invoices, employees, deleteCustomer, isManager } = useAppContext();
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
    if (!isManager) {
      alert("Action interdite : Seul le gérant / manager peut supprimer un client.");
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${name}" et tout son historique de factures ? Cette action est irréversible.`)) {
      const { error } = await deleteCustomer(id);
      if (error) {
        alert("Erreur lors de la suppression. Le client a peut-être des données liées qui empêchent sa suppression.");
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Users size={24} color="#2563eb" />
            Répertoire Clients ({uniqueCustomers.length})
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Accès partagé à tous les techniciens • Traçabilité précise du responsable de réparation et de l'encaisseur.
          </p>
        </div>
        
        <input 
          type="text" 
          placeholder="Rechercher un client (nom, tél 1, tél 2, tél 3)..." 
          className="form-control"
          style={{ maxWidth: '360px', marginBottom: 0 }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card">
        {filteredCustomers.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Aucun client trouvé.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredCustomers.map(({ customer, invoices }) => (
              <div key={customer.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)', fontWeight: 700 }}>{customer.name}</h3>
                    
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
                    <div style={{ padding: '0.4rem 0.9rem', backgroundColor: '#f1f5f9', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      {invoices.length} {invoices.length > 1 ? 'réparations enregistrées' : 'réparation enregistrée'}
                    </div>
                    {isManager && (
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', color: '#ef4444', border: '1px solid #fecaca', backgroundColor: '#fee2e2' }}
                        title="Supprimer le client (Réservé Gérant)"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Repair History with double accountability: Tech in charge + Collector */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    Historique & Responsabilités ({invoices.length})
                  </h4>
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {invoices.map(invoice => {
                      const tech = employees.find(e => e.id === invoice.employeeId);
                      const isPaid = invoice.paymentStatus === 'Payé';

                      return (
                        <div key={invoice.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '0.75rem 1rem', 
                          backgroundColor: '#f8fafc', 
                          borderRadius: '10px', 
                          border: '1px solid #e2e8f0',
                          fontSize: '0.85rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          {/* Invoice Info & Device */}
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>
                              {invoice.invoiceNumber} • {invoice.device.brand} {invoice.device.model}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                              Panne : {invoice.device.issue} • Déposé le {new Date(invoice.date).toLocaleDateString('fr-FR')}
                            </div>
                          </div>

                          {/* Responsables: Technicien & Encaisseur */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {/* Responsable Réparation */}
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              🔧 Tech : {tech?.name || 'Non assigné'}
                            </span>

                            {/* Responsable Encaissement */}
                            {isPaid ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                💰 Encaissé par : {invoice.paymentCollectorName || 'Atelier'} {invoice.paymentMethod ? `(${invoice.paymentMethod})` : ''}
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                ⏳ Impayé
                              </span>
                            )}

                            {/* Montant */}
                            <span style={{ fontWeight: 700, color: '#0f172a', marginLeft: '4px' }}>
                              {invoice.price.toLocaleString('fr-FR')} FCFA
                            </span>

                            {/* Lien Fiche */}
                            <Link to={`/facture/${invoice.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <FileText size={12} /> Fiche
                            </Link>
                          </div>
                        </div>
                      );
                    })}
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

