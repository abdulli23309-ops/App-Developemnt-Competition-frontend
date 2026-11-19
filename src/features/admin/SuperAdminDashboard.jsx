import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Download,
  FolderOpen,
  Hourglass,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Search,
  Filter,
  FileSpreadsheet,
  Clock,
  Star,
  Activity,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Layers,
  Check,
  Radio,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import api from '../../lib/api/client';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_COLORS = {
  Resolved: '#10B981',
  'In Progress': '#4F46E5',
  Pending: '#F59E0B',
  Rejected: '#F43F5E',
};

const DEPT_COLORS = ['#4338CA', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [summary, setSummary] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [selectedDeptId, setSelectedDeptId] = useState('all');

  const fetchCampusData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = selectedDeptId !== 'all' ? `?departmentId=${selectedDeptId}` : '';

      const [summaryRes, complaintsRes, deptsRes, statsRes, trendRes] =
        await Promise.all([
          api.get(`/analytics/summary${queryParams}`),
          api.get(`/complaints${queryParams}`),
          api.get('/departments'),
          api.get('/analytics/by-department').catch(() => ({ data: { success: false } })),
          api.get('/analytics/trend').catch(() => ({ data: { success: false } })),
        ]);

      if (summaryRes.data && summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
      if (complaintsRes.data && complaintsRes.data.success) {
        setComplaints(complaintsRes.data.data || []);
      }
      if (deptsRes.data && deptsRes.data.success) {
        setDepartments(deptsRes.data.data || []);
      }
      if (statsRes.data && statsRes.data.success) {
        setDeptStats(statsRes.data.data || []);
      }
      if (trendRes.data && trendRes.data.success) {
        setTrendData(trendRes.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching campus data:', err);
      toast.error('Failed to load campus-wide analytics.');
    } finally {
      setLoading(false);
    }
  }, [selectedDeptId, toast]);

  useEffect(() => {
    fetchCampusData();
  }, [fetchCampusData]);

  // Handle Real CSV Export
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get('/complaints/export/csv', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `campusconnect_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Grievance ledger exported to CSV successfully.');
    } catch (err) {
      console.error('CSV Export failed:', err);
      toast.error('Failed to export grievance ledger.');
    } finally {
      setExporting(false);
    }
  };

  // KPIs
  const totalComplaints = summary?.totalComplaints ?? complaints.length;
  const inProgressCount =
    summary?.inProgressCount ??
    complaints.filter((c) => c.status === 'In Progress' || c.status === 'InProgress').length;
  const resolvedCount =
    summary?.resolvedCount ??
    complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const breachedCount =
    summary?.slaBreachedCount ??
    complaints.filter((c) => c.isSlaBreached && c.status !== 'Resolved').length;

  const resolutionRate =
    totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 94;

  // Chart Data: Status Pie
  const statusPieData = useMemo(() => {
    const counts = {
      Resolved: resolvedCount,
      'In Progress': inProgressCount,
      Pending: complaints.filter((c) => c.status === 'Pending').length,
      Rejected: complaints.filter((c) => c.status === 'Rejected').length,
    };
    return Object.entries(counts)
      .filter(([_, val]) => val > 0)
      .map(([name, value]) => ({ name, value }));
  }, [complaints, resolvedCount, inProgressCount]);

  // Chart Data: Department Volume
  const departmentVolumeData = useMemo(() => {
    if (deptStats.length > 0) {
      return deptStats.map((d) => ({
        name: d.departmentName || d.name,
        total: d.totalComplaints || d.count || 0,
        resolved: d.resolvedCount || 0,
      }));
    }
    // Fallback computed from complaints
    const counts = {};
    complaints.forEach((c) => {
      const dName = c.departmentName || c.categoryName || 'General';
      counts[dName] = (counts[dName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [deptStats, complaints]);

  return (
    <div className="cc-page-container">
      {/* Executive Hero Banner */}
      <div className="cc-hero-welcome-card cc-super-banner">
        <div className="cc-hero-left">
          <div className="cc-hero-avatar-ring super">
            <Sparkles size={28} />
          </div>
          <div className="cc-hero-text">
            <div className="cc-hero-eyebrow">
              <span>CAMPUS-WIDE EXECUTIVE GOVERNANCE</span> &bull;{' '}
              <span className="cc-reg-tag">Ombudsman Directive Oversight</span>
            </div>
            <h1 className="cc-hero-name">
              {user?.fullName || user?.name || 'Executive SuperAdmin'}
            </h1>
            <p className="cc-hero-desc">
              Holistic dispute oversight across faculties. Monitor department turnaround times,
              audit SLA breaches, and export official compliance records.
            </p>
          </div>
        </div>

        <div className="cc-hero-right-actions">
          <Button
            variant="primary"
            size="md"
            icon={FileSpreadsheet}
            onClick={handleExportCsv}
            isLoading={exporting}
          >
            Export Grievance CSV
          </Button>
          <button
            type="button"
            className="cc-secondary-icon-button"
            onClick={fetchCampusData}
            title="Refresh analytics"
            aria-label="Refresh data"
          >
            <RefreshCw size={17} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="cc-filter-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={18} className="text-muted" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
            Filter Campus Department:
          </span>
          <select
            className="cc-select-sm"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
          >
            <option value="all">All University Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <Link to="/admin/complaints" className="cc-filter-action-link">
          Open Full Ticket Queue <ChevronRight size={15} />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="cc-kpi-grid">
        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">TOTAL CAMPUS INQUIRIES</span>
            <div className="cc-kpi-icon-wrap indigo">
              <FolderOpen size={18} />
            </div>
          </div>
          <div className="cc-kpi-value">{loading ? <Skeleton width={40} height={32} /> : totalComplaints}</div>
          <div className="cc-kpi-subtext">Across all academic facilities</div>
        </div>

        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">ACTIVE INVESTIGATIONS</span>
            <div className="cc-kpi-icon-wrap amber">
              <Hourglass size={18} />
            </div>
          </div>
          <div className="cc-kpi-value">{loading ? <Skeleton width={40} height={32} /> : inProgressCount}</div>
          <div className="cc-kpi-subtext">Currently assigned to technicians</div>
        </div>

        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">CAMPUS SLA COMPLIANCE</span>
            <div className="cc-kpi-icon-wrap emerald">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="cc-kpi-value">{loading ? <Skeleton width={40} height={32} /> : `${resolutionRate}%`}</div>
          <div className="cc-kpi-subtext">{resolvedCount} tickets resolved</div>
        </div>

        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">ESCALATED / BREACHED</span>
            <div className="cc-kpi-icon-wrap red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="cc-kpi-value" style={{ color: breachedCount > 0 ? '#EF4444' : undefined }}>
            {loading ? <Skeleton width={40} height={32} /> : breachedCount}
          </div>
          <div className="cc-kpi-subtext">Dean level intervention needed</div>
        </div>
      </div>

      {/* Charts Grid: Department Volume + Status Donut */}
      <div className="cc-charts-grid">
        {/* Department Volume Bar Chart */}
        <div className="cc-card">
          <div className="cc-card-header">
            <h3 className="cc-card-title">Grievance Volume by Department</h3>
            <span className="cc-chart-badge">Faculties</span>
          </div>
          <div className="cc-card-body" style={{ height: 280 }}>
            {loading ? (
              <Skeleton height={240} />
            ) : departmentVolumeData.length === 0 ? (
              <EmptyState title="No Data" description="No department statistics available." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} interval={0} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {departmentVolumeData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={DEPT_COLORS[index % DEPT_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="cc-card">
          <div className="cc-card-header">
            <h3 className="cc-card-title">Campus Status Distribution</h3>
            <span className="cc-chart-badge">Global Ratio</span>
          </div>
          <div className="cc-card-body" style={{ height: 280 }}>
            {loading ? (
              <Skeleton height={240} />
            ) : statusPieData.length === 0 ? (
              <EmptyState title="No Data" description="No tickets logged yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry) => (
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
      </div>

      {/* 30-Day Trend Chart */}
      {trendData.length > 0 && (
        <div className="cc-card">
          <div className="cc-card-header">
            <div className="cc-header-title-flex">
              <TrendingUp size={18} />
              <h3 className="cc-card-title">30-Day Grievance Submission &amp; Resolution Velocity</h3>
            </div>
          </div>
          <div className="cc-card-body" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4338CA" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4338CA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4338CA"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Department Oversight Table */}
      <div className="cc-card">
        <div className="cc-card-header">
          <div className="cc-header-title-flex">
            <Building2 size={18} />
            <h2 className="cc-card-title">Department Oversight Ledger</h2>
          </div>
          <span className="cc-sla-guarantee-pill">
            <Clock size={13} /> Strict Ombudsman SLA Enforced
          </span>
        </div>

        <div className="cc-card-body p-0">
          <div className="cc-desktop-table-container">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>FACULTY / DEPARTMENT</th>
                  <th>HEAD OF FACULTY</th>
                  <th>TOTAL TICKETS</th>
                  <th>RESOLVED</th>
                  <th>SLA TARGET</th>
                  <th>COMPLIANCE STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, index) => {
                  const deptTickets = complaints.filter(
                    (c) => c.departmentId === dept.id || c.departmentName === dept.name
                  );
                  const deptResolved = deptTickets.filter(
                    (c) => c.status === 'Resolved' || c.status === 'Closed'
                  ).length;
                  const deptBreached = deptTickets.filter(
                    (c) => c.isSlaBreached && c.status !== 'Resolved'
                  ).length;

                  return (
                    <tr key={dept.id || index}>
                      <td>
                        <div className="cc-table-dept-pill">
                          <Building2 size={15} />
                          <strong>{dept.name}</strong>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                          {dept.headName || 'Faculty Dean / Lead'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{deptTickets.length}</span>
                      </td>
                      <td>
                        <span style={{ color: '#059669', fontWeight: 600 }}>{deptResolved}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          {dept.slaHours ? `${dept.slaHours}h` : '48h'}
                        </span>
                      </td>
                      <td>
                        {deptBreached > 0 ? (
                          <Badge variant="urgent">
                            {deptBreached} Breached
                          </Badge>
                        ) : (
                          <Badge variant="resolved">100% Compliant</Badge>
                        )}
                      </td>
                      <td>
                        <Link
                          to={`/admin/complaints?dept=${dept.id}`}
                          className="cc-table-action-btn"
                        >
                          Audit Queue <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
