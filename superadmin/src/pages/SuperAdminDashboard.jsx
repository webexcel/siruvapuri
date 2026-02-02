import SuperAdminLayout from '../components/SuperAdminLayout';
import { PanelLeft, Settings, Shield, Table } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const features = [
    {
      icon: PanelLeft,
      title: 'Sidebar Management',
      description: 'Control which menu items appear in the Admin Panel sidebar. Enable or disable features as needed.',
      link: '/sidebar-management',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Table,
      title: 'Column Management',
      description: 'Show or hide columns in the User List table. Customize the table view for all admin users.',
      link: '/column-management',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Settings,
      title: 'More Settings',
      description: 'Additional superadmin settings and configurations coming soon.',
      link: null,
      color: 'bg-gray-100 text-gray-400'
    }
  ];

  return (
    <SuperAdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-400 rounded-full flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
              <p className="text-gray-600">Manage system-wide settings and configurations</p>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const CardContent = (
              <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-300 ${feature.link ? 'hover:shadow-lg hover:border-primary/20 cursor-pointer' : 'opacity-60'}`}>
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
                {!feature.link && (
                  <span className="inline-block mt-3 text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
            );

            return feature.link ? (
              <Link key={index} to={feature.link}>
                {CardContent}
              </Link>
            ) : (
              <div key={index}>{CardContent}</div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">About Super Admin</h3>
          <p className="text-purple-700 text-sm">
            The Super Admin panel provides system-level control over the application.
            Changes made here affect the entire Admin Panel and all admin users.
            Use these settings carefully as they can impact the functionality of the admin interface.
          </p>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
