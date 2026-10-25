import React from 'react';
import { Check, Clock, Sparkles, ArrowRight, ShieldCheck, Wrench, Droplets } from 'lucide-react';
import { SERVICE_PACKAGES } from '../data/carsData';

export const ServicePackages = ({ onBookPackage, onNavigate }) => {
  return (
    <section className="packages-section" id="packages">
      <div className="section-head-center">
        <div className="section-mini-tag">
          <Wrench size={13} /> Transparent Pricing
        </div>
        <h2 className="section-heading-lg">Precision Car Wash & Maintenance Programs</h2>
        <p className="section-subtext">
          Formulated exclusively for exotic, performance, and luxury automobiles using ultra-pure deionized water and PH-neutral chemistry.
        </p>
      </div>

      <div className="packages-cards-grid">
        {SERVICE_PACKAGES.map((pkg) => (
          <div key={pkg.id} className={`package-box ${pkg.popular ? 'featured' : ''}`}>
            {pkg.popular && (
              <div className="featured-ribbon">
                <Sparkles size={12} /> MOST POPULAR
              </div>
            )}
            <div className="package-box-top">
              <h3 className="package-title">{pkg.name}</h3>
              <p className="package-subtitle">{pkg.subtitle}</p>
              <div className="package-price-wrap">
                <span className="currency">₹</span>
                <span className="price-amount">{pkg.price.toLocaleString('en-IN')}</span>
                <span className="price-sub">/ vehicle</span>
              </div>
              <div className="package-time-badge">
                <Clock size={13} /> {pkg.duration} service duration
              </div>
            </div>

            <div className="package-features-list">
              {pkg.features.map((feat, idx) => (
                <div key={idx} className="feature-item">
                  <div className="check-bullet">
                    <Check size={14} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button
              className={`package-action-btn ${pkg.popular ? 'btn-primary-dark' : 'btn-outline-dark'}`}
              onClick={() => onBookPackage(pkg.id)}
            >
              Book Service <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>

     

      {/* Trust Badges */}
      <div className="service-guarantees-bar">
        <div className="guarantee-item">
          <Droplets size={22} />
          <div>
            <strong>100% Deionized 0-PPM Water</strong>
            <p>Guaranteed zero mineral deposits or water-spot etching</p>
          </div>
        </div>
        <div className="guarantee-item">
          <ShieldCheck size={22} />
          <div>
            <strong>Swirl-Free Hand Protocol</strong>
            <p>Dual-bucket grit filtered wash with ultra-dense microfiber</p>
          </div>
        </div>
        <div className="guarantee-item">
          <Wrench size={22} />
          <div>
            <strong>Certified ASE Master Techs</strong>
            <p>Factory diagnostics for Porsche, BMW, Mercedes, & Ferrari</p>
          </div>
        </div>
      </div>
    </section>
  );
};
