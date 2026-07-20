import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppState, Invoice, Employee, ShopSettings, RepairStatus, DeviceModel, CommonIssue, Shop } from '../types';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AppContextType extends AppState {
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date' | 'shop_id'>) => Promise<boolean>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  updateInvoicePaymentStatus: (id: string, status: Invoice['paymentStatus']) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'shop_id'>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  updateSettings: (settings: ShopSettings) => Promise<void>;
  addDeviceModel: (model: Omit<DeviceModel, 'id' | 'created_at' | 'shop_id'>) => Promise<void>;
  deleteDeviceModel: (id: string) => Promise<void>;
  addCommonIssue: (issue: Omit<CommonIssue, 'id' | 'created_at' | 'shop_id'>) => Promise<void>;
  deleteCommonIssue: (id: string) => Promise<void>;
  forceLoginAsAdmin: () => void;
  logout: () => Promise<void>;
  loading: boolean;
  user: User | null;
  session: Session | null;
  currentUserRole: string | null;
  isManager: boolean;
  deleteCustomer: (id: string) => Promise<{ error: any }>;
  activeEmployee: Employee | null;
  isSuperAdmin: boolean;
  allShops: Shop[];
  switchShop: (shopId: string) => Promise<void>;
  createShopWithManager: (shopName: string, managerName: string, managerEmail: string, managerPassword: string) => Promise<{ success: boolean; error?: string }>;
}

