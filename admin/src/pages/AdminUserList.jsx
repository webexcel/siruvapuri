import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUserAPI, adminSettingsAPI } from '../utils/adminApi';
import AdminLayout from '../components/AdminLayout';
import SkeletonLoader from '../components/SkeletonLoader';
import { showSuccess, showError, showConfirm } from '../utils/sweetalert';
import {
  Search,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Crown,
  Star,
  Award,
  Sparkles
} from 'lucide-react';

// Rupee Icon Component
const RupeeIcon = ({ size = 16, className = '' }) => (
  <span className={`font-bold ${className}`} style={{ fontSize: size }}>₹</span>
);

const AdminUserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [columnSettings, setColumnSettings] = useState({
    select: true,
    user: true,
    contact: true,
    age_gender: true,
    payment: true,
    membership: true,
    actions: true
  });

  // Check if a column is visible
  const isColumnVisible = (key) => columnSettings[key] !== false;

  const setUserActionLoading = (userId, action, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [`${userId}-${action}`]: isLoading
    }));
    setGlobalLoading(isLoading);
  };

  const isActionLoading = (userId, action) => {
    return actionLoading[`${userId}-${action}`] || false;
  };

  const isAnyActionLoading = () => {
    return globalLoading;
  };

  // Get membership badge config
  const getMembershipBadge = (membershipType, isActive) => {
    if (!membershipType || !isActive) return null;

    const badges = {
      gold: { icon: Award, color: 'bg-yellow-500', label: 'Gold' },
      silver: { icon: Sparkles, color: 'bg-slate-400', label: 'Silver' },
      platinum: { icon: Star, color: 'bg-gray-400', label: 'Platinum' },
      premium: { icon: Crown, color: 'bg-purple-500', label: 'Premium' }
    };

    return badges[membershipType] || null;
  };

  // Get interested membership config
  const getInterestedMembershipConfig = (interestedMembership) => {
    if (!interestedMembership) return null;

    const configs = {
      gold: { icon: Award, bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-300', label: 'Gold' },
      silver: { icon: Sparkles, bgColor: 'bg-slate-100', textColor: 'text-slate-700', borderColor: 'border-slate-300', label: 'Silver' },
      platinum: { icon: Star, bgColor: 'bg-gray-100', textColor: 'text-gray-700', borderColor: 'border-gray-300', label: 'Platinum' },
      premium: { icon: Crown, bgColor: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-300', label: 'Premium' }
    };

    return configs[interestedMembership] || null;
  };

  useEffect(() => {
    fetchUsers();
    fetchColumnSettings();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const fetchColumnSettings = async () => {
    try {
      const response = await adminSettingsAPI.getColumnSettings();
      const settings = response.data.settings?.userList || [];
      const settingsMap = {};
      settings.forEach(col => {
        settingsMap[col.key] = col.enabled;
      });
      setColumnSettings(settingsMap);
    } catch (error) {
      console.error('Failed to fetch column settings:', error);
      // Keep defaults if fetch fails
    }
  };

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
          user.phone?.includes(searchTerm)
      );
    }

    // Status filter - now based on payment status
    if (filterStatus !== 'all') {
      if (filterStatus === 'paid') {
        filtered = filtered.filter((user) => user.payment_status === 'paid');
      } else if (filterStatus === 'unpaid') {
        filtered = filtered.filter((user) => user.payment_status !== 'paid');
      }
    }

    setFilteredUsers(filtered);
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
        setSelectedUsers(prev => prev.filter(id => id !== userId));
        await fetchUsers(true);
      } catch (error) {
        showError('Failed to delete user');
      } finally {
        setUserActionLoading(userId, 'delete', false);
      }
    }
  };

  // Handle select all users on current page
  const handleSelectAll = (checked) => {
    if (checked) {
      const currentPageUserIds = currentUsers.map(user => user.id);
      setSelectedUsers(currentPageUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  // Handle individual user selection
  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Pagination calculations - MUST be before isAllSelected
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Check if all current page users are selected
  const isAllSelected = currentUsers.length > 0 && currentUsers.every(user => selectedUsers.includes(user.id));
  const isSomeSelected = selectedUsers.length > 0;

  // Handle delete all selected users
  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) return;

    const result = await showConfirm(
      `Delete ${selectedUsers.length} selected user(s)? This action cannot be undone.`,
      'Confirm Bulk Delete'
    );

    if (result.isConfirmed) {
      setDeletingSelected(true);
      setGlobalLoading(true);
      let successCount = 0;
      let failCount = 0;

      for (const userId of selectedUsers) {
        try {
          await adminUserAPI.deleteUser(userId);
          successCount++;
        } catch (error) {
          failCount++;
        }
      }

      setSelectedUsers([]);
      await fetchUsers(true);
      setDeletingSelected(false);
      setGlobalLoading(false);

      if (failCount === 0) {
        showSuccess(`Successfully deleted ${successCount} user(s)!`);
      } else {
        showError(`Deleted ${successCount} user(s), but ${failCount} failed.`);
      }
    }
  };

  // Clear selection when page changes
  useEffect(() => {
    setSelectedUsers([]);
  }, [currentPage]);

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
                <option value="all">All Users</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile View (Cards) */}
        <div className="block lg:hidden space-y-4">
          {/* Mobile Bulk Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={isAnyActionLoading() || currentUsers.length === 0}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({currentUsers.length})
                </span>
              </label>
              {isSomeSelected && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deletingSelected}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingSelected ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete ({selectedUsers.length})
                </button>
              )}
            </div>
          </div>

          {currentUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              No users found
            </div>
          ) : (
            currentUsers.map((user) => {
              const membershipBadge = getMembershipBadge(user.membership_type, user.is_membership_active);
              const isSelected = selectedUsers.includes(user.id);
              return (
              <div key={user.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${isSelected ? 'border-red-300 bg-red-50' : ''}`}>
                <div className="flex items-start gap-4 mb-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    disabled={isAnyActionLoading()}
                    className="w-5 h-5 mt-1 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                  />
                  <div className="relative flex-shrink-0">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="h-24 w-20 rounded-lg object-cover shadow-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&size=96&background=00D26A&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="h-24 w-20 rounded-lg bg-gradient-to-br from-primary to-green-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </div>
                    )}
                    {membershipBadge && (
                      <div className={`absolute -top-1 -right-1 ${membershipBadge.color} text-white p-1 rounded-full shadow-md`} title={membershipBadge.label}>
                        <membershipBadge.icon size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate text-lg">
                      {user.first_name} {user.middle_name || ''} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-1 font-medium">{user.age}y</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-1 font-medium capitalize">{user.gender?.charAt(0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment:</span>
                    <span className="ml-1">
                      {user.payment_status === 'paid' ? (
                        <span className="text-green-600 font-bold">₹</span>
                      ) : (
                        <span className="text-red-600 font-bold">₹</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Interested:</span>
                    <span className="ml-1">
                      {(() => {
                        const interestedConfig = getInterestedMembershipConfig(user.interested_membership);
                        if (interestedConfig) {
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${interestedConfig.bgColor} ${interestedConfig.textColor}`}>
                              <interestedConfig.icon size={12} />
                              {interestedConfig.label}
                            </span>
                          );
                        }
                        return <span className="text-gray-400">-</span>;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                    disabled={isAnyActionLoading()}
                    className="flex-1 flex items-center justify-center p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit Profile"
                  >
                    <UserCog size={18} />
                  </button>
                  <button
                    onClick={() => handlePaymentToggle(user.id, user.payment_status)}
                    disabled={isAnyActionLoading()}
                    className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      user.payment_status === 'paid'
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                    title={user.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                  >
                    {isActionLoading(user.id, 'payment') ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <RupeeIcon size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                    disabled={isAnyActionLoading()}
                    className="flex-1 flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    {isActionLoading(user.id, 'delete') ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            );})
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Bulk Actions Bar */}
          {isSomeSelected && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between">
              <span className="text-sm text-red-700 font-medium">
                {selectedUsers.length} user(s) selected on this page
              </span>
              <button
                onClick={handleDeleteSelected}
                disabled={deletingSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingSelected ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 size={16} />
                )}
                Delete Selected
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isColumnVisible('select') && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          disabled={isAnyActionLoading() || currentUsers.length === 0}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                          title="Select all users on this page"
                        />
                        <span className="hidden xl:inline">Select</span>
                      </div>
                    </th>
                  )}
                  {isColumnVisible('user') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                  )}
                  {isColumnVisible('contact') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                  )}
                  {isColumnVisible('age_gender') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age/Gender
                    </th>
                  )}
                  {isColumnVisible('payment') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                  )}
                  {isColumnVisible('membership') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membership
                    </th>
                  )}
                  {isColumnVisible('actions') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(columnSettings).filter(v => v).length || 7} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => {
                    const membershipBadge = getMembershipBadge(user.membership_type, user.is_membership_active);
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                    <tr key={user.id} className={`transition-all hover:bg-gray-50 ${isSelected ? 'bg-red-50' : ''}`}>
                      {isColumnVisible('select') && (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                            disabled={isAnyActionLoading()}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                      )}
                      {isColumnVisible('user') && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {user.profile_picture ? (
                                <img
                                  src={user.profile_picture}
                                  alt={`${user.first_name} ${user.last_name}`}
                                  className="h-24 w-20 rounded-lg object-cover shadow-md"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&size=80&background=00D26A&color=fff`;
                                  }}
                                />
                              ) : (
                                <div className="h-20 w-16 rounded-lg bg-gradient-to-br from-primary to-green-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.middle_name || ''} {user.last_name}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      {isColumnVisible('contact') && (
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </td>
                      )}
                      {isColumnVisible('age_gender') && (
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{user.age} years</div>
                          <div className="text-sm text-gray-500 capitalize">{user.gender}</div>
                        </td>
                      )}
                      {isColumnVisible('payment') && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.payment_status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full">
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 text-sm font-semibold bg-red-100 px-3 py-1 rounded-full">
                              Unpaid
                            </span>
                          )}
                        </td>
                      )}
                      {isColumnVisible('membership') && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {membershipBadge ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
                              user.membership_type === 'gold' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                              user.membership_type === 'silver' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                              user.membership_type === 'platinum' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                              'bg-purple-100 text-purple-700 border-purple-300'
                            }`}>
                              <membershipBadge.icon size={14} />
                              {membershipBadge.label}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      )}
                      {isColumnVisible('actions') && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/users/${user.id}/edit`)}
                              disabled={isAnyActionLoading()}
                              className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit Profile"
                            >
                              <UserCog size={18} />
                            </button>
                            <button
                              onClick={() => handlePaymentToggle(user.id, user.payment_status)}
                              disabled={isAnyActionLoading()}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.payment_status === 'paid'
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                              title={user.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                            >
                              {isActionLoading(user.id, 'payment') ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <RupeeIcon size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                              disabled={isAnyActionLoading()}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                            >
                            {isActionLoading(user.id, 'delete') ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );})
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
