import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Default module settings - all modules enabled by default
const defaultModules = {
  modules: [
    { key: 'membership', label: 'Membership', description: 'Membership plans and badges', enabled: false },
  ]
};

const ModuleContext = createContext();

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
};

export const ModuleProvider = ({ children }) => {
  const [modules, setModules] = useState(defaultModules.modules);
  const [loading, setLoading] = useState(true);

  // Fetch modules from server on mount
  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/modules`);
      if (response.data.settings?.modules) {
        setModules(response.data.settings.modules);
      }
    } catch (error) {
      console.error('Failed to fetch module settings:', error);
      // Use default modules if fetch fails
    } finally {
      setLoading(false);
    }
  };

  // Check if a specific module is enabled
  const isModuleEnabled = (moduleKey) => {
    const module = modules.find(m => m.key === moduleKey);
    return module ? module.enabled : false;
  };

  // Refresh modules from server
  const refreshModules = async () => {
    await fetchModules();
  };

  const value = {
    modules,
    loading,
    isModuleEnabled,
    refreshModules,
  };

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
};

export default ModuleContext;
