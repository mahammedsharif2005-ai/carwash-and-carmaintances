import React from 'react';
import { Star, MapPin, Phone, Clock } from 'lucide-react';

export const FooterReviews = ({ onOpenBooking, onNavigate }) => {
  const openMaintenancePage = (event) => {
    event.preventDefault();
    onNavigate('/maintenance');
  };

  const reviews = [
    {
      author: 'Aryan Malhotra',
      car: 'Mahindra Thar Roxx 4x4',
      text: 'Took my Thar for extreme off-road mud decontamination and underbody wash. Zero scratches, and the chassis looks cleaner than day one at the showroom!',
      rating: 5,
      date: '2 days ago',
    },
    {
      author: 'Priyanka Sen',
      car: 'Tata Safari Dark Edition',
      text: 'The 9H ceramic coating on my Safari Dark Edition is unreal. The gloss depth turns heads at every signal in Mumbai, and rainwater simply slides off.',
      rating: 5,
      date: '1 week ago',
    },
    {
      author: 'Rohan Varma',
      car: 'Toyota Fortuner Legender',
      text: 'Scheduled the 45-point comprehensive service & synthetic fluid change before our highway road trip. Fast turn-around, transparent billing in Rupees, no hidden charges.',
      rating: 5,
      date: '2 weeks ago',
    },
  ];

  return (
    <footer className="site-footer-wrapper" id="about">
      {/* Testimonials */}
      <div className="reviews-section" id="help">
        <div className="section-head-center">
          <div className="section-mini-tag">
            <Star size={13} fill="#000" /> Client Trust
          </div>
          <h2 className="section-heading-lg">Endorsed by Enthusiasts Across India</h2>
        </div>

        <div className="reviews-grid">
          {reviews.map((rev, i) => (
            <div key={i} className="review-card">
              <div className="review-stars">
                {[...Array(rev.rating)].map((_, s) => (
                  <Star key={s} size={15} fill="#111" color="#111" />
                ))}
              </div>
              <p className="review-text">"{rev.text}"</p>
              <div className="review-author-row">
                <div className="author-avatar">{rev.author[0]}</div>
                <div>
                  <h4 className="author-name">{rev.author}</h4>
                  <span className="author-vehicle">{rev.car} • {rev.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="footer-content-bar">
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor">
              <path d="M16 3C8.82 3 3 8.82 3 16C3 23.18 8.82 29 16 29C22.25 29 27.46 24.6 28.72 18.72H19.5C18.6 19.5 17.38 20 16 20C13.79 20 12 18.21 12 16C12 13.79 13.79 12 16 12C17.38 12 18.6 12.5 19.5 13.28H28.72C27.46 7.4 22.25 3 16 3Z" />
            </svg>
            <span className="footer-brand-title">Unique</span>
          </div>
          <p className="footer-motto">
            India's premier studio for artisanal 0-PPM foam washing, 9H ceramic matrix shields, monsoon rustproofing, and certified mechanical servicing.
          </p>
          <div className="footer-contact-item">
            <MapPin size={15} /> G-Block, Bandra Kurla Complex (BKC), Mumbai, MH 400051
          </div>
          <div className="footer-contact-item">
            <Phone size={15} /> +91 (022) 8900-WASH (9274) / +91 98200 45678
          </div>
          <div className="footer-contact-item">
            <Clock size={15} /> Mon - Sat: 8:00 AM – 8:00 PM | Sun: 9:00 AM – 6:00 PM
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Washes & Detailing</h4>
          <ul className="footer-links">
            <li><a href="#packages">Signature Snow Foam Wash</a></li>
            <li><a href="#packages">Ceramic Auto Spa & Polish</a></li>
            <li><a href="#packages">Interior Steam Sanitization</a></li>
            <li><a href="#packages">Monsoon Anti-Rust Underbody</a></li>
            <li><a href="#packages">3M Rat Repellent Protection</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Maintenance</h4>
          <ul className="footer-links">
            <li><a href="/maintenance" onClick={openMaintenancePage}>Synthetic Engine Oil & Filter</a></li>
            <li><a href="/maintenance" onClick={openMaintenancePage}>OBD-II Computer Diagnostics</a></li>
            <li><a href="/maintenance" onClick={openMaintenancePage}>Brembo / OEM Brake Service</a></li>
            <li><a href="/maintenance" onClick={openMaintenancePage}>3D Laser 4-Wheel Alignment</a></li>
            <li><a href="/maintenance" onClick={openMaintenancePage}>Transmission & Differential</a></li>
          </ul>
        </div>

        <div className="footer-col concierge-col">
          <h4 className="footer-title">VIP Concierge</h4>
          <p className="footer-subtext">Book directly or download our mobile app for live bay cameras.</p>
          <button className="primary-pill-btn full-btn" onClick={onOpenBooking}>
            Book Service Bay
          </button>
          <div className="app-store-badge">
            <span>Available on Android & iOS</span>
          </div>
        </div>
      </div>

      <div className="footer-copyright-bar">
        <span>© {new Date().getFullYear()} Unique Car Care & Maintenance India Pvt. Ltd. All rights reserved.</span>
        <div className="legal-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#insurance">Insurance & Safety Protocol</a>
        </div>
      </div>
    </footer>
  );
};
