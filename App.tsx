
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Permission, Product, Company, Invoice, Settings, Transaction } from './types';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot 
} from './services/firebase';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // دالة موحدة لحفظ البيانات في Firestore مع معالجة الأخطاء
  const saveData = async (collectionName: string, docId: string, data: any) => {
    try {
      await setDoc(doc(db, collectionName, docId), data);
    } catch (err: any) {
      console.error(`خطأ أثناء الحفظ في ${collectionName}:`, err);
      setError("فشل الاتصال بالسحابة. سيتم حفظ البيانات محلياً والمزامنة لاحقاً.");
      setTimeout(() => setError(null), 5000);
    }
  };

  // جلب البيانات من Firestore بشكل حي (Real-time) وغير متزامن
  useEffect(() => {
    setLoading(true);
    
    // إعداد المستمعين (Listeners) لكل مجموعة بيانات
    const unsubscribers: (() => void)[] = [];

    try {
      // 1. مراقبة الإعدادات
      unsubscribers.push(onSnapshot(doc(db, "config", "settings"), (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data() as Settings);
        } else {
          // إعدادات افتراضية
          saveData("config", "settings", settings);
        }
      }, (err) => console.error("Settings Load Error:", err)));

      // 2. مراقبة المستخدمين
      unsubscribers.push(onSnapshot(collection(db, "users"), (snapshot) => {
        const usersList = snapshot.docs.map(d => d.data() as User);
        if (usersList.length === 0) {
          const admin: User = {
            id: '1',
            username: 'admin',
            password: 'admin',
            role: UserRole.ADMIN,
            permissions: ['DASHBOARD', 'INVENTORY', 'ORDER_REQUESTS', 'SALES_ANALYTICS', 'BARCODE_PRINT', 'ADMIN_SETTINGS']
          };
          saveData("users", "1", admin);
          setUsers([admin]);
        } else {
          setUsers(usersList);
        }
      }, (err) => console.error("Users Load Error:", err)));

      // 3. مراقبة المنتجات
      unsubscribers.push(onSnapshot(collection(db, "products"), (snapshot) => {
        setProducts(snapshot.docs.map(d => d.data() as Product));
      }));

      // 4. مراقبة الشركات
      unsubscribers.push(onSnapshot(collection(db, "companies"), (snapshot) => {
        setCompanies(snapshot.docs.map(d => d.data() as Company));
      }));

      // 5. مراقبة الفواتير
      unsubscribers.push(onSnapshot(collection(db, "invoices"), (snapshot) => {
        setInvoices(snapshot.docs.map(d => d.data() as Invoice).sort((a, b) => b.invoiceNumber - a.invoiceNumber));
      }));

      // 6. مراقبة المعاملات
      unsubscribers.push(onSnapshot(collection(db, "transactions"), (snapshot) => {
        setTransactions(snapshot.docs.map(d => d.data() as Transaction));
      }));

      setLoading(false);
    } catch (err) {
      console.error("Critical Firebase Load Error:", err);
      setError("حدث خطأ حرج أثناء الاتصال بـ Firebase.");
      setLoading(false);
    }

    return () => unsubscribers.forEach(unsub => unsub());
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-700 font-bold animate-pulse font-tajawal">جاري تحميل البيانات وتفعيل وضع العمل دون إنترنت...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} settings={settings} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return <Dashboard products={products} invoices={invoices} transactions={transactions} currentUser={currentUser} settings={settings} />;
      case 'INVENTORY':
        return (
          <Inventory 
            products={products} 
            setProducts={(prods) => {
              if (typeof prods === 'function') {
                const updated = prods(products);
                updated.forEach(p => saveData("products", p.id, p));
              }
            }} 
            companies={companies} 
            setCompanies={setCompanies} 
            settings={settings} 
          />
        );
      case 'ORDER_REQUESTS':
        return (
          <OrderRequests 
            invoices={invoices} 
            setInvoices={(invs) => {
              if (typeof invs === 'function') {
                const updated = invs(invoices);
                updated.forEach(i => saveData("invoices", i.id, i));
              }
            }}
            products={products} 
            companies={companies} 
            setCompanies={(cos) => {
              if (typeof cos === 'function') {
                const updated = cos(companies);
                updated.forEach(c => saveData("companies", c.id, c));
              }
            }}
            settings={settings} 
            setProducts={(prods) => {
              if (typeof prods === 'function') {
                const updated = prods(products);
                updated.forEach(p => saveData("products", p.id, p));
              }
            }}
          />
        );
      case 'SALES_ANALYTICS':
        return <SalesAnalytics transactions={transactions} invoices={invoices} />;
      case 'BARCODE_PRINT':
        return <BarcodePrint products={products} companies={companies} settings={settings} />;
      case 'ADMIN_SETTINGS':
        return (
          <AdminSettings 
            settings={settings} 
            setSettings={(s) => {
              setSettings(s);
              saveData("config", "settings", s);
            }} 
            users={users} 
            setUsers={(usrs) => {
              if (typeof usrs === 'function') {
                const updated = usrs(users);
                updated.forEach(u => saveData("users", u.id, u));
              }
            }}
            currentUser={currentUser} 
          />
        );
      default:
        return <Dashboard products={products} invoices={invoices} transactions={transactions} currentUser={currentUser} settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-pulse">
          {error}
        </div>
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

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

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
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
              {currentUser.username} ({currentUser.role === UserRole.ADMIN ? 'مدير' : 'موظف'})
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {currentUser.username[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {renderContent()}
        </main>
      </div>

      {showWelcome && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-xl shadow-2xl z-50 animate-bounce">
          مرحباً بك، {currentUser.username}!
        </div>
      )}
    </div>
  );
};

export default App;
