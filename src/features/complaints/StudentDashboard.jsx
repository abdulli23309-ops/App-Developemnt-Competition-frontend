import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import api from '../../lib/api/client';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const fetchDashboardData = async () => {
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
        setRecentComplaints(complaintsRes.data.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Unable to load campus dashboard data. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 1. Student Greeting Card */}
      <div className="cc-card" style={{ padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  backgroundColor: '#EEF2FF',
                  color: '#4338CA',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                }}
              >
                {user?.regNo || 'BIIT-STUDENT'}
              </span>
              <span
                style={{
                  backgroundColor: '#D1FAE5',
                  color: '#059669',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                Active Student
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 0.35rem 0' }}>
              {getGreeting()}, {user?.name || 'Student'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
              Stay updated on your campus grievances and resolutions.
            </p>
          </div>

          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#EEF2FF',
              color: '#4338CA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <GraduationCap size={24} />
          </div>
        </div>
      </div>

      {/* 2. Ticket Overview Header & 4 KPI Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
            Ticket Overview
          </h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>
            Term Spring 2026
          </span>
        </div>

        {loading ? (
          <div className="cc-kpi-grid">
            <Skeleton height="95px" radius="16px" />
            <Skeleton height="95px" radius="16px" />
            <Skeleton height="95px" radius="16px" />
            <Skeleton height="95px" radius="16px" />
          </div>
        ) : (
          <div className="cc-kpi-grid">
            {/* Card 1: Total Raised */}
            <div className="cc-kpi-card">
              <div className="cc-kpi-top">
                <span className="cc-kpi-title">Total Raised</span>
                <div className="cc-kpi-icon-pill" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  <FolderOpen size={16} />
                </div>
              </div>
              <div className="cc-kpi-value">{summary?.totalRaised ?? 0}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#64748B' }}>
                <RefreshCw size={11} />
                <span>Lifetime</span>
              </div>
            </div>

            {/* Card 2: Pending */}
            <div className="cc-kpi-card">
              <div className="cc-kpi-top">
                <span className="cc-kpi-title">Pending</span>
                <div className="cc-kpi-icon-pill" style={{ background: '#FEF3C7', color: '#D97706' }}>
                  <Hourglass size={16} />
                </div>
              </div>
              <div className="cc-kpi-value">{summary?.pending ?? 0}</div>
              <div>
                <Badge variant="pending" showDot>
                  Awaiting
                </Badge>
              </div>
            </div>

            {/* Card 3: In Progress */}
            <div className="cc-kpi-card">
              <div className="cc-kpi-top">
                <span className="cc-kpi-title">In Progress</span>
                <div className="cc-kpi-icon-pill" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                  <RefreshCw size={16} />
                </div>
              </div>
              <div className="cc-kpi-value">{summary?.inProgress ?? 0}</div>
              <div>
                <Badge variant="inprogress" showDot>
                  Active
                </Badge>
              </div>
            </div>

            {/* Card 4: Resolved */}
            <div className="cc-kpi-card">
              <div className="cc-kpi-top">
                <span className="cc-kpi-title">Resolved</span>
                <div className="cc-kpi-icon-pill" style={{ background: '#D1FAE5', color: '#059669' }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="cc-kpi-value">{summary?.resolved ?? 0}</div>
              <div>
                <Badge variant="resolved" showDot>
                  Closed
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Indigo Gradient CTA Banner */}
      <div className="cc-cta-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Flag size={18} color="#FFFFFF" />
          <h3 style={{ margin: 0 }}>Facing a Campus Issue?</h3>
        </div>
        <p>
          Directly log issues with facilities, academic labs, transport, or administration. Fast turnaround guaranteed by college charter.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/complaints/new" className="cc-cta-btn-white">
            <PlusCircle size={16} />
            <span>Submit New Complaint</span>
          </Link>
          <button
            type="button"
            className="cc-cta-btn-ghost"
            onClick={() => setShowGuidelines(!showGuidelines)}
          >
            <BookOpen size={16} />
            <span>Browse Guidelines</span>
          </button>
        </div>

        {/* Expandable Guidelines Box */}
        {showGuidelines && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              fontSize: '0.825rem',
              lineHeight: 1.5,
            }}
          >
            <h4 style={{ color: '#FFFFFF', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
              CampusConnect Grievance Guidelines:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#F1F5F9' }}>
              <li><strong>Urgent SLA (4h):</strong> Power hazards, active lab GPU crashes, security concerns.</li>
              <li><strong>Standard SLA (24-48h):</strong> Cafeteria cleanliness, digital library credentials, classroom projectors.</li>
              <li><strong>Anonymous Option:</strong> Tick "Submit Anonymously" to hide student identity while receiving updates.</li>
            </ul>
          </div>
        )}
      </div>

      {/* 4. SLA Notice Bar */}
      <div
        style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#DBEAFE',
            color: '#1D4ED8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Clock size={16} />
        </div>
        <div style={{ fontSize: '0.8rem', color: '#1E3A8A' }}>
          <strong>BIIT Competition Notice:</strong> System response SLA is active. Standard turnaround guaranteed under college charter.
        </div>
      </div>

      {/* 5. Recent Submissions Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
              Recent Submissions
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#F1F5F9',
                color: '#475569',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {recentComplaints.length}
            </span>
          </div>
          <Link
            to="/complaints"
            style={{
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#4338CA',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              textDecoration: 'none',
            }}
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <Skeleton height="130px" radius="16px" />
            <Skeleton height="130px" radius="16px" />
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="cc-card">
            <EmptyState
              icon={FolderOpen}
              title="No complaints filed yet"
              description="You have not submitted any complaints this semester. Click below to file a new grievance."
              action={
                <Link to="/complaints/new" className="cc-cta-btn-white" style={{ background: '#4338CA', color: '#FFF' }}>
                  + Submit Complaint
                </Link>
              }
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem' }}>
            {recentComplaints.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="cc-card cc-card-hover"
                style={{ cursor: 'pointer', padding: '1.125rem' }}
                onClick={() => navigate(`/complaints/${item.id}`)}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      #{item.trackingCode}
                    </span>
                    <Badge variant="category">
                      {item.categoryName}
                    </Badge>
                  </div>
                  <Badge variant={item.priority} showDot>
                    {item.priority}
                  </Badge>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: '0 0 0.35rem 0',
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </h3>

                {/* Excerpt */}
                <p
                  style={{
                    fontSize: '0.825rem',
                    color: '#64748B',
                    margin: '0 0 0.75rem 0',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description}
                </p>

                {/* Thumbnail if attachments */}
                {item.firstAttachmentUrl && (
                  <div
                    style={{
                      marginBottom: '0.75rem',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      position: 'relative',
                      maxHeight: '130px',
                    }}
                  >
                    <img
                      src={item.firstAttachmentUrl}
                      alt="Attachment"
                      style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: '#FFFFFF',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {item.attachmentsCount > 1 ? `${item.attachmentsCount} Attachments` : 'Attachment Verified'}
                    </span>
                  </div>
                )}

                {/* Footer Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                    <Clock size={13} />
                    <span>{formatRelativeTime(item.createdAt)}</span>
                  </div>
                  <Badge variant={item.status} showDot>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Escalation Card */}
      <div
        className="cc-card"
        style={{
          background: '#F8FAFC',
          border: '1px dashed #CBD5E1',
          textAlign: 'center',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <div
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
          }}
        >
          <LifeBuoy size={20} />
        </div>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
          Need Immediate Escalation?
        </h4>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', maxWidth: '420px', lineHeight: 1.45 }}>
          Contact the Student Welfare Dean Office directly or consult the Student Handbook for emergency grievance pathways.
        </p>
        <a
          href="mailto:welfare@campus.edu"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.825rem',
            fontWeight: 700,
            color: '#4338CA',
            marginTop: '0.35rem',
          }}
        >
          <span>Contact Student Welfare</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
