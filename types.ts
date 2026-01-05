
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export type Permission = 
  | 'DASHBOARD'
  | 'INVENTORY'
  | 'ORDER_REQUESTS'
  | 'SALES_ANALYTICS'
  | 'BARCODE_PRINT'
  | 'ADMIN_SETTINGS';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  permissions: Permission[];
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  companyId: string;
  unitCost: number;
  sellingPrice: number;
  stock: number;
  category?: string;
  unit?: string;
  description?: string;
  createdAt: string;
}

export interface Company {
  id: string; // Starts at 100
  name: string;
  code: string;
  outstandingBalance: number;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  barcode: string;
  quantity: number;
  unitCost: number;
  sellingPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // Starts at 1000
  invoiceNumber: number;
  companyId: string;
  companyName: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: 'FULLY_PAID' | 'PARTIAL';
  type: 'PURCHASE' | 'ORDER';
  orderStatus?: 'PENDING' | 'RECEIVED';
  createdAt: string;
  expiryDate: string; // Request date + 7 days
}

export interface Settings {
  appName: string;
  profitMargin: number; // e.g., 15 for 15%
}

export interface Transaction {
  id: string;
  amount: number;
  timestamp: string;
  type: 'SALE' | 'PURCHASE';
}
