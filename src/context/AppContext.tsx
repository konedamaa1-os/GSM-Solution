import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppState, Invoice, Employee, ShopSettings, RepairStatus, DeviceModel, CommonIssue, Shop } from '../types';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { getDomainInfo, type DomainInfo } from '../lib/domain';

interface AppContextType extends AppState {
  domainShop: Shop | null;
  domainInfo: DomainInfo;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date' | 'shop_id'>) => Promise<boolean>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  updateInvoicePaymentStatus: (id: string, status: Invoice['paymentStatus']) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'shop_id'>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  updateSettings: (settings: ShopSettings) => Promise<void>;
  updateShopDomain: (slug: string, customDomain: string, brandColor?: string) => Promise<{ success: boolean; error?: string }>;
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
  createShopWithManager: (shopName: string, managerName: string, managerEmail: string, managerPassword: string, slug?: string, customDomain?: string) => Promise<{ success: boolean; error?: string }>;
  deleteShop: (shopId: string) => Promise<{ success: boolean; error?: string }>;
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
  const [domainShop, setDomainShop] = useState<Shop | null>(null);
  const [domainInfo, setDomainInfo] = useState<DomainInfo>({ isCustomDomain: false, isSubdomain: false, slugOrDomain: null, type: 'none' });
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
  const isSuperAdmin = user?.email === 'konedamaa@gmail.com' || localStorage.getItem('dev_bypass') === 'true';
  const isManager = currentUserRole === 'Manager' || 
                    (currentShop && user && currentShop.owner_id === user.id) || 
                    localStorage.getItem('dev_bypass') === 'true' ||
                    user?.email === 'konedamaa@gmail.com';

  const fetchShopData = async (activeShop: Shop) => {
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
  };

  const fetchData = async () => {
    setLoading(true);
    
    // 1. First check domain / subdomain info
    const dInfo = getDomainInfo();
    setDomainInfo(dInfo);

    let activeShop: Shop | null = null;

    if (dInfo.slugOrDomain) {
      const subSlug = dInfo.slugOrDomain.split('.')[0];
      const { data: matchedShop } = await supabase
        .from('tb_shops')
        .select('*')
        .or(`slug.eq.${dInfo.slugOrDomain},custom_domain.eq.${dInfo.slugOrDomain},slug.eq.${subSlug},custom_domain.eq.${subSlug}.gsmsolution.xyz`)
        .maybeSingle();

      if (matchedShop) {
        activeShop = matchedShop;
        setDomainShop(matchedShop);
        setCurrentShop(matchedShop);
      }
    }

    // 2. If no domain shop matched or default domain, fetch for authenticated user
    if (!activeShop) {
      const { data: shopData } = await supabase.from('tb_shops').select('*').limit(1).maybeSingle();
      
      if (shopData) {
        activeShop = shopData;
        setCurrentShop(shopData);
      } else if (user) {
        // Auto-create shop for new user
        const autoSlug = (user.email?.split('@')[0] || 'boutique').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const { data: newShop, error } = await supabase.from('tb_shops').insert({
          owner_id: user.id,
          name: 'Ma Nouvelle Boutique',
          slug: autoSlug
        }).select().single();
        
        if (newShop) {
          activeShop = newShop;
          setCurrentShop(newShop);
        } else {
          console.error("Erreur création boutique:", error);
        }
      }
    }

    if (activeShop) {
      await fetchShopData(activeShop);
    }

    // Always fetch all shops
    const { data: shops } = await supabase.from('tb_shops').select('*').order('created_at', { ascending: false });
    setAllShops(shops || []);

    setLoading(false);
  };

