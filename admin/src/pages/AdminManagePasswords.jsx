import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminUserAPI } from '../utils/adminApi';
import Swal from 'sweetalert2';
import { Search, Eye, EyeOff, Copy, Key, CheckCircle, XCircle, Mail, Phone, Edit2, Save, X } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';

const AdminManagePasswords = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await adminUserAPI.getUsersWithPasswords();
      setUsers(response.data.users);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${label} copied!`,
        showConfirmButton: false,
        timer: 2000
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to copy to clipboard', 'error');
    }
  };

  const copyCredentials = async (user) => {
    const credentials = `Phone: ${user.phone}\nPassword: ${user.plain_password || 'Not set'}`;
    await copyToClipboard(credentials, 'Credentials');
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({
      first_name: user.first_name,
      middle_name: user.middle_name || '',
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      age: user.age,
      gender: user.gender,
      password: '' // Password field for updating
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const handleSaveEdit = async (userId) => {
    try {
      // Update user data
      await adminUserAPI.updateUserData(userId, {
        first_name: editForm.first_name,
        middle_name: editForm.middle_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone,
        age: editForm.age,
        gender: editForm.gender
      });

      // Update password if provided
      if (editForm.password && editForm.password.trim() !== '') {
        if (editForm.password.length < 6) {
          Swal.fire('Error', 'Password must be at least 6 characters', 'error');
          return;
        }
        await adminUserAPI.setPassword(userId, {
          password: editForm.password
        });
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: editForm.password ? 'User and password updated successfully!' : 'User updated successfully!',
        showConfirmButton: false,
        timer: 2000
      });

      setEditingUser(null);
      setEditForm({});
      fetchUsers();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center animate-pulse">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>

          {/* Search Bar Skeleton */}
          <div className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>

          {/* Table Skeleton */}
          <SkeletonLoader type="table" rows={6} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Passwords</h1>
            <p className="text-gray-600 mt-1">View and manage user login credentials</p>
          </div>
          <div className="text-sm text-gray-500">
            Total Users: <span className="font-bold text-gray-800">{users.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <tr>
                  <th className="text-left p-4 font-semibold">User Details</th>
                  <th className="text-left p-4 font-semibold">Contact</th>
                  <th className="text-left p-4 font-semibold">Login Credentials</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={`transition-all ${editingUser === user.id ? 'bg-blue-50 ring-2 ring-blue-300' : 'hover:bg-gray-50'}`}>
                      {/* User Details */}
                      <td className="p-4">
                        {editingUser === user.id ? (
                          <div className="space-y-3 min-w-[250px]">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                              <input
                                type="text"
                                value={editForm.first_name}
                                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="First name"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Middle Name</label>
                              <input
                                type="text"
                                value={editForm.middle_name}
                                onChange={(e) => setEditForm({ ...editForm, middle_name: e.target.value })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Middle name (optional)"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                              <input
                                type="text"
                                value={editForm.last_name}
                                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Last name"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                              <input
                                type="number"
                                value={editForm.age}
                                onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                min="18"
                                max="100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                              <select
                                value={editForm.gender}
                                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            {user.profile_picture ? (
                              <img
                                src={user.profile_picture}
                                alt={`${user.first_name} ${user.last_name}`}
                                className="h-20 w-16 rounded-lg object-cover border-2 border-green-500 shadow-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&size=80&background=00D26A&color=fff`;
                                }}
                              />
                            ) : (
                              <div className="h-20 w-16 rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">
                                {user.first_name} {user.middle_name || ''} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.age} yrs, {user.gender === 'male' ? '👨' : '👩'} {user.gender}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        {editingUser === user.id ? (
                          <div className="space-y-3 min-w-[220px]">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="email@example.com"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                              <input
                                type="text"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="1234567890"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                New Password <span className="text-xs text-gray-500">(optional)</span>
                              </label>
                              <input
                                type="password"
                                value={editForm.password || ''}
                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Leave blank to keep current"
                                minLength="6"
                              />
                              <p className="text-xs text-gray-500 mt-1">Min 6 characters</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail size={14} className="text-gray-400" />
                              <span className="text-gray-700">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={14} className="text-gray-400" />
                              <span className="text-gray-700">{user.phone}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Login Credentials */}
                      <td className="p-4">
                        {user.has_password ? (
                          <div className="space-y-2">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="text-xs text-gray-500 mb-1">Phone</div>
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-gray-800 flex-1">
                                  {user.phone}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(user.phone, 'Phone')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Copy phone"
                                >
                                  <Copy size={14} className="text-gray-600" />
                                </button>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="text-xs text-gray-500 mb-1">Password</div>
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-gray-800 flex-1">
                                  {showPasswords[user.id] && user.plain_password
                                    ? user.plain_password
                                    : '••••••••'}
                                </code>
                                <button
                                  onClick={() => togglePasswordVisibility(user.id)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title={showPasswords[user.id] ? 'Hide password' : 'Show password'}
                                >
                                  {showPasswords[user.id] ? (
                                    <EyeOff size={14} className="text-gray-600" />
                                  ) : (
                                    <Eye size={14} className="text-gray-600" />
                                  )}
                                </button>
                                {user.plain_password && (
                                  <button
                                    onClick={() => copyToClipboard(user.plain_password, 'Password')}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title="Copy password"
                                  >
                                    <Copy size={14} className="text-gray-600" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                            <Key size={16} />
                            <span className="text-sm font-medium">Password not set</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {user.is_approved ? (
                              <span className="flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                                <CheckCircle size={14} />
                                Approved
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-orange-600 text-xs font-medium bg-orange-50 px-2 py-1 rounded-full">
                                <XCircle size={14} />
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {user.payment_status === 'paid' ? (
                              <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                                💳 Paid
                              </span>
                            ) : (
                              <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded-full">
                                💳 Unpaid
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        {editingUser === user.id ? (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleSaveEdit(user.id)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Save size={16} />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                            {user.has_password && user.plain_password && (
                              <button
                                onClick={() => copyCredentials(user)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                              >
                                <Copy size={16} />
                                Copy All
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {users.filter(u => u.has_password).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Users with Passwords</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {users.filter(u => !u.has_password).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Pending Passwords</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {filteredUsers.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Showing Results</div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Key className="text-blue-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Security Notice</h3>
              <p className="text-sm text-blue-800">
                This page displays user login credentials for administrative purposes.
                Please ensure you only share credentials with authorized users through secure channels.
                Passwords are stored encrypted in the database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminManagePasswords;
