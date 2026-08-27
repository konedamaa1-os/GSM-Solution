import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Phone,
  User,
  Smartphone,
  Laptop,
  Tablet,
  DollarSign,
  Wrench,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Tag,
  Check,
  ChevronRight,
  Search,
  List,
  Edit3
} from 'lucide-react';

const DEFAULT_BRANDS = [
  'Apple',
  'Samsung',
  'Tecno',
  'Infinix',
  'Xiaomi',
  'Huawei',
  'Oppo',
  'Vivo',
  'Itel',
  'Redmi',
  'Google Pixel',
  'Realme',
  'Honor',
  'Sony',
  'Nokia',
  'Motorola',
  'HP',
  'Dell',
  'Lenovo',
  'Asus',
  'Acer',
  'MacBook'
];

const DEFAULT_MODELS_BY_BRAND: Record<string, string[]> = {
  apple: [
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16',
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 Mini',
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 Mini',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
    'iPhone XS Max', 'iPhone XR', 'iPhone X',
    'iPhone 8 Plus', 'iPhone 8', 'iPhone 7 Plus', 'iPhone 7',
    'iPad Pro', 'iPad Air', 'iPad Mini', 'iPad 10'
  ],
  samsung: [
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
    'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy S22 Ultra', 'Galaxy S22',
    'Galaxy S21 Ultra', 'Galaxy S21 FE', 'Galaxy S20 FE',
    'Galaxy A54 5G', 'Galaxy A53 5G', 'Galaxy A34 5G',
    'Galaxy A24', 'Galaxy A23', 'Galaxy A15', 'Galaxy A14', 'Galaxy A13', 'Galaxy A12', 'Galaxy A10s',
    'Galaxy A05s', 'Galaxy A04s', 'Galaxy A03s', 'Galaxy A02',
    'Galaxy Note 20 Ultra', 'Galaxy Note 10 Plus', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5'
  ],
  tecno: [
    'Spark 20 Pro+', 'Spark 20 Pro', 'Spark 20', 'Spark 20C',
    'Spark 10 Pro', 'Spark 10', 'Spark 10C',
    'Spark 9 Pro', 'Spark 8P', 'Spark 7',
    'Camon 30 Premier', 'Camon 30 Pro', 'Camon 30', 'Camon 20 Premier', 'Camon 20 Pro', 'Camon 20',
    'Pova 6 Pro', 'Pova 5 Pro', 'Pova Neo 3',
    'Pop 8', 'Pop 7 Pro', 'Pop 7', 'Pop 6'
  ],
  infinix: [
    'Hot 40 Pro', 'Hot 40', 'Hot 40i',
    'Hot 30 Play', 'Hot 30', 'Hot 30i',
    'Hot 20', 'Hot 12 Play', 'Hot 11', 'Hot 10',
    'Note 40 Pro', 'Note 40', 'Note 30 Pro', 'Note 30', 'Note 12 VIP',
    'Smart 8 Pro', 'Smart 8', 'Smart 7 HD', 'Smart 7', 'Smart 6',
    'Zero 30 5G', 'Zero Ultra'
  ],
  xiaomi: [
    'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13',
    'Redmi Note 12 Pro', 'Redmi Note 12', 'Redmi Note 11',
    'Redmi 13C', 'Redmi 12', 'Redmi 12C', 'Redmi 10C', 'Redmi 9A', 'Redmi 9C',
    'Poco X6 Pro', 'Poco X5 Pro', 'Poco M6 Pro', 'Xiaomi 13T'
  ],
  huawei: [
    'P60 Pro', 'P50 Pro', 'P40 Pro', 'P30 Pro', 'P30 Lite',
    'Nova 11', 'Nova 10', 'Nova 9', 'Nova 8i', 'Nova 7i',
    'Y9 Prime', 'Y7 Prime', 'Y6p', 'Y5p'
  ],
  oppo: [
    'Reno 11 Pro', 'Reno 11', 'Reno 10', 'Reno 8',
    'A79 5G', 'A78', 'A58', 'A38', 'A18', 'A17', 'A16', 'A54'
  ],
  itel: [
    'S23+', 'S23', 'A70', 'A60s', 'A60', 'P40+', 'P40', 'P38'
  ]
};

const DEFAULT_COMMON_ISSUES = [
  'Écran cassé / Vitre tactile HS',
  'Batterie à remplacer (Ne tient plus la charge)',
  'Connecteur de charge défectueux (Ne charge plus)',
  'Téléphone tombé dans l\'eau (Désoxydation complète)',
  'Problème de charge / Appareil ne s\'allume plus',
  'Caméra arrière / avant floue ou défectueuse',
  'Micro / Haut-parleur muet (Pas de son)',
  'Déblocage Réseau / Schéma / Mot de passe oublié',
  'Bouton Power / Volume bloqué ou cassé',
  'Vitre arrière fissurée / Châssis tordu',
  'Problème Réseau / Wi-Fi / Bluetooth',
  'Flashage / Réinstallation Système (Bug logo)'
];

const COMMON_ACCESSORIES = [
  'Coque',
  'Chargeur',
  'Carte SIM',
  'Carte SD',
  'Boîte d\'origine',
  'Aucun accessoire'
];

const WARRANTY_OPTIONS = [
  { label: 'Sans garantie', value: '0' },
  { label: '1 mois', value: '1' },
  { label: '3 mois (Recommandé)', value: '3' },
  { label: '6 mois', value: '6' },
  { label: '1 an', value: '12' }
];

