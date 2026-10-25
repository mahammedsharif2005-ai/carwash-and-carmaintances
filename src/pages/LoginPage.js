import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CarFront, KeyRound, Mail, ShieldCheck, UserRound, Sparkles, Droplets, Gauge, Phone } from 'lucide-react';
import { adminLogin } from '../services/api';
import { Toast } from '../components/Toast';
import { publicAsset } from '../utils/publicAsset';
import './LoginPage.css';

const LoginPage = ({ onNavigate, initialMode = 'customer' }) => {
  const [mode, setMode] = useState(initialMode);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', password: '' });
  const [admin, setAdmin] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const continueAsCustomer = (event) => {
    event.preventDefault();
    setError('');
    const profile = { name: customer.name.trim(), email: customer.email.trim().toLowerCase() };
    if (customer.phone && customer.phone.trim()) {
      profile.phone = customer.phone.trim();
    }
    sessionStorage.setItem('customerProfile', JSON.stringify(profile));
    onNavigate('/');
  };

  const signInAsAdmin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await adminLogin(admin);
      sessionStorage.setItem('adminToken', token);
      sessionStorage.removeItem('customerProfile');
      onNavigate('/admin');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {error && (
        <Toast
          message={error}
          title="Backend Connection Alert"
          type="error"
          onClose={() => setError('')}
          duration={8000}
        />
      )}
      {/* Left Column: Redesigned Luxury Atmospheric Showcase */}
      <section className="login-showcase">
        {/* Background Car with Vignette & Ambient Glow */}
        <div
          className="login-showcase-bg"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(8, 9, 13, 0.96) 0%, rgba(13, 15, 22, 0.86) 42%, rgba(8, 9, 13, 0.55) 100%), url('${publicAsset('/images/mahindra_thar.jpg')}')`
          }}
        />
        <div className="login-showcase-glow" aria-hidden="true" />
        <div className="login-showcase-mesh" aria-hidden="true" />

        {/* Top Bar: Back Link & Live Studio Badge */}
        <div className="login-showcase-topbar">
          <button
            type="button"
            className="login-back-btn"
            onClick={() => onNavigate('/')}
            aria-label="Back to showroom"
          >
            <ArrowLeft size={14} /> Back to showroom
          </button>
         
        </div>

        {/* Hero Narrative Hub */}
        <div className="login-showcase-content">
          <div className="login-brand-tag">
            <span className="login-emblem-badge"><CarFront size={16} /></span>
            <span className="login-brand-name">UNIQUE AUTO SPA INDIA</span>
          </div>

          <h1 className="login-hero-title">
            Made for the<br />
            <span className="login-title-highlight">love of the drive.</span>
          </h1>

          <p className="login-hero-desc">
            India's premier sanctuary for bespoke automotive care, 9H ceramic matrix coatings, and OEM powertrain diagnostics.
          </p>

          {/* 3 Telemetry Feature Pills */}
          <div className="login-telemetry-grid">
            <div className="login-telemetry-pill">
              <Sparkles size={15} className="telemetry-icon" />
              <div>
                <strong>30,000+</strong>
                <span>Vehicles Treated</span>
              </div>
            </div>
            <div className="login-telemetry-pill">
              <Droplets size={15} className="telemetry-icon" />
              <div>
                <strong>0-PPM</strong>
                <span>Deionized Water</span>
              </div>
            </div>
            <div className="login-telemetry-pill">
              <Gauge size={15} className="telemetry-icon" />
              <div>
                <strong>45-Point</strong>
                <span>OBD-II Scan</span>
              </div>
            </div>
          </div>

          {/* Quality Assurance Note */}
          <div className="login-showcase-note">
            <ShieldCheck size={16} className="note-shield" />
            <span>A considered, swirl-free experience engineered for every Indian highway.</span>
          </div>
        </div>

        {/* Bottom Ticker */}
        <div className="login-showcase-footer">
          <span>CERTIFIED ISO-9001 DETAILING FACILITY</span>
          <span className="footer-bullet">•</span>
          <span>MUMBAI • PUNE • BENGALURU</span>
        </div>
      </section>

      {/* Right Column: Sleek Authentication Terminal */}
      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="login-mobile-brand">
            <span className="mobile-logo-box"><CarFront size={15} /></span>
            <div>
              <b>UNIQUE</b>
              <small>AUTO SPA INDIA</small>
            </div>
          </div>

          <div className="login-panel-header">
            <span className="login-eyebrow">
              {mode === 'customer' ? 'CLIENT CONCIERGE ACCESS' : 'STUDIO ADMIN TERMINAL'}
            </span>
            <h2>{mode === 'customer' ? 'Come on in.' : 'Welcome back.'}</h2>
            <p className="login-intro">
              {mode === 'customer'
                ? 'Enter your details to explore the fleet showroom, schedule detailing bays, and manage your orders.'
                : 'Sign in to access bay dispatch, live orders telemetry, and inventory management.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="login-mode-switch" role="tablist" aria-label="Choose sign-in type">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'customer'}
              className={`mode-btn ${mode === 'customer' ? 'selected' : ''}`}
              onClick={() => { setMode('customer'); setError(''); }}
            >
              Customer Access
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'admin'}
              className={`mode-btn ${mode === 'admin' ? 'selected' : ''}`}
              onClick={() => { setMode('admin'); setError(''); }}
            >
              Admin
            </button>
          </div>

          {/* Form */}
          {mode === 'customer' ? (
            <form className="login-form" onSubmit={continueAsCustomer}>
              <label htmlFor="customer-name-input">
                Your name
                <span className="login-input-wrap">
                  <UserRound size={17} className="input-icon" />
                  <input
                    id="customer-name-input"
                    required
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    placeholder="e.g. Aanya Mehta"
                    value={customer.name}
                    onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                  />
                </span>
              </label>

              <label htmlFor="customer-email-input">
                Email address
                <span className="login-input-wrap">
                  <Mail size={17} className="input-icon" />
                  <input
                    id="customer-email-input"
                    required
                    type="email"
                    maxLength={190}
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={customer.email}
                    onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
                  />
                </span>
              </label>
              <label htmlFor="customer-phone-input">
                Mobile No
                <span className="login-input-wrap">
                  <Phone size={17} className="input-icon" />
                  <input
                    id="customer-phone-input"
                    type="tel"
                    maxLength={15}
                    autoComplete="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={customer.phone}
                    onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                  />
                </span>
              </label>

              <label htmlFor="customer-password-input">
                Password
                <span className="login-input-wrap">
                  <KeyRound size={17} className="input-icon" />
                  <input
                    id="customer-password-input"
                    type="password"
                    maxLength={120}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={customer.password}
                    onChange={(event) => setCustomer({ ...customer, password: event.target.value })}
                  />
                </span>
              </label>

              {error && <p className="login-error" role="alert">{error}</p>}

              <button className="login-submit" type="submit">
                Continue to showroom <ArrowRight size={16} />
              </button>
              <p className="login-footnote">
                Quick client access • Studio membership & booking concierge.
              </p>
            </form>
          ) : (
            <form className="login-form" onSubmit={signInAsAdmin}>
              <label htmlFor="admin-id-input">
                Admin ID
                <span className="login-input-wrap">
                  <UserRound size={17} className="input-icon" />
                  <input
                    id="admin-id-input"
                    required
                    autoComplete="username"
                    placeholder="Enter admin ID"
                    value={admin.username}
                    onChange={(event) => setAdmin({ ...admin, username: event.target.value })}
                  />
                </span>
              </label>

              <label htmlFor="admin-password-input">
                Password
                <span className="login-input-wrap">
                  <KeyRound size={17} className="input-icon" />
                  <input
                    id="admin-password-input"
                    required
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter admin password"
                    value={admin.password}
                    onChange={(event) => setAdmin({ ...admin, password: event.target.value })}
                  />
                </span>
              </label>

              {error && <p className="login-error" role="alert">{error}</p>}

              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? 'Authenticating…' : 'Sign in to admin'} <ArrowRight size={16} />
              </button>
              <p className="login-footnote">
                Secure 256-bit encrypted credential verification.
              </p>
            </form>
          )}

          <div className="login-panel-footer">
            <span>UNIQUE SHOWROOM & STUDIO</span>
            <span>PREMIUM MOTORING CARE • INDIA</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export { LoginPage };
