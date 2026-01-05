
import React, { useState } from 'react';
import { Settings, User, UserRole, Permission } from '../types';
import { ICONS } from '../constants';

interface AdminSettingsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, setSettings, users, setUsers, currentUser }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');

  const allPermissions: { id: Permission, label: string }[] = [
    { id: 'DASHBOARD', label: 'لوحة التحكم' },
    { id: 'INVENTORY', label: 'المخزون' },
    { id: 'ORDER_REQUESTS', label: 'طلبات الفواتير' },
    { id: 'SALES_ANALYTICS', label: 'المبيعات' },
    { id: 'BARCODE_PRINT', label: 'طباعة الباركود' },
    { id: 'ADMIN_SETTINGS', label: 'الإعدادات' },
  ];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUserName,
      password: newUserPass,
      role: UserRole.STAFF,
      permissions: ['DASHBOARD'],
    };
    setUsers([...users, newUser]);
    setNewUserName('');
    setNewUserPass('');
  };

  const togglePermission = (userId: string, perm: Permission) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const hasPerm = u.permissions.includes(perm);
        const newPerms = hasPerm 
          ? u.permissions.filter(p => p !== perm)
          : [...u.permissions, perm];
        return { ...u, permissions: newPerms };
      }
      return u;
    }));
  };

  const deleteUser = (id: string) => {
    if (id === '1') return alert('لا يمكن حذف المدير الرئيسي');
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">الإعدادات العامة</h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-1">اسم البرنامج</label>
            <input 
              type="text" 
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">هامش الربح الافتراضي (%)</label>
            <input 
              type="number" 
              value={settings.profitMargin}
              onChange={(e) => setSettings({ ...settings, profitMargin: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">إدارة المستخدمين والصلاحيات</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-bold mb-4">إضافة مستخدم جديد</h3>
            <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="اسم المستخدم"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border outline-none"
              />
              <input 
                type="password" 
                placeholder="كلمة المرور"
                required
                value={newUserPass}
                onChange={(e) => setNewUserPass(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border outline-none"
              />
              <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">إضافة مستخدم</button>
            </form>
          </div>
          <table className="w-full text-right">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="px-6 py-4">اسم المستخدم</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">الصلاحيات الممنوحة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="px-6 py-4 font-bold">{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.role === UserRole.ADMIN ? 'مدير نظام' : 'مستخدم عادي'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {allPermissions.map(p => (
                        <button
                          key={p.id}
                          disabled={user.role === UserRole.ADMIN}
                          onClick={() => togglePermission(user.id, p.id)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                            user.permissions.includes(p.id) 
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-400'
                          } ${user.role === UserRole.ADMIN ? 'opacity-50' : 'hover:bg-emerald-200'}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:text-blue-800 font-bold text-sm">تعديل</button>
                       <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-800 font-bold text-sm">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Edit User Placeholder Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">تعديل بيانات {editingUser.username}</h3>
            <div className="space-y-4">
               <div>
                 <label className="text-sm">كلمة المرور الجديدة</label>
                 <input type="password" placeholder="اترك فارغاً لعدم التغيير" className="w-full px-4 py-2 border rounded-lg" />
               </div>
               <button onClick={() => setEditingUser(null)} className="w-full py-2 bg-emerald-600 text-white rounded-lg">حفظ التعديلات</button>
               <button onClick={() => setEditingUser(null)} className="w-full py-2 border rounded-lg">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
