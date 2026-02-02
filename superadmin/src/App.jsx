import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import { SuperAdminLogin, SuperAdminDashboard, SidebarManagement, ColumnManagement, ModuleManagement } from './pages';

// Components
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login - Public */}
        <Route path="/login" element={<SuperAdminLogin />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <SuperAdminProtectedRoute>
              <SuperAdminDashboard />
            </SuperAdminProtectedRoute>
          }
        />
        <Route
          path="/sidebar-management"
          element={
            <SuperAdminProtectedRoute>
              <SidebarManagement />
            </SuperAdminProtectedRoute>
          }
        />
        <Route
          path="/column-management"
          element={
            <SuperAdminProtectedRoute>
              <ColumnManagement />
            </SuperAdminProtectedRoute>
          }
        />
        <Route
          path="/module-management"
          element={
            <SuperAdminProtectedRoute>
              <ModuleManagement />
            </SuperAdminProtectedRoute>
          }
        />

        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
