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
  ChevronLeft,
  FileSpreadsheet,
  MapPin,
  UtensilsCrossed,
  BookOpen,
  Server,
  GraduationCap,
  HelpCircle,
} from 'lucide-react';
import api from '../../lib/api/client';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const getCategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('cafe') || n.includes('food')) return UtensilsCrossed;
  if (n.includes('library') || n.includes('book')) return BookOpen;
  if (n.includes('lab') || n.includes('it') || n.includes('infra')) return Server;
  if (n.includes('teach') || n.includes('acad')) return GraduationCap;
  return HelpCircle;
};

export default function ComplaintQueuePage() {
  const { user, isSuperAdmin, isDeptAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'overdue' | 'resolved' | 'all'
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState(searchParams.get('dept') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortOption, setSortOption] = useState('sla_asc'); // 'sla_asc' | 'created_desc' | 'priority_desc'
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Fetch complaints & departments
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const [compRes, deptRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/departments').catch(() => ({ data: { success: false } })),
      ]);

      if (compRes.data && compRes.data.success) {
        setComplaints(compRes.data.data || []);
      }
      if (deptRes.data && deptRes.data.success) {
        setDepartments(deptRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load complaints queue:', err);
      toast.error('Unable to fetch triage queue from server.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Handle Export CSV
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
      link.setAttribute('download', `campusconnect_queue_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Queue exported to CSV successfully.');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  };

  // KPIs
  const unresolvedComplaints = useMemo(
    () => complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected'),
    [complaints]
  );
  const overdueComplaints = useMemo(
    () => complaints.filter((c) => c.isSlaBreached && c.status !== 'Resolved'),
    [complaints]
  );
  const resolvedComplaints = useMemo(
    () => complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed'),
    [complaints]
  );

  // Filtered & Sorted List
  const filteredComplaints = useMemo(() => {
    let result = [...complaints];

    // Tab filter
    if (activeTab === 'active') {
      result = result.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected');
    } else if (activeTab === 'overdue') {
      result = result.filter((c) => c.isSlaBreached && c.status !== 'Resolved');
    } else if (activeTab === 'resolved') {
      result = result.filter((c) => c.status === 'Resolved' || c.status === 'Rejected');
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(
        (c) => (c.priority || '').toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    // Department filter (SuperAdmin)
    if (deptFilter !== 'all') {
      result = result.filter(
        (c) =>
          String(c.departmentId) === String(deptFilter) ||
          c.departmentName?.toLowerCase() === deptFilter.toLowerCase()
      );
    }

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.trackingCode?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q) ||
          c.submitterName?.toLowerCase().includes(q) ||
          c.categoryName?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'sla_asc') {
        const aMin = a.slaRemainingMinutes ?? 99999;
        const bMin = b.slaRemainingMinutes ?? 99999;
        return aMin - bMin;
      }
      if (sortOption === 'created_desc') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortOption === 'priority_desc') {
        const pOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return 0;
    });

    return result;
  }, [complaints, activeTab, priorityFilter, deptFilter, searchTerm, sortOption]);

  const totalPages = Math.ceil(filteredComplaints.length / pageSize) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredComplaints.slice(start, start + pageSize);
  }, [filteredComplaints, page]);

  return (
    <div className="cc-page-container">
      {/* Header Row */}
      <div className="cc-page-header-row">
        <div>
          <h1 className="cc-section-title">
            {isSuperAdmin ? 'Campus-Wide Grievance Queue' : 'Department Triage Queue'}
          </h1>
          <p className="cc-section-subtitle">
            {isSuperAdmin
              ? 'Omnichannel campus docket view. Audit technician dispatches, monitor SLA compliance, and enforce dispute timelines.'
              : `Active tickets assigned to ${user?.departmentName || 'your department'}. Manage status, assign staff, and post remarks.`}
          </p>
        </div>

        <div className="cc-header-button-group">
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="md"
              icon={FileSpreadsheet}
              onClick={handleExportCsv}
              isLoading={exporting}
            >
              Export CSV
            </Button>
          )}
          <Button
            variant="subtle"
            size="md"
            icon={RefreshCw}
            onClick={fetchComplaints}
            isLoading={loading}
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* KPI Tally Pills */}
      <div className="cc-kpi-grid">
        <div
          className={`cc-queue-kpi-card ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('active');
            setPage(1);
          }}
        >
          <div className="cc-queue-kpi-num">{unresolvedComplaints.length}</div>
          <div className="cc-queue-kpi-meta">
            <strong>Active Inquiries</strong>
            <span>Awaiting triage or in repair</span>
          </div>
        </div>

        <div
          className={`cc-queue-kpi-card overdue ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('overdue');
            setPage(1);
          }}
        >
          <div className="cc-queue-kpi-num text-danger">{overdueComplaints.length}</div>
          <div className="cc-queue-kpi-meta">
            <strong className="text-danger">SLA Breached</strong>
            <span>Escalated to Department Deans</span>
          </div>
        </div>

        <div
          className={`cc-queue-kpi-card resolved ${activeTab === 'resolved' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('resolved');
            setPage(1);
          }}
        >
          <div className="cc-queue-kpi-num text-success">{resolvedComplaints.length}</div>
          <div className="cc-queue-kpi-meta">
            <strong className="text-success">Resolved Archive</strong>
            <span>Closed with satisfaction scores</span>
          </div>
        </div>

        <div
          className={`cc-queue-kpi-card ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('all');
            setPage(1);
          }}
        >
          <div className="cc-queue-kpi-num">{complaints.length}</div>
          <div className="cc-queue-kpi-meta">
            <strong>All Dockets</strong>
            <span>Complete ledger records</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="cc-filter-toolbar">
        {/* Search Input */}
        <div className="cc-search-input-wrap">
          <Search size={16} className="cc-search-icon" />
          <input
            type="text"
            className="cc-search-field"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by tracking code, title, student, or location..."
          />
          {searchTerm && (
            <button
              type="button"
              className="cc-search-clear"
              onClick={() => setSearchTerm('')}
            >
              &times;
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="cc-select-wrap">
          <select
            className="cc-select-sm"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Department Filter (SuperAdmin) */}
        {isSuperAdmin && departments.length > 0 && (
          <div className="cc-select-wrap">
            <select
              className="cc-select-sm"
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Selector */}
        <div className="cc-select-wrap">
          <select
            className="cc-select-sm"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="sla_asc">SLA Urgency (Shortest First)</option>
            <option value="created_desc">Newest First</option>
            <option value="priority_desc">Priority (Urgent &rarr; Low)</option>
          </select>
        </div>
      </div>

      {/* Table & Cards Card */}
      <div className="cc-card">
        <div className="cc-card-body p-0">
          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <Skeleton height={60} count={4} />
            </div>
          ) : paginatedComplaints.length === 0 ? (
            <EmptyState
              icon={SlidersHorizontal}
              title="No Tickets Found"
              description="No grievance tickets match your selected criteria or search term."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setPriorityFilter('all');
                    setDeptFilter('all');
                    setActiveTab('all');
                  }}
                >
                  Reset Filters
                </Button>
              }
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="cc-desktop-table-container">
                <table className="cc-table">
                  <thead>
                    <tr>
                      <th>TRACKING CODE</th>
                      <th>TITLE &amp; LOCATION</th>
                      <th>DEPARTMENT</th>
                      <th>SUBMITTER</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th>SLA COUNTDOWN</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedComplaints.map((c) => {
                      const IconComp = getCategoryIcon(c.categoryName || c.departmentName);
                      return (
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
                                <MapPin size={12} /> {c.location || 'Campus'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="cc-table-dept-pill">
                              <IconComp size={14} />
                              <span>{c.departmentName || c.categoryName || 'General'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="cc-table-submitter">
                              {c.isAnonymous && !isSuperAdmin
                                ? 'Anonymous Student'
                                : c.submitterName || 'Student'}
                            </span>
                          </td>
                          <td>
                            <Badge variant={c.priority?.toLowerCase()}>{c.priority}</Badge>
                          </td>
                          <td>
                            <Badge variant={c.status?.toLowerCase()}>{c.status}</Badge>
                          </td>
                          <td>
                            {c.isSlaBreached && c.status !== 'Resolved' ? (
                              <span className="cc-sla-tag-breached">
                                <AlertTriangle size={12} /> Breached
                              </span>
                            ) : c.status === 'Resolved' ? (
                              <span className="cc-sla-tag-resolved">
                                <CheckCircle2 size={12} /> Resolved
                              </span>
                            ) : (
                              <span className="cc-sla-tag-ok">
                                <Clock size={12} />{' '}
                                {c.slaRemainingMinutes
                                  ? `${Math.round(c.slaRemainingMinutes / 60)}h left`
                                  : 'On Track'}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="cc-mobile-cards-list">
                {paginatedComplaints.map((c) => {
                  const IconComp = getCategoryIcon(c.categoryName || c.departmentName);
                  return (
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
                        <div className="cc-mobile-dept">
                          <IconComp size={14} />
                          <span>{c.departmentName || c.categoryName || 'General'}</span>
                        </div>
                        <div className="cc-mobile-loc">
                          <MapPin size={13} />
                          <span>{c.location || 'Campus Facilities'}</span>
                        </div>
                      </div>

                      <div className="cc-mobile-card-footer">
                        <div className="cc-mobile-sla-info">
                          {c.isSlaBreached && c.status !== 'Resolved' ? (
                            <span className="cc-sla-tag-breached">
                              <AlertTriangle size={12} /> SLA Breached
                            </span>
                          ) : (
                            <span className="cc-sla-tag-ok">
                              <Clock size={12} />{' '}
                              {c.slaRemainingMinutes
                                ? `${Math.round(c.slaRemainingMinutes / 60)}h remaining`
                                : 'On Track'}
                            </span>
                          )}
                        </div>
                        <span className="cc-mobile-view-link">
                          Manage <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="cc-pagination-bar">
                  <span className="cc-pagination-info">
                    Showing {(page - 1) * pageSize + 1} to{' '}
                    {Math.min(page * pageSize, filteredComplaints.length)} of{' '}
                    {filteredComplaints.length} dockets
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
