import React from 'react';
import { LogIn, LogOut, Calendar } from 'lucide-react';

export const SiteHeader = ({ onNavigate, currentPage, customer, onSignOut, onOpenBooking }) => (
  <header className="store-site-header">
    <div className="store-site-header-inner">
      <button className="store-site-brand" onClick={() => onNavigate('/')} aria-label="Unique home">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
          <path d="M16 3C8.82 3 3 8.82 3 16C3 23.18 8.82 29 16 29C22.25 29 27.46 24.6 28.72 18.72H19.5C18.6 19.5 17.38 20 16 20C13.79 20 12 18.21 12 16C12 13.79 13.79 12 16 12C17.38 12 18.6 12.5 19.5 13.28H28.72C27.46 7.4 22.25 3 16 3Z" />
        </svg>
        <span>Unique</span>
      </button>
      <nav className="store-site-nav" aria-label="Main navigation">
        <button className={currentPage === 'about' ? 'active' : ''} aria-current={currentPage === 'about' ? 'page' : undefined} onClick={() => onNavigate('/about')}>About Us</button>
        <button className={currentPage === 'cars' ? 'active' : ''} aria-current={currentPage === 'cars' ? 'page' : undefined} onClick={() => onNavigate('/cars')}>Cars</button>
        <button className={currentPage === 'packages' ? 'active' : ''} aria-current={currentPage === 'packages' ? 'page' : undefined} onClick={() => onNavigate('/packages')}>Packages</button>
        <button className={currentPage === 'store' ? 'active' : ''} aria-current={currentPage === 'store' ? 'page' : undefined} onClick={() => onNavigate('/maintenance')}>Store</button>
        <button className={currentPage === 'help' ? 'active' : ''} aria-current={currentPage === 'help' ? 'page' : undefined} onClick={() => onNavigate('/help')}>Help</button>
      </nav>
      <div className="store-site-actions">
        {customer ? (
          <div className="store-site-customer">
            <span>Hi, {customer.name?.split(' ')[0] || 'Member'}</span>
            <button className="store-site-signin" onClick={onSignOut} aria-label="Sign out">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        ) : (
          <button className="store-site-signin" onClick={() => onNavigate('/login')}>
            <LogIn size={14} /> Sign in
          </button>
        )}
        <button
          className="store-site-download"
          onClick={onOpenBooking || (() => onNavigate('/'))}
          aria-label="Book Now"
        >
          <Calendar size={14} />
          Book Now
        </button>
      </div>
    </div>
  </header>
);
