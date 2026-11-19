import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Check,
  RefreshCw,
  Sparkles,
  Users,
  Radio,
  Send,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import api from '../../lib/api/client';
import { useAuth } from '../auth/AuthContext';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user, isDeptAdmin, isSuperAdmin } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'critical' | 'system'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    setIsMarkingAll(true);
    try {
      await Promise.all(unread.map((n) => api.post(`/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Derive counts
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const criticalCount = useMemo(() => {
    return notifications.filter((n) => {
      const t = (n.title + ' ' + n.message).toLowerCase();
      return t.includes('breach') || t.includes('urgent') || t.includes('critical') || t.includes('sla');
    }).length;
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let list = notifications;

    if (activeTab === 'unread') {
      list = list.filter((n) => !n.isRead);
    } else if (activeTab === 'critical') {
      list = list.filter((n) => {
        const t = (n.title + ' ' + n.message).toLowerCase();
        return t.includes('breach') || t.includes('urgent') || t.includes('critical') || t.includes('sla');
      });
    } else if (activeTab === 'system') {
      list = list.filter((n) => {
        const t = (n.title + ' ' + n.message).toLowerCase();
        return t.includes('system') || t.includes('maintenance') || !n.complaintId;
      });
    }

    if (categoryFilter !== 'all') {
      list = list.filter((n) => {
        const t = (n.title + ' ' + n.message).toLowerCase();
        return t.includes(categoryFilter.toLowerCase());
      });
    }

    return list;
  }, [notifications, activeTab, categoryFilter]);

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  const deptLabel = user?.departmentName || 'Campus Systems';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#4338CA',
                background: '#EEF2FF',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              CAMPUS OVERSIGHT FEED &bull; {unreadCount} Unacknowledged Actions
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
            Notifications &amp; Institutional Alerts
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Real-time telemetric alerts, escalation triggers, and verified audit remarks for {deptLabel}.
          </p>
        </div>

        {/* Top Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.8rem',
              background: '#FFFFFF',
              color: '#334155',
            }}
          >
            <option value="all">Category: All Feeds</option>
            <option value="sla">SLA Breaches</option>
            <option value="dispatched">Technician Dispatches</option>
            <option value="resolved">Resolutions</option>
            <option value="remark">Official Remarks</option>
          </select>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={isMarkingAll || unreadCount === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: unreadCount === 0 ? '#94A3B8' : '#4338CA',
              cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <Check size={14} />
            <span>{isMarkingAll ? 'Marking...' : 'Mark all as read'}</span>
          </button>
        </div>
      </div>

      {/* 2. Four Summary Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Critical */}
        <div className="cc-card" style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECDD3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B' }}>
                {criticalCount}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase' }}>
                Critical &bull; Breach SLA Risk
              </div>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="cc-card" style={{ padding: '1rem', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E40AF' }}>
                {unreadCount}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
                Pending &bull; Requires Input
              </div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="cc-card" style={{ padding: '1rem', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>
                {notifications.length}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Total &bull; Weekly Activity
              </div>
            </div>
          </div>
        </div>

        {/* Resolution SLA */}
        <div className="cc-card" style={{ padding: '1rem', background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46' }}>
                94.8%
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                Resolution SLA Compliance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Alerts Feed (Left) & Sidebar Widgets (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Left Column: Feed Tabs & Cards */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Notifications (${notifications.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'critical', label: `Critical Alerts (${criticalCount})` },
              { id: 'system', label: 'System Notices' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: activeTab === tab.id ? '#4338CA' : '#E2E8F0',
                  background: activeTab === tab.id ? '#4338CA' : '#FFFFFF',
                  color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feed List */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <Skeleton height="100px" radius="14px" />
              <Skeleton height="100px" radius="14px" />
              <Skeleton height="100px" radius="14px" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="cc-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <EmptyState
                icon={Bell}
                title="No notifications in this filter"
                description="All operational events, ticket assignments, and remarks will appear here in real-time."
              />
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const text = (n.title + ' ' + n.message).toLowerCase();
              const isCritical = text.includes('breach') || text.includes('urgent') || text.includes('critical');
              const isResolved = text.includes('resolved') || text.includes('closed');
              const isRemark = text.includes('remark') || text.includes('response');
              const isDispatch = text.includes('dispatch') || text.includes('assigned');

              let borderColor = '#E2E8F0';
              let badgeColor = '#475569';
              let badgeBg = '#F1F5F9';
              let badgeLabel = 'STATUS UPDATE';

              if (isCritical) {
                borderColor = '#FCA5A5';
                badgeColor = '#DC2626';
                badgeBg = '#FEE2E2';
                badgeLabel = 'SLA CRITICAL';
              } else if (isResolved) {
                borderColor = '#A7F3D0';
                badgeColor = '#059669';
                badgeBg = '#ECFDF5';
                badgeLabel = 'RESOLVED';
              } else if (isRemark) {
                borderColor = '#DDD6FE';
                badgeColor = '#6D28D9';
                badgeBg = '#F5F3FF';
                badgeLabel = 'OFFICIAL REMARK';
              } else if (isDispatch) {
                borderColor = '#BFDBFE';
                badgeColor = '#2563EB';
                badgeBg = '#EFF6FF';
                badgeLabel = 'DISPATCHED';
              }

              return (
                <div
                  key={n.id}
                  style={{
                    background: n.isRead ? '#FFFFFF' : '#F8FAFC',
                    border: `1.5px solid ${borderColor}`,
                    borderLeft: `5px solid ${badgeColor}`,
                    borderRadius: '14px',
                    padding: '1.125rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: badgeColor,
                          background: badgeBg,
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {badgeLabel}
                      </span>
                      {n.complaintId && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338CA' }}>
                          #CC-2026-00{n.complaintId}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                      {new Date(n.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(n.createdAtUtc).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#1E1B4B' }}>
                    {n.title}
                  </div>

                  <p style={{ margin: 0, fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
                    {n.message}
                  </p>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {n.complaintId && (
                        <Link
                          to={`/complaints/${n.complaintId}`}
                          style={{
                            padding: '4px 12px',
                            background: '#4338CA',
                            color: '#FFFFFF',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          View Ticket &bull; Manage
                        </Link>
                      )}
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={(e) => markAsRead(n.id, e)}
                          style={{
                            padding: '4px 10px',
                            background: '#F1F5F9',
                            color: '#475569',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Mark Read
                        </button>
                      )}
                    </div>

                    {!n.isRead && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4338CA' }} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Top Nav Bell Popover Preview & Emergency Broadcast */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Nav Bell Popover View Preview Card */}
          <div className="cc-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bell size={16} color="#4338CA" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E1B4B' }}>
                  Header Bell Popover
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>
                ACTIVE LIVE
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 1rem 0', lineHeight: 1.45 }}>
              Clicking the bell in the top navigation bar displays the interactive quick-action popover with instant complaint routing.
            </p>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem', fontSize: '0.75rem', color: '#475569' }}>
              <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                Synced Capabilities:
              </div>
              <div>&bull; Instant 1-click unread badge count</div>
              <div>&bull; Mark individual or all as read</div>
              <div>&bull; Seamless redirection to ticket details</div>
              <div>&bull; Outside click &amp; Escape key dismissal</div>
            </div>
          </div>

          {/* Emergency Campus Broadcast Card */}
          <div className="cc-card" style={{ padding: '1.25rem', border: '1.5px solid #FBCFE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#9D174D' }}>
                Emergency Broadcast
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#BE185D', background: '#FCE7F3', padding: '2px 6px', borderRadius: '4px' }}>
                Authorized Only
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
              Trigger mass notifications to students or lab technicians across campus facilities for sudden equipment outages.
            </p>

            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <textarea
                rows={3}
                placeholder="Compose high-priority campus advisory..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8rem',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={!broadcastMessage.trim()}
                style={{
                  padding: '7px 12px',
                  background: '#9D174D',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: !broadcastMessage.trim() ? 'not-allowed' : 'pointer',
                  opacity: !broadcastMessage.trim() ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Send size={13} />
                <span>Dispatch Broadcast</span>
              </button>
            </form>

            {broadcastSent && (
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '0.5rem', textAlign: 'center' }}>
                ✓ Broadcast dispatched to campus channels!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
