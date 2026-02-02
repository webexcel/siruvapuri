import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthAPI } from '../utils/adminApi';
import { showSuccess, showError } from '../utils/sweetalert';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin');
    if (token && isAdmin === 'true') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminAuthAPI.login(formData);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAdmin', 'true');
        await showSuccess('Welcome to Admin Panel!');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Invalid email or password. Please try again.';
      showError(errorMsg, 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-green-400 rounded-full flex items-center justify-center">
              <Shield size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Login</h1>
          <p className="text-gray-600">Access the admin panel</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="admin@siruvapuri.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Login as Admin
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
