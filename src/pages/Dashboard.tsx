import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { PlusCircle, ArrowRight, Search } from 'lucide-react';

const Dashboard = () => {
  const { invoices, employees } = useAppContext();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [revenuePeriod, setRevenuePeriod] = React.useState<'today' | 'week' | 'month' | 'year' | 'all' | 'custom'>('today');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.phone.includes(searchTerm) ||
    (searchTerm.toLowerCase() === 'impayé' && invoice.paymentStatus === 'Impayé') ||
    (searchTerm.toLowerCase() === 'payé' && invoice.paymentStatus === 'Payé')
  );

  const recentInvoices = filteredInvoices.slice(0, 5);

  const filteredRevenue = invoices.filter(inv => {
    if (inv.paymentStatus !== 'Payé') return false;
    
    const invDate = new Date(inv.date);
    const now = new Date();
    
    switch (revenuePeriod) {
      case 'today':
        return invDate.toLocaleDateString() === now.toLocaleDateString();
      case 'week': {
        const firstDayOfWeek = new Date(now);
        const day = now.getDay() || 7; // Convert Sunday (0) to 7
        if (day !== 1) {
          firstDayOfWeek.setHours(-24 * (day - 1));
        }
        firstDayOfWeek.setHours(0, 0, 0, 0);
        return invDate >= firstDayOfWeek;
      }
      case 'month':
        return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
      case 'year':
        return invDate.getFullYear() === now.getFullYear();
      case 'all':
        return true;
      case 'custom': {
        if (startDate && endDate) {
          return invDate >= new Date(startDate) && invDate <= new Date(endDate + 'T23:59:59');
        } else if (startDate) {
          return invDate >= new Date(startDate);
        } else if (endDate) {
          return invDate <= new Date(endDate + 'T23:59:59');
        }
        return true;
      }
      default:
        return false;
    }
  }).reduce((sum, inv) => sum + inv.price, 0);

  const unpaidTotal = invoices
    .filter(inv => inv.paymentStatus === 'Impayé')
    .reduce((sum, inv) => sum + inv.price, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <span className="badge badge-pending">En attente</span>;
      case 'In Progress': return <span className="badge badge-progress">En cours</span>;
      case 'Completed': return <span className="badge badge-completed">Terminé</span>;
      case 'Cancelled': return <span className="badge badge-cancelled">Annulé</span>;
      default: return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Tableau de bord</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Rechercher une facture..." 
              style={{ paddingLeft: '35px', marginBottom: 0, width: '250px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/nouvelle-facture" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <PlusCircle size={18} />
          Créer une facture
        </Link>
        </div>
      </div>

      <div className="form-row">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Comptabilité & Paiements</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select 
                className="form-control" 
                style={{ width: 'auto', marginBottom: 0, padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                value={revenuePeriod}
                onChange={(e) => setRevenuePeriod(e.target.value as any)}
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois-ci</option>
                <option value="year">Cette année</option>
                <option value="all">Tout le temps</option>
                <option value="custom">Période personnalisée</option>
              </select>
              {revenuePeriod === 'custom' && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '0.5rem' }}>
                  <input type="date" className="form-control" style={{ width: 'auto', marginBottom: 0, padding: '0.25rem' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>au</span>
                  <input type="date" className="form-control" style={{ width: 'auto', marginBottom: 0, padding: '0.25rem' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#166534' }}>{filteredRevenue.toLocaleString()} CFA</div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {revenuePeriod === 'today' ? 'Recette du jour' :
                 revenuePeriod === 'week' ? 'Recette de la semaine' :
                 revenuePeriod === 'month' ? 'Recette du mois' :
                 revenuePeriod === 'year' ? 'Recette de l\'année' : 
                 revenuePeriod === 'custom' ? 'Recette sur la période' : 'Total encaissé'}
              </div>
            </div>
            <div 
              style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => setSearchTerm('Impayé')}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#991b1b' }}>{unpaidTotal.toLocaleString()} CFA</div>
              <div style={{ color: 'var(--text-secondary)' }}>Total Impayés</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Statistiques</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{invoices.length}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Total Factures</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>
                {invoices.filter(i => i.status === 'Pending' || i.status === 'In Progress').length}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Réparations en cours</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="card-header">
            {searchTerm ? 'Résultats de recherche' : 'Dernières Factures'}
          </h3>
          {recentInvoices.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Aucune facture pour le moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentInvoices.map(invoice => (
                <div key={invoice.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{invoice.invoiceNumber} - {invoice.customer.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {invoice.device.brand} {invoice.device.model} 
                      <span style={{ margin: '0 8px' }}>|</span> 
                      Réceptionné par: {employees.find(e => e.id === invoice.employeeId)?.name || 'Inconnu'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: invoice.paymentStatus === 'Payé' ? '#dcfce7' : '#fee2e2',
                      color: invoice.paymentStatus === 'Payé' ? '#166534' : '#991b1b'
                    }}>
                      {invoice.paymentStatus}
                    </span>
                    {getStatusBadge(invoice.status)}
                    <Link to={`/facture/${invoice.id}`} style={{ color: 'var(--primary-color)' }}>
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
