import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Key,
  Heart,
  UserCog,
  LogOut,
  Menu,
  X,
  CreditCard,
  Mail,
  Lock,
  UserPlus
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'User List' },
    { path: '/set-password', icon: Key, label: 'Set Password' },
    { path: '/manage-passwords', icon: Lock, label: 'Manage Passwords' },
    { path: '/matches', icon: Heart, label: 'Matches' },
    { path: '/assign-match', icon: UserCog, label: 'Assign Match' },
    { path: '/interests', icon: Mail, label: 'Interests' },
    { path: '/membership', icon: CreditCard, label: 'Membership' },
    { path: '/assign-membership', icon: UserPlus, label: 'Assign Membership' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Siruvapuri Murugan Matrimony"
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-800 leading-tight">Siruvapuri Murugan</h1>
                <span className="text-xs text-primary font-medium">Admin Panel</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-400 text-white hover:bg-red-500 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline ">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64 lg:translate-x-0`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
