import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, AlertCircle, ShieldAlert, ArrowLeft, Home as HomeIcon } from 'lucide-react';
import IconRenderer from '../components/ui/IconRenderer';
import Button from '../components/ui/Button';

export default function NotFound() {
  useEffect(() => {
    document.title = '404 - Page Not Found • CampusConnect';
  }, []);

  return (
    <div className="cc-page-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="cc-card cc-404-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div className="cc-404-icon-wrap" style={{ margin: '0 auto 1.25rem', width: '64px', height: '64px', borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338CA' }}>
          <IconRenderer icon={AlertCircle} size={36} />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#1E1B4B', margin: '0 0 0.5rem 0', letterSpacing: '-0.03em' }}>
          404
        </h1>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', margin: '0 0 0.75rem 0' }}>
          Page not found.
        </h2>

        <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.75rem 0', lineHeight: 1.6 }}>
          The requested route does not exist or may have been migrated under institutional re-indexing.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <IconRenderer icon={Compass} size={18} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
