import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { Shop } from '../types';
import { 
  Plus, Store, ArrowRight, CheckCircle, LogOut, LayoutDashboard, Shield, 
  Globe, Users, FileText, Smartphone, DollarSign, Activity, Eye, 
  Search, RefreshCw, Key, Copy, Check, Lock, Edit3, AlertCircle, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkshopInspectionData {
  shop: Shop;
  invoices: any[];
  customers: any[];
  employees: any[];
  deviceModels: any[];
  commonIssues: any[];
  totalRevenue: number;
}

interface CreatedCredentials {
  shopName: string;
  slug: string;
  customDomain?: string;
  managerName: string;
  managerEmail: string;
  managerPassword: string;
  loginUrl: string;
  portalUrl: string;
}

export const SuperAdmin = () => {
  const { allShops, createShopWithManager, switchShop, currentShop, logout, user, deleteShop } = useAppContext();
  const navigate = useNavigate();
  
  // Navigation tabs in Super Admin
  const [activeTab, setActiveTab] = useState<'overview' | 'workshops' | 'create' | 'inspector' | 'feed'>('workshops');

  // Create Workshop Form state
  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Delete Workshop Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingShop, setDeletingShop] = useState(false);

  // Last Created Credentials Card
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Global & Inspection state
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [inspectionData, setInspectionData] = useState<WorkshopInspectionData | null>(null);
  const [loadingInspect, setLoadingInspect] = useState(false);
  const [inspectorSubTab, setInspectorSubTab] = useState<'invoices' | 'customers' | 'employees' | 'catalog'>('invoices');

  // Global Stats & Live Activity Feed
  const [shops, setShops] = useState<Shop[]>(allShops || []);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [allManagers, setAllManagers] = useState<{ [shopId: string]: { name: string; email: string } }>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Password reset modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [targetManagerEmail, setTargetManagerEmail] = useState('');
  const [targetShopName, setTargetShopName] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  const displayShops = shops.length > 0 ? shops : allShops;

  // Fetch all global data for Super Admin
  const fetchGlobalData = async () => {
    try {
      // 0. Fetch all shops directly
      const { data: sList } = await supabase
        .from('tb_shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (sList && sList.length > 0) {
        setShops(sList);
      }

      // 1. Fetch all invoices with customer & device info
      const { data: invData } = await supabase
        .from('tb_invoices')
        .select(`
          *,
          customer:tb_customers(*),
          device:tb_devices(*),
          shop:tb_shops(id, name, slug)
        `)
        .order('date', { ascending: false });

      if (invData) setAllInvoices(invData);

      // 2. Fetch all customers
      const { data: custList } = await supabase
        .from('tb_customers')
        .select(`*, shop:tb_shops(name)`)
        .order('created_at', { ascending: false });

      if (custList) setAllCustomers(custList);

      // 3. Fetch all managers from employees
      const { data: empList } = await supabase
        .from('tb_employees')
        .select('*')
        .eq('role', 'Manager');

      if (empList) {
        const map: { [shopId: string]: { name: string; email: string } } = {};
        empList.forEach(e => {
          map[e.shop_id] = { name: e.name, email: e.email || '' };
        });
        setAllManagers(map);
      }
    } catch (err) {
      console.error('Error fetching global admin data:', err);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  // Inspect a specific shop
  const handleInspectShop = async (shopId: string) => {
    setSelectedShopId(shopId);
    setActiveTab('inspector');
    setLoadingInspect(true);

    try {
      const targetShop = displayShops.find(s => s.id === shopId) || null;
      if (!targetShop) return;

      const [invRes, custRes, empRes, modRes, issRes] = await Promise.all([
        supabase.from('tb_invoices').select(`*, customer:tb_customers(*), device:tb_devices(*)`).eq('shop_id', shopId).order('date', { ascending: false }),
        supabase.from('tb_customers').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }),
        supabase.from('tb_employees').select('*').eq('shop_id', shopId),
        supabase.from('tb_device_models').select('*').eq('shop_id', shopId),
        supabase.from('tb_common_issues').select('*').eq('shop_id', shopId)
      ]);

      const shopInvoices = invRes.data || [];
      const totalRev = shopInvoices.reduce((acc, inv) => acc + (Number(inv.price) || 0), 0);

      setInspectionData({
        shop: targetShop,
        invoices: shopInvoices,
        customers: custRes.data || [],
        employees: empRes.data || [],
        deviceModels: modRes.data || [],
        commonIssues: issRes.data || [],
        totalRevenue: totalRev
      });
    } catch (err) {
      console.error('Error inspecting shop:', err);
    } finally {
      setLoadingInspect(false);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCreate(true);
    setMessage('');
    setError('');

    if (!shopName.trim() || !managerName.trim() || !managerEmail.trim() || !managerPassword.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setLoadingCreate(false);
      return;
    }

    try {
      const finalSlug = slug.trim() || shopName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      const result = await createShopWithManager(
        shopName.trim(),
        managerName.trim(),
        managerEmail.trim(),
        managerPassword.trim(),
        finalSlug,
        customDomain.trim() || undefined
      );

      if (result.success) {
        const portalUrl = `${window.location.origin}/?shop=${finalSlug}`;
        const loginUrl = `${window.location.origin}/login`;

        setLastCreatedCredentials({
          shopName: shopName.trim(),
          slug: finalSlug,
          customDomain: customDomain.trim() || undefined,
          managerName: managerName.trim(),
          managerEmail: managerEmail.trim(),
          managerPassword: managerPassword.trim(),
          portalUrl,
          loginUrl
        });

        setMessage(`L'atelier « ${shopName.trim()} » a été créé avec succès ! Les identifiants sont affichés ci-dessous.`);
        setShopName('');
        setSlug('');
        setCustomDomain('');
        setManagerName('');
        setManagerEmail('');
        setManagerPassword('');
        fetchGlobalData();
      } else {
        setError(result.error || 'Une erreur est survenue lors de la création de la boutique.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleAccessShop = async (shopId: string) => {
    await switchShop(shopId);
    navigate('/');
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const openPasswordResetModal = (shopNameVal: string, emailVal: string) => {
    setTargetShopName(shopNameVal);
    setTargetManagerEmail(emailVal);
    setNewPasswordInput('');
    setPasswordSuccessMsg('');
    setPasswordModalOpen(true);
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setResettingPassword(true);
    const { data: res, error: rpcErr } = await supabase.rpc('reset_manager_password', {
      p_email: targetManagerEmail,
      p_new_password: newPasswordInput
    });

    setResettingPassword(false);
    if (!rpcErr && res?.success) {
      setPasswordSuccessMsg(`Mot de passe mis à jour avec succès pour ${targetManagerEmail} !`);
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordSuccessMsg('');
      }, 2500);
    } else {
      alert(`Erreur : ${res?.error || rpcErr?.message || 'Impossible de modifier le mot de passe.'}`);
    }
  };

  const handleOpenDeleteModal = (shopObj: { id: string; name: string }) => {
    setShopToDelete(shopObj);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteShop = async () => {
    if (!shopToDelete) return;
    setDeletingShop(true);

    try {
      const res = await deleteShop(shopToDelete.id);
      if (res.success) {
        setMessage(`L'atelier « ${shopToDelete.name} » et toutes ses données ont été supprimés avec succès.`);
        setDeleteModalOpen(false);
        setShopToDelete(null);
        if (selectedShopId === shopToDelete.id) {
          setSelectedShopId('');
          setInspectionData(null);
        }
        await fetchGlobalData();
      } else {
        alert(`Erreur : ${res.error || 'Impossible de supprimer l\'atelier.'}`);
      }
    } catch (err: any) {
      alert(`Erreur : ${err.message || 'Erreur inattendue.'}`);
    } finally {
      setDeletingShop(false);
    }
  };

  // Stats calculation
  const totalRevenueAll = allInvoices.reduce((acc, inv) => acc + (Number(inv.price) || 0), 0);
  const totalCompletedRepairs = allInvoices.filter(inv => inv.status === 'Completed').length;
  const totalPendingRepairs = allInvoices.filter(inv => inv.status === 'Pending' || inv.status === 'In Progress').length;

  const filteredShops = displayShops.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.slug && s.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.custom_domain && s.custom_domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (allManagers[s.id]?.email && allManagers[s.id].email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', color: '#1e293b' }}>
      
      {/* Super Admin Top Header */}
      <header style={{ 
        backgroundColor: '#0f172a', 
        color: '#f8fafc', 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '4px solid #2563eb',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
            <Shield size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, letterSpacing: '0.05em' }}>GSM SOLUTION</h1>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Super Administrateur • Contrôle Multi-Ateliers</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Super Admin</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.email}</div>
          </div>
          
          <button 
            onClick={() => logout().then(() => navigate('/login'))}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              backgroundColor: '#e11d48', 
              color: 'white', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px', 
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Admin Container */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1350px', width: '100%', margin: '0 auto' }}>
        
        {/* Navigation Tabs Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('workshops')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'workshops' ? '#2563eb' : '#ffffff',
                color: activeTab === 'workshops' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <Store size={18} /> Ateliers & Identifiants ({displayShops.length})
            </button>

            <button
              onClick={() => setActiveTab('create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'create' ? '#2563eb' : '#ffffff',
                color: activeTab === 'create' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <Plus size={18} /> Créer un Atelier
            </button>

            <button
              onClick={() => {
                if (displayShops.length > 0 && !selectedShopId) {
                  handleInspectShop(displayShops[0].id);
                } else {
                  setActiveTab('inspector');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'inspector' ? '#2563eb' : '#ffffff',
                color: activeTab === 'inspector' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <Eye size={18} /> Inspecteur (Ce qu'ils ajoutent)
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'overview' ? '#2563eb' : '#ffffff',
                color: activeTab === 'overview' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <LayoutDashboard size={18} /> Vue Globale KPIs
            </button>

            <button
              onClick={() => setActiveTab('feed')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'feed' ? '#2563eb' : '#ffffff',
                color: activeTab === 'feed' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <Activity size={18} /> Flux d'Activité en Direct
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={fetchGlobalData}
              title="Rafraîchir les données"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.5rem 0.875rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}
            >
              <RefreshCw size={14} /> Rafraîchir
            </button>

            {currentShop && (
              <button 
                onClick={() => navigate('/')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <LayoutDashboard size={16} />
                Accéder à l'Atelier Actif ({currentShop.name})
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bbf7d0' }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: 500 }}>{message}</span>
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fca5a5', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* RECAP CARD: LAST CREATED CREDENTIALS */}
        {lastCreatedCredentials && (
          <div style={{ backgroundColor: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={22} color="#2563eb" /> Fiche des Identifiants Créés ({lastCreatedCredentials.shopName})
              </h3>
              <button 
                onClick={() => setLastCreatedCredentials(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                &times;
              </button>
            </div>

            <p style={{ margin: '0 0 1.25rem 0', color: '#334155', fontSize: '0.9rem' }}>
              Transmettez ces identifiants au responsable de l'atelier pour qu'il puisse administrer sa boutique :
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Email de Connexion (Login)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{lastCreatedCredentials.managerEmail}</strong>
                  <button 
                    type="button" 
                    onClick={() => copyToClipboard(lastCreatedCredentials.managerEmail, 'new_email')}
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedField === 'new_email' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    {copiedField === 'new_email' ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Mot de Passe Provisoire</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <strong style={{ fontSize: '1rem', color: '#0f172a', letterSpacing: '1px' }}>{lastCreatedCredentials.managerPassword}</strong>
                  <button 
                    type="button" 
                    onClick={() => copyToClipboard(lastCreatedCredentials.managerPassword, 'new_pwd')}
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedField === 'new_pwd' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    {copiedField === 'new_pwd' ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Lien Espace Connexion</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#2563eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {lastCreatedCredentials.loginUrl}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => copyToClipboard(lastCreatedCredentials.loginUrl, 'new_url')}
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedField === 'new_url' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    {copiedField === 'new_url' ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const fullText = `Identifiants GSM Solution pour ${lastCreatedCredentials.shopName} :\n- Lien : ${lastCreatedCredentials.loginUrl}\n- Email : ${lastCreatedCredentials.managerEmail}\n- Mot de passe : ${lastCreatedCredentials.managerPassword}\n- Portail Public : ${lastCreatedCredentials.portalUrl}`;
                copyToClipboard(fullText, 'all_creds');
              }}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {copiedField === 'all_creds' ? <Check size={16} /> : <Copy size={16} />}
              {copiedField === 'all_creds' ? 'Tous les identifiants ont été copiés !' : 'Copier le récapitulatif complet'}
            </button>
          </div>
        )}

        {/* TAB 1: WORKSHOPS LIST & CREDENTIALS */}
        {activeTab === 'workshops' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Ateliers Enregistrés & Identifiants ({filteredShops.length})
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Consultez les logins des managers et réinitialisez leurs mots de passe en un clic.
                </p>
              </div>

              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email manager ou slug..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
              {filteredShops.map(shop => {
                const shopInvoices = allInvoices.filter(i => i.shop_id === shop.id);
                const shopCust = allCustomers.filter(c => c.shop_id === shop.id);
                const shopRevenue = shopInvoices.reduce((acc, i) => acc + (Number(i.price) || 0), 0);
                const manager = allManagers[shop.id];
                const portalUrl = `${window.location.origin}/?shop=${shop.slug || shop.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

                return (
                  <div key={shop.id} style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                          {shop.name}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Slug: <code>{shop.slug || 'non défini'}</code> {shop.custom_domain && `• 🌐 ${shop.custom_domain}`}
                        </div>
                      </div>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: shop.brand_color || '#2563eb' }} title="Couleur de marque" />
                    </div>

                    {/* MANAGER LOGIN CREDENTIALS BOX */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Key size={14} color="#2563eb" /> Identifiant Manager (Login)
                        </span>
                        {manager?.email && (
                          <button
                            onClick={() => openPasswordResetModal(shop.name, manager.email)}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                            title="Modifier le mot de passe"
                          >
                            <Lock size={12} /> Modifier MDP
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>
                            {manager?.email || 'Non assigné'}
                          </div>
                          {manager?.name && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Nom : {manager.name}</div>
                          )}
                        </div>
                        {manager?.email && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(manager.email, `copy_${shop.id}`)}
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            {copiedField === `copy_${shop.id}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                            {copiedField === `copy_${shop.id}` ? 'Copié' : 'Copier'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center', marginBottom: '1.25rem', padding: '8px', background: '#f8fafc', borderRadius: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Factures</span>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{shopInvoices.length}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Clients</span>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{shopCust.length}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>CA Généré</span>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#16a34a' }}>{shopRevenue.toLocaleString('fr-FR')} F</div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleInspectShop(shop.id)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '8px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer' }}
                      >
                        <Eye size={15} /> Voir les données
                      </button>

                      <button
                        onClick={() => handleAccessShop(shop.id)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer' }}
                      >
                        Gérer <ArrowRight size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal({ id: shop.id, name: shop.name })}
                        title="Supprimer définitivement cet atelier"
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                      <a href={portalUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Globe size={12} /> Visiter le portail client
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CREATE WORKSHOP */}
        {activeTab === 'create' && (
          <div style={{ maxWidth: '750px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={24} color="#2563eb" /> Créer un Nouvel Atelier & son Compte Manager
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Renseignez les détails ci-dessous. Dès la création, la fiche complète des identifiants s'affichera pour vous permettre de la transmettre au manager.
            </p>

            <form onSubmit={handleCreateShop}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Nom de l'atelier / Enseigne</label>
                <input
                  type="text"
                  className="form-control"
                  value={shopName}
                  onChange={e => {
                    setShopName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="Ex: GSM Réparation Abidjan Marcory"
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Sous-domaine / Identifiant URL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="Ex: gsm-marcory"
                    required
                  />
                  <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Ex: gsm-marcory.votredomaine.com</small>
                </div>

                <div>
                  <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Domaine propre (Optionnel)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value.toLowerCase().trim())}
                    placeholder="Ex: repair-marcory.com"
                  />
                  <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Si le client a son propre nom de domaine</small>
                </div>
              </div>

              {/* Manager credentials section */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={18} color="#2563eb" /> Identifiants de Connexion du Manager
                </h4>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ color: '#334155', display: 'block', marginBottom: '4px' }}>Nom complet du manager</label>
                  <input
                    type="text"
                    className="form-control"
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    placeholder="Ex: Jean Kouassi"
                    required
                  />
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ color: '#334155', display: 'block', marginBottom: '4px' }}>Email de connexion (Login)</label>
                    <input
                      type="email"
                      className="form-control"
                      value={managerEmail}
                      onChange={e => setManagerEmail(e.target.value)}
                      placeholder="Ex: jean.kouassi@atelier.com"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ color: '#334155', display: 'block', marginBottom: '4px' }}>Mot de passe temporaire</label>
                    <input
                      type="password"
                      className="form-control"
                      value={managerPassword}
                      onChange={e => setManagerPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingCreate}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.875rem', justifyContent: 'center', fontSize: '1rem', fontWeight: 600 }}
              >
                {loadingCreate ? 'Création en cours...' : 'Créer et Déployer l\'Atelier'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: WORKSHOP DATA INSPECTOR (Ce qu'ils ajoutent) */}
        {activeTab === 'inspector' && (
          <div>
            {/* Shop Selector Header */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Inspecteur de Données</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '2px 0 0 0', color: '#0f172a' }}>
                  {inspectionData ? inspectionData.shop.name : 'Sélectionnez un atelier'}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <select
                  value={selectedShopId}
                  onChange={e => handleInspectShop(e.target.value)}
                  style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', outline: 'none' }}
                >
                  <option value="">-- Choisir un atelier à inspecter --</option>
                  {displayShops.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.slug || s.id.substring(0, 6)})</option>
                  ))}
                </select>

                {selectedShopId && (
                  <>
                    <button
                      onClick={() => handleAccessShop(selectedShopId)}
                      style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '0.625rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Ouvrir l'Espace <ArrowRight size={14} />
                    </button>

                    {inspectionData && (
                      <button
                        onClick={() => handleOpenDeleteModal({ id: inspectionData.shop.id, name: inspectionData.shop.name })}
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.625rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        title="Supprimer cet atelier"
                      >
                        <Trash2 size={14} /> Supprimer l'Atelier
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {loadingInspect ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
                Chargement des données de l'atelier en temps réel...
              </div>
            ) : inspectionData ? (
              <div>
                {/* Manager Quick Info Box */}
                {allManagers[inspectionData.shop.id] && (
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '8px' }}>
                        <Key size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>LOGIN DU MANAGER</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{allManagers[inspectionData.shop.id].email}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => openPasswordResetModal(inspectionData.shop.name, allManagers[inspectionData.shop.id].email)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Lock size={14} /> Modifier / Réinitialiser le mot de passe
                    </button>
                  </div>
                )}

                {/* Workshop Metrics Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Factures émises</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{inspectionData.invoices.length}</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Clients enregistrés</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{inspectionData.customers.length}</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Membres d'équipe</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{inspectionData.employees.length}</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Chiffre d'Affaires</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
                      {inspectionData.totalRevenue.toLocaleString('fr-FR')} F
                    </div>
                  </div>
                </div>

                {/* Sub-tabs to inspect specific data */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                  <button
                    onClick={() => setInspectorSubTab('invoices')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: inspectorSubTab === 'invoices' ? '#2563eb' : '#f1f5f9', color: inspectorSubTab === 'invoices' ? '#fff' : '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Factures & Réparations ({inspectionData.invoices.length})
                  </button>
                  <button
                    onClick={() => setInspectorSubTab('customers')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: inspectorSubTab === 'customers' ? '#2563eb' : '#f1f5f9', color: inspectorSubTab === 'customers' ? '#fff' : '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Clients ({inspectionData.customers.length})
                  </button>
                  <button
                    onClick={() => setInspectorSubTab('employees')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: inspectorSubTab === 'employees' ? '#2563eb' : '#f1f5f9', color: inspectorSubTab === 'employees' ? '#fff' : '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Équipe & Techniciens ({inspectionData.employees.length})
                  </button>
                  <button
                    onClick={() => setInspectorSubTab('catalog')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: inspectorSubTab === 'catalog' ? '#2563eb' : '#f1f5f9', color: inspectorSubTab === 'catalog' ? '#fff' : '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Catalogue de l'atelier ({inspectionData.deviceModels.length + inspectionData.commonIssues.length})
                  </button>
                </div>

                {/* Sub-tab 1: Invoices */}
                {inspectorSubTab === 'invoices' && (
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                        <tr>
                          <th style={{ padding: '12px 16px' }}>N° Facture</th>
                          <th style={{ padding: '12px 16px' }}>Date</th>
                          <th style={{ padding: '12px 16px' }}>Client</th>
                          <th style={{ padding: '12px 16px' }}>Appareil & Panne</th>
                          <th style={{ padding: '12px 16px' }}>Tarif</th>
                          <th style={{ padding: '12px 16px' }}>Statut Réparation</th>
                          <th style={{ padding: '12px 16px' }}>Paiement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inspectionData.invoices.map(inv => {
                          const dev = Array.isArray(inv.device) ? inv.device[0] : inv.device;
                          const cust = Array.isArray(inv.customer) ? inv.customer[0] : inv.customer;
                          return (
                            <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>{inv.invoice_number}</td>
                              <td style={{ padding: '12px 16px', color: '#64748b' }}>{new Date(inv.date).toLocaleDateString('fr-FR')}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 600 }}>{cust?.name || 'Inconnu'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cust?.phone}</div>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 600 }}>{dev?.brand} {dev?.model}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{dev?.issue}</div>
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                                {Number(inv.price).toLocaleString('fr-FR')} F
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  backgroundColor: inv.status === 'Completed' ? '#dcfce7' : inv.status === 'In Progress' ? '#dbeafe' : '#fef3c7',
                                  color: inv.status === 'Completed' ? '#15803d' : inv.status === 'In Progress' ? '#1d4ed8' : '#b45309'
                                }}>
                                  {inv.status}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  backgroundColor: inv.payment_status === 'Payé' ? '#dcfce7' : '#fee2e2',
                                  color: inv.payment_status === 'Payé' ? '#15803d' : '#b91c1c'
                                }}>
                                  {inv.payment_status || 'Impayé'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {inspectionData.invoices.length === 0 && (
                          <tr>
                            <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                              Cet atelier n'a encore enregistré aucune facture.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sub-tab 2: Customers */}
                {inspectorSubTab === 'customers' && (
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                        <tr>
                          <th style={{ padding: '12px 16px' }}>Nom du client</th>
                          <th style={{ padding: '12px 16px' }}>Téléphone</th>
                          <th style={{ padding: '12px 16px' }}>Email</th>
                          <th style={{ padding: '12px 16px' }}>Adresse</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inspectionData.customers.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{c.name}</td>
                            <td style={{ padding: '12px 16px', color: '#2563eb' }}>{c.phone}</td>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>{c.email || '-'}</td>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>{c.address || '-'}</td>
                          </tr>
                        ))}
                        {inspectionData.customers.length === 0 && (
                          <tr>
                            <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                              Aucun client enregistré pour le moment.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sub-tab 3: Employees */}
                {inspectorSubTab === 'employees' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {inspectionData.employees.map(e => (
                      <div key={e.id} style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {e.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{e.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.role}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Email : <strong>{e.email || 'Non renseigné'}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-tab 4: Catalog */}
                {inspectorSubTab === 'catalog' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Device Models */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                        Modèles d'appareils ({inspectionData.deviceModels.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {inspectionData.deviceModels.map(m => (
                          <div key={m.id} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span><strong>{m.brand}</strong> {m.model}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Common Issues */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                        Pannes Courantes & Tarifs ({inspectionData.commonIssues.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {inspectionData.commonIssues.map(i => (
                          <div key={i.id} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{i.name}</span>
                            <span style={{ fontWeight: 700, color: '#2563eb' }}>{Number(i.default_price || 0).toLocaleString('fr-FR')} F</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                Sélectionnez un atelier ci-dessus pour inspecter en direct toutes ses factures, ses clients et ses réparations.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GLOBAL KPIS */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Ateliers Actifs</span>
                  <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.5rem', borderRadius: '8px' }}>
                    <Store size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{displayShops.length}</div>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Multi-projets activé</span>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Réparations</span>
                  <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.5rem', borderRadius: '8px' }}>
                    <Smartphone size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{allInvoices.length}</div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {totalCompletedRepairs} terminées • {totalPendingRepairs} en cours
                </span>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Volume d'Affaires Global</span>
                  <div style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '0.5rem', borderRadius: '8px' }}>
                    <DollarSign size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                  {totalRevenueAll.toLocaleString('fr-FR')} <span style={{ fontSize: '1rem', fontWeight: 500 }}>FCFA</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Toutes boutiques confondues</span>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Clients Enregistrés</span>
                  <div style={{ backgroundColor: '#f3e8ff', color: '#9333ea', padding: '0.5rem', borderRadius: '8px' }}>
                    <Users size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{allCustomers.length}</div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fichier clients centralisé</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE GLOBAL ACTIVITY FEED */}
        {activeTab === 'feed' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={22} color="#2563eb" /> Flux d'Activité en Direct sur Tous les Ateliers ({allInvoices.length})
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} /> Synchronisé en temps réel
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {allInvoices.map(inv => {
                const dev = Array.isArray(inv.device) ? inv.device[0] : inv.device;
                const cust = Array.isArray(inv.customer) ? inv.customer[0] : inv.customer;
                const sh = Array.isArray(inv.shop) ? inv.shop[0] : inv.shop;

                return (
                  <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ backgroundColor: '#e0e7ff', color: '#2563eb', padding: '0.75rem', borderRadius: '10px' }}>
                        <FileText size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{inv.invoice_number}</span>
                          <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                            Atelier : {sh?.name || 'Boutique'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#334155', marginTop: '2px' }}>
                          Appareil : <strong>{dev?.brand} {dev?.model}</strong> (Panne : {dev?.issue}) • Client : {cust?.name} ({cust?.phone})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                          Enregistré le {new Date(inv.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                        {Number(inv.price).toLocaleString('fr-FR')} FCFA
                      </div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: inv.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                          color: inv.status === 'Completed' ? '#15803d' : '#b45309'
                        }}>
                          {inv.status}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: inv.payment_status === 'Payé' ? '#dcfce7' : '#fee2e2',
                          color: inv.payment_status === 'Payé' ? '#15803d' : '#b91c1c'
                        }}>
                          {inv.payment_status || 'Impayé'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {allInvoices.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                  Aucune activité enregistrée sur la plateforme pour l'instant.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* PASSWORD RESET MODAL */}
      {passwordModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} color="#2563eb" /> Modifier le Mot de Passe
              </h3>
              <button onClick={() => setPasswordModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#475569' }}>
              Atelier : <strong>{targetShopName}</strong><br />
              Compte Manager : <strong>{targetManagerEmail}</strong>
            </p>

            {passwordSuccessMsg ? (
              <div style={{ padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={18} /> {passwordSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSaveNewPassword}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                    Nouveau Mot de Passe
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Saisissez le nouveau mot de passe..."
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                  />
                  <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Le manager pourra se connecter immédiatement avec ce nouveau mot de passe.
                  </small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={resettingPassword}
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', fontWeight: 600 }}
                  >
                    {resettingPassword ? 'Enregistrement...' : 'Valider le mot de passe'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DELETE WORKSHOP CONFIRMATION MODAL */}
      {deleteModalOpen && shopToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #fee2e2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '50%' }}>
                <Trash2 size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#991b1b' }}>
                  Supprimer l'Atelier Définitivement ?
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Action irréversible</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', padding: '1rem', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#991b1b', fontWeight: 600 }}>
                Êtes-vous sûr de vouloir supprimer l'atelier « {shopToDelete.name} » ?
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#b91c1c' }}>
                ⚠️ Cette action supprimera définitivement :<br />
                • Toutes les factures et fiches de réparation associées.<br />
                • Tous les clients et appareils enregistrés.<br />
                • Les comptes employés et techniciens de cette boutique.<br />
                • Le sous-domaine et les tarifs configurés.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setShopToDelete(null);
                }}
                disabled={deletingShop}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontWeight: 600 }}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteShop}
                disabled={deletingShop}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {deletingShop ? 'Suppression en cours...' : 'Oui, Supprimer Définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdmin;
