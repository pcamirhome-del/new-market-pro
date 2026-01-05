
import React, { useState, useEffect } from 'react';
import { User, Settings, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  settings: Settings;
}

const Login: React.FC<LoginProps> = ({ onLogin, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin: admin/admin
    if (username === 'admin' && password === 'admin') {
      onLogin({
        id: '1',
        username: 'admin',
        role: UserRole.ADMIN,
        permissions: ['DASHBOARD', 'INVENTORY', 'ORDER_REQUESTS', 'SALES_ANALYTICS', 'BARCODE_PRINT', 'ADMIN_SETTINGS']
      });
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-700 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">{settings.appName}</h1>
          <div className="text-gray-500 text-sm font-medium">
            {time.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Password"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            تسجيل الدخول
          </button>
        </form>
      </div>
      
      <footer className="mt-8 text-white/80 text-sm">
        جميع الحقوق محفوظة &copy; {new Date().getFullYear()} {settings.appName}
      </footer>
    </div>
  );
};

export default Login;
