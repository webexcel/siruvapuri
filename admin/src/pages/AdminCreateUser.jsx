import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError } from '../utils/sweetalert';
import { UserPlus, Save, X, Search } from 'lucide-react';

const AdminCreateUser = () => {
  const [users, setUsers] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    age: '',
    gender: 'male',
    password: '',
    payment_status: 'unpaid',
    is_approved: false
  });
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleEmailSelect = async (email) => {
    if (!email) {
      handleReset();
      return;
    }

    setSelectedEmail(email);
    setFetchingUser(true);

    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = response.data.users.find(u => u.email === email);

      if (user) {
        setFormData({
          email: user.email,
          first_name: user.first_name || '',
          middle_name: user.middle_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          age: user.age || '',
          gender: user.gender || 'male',
          password: '',
          payment_status: user.payment_status || 'unpaid',
          is_approved: user.is_approved || false
        });
        showSuccess('User data loaded successfully!');
      }
    } catch (error) {
      showError('Failed to fetch user data');
    } finally {
      setFetchingUser(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        '/api/admin/users/create',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showSuccess('User created successfully!');

      // Reset form
      handleReset();
      fetchAllUsers(); // Refresh user list
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedEmail('');
    setFormData({
      email: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      phone: '',
      age: '',
      gender: 'male',
      password: '',
      payment_status: 'unpaid',
      is_approved: false
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 p-4 md:p-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <UserPlus className="text-primary" size={32} />
            Create New User
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">Add a new user or update existing user</p>
        </div>

        {/* Email Selection */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Search size={20} />
            Select Existing User (Optional)
          </h3>
          <div className="space-y-2">
            <label htmlFor="emailSelect" className="block text-sm font-medium text-blue-700">
              Choose user by email to auto-fill their information
            </label>
            <select
              id="emailSelect"
              value={selectedEmail}
              onChange={(e) => handleEmailSelect(e.target.value)}
              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
              disabled={fetchingUser}
            >
              <option value="">-- Create New User --</option>
              {users.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.email} - {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
            {fetchingUser && (
              <p className="text-sm text-blue-600">Loading user data...</p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    id="middle_name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    placeholder="Enter middle name (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    placeholder="Enter age"
                    min="18"
                    max="100"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    placeholder="9876543210"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    placeholder="Minimum 6 characters"
                    minLength="6"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
                </div>

                <div>
                  <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="payment_status"
                    name="payment_status"
                    value={formData.payment_status}
                    onChange={handleChange}
                    className="input-field text-sm md:text-base"
                    required
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_approved"
                      checked={formData.is_approved}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Approve this user immediately
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Save size={18} />
                {loading ? 'Creating User...' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <X size={18} />
                Reset Form
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
          <h3 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Important Notes:</h3>
          <ul className="text-xs md:text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Select an existing user from the dropdown to auto-fill their information</li>
            <li>All fields marked with <span className="text-red-500">*</span> are required</li>
            <li>Email is optional, but must be unique and valid if provided</li>
            <li>Phone number must be exactly 10 digits</li>
            <li>Password must be at least 6 characters long</li>
            <li>Users marked as approved can login immediately (if paid and have password)</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCreateUser;
