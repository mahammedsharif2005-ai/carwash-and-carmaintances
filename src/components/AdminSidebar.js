import React from 'react';
import { LogOut, ShieldCheck, X } from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({
  items = [],
  activeItem,
  onSelect,
  onSignOut,
  counts = {},
  mobileNavOpen = false,
  onCloseMobileMenu,
  brandText = 'UNIQUE',
  brandSubtext = 'SHOWROOM ADMIN',
  footerTitle = 'Store status',
  footerStatus = 'Open and accepting orders',
  className = '',
}) => {
  const asideClassName = ['admin-sidebar', mobileNavOpen ? 'admin-sidebar-open' : '', className].filter(Boolean).join(' ');

  return (
    <aside id="admin-sidebar" className={asideClassName}>
      <div className="admin-brand">
        <span className="admin-brand-mark"><span>U</span></span>
        <span><strong>{brandText}</strong><small>{brandSubtext}</small></span>
        {onCloseMobileMenu && (
          <button className="admin-mobile-close" onClick={onCloseMobileMenu} aria-label="Close menu">
            <X size={19} />
          </button>
        )}
      </div>
      <div className="admin-side-label">WORKSPACE</div>
      <nav className="admin-nav" aria-label="Admin navigation">
        {items.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            className={`admin-nav-item ${activeItem === id ? 'active' : ''}`}
            title={label}
            aria-current={activeItem === id ? 'page' : undefined}
            onClick={() => onSelect(id)}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {(count ?? counts[id] ?? 0) > 0 && <span className="admin-nav-count">{count ?? counts[id]}</span>}
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-bottom">
        <div className="admin-store-link">
          <span className="admin-store-icon"><ShieldCheck size={17} /></span>
          <span>
            <b>{footerTitle}</b>
            <small><i /> {footerStatus}</small>
          </span>
        </div>
        <button className="admin-nav-item admin-back-store" title="Sign out" onClick={onSignOut}>
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
