import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Wrench, FileText, LayoutDashboard, Settings, Users, LogOut, CreditCard, Menu, X, Globe } from 'lucide-react';

// Components
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import RepairTracking from './pages/RepairTracking';
import InvoiceView from './pages/InvoiceView';
import Customers from './pages/Customers';
import SettingsPage from './pages/Settings';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Subscription from './pages/Subscription';
import SuperAdmin from './pages/SuperAdmin';
import LandingPage from './pages/LandingPage';
import { ShopPortal } from './pages/ShopPortal';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAppContext();
  
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isManager } = useAppContext();
  if (!isManager) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSuperAdmin } = useAppContext();
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

interface GuideModalProps {
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  const [activeStep, setActiveStep] = React.useState(0);

  const steps = [
    {
      title: "1. Présentation Générale",
      content: (
        <div>
          <p className="guide-text">Bienvenue dans <strong>GSM SOLUTION</strong>, votre espace SaaS de gestion et suivi des réparations pour boutiques d'appareils électroniques.</p>
          <p className="guide-text">L'application s'articule autour de flux métiers simples pour vous et vos collaborateurs :</p>
          <ul className="guide-list">
            <li>📝 <strong>Factures & Devis</strong> : Créez des fiches d'atelier complètes en quelques secondes.</li>
            <li>🔧 <strong>Suivi des Réparations</strong> : Suivez l'état d'avancement des réparations en temps réel.</li>
            <li>👥 <strong>Clients & Techniciens</strong> : Gérez votre fichier client et assignez des techniciens.</li>
            <li>📦 <strong>Catalogue de Services</strong> : Définissez vos modèles d'appareils et vos pannes courantes.</li>
          </ul>
        </div>
      )
    },
    {
      title: "2. Créer une Réparation",
      content: (
        <div>
          <p className="guide-text">Pour ajouter un appareil en réparation et émettre une fiche/facture :</p>
          <ol className="guide-list">
            <li>Allez dans l'onglet <strong>Nouvelle Facture</strong>.</li>
            <li>Saisissez les informations du client (Nom, Téléphone). Si le client existe déjà, ses coordonnées se pré-remplissent automatiquement.</li>
            <li>Sélectionnez le technicien responsable de la réparation.</li>
            <li>Remplissez les détails de l'appareil : Marque, Modèle, N° de série, Panne (ex: Écran cassé), Accessoires laissés et le Mot de passe de l'appareil.</li>
            <li>Fixez le tarif de la réparation, la durée de garantie (3 mois par défaut), le statut de la réparation et du paiement, puis cliquez sur <strong>Créer la facture</strong>.</li>
          </ol>
        </div>
      )
    },
    {
      title: "3. Suivi & Fiche d'Atelier",
      content: (
        <div>
          <p className="guide-text">Pour piloter l'atelier et imprimer les fiches :</p>
          <ol className="guide-list">
            <li>Allez dans l'onglet <strong>Suivi Réparations</strong>.</li>
            <li>Vous y verrez la liste des réparations. Vous pouvez modifier directement le <strong>Statut</strong> (En attente, En cours, Terminé, Annulé) ou le statut de <strong>Paiement</strong> (Payé, Impayé) depuis la ligne.</li>
            <li>Cliquez sur l'icône de l'imprimante 🖨️ pour ouvrir la vue d'impression de la fiche d'atelier, prête à être imprimée ou remise au client.</li>
          </ol>
        </div>
      )
    },
    {
      title: "4. Catalogue de Pannes",
      content: (
        <div>
          <p className="guide-text">Pour accélérer la saisie des fiches d'atelier :</p>
          <ol className="guide-list">
            <li>Allez dans l'onglet <strong>Catalogue</strong>.</li>
            <li><strong>Modèles d'appareils</strong> : Ajoutez les marques et modèles que vous réparez souvent (ex: Apple iPhone 11, Samsung S20).</li>
            <li><strong>Pannes courantes</strong> : Enregistrez les pannes fréquentes avec un tarif indicatif (ex: Changement batterie - 15 000 F CFA).</li>
            <li>Lors de la création d'une facture, ces modèles et pannes courantes s'auto-rempliront d'un seul clic !</li>
          </ol>
        </div>
      )
    },
    {
      title: "5. Administration & Paramètres",
      content: (
        <div>
          <p className="guide-text">En tant que Manager / Propriétaire de la boutique :</p>
          <ol className="guide-list">
            <li><strong>Paramètres</strong> : Configurez le nom de votre enseigne, l'adresse, le téléphone, l'e-mail, ainsi que les Conditions Générales de Réparation. Ces données apparaîtront sur vos fiches imprimées.</li>
            <li><strong>Abonnement</strong> : Suivez l'état de votre abonnement SaaS (Standard ou Professionnel).</li>
          </ol>
        </div>
      )
    }
  ];

