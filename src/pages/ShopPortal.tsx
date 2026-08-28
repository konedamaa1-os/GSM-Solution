import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Shop, ShopSettings, CommonIssue } from '../types';
import { Wrench, Search, CheckCircle2, Clock, AlertTriangle, Shield, MapPin, Phone, Mail, ArrowRight, Smartphone, Sparkles, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ShopPortalProps {
  shop: Shop;
}

export const ShopPortal: React.FC<ShopPortalProps> = ({ shop }) => {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [issues, setIssues] = useState<CommonIssue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any[] | null>(null);
  const [searched, setSearched] = useState(false);

  const brandColor = shop.brand_color || '#2563eb';

  useEffect(() => {
    const fetchShopInfo = async () => {
      // Fetch settings
      const { data: setRes } = await supabase
        .from('tb_shop_settings')
        .select('*')
        .eq('shop_id', shop.id)
        .maybeSingle();

      if (setRes) setSettings(setRes);

      // Fetch common issues/services
      const { data: issuesRes } = await supabase
        .from('tb_common_issues')
        .select('*')
        .eq('shop_id', shop.id)
        .limit(6);

      if (issuesRes) setIssues(issuesRes);
    };

    fetchShopInfo();
  }, [shop.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setSearched(true);
    setSearchResult(null);

    try {
      // 1. Search by invoice number or phone
      const { data: invoices } = await supabase
        .from('tb_invoices')
        .select(`
          *,
          customer:tb_customers(*),
          device:tb_devices(*)
        `)
        .eq('shop_id', shop.id)
        .or(`invoice_number.ilike.%${query}%`);

      if (invoices && invoices.length > 0) {
        setSearchResult(invoices);
      } else {
        // Try searching customer phone
        const { data: customers } = await supabase
          .from('tb_customers')
          .select('id')
          .eq('shop_id', shop.id)
          .ilike('phone', `%${query}%`);

        if (customers && customers.length > 0) {
          const custIds = customers.map(c => c.id);
          const { data: custInvoices } = await supabase
            .from('tb_invoices')
            .select(`
              *,
              customer:tb_customers(*),
              device:tb_devices(*)
            `)
            .eq('shop_id', shop.id)
            .in('customer_id', custIds)
            .order('date', { ascending: false });

          setSearchResult(custInvoices || []);
        } else {
          setSearchResult([]);
        }
      }
    } catch (err) {
      console.error(err);
      setSearchResult([]);
    } finally {
      setSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} /> Appareil Réparé & Prêt
          </span>
        );
      case 'In Progress':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dbeafe', color: '#1d4ed8', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.875rem' }}>
            <Clock size={16} /> En cours de réparation
          </span>
        );
      case 'Cancelled':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#b91c1c', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.875rem' }}>
            <AlertTriangle size={16} /> Annulé
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#b45309', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.875rem' }}>
            <Clock size={16} /> En attente de prise en charge
          </span>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top Navbar */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: brandColor, color: '#ffffff', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
              <Wrench size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{shop.name}</h1>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={12} color="#10b981" /> Atelier Référencé GSM Solution
              </span>
            </div>
          </div>

          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', backgroundColor: '#f1f5f9', color: '#334155', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s' }}
          >
            <LogIn size={16} />
            <span>Espace Équipe</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ background: `linear-gradient(135deg, ${brandColor} 0%, #0f172a 100%)`, color: '#ffffff', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            <Sparkles size={16} color="#fbbf24" /> Suivi de Réparation en Ligne
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.2 }}>
            Bienvenue chez {shop.name}
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Suivez l'avancement de la réparation de votre smartphone, tablette ou ordinateur en temps réel grâce à votre numéro de fiche ou téléphone.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '8px', background: '#ffffff', padding: '8px', borderRadius: '14px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '12px' }}>
              <Search size={20} color="#94a3b8" />
              <input
                type="text"
                placeholder="N° de Facture (ex: Fac-2026-0001) ou N° Téléphone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', padding: '12px 14px', fontSize: '1rem', color: '#0f172a', background: 'transparent' }}
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              style={{ backgroundColor: brandColor, color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {searching ? 'Recherche...' : 'Vérifier'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1100px', margin: '-2rem auto 4rem auto', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        {/* Search Results Area */}
        {searched && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: '#0f172a' }}>
              Résultat du Suivi ({searchResult?.length || 0})
            </h3>

            {searchResult && searchResult.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {searchResult.map((inv) => {
                  const device = Array.isArray(inv.device) ? inv.device[0] : inv.device;
                  const customer = Array.isArray(inv.customer) ? inv.customer[0] : inv.customer;
                  return (
                    <div key={inv.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: brandColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {inv.invoice_number}
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                            {device?.brand} {device?.model}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>
                            Client : {customer?.name} • Déposé le {new Date(inv.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(inv.status)}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                            {device?.issue && device.issue.includes(' • ') ? 'Pannes signalées' : 'Panne signalée'}
                          </span>
                          {device?.issue && device.issue.includes(' • ') ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                              {device.issue.split(' • ').map((iss: string, i: number) => (
                                <div key={i} style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span style={{ backgroundColor: '#2563eb', color: '#fff', borderRadius: '50%', width: '15px', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 900, flexShrink: 0 }}>
                                    {i + 1}
                                  </span>
                                  <span>{iss.replace(/^\d+[\.\)]\s*/, '')}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ margin: '4px 0 0 0', fontWeight: 700, color: '#1e293b' }}>{device?.issue || 'Non spécifiée'}</p>
                          )}
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Règlement</span>
                          <p style={{ margin: '4px 0 0 0', fontWeight: 800, color: inv.payment_status === 'Payé' ? '#16a34a' : '#ea580c' }}>
                            {inv.payment_status === 'Payé' ? '✅ Payé' : '⏳ Impayé (au retrait)'} ({Number(inv.price).toLocaleString('fr-FR')} FCFA)
                          </p>
                        </div>
                      </div>

                      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/facture/${inv.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: brandColor,
                            color: '#ffffff',
                            padding: '8px 18px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                          }}
                        >
                          🧾 Voir le Petit Reçu ➔
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
                <AlertTriangle size={36} color="#f59e0b" style={{ margin: '0 auto 0.75rem auto' }} />
                <p style={{ margin: 0, fontWeight: 500, fontSize: '1.05rem', color: '#334155' }}>
                  Aucune réparation trouvée pour « {searchQuery} »
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                  Vérifiez le numéro de facture ou le numéro de téléphone laissé lors du dépôt.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Services & Contact Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Workshop Details */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color={brandColor} /> Coordonnées de l'Atelier
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <MapPin size={18} color="#94a3b8" style={{ marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', color: '#0f172a' }}>Adresse</strong>
                  <span>{settings?.address || '123 Rue de la Réparation'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Phone size={18} color="#94a3b8" style={{ marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', color: '#0f172a' }}>Téléphone</strong>
                  <span>{settings?.phone || '00 00 00 00'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Mail size={18} color="#94a3b8" style={{ marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', color: '#0f172a' }}>Email</strong>
                  <span>{settings?.email || 'contact@atelier.com'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services list */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={20} color={brandColor} /> Services Fréquents
            </h3>

            {issues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {issues.map(iss => (
                  <div key={iss.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.925rem' }}>{iss.name}</div>
                      {iss.description && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{iss.description}</div>}
                    </div>
                    {iss.default_price && (
                      <div style={{ fontWeight: 700, color: brandColor, fontSize: '0.925rem' }}>
                        Dès {Number(iss.default_price).toLocaleString('fr-FR')} F
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Réparation de tout type de smartphones (iPhone, Samsung, Xiaomi, etc.), tablettes et ordinateurs portables.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '2rem 1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} {shop.name} • Propulsé par <strong>GSM SOLUTION</strong>
        </p>
      </footer>
    </div>
  );
};
