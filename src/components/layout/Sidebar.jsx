import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  BarChart3,
  LogOut,
  GraduationCap,
  Building2,
  Sparkles,
  Bell,
  Activity,
  X,
  Radio,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../ui/ToastContext';
import api from '../../lib/api/client';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isStudent, isDeptAdmin, isSuperAdmin } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSystemOnline, setIsSystemOnline] = useState(true);

  const prevPathRef = React.useRef(location.pathname);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      if (isOpen) {
        onClose?.();
      }
    }
  }, [location.pathname, isOpen, onClose]);

  // Check unread count & system connectivity
  useEffect(() => {
    let isMounted = true;
    const checkState = async () => {
      try {
        if (user) {
          const notifRes = await api.get('/notifications');
          if (isMounted && notifRes.data?.success) {
            const list = notifRes.data.data || [];
            setUnreadCount(list.filter((n) => !n.isRead).length);
          }
        }
        const healthRes = await api.get('/health');
        if (isMounted) {
          setIsSystemOnline(healthRes.status === 200);
        }
      } catch (err) {
        if (isMounted) setIsSystemOnline(false);
      }
    };

    checkState();
    const interval = setInterval(checkState, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.');
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isDeptAdmin) return user?.departmentName || 'Dept Administrator';
    return 'Student Member';
  };

  const getRoleBadgeClass = () => {
    if (isSuperAdmin) return 'cc-role-badge-super';
    if (isDeptAdmin) return 'cc-role-badge-dept';
    return 'cc-role-badge-student';
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="cc-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`cc-sidebar ${isOpen ? 'cc-sidebar-open cc-sidebar-mobile-open' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="cc-sidebar-header">
          <Link to="/" className="cc-brand-link">
            <div className="cc-brand-icon">
              <ShieldCheck size={22} strokeWidth={2.5} />
            </div>
            <div className="cc-brand-text">
              <span className="cc-brand-name">CampusConnect</span>
              <span className="cc-brand-tag">BIIT PORTAL</span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            className="cc-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="cc-sidebar-user-pill">
            <div className="cc-user-avatar">
              {isStudent ? (
                <GraduationCap size={18} />
              ) : isSuperAdmin ? (
                <Sparkles size={18} />
              ) : (
                <Building2 size={18} />
              )}
            </div>
            <div className="cc-user-info-text">
              <span className="cc-user-name" title={user.fullName || user.name}>
                {user.fullName || user.name || 'Campus User'}
              </span>
              <div className="cc-user-role-row">
                <span className={`cc-role-badge ${getRoleBadgeClass()}`}>
                  {getRoleLabel()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Primary Action Button for Student */}
        {isStudent && (
          <div className="cc-sidebar-quick-action">
            <Link to="/complaints/new" className="cc-sidebar-cta-btn">
              <PlusCircle size={17} strokeWidth={2.4} />
              <span>File New Grievance</span>
            </Link>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="cc-sidebar-nav-scroll">
          {/* Main Navigation */}
          <div className="cc-nav-group">
            <span className="cc-nav-group-title">MAIN WORKSPACE</span>

            {/* Student Links */}
            {isStudent && (
              <>
                <NavLink
                  to="/student/dashboard"
                  end
                  className={({ isActive }) =>
                    `cc-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/student/complaints"
                  className={({ isActive }) =>
                    `cc-nav-link ${isActive || location.pathname === '/complaints' ? 'active' : ''}`
                  }
                >
                  <ClipboardList size={18} />
                  <span>My Complaints</span>
                </NavLink>

                <NavLink
                  to="/complaints/new"
                  className={({ isActive }) =>
                    `cc-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <PlusCircle size={18} />
                  <span>Submit Ticket</span>
                </NavLink>
              </>
            )}

            {/* Dept Admin Links */}
            {isDeptAdmin && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  end
                  className={({ isActive }) =>
                    `cc-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <LayoutDashboard size={18} />
                  <span>Dept Overview</span>
                </NavLink>

                <NavLink
                  to="/admin/complaints"
                  className={({ isActive }) =>
                    `cc-nav-link ${isActive || location.pathname === '/complaints' ? 'active' : ''}`
                  }
                >
                  <ClipboardList size={18} />
                  <span>Department Queue</span>
                </NavLink>
              </>
            )}

            {/* Super Admin Links */}
            {isSuperAdmin && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  end
                  className={({ isActive }) =>
                    `cc-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <LayoutDashboard size={18} />
                  <span>Executive Overview</span>
                </NavLink>

                <NavLink
                  to="/admin/complaints"
                  className={({ isActive }) =>
                    `cc-nav-link ${isActive || location.pathname === '/complaints' ? 'active' : ''}`
                  }
                >
                  <ClipboardList size={18} />
                  <span>Campus-Wide Queue</span>
                </NavLink>

                <NavLink
                  to="/admin/analytics"
                  className={({ isActive }) =>
                    `cc-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <BarChart3 size={18} />
                  <span>Campus Analytics</span>
                </NavLink>
              </>
            )}
          </div>

          {/* Communications & Tools */}
          <div className="cc-nav-group">
            <span className="cc-nav-group-title">SYSTEM &amp; LOGS</span>

            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `cc-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Bell size={18} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="cc-nav-badge-count">{unreadCount}</span>
              )}
            </NavLink>

            {Boolean(
              isSuperAdmin ||
              String(user?.role || '').toLowerCase() === 'superadmin' ||
              String(user?.role || '').toLowerCase() === 'super_admin' ||
              String(user?.role || '').toLowerCase() === 'admin'
            ) && (
              <NavLink
                to="/system-status"
                className={({ isActive }) =>
                  `cc-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Activity size={18} />
                <span>System Status</span>
                <span
                  className={`cc-status-dot ${isSystemOnline ? 'online' : 'offline'}`}
                  title={isSystemOnline ? 'API Operational' : 'API Offline'}
                />
              </NavLink>
            )}

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `cc-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <User size={18} />
              <span>Profile &amp; Account</span>
            </NavLink>
          </div>
        </div>

        {/* Sidebar Footer with Logout & Version */}
        <div className="cc-sidebar-footer">
          <div className="cc-system-health-pill">
            <span className={`cc-health-indicator ${isSystemOnline ? 'live' : 'err'}`} />
            <span className="cc-health-text">
              {isSystemOnline ? 'System Operational' : 'Degraded Connectivity'}
            </span>
          </div>

          <button
            type="button"
            className="cc-sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
