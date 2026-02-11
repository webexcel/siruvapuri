import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useModules } from '../context/ModuleContext';
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
  Settings,
  Upload
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Icon mapping for dynamic sidebar
const iconMap = {
  'dashboard': LayoutDashboard,
  'users': Users,
  'bulk-upload': Upload,
  'set-password': Key,
  'manage-passwords': Lock,
  'matches': Heart,
  'assign-match': UserCog,
  'interests': Mail,
  'membership': CreditCard,
  'settings': Settings
};

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { isModuleEnabled } = useModules();
  const isMembershipEnabled = isModuleEnabled('membership');

  // Default menu items with icons
  // Build default menu items dynamically based on module settings
  const getDefaultMenuItems = () => {
    const items = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
      { path: '/users', icon: Users, label: 'User List', key: 'users' },
      { path: '/users/bulk-upload', icon: Upload, label: 'Bulk Upload', key: 'bulk-upload' },
      { path: '/set-password', icon: Key, label: 'Set Password', key: 'set-password' },
      { path: '/manage-passwords', icon: Lock, label: 'Manage Passwords', key: 'manage-passwords' },
      { path: '/matches', icon: Heart, label: 'Matches', key: 'matches' },
      { path: '/assign-match', icon: UserCog, label: 'Assign Match', key: 'assign-match' },
      { path: '/interests', icon: Mail, label: 'Interests', key: 'interests' },
    ];

    // Add membership menu item only if the module is enabled
    if (isMembershipEnabled) {
      items.push({ path: '/membership', icon: CreditCard, label: 'Membership Plans', key: 'membership' });
    }

    items.push({ path: '/settings', icon: Settings, label: 'Settings', key: 'settings' });

    return items;
  };

  const defaultMenuItems = getDefaultMenuItems();

  useEffect(() => {
    fetchSidebarSettings();
  }, [isMembershipEnabled]); // Re-fetch when membership module status changes

  const fetchSidebarSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/settings/sidebar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Fall back to defaults if fetch fails
        setMenuItems(defaultMenuItems);
        return;
      }

      const data = await response.json();
      const sidebarSettings = data.settings?.items || [];

      // Filter enabled items and map to menu format with icons
      // Also filter out membership if the module is disabled by superadmin
      const enabledItems = sidebarSettings
        .filter(item => {
          if (!item.enabled) return false;
          // Hide membership if module is disabled
          if (item.key === 'membership' && !isMembershipEnabled) return false;
          return true;
        })
        .map(item => ({
          path: item.path,
          icon: iconMap[item.key] || Settings,
          label: item.label,
          key: item.key
        }));

      setMenuItems(enabledItems.length > 0 ? enabledItems : defaultMenuItems);
    } catch (error) {
      console.error('Error fetching sidebar settings:', error);
      setMenuItems(defaultMenuItems);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

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
                src="/images/logo.jpeg"
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              menuItems.map((item) => {
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
              })
            )}
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
