import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  Plus,
  Clock,
  MessageSquare,
  Paperclip,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Hourglass,
  CheckCircle2,
  XCircle,
  User,
} from 'lucide-react';
import api from '../../lib/api/client';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import StarRating from '../../components/ui/StarRating';

export default function MyComplaintsPage() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingLoadingId, setRatingLoadingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('all');

  // Load complaints and departments
  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;
      if (deptFilter !== 'all') params.departmentId = deptFilter;

      const [complaintsRes, deptsRes] = await Promise.all([
        api.get('/complaints', { params }),
        api.get('/departments'),
      ]);

      if (complaintsRes.data && complaintsRes.data.success) {
        setComplaints(complaintsRes.data.data);
      }
      if (deptsRes.data && deptsRes.data.success) {
        setDepartments(deptsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, deptFilter]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // Handle interactive 5-star rating submission
  const handleRatingSubmit = async (complaintId, ratingScore) => {
    setRatingLoadingId(complaintId);
    try {
      const res = await api.patch(`/complaints/${complaintId}/rating`, {
        rating: ratingScore,
        comment: 'Rated via My Complaints rating widget'
      });
      if (res.data && res.data.success) {
        // Optimistically update complaint in state
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === complaintId
              ? { ...c, ratingScore, ratingComment: 'Feedback recorded' }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setRatingLoadingId(null);
    }
  };

  // Status counts calculation
  const statusCounts = {
    all: complaints.length,
    pending: complaints.filter((c) => c.status === 'Submitted' || c.status === 'Pending' || c.status === 'UnderReview').length,
    inProgress: complaints.filter((c) => c.status === 'InProgress' || c.status === 'Assigned').length,
    resolved: complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length,
    rejected: complaints.filter((c) => c.status === 'Rejected').length,
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));
    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Yesterday';
    if (diffHours < 168) return `${Math.floor(diffHours / 24)} days ago`;
    return `${Math.floor(diffHours / 168)} week ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 0.25rem 0' }}>
            My Complaints
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            Track and manage your {complaints.length} filed tickets
          </p>
        </div>
        <button
          type="button"
          onClick={loadComplaints}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4338CA',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
          title="Refresh complaints"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Search Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '0.625rem 0.875rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Search size={18} color="#94A3B8" />
        <input
          type="text"
          placeholder="Search by ticket ID, title, or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.875rem',
            color: '#1E293B',
            background: 'transparent',
          }}
        />
        <SlidersHorizontal size={18} color="#94A3B8" />
      </div>

      {/* Status Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '4px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          type="button"
          onClick={() => setStatusFilter('All')}
          style={{
            padding: '0.35rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: statusFilter === 'All' ? '#4338CA' : '#FFFFFF',
            color: statusFilter === 'All' ? '#FFFFFF' : '#475569',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            whiteSpace: 'nowrap',
          }}
        >
          All {statusCounts.all}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Submitted')}
          style={{
            padding: '0.35rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: statusFilter === 'Submitted' ? '#F59E0B' : '#FFFFFF',
            color: statusFilter === 'Submitted' ? '#FFFFFF' : '#B45309',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusFilter === 'Submitted' ? '#FFFFFF' : '#F59E0B' }} />
          Pending {statusCounts.pending}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('InProgress')}
          style={{
            padding: '0.35rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: statusFilter === 'InProgress' ? '#4F46E5' : '#FFFFFF',
            color: statusFilter === 'InProgress' ? '#FFFFFF' : '#4338CA',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusFilter === 'InProgress' ? '#FFFFFF' : '#4F46E5' }} />
          In Progress {statusCounts.inProgress}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Resolved')}
          style={{
            padding: '0.35rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: statusFilter === 'Resolved' ? '#10B981' : '#FFFFFF',
            color: statusFilter === 'Resolved' ? '#FFFFFF' : '#047857',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusFilter === 'Resolved' ? '#FFFFFF' : '#10B981' }} />
          Resolved {statusCounts.resolved}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Rejected')}
          style={{
            padding: '0.35rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: statusFilter === 'Rejected' ? '#EF4444' : '#FFFFFF',
            color: statusFilter === 'Rejected' ? '#FFFFFF' : '#B91C1C',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusFilter === 'Rejected' ? '#FFFFFF' : '#EF4444' }} />
          Rejected {statusCounts.rejected}
        </button>
      </div>

      {/* Department Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
          DEPT:
        </span>
        <button
          type="button"
          onClick={() => setDeptFilter('all')}
          style={{
            padding: '0.3rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: deptFilter === 'all' ? '#EEF2FF' : '#F1F5F9',
            color: deptFilter === 'all' ? '#4338CA' : '#475569',
            whiteSpace: 'nowrap',
          }}
        >
          All Departments
        </button>
        {departments.map((dept) => (
          <button
            key={dept.id}
            type="button"
            onClick={() => setDeptFilter(dept.id.toString())}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: deptFilter === dept.id.toString() ? '#EEF2FF' : '#F1F5F9',
              color: deptFilter === dept.id.toString() ? '#4338CA' : '#475569',
              whiteSpace: 'nowrap',
            }}
          >
            {dept.name.split('&')[0].trim()}
          </button>
        ))}
      </div>

      {/* Complaint Cards List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="160px" radius="16px" />
          <Skeleton height="160px" radius="16px" />
          <Skeleton height="160px" radius="16px" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="cc-card">
          <EmptyState
            icon={CheckCircle2}
            title="No matching complaints found"
            description="There are no grievances matching your current search or filter criteria."
            action={
              <button
                type="button"
                className="cc-cta-btn-white"
                style={{ background: '#4338CA', color: '#FFF' }}
                onClick={() => {
                  setSearch('');
                  setStatusFilter('All');
                  setDeptFilter('all');
                }}
              >
                Reset Filters
              </button>
            }
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complaints.map((item) => {
            const isResolved = item.status === 'Resolved' || item.status === 'Closed';
            const isInProgress = item.status === 'InProgress' || item.status === 'Assigned';
            const isPending = item.status === 'Submitted' || item.status === 'Pending' || item.status === 'UnderReview';
            const isRejected = item.status === 'Rejected';

            return (
              <div
                key={item.id}
                className="cc-card cc-card-hover"
                style={{ padding: '1.25rem', position: 'relative' }}
              >
                {/* Top Code & Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>
                      #{item.trackingCode}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      • Submitted {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Badge variant={item.priority} showDot>
                      {item.priority}
                    </Badge>
                    <Badge variant={item.status} showDot>
                      {item.status}
                    </Badge>
                  </div>
                </div>

                {/* Category Pill */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <Badge variant="category">
                    {item.categoryName}
                  </Badge>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: '0 0 0.35rem 0',
                    lineHeight: 1.35,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/complaints/${item.id}`)}
                >
                  {item.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontSize: '0.825rem',
                    color: '#64748B',
                    margin: '0 0 0.875rem 0',
                    lineHeight: 1.45,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/complaints/${item.id}`)}
                >
                  {item.description}
                </p>

                {/* Step Progress Bar (For In-Progress) */}
                {isInProgress && (
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      marginBottom: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#4338CA', marginBottom: '0.35rem' }}>
                      <span>Step 2 of 3: Investigation</span>
                      <span>66%</span>
                    </div>
                    <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <div style={{ width: '66%', height: '100%', background: '#4338CA', borderRadius: '9999px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                      <span>1. Triaged</span>
                      <span style={{ color: '#4338CA', fontWeight: 700 }}>2. In Diagnosis</span>
                      <span>3. Resolved</span>
                    </div>
                  </div>
                )}

                {/* Pending Notice Box */}
                {isPending && (
                  <div
                    style={{
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '10px',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.78rem',
                      color: '#92400E',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.875rem',
                    }}
                  >
                    <Hourglass size={15} color="#D97706" />
                    <span>Awaiting Department Review &bull; Escalate after 48h</span>
                  </div>
                )}

                {/* Interactive 5-Star Rating Widget (For Resolved Complaints!) */}
                {isResolved && (
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      marginBottom: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>
                        Rate Resolution Experience
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                        {item.ratingScore ? 'Feedback recorded' : 'Feedback helpful'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StarRating
                        initialRating={item.ratingScore || 0}
                        onRatingChange={(score) => handleRatingSubmit(item.id, score)}
                        readOnly={ratingLoadingId === item.id}
                      />
                      {ratingLoadingId === item.id && (
                        <span style={{ fontSize: '0.72rem', color: '#059669' }}>Saving...</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejected Reason Alert */}
                {isRejected && (
                  <div
                    style={{
                      background: '#FFF1F2',
                      border: '1px solid #FECDD3',
                      borderRadius: '10px',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.78rem',
                      color: '#9F1239',
                      marginBottom: '0.875rem',
                    }}
                  >
                    <strong>Ticket Rejected:</strong> {item.rejectionReason || 'Ineligible under college guidelines.'}
                  </div>
                )}

                {/* Footer Meta Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.625rem', borderTop: '1px solid #F1F5F9', fontSize: '0.75rem', color: '#64748B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {item.lastUpdatedBy ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={13} />
                        Updated by {item.lastUpdatedBy}
                      </span>
                    ) : (
                      <span>Direct submission to Student Welfare</span>
                    )}

                    {item.remarksCount > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={13} />
                        {item.remarksCount}
                      </span>
                    )}

                    {item.attachmentsCount > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Paperclip size={13} />
                        {item.attachmentsCount} photos
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/complaints/${item.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontWeight: 700,
                      color: '#4338CA',
                      textDecoration: 'none',
                    }}
                  >
                    <span>View details</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile Sticky "+ New Complaint" CTA */}
      <div
        className="cc-mobile-cta"
        style={{
          position: 'sticky',
          bottom: '72px',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '0.5rem',
        }}
      >
        <Link
          to="/complaints/new"
          style={{
            background: 'var(--color-primary-gradient)',
            color: '#FFFFFF',
            padding: '0.65rem 1.5rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(67, 56, 202, 0.4)',
            textDecoration: 'none',
          }}
        >
          <Plus size={18} />
          <span>+ New Complaint</span>
        </Link>
      </div>
    </div>
  );
}
