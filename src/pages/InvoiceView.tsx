import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Printer, ArrowLeft, Phone, Mail, MapPin, CheckCircle2, DollarSign, CreditCard, UserCheck, X as CloseIcon, Receipt, FileText, Wrench, Smartphone, User, ShieldAlert } from 'lucide-react';

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

  // Mode d'affichage et d'impression : 'ticket' (Petit Reçu 80mm) ou 'a4' (Facture Standard A4)
  const [viewMode, setViewMode] = useState<'ticket' | 'a4'>('ticket');

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

  const contextInvoice = invoices.find(i => i.id === id);
  const [directInvoice, setDirectInvoice] = useState<any>(null);
  const [fetchingDirect, setFetchingDirect] = useState(false);

  React.useEffect(() => {
    if (!contextInvoice && id) {
      setFetchingDirect(true);
      supabase
        .from('tb_invoices')
        .select(`
          *,
          customer:tb_customers(*),
          device:tb_devices(*)
        `)
        .eq('id', id)
        .maybeSingle()
        .then(({ data, error }) => {
          setFetchingDirect(false);
          if (data) {
            const dev = Array.isArray(data.device) ? data.device[0] : data.device;
            const cust = Array.isArray(data.customer) ? data.customer[0] : data.customer;
            setDirectInvoice({
              id: data.id,
              shop_id: data.shop_id,
              invoiceNumber: data.invoice_number,
              date: data.date,
              customer: cust || { name: 'Client', phone: '' },
              device: dev || { brand: '', model: '', issue: '' },
              employeeId: data.employee_id,
              price: data.price,
              warrantyMonths: data.warranty_months || 0,
              status: data.status,
              paymentStatus: data.payment_status,
              paymentCollectorId: data.payment_collector_id,
              paymentCollectorName: data.payment_collector_name,
              paymentMethod: data.payment_method,
              paidAt: data.paid_at,
              notes: data.notes
            });
          }
        });
    }
  }, [contextInvoice, id]);

  const invoice = contextInvoice || directInvoice;

  if (fetchingDirect) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🧾 Chargement du Petit Reçu...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Facture / Reçu introuvable</div>
        <button className="btn btn-primary" onClick={() => navigate('/reparations')}>
          Voir la liste des réparations
        </button>
      </div>
    );
  }

  const techEmployee = employees.find(e => e.id === invoice.employeeId);
  const isPaid = invoice.paymentStatus === 'Payé';
  const isPartial = invoice.paymentStatus === 'Partiel';
  const advanceAmount = isPaid ? invoice.price : (invoice.advancePayment || 0);
  const remainingBalance = isPaid ? 0 : Math.max(0, invoice.price - advanceAmount);

  const [cashModalMode, setCashModalMode] = useState<'balance' | 'full' | 'advance'>('balance');
  const [customAdvanceInput, setCustomAdvanceInput] = useState<string>('');

  const getModificationWindow = () => {
    if (isManager) return { canModify: true, remainingSec: Infinity, isManager: true };
    const refTime = invoice.balancePaidAt || invoice.paidAt || invoice.date;
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
    setSelectedPaymentMethod('Espèces');
    if (isPartial) {
      setCashModalMode('balance');
    } else {
      setCashModalMode('full');
      setCustomAdvanceInput(invoice.price ? String(Math.floor(invoice.price / 2)) : '');
    }
    setShowCashModal(true);
  };

  const handleConfirmCashing = async () => {
    setIsSubmitting(true);
    try {
      const collectorObj = employees.find(e => e.id === selectedCollectorId);
      const collectorName = collectorObj?.name || activeEmployee?.name || user?.email?.split('@')[0] || 'Technicien';

      if (cashModalMode === 'balance') {
        // Encaisser le solde au retrait -> Devient 'Payé'
        await updateInvoicePaymentStatus(invoice.id, 'Payé', {
          collectorId: selectedCollectorId || undefined,
          collectorName: collectorName,
          paymentMethod: selectedPaymentMethod,
          isBalanceSettlement: true
        });
      } else if (cashModalMode === 'full') {
        // Encaisser la totalité -> Devient 'Payé'
        await updateInvoicePaymentStatus(invoice.id, 'Payé', {
          collectorId: selectedCollectorId || undefined,
          collectorName: collectorName,
          paymentMethod: selectedPaymentMethod
        });
      } else if (cashModalMode === 'advance') {
        // Encaisser une avance partielle -> Devient 'Partiel'
        const adv = Number(customAdvanceInput);
        if (!adv || adv <= 0 || adv >= invoice.price) {
          alert("Veuillez indiquer un montant d'avance valide inférieur au prix total.");
          setIsSubmitting(false);
          return;
        }
        await updateInvoicePaymentStatus(invoice.id, 'Partiel', {
          collectorId: selectedCollectorId || undefined,
          collectorName: collectorName,
          paymentMethod: selectedPaymentMethod,
          advancePayment: adv
        });
      }

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
  const shopTerms = settings?.termsAndConditions || 'Appareil non réclamé après 60 jours sera recyclé. Présentation obligatoire de ce ticket pour tout retrait.';

  const modWindow = getModificationWindow();

  const handleWhatsAppShare = () => {
    let cleanPhone = (invoice.customer?.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && !cleanPhone.startsWith('225')) {
      cleanPhone = '225' + cleanPhone;
    }
    let statusText = 'IMPAYÉ (À régler au retrait ⏳)';
    if (isPaid) {
      statusText = 'TOTALEMENT PAYÉ & RÉGLÉ ✅';
    } else if (isPartial) {
      statusText = `AVANCE PAYÉE : ${advanceAmount.toLocaleString('fr-FR')} F (Reste au retrait : ${remainingBalance.toLocaleString('fr-FR')} F)`;
    }

    const receiptText = `*${shopName}* - REÇU DE RÉPARATION 80mm\n` +
      `--------------------------------\n` +
      `📄 N° Reçu : *${invoice.invoiceNumber}*\n` +
      `📅 Date : ${new Date(invoice.date).toLocaleDateString('fr-FR')} à ${new Date(invoice.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}\n` +
      `👤 Client : *${invoice.customer.name}*\n` +
      `📱 Contact : ${invoice.customer.phone}\n` +
      `--------------------------------\n` +
      `🔧 Appareil : *${invoice.device.brand} ${invoice.device.model}*\n` +
      `⚠️ Panne : ${invoice.device.issue}\n` +
      (invoice.device.accessories ? `📦 Accessoires : ${invoice.device.accessories}\n` : '') +
      `--------------------------------\n` +
      `💰 MONTANT TOTAL : *${invoice.price.toLocaleString('fr-FR')} FCFA*\n` +
      (isPartial ? `💵 Avance versée : *${advanceAmount.toLocaleString('fr-FR')} FCFA*\n⏳ *Reste au retrait : ${remainingBalance.toLocaleString('fr-FR')} FCFA*\n` : '') +
      (isPaid && invoice.advancePayment && invoice.advancePayment < invoice.price ? `💵 Avance : ${invoice.advancePayment.toLocaleString('fr-FR')} F | Solde au retrait : ${(invoice.price - invoice.advancePayment).toLocaleString('fr-FR')} F\n` : '') +
      `📌 Statut Règlement : *${statusText}*\n` +
      (invoice.paymentCollectorName ? `👤 Encaissement : ${invoice.paymentCollectorName} (${invoice.paymentMethod || 'Espèces'})\n` : '') +
      (invoice.balancePaymentCollectorName ? `👤 Solde retrait encaissé par : ${invoice.balancePaymentCollectorName} (${invoice.balancePaymentMethod || 'Espèces'})\n` : '') +
      `👨‍🔧 Technicien : ${techEmployee?.name || 'Atelier'}\n` +
      `--------------------------------\n` +
      `📍 ${shopAddress}\n` +
      `📞 ${shopPhone1} ${shopPhone2 ? `/ ${shopPhone2}` : ''}\n` +
      `⚠️ *Présentation de ce reçu obligatoire pour le retrait.*\n` +
      `Merci de votre confiance !`;

    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(receiptText)}` : `https://wa.me/?text=${encodeURIComponent(receiptText)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* 🖨️ CSS PRINT DÉDIÉ POUR LE PETIT REÇU THERMIQUE (80mm) ET LE FORMAT A4 */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          ${viewMode === 'ticket' ? `
            @page {
              size: 80mm auto;
              margin: 0;
            }
            .ticket-container {
              display: block !important;
              width: 68mm !important;
              max-width: 68mm !important;
              margin: 0 auto !important;
              padding: 2mm 1mm !important;
              box-shadow: none !important;
              border: none !important;
              font-size: 10px !important;
              color: #000000 !important;
              line-height: 1.25 !important;
            }
            .print-container-a4 {
              display: none !important;
            }
          ` : `
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            .ticket-container {
              display: none !important;
            }
            .print-container-a4 {
              display: block !important;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              width: 100% !important;
            }
          `}
        }
      `}</style>

      {/* Top action buttons */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Retour
        </button>
        
        {/* Sélecteur de format : Petit Reçu 80mm vs Grand Format A4 */}
        <div style={{
          display: 'inline-flex',
          backgroundColor: '#e2e8f0',
          padding: '4px',
          borderRadius: '10px',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setViewMode('ticket')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: viewMode === 'ticket' ? '#2563eb' : 'transparent',
              color: viewMode === 'ticket' ? '#ffffff' : '#475569',
              boxShadow: viewMode === 'ticket' ? '0 2px 6px rgba(37,99,235,0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Receipt size={16} /> 🧾 Reçu Format 80mm
          </button>

          <button
            type="button"
            onClick={() => setViewMode('a4')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: viewMode === 'a4' ? '#2563eb' : 'transparent',
              color: viewMode === 'a4' ? '#ffffff' : '#475569',
              boxShadow: viewMode === 'a4' ? '0 2px 6px rgba(37,99,235,0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <FileText size={16} /> 📄 Facture A4
          </button>
        </div>

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
                <CheckCircle2 size={16} /> Totalement Payé
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
                    ⏱️ Annuler ({modWindow.remainingSec}s)
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 500 }}>
                    {"🔒 Verrouillé (> 2 min)"}
                  </span>
                )
              )}
            </div>
          ) : isPartial ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #bfdbfe'
              }}>
                💰 Avance : {advanceAmount.toLocaleString('fr-FR')} F (Reste : {remainingBalance.toLocaleString('fr-FR')} F)
              </span>

              <button 
                className="btn btn-primary" 
                onClick={openCashModal}
                style={{ backgroundColor: '#16a34a', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.85rem' }}
              >
                <CreditCard size={16} /> Encaisser le solde ({remainingBalance.toLocaleString('fr-FR')} F)
              </button>

              {isManager && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleToggleUnpaid}
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                >
                  Annuler avance
                </button>
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
              🗑️ Supprimer
            </button>
          )}

          <button 
            className="btn btn-primary" 
            onClick={handlePrint} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', border: 'none', fontWeight: 700 }}
          >
            <Printer size={18} /> {viewMode === 'ticket' ? 'Imprimer Reçu 80mm' : 'Imprimer Facture A4'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧾 FORMAT 1 : REÇU FORMAT 80MM (TICKET DE CAISSE THERMIQUE)              */}
      {/* ========================================================================= */}
      {viewMode === 'ticket' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          
          <div 
            className="ticket-container" 
            style={{
              width: '100%',
              maxWidth: '260px',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              padding: '0.65rem 0.65rem',
              borderRadius: '8px',
              border: '1.5px dashed #94a3b8',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              fontFamily: '"Courier New", Courier, monospace, system-ui',
              color: '#0f172a',
              lineHeight: 1.15,
              fontSize: '0.74rem'
            }}
          >
            {/* En-tête Boutique */}
            <div style={{ textAlign: 'center', paddingBottom: '2px' }}>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2px', color: '#0f172a' }}>
                {shopName}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '1px', fontWeight: 700 }}>
                SERVICE RÉPARATION & GSM
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                📍 {shopAddress}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1e293b' }}>
                📞 {shopPhone1} {shopPhone2 && `• ${shopPhone2}`}
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #94a3b8', margin: '3px 0' }} />

            {/* Numéro & Date */}
            <div style={{ textAlign: 'center', padding: '1px 0' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                TICKET DE PRISE EN CHARGE
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#2563eb', margin: '1px 0' }}>
                N° {invoice.invoiceNumber}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600 }}>
                📅 {new Date(invoice.date).toLocaleDateString('fr-FR')} à {new Date(invoice.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #94a3b8', margin: '3px 0' }} />

            {/* Informations Client */}
            <div style={{ fontSize: '0.72rem', padding: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>CLIENT :</span>
                <span style={{ fontWeight: 900, textTransform: 'uppercase', textAlign: 'right' }}>{invoice.customer.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>CONTACT :</span>
                <span style={{ fontWeight: 800 }}>{invoice.customer.phone} {invoice.customer.phone2 && `| ${invoice.customer.phone2}`}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #94a3b8', margin: '3px 0' }} />

            {/* Détails Appareil & Panne */}
            <div style={{ fontSize: '0.72rem', padding: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>APPAREIL :</span>
                <span style={{ fontWeight: 900, textTransform: 'uppercase', textAlign: 'right' }}>{invoice.device.brand} {invoice.device.model}</span>
              </div>
              <div style={{ marginBottom: '1px' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>PANNE :</span>
                <div style={{ fontWeight: 800, backgroundColor: '#f8fafc', padding: '2px 5px', borderRadius: '3px', marginTop: '1px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '0.7rem' }}>
                  🛠️ {invoice.device.issue}
                </div>
              </div>
              {invoice.device.accessories && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginTop: '1px' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Accessoires :</span>
                  <span style={{ fontWeight: 700 }}>{invoice.device.accessories}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed #94a3b8', margin: '3px 0' }} />

            {/* Montant & Règlement */}
            <div style={{ textAlign: 'center', padding: '3px 0', backgroundColor: '#f8fafc', borderRadius: '5px', border: '1px solid #cbd5e1', margin: '2px 0' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                MONTANT TOTAL
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0' }}>
                {invoice.price.toLocaleString('fr-FR')} <span style={{ fontSize: '0.78rem' }}>FCFA</span>
              </div>
              
              {/* Détail Avance et Reste si Partiel ou Payé avec avance */}
              {isPartial && (
                <div style={{ margin: '2px 4px', padding: '3px 4px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#1e40af', fontWeight: 700 }}>
                    <span>Avance versée :</span>
                    <span>{advanceAmount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#c2410c', fontWeight: 900, marginTop: '1px', borderTop: '1px dashed #fed7aa', paddingTop: '1px' }}>
                    <span>SOLDE AU RETRAIT :</span>
                    <span>{remainingBalance.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '2px' }}>
                {isPaid ? (
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 900,
                    fontSize: '0.68rem'
                  }}>
                    ✅ TOTALEMENT RÉGLÉ ({invoice.balancePaymentMethod || invoice.paymentMethod || 'Espèces'})
                  </span>
                ) : isPartial ? (
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 900,
                    fontSize: '0.68rem',
                    border: '1px solid #93c5fd'
                  }}>
                    🟡 AVANCE REÇUE (Solde à payer)
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: '#fff7ed',
                    color: '#c2410c',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 900,
                    fontSize: '0.68rem'
                  }}>
                    ⏳ IMPAYÉ (À régler au retrait)
                  </span>
                )}
              </div>

              {/* Traçabilité Encaisseurs */}
              {invoice.paymentCollectorName && (
                <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '2px', fontWeight: 600 }}>
                  {isPartial ? "Avance reçue par :" : "Encaissé par :"} <strong>{invoice.paymentCollectorName}</strong>
                </div>
              )}
              {invoice.balancePaymentCollectorName && (
                <div style={{ fontSize: '0.65rem', color: '#15803d', marginTop: '1px', fontWeight: 700 }}>
                  Solde retrait reçu par : <strong>{invoice.balancePaymentCollectorName}</strong>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed #94a3b8', margin: '3px 0' }} />

            {/* Intervenant & Conditions */}
            <div style={{ textAlign: 'center', fontSize: '0.66rem', color: '#475569' }}>
              <div>
                Technicien : <strong>{techEmployee?.name || 'Atelier'}</strong>
              </div>
              <div style={{ fontStyle: 'italic', fontSize: '0.64rem', color: '#64748b', marginTop: '2px', lineHeight: 1.15 }}>
                * Présentation de ce ticket obligatoire pour le retrait. *<br />
                * Appareil non réclamé après 60 jours recyclé. *
              </div>
              <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px', fontSize: '0.7rem' }}>
                Merci pour votre confiance !
              </div>

              {/* Simulated Barcode */}
              <div style={{ marginTop: '3px', letterSpacing: '2px', fontSize: '0.75rem', color: '#64748b', fontWeight: 900 }}>
                ||||| | || |||| | ||||| | |||
              </div>
            </div>
          </div>

          {/* Quick Action Buttons on Screen */}
          <div className="no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
              style={{
                backgroundColor: '#0f172a',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Printer size={18} /> Imprimer Ticket (80mm)
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              style={{
                backgroundColor: '#22c55e',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)'
              }}
            >
              💬 Partager sur WhatsApp
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 📄 FORMAT 2 : FACTURE COMPLÈTE STANDARD (A4)                              */}
      {/* ========================================================================= */}
      {viewMode === 'a4' && (
        <div className="card print-container-a4" style={{ padding: '3rem', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
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
                    {invoice.price.toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
                {/* Ligne Avance / Acompte */}
                {(isPartial || (invoice.advancePayment && invoice.advancePayment > 0)) && (
                  <>
                    <tr style={{ backgroundColor: '#eff6ff' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#1e40af', fontWeight: 600, fontSize: '0.9rem' }}>
                        💰 Acompte / Avance versée à la prise en charge {invoice.paymentCollectorName ? `(Encaissée par ${invoice.paymentCollectorName})` : ''}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#1e40af', fontSize: '1rem' }}>
                        - {advanceAmount.toLocaleString('fr-FR')} FCFA
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: isPaid ? '#f0fdf4' : '#fff7ed', borderTop: '2px solid #cbd5e1' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: isPaid ? '#15803d' : '#c2410c', fontSize: '1rem' }}>
                        {isPaid ? "✅ Solde restant réglé au retrait :" : "⏳ RESTE À PAYER AU RETRAIT :"}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 900, color: isPaid ? '#15803d' : '#ea580c', fontSize: '1.2rem' }}>
                        {remainingBalance.toLocaleString('fr-FR')} FCFA
                      </td>
                    </tr>
                  </>
                )}
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
                {invoice.balancePaymentCollectorName ? (
                  <>
                    Solde retrait encaissé par :<br />
                    <strong>{invoice.balancePaymentCollectorName}</strong>
                  </>
                ) : (
                  <>
                    Encaissé par :<br />
                    <strong>{invoice.paymentCollectorName || (isPaid ? 'Caisse / Atelier' : '—')}</strong>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px dashed #e2e8f0', paddingTop: '1rem' }}>
            {shopTerms}
          </div>
        </div>
      )}

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={20} color="#16a34a" /> 
                  {isPartial ? "Encaisser le solde au retrait" : "Encaisser le règlement"}
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

            {/* If Impayé: Options to pay full or advance */}
            {!isPartial && !isPaid && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setCashModalMode('full')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: cashModalMode === 'full' ? 700 : 500,
                    backgroundColor: cashModalMode === 'full' ? '#f0fdf4' : '#ffffff',
                    color: cashModalMode === 'full' ? '#15803d' : '#475569',
                    border: cashModalMode === 'full' ? '2px solid #22c55e' : '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Tout solder ({invoice.price.toLocaleString('fr-FR')} F)
                </button>
                <button
                  type="button"
                  onClick={() => setCashModalMode('advance')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: cashModalMode === 'advance' ? 700 : 500,
                    backgroundColor: cashModalMode === 'advance' ? '#eff6ff' : '#ffffff',
                    color: cashModalMode === 'advance' ? '#1d4ed8' : '#475569',
                    border: cashModalMode === 'advance' ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  💰 Encaisser une avance
                </button>
              </div>
            )}

            {/* Montant Card */}
            <div style={{
              backgroundColor: isPartial ? '#eff6ff' : (cashModalMode === 'advance' ? '#eff6ff' : '#f0fdf4'),
              border: `1.5px solid ${isPartial || cashModalMode === 'advance' ? '#bfdbfe' : '#bbf7d0'}`,
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}>
              {isPartial ? (
                <>
                  <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
                    Solde restant à percevoir au retrait
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1d4ed8', marginTop: '2px' }}>
                    {remainingBalance.toLocaleString('fr-FR')} <span style={{ fontSize: '1.1rem' }}>FCFA</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
                    (Total: {invoice.price.toLocaleString('fr-FR')} F • Avance déjà versée: {advanceAmount.toLocaleString('fr-FR')} F)
                  </div>
                </>
              ) : cashModalMode === 'advance' ? (
                <>
                  <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Montant de l'avance à encaisser (FCFA)
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={invoice.price - 1}
                    value={customAdvanceInput}
                    onChange={e => setCustomAdvanceInput(e.target.value)}
                    placeholder="Montant avance"
                    className="form-control"
                    style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', color: '#1d4ed8', border: '2px solid #3b82f6' }}
                  />
                  {customAdvanceInput && (
                    <div style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 700, marginTop: '6px' }}>
                      Reste à payer au retrait : {Math.max(0, invoice.price - Number(customAdvanceInput)).toLocaleString('fr-FR')} FCFA
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                    Montant total à percevoir
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
                    {invoice.price.toLocaleString('fr-FR')} <span style={{ fontSize: '1.1rem' }}>FCFA</span>
                  </div>
                </>
              )}
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              
              {/* Encaisseur */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  <UserCheck size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: '#2563eb' }} />
                  Encaisseur (Qui perçoit l'argent ?) <span style={{ color: '#ef4444' }}>*</span>
                </label>

                {!isManager ? (
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                        👤 {activeEmployee?.name || 'Vous-même'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {activeEmployee?.role || 'Technicien'} (Votre compte connecté)
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      backgroundColor: '#e2e8f0',
                      color: '#475569',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 700
                    }}>
                      🔒 Verrouillé
                    </span>
                  </div>
                ) : (
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
                )}

                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  {!isManager 
                    ? "🔒 Sécurité : Vous encaissez à votre propre nom. Les techniciens ne peuvent pas encaisser au nom d'un autre."
                    : "💡 En tant que Gérant, vous pouvez désigner qui a reçu le paiement."}
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

