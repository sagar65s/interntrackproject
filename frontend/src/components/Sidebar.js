import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navConfig = {
  student: [
    { label: 'Dashboard',  path: '/student/dashboard', icon: '⊞' },
    { label: 'My Profile', path: '/student/profile',   icon: '👤' },
    { label: 'Projects',   path: '/student/projects',  icon: '📁' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '⊞' },
    { label: 'Students',  path: '/admin/students',  icon: '🎓' },
  ],
  superadmin: [
    { label: 'Dashboard', path: '/superadmin/dashboard', icon: '⊞' },
    { label: 'Students',  path: '/superadmin/students',  icon: '🎓' },
    { label: 'Admins',    path: '/superadmin/admins',    icon: '🛡️' },
    { label: 'All Students (Admin View)', path: '/admin/students', icon: '👁️' },
  ],
};

const roleLabel = { student: 'Student', admin: 'Admin', superadmin: 'Super Admin' };

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = navConfig[user?.role] || [];
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?';

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">IT</div>
          <div className="sidebar-logo-text">Intern<span>Track</span></div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => handleNav(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{roleLabel[user?.role]}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-full btn-sm" onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
