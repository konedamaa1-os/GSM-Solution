import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Printer, ArrowLeft, Phone, Mail, MapPin, CheckCircle2, DollarSign, CreditCard, UserCheck, X as CloseIcon } from 'lucide-react';

const PAYMENT_METHODS = [
  'Espèces',
  'Wave',
  'Orange Money',
  'MTN Mobile Money',
  'Moov Money',
  'Carte Bancaire',
  'Virement'
];

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const { invoices, employees, updateInvoicePaymentStatus, deleteInvoice, settings, currentShop, activeEmployee, user, isManager } = useAppContext();
  const navigate = useNavigate();

  const [showCashModal, setShowCashModal] = useState(false);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Espèces');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live timer for 2-minute grace period
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  React.useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const invoice = invoices.find(i => i.id === id);

  if (!invoice) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Facture introuvable.</div>;
  }

  const techEmployee = employees.find(e => e.id === invoice.employeeId);
  const isPaid = invoice.paymentStatus === 'Payé';

  const getModificationWindow = () => {
    if (isManager) return { canModify: true, remainingSec: Infinity, isManager: true };
    const refTime = invoice.paidAt || invoice.date;
    if (!refTime) return { canModify: false, remainingSec: 0, isManager: false };
    const diff = Math.floor((nowTimestamp - new Date(refTime).getTime()) / 1000);
    const remaining = 120 - diff;
    return {
      canModify: remaining > 0,
      remainingSec: Math.max(0, remaining),
      isManager: false
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const openCashModal = () => {
    if (activeEmployee) {
      setSelectedCollectorId(activeEmployee.id);
    } else if (employees.length > 0) {
      setSelectedCollectorId(employees[0].id);
    }
    setSelectedPaymentMethod(invoice.paymentMethod || 'Espèces');
    setShowCashModal(true);
  };

  const handleConfirmCashing = async () => {
    setIsSubmitting(true);
    try {
      const collectorObj = employees.find(e => e.id === selectedCollectorId);
      const collectorName = collectorObj?.name || activeEmployee?.name || user?.email?.split('@')[0] || 'Technicien';

      await updateInvoicePaymentStatus(invoice.id, 'Payé', {
        collectorId: selectedCollectorId || undefined,
        collectorName: collectorName,
        paymentMethod: selectedPaymentMethod
      });
      setShowCashModal(false);
    } catch (err: any) {
      alert("Erreur lors de l'encaissement: " + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUnpaid = async () => {
    const windowInfo = getModificationWindow();
    if (!windowInfo.canModify && !isManager) {
      alert("🔒 Délai de modification expiré (2 minutes) : Seul le gérant / manager peut annuler ou modifier cet encaissement.");
      return;
    }

    if (window.confirm("Voulez-vous repasser cette facture en statut Impayé ?")) {
      await updateInvoicePaymentStatus(invoice.id, 'Impayé');
    }
  };

  const handleDeleteInvoice = async () => {
    if (!isManager) {
      alert("🔒 Action interdite : Les techniciens ne sont pas autorisés à supprimer les factures. Seul le gérant peut effectuer cette opération.");
      return;
    }

    if (window.confirm(`Êtes-vous certain de vouloir supprimer définitivement la facture ${invoice.invoiceNumber} ? Cette action est irréversible.`)) {
      const res = await deleteInvoice(invoice.id);
      if (res.success) {
        navigate('/reparations');
      }
    }
  };

  const shopName = settings?.name || currentShop?.name || 'GSM SOLUTION';
  const shopAddress = settings?.address || 'Abidjan, Côte d\'Ivoire';
  const shopPhone1 = settings?.phone || '+225 07 00 00 00 00';
  const shopPhone2 = settings?.phone2;
  const shopPhone3 = settings?.phone3;
  const shopEmail = settings?.email || 'contact@gsmsolution.xyz';
  const shopTerms = settings?.termsAndConditions || 'Garantie légale sur pièces et main d\'œuvre. Les appareils non réclamés après 60 jours pourront être recyclés.';

  const modWindow = getModificationWindow();

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Top action buttons */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Retour
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {isPaid ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                backgroundColor: '#dcfce7',
                color: '#166534',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle2 size={16} /> Payé ({invoice.paymentCollectorName ? `Par ${invoice.paymentCollectorName}` : 'Encaissé'})
              </span>

              {/* 2-min indicator or cancel button */}
              {isManager ? (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleToggleUnpaid}
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  Marquer Impayé
                </button>
              ) : (
                modWindow.canModify ? (
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleToggleUnpaid}
                    style={{ fontSize: '0.78rem', padding: '5px 10px', color: '#b45309', borderColor: '#fde68a', backgroundColor: '#fef3c7', fontWeight: 600 }}
                  >
                    ⏱️ Annuler encaissement ({modWindow.remainingSec}s)
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 500 }}>
                    {"🔒 Verrouillé (> 2 min)"}
                  </span>
                )
              )}
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={openCashModal}
              style={{ backgroundColor: '#16a34a', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CreditCard size={18} /> Encaisser le règlement
            </button>
          )}

          {/* Delete Invoice - Strictly Manager */}
          {isManager && (
            <button
              className="btn btn-secondary"
              onClick={handleDeleteInvoice}
              style={{ color: '#dc2626', backgroundColor: '#fee2e2', borderColor: '#fecaca', fontSize: '0.8rem', padding: '6px 12px', fontWeight: 600 }}
            >
              🗑️ Supprimer Facture
            </button>
          )}

          <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={18} /> Imprimer Reçu
          </button>
        </div>
      </div>

      <div className="card print-container" style={{ padding: '3rem', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
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
              FACTURE / REÇU D'ATELIER
            </h2>
            <div style={{ fontWeight: 'bold', fontSize: '1.15rem', color: 'var(--primary-color)' }}>N° {invoice.invoiceNumber}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Date dépôt : {new Date(invoice.date).toLocaleDateString('fr-FR')}
            </div>

            {/* Official Payment Status Stamp */}
            <div style={{ marginTop: '10px' }}>
              {isPaid ? (
                <div style={{
                  display: 'inline-block',
                  border: '2px solid #16a34a',
                  color: '#15803d',
                  backgroundColor: '#f0fdf4',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ✓ REÇU RÉGLÉ & PAYÉ
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#166534', marginTop: '2px', textTransform: 'none' }}>
                    Encaissé par : <strong>{invoice.paymentCollectorName || 'Collaborateur'}</strong> ({invoice.paymentMethod || 'Espèces'})
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'inline-block',
                  border: '2px solid #ea580c',
                  color: '#c2410c',
                  backgroundColor: '#fff7ed',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>
                  ⏳ EN ATTENTE DE RÈGLEMENT
                </div>
              )}
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
                <th style={{ padding: '1rem', textAlign: 'right' }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1rem' }}>
                  <strong>Réparation technique & Main d'œuvre</strong><br />
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Appareil : {invoice.device.brand} {invoice.device.model} ({invoice.device.issue})</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                  {invoice.price.toLocaleString()} FCFA
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Signatures with Encaisseur Identification */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '3rem', paddingTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.5rem', width: '90%', margin: '0 auto', fontSize: '0.8rem' }}>
              <strong>Signature du Client</strong>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.5rem', width: '90%', margin: '0 auto', fontSize: '0.8rem' }}>
              Technicien Référent :<br />
              <strong>{techEmployee?.name || 'Technicien'}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.5rem', width: '90%', margin: '0 auto', fontSize: '0.8rem' }}>
              Encaissé par :<br />
              <strong>{invoice.paymentCollectorName || (isPaid ? 'Caisse / Atelier' : '—')}</strong>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px dashed #e2e8f0', paddingTop: '1rem' }}>
          {shopTerms}
        </div>
      </div>

      {/* MODAL ENCAISSEMENT & TRACABILITE ENCAISSEUR */}
      {showCashModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={20} color="#16a34a" /> Encaisser le règlement
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Facture {invoice.invoiceNumber} • {invoice.customer.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCashModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Montant Card */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                Montant total à percevoir
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
                {invoice.price.toLocaleString('fr-FR')} <span style={{ fontSize: '1.1rem' }}>FCFA</span>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              
              {/* Encaisseur */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  <UserCheck size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: '#2563eb' }} />
                  Encaisseur (Qui perçoit l'argent ?) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="form-control"
                  value={selectedCollectorId}
                  onChange={e => setSelectedCollectorId(e.target.value)}
                  style={{ fontWeight: 600, padding: '10px 12px', borderRadius: '10px' }}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role}) {activeEmployee?.id === emp.id ? '⭐ (Vous)' : ''}
                    </option>
                  ))}
                </select>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  💡 Le technicien ou le réceptionniste présent peut encaisser. L'encaisseur sera identifié nominativement sur le reçu.
                </p>
              </div>

              {/* Mode de règlement */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Mode de règlement
                </label>
                <select
                  className="form-control"
                  value={selectedPaymentMethod}
                  onChange={e => setSelectedPaymentMethod(e.target.value)}
                  style={{ fontWeight: 600, padding: '10px 12px', borderRadius: '10px' }}
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCashModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 600 }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={handleConfirmCashing}
                style={{
                  flex: 2,
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  backgroundColor: '#16a34a',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={18} />
                <span>{isSubmitting ? 'Validation...' : 'Confirmer l\'encaissement'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InvoiceView;

