
import React from 'react';
import { Permission, Settings } from '../../types';
import { ICONS } from '../../constants';

interface SidebarProps {
  activeTab: Permission;
  setActiveTab: (tab: Permission) => void;
  onLogout: () => void;
  permissions: Permission[];
  settings: Settings;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, permissions, settings, onClose }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'لوحة التحكم', icon: ICONS.Home },
    { id: 'INVENTORY', label: 'المخزون', icon: ICONS.Inventory },
    { id: 'ORDER_REQUESTS', label: 'طلبات الفواتير', icon: ICONS.Invoices },
    { id: 'SALES_ANALYTICS', label: 'المبيعات والتحليلات', icon: ICONS.Chart },
    { id: 'BARCODE_PRINT', label: 'طباعة الباركود', icon: ICONS.Barcode },
    { id: 'ADMIN_SETTINGS', label: 'الإعدادات', icon: ICONS.Settings },
  ];

  const allowedItems = menuItems.filter(item => permissions.includes(item.id as Permission));

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold text-emerald-700 truncate">{settings.appName}</h1>
        <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        {allowedItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as Permission);
              onClose();
            }}
            className={`w-full flex items-center gap-4 px-6 py-3 transition-colors ${
              activeTab === item.id 
                ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
