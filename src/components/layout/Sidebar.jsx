import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import api from '../../lib/api/client';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isStudent, isDeptAdmin, isSuperAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSystemOnline, setIsSystemOnline] = useState(true);

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
    const interval = setInterval(checkState, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const getDepartmentBadgeLabel = () => {
    if (!user) return 'System Portal';
    if (isSuperAdmin) return 'All Campus Faculties';
    if (isDeptAdmin) return user.departmentName || 'Department';
    return user.departmentName || 'Student Body';
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 1100,
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`cc-sidebar ${isOpen ? 'cc-sidebar-mobile-open' : ''}`}
        style={{
          width: '260px',
          minWidth: '260px',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #E2E8F0',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}
          >
            <div className="cc-logo-icon-box">
              <ShieldCheck size={22} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#1E1B4B',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                CampusConnect
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#6366F1',
                  letterSpacing: '0.04em',
                }}
              >
                SMART CAMPUS SYSTEM
              </div>
            </div>
          </Link>

          {/* Close button on mobile */}
          {isOpen && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Dynamic Role / Department Mini Card */}
        {user && (
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}
              >
                {user.fullName?.charAt(0).toUpperCase() || (user.email?.charAt(0).toUpperCase())}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#1E293B',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.fullName || user.email}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {isStudent && <GraduationCap size={12} color="#4F46E5" />}
                  {isDeptAdmin && <Building2 size={12} color="#059669" />}
                  {isSuperAdmin && <Sparkles size={12} color="#D97706" />}
                  <span>{getDepartmentBadgeLabel()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student "+ New Complaint" CTA */}
        {isStudent && (
          <div style={{ marginBottom: '1.25rem' }}>
            <Link
              to="/complaints/new"
              onClick={onClose}
              className="cc-cta-btn-white"
              style={{
                width: '100%',
                background: 'var(--color-primary-gradient)',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(67, 56, 202, 0.3)',
                padding: '0.75rem',
                borderRadius: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <PlusCircle size={18} />
              <span>+ New Complaint</span>
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.35rem 0.75rem',
            }}
          >
            Navigation
          </div>

          {/* 1. Dashboard */}
          <NavLink
            to={isStudent ? '/' : '/admin/dashboard'}
            end
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? '#4338CA' : '#475569',
              backgroundColor: isActive ? '#EEF2FF' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <LayoutDashboard size={18} />
            <span>
              {isStudent ? 'Dashboard' : isDeptAdmin ? 'Dashboard' : 'Campus Overview'}
            </span>
          </NavLink>

          {/* 2. Complaint Queue */}
          <NavLink
            to={isStudent ? '/complaints' : '/admin/complaints'}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? '#4338CA' : '#475569',
              backgroundColor: isActive ? '#EEF2FF' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <ClipboardList size={18} />
            <span>{isStudent ? 'My Complaints' : 'Complaint Queue'}</span>
          </NavLink>

          {/* 3. Alerts with Unread Badge */}
          <NavLink
            to="/alerts"
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0.875rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? '#4338CA' : '#475569',
              backgroundColor: isActive ? '#EEF2FF' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bell size={18} />
              <span>Alerts</span>
            </div>
            {unreadCount > 0 && (
              <span
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '9999px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </NavLink>

          {/* 4. Analytics (for Admin / SuperAdmin) */}
          {(isDeptAdmin || isSuperAdmin) && (
            <NavLink
              to="/analytics"
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? '#4338CA' : '#475569',
                backgroundColor: isActive ? '#EEF2FF' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <BarChart3 size={18} />
              <span>Analytics & SLAs</span>
            </NavLink>
          )}

          {/* 5. System Status */}
          <NavLink
            to="/system-status"
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? '#4338CA' : '#475569',
              backgroundColor: isActive ? '#EEF2FF' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <Activity size={18} />
            <span>System Status</span>
          </NavLink>
        </nav>

        {/* Bottom System Connectivity Indicator & Sign Out */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid #E2E8F0', marginTop: 'auto' }}>
          {/* System Connectivity Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: isSystemOnline ? '#F0FDF4' : '#FEF2F2',
              color: isSystemOnline ? '#166534' : '#991B1B',
              fontSize: '0.72rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            {isSystemOnline ? (
              <CheckCircle2 size={13} color="#16A34A" />
            ) : (
              <AlertCircle size={13} color="#DC2626" />
            )}
            <span>{isSystemOnline ? 'System Status: SLAs Active (99.2%)' : 'Backend Connectivity Degraded'}</span>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => {
                onClose?.();
                logout();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#DC2626',
                backgroundColor: '#FEF2F2',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
