import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary';
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">
              Matri<span className="text-primary">Match</span>
            </span>
          </Link>

          {isAuthenticated ? (
            <nav className="flex items-center space-x-6">
              <Link to="/dashboard" className={`transition-colors ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
              <Link to="/recommendations" className={`transition-colors ${isActive('/recommendations')}`}>
                Recommendations
              </Link>
              <Link to="/search" className={`transition-colors ${isActive('/search')}`}>
                Search
              </Link>
              <Link to="/interests" className={`transition-colors ${isActive('/interests')}`}>
                Interests
              </Link>
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <Link to="/profile/edit" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.full_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Logout
                </button>
              </div>
            </nav>
          ) : (
            <nav className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