  return (
    <div className="guide-overlay">
      <div className="guide-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #E2E8F0", paddingBottom: 12 }}>
          <h2 style={{ color: "#0F172A", fontSize: 20, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🚀</span> Guide de démarrage interactif
          </h2>
          <button style={{ background: "transparent", border: "none", color: "#94A3B8", fontSize: 24, cursor: "pointer" }} onClick={onClose}>&times;</button>
        </div>

        <div className="guide-steps-container">
          {/* Side Menu */}
          <div className="guide-menu">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`guide-menu-btn ${activeStep === idx ? 'active' : ''}`}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Dynamic Content */}
          <div className="guide-content">
            <h3 style={{ color: "#0F172A", fontSize: 16, marginBottom: 14 }}>{steps[activeStep].title}</h3>
            <div>{steps[activeStep].content}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 14, borderTop: "1px solid #E2E8F0" }}>
          <button
            disabled={activeStep === 0}
            onClick={() => setActiveStep(prev => prev - 1)}
            className="btn btn-secondary"
            style={{ padding: "8px 16px", cursor: activeStep === 0 ? "not-allowed" : "pointer", opacity: activeStep === 0 ? 0.4 : 1 }}
          >
            Précédent
          </button>
          {activeStep < steps.length - 1 ? (
            <button
              className="btn btn-primary"
              style={{ padding: "8px 20px" }}
              onClick={() => setActiveStep(prev => prev + 1)}
            >
              Suivant
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ background: "#10B981", color: "#FFF", padding: "8px 20px" }}
              onClick={onClose}
            >
              Prêt à démarrer ! ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isManager, logout, activeEmployee, user, isSuperAdmin, allShops, switchShop, currentShop } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
          <Wrench size={24} />
          <span>GSM SOLUTION</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Menu size={24} color="var(--text-primary)" />
        </button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay no-print" 
          onClick={closeMobileMenu}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 45 }}
        />
      )}

      <nav className={`sidebar no-print ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={24} />
            <span>{currentShop?.name || 'GSM SOLUTION'}</span>
          </div>
          <button className="mobile-close-btn" onClick={closeMobileMenu} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Super Admin Shop Switcher */}
        {isSuperAdmin && allShops.length > 0 && (
          <div style={{ padding: '0 1rem 1rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              🔧 Boutique Active (Super Admin)
            </label>
            <select 
              value={currentShop?.id || ''} 
              onChange={(e) => switchShop(e.target.value)}
              className="form-control"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem' }}
            >
              {allShops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Start Guide Button */}
        <button className="btn-brown-guide" onClick={() => { closeMobileMenu(); setShowGuide(true); }}>
          <span>🚀</span> Guide de démarrage
        </button>

        <div className="nav-links">
          <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            Tableau de bord
          </NavLink>
          <NavLink to="/nouvelle-facture" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            Nouvelle Facture
          </NavLink>
          <NavLink to="/reparations" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Wrench size={20} />
            Suivi Réparations
          </NavLink>
          <NavLink to="/clients" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Clients
          </NavLink>
          <NavLink to="/catalogue" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            Catalogue
          </NavLink>
          {isManager && (
            <>
              <NavLink to="/abonnement" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CreditCard size={20} />
                Abonnement
              </NavLink>
              <NavLink to="/parametres" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Settings size={20} />
                Paramètres & Domaine
              </NavLink>
            </>
          )}
          {isSuperAdmin && (
            <NavLink to="/super-admin" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              Super Admin
            </NavLink>
          )}

          {/* Link to public shop portal */}
          {currentShop && (
            <a 
              href={`/?shop=${currentShop.slug || currentShop.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} 
              target="_blank" 
              rel="noreferrer" 
              className="nav-item"
              style={{ color: 'var(--primary-color)', fontSize: '0.875rem' }}
            >
              <Globe size={18} />
              Voir Portail Client
            </a>
          )}

          <div style={{ flex: 1 }}></div>
          <div style={{ padding: '0 1rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Connecté : <strong>{activeEmployee?.name || user?.email}</strong>
          </div>
          <button 
            onClick={() => { closeMobileMenu(); logout(); }} 
            className="nav-item" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', color: '#ef4444' }}
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
};

const HomeOrDashboard = () => {
  const { user, loading, domainShop } = useAppContext();
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white' }}>Chargement...</div>;
  }
  
  if (user) {
    return (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    );
  }

  // If accessed via workshop domain / subdomain / ?shop=... and not logged in, show workshop portal
  if (domainShop) {
    return <ShopPortal shop={domainShop} />;
  }
  
  return <LandingPage />;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/inscription" element={<SignUp />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
            <Route path="/super-admin" element={
              <ProtectedRoute>
                <SuperAdminRoute>
                  <SuperAdmin />
                </SuperAdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/" element={<HomeOrDashboard />} />
            <Route path="*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/nouvelle-facture" element={<CreateInvoice />} />
                    <Route path="/reparations" element={<RepairTracking />} />
                    <Route path="/facture/:id" element={<InvoiceView />} />
                    <Route path="/clients" element={<Customers />} />
                    <Route path="/catalogue" element={<Catalog />} />
                    <Route path="/abonnement" element={<AdminRoute><Subscription /></AdminRoute>} />
                    <Route path="/parametres" element={<AdminRoute><SettingsPage /></AdminRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
