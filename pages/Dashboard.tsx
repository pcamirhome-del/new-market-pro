
import React, { useState, useEffect } from 'react';
import { Product, Invoice, Transaction, User, Settings } from '../types';
import { ICONS } from '../constants';

interface DashboardProps {
  products: Product[];
  invoices: Invoice[];
  transactions: Transaction[];
  currentUser: User;
  settings: Settings;
}

const Dashboard: React.FC<DashboardProps> = ({ products, invoices, transactions, currentUser, settings }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dailySales = transactions
    .filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString() && t.type === 'SALE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const stats = [
    { label: 'مبيعات اليوم', value: `${dailySales} ج.م`, icon: ICONS.Chart, color: 'bg-blue-500' },
    { label: 'إجمالي المنتجات', value: products.length, icon: ICONS.Inventory, color: 'bg-emerald-500' },
    { label: 'طلبات معلقة', value: invoices.filter(i => i.orderStatus === 'PENDING').length, icon: ICONS.Invoices, color: 'bg-amber-500' },
    { label: 'الشركات المسجلة', value: 2, icon: ICONS.Home, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Clock and Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مرحباً، {currentUser.username}</h2>
          <p className="text-gray-500 font-medium">إليك نظرة سريعة على أداء المتجر اليوم</p>
        </div>
        <div className="text-right">
          <div className="text-gray-600 font-bold">
            {time.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="text-3xl font-black text-emerald-600 tabular-nums">
            {time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <stat.icon />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions or Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">آخر الفواتير</h3>
          <div className="space-y-4">
            {invoices.slice(0, 5).map((inv, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-bold">#{inv.invoiceNumber}</p>
                  <p className="text-sm text-gray-500">{inv.companyName}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-emerald-600">{inv.totalAmount} ج.م</p>
                  <p className={`text-xs px-2 py-1 rounded-full inline-block ${inv.status === 'FULLY_PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inv.status === 'FULLY_PAID' ? 'مدفوعة بالكامل' : 'دين/أقساط'}
                  </p>
                </div>
              </div>
            ))}
            {invoices.length === 0 && <p className="text-gray-400 text-center py-4">لا توجد فواتير مسجلة</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">تنبيهات المخزون</h3>
          <div className="space-y-4">
            {products.filter(p => p.stock < 10).map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <p className="font-medium">{prod.name}</p>
                </div>
                <p className="text-red-600 font-bold">الكمية: {prod.stock}</p>
              </div>
            ))}
            {products.filter(p => p.stock < 10).length === 0 && (
              <p className="text-emerald-600 text-center py-4">جميع الأصناف متوفرة بكميات كافية</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
