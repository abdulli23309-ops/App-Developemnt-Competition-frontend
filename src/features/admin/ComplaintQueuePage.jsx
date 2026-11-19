import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Download,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Hourglass,
  ArrowUpDown,
  Building2,
  ShieldCheck,
  ChevronRight,
  EyeOff,
  User,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import api from '../../lib/api/client';
import { useAuth } from '../auth/AuthContext';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function ComplaintQueuePage() {
  const { user, isSuperAdmin, isDeptAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archive'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in_progress' | 'overdue'
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortOption, setSortOption] = useState('sla_asc');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch complaints
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      if (res.data && res.data.success) {
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load complaints queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Sync search param if updated externally
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams, searchTerm]);

  // KPIs
  const unresolvedComplaints = useMemo(() => {
    return complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected');
  }, [complaints]);

  const overdueComplaints = useMemo(() => {
    return complaints.filter((c) => c.isSlaBreached && c.status !== 'Resolved');
  }, [complaints]);

  const activeTriageComplaints = useMemo(() => {
    return complaints.filter((c) => c.status === 'InProgress');
  }, [complaints]);

  const archiveComplaints = useMemo(() => {
    return complaints.filter((c) => c.status === 'Resolved' || c.status === 'Rejected');
  }, [complaints]);

  const slaComplianceRate = useMemo(() => {
    const totalResolved = complaints.filter((c) => c.status === 'Resolved');
    if (totalResolved.length === 0) return '100.0%';
    const onTime = totalResolved.filter((c) => !c.isSlaBreached).length;
    return `${((onTime / totalResolved.length) * 100).toFixed(1)}%`;
  }, [complaints]);

  // Filtered & Sorted items
  const filteredComplaints = useMemo(() => {
    let list = activeTab === 'active' ? unresolvedComplaints : archiveComplaints;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.trackingCode.toLowerCase().includes(term) ||
          c.title.toLowerCase().includes(term) ||
          (c.description && c.description.toLowerCase().includes(term)) ||
          (c.location && c.location.toLowerCase().includes(term)) ||
          (c.submitterName && c.submitterName.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (activeTab === 'active') {
      if (statusFilter === 'pending') {
        list = list.filter((c) => c.status === 'Pending');
      } else if (statusFilter === 'in_progress') {
        list = list.filter((c) => c.status === 'InProgress');
      } else if (statusFilter === 'overdue') {
        list = list.filter((c) => c.isSlaBreached);
      }
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      list = list.filter((c) => c.priority.toLowerCase() === priorityFilter.toLowerCase());
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sortOption === 'sla_asc') {
        return (a.slaRemainingMinutes ?? 9999) - (b.slaRemainingMinutes ?? 9999);
      }
      if (sortOption === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortOption === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortOption === 'priority_desc') {
        const order = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      return 0;
    });

    return list;
  }, [activeTab, unresolvedComplaints, archiveComplaints, searchTerm, statusFilter, priorityFilter, sortOption]);

  const paginatedComplaints = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredComplaints.slice(start, start + pageSize);
  }, [filteredComplaints, page]);

  const totalPages = Math.ceil(filteredComplaints.length / pageSize) || 1;

  // Toggle selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedComplaints.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // CSV Export
  const handleExportCsv = async () => {
    if (isSuperAdmin) {
      try {
        const res = await api.get('/complaints/export/csv', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `campusconnect_queue_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      } catch (err) {
        console.warn('SuperAdmin CSV export failed, falling back to client-scoped CSV:', err);
      }
    }

    // Client-side scoped export
    const rows = filteredComplaints.map((c) => ({
      TrackingCode: c.trackingCode,
      Title: c.title,
      Department: c.departmentName,
      Category: c.categoryName,
      Priority: c.priority,
      Status: c.status,
      Submitter: c.isAnonymous ? 'Anonymous' : c.submitterName,
      Location: c.location,
      SlaRemainingMinutes: c.slaRemainingMinutes,
      CreatedAt: c.createdAt,
    }));

    if (rows.length === 0) {
      alert('No records to export with current filters.');
      return;
    }

    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [
      headers,
      ...rows.map((r) =>
        Object.values(r)
          .map((val) => `"${(val ?? '').toString().replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `complaint_queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Dynamic scope label
  const getScopedViewText = () => {
    if (isSuperAdmin) {
      return 'Global Campus Tickets (Cross-Faculty Oversight • Super Admin Level)';
    }
    const dept = user?.departmentName || 'Department';
    return `${dept} Tickets (Strict departmental isolation active • RBAC Level 4)`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* 1. Header & Scoped View Banner */}
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
              <Lock size={12} />
              Scoped View
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
              <CheckCircle2 size={12} />
              LIVE SYNC
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
            Complaint Management Queue
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '4px 0 0 0' }}>
            {getScopedViewText()}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && (
            <span
              style={{
                background: '#4338CA',
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {selectedIds.length} Selected
            </span>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
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
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={fetchComplaints}
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
        </div>
      </div>

      {/* 2. Four KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Unresolved Queue */}
        <div className="cc-kpi-card">
          <div className="cc-kpi-header">
            <span className="cc-kpi-label">UNRESOLVED QUEUE</span>
            <div className="cc-kpi-icon-box" style={{ background: '#EEF2FF', color: '#4338CA' }}>
              <Hourglass size={16} />
            </div>
          </div>
          <div className="cc-kpi-value">{unresolvedComplaints.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
            Active open cases
          </div>
        </div>

        {/* SLA Breached / Overdue */}
        <div className="cc-kpi-card" style={{ borderColor: overdueComplaints.length > 0 ? '#FECDD3' : '#E2E8F0' }}>
          <div className="cc-kpi-header">
            <span className="cc-kpi-label">SLA BREACHED / OVERDUE</span>
            <div className="cc-kpi-icon-box" style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="cc-kpi-value" style={{ color: overdueComplaints.length > 0 ? '#DC2626' : '#1E1B4B' }}>
            {overdueComplaints.length < 10 ? `0${overdueComplaints.length}` : overdueComplaints.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 600, marginTop: '4px' }}>
            Immediate triage required
          </div>
        </div>

        {/* In Active Triage */}
        <div className="cc-kpi-card">
          <div className="cc-kpi-header">
            <span className="cc-kpi-label">IN ACTIVE TRIAGE</span>
            <div className="cc-kpi-icon-box" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              <RefreshCw size={16} />
            </div>
          </div>
          <div className="cc-kpi-value">{activeTriageComplaints.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#0284C7', marginTop: '4px' }}>
            Technicians on-site
          </div>
        </div>

        {/* Avg SLA Compliance */}
        <div className="cc-kpi-card">
          <div className="cc-kpi-header">
            <span className="cc-kpi-label">AVG. SLA COMPLIANCE</span>
            <div className="cc-kpi-icon-box" style={{ background: '#ECFDF5', color: '#10B981' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="cc-kpi-value">{slaComplianceRate}</div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>
            Institutional target &gt; 90%
          </div>
        </div>
      </div>

      {/* 3. Queue Tabs: Current Active vs Resolution History & Archive */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2E8F0' }}>
        <button
          type="button"
          onClick={() => {
            setActiveTab('active');
            setPage(1);
          }}
          style={{
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'active' ? '3px solid #4338CA' : '3px solid transparent',
            color: activeTab === 'active' ? '#4338CA' : '#64748B',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
          }}
        >
          <span>Current Active Queue</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: activeTab === 'active' ? '#EEF2FF' : '#F1F5F9',
              color: activeTab === 'active' ? '#4338CA' : '#64748B',
            }}
          >
            {unresolvedComplaints.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('archive');
            setPage(1);
          }}
          style={{
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'archive' ? '3px solid #4338CA' : '3px solid transparent',
            color: activeTab === 'archive' ? '#4338CA' : '#64748B',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
          }}
        >
          <span>Resolution History & Archive</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: activeTab === 'archive' ? '#EEF2FF' : '#F1F5F9',
              color: activeTab === 'archive' ? '#4338CA' : '#64748B',
            }}
          >
            {archiveComplaints.length}
          </span>
        </button>
      </div>

      {/* 4. Search and Filter Bar */}
      <div
        className="cc-card"
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ flex: '1', minWidth: '260px', position: 'relative' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ticket #CC-2026-XXXX, keyword, submitter..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Status Filter Pills (Active tab only) */}
          {activeTab === 'active' && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `All Active (${unresolvedComplaints.length})` },
                { id: 'pending', label: 'Pending' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'overdue', label: 'Overdue Only' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(pill.id);
                    setPage(1);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: statusFilter === pill.id ? '#4338CA' : '#E2E8F0',
                    background: statusFilter === pill.id ? '#4338CA' : '#FFFFFF',
                    color: statusFilter === pill.id ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdowns Row */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Priority */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '0.78rem',
                background: '#FFFFFF',
                color: '#334155',
              }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Sort By:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '0.78rem',
                background: '#FFFFFF',
                color: '#334155',
              }}
            >
              <option value="sla_asc">SLA Remaining (Ascending)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority_desc">Priority (Highest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Main Complaint Table */}
      <div className="cc-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 14px', width: '40px' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedComplaints.length > 0 &&
                      paginatedComplaints.every((c) => selectedIds.includes(c.id))
                    }
                  />
                </th>
                <th style={{ padding: '12px 14px' }}>Tracking Code</th>
                <th style={{ padding: '12px 14px' }}>Subject & Problem Summary</th>
                <th style={{ padding: '12px 14px' }}>Submitter</th>
                <th style={{ padding: '12px 14px' }}>Priority</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>SLA Time Remaining</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Skeleton height="32px" count={4} />
                  </td>
                </tr>
              ) : paginatedComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                    <EmptyState
                      icon={Hourglass}
                      title="No complaints in this queue view"
                      description="Adjust your search query or filter settings to view more tickets."
                    />
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      backgroundColor: selectedIds.includes(c.id) ? '#EEF2FF' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedIds.includes(c.id)) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedIds.includes(c.id)) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Checkbox */}
                    <td
                      style={{ padding: '12px 14px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOne(c.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => {}}
                      />
                    </td>

                    {/* Tracking Code */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: 800, color: '#4338CA' }}>
                        {c.trackingCode}
                      </span>
                      {c.isSlaBreached && (
                        <span style={{ color: '#EF4444', marginLeft: '4px', fontWeight: 700 }}>
                          ⚠
                        </span>
                      )}
                    </td>

                    {/* Subject & Summary */}
                    <td style={{ padding: '12px 14px', maxWidth: '320px' }}>
                      <div style={{ fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.location || 'Campus Facilities'} &bull; {c.categoryName}
                      </div>
                    </td>

                    {/* Submitter (Masking if Anonymous) */}
                    <td style={{ padding: '12px 14px' }}>
                      {c.isAnonymous ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span
                            style={{
                              background: '#F1F5F9',
                              color: '#475569',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <EyeOff size={11} />
                            [Identity Masked]
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.8rem' }}>
                            {c.submitterName || 'Student'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            {c.submitterRegNo || 'Enrolled Student'}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Priority */}
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant="priority" value={c.priority} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant="status" value={c.status} />
                    </td>

                    {/* SLA Time Remaining */}
                    <td style={{ padding: '12px 14px' }}>
                      {c.status === 'Resolved' ? (
                        <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.75rem' }}>
                          ✓ Resolved
                        </span>
                      ) : c.isSlaBreached ? (
                        <span
                          style={{
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FECDD3',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                          }}
                        >
                          BREACHED
                        </span>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#1E293B' }}>
                          <div style={{ fontWeight: 700 }}>
                            {c.slaRemainingMinutes && c.slaRemainingMinutes > 0
                              ? `${Math.floor(c.slaRemainingMinutes / 60)}h ${Math.round(c.slaRemainingMinutes % 60)}m left`
                              : 'Under SLA'}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                            Target: {c.slaTargetHours || 48}h SLA
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination Footer */}
        <div
          style={{
            padding: '0.875rem 1.25rem',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Showing {paginatedComplaints.length} of {filteredComplaints.length} active complaints
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: page <= 1 ? '#F1F5F9' : '#FFFFFF',
                color: page <= 1 ? '#94A3B8' : '#334155',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: page >= totalPages ? '#F1F5F9' : '#FFFFFF',
                color: page >= totalPages ? '#94A3B8' : '#334155',
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
    </div>
  );
}
