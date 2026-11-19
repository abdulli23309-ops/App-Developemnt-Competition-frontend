import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Bell,
  LogOut,
  Search,
  CheckCheck,
  ExternalLink,
  AlertCircle,
  Clock,
  Menu,
  X,
  Building2,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import api from '../../lib/api/client';

export default function Header({ onToggleMobileNav }) {
  const { user, logout, isStudent, isDeptAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const bellRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Derive dynamic department / role label
  const getHeaderDeptLabel = () => {
    if (!user) return 'Smart Campus System';
    if (isSuperAdmin) return 'All Departments • Super Admin';
    if (isDeptAdmin) {
      const dept = user.departmentName || 'Department';
      return dept.toLowerCase().includes('department') ? dept : `${dept} Department`;
    }
    return user.departmentName ? `${user.departmentName} • Student` : 'Student Portal';
  };

  // Fetch live notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingNotifs(true);
      const res = await api.get('/notifications');
      if (res.data && res.data.success) {
        const notifList = res.data.data || [];
        setNotifications(notifList);
        setUnreadCount(notifList.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      // non-critical
    } finally {
      setIsLoadingNotifs(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // Polling every 45s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsBellOpen(false);
    };
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mark single notification as read
  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    for (const n of unread) {
      try {
        await api.post(`/notifications/${n.id}/read`);
      } catch (e) {
        // continue
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // Handle global complaint search with debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (val.trim()) {
        const dest = isStudent ? '/complaints' : '/admin/complaints';
        navigate(`${dest}?search=${encodeURIComponent(val.trim())}`);
      }
    }, 400);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const dest = isStudent ? '/complaints' : '/admin/complaints';
      navigate(`${dest}?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="cc-top-header">
      {/* Brand & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {onToggleMobileNav && (
          <button
            type="button"
            className="cc-mobile-menu-btn"
            onClick={onToggleMobileNav}
            aria-label="Toggle navigation menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <Menu size={20} />
          </button>
        )}

        <Link to="/" className="cc-brand-badge" style={{ textDecoration: 'none' }}>
          <div className="cc-logo-icon-box">
            <ShieldCheck size={20} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="cc-brand-title">CampusConnect</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {getHeaderDeptLabel()}
            </span>
          </div>
        </Link>
      </div>

      {/* Global Search Bar (Desktop/Tablet) */}
      <form
        onSubmit={handleSearchSubmit}
        className="cc-header-search-form"
        style={{
          flex: '1',
          maxWidth: '420px',
          margin: '0 1.25rem',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            color: '#94A3B8',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search complaints, tracking IDs, or students..."
          style={{
            width: '100%',
            padding: '7px 12px 7px 36px',
            fontSize: '0.825rem',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            outline: 'none',
            color: '#1E293B',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#6366F1')}
          onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
        />
      </form>

      {/* Right Controls: Department Badge, Notification Bell Popover, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Dynamic Department / Role Pill Badge (Desktop >= 1024px) */}
        {user && (
          <div
            className="cc-dept-header-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: isSuperAdmin ? '#FEF3C7' : '#EEF2FF',
              color: isSuperAdmin ? '#B45309' : '#4338CA',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: `1px solid ${isSuperAdmin ? '#FDE68A' : '#C7D2FE'}`,
            }}
          >
            {isSuperAdmin ? <Sparkles size={14} /> : (isDeptAdmin ? <Building2 size={14} /> : <GraduationCap size={14} />)}
            <span>{getHeaderDeptLabel()}</span>
          </div>
        )}

        {/* Interactive Notification Bell Popover */}
        <div ref={bellRef} style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setIsBellOpen((prev) => !prev)}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: isBellOpen ? '#EEF2FF' : '#F1F5F9',
              border: `1px solid ${isBellOpen ? '#C7D2FE' : '#E2E8F0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isBellOpen ? '#4338CA' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Campus Notifications & Alerts"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid #FFFFFF',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown */}
          {isBellOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '360px',
                maxWidth: '90vw',
                background: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15)',
                border: '1px solid #E2E8F0',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'ccFadeIn 0.15s ease',
              }}
            >
              {/* Popover Header */}
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#F8FAFC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E293B' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: '#EEF2FF',
                        color: '#4338CA',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '9999px',
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6366F1',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {isLoadingNotifs ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                    Loading updates...
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
                    <Bell size={28} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>No recent notifications</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                      All ticket SLA updates and remarks will appear here.
                    </div>
                  </div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsBellOpen(false);
                        if (!n.isRead) handleMarkAsRead(n.id);
                        if (n.complaintId) navigate(`/complaints/${n.complaintId}`);
                        else navigate('/alerts');
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: n.isRead ? '#FFFFFF' : '#F8FAFC',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = n.isRead ? '#FFFFFF' : '#F8FAFC')
                      }
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: n.isRead ? 'transparent' : '#4F46E5',
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: n.isRead ? 600 : 700, color: '#1E293B', marginBottom: '2px' }}>
                          {n.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748B',
                            lineHeight: 1.35,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {n.message}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.68rem', color: '#94A3B8' }}>
                          <Clock size={11} />
                          <span>{new Date(n.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Popover Footer */}
              <div
                style={{
                  padding: '0.625rem 1rem',
                  background: '#F8FAFC',
                  borderTop: '1px solid #E2E8F0',
                  textAlign: 'center',
                }}
              >
                <Link
                  to="/alerts"
                  onClick={() => setIsBellOpen(false)}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#4338CA',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>View Full Alerts Feed</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Pill / Profile Avatar */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '4px 10px 4px 6px',
                background: '#FFFFFF',
                borderRadius: '9999px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B' }}>
                  {user.fullName || user.email}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                  {user.registrationNumber || user.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              style={{
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'var(--color-primary-gradient)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.825rem',
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
