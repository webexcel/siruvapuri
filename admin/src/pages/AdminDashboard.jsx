import { useState, useEffect } from 'react';
import { adminDashboardAPI } from '../utils/adminApi';
import AdminLayout from '../components/AdminLayout';
import SkeletonLoader from '../components/SkeletonLoader';
import {
  Users,
  UserCheck,
  Heart,
  TrendingUp,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedUsers: 0,
    paidUsers: 0,
    pendingUsers: 0,
    totalMatches: 0,
    recentRegistrations: 0,
    maleUsers: 0,
    femaleUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminDashboardAPI.getStats();
      setStats(response.data.stats);
      setRecentUsers(response.data.recentUsers);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Approved',
      value: stats.approvedUsers,
      icon: UserCheck,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Paid',
      value: stats.paidUsers,
      icon: () => <span className="font-bold text-yellow-600">₹</span>,
      color: 'bg-yellow-500',
      bgLight: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Pending',
      value: stats.pendingUsers,
      icon: Clock,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Matches',
      value: stats.totalMatches,
      icon: Heart,
      color: 'bg-pink-500',
      bgLight: 'bg-pink-50',
      textColor: 'text-pink-600'
    },
    {
      title: 'Recent (7d)',
      value: stats.recentRegistrations,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Male',
      value: stats.maleUsers,
      icon: Users,
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Female',
      value: stats.femaleUsers,
      icon: Users,
      color: 'bg-rose-500',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-600'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
          <SkeletonLoader type="cards" />
          <SkeletonLoader type="list" rows={5} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-xs md:text-base text-gray-600">Overview of your matrimony platform</p>
        </div>

        {/* Statistics Cards - 4 columns on mobile, 4 on tablet, 4 on desktop */}
        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 md:p-4">
                <div className="flex flex-col items-center text-center">
                  <div className={`${stat.bgLight} p-1.5 md:p-2 rounded-lg mb-1 md:mb-2`}>
                    <Icon className={stat.textColor} size={16} />
                  </div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 leading-tight">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Users Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-3 md:p-6 border-b border-gray-200">
            <h2 className="text-base md:text-xl font-bold text-gray-800">Recent Registrations</h2>
          </div>

          {/* Mobile View - Compact Grid */}
          <div className="block md:hidden p-2">
            {recentUsers.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                No recent registrations
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {recentUsers.map((user) => (
                  <div key={user.id} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt={`${user.first_name}`}
                          className="h-10 w-10 rounded-full object-cover border border-primary"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&size=40&background=00D26A&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-green-600 text-white flex items-center justify-center font-bold text-sm">
                          {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {user.first_name} {user.last_name?.charAt(0)}.
                        </p>
                        <p className="text-[10px] text-gray-500 capitalize">{user.gender?.charAt(0)} • {user.age}y</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                        user.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.payment_status === 'paid' ? '₹ Paid' : '₹ Unpaid'}
                      </span>
                      <span className="text-gray-400">
                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No recent registrations
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt={`${user.first_name} ${user.last_name}`}
                              className="h-12 w-10 rounded-lg object-cover border border-primary shadow-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&size=48&background=00D26A&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="h-12 w-10 rounded-lg bg-gradient-to-br from-primary to-green-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600 capitalize">{user.gender}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.payment_status === 'paid' ? '₹ Paid' : '₹ Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
