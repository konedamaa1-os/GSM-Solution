import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Printer, ArrowLeft } from 'lucide-react';

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const { invoices, employees, updateInvoicePaymentStatus } = useAppContext();
  const navigate = useNavigate();

  const invoice = invoices.find(i => i.id === id);

  if (!invoice) {
    return <div>Facture introuvable.</div>;
  }

  const employee = employees.find(e => e.id === invoice.employeeId);

  const handlePrint = () => {
    window.print();
  };

  const handleTogglePayment = async () => {
    const newStatus = invoice.paymentStatus === 'Payé' ? 'Impayé' : 'Payé';
    await updateInvoicePaymentStatus(invoice.id, newStatus);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Retour
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={18} /> Imprimer
        </button>
      </div>

      <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontWeight: 500 }}>Statut de paiement:</span>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.875rem',
          fontWeight: 600,
          backgroundColor: invoice.paymentStatus === 'Payé' ? '#dcfce7' : '#fee2e2',
          color: invoice.paymentStatus === 'Payé' ? '#166534' : '#991b1b'
        }}>
          {invoice.paymentStatus}
        </span>
        <button 
          className="btn btn-secondary" 
          onClick={handleTogglePayment}
        >
          Marquer comme {invoice.paymentStatus === 'Payé' ? 'Impayé' : 'Payé'}
        </button>
      </div>

      <div className="card print-container" style={{ padding: '3rem', backgroundColor: '#fff' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '2rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>TonTon Boua</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Réparation de téléphones et ordinateurs</p>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Abidjan, Côte d'Ivoire</p>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Tel: +225 00 00 00 00 00</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>FACTURE / REÇU</h2>
            <div style={{ fontWeight: 'bold' }}>N° {invoice.invoiceNumber}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Date: {new Date(invoice.date).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Informations Client</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Nom:</span> <span style={{ fontWeight: 500 }}>{invoice.customer.name}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Téléphone:</span> <span style={{ fontWeight: 500 }}>{invoice.customer.phone}</span>
            </div>
          </div>
        </div>

        {/* Device Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Détails de l'Appareil</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>Marque & Modèle:</span> <b>{invoice.device.brand} {invoice.device.model}</b></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>N° de Série:</span> {invoice.device.serialNumber || 'N/A'}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Code de déverrouillage:</span> {invoice.device.password || 'N/A'}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Accessoires:</span> {invoice.device.accessories || 'Aucun'}</div>
            <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Panne déclarée:</span>
              <p style={{ margin: '0.25rem 0', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                {invoice.device.issue}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div style={{ marginBottom: '2rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Garantie</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1rem' }}>Frais de réparation - {invoice.device.brand} {invoice.device.model}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{invoice.warrantyMonths} mois</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>{invoice.price.toLocaleString()} CFA</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '4rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid var(--text-primary)', paddingTop: '0.5rem', width: '200px', margin: '0 auto' }}>
              Signature Client
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid var(--text-primary)', paddingTop: '0.5rem', width: '200px', margin: '0 auto' }}>
              TonTon Boua (Réceptionné par: {employee?.name || '________________'})
            </div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Merci de votre confiance. <br/>
          Les appareils non réclamés après 3 mois pourront être recyclés.
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
