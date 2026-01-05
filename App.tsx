
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { User, UserRole, Permission, Product, Company, Invoice, Settings, Transaction } from './types';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import OrderRequests from './pages/OrderRequests';
import SalesAnalytics from './pages/SalesAnalytics';
import BarcodePrint from './pages/BarcodePrint';
import AdminSettings from './pages/AdminSettings';
import Login from './pages/Login';
import Sidebar from './components/Layout/Sidebar';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<Settings>({
    appName: 'سوبر ماركت برو',
    profitMargin: 15,
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<Permission>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Initialize Data
  useEffect(() => {
    // Mock initial users
    const defaultAdmin: User = {
      id: '1',
      username: 'admin',
      password: 'admin',
      role: UserRole.ADMIN,
      permissions: ['DASHBOARD', 'INVENTORY', 'ORDER_REQUESTS', 'SALES_ANALYTICS', 'BARCODE_PRINT', 'ADMIN_SETTINGS'],
    };
    setUsers([defaultAdmin]);

    // Mock initial companies
    setCompanies([
      { id: '100', name: 'شركة المواد الغذائية المتحدة', code: '100', outstandingBalance: 0 },
      { id: '101', name: 'مجموعة المشروبات العالمية', code: '101', outstandingBalance: 500 },
    ]);
  }, []);

  // Sidebar outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 3000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('DASHBOARD');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} settings={settings} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return <Dashboard products={products} invoices={invoices} transactions={transactions} currentUser={currentUser} settings={settings} />;
      case 'INVENTORY':
        return <Inventory products={products} setProducts={setProducts} companies={companies} setCompanies={setCompanies} settings={settings} />;
      case 'ORDER_REQUESTS':
        return <OrderRequests invoices={invoices} setInvoices={setInvoices} products={products} companies={companies} setCompanies={setCompanies} settings={settings} setProducts={setProducts} />;
      case 'SALES_ANALYTICS':
        return <SalesAnalytics transactions={transactions} invoices={invoices} />;
      case 'BARCODE_PRINT':
        return <BarcodePrint products={products} companies={companies} settings={settings} />;
      case 'ADMIN_SETTINGS':
        return <AdminSettings settings={settings} setSettings={setSettings} users={users} setUsers={setUsers} currentUser={currentUser} />;
      default:
        return <Dashboard products={products} invoices={invoices} transactions={transactions} currentUser={currentUser} settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed lg:static inset-y-0 right-0 z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 w-64 bg-white shadow-xl`}
      >
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
          permissions={currentUser.permissions} 
          settings={settings}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-emerald-600">{settings.appName}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700 hidden sm:block">
              {currentUser.username} (مستخدم)
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {currentUser.username[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {renderContent()}
        </main>
      </div>

      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-xl shadow-2xl z-50 animate-bounce">
          مرحباً بك، {currentUser.username}!
        </div>
      )}
    </div>
  );
};

export default App;
