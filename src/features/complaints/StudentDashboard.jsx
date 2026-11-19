import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  FolderOpen,
  Hourglass,
  RefreshCw,
  CheckCircle2,
  Flag,
  PlusCircle,
  BookOpen,
  Clock,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  FileText,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MapPin,
  UtensilsCrossed,
  Server,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import api from '../../lib/api/client';
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

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [summary, setSummary] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, complaintsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/complaints'),
      ]);

      if (summaryRes.data && summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
      if (complaintsRes.data && complaintsRes.data.success) {
        setRecentComplaints(complaintsRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Unable to load campus dashboard data. Please verify your connection.');
      toast.error('Failed to load real-time student dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const totalCount = recentComplaints.length;
  const inProgressCount = recentComplaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'InProgress'
  ).length;
  const pendingCount = recentComplaints.filter((c) => c.status === 'Pending').length;
  const resolvedCount = recentComplaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;

  return (
    <div className="cc-page-container">
      {/* Welcome Hero Banner */}
      <div className="cc-hero-welcome-card">
        <div className="cc-hero-left">
          <div className="cc-hero-avatar-ring">
            <GraduationCap size={28} />
          </div>
          <div className="cc-hero-text">
            <div className="cc-hero-eyebrow">
              <span>{getGreeting()}</span> &bull;{' '}
              <span className="cc-reg-tag">{user?.registrationNumber || 'BIIT Student'}</span>
            </div>
            <h1 className="cc-hero-name">{user?.fullName || user?.name || 'Student Member'}</h1>
            <p className="cc-hero-desc">
              CampusConnect Grievance Desk. Track your active campus inquiries, lodge complaints
              with 24-48h SLAs, and evaluate resolution turnaround.
            </p>
          </div>
        </div>

        <div className="cc-hero-right-actions">
          <Link to="/complaints/new" className="cc-primary-cta-button">
            <PlusCircle size={18} strokeWidth={2.5} />
            <span>File New Grievance</span>
          </Link>
          <button
            type="button"
            className="cc-secondary-icon-button"
            onClick={fetchDashboardData}
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
            <span className="cc-kpi-label">TOTAL LODGED</span>
            <div className="cc-kpi-icon-wrap indigo">
              <FolderOpen size={18} />
            </div>
          </div>
          <div className="cc-kpi-value">{loading ? <Skeleton width={40} height={32} /> : totalCount}</div>
          <div className="cc-kpi-subtext">All historical campus tickets</div>
        </div>

        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">ACTIVE TRIAGE</span>
            <div className="cc-kpi-icon-wrap amber">
              <Hourglass size={18} />
            </div>
          </div>
          <div className="cc-kpi-value">{loading ? <Skeleton width={40} height={32} /> : inProgressCount}</div>
          <div className="cc-kpi-subtext">Assigned to department techs</div>
        </div>

        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">AWAITING REVIEW</span>
            <div className="cc-kpi-icon-wrap blue">
              <Clock size={18} />
            </div>
          </div>
          <div className="cc-kpi-value">{loading ? <Skeleton width={40} height={32} /> : pendingCount}</div>
          <div className="cc-kpi-subtext">Pending initial queue dispatch</div>
        </div>

        <div className="cc-kpi-card">
          <div className="cc-kpi-top">
            <span className="cc-kpi-label">RESOLVED TICKETS</span>
            <div className="cc-kpi-icon-wrap emerald">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="cc-kpi-value">{loading ? <Skeleton width={40} height={32} /> : resolvedCount}</div>
          <div className="cc-kpi-subtext">Satisfactorily completed</div>
        </div>
      </div>

      {/* Main Grid: Recent Grievances + Side Cards */}
      <div className="cc-dashboard-split">
        {/* Left Column: Recent Grievances List */}
        <div className="cc-dashboard-main-col">
          <div className="cc-card">
            <div className="cc-card-header">
              <div className="cc-header-title-flex">
                <FileText size={18} />
                <h2 className="cc-card-title">Recent Grievances &amp; Tracking</h2>
              </div>
              <Link to="/student/complaints" className="cc-view-all-link">
                View All ({totalCount}) <ChevronRight size={15} />
              </Link>
            </div>

            <div className="cc-card-body p-0">
              {loading ? (
                <div style={{ padding: '1.25rem' }}>
                  <Skeleton height={60} count={3} />
                </div>
              ) : recentComplaints.length === 0 ? (
                <EmptyState
                  icon={FolderOpen}
                  title="No Grievances Filed"
                  description="You have not submitted any complaints yet. Everything in campus working smoothly?"
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/complaints/new')}
                    >
                      File First Grievance
                    </Button>
                  }
                />
              ) : (
                <div className="cc-tickets-table-wrap">
                  <table className="cc-table">
                    <thead>
                      <tr>
                        <th>TRACKING CODE</th>
                        <th>SUMMARY &amp; FACILITY</th>
                        <th>DEPARTMENT</th>
                        <th>PRIORITY</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentComplaints.slice(0, 6).map((c) => {
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
                                  <MapPin size={12} /> {c.location || 'Campus Facilities'}
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
                              <Badge variant={c.priority?.toLowerCase()}>{c.priority}</Badge>
                            </td>
                            <td>
                              <Badge variant={c.status?.toLowerCase()}>{c.status}</Badge>
                            </td>
                            <td>
                              <Link
                                to={`/complaints/${c.id}`}
                                className="cc-table-action-btn"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View <ChevronRight size={14} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: SLA Commitment & Guidelines */}
        <div className="cc-dashboard-side-col">
          {/* Institutional SLA Guarantee Card */}
          <div className="cc-card cc-side-info-card">
            <div className="cc-card-header">
              <div className="cc-header-title-flex">
                <ShieldCheck size={18} className="text-primary" />
                <h3 className="cc-card-title">Institutional SLA Standards</h3>
              </div>
            </div>
            <div className="cc-card-body">
              <p className="cc-side-desc">
                Under the Federal Ombudsman Charter, tickets are assigned strict resolution
                timelines:
              </p>
              <div className="cc-sla-guarantee-list">
                <div className="cc-sla-row">
                  <div className="cc-sla-badge-circle cafe">
                    <UtensilsCrossed size={14} />
                  </div>
                  <div className="cc-sla-meta">
                    <strong>Cafeteria &amp; Hygiene:</strong>
                    <span>24 Hours Maximum</span>
                  </div>
                </div>

                <div className="cc-sla-row">
                  <div className="cc-sla-badge-circle it">
                    <Server size={14} />
                  </div>
                  <div className="cc-sla-meta">
                    <strong>IT Labs &amp; Infrastructure:</strong>
                    <span>48 Hours Maximum</span>
                  </div>
                </div>

                <div className="cc-sla-row">
                  <div className="cc-sla-badge-circle lib">
                    <BookOpen size={14} />
                  </div>
                  <div className="cc-sla-meta">
                    <strong>Library &amp; Course Materials:</strong>
                    <span>48 Hours Maximum</span>
                  </div>
                </div>

                <div className="cc-sla-row">
                  <div className="cc-sla-badge-circle acad">
                    <GraduationCap size={14} />
                  </div>
                  <div className="cc-sla-meta">
                    <strong>Academic &amp; Faculty Inquiries:</strong>
                    <span>72 Hours Maximum</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Filing Tips */}
          <div className="cc-card cc-tips-card">
            <div className="cc-card-header">
              <div className="cc-header-title-flex">
                <Sparkles size={18} className="text-amber" />
                <h3 className="cc-card-title">Filing Pro-Tips</h3>
              </div>
            </div>
            <div className="cc-card-body">
              <ul className="cc-tips-list">
                <li>
                  <strong>Include Photos:</strong> Diagnostic photos speed up technician triage by 65%.
                </li>
                <li>
                  <strong>Specific Locations:</strong> Name the exact lab room, workstation, or table number.
                </li>
                <li>
                  <strong>Anonymity:</strong> You can toggle whistleblower privacy if reporting sensitive matters.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
