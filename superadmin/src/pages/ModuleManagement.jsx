import { useState, useEffect } from 'react';
import {
  CreditCard,
  Save,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Package,
  AlertCircle
} from 'lucide-react';
import SuperAdminLayout from '../components/SuperAdminLayout';
import { moduleAPI } from '../utils/superadminApi';
import toast from 'react-hot-toast';

// Icon mapping for modules
const iconMap = {
  'membership': CreditCard,
};

// Default modules configuration
const defaultModules = [
  { key: 'membership', label: 'Membership', description: 'Membership plans, badges, and premium features', enabled: false },
];

const ModuleManagement = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchModuleSettings();
  }, []);

  const fetchModuleSettings = async () => {
    try {
      const response = await moduleAPI.getSettings();
      const fetchedModules = response.data.settings?.modules || [];
      // If no modules found, use defaults
      setModules(fetchedModules.length > 0 ? fetchedModules : defaultModules);
    } catch (error) {
      console.error('Error fetching module settings:', error);
      toast.error('Failed to load module settings');
      setModules(defaultModules);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (index) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], enabled: !newModules[index].enabled };
    setModules(newModules);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await moduleAPI.updateSettings(modules);
      toast.success('Module settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving module settings:', error);
      toast.error('Failed to save module settings');
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
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-7 h-7 text-primary" />
                Module Management
              </h1>
              <p className="text-gray-600 mt-1">
                Enable or disable feature modules across all applications
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

          <div className="space-y-4">
            {modules.map((module, index) => {
              const Icon = iconMap[module.key] || Package;
              return (
                <div
                  key={module.key}
                  className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                    module.enabled
                      ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${module.enabled ? 'bg-primary/20' : 'bg-gray-200'}`}>
                      <Icon className={`w-6 h-6 ${module.enabled ? 'text-primary' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${module.enabled ? 'text-gray-800' : 'text-gray-500'}`}>
                        {module.label}
                      </h3>
                      <p className="text-sm text-gray-500">{module.description}</p>
                      <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        module.enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${module.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {module.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleModule(index)}
                    className="focus:outline-none ml-4"
                    title={module.enabled ? 'Disable this module' : 'Enable this module'}
                  >
                    {module.enabled ? (
                      <ToggleRight className="w-12 h-12 text-primary cursor-pointer hover:scale-105 transition-transform" />
                    ) : (
                      <ToggleLeft className="w-12 h-12 text-gray-400 cursor-pointer hover:scale-105 transition-transform" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {hasChanges && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-800 text-sm">
                You have unsaved changes. Click "Save Changes" to apply them across all applications.
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Important:</strong> Disabling a module will hide all related features from the Client app
              and Admin panel. The module will remain visible only in this SuperAdmin panel for management purposes.
            </p>
          </div>

          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-800 text-sm">
              <strong>Membership Module:</strong> When disabled, membership badges, plans, pricing cards, and
              all membership-related UI elements will be hidden from users and admins.
            </p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default ModuleManagement;
