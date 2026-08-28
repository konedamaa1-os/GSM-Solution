export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug?: string;
  custom_domain?: string;
  logo_url?: string;
  brand_color?: string;
  created_at?: string;
}

export interface Employee {
  id: string;
  shop_id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  active?: boolean;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  phone2?: string;
  phone3?: string;
  email?: string;
  address?: string;
}

export type RepairStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Payé' | 'Partiel' | 'Impayé';

export interface DeviceInfo {
  shop_id?: string;
  brand: string;
  model: string;
  serialNumber?: string;
  issue: string;
  accessories?: string;
  password?: string;
}

export interface Invoice {
  id: string;
  shop_id: string;
  invoiceNumber: string;
  date: string;
  customer: Customer;
  employeeId: string;
  device: DeviceInfo;
  price: number;
  advancePayment?: number;
  warrantyMonths: number;
  status: RepairStatus;
  paymentStatus: PaymentStatus;
  paymentCollectorId?: string;
  paymentCollectorName?: string;
  paymentMethod?: string;
  paidAt?: string;
  balancePaymentCollectorId?: string;
  balancePaymentCollectorName?: string;
  balancePaymentMethod?: string;
  balancePaidAt?: string;
  notes?: string;
}

export type SubscriptionPlan = 'Standard' | 'Professionnelle';

export interface ShopSettings {
  id?: string;
  shop_id: string;
  name: string;
  address: string;
  phone: string;
  phone2?: string;
  phone3?: string;
  email: string;
  termsAndConditions: string;
  subscription_plan?: SubscriptionPlan;
  subscription_end_date?: string;
  subscription_status?: 'active' | 'expired';
}

export interface DeviceModel {
  id: string;
  shop_id: string;
  brand: string;
  model: string;
  created_at?: string;
}

export interface CommonIssue {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  default_price?: number;
  created_at?: string;
}

export interface AppState {
  currentShop: Shop | null;
  invoices: Invoice[];
  employees: Employee[];
  settings: ShopSettings | null;
  deviceModels: DeviceModel[];
  commonIssues: CommonIssue[];
}
