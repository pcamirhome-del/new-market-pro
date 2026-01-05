
import React, { useState } from 'react';
import { Product, Company, Settings } from '../types';
import { ICONS } from '../constants';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  settings: Settings;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, companies, setCompanies, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // New Product Form State
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '',
    barcode: '',
    companyId: '',
    unitCost: 0,
    sellingPrice: 0,
    stock: 0,
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProd.name || '',
      barcode: newProd.barcode || '',
      companyId: newProd.companyId || '',
      unitCost: Number(newProd.unitCost) || 0,
      sellingPrice: Number(newProd.sellingPrice) || 0,
      stock: Number(newProd.stock) || 0,
      createdAt: new Date().toISOString(),
    };
    setProducts([...products, product]);
    setIsAddingProduct(false);
    setNewProd({ name: '', barcode: '', companyId: '', unitCost: 0, sellingPrice: 0, stock: 0 });
  };

  const calculateSellingPrice = (cost: number) => {
    return cost + (cost * (settings.profitMargin / 100));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  );

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const mockBarcode = "622123456789";
      const existing = products.find(p => p.barcode === mockBarcode);
      if (existing) {
        alert(`تم العثور على المنتج: ${existing.name}\nالكمية الحالية: ${existing.stock}`);
      } else {
        setNewProd({ ...newProd, barcode: mockBarcode });
        setIsAddingProduct(true);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">المخزون والمنتجات</h2>
        <div className="flex gap-2">
          <button 
            onClick={simulateScan}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            فتح الكاميرا للباركود
          </button>
          <button 
            onClick={() => setIsAddingProduct(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ICONS.Plus />
            إضافة صنف
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="البحث بالاسم أو الباركود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-4 font-bold">المنتج</th>
              <th className="px-6 py-4 font-bold">الباركود</th>
              <th className="px-6 py-4 font-bold">سعر التكلفة</th>
              <th className="px-6 py-4 font-bold">سعر البيع</th>
              <th className="px-6 py-4 font-bold">المخزون</th>
              <th className="px-6 py-4 font-bold">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((prod) => (
              <tr key={prod.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{prod.name}</td>
                <td className="px-6 py-4 font-mono">{prod.barcode}</td>
                <td className="px-6 py-4">{prod.unitCost} ج.م</td>
                <td className="px-6 py-4 text-emerald-600 font-bold">{prod.sellingPrice} ج.م</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${prod.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {prod.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 ml-2">تعديل</button>
                  <button className="text-red-600 hover:text-red-800">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-10 text-gray-500">لا توجد منتجات مطابقة للبحث</div>
        )}
      </div>

      {isAddingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">إضافة منتج جديد</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">اسم المنتج</label>
                  <input 
                    type="text" 
                    required
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الباركود</label>
                  <input 
                    type="text" 
                    required
                    value={newProd.barcode}
                    onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الشركة الموردة</label>
                  <select 
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newProd.companyId}
                    onChange={(e) => setNewProd({ ...newProd, companyId: e.target.value })}
                  >
                    <option value="">اختر الشركة</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">سعر التكلفة</label>
                  <input 
                    type="number" 
                    required
                    value={newProd.unitCost}
                    onChange={(e) => {
                      const cost = Number(e.target.value);
                      setNewProd({ 
                        ...newProd, 
                        unitCost: cost, 
                        sellingPrice: calculateSellingPrice(cost)
                      });
                    }}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">سعر البيع (تلقائي)</label>
                  <input 
                    type="number" 
                    readOnly
                    value={newProd.sellingPrice}
                    className="w-full px-4 py-2 rounded-lg border bg-gray-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الكمية الافتتاحية</label>
                  <input 
                    type="number" 
                    required
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="px-6 py-2 rounded-lg border hover:bg-gray-50">إلغاء</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">حفظ المنتج</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-64 h-64 border-2 border-emerald-500 rounded-2xl relative overflow-hidden mb-4 animate-pulse">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500"></div>
            </div>
            <p className="text-lg font-bold">جاري البحث عن باركود...</p>
            <button onClick={() => setIsScanning(false)} className="mt-4 px-6 py-2 bg-white text-black rounded-lg">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
