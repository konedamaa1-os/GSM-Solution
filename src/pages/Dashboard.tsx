import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { PlusCircle, ArrowRight, Search } from 'lucide-react';

const Dashboard = () => {
  const { invoices, employees, isManager } = useAppContext();
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

  const paidInvoicesInPeriod = invoices.filter(inv => {
    if (inv.paymentStatus === 'Impayé') return false;
    
    const invDate = new Date(inv.balancePaidAt || inv.paidAt || inv.date);
    const now = new Date();
    
    switch (revenuePeriod) {
      case 'today':
        return invDate.toLocaleDateString() === now.toLocaleDateString();
      case 'week': {
        const firstDayOfWeek = new Date(now);
        const day = now.getDay() || 7;
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
  });

  const filteredRevenue = paidInvoicesInPeriod.reduce((sum, inv) => {
    if (inv.paymentStatus === 'Payé') return sum + inv.price;
    if (inv.paymentStatus === 'Partiel') return sum + (inv.advancePayment || 0);
    return sum;
  }, 0);

  // Group revenue by collector
  const revenueByCollector = React.useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    paidInvoicesInPeriod.forEach(inv => {
      if (inv.paymentStatus === 'Payé') {
        if (inv.advancePayment && inv.advancePayment > 0 && inv.advancePayment < inv.price && inv.balancePaymentCollectorName) {
          // Advance collector
          const advCollector = inv.paymentCollectorName || 'Collaborateur';
          const prevAdv = map.get(advCollector) || { count: 0, total: 0 };
          map.set(advCollector, { count: prevAdv.count + 1, total: prevAdv.total + inv.advancePayment });
          // Balance collector
          const balCollector = inv.balancePaymentCollectorName;
          const prevBal = map.get(balCollector) || { count: 0, total: 0 };
          map.set(balCollector, { count: prevBal.count + 1, total: prevBal.total + (inv.price - inv.advancePayment) });
        } else {
          const collector = inv.balancePaymentCollectorName || inv.paymentCollectorName || 'Non spécifié';
          const prev = map.get(collector) || { count: 0, total: 0 };
          map.set(collector, { count: prev.count + 1, total: prev.total + inv.price });
        }
      } else if (inv.paymentStatus === 'Partiel') {
        const collector = inv.paymentCollectorName || 'Non spécifié';
        const prev = map.get(collector) || { count: 0, total: 0 };
        map.set(collector, { count: prev.count + 1, total: prev.total + (inv.advancePayment || 0) });
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [paidInvoicesInPeriod]);

  const unpaidTotal = invoices.reduce((sum, inv) => {
    if (inv.paymentStatus === 'Payé') return sum;
    if (inv.paymentStatus === 'Partiel') return sum + Math.max(0, inv.price - (inv.advancePayment || 0));
    return sum + inv.price;
  }, 0);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Tableau de bord</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
        {isManager && (
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
            <div style={{ padding: '1rem', backgroundColor: 'var(--stat-green-bg)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--stat-green-text)' }}>{filteredRevenue.toLocaleString()} CFA</div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {revenuePeriod === 'today' ? 'Recette du jour' :
                 revenuePeriod === 'week' ? 'Recette de la semaine' :
                 revenuePeriod === 'month' ? 'Recette du mois' :
                 revenuePeriod === 'year' ? 'Recette de l\'année' : 
                 revenuePeriod === 'custom' ? 'Recette sur la période' : 'Total encaissé'}
              </div>
            </div>
            <div 
              style={{ padding: '1rem', backgroundColor: 'var(--stat-red-bg)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => setSearchTerm('Impayé')}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--stat-red-text)' }}>{unpaidTotal.toLocaleString()} CFA</div>
              <div style={{ color: 'var(--text-secondary)' }}>Total Impayés</div>
            </div>
          </div>

          {/* Breakdown by Encaisseur / Collaborateur */}
          {revenueByCollector.length > 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                👤 Encaissements par Collaborateur ({revenueByCollector.length}) :
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {revenueByCollector.map(([name, data]) => (
                  <div key={name} style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{name} :</span>
                    <strong style={{ color: '#16a34a' }}>{data.total.toLocaleString()} F</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({data.count} réc.)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
        )}

        <div className="card">
          <h3 className="card-header">Statistiques</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--stat-blue-bg)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{invoices.length}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Total Factures</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--stat-yellow-bg)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--stat-yellow-text)' }}>
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
                <div key={invoice.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{invoice.invoiceNumber} - {invoice.customer.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {invoice.device.brand} {invoice.device.model} 
                      <span style={{ margin: '0 8px' }}>•</span> 
                      <span style={{ color: '#2563eb', fontWeight: 500 }}>
                        🔧 Technicien : {employees.find(e => e.id === invoice.employeeId)?.name || 'Non assigné'}
                      </span>
                      {invoice.paymentStatus === 'Payé' && invoice.paymentCollectorName && (
                        <>
                          <span style={{ margin: '0 8px' }}>•</span>
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>
                            💰 Encaissé par : {invoice.paymentCollectorName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: invoice.paymentStatus === 'Payé' ? 'var(--stat-green-bg)' : 'var(--stat-red-bg)',
                      color: invoice.paymentStatus === 'Payé' ? 'var(--stat-green-text)' : 'var(--stat-red-text)'
                    }}>
                      {invoice.paymentStatus}
                    </span>
                    {getStatusBadge(invoice.status)}
                    <Link 
                      to={`/facture/${invoice.id}`} 
                      className="btn btn-secondary" 
                      style={{ 
                        padding: '0.35rem 0.7rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        backgroundColor: '#eff6ff', 
                        borderColor: '#bfdbfe', 
                        color: '#1d4ed8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      🧾 Petit Reçu
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

