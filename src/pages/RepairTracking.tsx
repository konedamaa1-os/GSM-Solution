import React from 'react';
import { useAppContext } from '../context/AppContext';
import type { RepairStatus } from '../types';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

const RepairTracking = () => {
  const { invoices, updateInvoiceStatus, employees } = useAppContext();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.device.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, status: string) => {
    updateInvoiceStatus(id, status as RepairStatus);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Suivi des Réparations</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Rechercher..." 
              style={{ paddingLeft: '35px', marginBottom: 0, width: '200px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <select 
              className="form-control"
              style={{ paddingLeft: '35px', marginBottom: 0, width: '150px' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">Tous les statuts</option>
              <option value="Pending">En attente</option>
              <option value="In Progress">En cours</option>
              <option value="Completed">Terminé</option>
              <option value="Cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem 0' }}>Facture</th>
              <th style={{ padding: '1rem 0' }}>Client</th>
              <th style={{ padding: '1rem 0' }}>Appareil & Panne</th>
              <th style={{ padding: '1rem 0' }}>Technicien</th>
              <th style={{ padding: '1rem 0' }}>Statut</th>
              <th style={{ padding: '1rem 0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(invoice => (
              <tr key={invoice.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 0', fontWeight: 500 }}>
                  <Link to={`/facture/${invoice.id}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td style={{ padding: '1rem 0' }}>{invoice.customer.name}</td>
                <td style={{ padding: '1rem 0' }}>
                  <div style={{ fontWeight: 500 }}>{invoice.device.brand} {invoice.device.model}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{invoice.device.issue.substring(0, 30)}...</div>
                </td>
                <td style={{ padding: '1rem 0' }}>
                  {employees.find(e => e.id === invoice.employeeId)?.name || 'Inconnu'}
                </td>
                <td style={{ padding: '1rem 0' }}>
                  <select 
                    value={invoice.status} 
                    onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                    className="form-control"
                    style={{ padding: '0.25rem 0.5rem', width: 'auto', backgroundColor: '#f9fafb' }}
                  >
                    <option value="Pending">En attente</option>
                    <option value="In Progress">En cours</option>
                    <option value="Completed">Terminé</option>
                    <option value="Cancelled">Annulé</option>
                  </select>
                </td>
                <td style={{ padding: '1rem 0' }}>
                  <Link to={`/facture/${invoice.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aucune réparation enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RepairTracking;
