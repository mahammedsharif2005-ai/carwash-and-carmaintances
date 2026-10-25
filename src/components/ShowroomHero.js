import React, { useState } from 'react';
import { ChevronRight, Calendar, ArrowRight, LogIn, LogOut } from 'lucide-react';
import { CAR_BRANDS } from '../data/carsData';
import { BrandLogo } from './BrandLogos';

export const ShowroomHero = ({ onOpenBooking, onNavigate, customer, onCustomerSignOut }) => {
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(0); // Mahindra as default (Index 0)
  const [serviceMode, setServiceMode] = useState('Car Washing'); // toggleable headline focus
  const [selectedCity, setSelectedCity] = useState('Mumbai');

  const currentCar = CAR_BRANDS[selectedBrandIndex];

  const handleNextBrand = () => {
    setSelectedBrandIndex((prev) => (prev + 1) % CAR_BRANDS.length);
  };

  return (
    <div className="hero-card-container">
      {/* Top Navbar matching the reference design */}
      <header className="hero-nav">
        {/* Left: Brand Logo & Title */}
        <div className="brand-header-left">
          <div className="unique-logo-mark">
            <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
              {/* Crescent 'C' / Minimalist Luxury Mark */}
              <path d="M16 3C8.82 3 3 8.82 3 16C3 23.18 8.82 29 16 29C22.25 29 27.46 24.6 28.72 18.72H19.5C18.6 19.5 17.38 20 16 20C13.79 20 12 18.21 12 16C12 13.79 13.79 12 16 12C17.38 12 18.6 12.5 19.5 13.28H28.72C27.46 7.4 22.25 3 16 3Z" />
            </svg>
          </div>
          <span className="brand-title">Unique</span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hero-nav-links" aria-label="Main Navigation">
          <a href="/about" className="nav-item" onClick={(event) => {
            event.preventDefault();
            onNavigate('/about');
          }}>About Us</a>
          <a href="/cars" className="nav-item" onClick={(event) => {
            event.preventDefault();
            onNavigate('/cars');
          }}>Cars</a>
          <a href="/packages" className="nav-item" onClick={(event) => {
            event.preventDefault();
            onNavigate('/packages');
          }}>Packages</a>
          <a href="/maintenance" className="nav-item" onClick={(event) => {
            event.preventDefault();
            onNavigate('/maintenance');
          }}>Maintenance</a>
          <a href="/maintenance" className="nav-item" onClick={(event) => {
            event.preventDefault();
            onNavigate('/maintenance');
          }}>Store</a>
          <a href="/help" className="nav-item" onClick={(event) => {
            event.preventDefault();
            onNavigate('/help');
          }}>Help</a>
        </nav>

        {/* Right: Black Pill Button with Apple Icon or Book Service */}
        <div className="hero-nav-right">
          {customer ? (
            <div className="hero-customer-session">
              <span>Hi, {customer.name.split(' ')[0]}</span>
              <button onClick={onCustomerSignOut} aria-label="Sign out"><LogOut size={14} /> Sign out</button>
            </div>
          ) : (
            <button className="hero-signin-btn" onClick={() => onNavigate('/login')}>
              <LogIn size={14} /> Sign in
            </button>
          )}
          <button
            className="app-download-pill"
            onClick={() => onOpenBooking(currentCar)}
            aria-label="Book Now"
          >
            <Calendar size={14} />
            <span>Book Now</span>
          </button>
        </div>
      </header>

      {/* Main Hero Split Content */}
      <div className="hero-main-layout">
        {/* Left Column: Bold Headline & Subtitle */}
        <div className="hero-content-left">
          <div className="headline-wrapper">
            <h1 className="hero-main-title">
              <span className="title-line">Premium</span>
              <span className="title-line highlight-phrase">
                {serviceMode === 'Car Washing' ? 'Car Washing' : serviceMode === 'Maintenance' ? 'Auto Service' : 'Car Detailing'}
              </span>
              <span className="title-line">in {selectedCity}</span>
            </h1>
          </div>

          <p className="hero-description">
            Don't deny yourself the pleasure of driving the best cars across India with bespoke 0-PPM foam wash, monsoon protection and master servicing.
          </p>

          {/* City selector tags */}
          <div className="city-selector-bar">
            {['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Pune'].map((city) => (
              <button
                key={city}
                className={`city-chip ${selectedCity === city ? 'active-city' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Quick interactive tags & CTA */}
          <div className="hero-service-toggles">
            <button
              className={`service-mode-chip ${serviceMode === 'Car Washing' ? 'active' : ''}`}
              onClick={() => setServiceMode('Car Washing')}
            >
              Foam Washing
            </button>
            <button
              className={`service-mode-chip ${serviceMode === 'Car Detailing' ? 'active' : ''}`}
              onClick={() => setServiceMode('Car Detailing')}
            >
              9H Detailing
            </button>
            <button
              className={`service-mode-chip ${serviceMode === 'Maintenance' ? 'active' : ''}`}
              onClick={() => setServiceMode('Maintenance')}
            >
              Maintenance
            </button>
          </div>

          <div className="hero-action-row">
            <button
              className="schedule-btn-dark"
              onClick={() => onOpenBooking(currentCar)}
            >
              <Calendar size={16} /> Book Bay Appointment
            </button>
            <a href="#packages" className="explore-rates-link">
              View Packages <ChevronRight size={15} />
            </a>
          </div>

          {/* Micro trust badge */}
          <div className="hero-trust-bar">
            <div className="rating-stars">★★★★★</div>
            <span className="rating-text">4.98 Rating • 30,000+ Indian Vehicles Treated</span>
          </div>
        </div>

        {/* Right Column: Hero Vehicle & Minimalist Network Map */}
        <div className="hero-visual-right">
          {/* Minimalist Map Background Graphic matching the reference */}
          <div className="map-network-graphic" aria-hidden="true">
            <svg viewBox="0 0 600 340" className="map-svg-canvas">
              {/* Subtle network lines */}
              <line x1="120" y1="80" x2="260" y2="60" stroke="#d5dbe6" strokeWidth="1.4" />
              <line x1="260" y1="60" x2="410" y2="90" stroke="#d5dbe6" strokeWidth="1.4" />
              <line x1="260" y1="60" x2="330" y2="160" stroke="#d5dbe6" strokeWidth="1.4" />
              <line x1="410" y1="90" x2="540" y2="80" stroke="#d5dbe6" strokeWidth="1.4" />
              <line x1="330" y1="160" x2="470" y2="190" stroke="#d5dbe6" strokeWidth="1.4" />
              <line x1="170" y1="180" x2="330" y2="160" stroke="#d5dbe6" strokeWidth="1.4" />
              
              {/* Hollow ring nodes (matching the circles in screenshot) */}
              <circle cx="120" cy="80" r="5" stroke="#9099a8" strokeWidth="1.6" fill="#ffffff" />
              <circle cx="260" cy="60" r="5" stroke="#9099a8" strokeWidth="1.6" fill="#ffffff" />
              <circle cx="410" cy="90" r="5" stroke="#9099a8" strokeWidth="1.6" fill="#ffffff" />
              <circle cx="540" cy="80" r="5" stroke="#9099a8" strokeWidth="1.6" fill="#ffffff" />
              <circle cx="170" cy="180" r="5" stroke="#9099a8" strokeWidth="1.6" fill="#ffffff" />
              <circle cx="330" cy="160" r="5" stroke="#9099a8" strokeWidth="1.6" fill="#ffffff" />
              <circle cx="470" cy="190" r="5" stroke="#9099a8" strokeWidth="1.6" fill="#ffffff" />

              {/* Navigation Arrow Marker (matching the small black directional triangle in screenshot) */}
              <polygon
                points="335,74 345,94 335,88 325,94"
                fill="#111111"
                transform="rotate(-26 335 84)"
              />
            </svg>
          </div>

          {/* Car Image Container */}
          <div className="car-showcase-box">
            <img
              src={currentCar.image}
              alt={`${currentCar.name} ${currentCar.model}`}
              className="hero-car-image"
              key={currentCar.id}
            />

            {/* Soft contact ground shadow */}
            <div className="car-ground-shadow"></div>
          </div>

          {/* Floating Vehicle Specs Pill */}
          <div className="car-specs-pill">
            <span className="car-name-bold">{currentCar.name} {currentCar.model}</span>
            {currentCar.price && (
              <>
                <span className="spec-dot">•</span>
                <span className="car-hero-price-tag">{currentCar.price}</span>
              </>
            )}
            <span className="spec-dot">•</span>
            <span>{currentCar.specs.hp}</span>
            <span className="spec-dot">•</span>
            <span className="wash-time-tag">Fast Wash: {currentCar.specs.washTime}</span>
          </div>
        </div>
      </div>

      {/* Bottom Brand Dock matching reference screenshot */}
      <footer className="hero-brand-dock">
        <div className="brand-dock-scroll">
          {CAR_BRANDS.map((brand, index) => {
            const isActive = index === selectedBrandIndex;
            return (
              <button
                key={brand.id}
                className={`brand-badge-item ${isActive ? 'active-badge' : ''}`}
                onClick={() => setSelectedBrandIndex(index)}
                aria-label={`Select ${brand.name}`}
              >
                <BrandLogo brandId={brand.id} isActive={isActive} />
                {/* Active indicator dot or badge box */}
                {isActive && <div className="active-glow-indicator"></div>}
              </button>
            );
          })}

          {/* Right Arrow Navigation Button matching reference */}
          <button
            className="brand-dock-next-btn"
            onClick={handleNextBrand}
            aria-label="Next Vehicle Brand"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
};