const DEVICE_TYPES = [
  { label: 'Smartphone', icon: Smartphone },
  { label: 'Ordinateur / PC', icon: Laptop },
  { label: 'Tablette', icon: Tablet },
  { label: 'Autre appareil', icon: Tag }
];

const STEPS = [
  { id: 1, title: 'Informations Client & Contacts', icon: User, desc: 'Identité et 3 numéros' },
  { id: 2, title: 'Détails de l\'Appareil & Panne', icon: Smartphone, desc: 'Marque, modèle & diagnostic' },
  { id: 3, title: 'Attribution & Facturation', icon: DollarSign, desc: 'Technicien, prix & garantie' }
];

interface RegularCustomerProfile {
  customer: any;
  repairCount: number;
  lastRepair?: {
    device: string;
    issue: string;
    date: string;
  };
}

const CreateInvoice = () => {
  const { invoices, addInvoice, employees, deviceModels, commonIssues, activeEmployee, settings, currentShop } = useAppContext();
  const navigate = useNavigate();

  // Active step (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState('Smartphone');
  const [validationError, setValidationError] = useState('');

  // Dropdown selection modes vs manual typing
  const [selectedCustomerOption, setSelectedCustomerOption] = useState<string>('manual');
  const [customBrandMode, setCustomBrandMode] = useState<boolean>(false);
  const [customModelMode, setCustomModelMode] = useState<boolean>(false);
  const [customIssueMode, setCustomIssueMode] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerPhone2: '',
    customerPhone3: '',
    deviceBrand: '',
    deviceModel: '',
    deviceSerial: '',
    deviceIssue: '',
    devicePassword: '',
    deviceAccessories: '',
    employeeId: activeEmployee ? activeEmployee.id : (employees.length > 0 ? employees[0].id : ''),
    price: '',
    warrantyMonths: '3',
    notes: '',
    paymentStatus: 'Impayé' as 'Payé' | 'Impayé',
    paymentCollectorId: activeEmployee ? activeEmployee.id : (employees.length > 0 ? employees[0].id : ''),
    paymentMethod: 'Espèces'
  });

  // Client régulier sélectionné
  const [recognizedCustomer, setRecognizedCustomer] = useState<RegularCustomerProfile | null>(null);

  // Extraire la liste complète des clients réguliers avec leur historique de réparations
  const regularCustomersList = useMemo(() => {
    const map = new Map<string, RegularCustomerProfile>();

    invoices.forEach(inv => {
      if (inv.customer && inv.customer.phone) {
        const phoneKey = inv.customer.phone.trim();
        if (!map.has(phoneKey)) {
          map.set(phoneKey, {
            customer: inv.customer,
            repairCount: 1,
            lastRepair: {
              device: `${inv.device?.brand || ''} ${inv.device?.model || ''}`.trim(),
              issue: inv.device?.issue || '',
              date: inv.date
            }
          });
        } else {
          const entry = map.get(phoneKey)!;
          entry.repairCount += 1;
          if (inv.customer.name && !entry.customer.name) {
            entry.customer.name = inv.customer.name;
          }
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const nameA = a.customer.name || '';
      const nameB = b.customer.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [invoices]);

  // Auto-assign connected technician / employee by default
  useEffect(() => {
    if (activeEmployee && (!formData.employeeId || formData.employeeId === '')) {
      setFormData(prev => ({ ...prev, employeeId: activeEmployee.id }));
    } else if (!formData.employeeId && employees.length > 0) {
      setFormData(prev => ({ ...prev, employeeId: employees[0].id }));
    }
  }, [employees, activeEmployee]);

  // Liste complète et unique des Marques pour le menu déroulant
  const allBrands = useMemo(() => {
    const fromModels = deviceModels.map(m => m.brand);
    const fromInvoices = invoices.map(i => i.device?.brand).filter(Boolean);
    const set = new Set([...DEFAULT_BRANDS, ...fromModels, ...fromInvoices]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [deviceModels, invoices]);

  // Liste complète et unique des Modèles selon la marque sélectionnée pour le menu déroulant
  const allModelsForBrand = useMemo(() => {
    const brandLower = formData.deviceBrand.trim().toLowerCase();
    const defaults = DEFAULT_MODELS_BY_BRAND[brandLower] || [];
    const fromModels = deviceModels
      .filter(m => !brandLower || m.brand.toLowerCase() === brandLower)
      .map(m => m.model);
    const fromInvoices = invoices
      .filter(i => !brandLower || i.device?.brand?.toLowerCase() === brandLower)
      .map(i => i.device?.model)
      .filter(Boolean);
    
    return Array.from(new Set([...defaults, ...fromModels, ...fromInvoices])).sort((a, b) => a.localeCompare(b));
  }, [deviceModels, invoices, formData.deviceBrand]);

  // Liste complète des Pannes pour le menu déroulant
  const allIssues = useMemo(() => {
    const fromIssues = commonIssues.map(i => i.name);
    const fromInvoices = invoices.map(i => i.device?.issue).filter(Boolean);
    return Array.from(new Set([...DEFAULT_COMMON_ISSUES, ...fromIssues, ...fromInvoices])).sort((a, b) => a.localeCompare(b));
  }, [commonIssues, invoices]);

  // 1. GESTION LISTE DÉROULANTE CLIENT
  const handleSelectCustomerDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCustomerOption(val);
    setValidationError('');

    if (val === 'manual' || val === '') {
      setFormData(prev => ({
        ...prev,
        customerName: '',
        customerPhone: '',
        customerPhone2: '',
        customerPhone3: ''
      }));
      setRecognizedCustomer(null);
      return;
    }

    const found = regularCustomersList.find(item => item.customer.phone === val);
    if (found) {
      setFormData(prev => ({
        ...prev,
        customerName: (found.customer.name || '').toUpperCase(),
        customerPhone: found.customer.phone || '',
        customerPhone2: found.customer.phone2 || '',
        customerPhone3: found.customer.phone3 || ''
      }));
      setRecognizedCustomer(found);
    }
  };

  // 2. GESTION LISTE DÉROULANTE MARQUE
  const handleSelectBrandDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValidationError('');

    if (val === 'custom') {
      setCustomBrandMode(true);
      setFormData(prev => ({ ...prev, deviceBrand: '', deviceModel: '' }));
      return;
    }

    setCustomBrandMode(false);
    setCustomModelMode(false);
    setFormData(prev => ({
      ...prev,
      deviceBrand: val.toUpperCase(),
      deviceModel: '' // Réinitialiser le modèle pour forcer le choix dans la nouvelle marque
    }));
  };

  // 3. GESTION LISTE DÉROULANTE MODÈLE
  const handleSelectModelDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValidationError('');

    if (val === 'custom') {
      setCustomModelMode(true);
      setFormData(prev => ({ ...prev, deviceModel: '' }));
      return;
    }

    setCustomModelMode(false);
    setFormData(prev => ({ ...prev, deviceModel: val.toUpperCase() }));
  };

  // 4. GESTION LISTE DÉROULANTE PANNE
  const handleSelectIssueDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValidationError('');

    if (val === 'custom') {
      setCustomIssueMode(true);
      setFormData(prev => ({ ...prev, deviceIssue: '' }));
      return;
    }

    setCustomIssueMode(false);
    const commonIssueObj = commonIssues.find(i => i.name.toLowerCase() === val.toLowerCase());
    setFormData(prev => ({
      ...prev,
      deviceIssue: val.toUpperCase(),
      price: commonIssueObj?.default_price ? commonIssueObj.default_price.toString() : prev.price
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValidationError('');
    const { name, value } = e.target;
    
    // Champs automatiquement convertis en MAJUSCULE
    let processedValue = value;
    const uppercaseFields = [
      'customerName',
      'deviceBrand',
      'deviceModel',
      'deviceSerial',
      'deviceIssue',
      'deviceIssueDescription',
      'deviceAccessories',
      'notes'
    ];
    if (uppercaseFields.includes(name)) {
      processedValue = value.toUpperCase();
    }
    
    // Auto-fill price if a common issue with default price is selected
    if (name === 'deviceIssue') {
      const issue = commonIssues.find(i => i.name.toLowerCase() === processedValue.trim().toLowerCase());
      if (issue && issue.default_price) {
        setFormData(prev => ({ ...prev, [name]: processedValue, price: issue.default_price!.toString() }));
        return;
      }
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: processedValue };
      
      // Auto-remplissage des contacts si le téléphone correspond à un client existant
      if (name === 'customerPhone') {
        const found = regularCustomersList.find(c => c.customer.phone === processedValue.trim());
        if (found) {
          newData.customerName = (found.customer.name || '').toUpperCase();
          newData.customerPhone2 = found.customer.phone2 || '';
          newData.customerPhone3 = found.customer.phone3 || '';
          setRecognizedCustomer(found);
          setSelectedCustomerOption(found.customer.phone);
        } else {
          setRecognizedCustomer(null);
          setSelectedCustomerOption('manual');
        }
      }
      
      return newData;
    });
  };

  const handleToggleAccessory = (acc: string) => {
    const accUpper = acc.toUpperCase();
    setFormData(prev => {
      let current = prev.deviceAccessories.trim();
      if (acc === 'Aucun accessoire') {
        return { ...prev, deviceAccessories: 'AUCUN ACCESSOIRE' };
      }
      if (current === 'AUCUN ACCESSOIRE' || current === 'Aucun accessoire') {
        current = '';
      }
      const list = current ? current.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) : [];
      if (list.includes(accUpper)) {
        const updated = list.filter(item => item !== accUpper);
        return { ...prev, deviceAccessories: updated.join(', ') };
      } else {
        list.push(accUpper);
        return { ...prev, deviceAccessories: list.join(', ') };
      }
    });
  };

  const handleResetForm = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser tout le formulaire ?')) {
      setFormData({
        customerName: '',
        customerPhone: '',
        customerPhone2: '',
        customerPhone3: '',
        deviceBrand: '',
        deviceModel: '',
        deviceSerial: '',
        deviceIssue: '',
        devicePassword: '',
        deviceAccessories: '',
        employeeId: activeEmployee ? activeEmployee.id : (employees.length > 0 ? employees[0].id : ''),
        price: '',
        warrantyMonths: '3',
        notes: ''
      });
      setSelectedCustomerOption('manual');
      setCustomBrandMode(false);
      setCustomModelMode(false);
      setCustomIssueMode(false);
      setRecognizedCustomer(null);
      setCurrentStep(1);
      setValidationError('');
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    if (!formData.customerName.trim()) {
      setValidationError('Veuillez sélectionner ou renseigner le nom complet du client.');
      return false;
    }
    if (!formData.customerPhone.trim()) {
      setValidationError('Veuillez renseigner le numéro de contact principal (Contact 1).');
      return false;
    }
    setValidationError('');
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    if (!formData.deviceBrand.trim()) {
      setValidationError('Veuillez choisir ou saisir la marque de l\'appareil.');
      return false;
    }
    if (!formData.deviceModel.trim()) {
      setValidationError('Veuillez choisir ou saisir le modèle exact de l\'appareil.');
      return false;
    }
    if (!formData.deviceIssue.trim()) {
      setValidationError('Veuillez sélectionner ou décrire la panne constatée.');
      return false;
    }
    setValidationError('');
    return true;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    if (!formData.employeeId) {
      setValidationError('Veuillez sélectionner un technicien responsable.');
      return false;
    }
    if (!formData.price || Number(formData.price) < 0) {
      setValidationError('Veuillez indiquer le montant total convenu pour la réparation.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    setValidationError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId === 1) {
      setCurrentStep(1);
    } else if (stepId === 2) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (stepId === 3) {
      if (validateStep1() && validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    setLoading(true);
    
    try {
      const newInvoice = {
        customer: {
          id: crypto.randomUUID(),
          name: formData.customerName.trim().toUpperCase(),
          phone: formData.customerPhone.trim(),
          phone2: formData.customerPhone2.trim() || undefined,
          phone3: formData.customerPhone3.trim() || undefined,
          email: '',
          address: ''
        },
        device: {
          brand: formData.deviceBrand.trim().toUpperCase(),
          model: formData.deviceModel.trim().toUpperCase(),
          serialNumber: formData.deviceSerial.trim().toUpperCase(),
          issue: formData.deviceIssue.trim().toUpperCase(),
          password: formData.devicePassword.trim(),
          accessories: formData.deviceAccessories.trim().toUpperCase(),
        },
        employeeId: formData.employeeId,
        price: Number(formData.price) || 0,
        warrantyMonths: Number(formData.warrantyMonths) || 0,
        status: 'In Progress' as const,
        paymentStatus: formData.paymentStatus,
        paymentCollectorId: formData.paymentStatus === 'Payé' ? (formData.paymentCollectorId || undefined) : undefined,
        paymentCollectorName: formData.paymentStatus === 'Payé' ? (employees.find(e => e.id === formData.paymentCollectorId)?.name || activeEmployee?.name || user?.email?.split('@')[0] || 'Collaborateur') : undefined,
        paymentMethod: formData.paymentStatus === 'Payé' ? formData.paymentMethod : undefined,
        paidAt: formData.paymentStatus === 'Payé' ? new Date().toISOString() : undefined,
        notes: formData.notes.trim().toUpperCase()
      };
      
      const success = await addInvoice(newInvoice as any);

      if (success) {
        navigate('/');
      }
    } catch (err: any) {
      alert('Erreur: ' + (err?.message || 'Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = settings?.subscription_plan || 'Standard';
  const isLimitReached = currentPlan === 'Standard' && invoices.length >= 20;

  if (isLimitReached) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2.5rem', backgroundColor: '#fee2e2', borderRadius: '16px', border: '1px solid #f87171', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15)' }}>
        <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ color: '#991b1b', marginBottom: '1rem', fontWeight: 800 }}>Limite de facturation atteinte</h2>
        <p style={{ color: '#7f1d1d', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Vous avez atteint la limite de 20 factures de votre forfait Standard. Pour continuer à créer des fiches en illimité et développer votre boutique, passez au forfait Professionnel.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/abonnement')} style={{ padding: '12px 28px', fontSize: '1rem' }}>
          Débloquer le Forfait Professionnel
        </button>
      </div>
    );
  }

  const assignedEmployee = employees.find(e => e.id === formData.employeeId) || activeEmployee;
  const currentYear = new Date().getFullYear();
  const nextInvoiceEstimate = `Fac-${currentYear}-${String(invoices.length + 1).padStart(4, '0')}`;
  const formattedPrice = formData.price ? Number(formData.price).toLocaleString('fr-FR') : '0';

  const isStep1Done = Boolean(formData.customerName.trim() && formData.customerPhone.trim());
  const isStep2Done = Boolean(formData.deviceBrand.trim() && formData.deviceModel.trim() && formData.deviceIssue.trim());
  const isStep3Done = Boolean(formData.employeeId && formData.price);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* 🌟 EN-TÊTE PRINCIPAL */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.75rem',
        padding: '1.25rem 1.75rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate(-1)}
            style={{ padding: '8px 12px', borderRadius: '10px' }}
            title="Retour"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>
                PRISE EN CHARGE AVEC LISTES DÉROULANTES
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>• {currentShop?.name || 'GSM Solution'}</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0 0 0', color: '#0f172a' }}>
              Nouvelle Fiche & Facture de Réparation
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {assignedEmployee && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              color: '#166534',
              fontWeight: 600
            }}>
              <Wrench size={14} color="#16a34a" />
              <span>Opérateur : <strong>{assignedEmployee.name}</strong></span>
            </div>
          )}

          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleResetForm}
            style={{ fontSize: '0.82rem', padding: '6px 12px', color: '#64748b' }}
            title="Réinitialiser tous les champs"
          >
            <RotateCcw size={14} /> Recommencer
          </button>
        </div>
      </div>

      {/* 🧭 STEPPER INTERACTIF PROGRESSIF (ÉTAPES 1, 2, 3) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '1.75rem'
      }}>
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = (step.id === 1 && isStep1Done) || (step.id === 2 && isStep2Done) || (step.id === 3 && isStep3Done);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleStepClick(step.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '14px',
                backgroundColor: isActive ? '#ffffff' : '#f8fafc',
                border: isActive ? '2px solid #2563eb' : (isDone ? '1px solid #86efac' : '1px solid #e2e8f0'),
                boxShadow: isActive ? '0 6px 16px rgba(37, 99, 235, 0.12)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: isActive ? '#2563eb' : (isDone ? '#dcfce7' : '#e2e8f0'),
                color: isActive ? '#ffffff' : (isDone ? '#16a34a' : '#64748b'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.95rem',
                flexShrink: 0
              }}>
                {isDone && !isActive ? <Check size={18} /> : step.id}
              </div>

              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: isActive ? '#2563eb' : (isDone ? '#16a34a' : '#64748b'),
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  Étape {step.id} {isDone ? '✓ Validée' : ''}
                </div>
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: isActive ? '#0f172a' : '#334155',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {step.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ⚠️ MESSAGE D'ERREUR DE VALIDATION */}
      {validationError && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 🚀 FORMULAIRE STEP BY STEP + APERÇU LIVE */}
      <form onSubmit={handleSubmit} autoComplete="off" data-lpignore="true">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start'
        }}>
          
          {/* ===================== COLONNE GAUCHE (ÉTAPE ACTIVE) ===================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* -------------------- ÉTAPE 1 : INFORMATIONS CLIENT & CONTACTS -------------------- */}
            {currentStep === 1 && (
              <div className="card" style={{
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                margin: 0
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Étape 1 sur 3</span>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                      <User size={22} color="#2563eb" />
                      Informations Client & Contacts
                    </h3>
                  </div>

                  {recognizedCustomer && (
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={14} /> Client existant chargé
                    </span>
                  )}
                </div>

                {/* 📋 1. LISTE DÉROULANTE DES CLIENTS EXISTANTS */}
                <div style={{
                  backgroundColor: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#1e40af', margin: 0 }}>
                      <List size={17} color="#2563eb" />
                      Liste Déroulante des Clients :
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {regularCustomersList.length} client(s) répertorié(s)
                    </span>
                  </div>

                  <select 
                    className="form-control"
                    value={selectedCustomerOption}
                    onChange={handleSelectCustomerDropdown}
                    style={{
                      height: '46px',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      border: '2px solid #93c5fd',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="manual">➕ Nouveau Client / Saisir manuellement...</option>
                    <optgroup label="--- Clients Réguliers & Enregistrés ---">
                      {regularCustomersList.map((item, idx) => (
                        <option key={idx} value={item.customer.phone}>
                          👤 {item.customer.name} — 📱 {item.customer.phone} ({item.repairCount} réparation{item.repairCount > 1 ? 's' : ''})
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {recognizedCustomer && (
                    <div style={{
                      marginTop: '10px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      border: '1px solid #86efac',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem'
                    }}>
                      <span style={{ color: '#166534', fontWeight: 600 }}>
                        ⭐ Client régulier : <strong>{recognizedCustomer.repairCount}</strong> passage(s) en atelier
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleSelectCustomerDropdown({ target: { value: 'manual' } } as any)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Nouveau Client
                      </button>
                    </div>
                  )}
                </div>

                {/* Nom Client */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                    Nom Complet du Client <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      name="customerName" 
                      required 
                      className="form-control" 
                      placeholder="ex: Yao Koffi Paul"
                      style={{ paddingLeft: '42px', fontWeight: 600, fontSize: '0.95rem', height: '46px' }}
                      value={formData.customerName} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>

                {/* 3 Numéros de téléphone */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      <Phone size={16} color="#2563eb" />
                      Numéros de Téléphone du Client
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {/* Contact 1 */}
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>
                        📱 Contact 1 (Principal) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="tel" 
                        name="customerPhone" 
                        required 
                        className="form-control" 
                        placeholder="07 00 00 00 01" 
                        style={{ fontSize: '0.9rem', border: '1.5px solid #93c5fd', fontWeight: 600 }}
                        value={formData.customerPhone} 
                        onChange={handleChange} 
                      />
                    </div>

                    {/* Contact 2 */}
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>
                        💬 Contact 2 (WhatsApp)
                      </label>
                      <input 
                        type="tel" 
                        name="customerPhone2" 
                        className="form-control" 
                        placeholder="05 00 00 00 02" 
                        style={{ fontSize: '0.9rem' }}
                        value={formData.customerPhone2} 
                        onChange={handleChange} 
                      />
                    </div>

                    {/* Contact 3 */}
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
                        🚨 Contact 3 (Urgence)
                      </label>
                      <input 
                        type="tel" 
                        name="customerPhone3" 
                        className="form-control" 
                        placeholder="01 00 00 00 03" 
                        style={{ fontSize: '0.9rem' }}
                        value={formData.customerPhone3} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                </div>

                {/* Bouton de passage à l'étape suivante */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleNextStep}
                    style={{
                      padding: '12px 24px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    Continuer vers l'Appareil & Panne
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------- ÉTAPE 2 : DÉTAILS DE L'APPAREIL & PANNE -------------------- */}
            {currentStep === 2 && (
              <div className="card" style={{
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                margin: 0
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Étape 2 sur 3</span>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                      <Smartphone size={22} color="#2563eb" />
                      Détails de l'Appareil & Panne
                    </h3>
                  </div>

                  <span style={{ fontSize: '0.75rem', backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '10px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} /> Listes Déroulantes Actives
                  </span>
                </div>

                {/* Type d'équipement */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Type d'appareil
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {DEVICE_TYPES.map(t => {
                      const IconComponent = t.icon;
                      const isSelected = selectedDeviceType === t.label;
                      return (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setSelectedDeviceType(t.label)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 700 : 500,
                            backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                            color: isSelected ? '#1d4ed8' : '#64748b',
                            border: isSelected ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                            cursor: 'pointer'
                          }}
                        >
                          <IconComponent size={15} />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 📋 2. & 3. LISTES DÉROULANTES MARQUE ET MODÈLE */}
                <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                  {/* MARQUE */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Marque de l'appareil <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomBrandMode(!customBrandMode)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit3 size={12} /> {customBrandMode ? 'Choisir dans la liste' : 'Saisie libre'}
                      </button>
                    </div>

                    {customBrandMode ? (
                      <input 
                        type="text" 
                        name="deviceBrand" 
                        required 
                        className="form-control" 
                        placeholder="Tapez la marque (ex: Sony, Asus...)" 
                        style={{ fontWeight: 600, height: '46px' }}
                        value={formData.deviceBrand} 
                        onChange={handleChange} 
                        autoFocus
                      />
                    ) : (
                      <select
                        name="deviceBrand"
                        required
                        className="form-control"
                        value={formData.deviceBrand}
                        onChange={handleSelectBrandDropdown}
                        style={{ height: '46px', fontWeight: 600, border: '2px solid #bfdbfe', backgroundColor: '#ffffff', cursor: 'pointer' }}
                      >
                        <option value="" disabled>--- Sélectionnez une Marque ---</option>
                        {allBrands.map((b, idx) => (
                          <option key={idx} value={b}>{b}</option>
                        ))}
                        <option value="custom">➕ Autre marque (Saisie libre)...</option>
                      </select>
                    )}
                  </div>

                  {/* MODÈLE EXACT */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Modèle exact <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomModelMode(!customModelMode)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit3 size={12} /> {customModelMode ? 'Choisir dans la liste' : 'Saisie libre'}
                      </button>
                    </div>

                    {customModelMode ? (
                      <input 
                        type="text" 
                        name="deviceModel" 
                        required 
                        className="form-control" 
                        placeholder="Tapez le modèle (ex: iPhone 13, Spark 10...)" 
                        style={{ fontWeight: 600, height: '46px' }}
                        value={formData.deviceModel} 
                        onChange={handleChange} 
                        autoFocus
                      />
                    ) : (
                      <select
                        name="deviceModel"
                        required
                        className="form-control"
                        value={formData.deviceModel}
                        onChange={handleSelectModelDropdown}
                        style={{ height: '46px', fontWeight: 600, border: '2px solid #bfdbfe', backgroundColor: '#ffffff', cursor: 'pointer' }}
                      >
                        <option value="" disabled>
                          {formData.deviceBrand ? `--- Modèles ${formData.deviceBrand} ---` : '--- Choisissez d\'abord une marque ---'}
                        </option>
                        {allModelsForBrand.map((m, idx) => (
                          <option key={idx} value={m}>{m}</option>
                        ))}
                        <option value="custom">➕ Autre modèle (Saisie libre)...</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* 📋 4. LISTE DÉROULANTE PANNE & DIAGNOSTIC */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Description de la Panne / Diagnostic <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomIssueMode(!customIssueMode)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit3 size={12} /> {customIssueMode ? 'Choisir dans la liste' : 'Saisie libre'}
                    </button>
                  </div>

                  {customIssueMode ? (
                    <input 
                      type="text" 
                      name="deviceIssue" 
                      required 
                      className="form-control" 
                      placeholder="Décrivez la panne constatée..." 
                      style={{ fontWeight: 600, height: '46px' }}
                      value={formData.deviceIssue} 
                      onChange={handleChange} 
                      autoFocus
                    />
                  ) : (
                    <select
                      name="deviceIssue"
                      required
                      className="form-control"
                      value={formData.deviceIssue}
                      onChange={handleSelectIssueDropdown}
                      style={{ height: '46px', fontWeight: 600, border: '2px solid #bfdbfe', backgroundColor: '#ffffff', cursor: 'pointer' }}
                    >
                      <option value="" disabled>--- Sélectionnez la Panne / Diagnostic ---</option>
                      {allIssues.map((issue, idx) => {
                        const commonObj = commonIssues.find(i => i.name.toLowerCase() === issue.toLowerCase());
                        const priceTag = commonObj?.default_price ? ` (${commonObj.default_price.toLocaleString()} FCFA)` : '';
                        return (
                          <option key={idx} value={issue}>
                            🛠️ {issue}{priceTag}
                          </option>
                        );
                      })}
                      <option value="custom">➕ Autre panne (Saisie libre)...</option>
                    </select>
                  )}
                </div>

                {/* IMEI & Code PIN */}
                <div className="form-row" style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>
                      N° Série / IMEI (Optionnel)
                    </label>
                    <input 
                      type="text" 
                      name="deviceSerial" 
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                      className="form-control" 
                      placeholder="3568912..." 
                      value={formData.deviceSerial} 
                      onChange={handleChange} 
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>
                      Code PIN / Schéma de déverrouillage (Optionnel)
                    </label>
                    <input 
                      type="text" 
                      name="devicePassword" 
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      className="form-control" 
                      placeholder="ex: 1234, Schéma en L..." 
                      value={formData.devicePassword} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>

                {/* Accessoires laissés */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>
                    Accessoires laissés à l'atelier
                  </label>
                  <input 
                    type="text" 
                    name="deviceAccessories" 
                    className="form-control" 
                    placeholder="ex: Coque rouge, sans chargeur..." 
                    style={{ marginBottom: '8px' }}
                    value={formData.deviceAccessories} 
                    onChange={handleChange} 
                  />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {COMMON_ACCESSORIES.map(acc => {
                      const isIncluded = formData.deviceAccessories.includes(acc);
                      return (
                        <button
                          key={acc}
                          type="button"
                          onClick={() => handleToggleAccessory(acc)}
                          style={{
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: isIncluded ? '#f0fdf4' : '#f8fafc',
                            color: isIncluded ? '#166534' : '#64748b',
                            border: isIncluded ? '1px solid #86efac' : '1px solid #e2e8f0',
                            cursor: 'pointer'
                          }}
                        >
                          {isIncluded ? <Check size={11} /> : '+'} {acc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Boutons de navigation Étape 2 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handlePrevStep}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <ArrowLeft size={16} /> Étape précédente (Client)
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleNextStep}
                    style={{
                      padding: '12px 24px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    Continuer vers Facturation
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------- ÉTAPE 3 : ATTRIBUTION & FACTURATION -------------------- */}
            {currentStep === 3 && (
              <div className="card" style={{
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                margin: 0
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Étape 3 sur 3</span>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                      <DollarSign size={22} color="#2563eb" />
                      Attribution & Facturation
                    </h3>
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                  {/* Technicien */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                      Technicien Responsable <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select 
                      name="employeeId" 
                      required 
                      className="form-control" 
                      value={formData.employeeId} 
                      onChange={handleChange}
                      style={{ fontWeight: 600, border: '2px solid #bfdbfe', height: '46px', backgroundColor: '#ffffff', cursor: 'pointer' }}
                    >
                      <option value="" disabled>Sélectionner un technicien...</option>
                      {employees.map(emp => {
                        const isCurrent = activeEmployee?.id === emp.id;
                        return (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.role}) {isCurrent ? '⭐ (Vous - Connecté)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Prix convenu */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                      Montant total convenu (FCFA) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number" 
                        name="price" 
                        min="0" 
                        required 
                        className="form-control" 
                        placeholder="ex: 25000" 
                        style={{ fontSize: '1.2rem', fontWeight: 800, paddingRight: '65px', color: 'var(--primary-color)', height: '46px' }}
                        value={formData.price} 
                        onChange={handleChange} 
                      />
                      <span style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: '#64748b'
                      }}>
                        FCFA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Garantie Offerte */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px' }}>
                    Garantie offerte sur la réparation
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {WARRANTY_OPTIONS.map(opt => {
                      const isSelected = formData.warrantyMonths === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, warrantyMonths: opt.value }))}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 700 : 500,
                            backgroundColor: isSelected ? '#f0fdf4' : '#f8fafc',
                            color: isSelected ? '#15803d' : '#475569',
                            border: isSelected ? '1.5px solid #22c55e' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <ShieldCheck size={16} color={isSelected ? '#16a34a' : '#94a3b8'} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modalités de Règlement & Encaissement */}
                <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
                    💳 Modalités de Règlement & Encaissement
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: formData.paymentStatus === 'Payé' ? '1rem' : 0 }}>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentStatus: 'Impayé' }))}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: formData.paymentStatus === 'Impayé' ? 700 : 500,
                        backgroundColor: formData.paymentStatus === 'Impayé' ? '#fff7ed' : '#ffffff',
                        color: formData.paymentStatus === 'Impayé' ? '#c2410c' : '#475569',
                        border: formData.paymentStatus === 'Impayé' ? '2px solid #f97316' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      ⏳ À régler au retrait (Impayé)
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentStatus: 'Payé' }))}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: formData.paymentStatus === 'Payé' ? 700 : 500,
                        backgroundColor: formData.paymentStatus === 'Payé' ? '#f0fdf4' : '#ffffff',
                        color: formData.paymentStatus === 'Payé' ? '#15803d' : '#475569',
                        border: formData.paymentStatus === 'Payé' ? '2px solid #22c55e' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      ✅ Encaissé immédiatement (Payé)
                    </button>
                  </div>

                  {formData.paymentStatus === 'Payé' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                      {/* Encaisseur */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Encaisseur (Qui perçoit l'argent ?) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          name="paymentCollectorId"
                          value={formData.paymentCollectorId}
                          onChange={handleChange}
                          className="form-control"
                          style={{ padding: '8px 10px', fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} ({emp.role}) {activeEmployee?.id === emp.id ? '⭐ (Vous)' : ''}
                            </option>
                          ))}
                        </select>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          💡 Technicien, Caissier ou Gérant.
                        </span>
                      </div>

                      {/* Mode de règlement */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Mode de règlement
                        </label>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          className="form-control"
                          style={{ padding: '8px 10px', fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          <option value="Espèces">Espèces</option>
                          <option value="Wave">Wave</option>
                          <option value="Orange Money">Orange Money</option>
                          <option value="MTN Mobile Money">MTN Mobile Money</option>
                          <option value="Moov Money">Moov Money</option>
                          <option value="Carte Bancaire">Carte Bancaire</option>
                          <option value="Virement">Virement</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Observations atelier */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Observations & État physique initial (Rayures, traces de choc, etc.)
                  </label>
                  <textarea 
                    name="notes" 
                    className="form-control" 
                    style={{ minHeight: '70px', fontSize: '0.88rem' }} 
                    placeholder="ex: Écran intact mais châssis légèrement tordu, tiroir SIM manquant..." 
                    value={formData.notes} 
                    onChange={handleChange}
                  ></textarea>
                </div>

                {/* Boutons de navigation et soumission finale */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handlePrevStep}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <ArrowLeft size={16} /> Étape précédente (Appareil)
                  </button>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary" 
                    style={{
                      padding: '12px 28px',
                      fontSize: '1rem',
                      fontWeight: 800,
                      borderRadius: '12px',
                      boxShadow: '0 8px 16px rgba(79, 70, 229, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    {loading ? (
                      <span>Enregistrement...</span>
                    ) : (
                      <>
                        <Save size={18} />
                        Enregistrer & Créer la Facture
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ===================== COLONNE DROITE (RÉCAPITULATIF & TICKET EN DIRECT) ===================== */}
          <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* 📋 CARTE TICKET LIVE PREVIEW */}
            <div className="card" style={{
              padding: '1.75rem',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              border: '2px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
              margin: 0
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    APERÇU EN DIRECT
                  </span>
                  <h4 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {settings?.name || currentShop?.name || 'GSM SOLUTION'}
                  </h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{nextInvoiceEstimate}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date().toLocaleDateString('fr-FR')}</div>
                </div>
              </div>

              {/* Résumé Étape 1 : Client */}
              <div 
                onClick={() => setCurrentStep(1)}
                style={{
                  backgroundColor: currentStep === 1 ? '#eff6ff' : '#f8fafc',
                  border: currentStep === 1 ? '1.5px solid #93c5fd' : '1px solid #f1f5f9',
                  padding: '1rem',
                  borderRadius: '12px',
                  marginBottom: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Cliquer pour modifier l'étape 1"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: currentStep === 1 ? '#1d4ed8' : '#64748b', textTransform: 'uppercase' }}>
                    1. Client & Contacts
                  </span>
                  {isStep1Done && <CheckCircle2 size={13} color="#16a34a" />}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  {formData.customerName || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>Nom à renseigner...</span>}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                  {formData.customerPhone ? `📱 ${formData.customerPhone}` : <span style={{ color: '#cbd5e1', fontWeight: 400 }}>Contact principal...</span>}
                </div>
                {recognizedCustomer && (
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                    ⭐ Client régulier ({recognizedCustomer.repairCount} réparations)
                  </div>
                )}
              </div>

              {/* Résumé Étape 2 : Appareil & Panne */}
              <div 
                onClick={() => isStep1Done && setCurrentStep(2)}
                style={{
                  backgroundColor: currentStep === 2 ? '#eff6ff' : '#ffffff',
                  border: currentStep === 2 ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  cursor: isStep1Done ? 'pointer' : 'default',
                  transition: 'all 0.15s ease'
                }}
                title={isStep1Done ? "Cliquer pour modifier l'étape 2" : "Remplissez l'étape 1"}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: currentStep === 2 ? '#1d4ed8' : '#64748b', textTransform: 'uppercase' }}>
                    2. Appareil & Panne
                  </span>
                  {isStep2Done && <CheckCircle2 size={13} color="#16a34a" />}
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                  {formData.deviceBrand || formData.deviceModel ? (
                    `${formData.deviceBrand} ${formData.deviceModel}`
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>Marque & Modèle...</span>
                  )}
                </div>

                <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#475569', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                  <strong>Panne :</strong> {formData.deviceIssue || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>Diagnostic...</span>}
                </div>
              </div>

              {/* Résumé Étape 3 : Montant & Garantie */}
              <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: '#ffffff',
                padding: '1.25rem',
                borderRadius: '14px',
                marginBottom: '1.25rem',
                boxShadow: '0 8px 20px rgba(49, 46, 129, 0.25)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#c7d2fe', fontWeight: 600 }}>TOTAL FACTURÉ</span>
                  <span style={{
                    fontSize: '0.72rem',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    color: '#e0e7ff'
                  }}>
                    🛡️ Garantie : {formData.warrantyMonths === '0' ? 'Aucune' : `${formData.warrantyMonths} mois`}
                  </span>
                </div>
                
                <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                  {formattedPrice} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#a5b4fc' }}>FCFA</span>
                </div>
              </div>

              {/* BOUTONS D'ACTION RAPIDES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentStep < 3 ? (
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleNextStep}
                    style={{
                      width: '100%',
                      padding: '13px',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Passer à l'Étape Suivante
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary" 
                    style={{
                      width: '100%',
                      padding: '13px',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? <span>Enregistrement...</span> : (
                      <>
                        <Save size={18} />
                        Enregistrer & Finaliser
                      </>
                    )}
                  </button>
                )}

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => navigate(-1)}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Annuler
                </button>
              </div>

            </div>

          </div>

        </div>
      </form>

    </div>
  );
};

export default CreateInvoice;
