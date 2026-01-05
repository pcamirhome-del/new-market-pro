
import React, { useState } from 'react';
import { Product, Company, Settings } from '../types';
import { ICONS } from '../constants';

interface BarcodePrintProps {
  products: Product[];
  companies: Company[];
  settings: Settings;
}

const BarcodePrint: React.FC<BarcodePrintProps> = ({ products, companies, settings }) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [count, setCount] = useState(1);
  const [printQueue, setPrintQueue] = useState<Product[]>([]);

  const handleAddToQueue = () => {
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod) return;
    const items = Array(count).fill(prod);
    setPrintQueue([...printQueue, ...items]);
    setCount(1);
    setSelectedProduct('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <h2 className="text-2xl font-bold">طباعة الباركود والملصقات</h2>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold mb-1">اختر الصنف</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">-- اختر صنف --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.barcode}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">العدد</label>
            <input 
              type="number" 
              min="1" 
              value={count} 
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleAddToQueue}
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
            >
              إضافة للطابور
            </button>
            <button 
              onClick={() => setPrintQueue([])}
              className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              <ICONS.Delete />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">معاينة الطابور ({printQueue.length} ملصق)</h3>
            <button 
              onClick={handlePrint}
              disabled={printQueue.length === 0}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              بدء الطباعة
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {printQueue.map((item, idx) => (
              <div key={idx} className="border p-2 text-center text-[10px] relative">
                <p className="font-bold truncate text-[12px]">{settings.appName}</p>
                <p className="truncate">{item.name}</p>
                <p className="text-sm font-black text-emerald-700">{item.sellingPrice} ج.م</p>
                <p className="font-mono bg-gray-100 mt-1">{item.barcode}</p>
                <p className="text-[8px] text-gray-400 mt-1">{new Date().toLocaleDateString('ar-EG')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print View Only */}
      <div className="hidden print-only print:block w-full text-right p-4">
        <div className="grid grid-cols-5 gap-1">
          {printQueue.map((item, idx) => (
            <div key={idx} className="border border-black p-2 h-24 flex flex-col items-center justify-between">
              <p className="text-[12px] font-black">{settings.appName}</p>
              <p className="text-[10px] font-bold text-center leading-tight h-8 overflow-hidden">{item.name}</p>
              <div className="w-full flex justify-between items-end px-1">
                <p className="text-[11px] font-bold">{item.sellingPrice} ج.م</p>
                <p className="text-[7px] text-gray-500 font-mono">{new Date().toLocaleDateString('ar-EG')}</p>
              </div>
              <p className="text-[9px] font-mono border-t border-black w-full text-center mt-1">{item.barcode}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarcodePrint;
