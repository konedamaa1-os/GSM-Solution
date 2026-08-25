import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Printer, ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const { invoices, employees, updateInvoicePaymentStatus, settings, currentShop } = useAppContext();
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

  const shopName = settings?.name || currentShop?.name || 'GSM SOLUTION';
  const shopAddress = settings?.address || 'Abidjan, Côte d\'Ivoire';
  const shopPhone1 = settings?.phone || '+225 07 00 00 00 00';
  const shopPhone2 = settings?.phone2;
  const shopPhone3 = settings?.phone3;
  const shopEmail = settings?.email || 'contact@gsmsolution.xyz';
  const shopTerms = settings?.termsAndConditions || 'Garantie légale sur pièces et main d\'œuvre. Les appareils non réclamés après 60 jours pourront être recyclés.';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Retour
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={18} /> Imprimer Reçu
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

      <div className="card print-container" style={{ padding: '3rem', backgroundColor: '#fff', borderRadius: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '2rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
              {shopName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '0.9rem' }}>
              Service de Réparation & Maintenance Téléphonie
            </p>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> {shopAddress}
            </p>
            <div style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span>📞 {shopPhone1}</span>
              {shopPhone2 && <span>• 💬 {shopPhone2}</span>}
              {shopPhone3 && <span>• 🚨 {shopPhone3}</span>}
            </div>
            {shopEmail && (
              <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                ✉️ {shopEmail}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
              FACTURE / REÇU
            </h2>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-color)' }}>N° {invoice.invoiceNumber}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Date : {new Date(invoice.date).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Customer Info with 3 Contact Numbers */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', fontWeight: 700 }}>
            Informations Client & Contacts
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nom du client :</span>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{invoice.customer.name}</div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Contact Principal :</span>
              <div style={{ fontWeight: 600, color: '#1d4ed8' }}>📱 {invoice.customer.phone}</div>
            </div>

            {invoice.customer.phone2 && (
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Contact 2 (WhatsApp) :</span>
                <div style={{ fontWeight: 600, color: '#047857' }}>💬 {invoice.customer.phone2}</div>
              </div>
            )}

            {invoice.customer.phone3 && (
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Contact 3 (Urgence) :</span>
                <div style={{ fontWeight: 600, color: '#b45309' }}>🚨 {invoice.customer.phone3}</div>
              </div>
            )}
          </div>
        </div>

        {/* Device Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', fontWeight: 700 }}>
            Détails de l'Appareil
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>Marque & Modèle :</span> <b>{invoice.device.brand} {invoice.device.model}</b></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>N° de Série / IMEI :</span> {invoice.device.serialNumber || 'Non renseigné'}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Code de déverrouillage :</span> {invoice.device.password || 'Non communiqué'}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Accessoires laissés :</span> {invoice.device.accessories || 'Aucun'}</div>
            <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Panne déclarée :</span>
              <p style={{ margin: '0.25rem 0', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', fontWeight: 500 }}>
                {invoice.device.issue}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div style={{ marginBottom: '2rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Description des prestations</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Garantie</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1rem' }}>
                  <strong>Réparation technique & Main d'œuvre</strong><br />
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Appareil : {invoice.device.brand} {invoice.device.model} ({invoice.device.issue})</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{invoice.warrantyMonths} mois</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                  {invoice.price.toLocaleString()} FCFA
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem', paddingTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.5rem', width: '220px', margin: '0 auto', fontSize: '0.85rem' }}>
              Signature du Client
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.5rem', width: '220px', margin: '0 auto', fontSize: '0.85rem' }}>
              Pour l'Atelier (Réceptionné par: <strong>{employee?.name || 'Technicien'}</strong>)
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px dashed #e2e8f0', paddingTop: '1rem' }}>
          {shopTerms}
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