  useEffect(() => {
    // Initial domain detection
    const dInfo = getDomainInfo();
    setDomainInfo(dInfo);

    // If on a dedicated domain or query param, try resolving public shop early
    if (dInfo.slugOrDomain) {
      const subSlug = dInfo.slugOrDomain.split('.')[0];
      supabase
        .from('tb_shops')
        .select('*')
        .or(`slug.eq.${dInfo.slugOrDomain},custom_domain.eq.${dInfo.slugOrDomain},slug.eq.${subSlug},custom_domain.eq.${subSlug}.gsmsolution.xyz`)
        .maybeSingle()
        .then(({ data: matched }) => {
          if (matched) {
            setDomainShop(matched);
            setCurrentShop(matched);
          }
        });
    }

    // Check for dev bypass
    const isDevBypass = localStorage.getItem('dev_bypass') === 'true';

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isDevBypass) {
        setUser({ email: 'konedamaa@gmail.com', id: 'super-admin-id' } as any);
        fetchData();
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchData();
      } else {
        // If domain is detected, fetch shop data anyway for public portal
        if (dInfo.slugOrDomain) {
          fetchData();
        } else {
          setLoading(false);
        }
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
        if (!domainShop) {
          setCurrentShop(null);
          setInvoices([]);
          setEmployees([]);
          setDeviceModels([]);
          setCommonIssues([]);
          setSettings(null);
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const forceLoginAsAdmin = () => {
    localStorage.setItem('dev_bypass', 'true');
    setUser({ email: 'konedamaa@gmail.com', id: 'super-admin-id' } as any);
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

  const updateShopDomain = async (slug: string, customDomain: string, brandColor?: string) => {
    if (!currentShop) return { success: false, error: 'Aucune boutique active.' };

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    const cleanDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

    const { error } = await supabase
      .from('tb_shops')
      .update({
        slug: cleanSlug || null,
        custom_domain: cleanDomain || null,
        brand_color: brandColor || currentShop.brand_color || '#2563eb'
      })
      .eq('id', currentShop.id);

    if (error) {
      return { success: false, error: error.message };
    }

    setCurrentShop({
      ...currentShop,
      slug: cleanSlug,
      custom_domain: cleanDomain,
      brand_color: brandColor || currentShop.brand_color
    });

    return { success: true };
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
      // Update phone2 / phone3 if provided
      if (invoiceData.customer.phone2 || invoiceData.customer.phone3) {
        await supabase.from('tb_customers').update({
          phone2: invoiceData.customer.phone2 || existingCustomer.phone2,
          phone3: invoiceData.customer.phone3 || existingCustomer.phone3,
          name: invoiceData.customer.name || existingCustomer.name
        }).eq('id', existingCustomer.id);
        finalCustomer = { ...existingCustomer, ...invoiceData.customer };
      }
    } else {
      const { data: customerData, error: custError } = await supabase.from('tb_customers').insert({
        shop_id: currentShop.id,
        name: invoiceData.customer.name,
        phone: invoiceData.customer.phone,
        phone2: invoiceData.customer.phone2 || null,
        phone3: invoiceData.customer.phone3 || null,
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

      // Auto-learn Brand & Model if new
      if (invoiceData.device.brand && invoiceData.device.model) {
        const brandClean = invoiceData.device.brand.trim();
        const modelClean = invoiceData.device.model.trim();
        const existsModel = deviceModels.some(
          m => m.brand.toLowerCase() === brandClean.toLowerCase() && m.model.toLowerCase() === modelClean.toLowerCase()
        );
        if (!existsModel) {
          supabase.from('tb_device_models').insert({
            shop_id: currentShop.id,
            brand: brandClean,
            model: modelClean
          }).select().single().then(({ data: newModel }) => {
            if (newModel) {
              setDeviceModels(prev => [...prev, newModel].sort((a, b) => a.brand.localeCompare(b.brand)));
            }
          });
        }
      }

      // Auto-learn Panne / Issue if new
      if (invoiceData.device.issue) {
        const issueClean = invoiceData.device.issue.trim();
        const existsIssue = commonIssues.some(
          i => i.name.toLowerCase() === issueClean.toLowerCase()
        );
        if (!existsIssue) {
          supabase.from('tb_common_issues').insert({
            shop_id: currentShop.id,
            name: issueClean,
            default_price: invoiceData.price || 0
          }).select().single().then(({ data: newIssue }) => {
            if (newIssue) {
              setCommonIssues(prev => [...prev, newIssue].sort((a, b) => a.name.localeCompare(b.name)));
            }
          });
        }
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
      email: employeeData.email,
      phone: employeeData.phone || null
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
    
    const payload = {
      name: newSettings.name,
      address: newSettings.address,
      phone: newSettings.phone,
      phone2: newSettings.phone2 || null,
      phone3: newSettings.phone3 || null,
      email: newSettings.email,
      terms_and_conditions: newSettings.termsAndConditions
    };

    if (currentSettings) {
      const { error } = await supabase.from('tb_shop_settings').update(payload).eq('id', currentSettings.id);

      if (!error) {
        setSettings({ ...newSettings, shop_id: currentShop.id });
      }
    } else {
      const { data: inserted } = await supabase.from('tb_shop_settings').insert({
        ...payload,
        shop_id: currentShop.id
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
      await fetchShopData(shop);
    }
    setLoading(false);
  };

  const createShopWithManager = async (
    shopName: string, 
    managerName: string, 
    managerEmail: string, 
    managerPassword: string,
    slug?: string,
    customDomain?: string
  ) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté.' };
    
    // 1. Try via full atomic RPC function
    const { data: rpcResult, error: rpcErr } = await supabase.rpc('create_shop_and_manager', {
      p_shop_name: shopName,
      p_slug: slug || '',
      p_custom_domain: customDomain || '',
      p_manager_name: managerName,
      p_manager_email: managerEmail,
      p_manager_password: managerPassword
    });

    if (!rpcErr && rpcResult) {
      if (rpcResult.success === false) {
        return { success: false, error: rpcResult.error || 'Erreur création atelier.' };
      }
      // Refresh shops list
      const { data: shops } = await supabase.from('tb_shops').select('*');
      setAllShops(shops || []);
      return { success: true };
    }

    // 2. Fallback to client-side creation if RPC is not available
    const { data: managerUserId, error: rpcError } = await supabase.rpc('create_user_admin', {
      new_email: managerEmail,
      new_password: managerPassword
    });

    if (rpcError || !managerUserId) {
      console.error("Error creating user via RPC:", rpcError);
      return { success: false, error: `Erreur création compte utilisateur : ${rpcError?.message || 'Inconnue'}` };
    }

    const autoSlug = (slug || shopName).toLowerCase().replace(/[^a-z0-9]/g, '-');

    const { data: shop, error: shopError } = await supabase.from('tb_shops').insert({
      name: shopName,
      owner_id: managerUserId,
      slug: autoSlug,
      custom_domain: customDomain ? customDomain.trim().toLowerCase() : null
    }).select().single();

    if (shopError || !shop) {
      console.error("Error creating shop:", shopError);
      return { success: false, error: `Erreur création boutique: ${shopError?.message || 'Inconnue'}` };
    }

    await supabase.from('tb_shop_settings').insert({
      shop_id: shop.id,
      name: shopName,
      address: 'Adresse de la boutique',
      phone: '00000000',
      email: managerEmail,
      terms_and_conditions: 'Garantie de 3 mois sur toutes les réparations.'
    });

    await supabase.from('tb_employees').insert({
      shop_id: shop.id,
      name: managerName,
      email: managerEmail,
      role: 'Manager'
    });

    // Refresh shops list
    const { data: shops } = await supabase.from('tb_shops').select('*').order('created_at', { ascending: false });
    setAllShops(shops || []);
    return { success: true };
  };

  const deleteShop = async (shopId: string) => {
    try {
      const { data: res, error: rpcErr } = await supabase.rpc('delete_shop_admin', {
        p_shop_id: shopId
      });

      if (rpcErr || (res && res.success === false)) {
        return { success: false, error: res?.error || rpcErr?.message || 'Erreur lors de la suppression de l\'atelier.' };
      }

      // Refresh shops list
      const { data: shops } = await supabase.from('tb_shops').select('*').order('created_at', { ascending: false });
      setAllShops(shops || []);

      // If deleted current active shop, switch to first available
      if (currentShop?.id === shopId) {
        if (shops && shops.length > 0) {
          setCurrentShop(shops[0]);
          await fetchShopData(shops[0]);
        } else {
          setCurrentShop(null);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur inattendue.' };
    }
  };

  return (
    <AppContext.Provider value={{ 
      currentShop, domainShop, domainInfo, invoices, employees, settings, deviceModels, commonIssues, 
      addInvoice, updateInvoiceStatus, updateInvoicePaymentStatus, addEmployee, deleteEmployee, updateSettings, 
      updateShopDomain, addDeviceModel, deleteDeviceModel, addCommonIssue, deleteCommonIssue,
      loading, user, session, currentUserRole, isManager, deleteCustomer,
      activeEmployee, forceLoginAsAdmin, logout, isSuperAdmin, allShops, switchShop, createShopWithManager, deleteShop
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
