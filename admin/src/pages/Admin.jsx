import { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccess, showError, showConfirm } from '../utils/sweetalert';
import { Users, DollarSign, Key, CheckCircle, XCircle } from 'lucide-react';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [paidUsers, setPaidUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
    fetchPaidUsersWithoutPassword();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      showError('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchPaidUsersWithoutPassword = async () => {
    try {
      const response = await axios.get('/api/admin/users/paid-no-password', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaidUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch paid users:', error);
    }
  };

  const handlePaymentStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';

    const result = await showConfirm(
      `Mark this user as ${newStatus}?`,
      'Change Payment Status'
    );

    if (result.isConfirmed) {
      try {
        await axios.patch(
          `/api/admin/users/${userId}/payment`,
          { payment_status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        showSuccess(`User marked as ${newStatus}`);
        fetchUsers();
        fetchPaidUsersWithoutPassword();
      } catch (error) {
        showError('Failed to update payment status');
      }
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();

    if (!selectedUser || !newPassword) {
      showError('Please select a user and enter a password');
      return;
    }

    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.post(
        `/api/admin/users/${selectedUser}/set-password`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSuccess('Password set successfully and user approved!');
      setSelectedUser('');
      setNewPassword('');
      fetchUsers();
      fetchPaidUsersWithoutPassword();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to set password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Users size={32} className="text-primary" />
          Admin Panel
        </h1>
        <p className="text-gray-600 mt-2">Manage users, payments, and passwords</p>
      </div>

      {/* Set Password Section */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Key size={24} className="text-primary" />
          Set Password for Paid Users
        </h2>
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Select Paid User
            </label>
            <select
              id="userSelect"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Choose a user...</option>
              {paidUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.middle_name || ''} {user.last_name} ({user.phone})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={!selectedUser || !newPassword}
          >
            <Key size={18} />
            Set Password & Approve User
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={24} className="text-primary" />
          All Users ({users.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.middle_name || ''} {user.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.age}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 capitalize">{user.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.has_password ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <XCircle size={20} className="text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_approved ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <XCircle size={20} className="text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handlePaymentStatusChange(user.id, user.payment_status)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                        user.payment_status === 'paid'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <DollarSign size={16} />
                      {user.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
