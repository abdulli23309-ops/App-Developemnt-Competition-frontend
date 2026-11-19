import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  Sparkles,
  FileText,
  Copy,
  Check,
  Building2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export default function AccessDeniedPage({ message }) {
  const { user, logout, demoLogin, isStudent, isDeptAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [context, setContext] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('cc_403_context');
      if (stored) {
        setContext(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleCopyRef = () => {
    navigator.clipboard.writeText('SEC-AUDIT-9921-RBAC4');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getDashboardPath = () => {
    if (isStudent) return '/';
    if (isDeptAdmin) return '/admin/dashboard';
    if (isSuperAdmin) return '/admin/dashboard';
    return '/';
  };

  const getDashboardLabel = () => {
    if (isStudent) return 'Return to Student Dashboard';
    if (isDeptAdmin) {
      const dept = user?.departmentName || 'Department';
      return `Return to ${dept} Dashboard`;
    }
    return 'Return to Campus Dashboard';
  };

  const handleSwitchToSuperAdmin = async () => {
    await demoLogin('superadmin@biit.edu.pk');
    sessionStorage.removeItem('cc_403_context');
    navigate('/admin/dashboard');
  };

  const attemptedTicket = context?.attemptedComplaintId
    ? `#CC-2026-00${context.attemptedComplaintId}`
    : '#CC-2026-0038';

  return (
    <div style={{ maxWidth: '1000px', margin: '1rem auto 3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* 1. Protocol Active Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.625rem 1rem',
          background: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          fontSize: '0.75rem',
          color: '#64748B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
          <span style={{ fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            RBAC PROTOCOL ACTIVE
          </span>
          <span>/</span>
          <span>TICKET ROUTING SYSTEM</span>
          <span>/</span>
          <span style={{ fontWeight: 700, color: '#DC2626' }}>SECURITY ENFORCEMENT</span>
        </div>
        <div style={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Lock size={12} />
          <span>SESSION ID: #AUTH-7734-L4</span>
        </div>
      </div>

      {/* 2. Main Hero Card (2-Column Card) */}
      <div
        className="cc-card"
        style={{
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          border: '1.5px solid #FECDD3',
        }}
      >
        {/* Left Subcard: Glowing Lock Badge */}
        <div
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
            border: '1px solid #C7D2FE',
            borderRadius: '20px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '24px',
              background: '#4338CA',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 28px rgba(67, 56, 202, 0.35)',
              marginBottom: '1rem',
              position: 'relative',
            }}
          >
            <Lock size={44} strokeWidth={2.2} />
            <span
              style={{
                position: 'absolute',
                bottom: '-6px',
                background: '#DC2626',
                color: '#FFFFFF',
                fontSize: '0.625rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '2px solid #FFFFFF',
              }}
            >
              RESTRICTED
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
            <span>ISOLATION POLICY: ACTIVE ENFORCEMENT</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Zero-Trust Multitenant Faculty Boundary
          </div>
        </div>

        {/* Right Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                background: '#FEE2E2',
                color: '#DC2626',
                fontSize: '0.72rem',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              STATUS 403
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
              SEC_DEPT_CROSS_FORBIDDEN
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#1E1B4B', margin: 0, lineHeight: 1.2 }}>
            403 — Restricted Departmental Access
          </h1>

          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#E11D48' }}>
            You don't have permission to view this complaint.
          </div>

          <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
            {message || (
              <>
                Ticket <strong>{attemptedTicket}</strong> is assigned to another department. Under university governance and strict departmental isolation protocols (RBAC Level 4), staff members cannot access grievances outside their assigned faculty domain.
              </>
            )}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('cc_403_context');
                navigate(getDashboardPath());
              }}
              style={{
                padding: '9px 16px',
                background: 'var(--color-primary-gradient)',
                color: '#FFFFFF',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(67, 56, 202, 0.25)',
              }}
            >
              <LayoutDashboard size={16} />
              <span>{getDashboardLabel()}</span>
            </button>

            <button
              type="button"
              onClick={handleSwitchToSuperAdmin}
              style={{
                padding: '9px 16px',
                background: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} color="#D97706" />
              <span>Switch Role &bull; Demo Super Admin</span>
            </button>
          </div>

          <div>
            <a
              href="mailto:dean.academics@biit.edu.pk?subject=Escalation%20Request%20403"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#4338CA',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <FileText size={13} />
              <span>Request Cross-Department Escalation with Dean's Office</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Institutional Security Telemetry Card */}
      <div className="cc-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="#4338CA" />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E1B4B' }}>
              Institutional Security Telemetry
            </span>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#059669',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}
          >
            &bull; VERIFIED RBAC 4.2 COMPLIANT
          </span>
        </div>

        {/* 4 Telemetry Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Box 1: Logged-in Identity */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.875rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
              LOGGED-IN IDENTITY
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>
              {user?.name || 'Authorized Staff'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Role: {user?.role} &bull; {user?.departmentName || 'Department'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
              UID: #ADM-{user?.id || '4409'}
            </div>
          </div>

          {/* Box 2: Target Resource */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.875rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
              TARGET RESOURCE
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#DC2626' }}>
              {attemptedTicket}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Domain: Foreign Department
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
              CLASSIFICATION: CONFIDENTIAL
            </div>
          </div>

          {/* Box 3: Security Clearance */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.875rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
              SECURITY CLEARANCE
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', marginBottom: '2px' }}>
              &bull; Dept Isolation Active
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Strict Cross-Faculty Isolation
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
              SCOPE: LOCAL_DOMAIN_ONLY
            </div>
          </div>

          {/* Box 4: Incident Reference */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.875rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
              INCIDENT REFERENCE
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>
              SEC-AUDIT-9921
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Logged in Central Audit Ledger
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
              TIMESTAMP: {new Date().toISOString()}
            </div>
          </div>
        </div>

        {/* Compliance Notice Banner */}
        <div
          style={{
            background: '#FFF1F2',
            border: '1px solid #FECDD3',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#9F1239' }}>
            <ShieldAlert size={16} />
            <span>
              <strong>Compliance Notice:</strong> Unsanctioned attempts to bypass isolation controls are automatically reported to the University Ethics &amp; Compliance Committee pursuant to Academic Code Sec 14-B.
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyRef}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#FFFFFF',
              border: '1px solid #FECDD3',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#9F1239',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {copied ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Ref'}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94A3B8' }}>
        &copy; 2026 CampusConnect Dispute Resolution System. Institutional Oversight &amp; Compliance Portal.
      </div>
    </div>
  );
}
