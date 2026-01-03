import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUserAPI } from '../utils/adminApi';
import AdminLayout from '../components/AdminLayout';
import SkeletonLoader from '../components/SkeletonLoader';
import { showSuccess, showError, showConfirm } from '../utils/sweetalert';
import {
  Users,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit,
  Save,
  X as XIcon,
  UserCog
} from 'lucide-react';

const AdminUserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // For showing inline refresh indicator
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState({}); // Track loading state per user/action
  const [globalLoading, setGlobalLoading] = useState(false); // Block all buttons when any action is in progress

  // Helper to set loading for specific user action
  const setUserActionLoading = (userId, action, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [`${userId}-${action}`]: isLoading
    }));
    setGlobalLoading(isLoading); // Block all other buttons
  };

  const isActionLoading = (userId, action) => {
    return actionLoading[`${userId}-${action}`] || false;
  };

  // Check if any action is currently loading (to disable other buttons)
  const isAnyActionLoading = () => {
    return globalLoading;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await adminUserAPI.getAllUsers();
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      showError('Failed to fetch users');
      setLoading(false);
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'approved') {
        filtered = filtered.filter((user) => user.is_approved);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter((user) => !user.is_approved);
      }
    }

    setFilteredUsers(filtered);
  };

  const handleApprovalToggle = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const result = await showConfirm(
      `${newStatus ? 'Approve' : 'Revoke approval for'} this user?`,
      'Confirm Action'
    );

    if (result.isConfirmed) {
      setUserActionLoading(userId, 'approval', true);
      try {
        await adminUserAPI.updateApprovalStatus(userId, { is_approved: newStatus });
        showSuccess(`User ${newStatus ? 'approved' : 'approval revoked'} successfully!`);
        await fetchUsers(true);
      } catch (error) {
        showError('Failed to update approval status');
      } finally {
        setUserActionLoading(userId, 'approval', false);
      }
    }
  };

  const handlePaymentToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    const result = await showConfirm(
      `Mark this user as ${newStatus}?`,
      'Update Payment Status'
    );

    if (result.isConfirmed) {
      setUserActionLoading(userId, 'payment', true);
      try {
        await adminUserAPI.updatePaymentStatus(userId, { payment_status: newStatus });
        showSuccess(`Payment status updated to ${newStatus} successfully!`);
        await fetchUsers(true);
      } catch (error) {
        showError('Failed to update payment status');
      } finally {
        setUserActionLoading(userId, 'payment', false);
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const result = await showConfirm(
      `Delete ${userName}? This action cannot be undone.`,
      'Confirm Delete'
    );

    if (result.isConfirmed) {
      setUserActionLoading(userId, 'delete', true);
      try {
        await adminUserAPI.deleteUser(userId);
        showSuccess('User deleted successfully!');
        await fetchUsers(true);
      } catch (error) {
        showError('Failed to delete user');
      } finally {
        setUserActionLoading(userId, 'delete', false);
      }
    }
  };

  const startEditing = (user) => {
    setEditingUser(user.id);
    setEditForm({
      email: user.email,
      first_name: user.first_name,
      middle_name: user.middle_name || '',
      last_name: user.last_name,
      phone: user.phone,
      age: user.age,
      gender: user.gender
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const handleEditSubmit = async (userId) => {
    setUserActionLoading(userId, 'edit', true);
    try {
      await adminUserAPI.updateUserData(userId, editForm);
      showSuccess('User updated successfully!');
      setEditingUser(null);
      setEditForm({});
      await fetchUsers(true);
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to update user');
    } finally {
      setUserActionLoading(userId, 'edit', false);
    }
  };

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center animate-pulse">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="flex gap-4 animate-pulse">
            <div className="h-12 bg-gray-200 rounded flex-1"></div>
            <div className="h-12 bg-gray-200 rounded w-40"></div>
          </div>
          <SkeletonLoader type="table" rows={10} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              User Management
              {refreshing && (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Manage all registered users</p>
          </div>
          <div className="text-base md:text-lg font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
            Total: {filteredUsers.length} users
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none text-sm md:text-base"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile View (Cards) */}
        <div className="block lg:hidden space-y-4">
          {currentUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              No users found
            </div>
          ) : (
            currentUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start gap-4 mb-4">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="h-24 w-20 flex-shrink-0 rounded-lg object-cover border-2 border-primary shadow-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&size=96&background=00D26A&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="h-24 w-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary to-green-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate text-lg">
                      {user.first_name} {user.middle_name || ''} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-1 font-medium">{user.age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-1 font-medium capitalize">{user.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-1">
                      {user.is_approved ? (
                        <span className="text-green-600 text-xs font-medium">Approved</span>
                      ) : (
                        <span className="text-orange-600 text-xs font-medium">Pending</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment:</span>
                    <span className="ml-1">
                      {user.payment_status === 'paid' ? (
                        <span className="text-green-600 text-xs font-medium">Paid</span>
                      ) : (
                        <span className="text-red-600 text-xs font-medium">Unpaid</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                    disabled={isAnyActionLoading()}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserCog size={16} />
                    Edit Full Profile
                  </button>
                  <button
                    onClick={() => handleApprovalToggle(user.id, user.is_approved)}
                    disabled={isAnyActionLoading()}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      user.is_approved
                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {isActionLoading(user.id, 'approval') ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <UserCheck size={16} />
                    )}
                    {user.is_approved ? 'Revoke Approval' : 'Approve User'}
                  </button>
                  <button
                    onClick={() => handlePaymentToggle(user.id, user.payment_status)}
                    disabled={isAnyActionLoading()}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      user.payment_status === 'paid'
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {isActionLoading(user.id, 'payment') ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <DollarSign size={16} />
                    )}
                    {user.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                    disabled={isAnyActionLoading()}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActionLoading(user.id, 'delete') ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age/Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id} className={`transition-all ${editingUser === user.id ? 'bg-blue-50 ring-2 ring-blue-300' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        {editingUser === user.id ? (
                          <div className="space-y-3 min-w-[200px]">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                              <input
                                type="text"
                                value={editForm.first_name}
                                onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                placeholder="Enter first name"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Middle Name</label>
                              <input
                                type="text"
                                value={editForm.middle_name}
                                onChange={(e) => setEditForm({...editForm, middle_name: e.target.value})}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                placeholder="Optional"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                              <input
                                type="text"
                                value={editForm.last_name}
                                onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                placeholder="Enter last name"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            {user.profile_picture ? (
                              <img
                                src={user.profile_picture}
                                alt={`${user.first_name} ${user.last_name}`}
                                className="h-20 w-16 flex-shrink-0 rounded-lg object-cover border-2 border-primary shadow-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&size=80&background=00D26A&color=fff`;
                                }}
                              />
                            ) : (
                              <div className="h-20 w-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary to-green-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.middle_name || ''} {user.last_name}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingUser === user.id ? (
                          <div className="space-y-3 min-w-[220px]">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                placeholder="email@example.com"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                              <input
                                type="text"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                placeholder="1234567890"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingUser === user.id ? (
                          <div className="space-y-3 min-w-[150px]">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                              <input
                                type="number"
                                value={editForm.age}
                                onChange={(e) => setEditForm({...editForm, age: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                placeholder="25"
                                min="18"
                                max="100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                              <select
                                value={editForm.gender}
                                onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm text-gray-900">{user.age} years</div>
                            <div className="text-sm text-gray-500 capitalize">{user.gender}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_approved ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircle size={16} />
                            Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                            <XCircle size={16} />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.payment_status === 'paid' ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <DollarSign size={16} />
                            Paid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                            <XCircle size={16} />
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          {editingUser === user.id ? (
                            <>
                              <button
                                onClick={() => handleEditSubmit(user.id)}
                                disabled={isAnyActionLoading()}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isActionLoading(user.id, 'edit') ? (
                                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Save size={16} />
                                )}
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                disabled={isAnyActionLoading()}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XIcon size={16} />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => navigate(`/users/${user.id}/edit`)}
                                disabled={isAnyActionLoading()}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <UserCog size={16} />
                                Full Edit
                              </button>
                              <button
                                onClick={() => startEditing(user)}
                                disabled={isAnyActionLoading()}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit size={16} />
                                Quick Edit
                              </button>
                              <button
                                onClick={() => handleApprovalToggle(user.id, user.is_approved)}
                                disabled={isAnyActionLoading()}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  user.is_approved
                                    ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                              >
                                {isActionLoading(user.id, 'approval') ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <UserCheck size={16} />
                                )}
                                {user.is_approved ? 'Revoke' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handlePaymentToggle(user.id, user.payment_status)}
                                disabled={isAnyActionLoading()}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  user.payment_status === 'paid'
                                    ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                {isActionLoading(user.id, 'payment') ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <DollarSign size={16} />
                                )}
                                {user.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                                disabled={isAnyActionLoading()}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isActionLoading(user.id, 'delete') ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 size={16} />
                                )}
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredUsers.length > usersPerPage && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserList;
