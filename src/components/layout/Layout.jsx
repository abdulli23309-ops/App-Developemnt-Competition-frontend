import { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { Home, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="app-layout">
      <nav className="navbar" aria-label="Main navigation">
        <Link
          to="/"
          className="navbar-brand"
          aria-label="Go to homepage"
          onClick={closeMenu}
        >
          <Home size={20} />
          <span>Competition Starter</span>
        </Link>

        <button
          className="nav-mobile-button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={toggleMenu}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div
          className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}
          role="navigation"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive: active }) =>
                  `nav-link${active ? ' active' : ''}`}
                onClick={closeMenu}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
