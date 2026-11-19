import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Menu,
  Bell,
  Search,
  Activity,
  User,
  GraduationCap,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export default function Header({ onToggleMobileNav }) {
  const { user, isStudent, isDeptAdmin, isSuperAdmin } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/student/dashboard') || (path === '/' && isStudent)) return 'Student Portal Dashboard';
    if (path.startsWith('/admin/dashboard') || (path === '/' && !isStudent)) return isSuperAdmin ? 'Executive Oversight Portal' : 'Department Operations Desk';
    if (path.startsWith('/student/complaints') || path.startsWith('/complaints') && !path.includes('/new') && !path.match(/\/complaints\/\d+/)) {
      return isStudent ? 'My Registered Grievances' : 'Department Ticket Queue';
    }
    if (path.startsWith('/complaints/new') || path.startsWith('/student/new')) return 'File Institutional Grievance';
    if (path.match(/\/complaints\/\d+/)) return 'Grievance Docket Details';
    if (path.startsWith('/admin/analytics') || path.startsWith('/analytics')) return 'Institutional Resolution Analytics';
    if (path.startsWith('/notifications') || path.startsWith('/alerts')) return 'Notifications & Operational Alerts';
    if (path.startsWith('/system-status')) return 'System Diagnostics & Telemetry';
    if (path.startsWith('/403')) return 'Access Control Violation (403)';
    return 'CampusConnect Operations';
  };

  return (
    <header className="cc-top-header">
      <div className="cc-header-left">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          className="cc-mobile-menu-btn"
          onClick={onToggleMobileNav}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Brand Link on Mobile */}
        <Link to="/" className="cc-mobile-brand">
          <div className="cc-mobile-brand-icon">
            <ShieldCheck size={18} strokeWidth={2.5} />
          </div>
          <span className="cc-mobile-brand-title">CampusConnect</span>
        </Link>

        {/* Desktop Page Title & Context */}
        <div className="cc-header-title-box">
          <h1 className="cc-page-heading">{getPageTitle()}</h1>
        </div>
      </div>

      <div className="cc-header-right">
        {/* Quick System Telemetry link - Admin/SuperAdmin only */}
        {Boolean(
          isSuperAdmin ||
          String(user?.role || '').toLowerCase() === 'superadmin' ||
          String(user?.role || '').toLowerCase() === 'super_admin' ||
          String(user?.role || '').toLowerCase() === 'admin'
        ) && (
          <Link
            to="/system-status"
            className="cc-header-icon-action"
            title="System Telemetry & Database Diagnostics"
            aria-label="System status"
          >
            <Activity size={18} />
          </Link>
        )}

        {/* Notifications shortcut */}
        <Link
          to="/notifications"
          className="cc-header-icon-action"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </Link>

        {/* User Pill */}
        {user && (
          <Link
            to="/profile"
            className="cc-header-user-tag"
            title="View Profile & Account Details"
          >
            <div className="cc-header-avatar">
              {isStudent ? (
                <GraduationCap size={15} />
              ) : isSuperAdmin ? (
                <Sparkles size={15} />
              ) : (
                <Building2 size={15} />
              )}
            </div>
            <div className="cc-header-user-meta">
              <span className="cc-header-user-name">
                {user.fullName || user.name || 'User'}
              </span>
              <span className="cc-header-role-text">
                {isSuperAdmin
                  ? 'SuperAdmin'
                  : isDeptAdmin
                  ? user.departmentName || 'Admin'
                  : user.registrationNumber || 'Student'}
              </span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
