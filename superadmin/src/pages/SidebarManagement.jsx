import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Key,
  Heart,
  UserCog,
  CreditCard,
  Mail,
  Lock,
  Settings,
  Upload,
  Save,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  Loader2
} from 'lucide-react';
import SuperAdminLayout from '../components/SuperAdminLayout';
import { sidebarAPI } from '../utils/superadminApi';
import toast from 'react-hot-toast';

// Icon mapping for sidebar items
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

const SidebarManagement = () => {
  const [sidebarItems, setSidebarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSidebarSettings();
  }, []);

  const fetchSidebarSettings = async () => {
    try {
      const response = await sidebarAPI.getSettings();
      setSidebarItems(response.data.settings?.items || []);
    } catch (error) {
      console.error('Error fetching sidebar settings:', error);
      toast.error('Failed to load sidebar settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index) => {
    const newItems = [...sidebarItems];
    newItems[index] = { ...newItems[index], enabled: !newItems[index].enabled };
    setSidebarItems(newItems);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await sidebarAPI.updateSettings(sidebarItems);
      toast.success('Sidebar settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving sidebar settings:', error);
      toast.error('Failed to save sidebar settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Sidebar Management</h1>
              <p className="text-gray-600 mt-1">
                Enable or disable sidebar menu items for the admin panel
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
                hasChanges && !saving
                  ? 'bg-primary hover:bg-primary-dark cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Changes
            </button>
          </div>

          <div className="space-y-3">
            {sidebarItems.map((item, index) => {
              const Icon = iconMap[item.key] || Settings;
              return (
                <div
                  key={item.key}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    item.enabled
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <div className={`p-2 rounded-lg ${item.enabled ? 'bg-primary/10' : 'bg-gray-200'}`}>
                      <Icon className={`w-5 h-5 ${item.enabled ? 'text-primary' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${item.enabled ? 'text-gray-800' : 'text-gray-500'}`}>
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-500">{item.path}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleItem(index)}
                    className="focus:outline-none"
                    title={item.enabled ? 'Disable this menu item' : 'Enable this menu item'}
                  >
                    {item.enabled ? (
                      <ToggleRight className="w-10 h-10 text-primary cursor-pointer" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400 cursor-pointer" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {hasChanges && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                You have unsaved changes. Click "Save Changes" to apply them to the admin sidebar.
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-800 text-sm">
              <strong>Note:</strong> Disabling a sidebar item will hide it from the Admin Panel.
              The routes will still work if accessed directly via URL.
            </p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SidebarManagement;
