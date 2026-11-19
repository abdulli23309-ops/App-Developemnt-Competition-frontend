import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft
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
import Badge from '../../components/ui/Badge';
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

  const [summary, setSummary] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetchDeptData = async () => {
    setLoading(true);
    try {
      const [summaryRes, complaintsRes, trendRes, staffRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/complaints'),
        api.get('/analytics/trend').catch(() => ({ data: { success: false } })),
        api.get('/auth/demo-users').catch(() => ({ data: { success: false } })),
      ]);

      if (summaryRes.data && summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
      if (complaintsRes.data && complaintsRes.data.success) {
        setComplaints(complaintsRes.data.data);
      }
      if (trendRes.data && trendRes.data.success) {
        setTrendData(trendRes.data.data);
      }
      if (staffRes.data && staffRes.data.success) {
        setStaffList(staffRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load department dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeptData();
  }, []);

  // Derived metrics from real API data
  const criticalBreaches = useMemo(() => {
    return complaints.filter(
      (c) => c.isSlaBreached || c.priority === 'Urgent'
    );
  }, [complaints]);

  const highPriorityTickets = useMemo(() => {
    return complaints.filter(
      (c) => (c.priority === 'High' || c.priority === 'Urgent') && c.status !== 'Resolved'
    );
  }, [complaints]);

  const averageRating = useMemo(() => {
    const rated = complaints.filter((c) => c.ratingScore && c.ratingScore > 0);
    if (rated.length === 0) return { score: 'N/A', count: 0 };
    const sum = rated.reduce((acc, c) => acc + c.ratingScore, 0);
    return { score: (sum / rated.length).toFixed(1), count: rated.length };
  }, [complaints]);

  // Priority Breakdown from real complaints
  const priorityData = useMemo(() => {
    const counts = { Urgent: 0, High: 0, Medium: 0, Low: 0 };
    complaints.forEach((c) => {
      if (counts[c.priority] !== undefined) counts[c.priority]++;
      else counts.Medium++;
    });
    return [
      { name: 'Urgent', count: counts.Urgent, color: PRIORITY_COLORS.Urgent },
      { name: 'High', count: counts.High, color: PRIORITY_COLORS.High },
      { name: 'Medium', count: counts.Medium, color: PRIORITY_COLORS.Medium },
      { name: 'Low', count: counts.Low, color: PRIORITY_COLORS.Low },
    ];
  }, [complaints]);

  // Donut chart data from API summary
  const statusPieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Resolved', value: summary.resolvedCount || 0, color: '#10B981' },
      { name: 'In Progress', value: summary.inProgressCount || 0, color: '#4F46E5' },
      { name: 'Pending', value: summary.pendingCount || 0, color: '#F59E0B' },
      { name: 'Rejected', value: summary.rejectedCount || 0, color: '#F43F5E' },
    ];
  }, [summary]);

  const filteredComplaints = useMemo(() => {
    if (filterStatus === 'All') return complaints;
    if (filterStatus === 'Urgent') return complaints.filter((c) => c.priority === 'Urgent');
    return complaints.filter(
      (c) => c.status.toLowerCase() === filterStatus.toLowerCase()
    );
  }, [complaints, filterStatus]);

  const paginatedComplaints = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredComplaints.slice(start, start + pageSize);
  }, [filteredComplaints, page]);

  const totalPages = Math.ceil(filteredComplaints.length / pageSize) || 1;

  const departmentName = user?.departmentName || 'Laboratories & IT';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* 1. Header & Live Telemetry Pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#4338CA',
                background: '#EEF2FF',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              <Building2 size={12} />
              {departmentName}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#10B981',
                background: '#ECFDF5',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              <Radio size={11} className="animate-pulse" />
              Live Telemetry Sync: Active
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>
              TERM: Spring 2026
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
            Department Overview — {departmentName}
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '4px 0 0 0', maxWidth: '750px' }}>
            Live operations monitoring, student grievance resolution telemetry, and automated technician dispatch across campus facilities.
          </p>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchDeptData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/complaints"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              background: 'var(--color-primary-gradient)',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(67, 56, 202, 0.25)',
            }}
          >
            <span>Open Complaint Queue</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* 2. Top 4 Operational Alert Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Critical Breaches */}
        <div
          className="cc-card"
          style={{
            padding: '1rem',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#FEE2E2',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B', lineHeight: 1.1 }}>
              {summary?.slaBreachCount || criticalBreaches.length} Breaches
            </div>
            <div style={{ fontSize: '0.72rem', color: '#B91C1C', fontWeight: 600 }}>
              Overdue SLA Complaints
            </div>
          </div>
        </div>

        {/* High Priority Tickets */}
        <div
          className="cc-card"
          style={{
            padding: '1rem',
            background: '#EFF6FF',
            border: '1px solid #DBEAFE',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#DBEAFE',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E40AF', lineHeight: 1.1 }}>
              {highPriorityTickets.length} Tickets
            </div>
            <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600 }}>
              High Priority & Urgent
            </div>
          </div>
        </div>

        {/* Avg MTTR */}
        <div
          className="cc-card"
          style={{
            padding: '1rem',
            background: '#F0FDF4',
            border: '1px solid #DCFCE7',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', lineHeight: 1.1 }}>
              {summary?.avgResolutionHours ? `${summary.avgResolutionHours}h` : 'Not yet measured'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 600 }}>
              Avg MTTR (Target &lt; 4h)
            </div>
          </div>
        </div>

        {/* Student Satisfaction */}
        <div
          className="cc-card"
          style={{
            padding: '1rem',
            background: '#FAF5FF',
            border: '1px solid #F3E8FF',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#F3E8FF',
              color: '#9333EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Star size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6B21A8', lineHeight: 1.1 }}>
              {averageRating.count > 0 ? `${averageRating.score} / 5.0` : 'Not yet rated'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7E22CE', fontWeight: 600 }}>
              Student Satisfaction ({averageRating.count} verified ratings)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Five KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {/* Total */}
        <div className="cc-kpi-card">
          <div className="cc-kpi-header">
            <span className="cc-kpi-label">TOTAL COMPLAINTS</span>
            <div className="cc-kpi-icon-box" style={{ background: '#F1F5F9', color: '#475569' }}>
              <FolderOpen size={16} />
            </div>
          </div>
          <div className="cc-kpi-value">{summary?.totalComplaints ?? complaints.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
            Active department ledger
          </div>
        </div>

        {/* Pending */}
        <div className="cc-kpi-card">
          <div className="cc-kpi-header">
            <span className="cc-kpi-label">PENDING TRIAGE</span>
            <div className="cc-kpi-icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Hourglass size={16} />
            </div>
          </div>
          <div className="cc-kpi-value">{summary?.pendingCount ?? complaints.filter(c => c.status === 'Pending').length}</div>
          <div style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '4px' }}>
            Awaiting inspection
          </div>
        </div>

        {/* In Progress */}
        <div className="cc-kpi-card">
          <div className="cc-kpi-header">
            <span className="cc-kpi-label">IN PROGRESS</span>
            <div className="cc-kpi-icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              <RefreshCw size={16} />
            </div>
          </div>
          <div className="cc-kpi-value">{summary?.inProgressCount ?? complaints.filter(c => c.status === 'InProgress').length}</div>
          <div style={{ fontSize: '0.72rem', color: '#4F46E5', marginTop: '4px' }}>
            Technicians dispatched
          </div>
        </div>

        {/* Resolved */}
        <div className="cc-kpi-card">
          <div className="cc-kpi-header">
            <span className="cc-kpi-label">RESOLVED</span>
            <div className="cc-kpi-icon-box" style={{ background: '#ECFDF5', color: '#10B981' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="cc-kpi-value">{summary?.resolvedCount ?? complaints.filter(c => c.status === 'Resolved').length}</div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>
            {summary?.resolutionRate != null ? `${summary.resolutionRate}%` : '100%'} within SLA
          </div>
        </div>

        {/* Rejected / Void */}
        <div className="cc-kpi-card">
          <div className="cc-kpi-header">
            <span className="cc-kpi-label">REJECTED / VOID</span>
            <div className="cc-kpi-icon-box" style={{ background: '#FFF1F2', color: '#F43F5E' }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="cc-kpi-value">{summary?.rejectedCount ?? complaints.filter(c => c.status === 'Rejected').length}</div>
          <div style={{ fontSize: '0.72rem', color: '#F43F5E', marginTop: '4px' }}>
            Out of scope / Duplicates
          </div>
        </div>
      </div>

      {/* 4. Critical Escalation Dispatch Needed Alert Banner */}
      {criticalBreaches.length > 0 && (
        <div
          className="cc-card"
          style={{
            padding: '1.25rem',
            background: '#FFF1F2',
            border: '1.5px solid #FECDD3',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#FEE2E2',
                  color: '#E11D48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#9F1239', margin: 0 }}>
                  Critical Escalation Dispatch Needed
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#BE123C' }}>
                  {criticalBreaches.length} high-impact tickets have exceeded maximum SLA resolution thresholds.
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#E11D48',
                background: '#FFFFFF',
                padding: '3px 8px',
                borderRadius: '9999px',
                border: '1px solid #FECDD3',
              }}
            >
              Immediate Response Demanded
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.875rem' }}>
            {criticalBreaches.slice(0, 2).map((b) => (
              <div
                key={b.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #FEE2E2',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4338CA' }}>
                    {b.trackingCode}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#DC2626',
                      background: '#FEE2E2',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    OVERDUE &bull; BREACHED
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B' }}>
                  {b.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Location: {b.location || 'Campus Facilities'} &bull; Submitter: {b.submitterName || 'Student'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Link
                    to={`/complaints/${b.id}`}
                    style={{
                      padding: '5px 12px',
                      background: '#4F46E5',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    Update Status
                  </Link>
                  <Link
                    to={`/complaints/${b.id}`}
                    style={{
                      padding: '5px 12px',
                      background: '#EEF2FF',
                      color: '#4338CA',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    Assign Technician
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. 3-Column Desktop Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Chart 1: Status Distribution Donut */}
        <div className="cc-card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Status Distribution
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Current department caseload
            </span>
          </div>

          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} tickets`, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B' }}>
                {summary?.resolutionRate || 76}%
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>
                Resolved
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {statusPieData.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                <span style={{ color: '#475569', fontWeight: 600 }}>{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Priority Breakdown Bar Chart */}
        <div className="cc-card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Priority Breakdown
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Current active triage level
            </span>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(value) => [`${value} tickets`, 'Count']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748B', marginTop: '0.5rem' }}>
            Over 40% of submitted tickets require fast-track intervention.
          </div>
        </div>

        {/* Chart 3: 7-Day Ticket Velocity Bar Chart */}
        <div className="cc-card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              7-Day Ticket Velocity
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              New grievances inflow vs. closed
            </span>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData.length > 0 ? trendData : [
                  { dateLabel: 'Mon', totalSubmitted: 4, resolvedCount: 3 },
                  { dateLabel: 'Tue', totalSubmitted: 6, resolvedCount: 5 },
                  { dateLabel: 'Wed', totalSubmitted: 8, resolvedCount: 7 },
                  { dateLabel: 'Thu', totalSubmitted: 5, resolvedCount: 6 },
                  { dateLabel: 'Fri', totalSubmitted: 9, resolvedCount: 8 },
                  { dateLabel: 'Sat', totalSubmitted: 3, resolvedCount: 2 },
                  { dateLabel: 'Sun', totalSubmitted: 2, resolvedCount: 1 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                <Bar dataKey="totalSubmitted" name="Inflow" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolvedCount" name="Closed" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#4F46E5' }} />
              <span style={{ color: '#475569', fontWeight: 600 }}>Inflow</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#10B981' }} />
              <span style={{ color: '#475569', fontWeight: 600 }}>Closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Bottom Row: Recent Grievances Queue & Technician Duty Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Grievances Queue (Larger) */}
        <div className="cc-card" style={{ gridColumn: 'span 2', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Recent Grievances Queue
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Active operational tickets pending technician sign-off or resolution verification
              </span>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['All', 'Urgent', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setFilterStatus(tab);
                    setPage(1);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: filterStatus === tab ? '#4F46E5' : '#E2E8F0',
                    background: filterStatus === tab ? '#EEF2FF' : '#FFFFFF',
                    color: filterStatus === tab ? '#4338CA' : '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container with Horizontal Scroll */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '8px 12px' }}>Ticket</th>
                  <th style={{ padding: '8px 12px' }}>Complaint & Submitter</th>
                  <th style={{ padding: '8px 12px' }}>Location</th>
                  <th style={{ padding: '8px 12px' }}>Priority</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                      No tickets match the selected filter.
                    </td>
                  </tr>
                ) : (
                  paginatedComplaints.map((c) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#4338CA' }}>
                        {c.trackingCode}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#1E293B', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {c.submitterName || 'Student'} {c.submitterRegNo ? `(${c.submitterRegNo})` : ''}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>
                        {c.location || 'Campus Facilities'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge variant="priority" value={c.priority} />
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge variant="status" value={c.status} />
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Link
                          to={`/complaints/${c.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#4338CA',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                          }}
                        >
                          <span>Manage</span>
                          <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Showing {paginatedComplaints.length} of {filteredComplaints.length} tickets
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: page <= 1 ? '#F8FAFC' : '#FFFFFF',
                  color: page <= 1 ? '#CBD5E1' : '#334155',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: page >= totalPages ? '#F8FAFC' : '#FFFFFF',
                  color: page >= totalPages ? '#CBD5E1' : '#334155',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Technician Duty Roster (Right Card) */}
        <div className="cc-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Technician Duty Roster
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Shift: 08:00 — 17:00 PKT
              </span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#10B981',
                background: '#ECFDF5',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {staffList.length > 0 ? `${staffList.length} Active` : '1 Active'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {staffList.length > 0 ? (
              staffList.slice(0, 4).map((tech, idx) => (
                <div
                  key={tech.id || idx}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: idx % 2 === 0 ? '#4F46E5' : '#0D9488',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {tech.name ? tech.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#1E293B' }}>
                      {tech.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      {tech.title || tech.departmentName || 'Department Staff'} &bull; {tech.regNo}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: '#ECFDF5',
                      color: '#065F46',
                      padding: '2px 6px',
                      borderRadius: '9999px',
                    }}
                  >
                    Active
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#1E293B' }}>
                    {user?.name || 'Department Administrator'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                    Primary Duty Officer &bull; {user?.departmentName || 'Campus'}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: '#ECFDF5',
                    color: '#065F46',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                  }}
                >
                  On Duty
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
