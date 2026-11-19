import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutGrid, ClipboardCheck, Plus, Bell, User } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export default function BottomNav() {
  const { user, isStudent } = useAuth();

  return (
    <nav className="cc-mobile-bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `cc-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutGrid size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/complaints"
        className={({ isActive }) => `cc-nav-item ${isActive ? 'active' : ''}`}
      >
        <ClipboardCheck size={20} />
        <span>Complaints</span>
      </NavLink>

      {/* Floating Center '+' Button */}
      <Link
        to={isStudent ? '/complaints/new' : '/complaints'}
        className="cc-nav-floating-btn"
        aria-label="New Complaint"
      >
        <Plus size={26} strokeWidth={2.8} />
      </Link>

      <NavLink
        to="/notifications"
        className={({ isActive }) => `cc-nav-item ${isActive ? 'active' : ''}`}
      >
        <Bell size={20} />
        <span>Alerts</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `cc-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
