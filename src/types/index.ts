export interface Employee {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export type RepairStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface DeviceInfo {
  brand: string;
  model: string;
  serialNumber?: string;
  issue: string;
  accessories?: string;
  password?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: Customer;
  employeeId: string;
  device: DeviceInfo;
  price: number;
  warrantyMonths: number;
  status: RepairStatus;
  notes?: string;
}

export interface ShopSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  termsAndConditions: string;
}

export interface DeviceModel {
  id: string;
  brand: string;
  model: string;
  created_at?: string;
}

export interface CommonIssue {
  id: string;
  name: string;
  description?: string;
  default_price?: number;
  created_at?: string;
}

export interface AppState {
  invoices: Invoice[];
  employees: Employee[];
  settings: ShopSettings;
  deviceModels: DeviceModel[];
  commonIssues: CommonIssue[];
}
