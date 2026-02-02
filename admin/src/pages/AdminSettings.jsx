import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminSettingsAPI } from '../utils/adminApi';
import { showSuccess, showError } from '../utils/sweetalert';
import { Settings, Palette, RotateCcw, Save, Loader2 } from 'lucide-react';

// Default theme colors
const defaultTheme = {
  primary: '#1EA826',
  primaryDark: '#0B7813',
  primaryLight: '#1f7a4d',
  gold: '#FFFFFF',
  goldLight: '#f5e6b0',
  maroon: '#7a1f2b',
  ivory: '#fffaf0',
};

// Preset theme options
const presetThemes = [
  {
    name: 'Auspicious Green',
    colors: {
      primary: '#1EA826',
      primaryDark: '#0B7813',
      primaryLight: '#1f7a4d',
      gold: '#FFFFFF',
      goldLight: '#f5e6b0',
      maroon: '#7a1f2b',
      ivory: '#fffaf0',
    }
  },
  {
    name: 'Royal Blue',
    colors: {
      primary: '#2563eb',
      primaryDark: '#1d4ed8',
      primaryLight: '#3b82f6',
      gold: '#FFFFFF',
      goldLight: '#dbeafe',
      maroon: '#7a1f2b',
      ivory: '#f8fafc',
    }
  },
  {
    name: 'Elegant Purple',
    colors: {
      primary: '#7c3aed',
      primaryDark: '#6d28d9',
      primaryLight: '#8b5cf6',
      gold: '#FFFFFF',
      goldLight: '#ede9fe',
      maroon: '#7a1f2b',
      ivory: '#faf5ff',
    }
  },
  {
    name: 'Warm Orange',
    colors: {
      primary: '#ea580c',
      primaryDark: '#c2410c',
      primaryLight: '#f97316',
      gold: '#FFFFFF',
      goldLight: '#fed7aa',
      maroon: '#7a1f2b',
      ivory: '#fffbeb',
    }
  },
  {
    name: 'Rose Pink',
    colors: {
      primary: '#e11d48',
      primaryDark: '#be123c',
      primaryLight: '#f43f5e',
      gold: '#FFFFFF',
      goldLight: '#fce7f3',
      maroon: '#7a1f2b',
      ivory: '#fff1f2',
    }
  },
  {
    name: 'Teal',
    colors: {
      primary: '#0d9488',
      primaryDark: '#0f766e',
      primaryLight: '#14b8a6',
      gold: '#FFFFFF',
      goldLight: '#ccfbf1',
      maroon: '#7a1f2b',
      ivory: '#f0fdfa',
    }
  },
];

const AdminSettings = () => {
  const [theme, setTheme] = useState(defaultTheme);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved theme from database on mount
  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      setLoading(true);
      const response = await adminSettingsAPI.getTheme();
      if (response.data.theme) {
        const savedTheme = response.data.theme;
        setTheme(savedTheme);
        applyTheme(savedTheme);
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
      // Use default theme if fetch fails
      applyTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  // Apply theme to CSS variables
  const applyTheme = (themeColors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', themeColors.primary);
    root.style.setProperty('--color-primary-dark', themeColors.primaryDark);
    root.style.setProperty('--color-primary-light', themeColors.primaryLight);
    root.style.setProperty('--color-gold', themeColors.gold);
    root.style.setProperty('--color-gold-light', themeColors.goldLight);
    root.style.setProperty('--color-maroon', themeColors.maroon);
    root.style.setProperty('--color-ivory', themeColors.ivory);
  };

  const handleColorChange = (key, value) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    setHasChanges(true);
    applyTheme(newTheme);
  };

  const handlePresetSelect = (preset) => {
    setTheme(preset.colors);
    setHasChanges(true);
    applyTheme(preset.colors);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSettingsAPI.updateTheme(theme);
      showSuccess('Theme settings saved successfully! Changes will reflect on client pages.');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save theme:', error);
      showError(error.response?.data?.error || 'Failed to save theme settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    setHasChanges(true);
    applyTheme(defaultTheme);
  };

  const colorInputs = [
    { key: 'primary', label: 'Primary Color', description: 'Main brand color used for buttons and accents' },
    { key: 'primaryDark', label: 'Primary Dark', description: 'Darker shade for hover states' },
    { key: 'primaryLight', label: 'Primary Light', description: 'Lighter shade for subtle backgrounds' },
    { key: 'gold', label: 'Text on Primary', description: 'Text color on primary backgrounds' },
    { key: 'goldLight', label: 'Light Accent', description: 'Light accent color for borders and highlights' },
    { key: 'maroon', label: 'Accent Color', description: 'Secondary accent color' },
    { key: 'ivory', label: 'Background', description: 'Main background color' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Settings className="text-primary" size={28} />
              Settings
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Customize the UI theme colors for admin and client pages
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw size={18} />
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="text-primary" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">UI Theme Colors</h2>
          </div>

          {/* Preset Themes */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {presetThemes.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-full shadow-inner border-2 border-white"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <span className="text-xs font-medium text-gray-600 text-center">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Inputs */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Custom Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colorInputs.map(({ key, label, description }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={theme[key]}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300 p-1"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={theme[key]}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Preview</h3>
            <div className="p-6 rounded-xl" style={{ backgroundColor: theme.ivory }}>
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  className="px-6 py-2 rounded-full font-semibold shadow-md transition-colors cursor-pointer"
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.gold,
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                >
                  Primary Button
                </button>
                <button
                  className="px-6 py-2 rounded-full font-semibold border-2 transition-colors cursor-pointer"
                  style={{
                    borderColor: theme.primary,
                    color: theme.primary,
                    backgroundColor: 'transparent',
                  }}
                >
                  Secondary Button
                </button>
                <button
                  className="px-6 py-2 rounded-full font-semibold shadow-md cursor-pointer"
                  style={{
                    backgroundColor: theme.maroon,
                    color: theme.gold,
                  }}
                >
                  Accent Button
                </button>
                <div
                  className="px-4 py-2 rounded-lg border"
                  style={{
                    borderColor: theme.goldLight,
                    backgroundColor: 'white',
                  }}
                >
                  <span style={{ color: theme.primary }} className="font-semibold">
                    Card Element
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">
            <strong>Note:</strong> Theme changes are saved to the database and will be applied to both admin panel and client-facing pages.
            Users will see the new theme immediately after you save.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
