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
  FileText,
  MailCheck,
} from 'lucide-react';
import api from '../../lib/api/client';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user, isDeptAdmin, isSuperAdmin } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'system'
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      toast.error('Unable to fetch notifications.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
      toast.info('Notification marked as read.');
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) {
      toast.info('All notifications are already read.');
      return;
    }

    setIsMarkingAll(true);
    try {
      await Promise.all(unread.map((n) => api.post(`/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Failed to mark all as read.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter((n) => !n.isRead);
    if (activeTab === 'system') {
      return notifications.filter(
        (n) => n.type?.toLowerCase().includes('system') || n.title?.toLowerCase().includes('system')
      );
    }
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="cc-page-container">
      {/* Page Header */}
      <div className="cc-page-header-row">
        <div>
          <h1 className="cc-section-title">Notifications &amp; Operational Alerts</h1>
          <p className="cc-section-subtitle">
            Stay updated on ticket status changes, engineering dispatches, and SLA milestones.
          </p>
        </div>

        <div className="cc-header-button-group">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="md"
              icon={MailCheck}
              onClick={markAllAsRead}
              isLoading={isMarkingAll}
            >
              Mark All as Read ({unreadCount})
            </Button>
          )}
          <Button
            variant="subtle"
            size="md"
            icon={RefreshCw}
            onClick={fetchNotifications}
            isLoading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="cc-filter-toolbar">
        <div className="cc-filter-pills-row">
          <button
            type="button"
            className={`cc-filter-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            type="button"
            className={`cc-filter-pill ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread Only ({unreadCount})
          </button>
          <button
            type="button"
            className={`cc-filter-pill ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            System &amp; SLA Alerts
          </button>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="cc-card">
        <div className="cc-card-body p-0">
          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <Skeleton height={60} count={4} />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="All Caught Up!"
              description={
                activeTab === 'unread'
                  ? 'You have zero unread notifications.'
                  : 'No notifications logged at this time.'
              }
            />
          ) : (
            <div className="cc-notifications-list">
              {filteredNotifications.map((n) => {
                const targetLink = n.complaintId
                  ? `/complaints/${n.complaintId}`
                  : null;

                return (
                  <div
                    key={n.id}
                    className={`cc-notification-item ${!n.isRead ? 'unread' : ''}`}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n.id);
                      if (targetLink) navigate(targetLink);
                    }}
                  >
                    <div className="cc-notif-icon-col">
                      <div className={`cc-notif-circle ${!n.isRead ? 'unread' : ''}`}>
                        <Bell size={18} />
                      </div>
                    </div>

                    <div className="cc-notif-content-col">
                      <div className="cc-notif-header">
                        <span className="cc-notif-title">{n.title}</span>
                        <span className="cc-notif-time">
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                            : 'Recent'}
                        </span>
                      </div>

                      <p className="cc-notif-message">{n.message}</p>

                      <div className="cc-notif-footer-actions">
                        {targetLink && (
                          <span className="cc-notif-link-badge">
                            View Ticket <ChevronRight size={13} />
                          </span>
                        )}
                        {!n.isRead && (
                          <button
                            type="button"
                            className="cc-notif-mark-read-btn"
                            onClick={(e) => markAsRead(n.id, e)}
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
