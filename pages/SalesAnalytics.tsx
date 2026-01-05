
import React, { useState } from 'react';
import { Transaction, Invoice } from '../types';
import { ICONS } from '../constants';

interface SalesAnalyticsProps {
  transactions: Transaction[];
  invoices: Invoice[];
}

const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ transactions, invoices }) => {
  const [filter, setFilter] = useState<'DAY' | 'MONTH' | 'YEAR' | 'TOTAL'>('DAY');
  
  // Daily Calculation Reset Simulation
  // We filter by today's date
  const today = new Date().toDateString();
  
  const filteredData = transactions.filter(t => {
    const tDate = new Date(t.timestamp);
    if (filter === 'DAY') return tDate.toDateString() === today;
    if (filter === 'MONTH') return tDate.getMonth() === new Date().getMonth() && tDate.getFullYear() === new Date().getFullYear();
    if (filter === 'YEAR') return tDate.getFullYear() === new Date().getFullYear();
    return true; // TOTAL
  });

  const totalSales = filteredData.filter(t => t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0);
  const totalPurchases = filteredData.filter(t => t.type === 'PURCHASE').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">المبيعات والتحليلات</h2>
        <div className="flex bg-white rounded-lg border shadow-sm p-1">
          <button 
            onClick={() => setFilter('DAY')}
            className={`px-4 py-1 rounded-md text-sm font-bold ${filter === 'DAY' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >اليوم</button>
          <button 
            onClick={() => setFilter('MONTH')}
            className={`px-4 py-1 rounded-md text-sm font-bold ${filter === 'MONTH' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >الشهر</button>
          <button 
            onClick={() => setFilter('YEAR')}
            className={`px-4 py-1 rounded-md text-sm font-bold ${filter === 'YEAR' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >السنة</button>
          <button 
            onClick={() => setFilter('TOTAL')}
            className={`px-4 py-1 rounded-md text-sm font-bold ${filter === 'TOTAL' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >الإجمالي</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold mb-1">إجمالي المبيعات</p>
            <p className="text-4xl font-black text-emerald-700">{totalSales.toFixed(2)} ج.م</p>
          </div>
          <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
             <ICONS.Chart />
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold mb-1">قيمة المشتريات</p>
            <p className="text-4xl font-black text-indigo-700">{totalPurchases.toFixed(2)} ج.م</p>
          </div>
          <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600">
             <ICONS.Invoices />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-bold">سجل الحركات المالية</h3>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-bold">يتم تصفير مبيعات اليوم تلقائياً عند منتصف الليل</span>
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="px-6 py-4">الوقت</th>
              <th className="px-6 py-4">النوع</th>
              <th className="px-6 py-4">القيمة</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(t => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(t.timestamp).toLocaleTimeString('ar-EG')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.type === 'SALE' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {t.type === 'SALE' ? 'بيع منتجات' : 'مشتريات/توريد'}
                  </span>
                </td>
                <td className={`px-6 py-4 font-bold ${t.type === 'SALE' ? 'text-emerald-600' : 'text-indigo-600'}`}>{t.amount} ج.م</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">لا توجد حركات مسجلة للفترة المختارة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesAnalytics;
