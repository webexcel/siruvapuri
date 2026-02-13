import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import SkeletonLoader from '../components/SkeletonLoader';
import { adminInterestAPI } from '../utils/adminApi';
import Swal from 'sweetalert2';
import { Search, Heart, UserCheck, UserX, Clock, Eye } from 'lucide-react';

const AdminInterests = () => {
  const [interests, setInterests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInterests, setUserInterests] = useState(null);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const response = await adminInterestAPI.getAllInterests();
      setInterests(response.data.interests);
      setStats(response.data.stats);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch interests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const viewUserInterests = async (userId, userName) => {
    try {
      const response = await adminInterestAPI.getInterestsByUser(userId);
      setUserInterests(response.data);
      setSelectedUser(userName);

      Swal.fire({
        title: `Interests for ${userName}`,
        html: `
          <div class="text-left">
            <h3 class="font-bold text-lg mb-2">Sent Interests (${response.data.sent.length})</h3>
            <ul class="mb-4">
              ${response.data.sent.map(i => `
                <li class="mb-1">
                  <span class="font-medium">${i.receiver_name}</span> -
                  <span class="text-sm ${
                    i.status === 'accepted' ? 'text-green-600' :
                    i.status === 'declined' ? 'text-red-600' : 'text-yellow-600'
                  }">${i.status}</span>
                </li>
              `).join('') || '<li>No interests sent</li>'}
            </ul>
            <h3 class="font-bold text-lg mb-2">Received Interests (${response.data.received.length})</h3>
            <ul>
              ${response.data.received.map(i => `
                <li class="mb-1">
                  <span class="font-medium">${i.sender_name}</span> -
                  <span class="text-sm ${
                    i.status === 'accepted' ? 'text-green-600' :
                    i.status === 'declined' ? 'text-red-600' : 'text-yellow-600'
                  }">${i.status}</span>
                </li>
              `).join('') || '<li>No interests received</li>'}
            </ul>
          </div>
        `,
        width: 600,
        confirmButtonColor: '#00D26A'
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch user interests', 'error');
    }
  };

  const filteredInterests = interests.filter((interest) => {
    const matchesSearch =
      interest.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interest.receiver_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || interest.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-56 mb-2"></div>
          </div>
          <SkeletonLoader type="cards" />
          <div className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
          <SkeletonLoader type="table" rows={8} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Interest Management</h1>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Interests</p>
                  <p className="text-3xl font-bold mt-2">{stats.total}</p>
                </div>
                <Heart className="text-gray-400" size={40} />
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm">Accepted</p>
                  <p className="text-3xl font-bold mt-2 text-green-700">{stats.accepted}</p>
                </div>
                <UserCheck className="text-green-500" size={40} />
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm">Pending</p>
                  <p className="text-3xl font-bold mt-2 text-yellow-700">{stats.pending}</p>
                </div>
                <Clock className="text-yellow-500" size={40} />
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm">Declined</p>
                  <p className="text-3xl font-bold mt-2 text-red-700">{stats.declined}</p>
                </div>
                <UserX className="text-red-500" size={40} />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by sender or receiver name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="sent">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Interests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-4">Sender</th>
                  <th className="text-left p-4">Receiver</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Sent Date</th>
                  <th className="text-left p-4">Response Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-500">
                      No interests found
                    </td>
                  </tr>
                ) : (
                  filteredInterests.map((interest) => (
                    <tr key={interest.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          {interest.sender_picture ? (
                            <img
                              src={interest.sender_picture}
                              alt={interest.sender_name}
                              className="h-20 w-16 rounded-lg object-cover border-2 border-blue-400 shadow-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(interest.sender_name)}&size=80&background=3B82F6&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="h-20 w-16 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                              {interest.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{interest.sender_name}</div>
                            <div className="text-xs text-gray-400">
                              {interest.sender_age} yrs, {interest.sender_gender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          {interest.receiver_picture ? (
                            <img
                              src={interest.receiver_picture}
                              alt={interest.receiver_name}
                              className="h-20 w-16 rounded-lg object-cover border-2 border-purple-400 shadow-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(interest.receiver_name)}&size=80&background=9333EA&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="h-20 w-16 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                              {interest.receiver_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{interest.receiver_name}</div>
                            <div className="text-xs text-gray-400">
                              {interest.receiver_age} yrs, {interest.receiver_gender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            interest.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : interest.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {interest.status === 'sent' ? 'Pending' : interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(interest.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {interest.status !== 'sent' && interest.updated_at
                          ? new Date(interest.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewUserInterests(interest.sender_id, interest.sender_name)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="View sender's interests"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => viewUserInterests(interest.receiver_id, interest.receiver_name)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                            title="View receiver's interests"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Showing {filteredInterests.length} of {interests.length} interests
            {statusFilter !== 'all' && ` (filtered by ${statusFilter})`}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInterests;
