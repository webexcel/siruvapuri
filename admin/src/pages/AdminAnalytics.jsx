import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import AdminLayout from '../components/AdminLayout';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../utils/api';
import Swal from 'sweetalert2';
import { TrendingUp, Users, Heart, DollarSign, UserCheck, UserX, Clock, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [dashboardRes, interestsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/interests')
      ]);

      setStats(dashboardRes.data.stats);
      setInterests(interestsRes.data.interests);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <SkeletonLoader type="cards" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Gender distribution data
  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [stats.maleUsers, stats.femaleUsers],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#2563EB', '#DB2777'],
        borderWidth: 1,
      },
    ],
  };

  // User status data
  const statusData = {
    labels: ['Approved', 'Pending', 'Paid', 'Unpaid'],
    datasets: [
      {
        label: 'Users',
        data: [
          stats.approvedUsers,
          stats.pendingUsers,
          stats.paidUsers,
          stats.totalUsers - stats.paidUsers
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#00D26A', '#EF4444'],
      },
    ],
  };

  // Interest statistics
  const interestStats = interests.reduce(
    (acc, interest) => {
      acc[interest.status] = (acc[interest.status] || 0) + 1;
      return acc;
    },
    { pending: 0, accepted: 0, declined: 0 }
  );

  const interestData = {
    labels: ['Pending', 'Accepted', 'Declined'],
    datasets: [
      {
        data: [interestStats.pending, interestStats.accepted, interestStats.declined],
        backgroundColor: ['#F59E0B', '#10B981', '#EF4444'],
        borderColor: ['#D97706', '#059669', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  // Growth trend (last 7 days simulation - in real app, fetch from backend)
  const growthData = {
    labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
    datasets: [
      {
        label: 'New Registrations',
        data: [12, 19, 15, 25, 22, 30, stats.recentRegistrations || 15],
        borderColor: '#00D26A',
        backgroundColor: 'rgba(0, 210, 106, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Activity size={20} />
            Refresh Data
          </button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
              </div>
              <Users className="text-blue-200" size={40} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Approved Users</p>
                <p className="text-3xl font-bold mt-2">{stats.approvedUsers}</p>
              </div>
              <UserCheck className="text-green-200" size={40} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Matches</p>
                <p className="text-3xl font-bold mt-2">{stats.totalMatches}</p>
              </div>
              <Heart className="text-purple-200" size={40} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Paid Users</p>
                <p className="text-3xl font-bold mt-2">{stats.paidUsers}</p>
              </div>
              <DollarSign className="text-yellow-200" size={40} />
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Approval</p>
                <p className="text-2xl font-bold mt-2 text-orange-600">{stats.pendingUsers}</p>
              </div>
              <Clock className="text-orange-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Male Users</p>
                <p className="text-2xl font-bold mt-2 text-blue-600">{stats.maleUsers}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Female Users</p>
                <p className="text-2xl font-bold mt-2 text-pink-600">{stats.femaleUsers}</p>
              </div>
              <Users className="text-pink-500" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Recent (7 days)</p>
                <p className="text-2xl font-bold mt-2 text-green-600">{stats.recentRegistrations}</p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Gender Distribution</h2>
            <div className="h-80">
              <Pie data={genderData} options={chartOptions} />
            </div>
          </div>

          {/* Interest Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Interest Status</h2>
            <div className="h-80">
              <Pie data={interestData} options={chartOptions} />
            </div>
          </div>

          {/* User Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">User Status Overview</h2>
            <div className="h-80">
              <Bar data={statusData} options={chartOptions} />
            </div>
          </div>

          {/* Growth Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Registration Trend</h2>
            <div className="h-80">
              <Line data={growthData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Interest Activity Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recent Interest Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-3">Sender</th>
                  <th className="text-left p-3">Receiver</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {interests.slice(0, 10).map((interest) => (
                  <tr key={interest.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{interest.sender_name}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{interest.receiver_name}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          interest.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : interest.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {interest.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(interest.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Approval Rate</h3>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-green-600">
                {stats.totalUsers > 0 ? ((stats.approvedUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-500 mb-1">
                {stats.approvedUsers} / {stats.totalUsers}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Payment Rate</h3>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalUsers > 0 ? ((stats.paidUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-500 mb-1">
                {stats.paidUsers} / {stats.totalUsers}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Interest Accept Rate</h3>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-purple-600">
                {interests.length > 0
                  ? ((interestStats.accepted / interests.length) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mb-1">
                {interestStats.accepted} / {interests.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
