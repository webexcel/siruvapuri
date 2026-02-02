import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ModuleProvider } from './context/ModuleContext';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserList from './pages/AdminUserList';
import AdminEditUser from './pages/AdminEditUser';
import AdminCreateUser from './pages/AdminCreateUser';
import AdminBulkUpload from './pages/AdminBulkUpload';
import AdminSetPassword from './pages/AdminSetPassword';
import AdminManagePasswords from './pages/AdminManagePasswords';
import AdminMatches from './pages/AdminMatches';
import AdminAssignMatchNew from './pages/AdminAssignMatchNew';
import AdminInterests from './pages/AdminInterests';
import AdminMembership from './pages/AdminMembership'; // Dynamically controlled by superadmin module settings
import AdminSettings from './pages/AdminSettings';

// Admin Components
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ModuleProvider>
          <Routes>
          {/* Admin Login - Public */}
          <Route path="/login" element={<AdminLogin />} />

        {/* Admin Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminProtectedRoute>
              <AdminUserList />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/users/create"
          element={
            <AdminProtectedRoute>
              <AdminCreateUser />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/users/:userId/edit"
          element={
            <AdminProtectedRoute>
              <AdminEditUser />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/users/bulk-upload"
          element={
            <AdminProtectedRoute>
              <AdminBulkUpload />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/set-password"
          element={
            <AdminProtectedRoute>
              <AdminSetPassword />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/manage-passwords"
          element={
            <AdminProtectedRoute>
              <AdminManagePasswords />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <AdminProtectedRoute>
              <AdminMatches />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/assign-match"
          element={
            <AdminProtectedRoute>
              <AdminAssignMatchNew />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/interests"
          element={
            <AdminProtectedRoute>
              <AdminInterests />
            </AdminProtectedRoute>
          }
        />
        {/* Membership route - Dynamically controlled by superadmin module settings */}
          <Route
            path="/membership"
            element={
              <AdminProtectedRoute>
                <AdminMembership />
              </AdminProtectedRoute>
            }
          />
                <Route
          path="/settings"
          element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          }
        />

          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ModuleProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
