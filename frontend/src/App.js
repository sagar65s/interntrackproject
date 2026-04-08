import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/global.css';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentProjects from './pages/student/Projects';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminStudentDetail from './pages/admin/StudentDetail';

// SuperAdmin Pages
import SuperDashboard from './pages/superadmin/Dashboard';
import SuperStudents from './pages/superadmin/Students';
import SuperAdmins from './pages/superadmin/Admins';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0F172A' }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student */}
          <Route path="/student/dashboard" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/profile"   element={<PrivateRoute roles={['student']}><StudentProfile /></PrivateRoute>} />
          <Route path="/student/projects"  element={<PrivateRoute roles={['student']}><StudentProjects /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard"        element={<PrivateRoute roles={['admin','superadmin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/students"          element={<PrivateRoute roles={['admin','superadmin']}><AdminStudents /></PrivateRoute>} />
          <Route path="/admin/students/:id"      element={<PrivateRoute roles={['admin','superadmin']}><AdminStudentDetail /></PrivateRoute>} />

          {/* SuperAdmin */}
          <Route path="/superadmin/dashboard" element={<PrivateRoute roles={['superadmin']}><SuperDashboard /></PrivateRoute>} />
          <Route path="/superadmin/students"  element={<PrivateRoute roles={['superadmin']}><SuperStudents /></PrivateRoute>} />
          <Route path="/superadmin/admins"    element={<PrivateRoute roles={['superadmin']}><SuperAdmins /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="/unauthorized" element={
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:16,background:'#0F172A',color:'#E2E8F0'}}>
              <div style={{fontSize:'3rem'}}>🚫</div>
              <h2>Access Denied</h2>
              <p style={{color:'#94A3B8'}}>You don't have permission to view this page.</p>
              <a href="/" style={{color:'#3B82F6'}}>Go Home</a>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
