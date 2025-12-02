import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Car,
  Droplet,
  CreditCard,
  Users,
  FileText,
  DollarSign,
  BarChart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Vehículos', path: '/admin/vehicles', icon: Car },
  { name: 'Lavados', path: '/admin/washes', icon: Droplet },
  { name: 'Mensualidades', path: '/admin/subscriptions', icon: CreditCard },
  { name: 'Empleados', path: '/admin/employees', icon: Users },
  { name: 'Convenios', path: '/admin/agreements', icon: FileText },
  { name: 'Gastos', path: '/admin/expenses', icon: DollarSign },
  { name: 'Reportes', path: '/admin/reports', icon: BarChart },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo y Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-yellow-400">Logo</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${isActive(item.path)
                  ? 'bg-yellow-500 text-gray-900 font-semibold'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar con User Icon */}
        <header className="bg-white shadow-sm px-6 py-3 flex justify-end items-center">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
            >
              <User size={20} className="text-gray-900" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.username || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'global_admin' ? 'Administrador Global' : user?.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
