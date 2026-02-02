import { Navigate } from 'react-router-dom';

const SuperAdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('superadmin_token');
  const isSuperAdmin = localStorage.getItem('isSuperAdmin');

  // Check if user is authenticated as superadmin
  if (!token || isSuperAdmin !== 'true') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default SuperAdminProtectedRoute;
