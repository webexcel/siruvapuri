import { useState, useEffect, useRef } from 'react';
import { adminUserAPI, adminMembershipAPI } from '../utils/adminApi';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError } from '../utils/sweetalert';
import { Key, Save, Search, X, User, ChevronDown, Check, AlertCircle, Crown, Award, Star } from 'lucide-react';

// Helper function to get color classes based on plan color
const getColorClasses = (color) => {
  if (color?.includes('yellow')) {
    return { bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-400', gradient: 'from-yellow-400 to-amber-500' };
  } else if (color?.includes('gray')) {
    return { bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-400', gradient: 'from-gray-400 to-gray-600' };
  } else if (color?.includes('purple')) {
    return { bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-400', gradient: 'from-purple-500 to-purple-700' };
  } else if (color?.includes('blue')) {
    return { bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-400', gradient: 'from-blue-400 to-blue-600' };
  } else if (color?.includes('green')) {
    return { bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-400', gradient: 'from-green-400 to-green-600' };
  } else if (color?.includes('orange')) {
    return { bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-400', gradient: 'from-orange-400 to-orange-600' };
  }
  return { bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-400', gradient: 'from-gray-400 to-gray-600' };
};

const AdminSetPassword = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const search = searchTerm.toLowerCase();
      const filtered = users.filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phone?.includes(search)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchData = async () => {
    setFetchingUsers(true);
    try {
      const [usersResponse, plansResponse] = await Promise.all([
        adminUserAPI.getAllUsers(),
        adminMembershipAPI.getPlans()
      ]);
      const allUsers = usersResponse.data.users || [];
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      // Only show active plans
      const activePlans = (plansResponse.data.plans || []).filter(plan => plan.is_active);
      setMembershipPlans(activePlans);
    } catch (error) {
      showError('Failed to fetch data');
      console.error('Fetch data error:', error);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(`${user.first_name} ${user.last_name} - ${user.email}`);
    setIsDropdownOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    // Pre-select current membership if exists
    setSelectedMembership(user.membership_type?.toLowerCase() || '');
  };

  const clearSelection = () => {
    setSelectedUser(null);
    setSearchTerm('');
    setNewPassword('');
    setConfirmPassword('');
    setSelectedMembership('');
    inputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      showError('Please select a user first');
      return;
    }

    if (!selectedMembership) {
      showError('Please select a membership plan');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // First assign membership
      await adminUserAPI.assignMembership(selectedUser.id, { membership_type: selectedMembership });

      // Then set password
      await adminUserAPI.setPassword(selectedUser.id, { password: newPassword });

      const plan = membershipPlans.find(p => p.name.toLowerCase() === selectedMembership);
      showSuccess(`${plan?.name || selectedMembership} membership assigned and password set for ${selectedUser.first_name}!`);
      clearSelection();
      fetchData();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to set password and membership');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (user) => {
    if (user.has_password) {
      return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Has Password</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">No Password</span>;
  };

  const getPaymentBadge = (status) => {
    if (status === 'paid') {
      return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Paid</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">Unpaid</span>;
  };

  const getApprovalBadge = (isApproved) => {
    if (isApproved) {
      return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Approved</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Pending</span>;
  };

  const getMembershipBadge = (membershipType) => {
    if (!membershipType) return <span className="text-gray-400 text-xs">None</span>;
    const plan = membershipPlans.find(p => p.name.toLowerCase() === membershipType.toLowerCase());
    const colorClasses = plan ? getColorClasses(plan.color) : getColorClasses(null);
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses.bgColor} ${colorClasses.textColor} border ${colorClasses.borderColor}`}>
        {plan?.name || membershipType}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Key className="text-primary" size={32} />
            Set Password & Membership
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Search and select a user to assign membership and set their login password
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Searchable User Dropdown */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Search size={18} />
                Search & Select User
              </label>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                    if (selectedUser && e.target.value !== `${selectedUser.first_name} ${selectedUser.last_name} - ${selectedUser.email}`) {
                      setSelectedUser(null);
                      setSelectedMembership('');
                    }
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Type to search by name, email or phone..."
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

                {selectedUser ? (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                ) : (
                  <ChevronDown
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    size={20}
                  />
                )}
              </div>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  {fetchingUsers ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      Loading users...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <AlertCircle className="mx-auto mb-2 text-gray-400" size={24} />
                      {searchTerm ? 'No users found matching your search' : 'No users available'}
                    </div>
                  ) : (
                    <ul className="py-2">
                      {filteredUsers.map((user) => (
                        <li
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            selectedUser?.id === user.id ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                                {user.profile_picture ? (
                                  <img
                                    src={user.profile_picture}
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <User size={20} className="text-primary" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">
                                  {user.first_name} {user.last_name}
                                  {selectedUser?.id === user.id && (
                                    <Check className="inline ml-2 text-green-500" size={16} />
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-xs text-gray-400">{user.phone}</div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              {getStatusBadge(user)}
                              {getMembershipBadge(user.membership_type)}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Selected User Details Card */}
            {selectedUser && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                    {selectedUser.profile_picture ? (
                      <img
                        src={selectedUser.profile_picture}
                        alt=""
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <User size={28} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-500 block text-xs mb-1">Phone</span>
                    <span className="font-medium text-gray-800">{selectedUser.phone || 'N/A'}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-500 block text-xs mb-1">Age / Gender</span>
                    <span className="font-medium text-gray-800 capitalize">{selectedUser.age || 'N/A'} / {selectedUser.gender || 'N/A'}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-500 block text-xs mb-1">Payment</span>
                    {getPaymentBadge(selectedUser.payment_status)}
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-500 block text-xs mb-1">Password</span>
                    {getStatusBadge(selectedUser)}
                  </div>
                </div>
              </div>
            )}

            {/* Membership Selection */}
            {selectedUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Crown size={18} className="text-primary" />
                  Select Membership Plan <span className="text-red-500">*</span>
                </label>

                {membershipPlans.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <AlertCircle className="mx-auto mb-2 text-yellow-600" size={24} />
                    <p className="text-yellow-800 text-sm">No membership plans available. Please create plans in the Membership section first.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {membershipPlans.map((plan) => {
                      const colorClasses = getColorClasses(plan.color);
                      const isSelected = selectedMembership === plan.name.toLowerCase();
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedMembership(plan.name.toLowerCase())}
                          className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? 'ring-4 ring-primary ring-offset-2 shadow-lg scale-[1.02]'
                              : 'hover:shadow-md border border-gray-200'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-lg">
                              <Check size={16} className="text-primary" />
                            </div>
                          )}
                          <div className={`bg-gradient-to-r ${plan.color || 'from-gray-400 to-gray-600'} p-4 text-white`}>
                            <div className="flex items-center gap-2 mb-1">
                              <Crown size={18} />
                              <h4 className="font-bold">{plan.name}</h4>
                            </div>
                            <div className="text-2xl font-bold">Rs. {Number(plan.price).toLocaleString()}</div>
                            <p className="text-sm opacity-90">{plan.duration_months} Months</p>
                          </div>
                          <div className="bg-white p-3">
                            <ul className="space-y-1">
                              {(plan.features || []).slice(0, 3).map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                  <Check size={12} className="text-green-500 flex-shrink-0" />
                                  <span className="truncate">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Password Fields */}
            {selectedUser && selectedMembership && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <Key size={18} className="text-primary" />
                  Set Login Password
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Min 6 characters"
                      minLength="6"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Re-enter password"
                      minLength="6"
                      required
                    />
                  </div>
                </div>

                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <X size={14} /> Passwords do not match
                  </p>
                )}
                {newPassword && confirmPassword && newPassword === confirmPassword && (
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <Check size={14} /> Passwords match
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || newPassword !== confirmPassword || newPassword.length < 6 || !selectedMembership}
                  className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Assign Membership & Set Password
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Help Text */}
            {!selectedUser && !fetchingUsers && (
              <div className="text-center py-8 text-gray-500">
                <User className="mx-auto mb-3 text-gray-300" size={48} />
                <p>Search for a user above to assign membership and set password</p>
                <p className="text-sm mt-1">You can search by name, email, or phone number</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSetPassword;