export const defaultSettings = {
  name: 'TonTon Boua',
  address: '123 Rue de la Réparation, 75000 Paris',
  phone: '01 23 45 67 89',
  email: 'contact@tontonboua.com',
  termsAndConditions: 'Garantie de 3 mois sur toutes les réparations. Les appareils non réclamés après 60 jours seront recyclés.',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [commonIssues, setCommonIssues] = useState<CommonIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [allShops, setAllShops] = useState<Shop[]>([]);
  
  const activeEmployee = React.useMemo(() => {
    if (!user || !user.email) return null;
    return employees.find(e => e.email === user.email) || null;
  }, [user, employees]);

  const currentUserRole = activeEmployee ? activeEmployee.role : null;
  const isSuperAdmin = user?.email === 'admin.tontonboua@gmail.com';
  const isManager = currentUserRole === 'Manager' || 
                    (currentShop && user && currentShop.owner_id === user.id) || 
                    localStorage.getItem('dev_bypass') === 'true' ||
                    user?.email === 'admin.tontonboua@gmail.com';

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch or create Shop
    let activeShop = null;
    const { data: shopData } = await supabase.from('tb_shops').select('*').limit(1).maybeSingle();
    
    if (shopData) {
      activeShop = shopData;
      setCurrentShop(shopData);
    } else if (user) {
      // Auto-create shop for new user
      const { data: newShop, error } = await supabase.from('tb_shops').insert({
        owner_id: user.id,
        name: 'Ma Nouvelle Boutique'
      }).select().single();
      
      if (newShop) {
        activeShop = newShop;
        setCurrentShop(newShop);
      } else {
        console.error("Erreur création boutique:", error);
      }
    }

    if (activeShop) {
      // Fetch Settings
      const { data: settingsData } = await supabase.from('tb_shop_settings').select('*').eq('shop_id', activeShop.id).limit(1).maybeSingle();
      if (settingsData) {
        setSettings(settingsData);
      }

      // Fetch Employees
      const { data: employeesData } = await supabase.from('tb_employees').select('*').eq('shop_id', activeShop.id);
      if (employeesData && employeesData.length > 0) {
        setEmployees(employeesData);
      } else if (user) {
        // Auto insert owner if employee list is empty
        const { data: ownerEmp } = await supabase.from('tb_employees').insert({
          shop_id: activeShop.id,
          name: user.email?.split('@')[0] || 'Propriétaire',
          email: user.email,
          role: 'Manager'
        }).select().single();
        
        if (ownerEmp) {
          setEmployees([ownerEmp]);
        }
      }

      // Fetch Device Models
      const { data: modelsData } = await supabase.from('tb_device_models').select('*').eq('shop_id', activeShop.id).order('brand', { ascending: true });
      if (modelsData) {
        setDeviceModels(modelsData);
      }

      // Fetch Common Issues
      const { data: issuesData } = await supabase.from('tb_common_issues').select('*').eq('shop_id', activeShop.id).order('name', { ascending: true });
      if (issuesData) {
        setCommonIssues(issuesData);
      }

      // Fetch Invoices with Customers and Devices
      const { data: invoicesData } = await supabase
        .from('tb_invoices')
        .select(`
          *,
          customer:tb_customers(*),
          device:tb_devices(*)
        `)
        .eq('shop_id', activeShop.id)
        .order('date', { ascending: false });

      if (invoicesData) {
        const formattedInvoices: Invoice[] = invoicesData
          .filter(inv => inv.customer && inv.device)
          .map(inv => ({
          id: inv.id,
          shop_id: inv.shop_id,
          invoiceNumber: inv.invoice_number,
          date: inv.date,
          customer: Array.isArray(inv.customer) ? inv.customer[0] : inv.customer,
          employeeId: inv.employee_id,
          device: Array.isArray(inv.device) ? inv.device[0] : inv.device,
          price: inv.price,
          warrantyMonths: inv.warranty_months,
          status: inv.status as RepairStatus,
          paymentStatus: inv.payment_status || 'Impayé',
          notes: inv.notes
        }));
        setInvoices(formattedInvoices);
      }
    }

    if (user?.email === 'admin.tontonboua@gmail.com') {
      const { data: shops } = await supabase.from('tb_shops').select('*');
      setAllShops(shops || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    // Check for dev bypass
    const isDevBypass = localStorage.getItem('dev_bypass') === 'true';

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isDevBypass) {
        setUser({ email: 'admin@tontonboua.com', id: 'dev-bypass-id' } as any);
        fetchData();
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchData();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('dev_bypass') === 'true') return;
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchData();
      } else {
        // Clear data on logout
        setCurrentShop(null);
        setInvoices([]);
        setEmployees([]);
        setDeviceModels([]);
        setCommonIssues([]);
        setSettings(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const forceLoginAsAdmin = () => {
    localStorage.setItem('dev_bypass', 'true');
    setUser({ email: 'admin@tontonboua.com', id: 'dev-bypass-id' } as any);
    setSession({} as any);
    fetchData();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).forceLoginAsAdmin = forceLoginAsAdmin;
    }
  }, []);

  const logout = async () => {
    localStorage.removeItem('dev_bypass');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'date' | 'shop_id'>): Promise<boolean> => {
    if (!currentShop) return false;
    
    const currentYear = new Date().getFullYear();
    const yearInvoices = invoices.filter(inv => inv.invoiceNumber && (inv.invoiceNumber.includes(`INV-${currentYear}-`) || inv.invoiceNumber.includes(`Fac-${currentYear}-`)));
    const maxNum = yearInvoices.reduce((max, inv) => {
      const parts = inv.invoiceNumber.split('-');
      if (parts.length >= 3) {
        const num = parseInt(parts[2], 10);
        return Math.max(max, isNaN(num) ? 0 : num);
      }
      return max;
    }, 0);
    const invoiceNumber = `Fac-${currentYear}-${String(maxNum + 1).padStart(4, '0')}`;
    const date = new Date().toISOString();
    
    let customerId = invoiceData.customer.id;
    let finalCustomer = invoiceData.customer;

    // Check if customer exists by phone
    const { data: existingCustomer } = await supabase.from('tb_customers')
      .select('*')
      .eq('phone', invoiceData.customer.phone)
      .eq('shop_id', currentShop.id)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      finalCustomer = existingCustomer;
    } else {
      const { data: customerData, error: custError } = await supabase.from('tb_customers').insert({
        shop_id: currentShop.id,
        name: invoiceData.customer.name,
        phone: invoiceData.customer.phone,
        email: invoiceData.customer.email,
        address: invoiceData.customer.address
      }).select().single();
      
      if (custError) {
        alert("Erreur lors de la création du client: " + custError.message);
        return false;
      }
      if (customerData) {
        customerId = customerData.id;
        finalCustomer = customerData;
      }
    }

    if (!invoiceData.employeeId) {
      alert("Erreur: Aucun technicien sélectionné.");
      return false;
    }

    // Insert Invoice
    const { data: newInvData, error: invError } = await supabase.from('tb_invoices').insert({
      shop_id: currentShop.id,
      invoice_number: invoiceNumber,
      date,
      customer_id: customerId,
      employee_id: invoiceData.employeeId,
      price: invoiceData.price,
      warranty_months: invoiceData.warrantyMonths,
      status: invoiceData.status,
      payment_status: invoiceData.paymentStatus,
      notes: invoiceData.notes
    }).select().single();

    if (invError) {
      alert("Erreur lors de la création de la facture: " + invError.message);
      return false;
    }

    if (newInvData) {
      // Insert Device
      const { data: deviceData, error: devError } = await supabase.from('tb_devices').insert({
        shop_id: currentShop.id,
        invoice_id: newInvData.id,
        brand: invoiceData.device.brand,
        model: invoiceData.device.model,
        serial_number: invoiceData.device.serialNumber,
        issue: invoiceData.device.issue,
        accessories: invoiceData.device.accessories,
        password: invoiceData.device.password
      }).select().single();

      if (devError) {
        alert("Erreur lors de l'ajout de l'appareil: " + devError.message);
        return false;
      }

      // Update local state
      const newInvoice: Invoice = {
        ...invoiceData,
        id: newInvData.id,
        shop_id: currentShop.id,
        invoiceNumber,
        date,
        customer: { ...finalCustomer, shop_id: currentShop.id },
        device: deviceData || { ...invoiceData.device, shop_id: currentShop.id }
      };
      setInvoices([newInvoice, ...invoices]);
      return true;
    }
    return false;
  };

  const updateInvoiceStatus = async (id: string, status: Invoice['status']) => {
    const { error } = await supabase.from('tb_invoices').update({ status }).eq('id', id);
    if (!error) {
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status } : inv));
    }
  };

  const updateInvoicePaymentStatus = async (id: string, payment_status: Invoice['paymentStatus']) => {
    const { error } = await supabase.from('tb_invoices').update({ payment_status }).eq('id', id);
    if (!error) {
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, paymentStatus: payment_status } : inv));
    }
  };

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'shop_id'>) => {
    if (!currentShop) return;
    const { data } = await supabase.from('tb_employees').insert({
      shop_id: currentShop.id,
      name: employeeData.name,
      role: employeeData.role,
      email: employeeData.email
    }).select().single();
    
    if (data) {
      setEmployees([...employees, data]);
    }
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from('tb_employees').delete().eq('id', id);
    if (!error) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const addDeviceModel = async (modelData: Omit<DeviceModel, 'id' | 'created_at' | 'shop_id'>) => {
    if (!currentShop) return;
    const { data, error } = await supabase.from('tb_device_models').insert({ ...modelData, shop_id: currentShop.id }).select().single();
    if (data && !error) {
      setDeviceModels([...deviceModels, data].sort((a, b) => a.brand.localeCompare(b.brand)));
    }
  };

  const deleteDeviceModel = async (id: string) => {
    const { error } = await supabase.from('tb_device_models').delete().eq('id', id);
    if (!error) {
      setDeviceModels(deviceModels.filter(m => m.id !== id));
    }
  };

  const addCommonIssue = async (issueData: Omit<CommonIssue, 'id' | 'created_at' | 'shop_id'>) => {
    if (!currentShop) return;
    const { data, error } = await supabase.from('tb_common_issues').insert({ ...issueData, shop_id: currentShop.id }).select().single();
    if (data && !error) {
      setCommonIssues([...commonIssues, data].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const deleteCommonIssue = async (id: string) => {
    const { error } = await supabase.from('tb_common_issues').delete().eq('id', id);
    if (!error) {
      setCommonIssues(commonIssues.filter(i => i.id !== id));
    }
  };

  const updateSettings = async (newSettings: ShopSettings) => {
    if (!currentShop) return;
    
    const { data: currentSettings } = await supabase.from('tb_shop_settings').select('id').eq('shop_id', currentShop.id).limit(1).maybeSingle();
    
    if (currentSettings) {
      const { error } = await supabase.from('tb_shop_settings').update({
        name: newSettings.name,
        address: newSettings.address,
        phone: newSettings.phone,
        email: newSettings.email,
        terms_and_conditions: newSettings.termsAndConditions
      }).eq('id', currentSettings.id);

      if (!error) {
        setSettings({ ...newSettings, shop_id: currentShop.id });
      }
    } else {
      const { data: inserted } = await supabase.from('tb_shop_settings').insert({
        shop_id: currentShop.id,
        name: newSettings.name,
        address: newSettings.address,
        phone: newSettings.phone,
        email: newSettings.email,
        terms_and_conditions: newSettings.termsAndConditions
      }).select().single();

      if (inserted) {
        setSettings(inserted);
      }
    }
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from('tb_customers').delete().eq('id', id);
    if (!error) {
      setInvoices(invoices.filter(inv => inv.customer.id !== id));
    }
    return { error };
  };

  const switchShop = async (shopId: string) => {
    setLoading(true);
    const { data: shop } = await supabase.from('tb_shops').select('*').eq('id', shopId).single();
    if (shop) {
      setCurrentShop(shop);
      
      const { data: settingsData } = await supabase.from('tb_shop_settings').select('*').eq('shop_id', shop.id).limit(1).maybeSingle();
      setSettings(settingsData);

      const { data: employeesData } = await supabase.from('tb_employees').select('*').eq('shop_id', shop.id);
      setEmployees(employeesData || []);

      const { data: modelsData } = await supabase.from('tb_device_models').select('*').eq('shop_id', shop.id).order('brand', { ascending: true });
      setDeviceModels(modelsData || []);

      const { data: issuesData } = await supabase.from('tb_common_issues').select('*').eq('shop_id', shop.id).order('name', { ascending: true });
      setCommonIssues(issuesData || []);

      const { data: invoicesData } = await supabase
        .from('tb_invoices')
        .select(`
          *,
          customer:tb_customers(*),
          device:tb_devices(*)
        `)
        .eq('shop_id', shop.id)
        .order('date', { ascending: false });

      if (invoicesData) {
        const formattedInvoices: Invoice[] = invoicesData
          .filter(inv => inv.customer && inv.device)
          .map(inv => ({
            id: inv.id,
            shop_id: inv.shop_id,
            invoiceNumber: inv.invoice_number,
            date: inv.date,
            customer: Array.isArray(inv.customer) ? inv.customer[0] : inv.customer,
            employeeId: inv.employee_id,
            device: Array.isArray(inv.device) ? inv.device[0] : inv.device,
            price: inv.price,
            warrantyMonths: inv.warranty_months,
            status: inv.status as RepairStatus,
            paymentStatus: inv.payment_status || 'Impayé',
            notes: inv.notes
          }));
        setInvoices(formattedInvoices);
      } else {
        setInvoices([]);
      }
    }
    setLoading(false);
  };

  const createShopWithManager = async (shopName: string, managerName: string, managerEmail: string, managerPassword: string) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté.' };
    
    // 1. Create the user in auth schema using RPC
    const { data: managerUserId, error: rpcError } = await supabase.rpc('create_user_admin', {
      new_email: managerEmail,
      new_password: managerPassword
    });

    if (rpcError || !managerUserId) {
      console.error("Error creating user via RPC:", rpcError);
      return { success: false, error: `Erreur création compte utilisateur : ${rpcError?.message || 'Inconnue'}` };
    }

    // 2. Insert Shop with the newly created manager as owner
    const { data: shop, error: shopError } = await supabase.from('tb_shops').insert({
      name: shopName,
      owner_id: managerUserId
    }).select().single();

    if (shopError || !shop) {
      console.error("Error creating shop:", shopError);
      return { success: false, error: `Erreur création boutique: ${shopError?.message || 'Inconnue'}` };
    }

    // 3. Insert Settings
    const { error: settingsError } = await supabase.from('tb_shop_settings').insert({
      shop_id: shop.id,
      name: shopName,
      address: 'Adresse de la boutique',
      phone: '00000000',
      email: managerEmail,
      terms_and_conditions: 'Garantie de 3 mois sur toutes les réparations.'
    });

    if (settingsError) {
      console.error("Error creating shop settings:", settingsError);
      await supabase.from('tb_shops').delete().eq('id', shop.id);
      return { success: false, error: `Erreur création paramètres: ${settingsError.message}` };
    }

    // 4. Insert Employee
    const { error: empError } = await supabase.from('tb_employees').insert({
      shop_id: shop.id,
      name: managerName,
      email: managerEmail,
      role: 'Manager'
    });

    if (empError) {
      console.error("Error creating manager employee:", empError);
      await supabase.from('tb_shops').delete().eq('id', shop.id);
      return { success: false, error: `Erreur création manager: ${empError.message}` };
    }

    // Refresh shops list
    const { data: shops } = await supabase.from('tb_shops').select('*');
    setAllShops(shops || []);
    return { success: true };
  };

  return (
    <AppContext.Provider value={{ 
      currentShop, invoices, employees, settings, deviceModels, commonIssues, 
      addInvoice, updateInvoiceStatus, updateInvoicePaymentStatus, addEmployee, deleteEmployee, updateSettings, 
      addDeviceModel, deleteDeviceModel, addCommonIssue, deleteCommonIssue,
      loading, user, session, currentUserRole, isManager, deleteCustomer,
      activeEmployee, forceLoginAsAdmin, logout, isSuperAdmin, allShops, switchShop, createShopWithManager
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
