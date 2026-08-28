import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Invoice, RepairStatus } from '../types';
import { Link } from 'react-router-dom';
import { Search, Filter, CheckCircle2, DollarSign, CreditCard, UserCheck, X as CloseIcon } from 'lucide-react';

const PAYMENT_METHODS = [
  'Espèces',
  'Wave',
  'Orange Money',
  'MTN Mobile Money',
  'Moov Money',
  'Carte Bancaire',
  'Virement'
];

const RepairTracking = () => {
  const { invoices, updateInvoiceStatus, updateInvoicePaymentStatus, deleteInvoice, employees, activeEmployee, user, isManager } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');

  // Live timer for 2-minute grace period calculation
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  React.useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getModificationWindow = (invoice: Invoice) => {
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

  // Modal State for Cashing
  const [cashingInvoice, setCashingInvoice] = useState<Invoice | null>(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Espèces');
  const [cashModalMode, setCashModalMode] = useState<'balance' | 'full' | 'advance'>('balance');
  const [customAdvanceInput, setCustomAdvanceInput] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.paymentCollectorName && invoice.paymentCollectorName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || invoice.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleStatusChange = (id: string, status: string) => {
    updateInvoiceStatus(id, status as RepairStatus);
  };

  const openCashModal = (invoice: Invoice) => {
    setCashingInvoice(invoice);
    if (activeEmployee) {
      setSelectedCollectorId(activeEmployee.id);
    } else if (employees.length > 0) {
      setSelectedCollectorId(employees[0].id);
    } else {
      setSelectedCollectorId('');
    }
    setSelectedPaymentMethod('Espèces');
    if (invoice.paymentStatus === 'Partiel') {
      setCashModalMode('balance');
    } else {
      setCashModalMode('full');
      setCustomAdvanceInput(invoice.price ? String(Math.floor(invoice.price / 2)) : '');
    }
  };

  const handleConfirmCashing = async () => {
    if (!cashingInvoice) return;
    setIsSubmittingPayment(true);

    try {
      const collectorObj = employees.find(e => e.id === selectedCollectorId);
      const collectorName = collectorObj?.name || activeEmployee?.name || user?.email?.split('@')[0] || 'Technicien';

      if (cashModalMode === 'balance') {
        await updateInvoicePaymentStatus(cashingInvoice.id, 'Payé', {
          collectorId: selectedCollectorId || undefined,
          collectorName: collectorName,
          paymentMethod: selectedPaymentMethod,
          isBalanceSettlement: true
        });
      } else if (cashModalMode === 'full') {
        await updateInvoicePaymentStatus(cashingInvoice.id, 'Payé', {
          collectorId: selectedCollectorId || undefined,
          collectorName: collectorName,
          paymentMethod: selectedPaymentMethod
        });
      } else if (cashModalMode === 'advance') {
        const adv = Number(customAdvanceInput);
        if (!adv || adv <= 0 || adv >= cashingInvoice.price) {
          alert("Veuillez indiquer un montant d'avance valide inférieur au montant total.");
          setIsSubmittingPayment(false);
          return;
        }
        await updateInvoicePaymentStatus(cashingInvoice.id, 'Partiel', {
          collectorId: selectedCollectorId || undefined,
          collectorName: collectorName,
          paymentMethod: selectedPaymentMethod,
          advancePayment: adv
        });
      }

      setCashingInvoice(null);
    } catch (err: any) {
      alert("Erreur lors de l'encaissement: " + (err.message || ''));
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleMarkAsUnpaid = async (invoice: Invoice) => {
    const windowInfo = getModificationWindow(invoice);
    if (!windowInfo.canModify && !isManager) {
      alert("🔒 Délai de modification expiré (2 minutes) : Seul le gérant / manager peut modifier ou annuler un encaissement après 2 minutes.");
      return;
    }

    if (window.confirm("Voulez-vous repasser cette facture en statut Impayé ?")) {
      await updateInvoicePaymentStatus(invoice.id, 'Impayé');
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!isManager) {
      alert("🔒 Action interdite : Les techniciens ne peuvent pas supprimer de réparations. Seul le gérant est autorisé.");
      return;
    }

    if (window.confirm(`Êtes-vous certain de vouloir supprimer définitivement la facture ${invoice.invoiceNumber} (${invoice.customer.name}) ? Cette action est irréversible.`)) {
      await deleteInvoice(invoice.id);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Suivi des Réparations</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Gestion de l'atelier, avancement des diagnostics et traçabilité des encaissements.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Rechercher facture, client, encaisseur..." 
              style={{ paddingLeft: '35px', marginBottom: 0, width: '240px', textTransform: 'uppercase' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value.toUpperCase())}
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

          <div>
            <select 
              className="form-control" 
              style={{ marginBottom: 0, width: '160px' }} 
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
            >
              <option value="All">Tous règlements</option>
              <option value="Impayé">⏳ 100% Impayés</option>
              <option value="Partiel">💰 Avances versées</option>
              <option value="Payé">✅ Totalement Payés</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem 0.5rem' }}>Facture</th>
              <th style={{ padding: '1rem 0.5rem' }}>Client</th>
              <th style={{ padding: '1rem 0.5rem' }}>Appareil & Panne</th>
              <th style={{ padding: '1rem 0.5rem' }}>Technicien</th>
              <th style={{ padding: '1rem 0.5rem' }}>Montant</th>
              <th style={{ padding: '1rem 0.5rem' }}>Statut Réparation</th>
              <th style={{ padding: '1rem 0.5rem' }}>Règlement / Encaisseur</th>
              <th style={{ padding: '1rem 0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(invoice => {
              const isPaid = invoice.paymentStatus === 'Payé';
              const tech = employees.find(e => e.id === invoice.employeeId);

              return (
                <tr key={invoice.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {/* N° Facture */}
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>
                    <Link to={`/facture/${invoice.id}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                      {invoice.invoiceNumber}
                    </Link>
                  </td>

                  {/* Client */}
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{invoice.customer.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{invoice.customer.phone}</div>
                  </td>

                  {/* Appareil */}
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{invoice.device.brand} {invoice.device.model}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{invoice.device.issue.substring(0, 32)}...</div>
                  </td>

                  {/* Technicien assigné */}
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      backgroundColor: '#eff6ff', 
                      color: '#1d4ed8', 
                      border: '1px solid #bfdbfe', 
                      padding: '3px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.78rem', 
                      fontWeight: 600 
                    }}>
                      🔧 {tech?.name || 'Non assigné'}
                    </span>
                  </td>

                  {/* Montant */}
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: '#0f172a' }}>
                    {invoice.price.toLocaleString('fr-FR')} F
                  </td>

                  {/* Statut réparation */}
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <select 
                      value={invoice.status} 
                      onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                      className="form-control"
                      style={{ padding: '0.25rem 0.5rem', width: 'auto', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                      disabled={invoice.status === 'Cancelled' && !isManager}
                    >
                      <option value="Pending">En attente</option>
                      <option value="In Progress">En cours</option>
                      <option value="Completed">Terminé</option>
                      {isManager && <option value="Cancelled">Annulé</option>}
                    </select>
                  </td>

                  {/* Règlement / Encaisseur */}
                  <td style={{ padding: '1rem 0.5rem' }}>
                    {isPaid ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}>
                            <CheckCircle2 size={13} /> Payé
                          </span>

                          {/* 2-Minute Grace Period / Locked Indicator */}
                          {!isManager && (
                            getModificationWindow(invoice).canModify ? (
                              <span style={{
                                fontSize: '0.7rem',
                                color: '#b45309',
                                backgroundColor: '#fef3c7',
                                border: '1px solid #fde68a',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600
                              }} title="Délai accordé au technicien pour corriger une erreur">
                                ⏱️ {getModificationWindow(invoice).remainingSec}s
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '0.68rem',
                                color: '#64748b',
                                backgroundColor: '#f1f5f9',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 500
                              }} title="Modification réservée au gérant après 2 minutes">
                                🔒 Verrouillé
                              </span>
                            )
                          )}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '3px', lineHeight: 1.3 }}>
                          <span>Par : <strong>{invoice.balancePaymentCollectorName || invoice.paymentCollectorName || 'Collaborateur'}</strong></span>
                          {(invoice.balancePaymentMethod || invoice.paymentMethod) && <span style={{ color: '#64748b' }}> ({invoice.balancePaymentMethod || invoice.paymentMethod})</span>}
                        </div>

                        {/* Allow cancellation if manager OR if within 2 minutes for technician */}
                        {(isManager || getModificationWindow(invoice).canModify) && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsUnpaid(invoice)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: isManager ? '#94a3b8' : '#d97706',
                              fontSize: '0.7rem',
                              padding: 0,
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              marginTop: '2px',
                              fontWeight: isManager ? 400 : 600
                            }}
                          >
                            {isManager ? 'Annuler paiement' : `Corriger / Annuler (${getModificationWindow(invoice).remainingSec}s)`}
                          </button>
                        )}
                      </div>
                    ) : invoice.paymentStatus === 'Partiel' ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: '1px solid #bfdbfe'
                          }}>
                            💰 Avance : {(invoice.advancePayment || 0).toLocaleString('fr-FR')} F
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openCashModal(invoice)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 6px rgba(22,163,74,0.3)'
                          }}
                        >
                          <CreditCard size={13} />
                          <span>Encaisser solde ({Math.max(0, invoice.price - (invoice.advancePayment || 0)).toLocaleString('fr-FR')} F)</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openCashModal(invoice)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <CreditCard size={14} />
                        <span>Encaisser</span>
                      </button>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Link 
                        to={`/facture/${invoice.id}`} 
                        className="btn btn-secondary" 
                        style={{ 
                          padding: '0.4rem 0.85rem', 
                          fontSize: '0.78rem', 
                          fontWeight: 700, 
                          backgroundColor: '#eff6ff', 
                          color: '#1d4ed8', 
                          borderColor: '#bfdbfe',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        🧾 Petit Reçu ➔
                      </Link>

                      {/* Delete is STRICTLY reserved for manager */}
                      {isManager && (
                        <button
                          type="button"
                          onClick={() => handleDeleteInvoice(invoice)}
                          title="Supprimer la facture (Réservé Gérant)"
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aucune réparation trouvée avec ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL ENCAISSEMENT & TRACABILITE ENCAISSEUR */}
      {cashingInvoice && (
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
                  {cashingInvoice.paymentStatus === 'Partiel' ? "Encaisser le solde au retrait" : "Encaisser le règlement"}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Facture {cashingInvoice.invoiceNumber} • {cashingInvoice.customer.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCashingInvoice(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* If Impayé: Options to pay full or advance */}
            {cashingInvoice.paymentStatus === 'Impayé' && (
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
                  ✅ Tout solder ({cashingInvoice.price.toLocaleString('fr-FR')} F)
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
              backgroundColor: cashingInvoice.paymentStatus === 'Partiel' || cashModalMode === 'advance' ? '#eff6ff' : '#f0fdf4',
              border: `1.5px solid ${cashingInvoice.paymentStatus === 'Partiel' || cashModalMode === 'advance' ? '#bfdbfe' : '#bbf7d0'}`,
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}>
              {cashingInvoice.paymentStatus === 'Partiel' ? (
                <>
                  <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
                    Solde restant à percevoir au retrait
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1d4ed8', marginTop: '2px' }}>
                    {Math.max(0, cashingInvoice.price - (cashingInvoice.advancePayment || 0)).toLocaleString('fr-FR')} <span style={{ fontSize: '1.1rem' }}>FCFA</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
                    (Total: {cashingInvoice.price.toLocaleString('fr-FR')} F • Avance déjà versée: {(cashingInvoice.advancePayment || 0).toLocaleString('fr-FR')} F)
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
                    max={cashingInvoice.price - 1}
                    value={customAdvanceInput}
                    onChange={e => setCustomAdvanceInput(e.target.value)}
                    placeholder="Montant avance"
                    className="form-control"
                    style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', color: '#1d4ed8', border: '2px solid #3b82f6' }}
                  />
                  {customAdvanceInput && (
                    <div style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 700, marginTop: '6px' }}>
                      Reste à payer au retrait : {Math.max(0, cashingInvoice.price - Number(customAdvanceInput)).toLocaleString('fr-FR')} FCFA
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                    Montant total à percevoir
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
                    {cashingInvoice.price.toLocaleString('fr-FR')} <span style={{ fontSize: '1.1rem' }}>FCFA</span>
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
                onClick={() => setCashingInvoice(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 600 }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmittingPayment}
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
                <span>{isSubmittingPayment ? 'Validation...' : 'Confirmer l\'encaissement'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default RepairTracking;

