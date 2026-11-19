import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, ClipboardCheck, Plus, Bell, Activity, User } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export default function BottomNav() {
  const { user, isStudent } = useAuth();
  const location = useLocation();

  const getDashboardLink = () => {
    if (isStudent) return '/student/dashboard';
    return '/admin/dashboard';
  };

  const getComplaintsLink = () => {
    if (isStudent) return '/student/complaints';
    return '/admin/complaints';
  };

  const canViewSystemStatus = Boolean(
    user?.role === 'SuperAdmin' ||
    String(user?.role || '').toLowerCase() === 'superadmin' ||
    String(user?.role || '').toLowerCase() === 'super_admin' ||
    String(user?.role || '').toLowerCase() === 'admin'
  );

  return (
    <nav className="cc-mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <NavLink
        to={getDashboardLink()}
        className={({ isActive }) => `cc-bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutGrid size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to={getComplaintsLink()}
        className={({ isActive }) =>
          `cc-bottom-nav-item ${isActive || location.pathname === '/complaints' ? 'active' : ''}`
        }
      >
        <ClipboardCheck size={20} />
        <span>Tickets</span>
      </NavLink>

      {/* Floating Center '+' Button for New Complaint - Eligible Students Only */}
      {isStudent && (
        <Link
          to="/complaints/new"
          className="cc-bottom-floating-cta"
          aria-label="Submit new complaint"
        >
          <Plus size={24} strokeWidth={2.8} />
        </Link>
      )}

      <NavLink
        to="/notifications"
        className={({ isActive }) => `cc-bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Bell size={20} />
        <span>Alerts</span>
      </NavLink>

      {canViewSystemStatus ? (
        <NavLink
          to="/system-status"
          className={({ isActive }) => `cc-bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <Activity size={20} />
          <span>Status</span>
        </NavLink>
      ) : (
        <NavLink
          to="/profile"
          className={({ isActive }) => `cc-bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      )}
    </nav>
  );
}
