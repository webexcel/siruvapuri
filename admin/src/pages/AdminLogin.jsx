import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthAPI } from '../utils/adminApi';
import { showSuccess, showError } from '../utils/sweetalert';
import { Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-green-900 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-[40%] right-[5%] w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <img
            src="/images/logo.png"
            alt="Siruvapuri Murugan Matrimony"
            className="h-auto w-[300px] object-contain drop-shadow-2xl mb-2"
          />
          <h1 className="text-4xl font-bold text-center mb-3 text-white">
            Siruvapuri Murugan
          </h1>
          <p className="text-lg font-medium tracking-widest uppercase text-green-200 mb-6">
            Matrimony
          </p>
          <div className="w-16 h-0.5 bg-green-300/50 mb-6" />
          <p className="text-center text-green-100/80 text-sm max-w-xs leading-relaxed">
            A trusted platform for South Indian weddings, bringing families together with tradition and technology.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[var(--color-ivory)] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img
              src="/images/logo.png"
              alt="Siruvapuri Murugan Matrimony"
              className="h-24 w-24 object-contain drop-shadow-lg mb-2"
            />
            <h2 className="text-2xl font-bold text-gray-800">Siruvapuri Murugan</h2>
            <p className="text-xs font-medium tracking-widest uppercase text-primary">Matrimony</p>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h2>
            <p className="text-gray-500">Sign in to manage the platform</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-all text-sm"
                  placeholder="admin@siruvapuri.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-all text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-10">
            &copy; {new Date().getFullYear()} Siruvapuri Murugan Matrimony. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
