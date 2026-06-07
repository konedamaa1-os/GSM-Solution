import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Wrench, FileText, LayoutDashboard, Settings, Users, LogOut, CreditCard, Menu, X } from 'lucide-react';

// Components (we will create these next)
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

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isManager, logout, activeEmployee, user } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
            <span>GSM SOLUTION</span>
          </div>
          <button className="mobile-close-btn" onClick={closeMobileMenu} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="var(--text-secondary)" />
          </button>
        </div>
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
                Paramètres
              </NavLink>
            </>
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
    </div>
  );
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
            <Route path="*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/nouvelle-facture" element={<CreateInvoice />} />
                    <Route path="/reparations" element={<RepairTracking />} />
                    <Route path="/facture/:id" element={<InvoiceView />} />
                    <Route path="/clients" element={<Customers />} />
                    <Route path="/catalogue" element={<Catalog />} />
                    <Route path="/abonnement" element={<AdminRoute><Subscription /></AdminRoute>} />
                    <Route path="/parametres" element={<AdminRoute><SettingsPage /></AdminRoute>} />
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
