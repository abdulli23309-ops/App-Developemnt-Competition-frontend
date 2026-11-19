import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Menu } from 'lucide-react';

export default function Header({ onToggleMobileNav }) {
  return (
    <header className="cc-top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '100%' }}>
        {onToggleMobileNav && (
          <button
            type="button"
            className="cc-mobile-menu-btn"
            onClick={onToggleMobileNav}
            aria-label="Toggle navigation menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              color: '#1E1B4B',
            }}
          >
            <Menu size={20} />
          </button>
        )}

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
          }}
        >
          <div className="cc-logo-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
            <ShieldCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div>
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#1E1B4B',
                letterSpacing: '-0.02em',
              }}
            >
              CampusConnect
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
