import { useState, useEffect } from 'react';
import {
  Users,
  CheckSquare,
  Phone,
  Calendar,
  CreditCard,
  Crown,
  Settings,
  Save,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  Loader2,
  Table,
  Heart,
  UserCheck,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import SuperAdminLayout from '../components/SuperAdminLayout';
import { columnAPI, sidebarAPI } from '../utils/superadminApi';
import toast from 'react-hot-toast';

// Icon mapping for column items
const columnIconMap = {
  'select': CheckSquare,
  'user': Users,
  'user1': Users,
  'user2': Users,
  'from_user': Users,
  'to_user': Users,
  'contact': Phone,
  'age_gender': Calendar,
  'payment': CreditCard,
  'membership': Crown,
  'actions': Settings,
  'matched_by': UserCheck,
  'matched_at': Calendar,
  'status': CheckSquare,
  'sent_at': Calendar,
  'name': Table,
  'price': CreditCard,
  'duration': Calendar,
  'features': Settings
};

// Page configuration with icons and labels
const pageConfig = {
  userList: {
    label: 'User List',
    icon: Users,
    description: 'Manage columns displayed in the User List table',
    sidebarKey: 'users'
  },
  matches: {
    label: 'Matches',
    icon: Heart,
    description: 'Manage columns displayed in the Matches table',
    sidebarKey: 'matches'
  },
  interests: {
    label: 'Interests',
    icon: Heart,
    description: 'Manage columns displayed in the Interests table',
    sidebarKey: 'interests'
  },
  membership: {
    label: 'Membership Plans',
    icon: Crown,
    description: 'Manage columns displayed in the Membership Plans table',
    sidebarKey: 'membership'
  }
};

const ColumnManagement = () => {
  const [allColumnSettings, setAllColumnSettings] = useState({});
  const [sidebarItems, setSidebarItems] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch both sidebar and column settings in parallel
      const [sidebarResponse, columnResponse] = await Promise.all([
        sidebarAPI.getSettings(),
        columnAPI.getSettings()
      ]);

      // Get enabled sidebar items that have column management
      const enabledItems = sidebarResponse.data.settings?.items
        ?.filter(item => item.enabled && pageConfig[item.key === 'users' ? 'userList' : item.key])
        ?.map(item => ({
          key: item.key === 'users' ? 'userList' : item.key,
          ...pageConfig[item.key === 'users' ? 'userList' : item.key]
        })) || [];

      setSidebarItems(enabledItems);
      setAllColumnSettings(columnResponse.data.settings || {});
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (pageKey) => {
    // Check for unsaved changes
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Do you want to discard them?');
      if (!confirmed) return;
    }

    setSelectedPage(pageKey);
    setColumns(allColumnSettings[pageKey] || []);
    setHasChanges(false);
    setDropdownOpen(false);
  };

  const toggleColumn = (index) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], enabled: !newColumns[index].enabled };
    setColumns(newColumns);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedPage) return;

    setSaving(true);
    try {
      await columnAPI.updatePageColumns(selectedPage, columns);

      // Update local state
      setAllColumnSettings(prev => ({
        ...prev,
        [selectedPage]: columns
      }));

      toast.success('Column settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving column settings:', error);
      toast.error('Failed to save column settings');
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

  const selectedPageConfig = selectedPage ? pageConfig[selectedPage] : null;
  const PageIcon = selectedPageConfig?.icon || Table;

  return (
    <SuperAdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Table className="w-7 h-7 text-primary" />
                Column Management
              </h1>
              <p className="text-gray-600 mt-1">
                Select a page to manage its table columns
              </p>
            </div>
            {selectedPage && (
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
            )}
          </div>

          {/* Page Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Page
            </label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-primary/50 focus:outline-none focus:border-primary transition-colors"
              >
                {selectedPage ? (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <PageIcon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-gray-800">{selectedPageConfig?.label}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Choose a page to manage columns...</span>
                )}
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {sidebarItems.length > 0 ? (
                    sidebarItems.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.key}
                          onClick={() => handlePageSelect(item.key)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                            selectedPage === item.key ? 'bg-primary/5 border-l-4 border-primary' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${selectedPage === item.key ? 'bg-primary/10' : 'bg-gray-100'}`}>
                            <ItemIcon className={`w-5 h-5 ${selectedPage === item.key ? 'text-primary' : 'text-gray-500'}`} />
                          </div>
                          <div className="text-left">
                            <span className={`font-medium ${selectedPage === item.key ? 'text-primary' : 'text-gray-800'}`}>
                              {item.label}
                            </span>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No pages available. Enable pages in Sidebar Management first.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Column Management - Only shown when a page is selected */}
          {selectedPage ? (
            <>
              {/* Page Description */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  {selectedPageConfig?.description}
                </p>
              </div>

              {/* Preview Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Table Preview</h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-2 min-w-max">
                    {columns.filter(col => col.enabled).map((col) => (
                      <div
                        key={col.key}
                        className="px-3 py-2 bg-primary/10 text-primary text-sm font-medium rounded border border-primary/20"
                      >
                        {col.label}
                      </div>
                    ))}
                    {columns.filter(col => col.enabled).length === 0 && (
                      <div className="text-gray-400 text-sm">No columns visible</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Column List */}
              <div className="space-y-3">
                {columns.map((column, index) => {
                  const Icon = columnIconMap[column.key] || Settings;
                  return (
                    <div
                      key={column.key}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        column.enabled
                          ? 'border-primary/20 bg-primary/5'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <div className={`p-2 rounded-lg ${column.enabled ? 'bg-primary/10' : 'bg-gray-200'}`}>
                          <Icon className={`w-5 h-5 ${column.enabled ? 'text-primary' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className={`font-medium ${column.enabled ? 'text-gray-800' : 'text-gray-500'}`}>
                            {column.label}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Column key: {column.key}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleColumn(index)}
                        className="focus:outline-none"
                        title={column.enabled ? 'Hide this column' : 'Show this column'}
                      >
                        {column.enabled ? (
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
                    You have unsaved changes. Click "Save Changes" to apply them to the {selectedPageConfig?.label} table.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* No Page Selected State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Select a Page</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Choose a page from the dropdown above to start managing its table columns.
                You can show or hide columns based on your preferences.
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-800 text-sm">
              <strong>Note:</strong> Only pages that are enabled in Sidebar Management will appear in the dropdown.
              Column changes will affect all admin users viewing the tables.
            </p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default ColumnManagement;
