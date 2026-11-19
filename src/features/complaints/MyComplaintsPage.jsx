import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  MapPin,
  Building,
  Filter,
  Sparkles,
  UtensilsCrossed,
  BookOpen,
  Server,
  GraduationCap,
  HelpCircle,
} from 'lucide-react';
import api from '../../lib/api/client';
import { useToast } from '../../components/ui/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import StarRating from '../../components/ui/StarRating';

const getCategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('cafe') || n.includes('food')) return UtensilsCrossed;
  if (n.includes('library') || n.includes('book')) return BookOpen;
  if (n.includes('lab') || n.includes('it') || n.includes('infra')) return Server;
  if (n.includes('teach') || n.includes('acad')) return GraduationCap;
  return HelpCircle;
};

export default function MyComplaintsPage() {
  const navigate = useNavigate();
  const toast = useToast();

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
        api.get('/departments').catch(() => ({ data: { success: false } })),
      ]);

      if (complaintsRes.data && complaintsRes.data.success) {
        setComplaints(complaintsRes.data.data || []);
      }
      if (deptsRes.data && deptsRes.data.success) {
        setDepartments(deptsRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
      toast.error('Unable to fetch your complaint records.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, deptFilter, toast]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // Handle interactive 5-star rating submission directly from list
  const handleRatingSubmit = async (complaintId, ratingScore) => {
    setRatingLoadingId(complaintId);
    try {
      const res = await api.patch(`/complaints/${complaintId}/rating`, {
        rating: ratingScore,
        comment: 'Rated via My Complaints rating widget',
      });
      if (res.data && res.data.success) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === complaintId
              ? { ...c, ratingScore, ratingComment: 'Rated via My Complaints' }
              : c
          )
        );
        toast.success(`Rated ticket with ${ratingScore} star${ratingScore > 1 ? 's' : ''}!`);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
      toast.error(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setRatingLoadingId(null);
    }
  };

  const statusOptions = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

  return (
    <div className="cc-page-container">
      {/* Page Title & Top Actions */}
      <div className="cc-page-header-row">
        <div>
          <h1 className="cc-section-title">My Registered Grievances</h1>
          <p className="cc-section-subtitle">
            Track status transitions, SLA targets, and technician remarks for all your filings.
          </p>
        </div>

        <div className="cc-header-button-group">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={loadComplaints}
            isLoading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/complaints/new')}
          >
            File Grievance
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="cc-filter-toolbar">
        <div className="cc-search-input-wrap">
          <Search size={16} className="cc-search-icon" />
          <input
            type="text"
            className="cc-search-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, tracking code, or keyword..."
          />
          {search && (
            <button
              type="button"
              className="cc-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        <div className="cc-filter-pills-row">
          {statusOptions.map((st) => (
            <button
              key={st}
              type="button"
              className={`cc-filter-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        {departments.length > 0 && (
          <div className="cc-dept-select-wrap">
            <select
              className="cc-select-sm"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
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
      </div>

      {/* Grievances List (Desktop Table + Mobile Cards) */}
      <div className="cc-card">
        <div className="cc-card-body p-0">
          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <Skeleton height={70} count={4} />
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={SlidersHorizontal}
              title="No Matching Grievances Found"
              description="No tickets match your active filter or search query. Try resetting filters."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('All');
                    setDeptFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <>
              {/* Desktop Table View (>= 768px) */}
              <div className="cc-desktop-table-container">
                <table className="cc-table">
                  <thead>
                    <tr>
                      <th>TRACKING CODE</th>
                      <th>TITLE &amp; LOCATION</th>
                      <th>DEPARTMENT</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th>RATING &amp; FEEDBACK</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => {
                      const IconComp = getCategoryIcon(c.categoryName || c.departmentName);
                      const isResolved = c.status === 'Resolved' || c.status === 'Closed';

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
                          <td onClick={(e) => e.stopPropagation()}>
                            {isResolved ? (
                              <StarRating
                                initialRating={c.ratingScore || 0}
                                onRatingChange={(rating) => handleRatingSubmit(c.id, rating)}
                                size={18}
                              />
                            ) : (
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                Awaiting resolution
                              </span>
                            )}
                          </td>
                          <td>
                            <Link
                              to={`/complaints/${c.id}`}
                              className="cc-table-action-btn"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Details <ChevronRight size={14} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View (< 768px) */}
              <div className="cc-mobile-cards-list">
                {complaints.map((c) => {
                  const IconComp = getCategoryIcon(c.categoryName || c.departmentName);
                  const isResolved = c.status === 'Resolved' || c.status === 'Closed';

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

                      {isResolved && (
                        <div
                          className="cc-mobile-rating-box"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="cc-rating-prompt-label">Rate resolution:</span>
                          <StarRating
                            initialRating={c.ratingScore || 0}
                            onRatingChange={(rating) => handleRatingSubmit(c.id, rating)}
                            size={20}
                          />
                        </div>
                      )}

                      <div className="cc-mobile-card-footer">
                        <span className="cc-mobile-view-link">
                          View details &amp; remarks <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
