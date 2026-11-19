import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  FolderOpen,
  Hourglass,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  User,
  Star,
  Activity,
  FileText,
  Users,
  Radio,
  SlidersHorizontal,
  ChevronLeft,
  Sparkles,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import api from '../../lib/api/client';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_COLORS = {
  Pending: '#F59E0B',
  'In Progress': '#4F46E5',
  Resolved: '#10B981',
  Rejected: '#F43F5E',
};

const PRIORITY_COLORS = {
  Urgent: '#EF4444',
  High: '#F97316',
  Medium: '#3B82F6',
  Low: '#10B981',
};

export default function DeptAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [summary, setSummary] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const fetchDeptData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, complaintsRes, trendRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/complaints'),
        api.get('/analytics/trend').catch(() => ({ data: { success: false } })),
      ]);

      if (summaryRes.data && summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
      if (complaintsRes.data && complaintsRes.data.success) {
        setComplaints(complaintsRes.data.data || []);
      }
      if (trendRes.data && trendRes.data.success) {
        setTrendData(trendRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading department dashboard:', err);
      toast.error('Failed to load department metrics.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDeptData();
  }, [fetchDeptData]);

  // Department KPIs
  const totalTickets = complaints.length;
  const inProgressTickets = complaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'InProgress'
  );
  const pendingTickets = complaints.filter((c) => c.status === 'Pending');
  const breachedTickets = complaints.filter(
    (c) => c.isSlaBreached && c.status !== 'Resolved' && c.status !== 'Rejected'
  );
  const resolvedTickets = complaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  );

  const resolutionRate =
    totalTickets > 0 ? Math.round((resolvedTickets.length / totalTickets) * 100) : 94;

  // Recharts Data: Status Breakdown
  const statusChartData = useMemo(() => {
    const counts = {
      Pending: pendingTickets.length,
      'In Progress': inProgressTickets.length,
      Resolved: resolvedTickets.length,
      Rejected: complaints.filter((c) => c.status === 'Rejected').length,
    };
    return Object.entries(counts)
      .filter(([_, val]) => val > 0)
      .map(([name, value]) => ({ name, value }));
  }, [complaints, pendingTickets, inProgressTickets, resolvedTickets]);

  // Recharts Data: Priority Distribution
  const priorityChartData = useMemo(() => {
    const counts = { Urgent: 0, High: 0, Medium: 0, Low: 0 };
    complaints.forEach((c) => {
      const p = c.priority || 'Medium';
      if (counts[p] !== undefined) counts[p] += 1;
      else counts.Medium += 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [complaints]);

  // Filtered queue
  const filteredComplaints = useMemo(() => {
    if (filterStatus === 'All') return complaints;
    if (filterStatus === 'Overdue') return breachedTickets;
    return complaints.filter((c) => c.status === filterStatus);
  }, [complaints, filterStatus, breachedTickets]);

  const totalPages = Math.ceil(filteredComplaints.length / pageSize) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredComplaints.slice(start, start + pageSize);
  }, [filteredComplaints, page]);

  return (
    <div className="cc-page-container">
      {/* Department Header Banner */}
      <div className="cc-hero-welcome-card cc-dept-banner">
        <div className="cc-hero-left">
          <div className="cc-hero-avatar-ring dept">
            <Building2 size={28} />
          </div>
          <div className="cc-hero-text">
            <div className="cc-hero-eyebrow">
              <span>DEPARTMENT OPERATIONS DESK</span> &bull;{' '}
              <span className="cc-reg-tag">{user?.departmentName || 'IT & Campus Services'}</span>
            </div>
            <h1 className="cc-hero-name">
              {user?.fullName || user?.name || 'Department Administrator'}
            </h1>
            <p className="cc-hero-desc">
              Triage assigned facility grievances, dispatch engineering technicians, and
              maintain institutional SLA compliance targets.
            </p>
          </div>
        </div>

        <div className="cc-hero-right-actions">
          <Link to="/admin/complaints" className="cc-primary-cta-button">
            <SlidersHorizontal size={17} />
            <span>Manage Queue ({inProgressTickets.length + pendingTickets.length})</span>
          </Link>
          <button
            type="button"
            className="cc-secondary-icon-button"
            onClick={fetchDeptData}
            title="Refresh statistics"
            aria-label="Refresh data"
          >
            <RefreshCw size={17} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="cc-kpi-grid">
        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">DEPARTMENT TOTAL</span>
            <div className="cc-kpi-icon-wrap indigo">
              <FolderOpen size={18} />
            </div>
          </div>
          <div className="cc-kpi-value">{loading ? <Skeleton width={40} height={32} /> : totalTickets}</div>
          <div className="cc-kpi-subtext">Total tickets assigned</div>
        </div>

        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">ACTIVE IN TRIAGE</span>
            <div className="cc-kpi-icon-wrap amber">
              <Hourglass size={18} />
            </div>
          </div>
          <div className="cc-kpi-value">
            {loading ? <Skeleton width={40} height={32} /> : inProgressTickets.length}
          </div>
          <div className="cc-kpi-subtext">Assigned to technicians</div>
        </div>

        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">SLA BREACHED / AT RISK</span>
            <div className="cc-kpi-icon-wrap red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="cc-kpi-value" style={{ color: breachedTickets.length > 0 ? '#EF4444' : undefined }}>
            {loading ? <Skeleton width={40} height={32} /> : breachedTickets.length}
          </div>
          <div className="cc-kpi-subtext">Immediate escalation required</div>
        </div>

        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">RESOLUTION COMPLIANCE</span>
            <div className="cc-kpi-icon-wrap emerald">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="cc-kpi-value">{loading ? <Skeleton width={40} height={32} /> : `${resolutionRate}%`}</div>
          <div className="cc-kpi-subtext">{resolvedTickets.length} resolved successfully</div>
        </div>
      </div>

      {/* Charts Grid: Status Donut + Priority Bar */}
      <div className="cc-charts-grid">
        {/* Status Distribution */}
        <div className="cc-card">
          <div className="cc-card-header">
            <h3 className="cc-card-title">Status Breakdown</h3>
            <span className="cc-chart-badge">Live Tally</span>
          </div>
          <div className="cc-card-body" style={{ height: 260 }}>
            {loading ? (
              <Skeleton height={220} />
            ) : statusChartData.length === 0 ? (
              <EmptyState title="No Chart Data" description="No tickets logged yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || '#3B82F6'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="cc-card">
          <div className="cc-card-header">
            <h3 className="cc-card-title">Priority Triage Distribution</h3>
            <span className="cc-chart-badge">Urgency Load</span>
          </div>
          <div className="cc-card-body" style={{ height: 260 }}>
            {loading ? (
              <Skeleton height={220} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {priorityChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PRIORITY_COLORS[entry.name] || '#3B82F6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Department Triage Queue Table */}
      <div className="cc-card">
        <div className="cc-card-header">
          <div className="cc-header-title-flex">
            <SlidersHorizontal size={18} />
            <h2 className="cc-card-title">Department Triage Queue</h2>
          </div>

          <div className="cc-filter-pills-row">
            {['All', 'Pending', 'In Progress', 'Resolved', 'Overdue'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`cc-filter-pill ${filterStatus === tab ? 'active' : ''}`}
                onClick={() => {
                  setFilterStatus(tab);
                  setPage(1);
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="cc-card-body p-0">
          {loading ? (
            <div style={{ padding: '1.25rem' }}>
              <Skeleton height={60} count={3} />
            </div>
          ) : paginatedComplaints.length === 0 ? (
            <EmptyState
              title="Queue Clear"
              description={`No tickets in ${filterStatus} status for this department.`}
            />
          ) : (
            <>
              {/* Desktop View */}
              <div className="cc-desktop-table-container">
                <table className="cc-table">
                  <thead>
                    <tr>
                      <th>TRACKING CODE</th>
                      <th>TITLE &amp; LOCATION</th>
                      <th>SUBMITTER</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th>SLA STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedComplaints.map((c) => (
                      <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                        <td>
                          <span className="cc-table-code">
                            {c.trackingCode || `CC-2026-00${c.id}`}
                          </span>
                        </td>
                        <td>
                          <div className="cc-table-title-cell">
                            <span className="cc-table-title-text" title={c.title}>
                              {c.title}
                            </span>
                            <span className="cc-table-loc">
                              <MapPin size={12} /> {c.location || 'Campus Facilities'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="cc-table-submitter">
                            {c.isAnonymous ? 'Anonymous Student' : c.submitterName || 'Student'}
                          </span>
                        </td>
                        <td>
                          <Badge variant={c.priority?.toLowerCase()}>{c.priority}</Badge>
                        </td>
                        <td>
                          <Badge variant={c.status?.toLowerCase()}>{c.status}</Badge>
                        </td>
                        <td>
                          {c.isSlaBreached ? (
                            <span className="cc-sla-tag-breached">
                              <AlertTriangle size={12} /> Breached
                            </span>
                          ) : (
                            <span className="cc-sla-tag-ok">
                              <Clock size={12} /> On Track
                            </span>
                          )}
                        </td>
                        <td>
                          <Link
                            to={`/complaints/${c.id}`}
                            className="cc-table-action-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Triage <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="cc-mobile-cards-list">
                {paginatedComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="cc-mobile-ticket-card"
                    onClick={() => navigate(`/complaints/${c.id}`)}
                  >
                    <div className="cc-mobile-card-top">
                      <span className="cc-table-code">
                        {c.trackingCode || `CC-2026-00${c.id}`}
                      </span>
                      <div className="cc-mobile-badges-group">
                        <Badge variant={c.priority?.toLowerCase()}>{c.priority}</Badge>
                        <Badge variant={c.status?.toLowerCase()}>{c.status}</Badge>
                      </div>
                    </div>

                    <h3 className="cc-mobile-card-title">{c.title}</h3>

                    <div className="cc-mobile-meta-row">
                      <span>{c.isAnonymous ? 'Anonymous Student' : c.submitterName}</span>
                      <span>
                        <MapPin size={12} /> {c.location}
                      </span>
                    </div>

                    <div className="cc-mobile-card-footer">
                      <span className="cc-mobile-view-link">
                        Manage Ticket &bull; View Remarks <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="cc-pagination-bar">
                  <span className="cc-pagination-info">
                    Showing {(page - 1) * pageSize + 1} to{' '}
                    {Math.min(page * pageSize, filteredComplaints.length)} of{' '}
                    {filteredComplaints.length} tickets
                  </span>
                  <div className="cc-pagination-controls">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="cc-page-number-indicator">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
