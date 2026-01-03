import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { Home, Heart, Search, Mail, Menu, X, LogOut } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, icon: Icon }) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
        isActive(to)
          ? 'bg-gradient-to-r from-primary to-green-500 text-white shadow-lg shadow-primary/30'
          : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {Icon && <Icon size={18} />}
      <span>{children}</span>
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section - Bigger */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <img
                src="/images/logo.png"
                alt="Siruvapuri Murugan Matrimony"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Siruvapuri Murugan
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-primary tracking-wider uppercase">
                Matrimony
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Center Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1">
            {[
              { path: '/', label: 'Home' },
              { path: '/success-stories', label: 'Success Stories' },
              { path: '/help', label: 'Help' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-white text-primary shadow-md'
                    : 'text-gray-600 hover:text-primary hover:bg-white/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Navigation - Right Side */}
          {isAuthenticated ? (
            <nav className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1">
                <NavLink to="/dashboard" icon={Home}>Dashboard</NavLink>
                <NavLink to="/recommendations" icon={Heart}>Matches</NavLink>
                <NavLink to="/search" icon={Search}>Search</NavLink>
                <NavLink to="/interests" icon={Mail}>Interests</NavLink>
              </div>

              {/* User Profile Section */}
              <div className="flex items-center gap-3 ml-2 pl-3 border-l-2 border-gray-200">
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-2 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user?.full_name || 'Profile'}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&size=80&background=1EA826&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center text-white font-bold ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300">
                        {user?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">
                      {user?.full_name}
                    </span>
                    <span className="text-xs text-gray-500">Edit Profile</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full cursor-pointer bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-3">
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-green-500 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                Register
              </Link>
            </nav>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-full bg-gray-100 hover:bg-primary/10 hover:text-primary transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-gray-100">
            {/* Common Links */}
            <div className="flex flex-col gap-1 mb-4">
              {[
                { path: '/', label: 'Home' },
                { path: '/success-stories', label: 'Success Stories' },
                { path: '/help', label: 'Help' },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col gap-1 border-t border-gray-100 pt-4">
                <NavLink to="/dashboard" icon={Home}>Dashboard</NavLink>
                <NavLink to="/recommendations" icon={Heart}>Matches</NavLink>
                <NavLink to="/search" icon={Search}>Search</NavLink>
                <NavLink to="/interests" icon={Mail}>Interests</NavLink>
                <div className="border-t border-gray-100 my-3 pt-3">
                  <Link
                    to="/profile/edit"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user?.full_name || 'Profile'}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&size=80&background=1EA826&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center text-white font-bold text-lg">
                        {user?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{user?.full_name}</span>
                      <span className="text-xs text-primary">Edit Profile</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full mt-3 px-4 py-3 cursor-pointer rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                <Link
                  to="/login"
                  className="px-4 py-3 rounded-xl text-center bg-gradient-to-r from-primary to-green-500 text-white font-semibold shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
