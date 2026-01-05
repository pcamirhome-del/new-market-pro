
import React, { useState, useMemo } from 'react';
import { Invoice, Product, Company, Settings, InvoiceItem } from '../types';
import { ICONS } from '../constants';

interface OrderRequestsProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  products: Product[];
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  settings: Settings;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const OrderRequests: React.FC<OrderRequestsProps> = ({ invoices, setInvoices, products, companies, setCompanies, settings, setProducts }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [orderItems, setOrderItems] = useState<InvoiceItem[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const selectedCompany = useMemo(() => companies.find(c => c.id === selectedCompanyId), [selectedCompanyId, companies]);
  const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

  const handleAddCompany = () => {
    const nextCode = (100 + companies.length).toString();
    const newCo: Company = {
      id: nextCode,
      name: newCompanyName,
      code: nextCode,
      outstandingBalance: 0,
    };
    setCompanies([...companies, newCo]);
    setNewCompanyName('');
    setShowCompanyModal(false);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      productId: 'new-' + Math.random(),
      name: 'صنف جديد',
      barcode: '',
      quantity: 1,
      unitCost: 0,
      sellingPrice: 0,
      total: 0,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...orderItems];
    const item = { ...newItems[index], [field]: value };
    if (field === 'unitCost') {
      item.sellingPrice = Number(value) + (Number(value) * (settings.profitMargin / 100));
    }
    item.total = item.quantity * item.unitCost;
    newItems[index] = item;
    setOrderItems(newItems);
  };

  const handleSaveInvoice = () => {
    if (!selectedCompanyId) return;

    const invoiceNum = 1000 + invoices.length + 1;
    const now = new Date();
    const expiry = new Date(now);
    expiry.setDate(expiry.getDate() + 7);

    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: invoiceNum,
      companyId: selectedCompanyId,
      companyName: selectedCompany?.name || '',
      items: orderItems,
      totalAmount,
      paidAmount,
      remainingBalance: totalAmount - paidAmount,
      status: totalAmount - paidAmount === 0 ? 'FULLY_PAID' : 'PARTIAL',
      type: 'PURCHASE',
      orderStatus: 'PENDING',
      createdAt: now.toISOString(),
      expiryDate: expiry.toISOString(),
    };

    setInvoices([newInvoice, ...invoices]);
    setIsCreating(false);
    setOrderItems([]);
    setPaidAmount(0);
  };

  const shareWhatsApp = (invoice: Invoice) => {
    const text = `فاتورة رقم: ${invoice.invoiceNumber}\nالشركة: ${invoice.companyName}\nالإجمالي: ${invoice.totalAmount} ج.م\nالرصيد المتبقي: ${invoice.remainingBalance} ج.م`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleStatus = (id: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const newStatus = inv.orderStatus === 'PENDING' ? 'RECEIVED' : 'PENDING';
        // If received, add to inventory
        if (newStatus === 'RECEIVED') {
          inv.items.forEach(item => {
            const newProd: Product = {
              id: item.productId,
              name: item.name,
              barcode: item.barcode || 'N/A',
              companyId: inv.companyId,
              unitCost: item.unitCost,
              sellingPrice: item.sellingPrice,
              stock: item.quantity,
              createdAt: new Date().toISOString()
            };
            setProducts(prevP => [...prevP, newProd]);
          });
        }
        return { ...inv, orderStatus: newStatus };
      }
      return inv;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">طلبات الفواتير والمشتريات</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700"
        >
          <ICONS.Plus /> إنشاء فاتورة جديدة
        </button>
      </div>

      <div className="grid gap-4">
        {invoices.map(inv => (
          <div key={inv.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {inv.invoiceNumber}
              </div>
              <div>
                <h3 className="font-bold text-lg">{inv.companyName}</h3>
                <p className="text-sm text-gray-500">بتاريخ: {new Date(inv.createdAt).toLocaleDateString('ar-EG')}</p>
                <p className="text-xs text-red-500 mt-1">تنتهي في: {new Date(inv.expiryDate).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-left">
                <p className="text-xl font-bold text-emerald-600">{inv.totalAmount} ج.م</p>
                <p className="text-sm text-gray-400">الباقي: {inv.remainingBalance}</p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewingInvoice(inv)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="عرض وطباعة"
                >
                  <ICONS.Print />
                </button>
                <button 
                  onClick={() => shareWhatsApp(inv)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="مشاركة واتساب"
                >
                  <ICONS.WhatsApp />
                </button>
                <button 
                  onClick={() => toggleStatus(inv.id)}
                  className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
                    inv.orderStatus === 'RECEIVED' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {inv.orderStatus === 'RECEIVED' ? 'تم الاستلام' : 'قيد الانتظار'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {invoices.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">لا توجد فواتير حالياً، ابدأ بإنشاء واحدة!</p>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">فاتورة مشتريات جديدة</h3>
                <p className="text-gray-500 mt-1">رقم الفاتورة القادم: {1000 + invoices.length + 1}</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold mb-2">اختر الشركة</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                  >
                    <option value="">-- اختر شركة --</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button 
                    onClick={() => setShowCompanyModal(true)}
                    className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"
                  >
                    <ICONS.Plus />
                  </button>
                </div>
                {selectedCompany && (
                   <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      كود الشركة: <span className="font-bold">{selectedCompany.code}</span>
                   </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">أصناف الفاتورة</h4>
                <button onClick={handleAddItem} className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:underline">
                  <ICONS.Plus /> أضف صنف
                </button>
              </div>
              <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="py-2 px-2">اسم الصنف</th>
                    <th className="py-2 px-2">الباركود</th>
                    <th className="py-2 px-2">الكمية</th>
                    <th className="py-2 px-2">سعر التكلفة</th>
                    <th className="py-2 px-2">سعر البيع</th>
                    <th className="py-2 px-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-2">
                        <input type="text" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} className="w-full bg-transparent border-b border-gray-200 outline-none" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="text" value={item.barcode} onChange={(e) => updateItem(idx, 'barcode', e.target.value)} className="w-full bg-transparent border-b border-gray-200 outline-none" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} className="w-20 bg-transparent border-b border-gray-200 outline-none" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" value={item.unitCost} onChange={(e) => updateItem(idx, 'unitCost', Number(e.target.value))} className="w-24 bg-transparent border-b border-gray-200 outline-none font-bold" />
                      </td>
                      <td className="py-2 px-2 text-emerald-600 font-bold">{item.sellingPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 font-bold">{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gray-50 p-6 rounded-2xl">
              <div className="space-y-4 w-full md:w-64">
                <div>
                  <label className="block text-sm font-bold mb-1">المبلغ المدفوع</label>
                  <input 
                    type="number" 
                    value={paidAmount} 
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border outline-none" 
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">المبلغ المتبقي</p>
                  <p className="text-xl font-bold text-red-600">{(totalAmount - paidAmount).toFixed(2)} ج.م</p>
                </div>
              </div>
              <div className="text-left w-full md:w-auto">
                <p className="text-gray-500 font-medium">إجمالي قيمة الفاتورة</p>
                <p className="text-4xl font-black text-emerald-700">{totalAmount.toFixed(2)} ج.م</p>
                <button 
                  onClick={handleSaveInvoice}
                  disabled={!selectedCompanyId || orderItems.length === 0}
                  className="mt-4 bg-emerald-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  حفظ الفاتورة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Viewing/Printing Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative shadow-2xl">
            <button onClick={() => setViewingInvoice(null)} className="absolute top-4 right-4 text-gray-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div id="print-area" className="p-4 border-2 border-emerald-500 rounded-lg">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div>
                  <h2 className="text-3xl font-black text-emerald-600">{settings.appName}</h2>
                  <p className="text-gray-500">للمواد الغذائية والمستلزمات</p>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">فاتورة مشتريات</h3>
                  <p className="font-mono"># {viewingInvoice.invoiceNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p><span className="font-bold">اسم الشركة:</span> {viewingInvoice.companyName}</p>
                  <p><span className="font-bold">كود الشركة:</span> {viewingInvoice.companyId}</p>
                </div>
                <div className="text-left">
                  <p><span className="font-bold">تاريخ الطلب:</span> {new Date(viewingInvoice.createdAt).toLocaleDateString('ar-EG')}</p>
                  <p className="text-red-600"><span className="font-bold">تاريخ الانتهاء:</span> {new Date(viewingInvoice.expiryDate).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              <table className="w-full text-right mb-6 border-collapse">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-800">
                    <th className="p-2 border">الصنف</th>
                    <th className="p-2 border">الباركود</th>
                    <th className="p-2 border">الكمية</th>
                    <th className="p-2 border">السعر</th>
                    <th className="p-2 border">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{item.name}</td>
                      <td className="p-2 border font-mono">{item.barcode}</td>
                      <td className="p-2 border">{item.quantity}</td>
                      <td className="p-2 border">{item.unitCost}</td>
                      <td className="p-2 border font-bold">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center pt-4 border-t border-emerald-500">
                <div className="space-y-1">
                  <p className="font-bold">الإجمالي: {viewingInvoice.totalAmount} ج.م</p>
                  <p className="text-sm">المدفوع: {viewingInvoice.paidAmount} ج.م</p>
                  <p className="text-sm text-red-600">المتبقي: {viewingInvoice.remainingBalance} ج.م</p>
                </div>
                <div className="text-center pt-8 border-t border-gray-200 mt-10 min-w-[150px]">
                   <p className="text-xs text-gray-400">امضاء المدير المسئول</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => window.print()} 
                className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-emerald-700"
              >
                طباعة الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">إضافة شركة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">اسم الشركة</label>
                <input 
                  type="text" 
                  value={newCompanyName} 
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg" 
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCompanyModal(false)} className="flex-1 py-2 border rounded-lg">إلغاء</button>
                <button onClick={handleAddCompany} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg">إضافة</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderRequests;
