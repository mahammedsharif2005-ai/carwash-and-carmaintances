import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Clock,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Droplets,
  Flame,
  Plus,
  HelpCircle,
  CalendarDays,
  Car,
  X,
  CheckCircle
} from 'lucide-react';
import { SERVICE_PACKAGES, SERVICE_ADDONS } from '../data/carsData';
import { SiteHeader } from '../components/SiteHeader';
import { FooterReviews } from '../components/FooterReviews';

const VEHICLE_CATEGORIES = [
  { id: 'compact', label: 'Hatchback / Compact', surcharge: 0 },
  { id: 'sedan', label: 'Sedan / Saloon', surcharge: 0 },
  { id: 'mid-suv', label: 'Compact SUV (Creta/Seltos)', surcharge: 0 },
  { id: 'full-suv', label: 'Full-Size SUV (Thar/Fortuner)', surcharge: 300 }
];

const COMPARISON_SECTIONS = [
  {
    category: 'Decontamination & Pre-Wash Protocol',
    features: [
      { name: '0-PPM Deionized Snow Foam Pre-Wash', express: true, ceramic: true, exec: true, service: true },
      { name: 'Two-Bucket Scratch-Free Microfiber Protocol', express: true, ceramic: true, exec: true, service: true },
      { name: 'Alloy Wheel Barrels & Caliper Dust Removal', express: true, ceramic: true, exec: true, service: true },
      { name: 'Warm Filtered Air Blow-Dry (Zero Micro-Marring)', express: true, ceramic: true, exec: true, service: true },
    ]
  },
  {
    category: 'Surface Correction & 9H Ceramic Shield',
    features: [
      { name: 'Chemical Iron Fall-Out & Clay Bar Decontamination', express: false, ceramic: true, exec: true, service: false },
      { name: 'Single-Stage Machine Paint Jeweling Polish', express: false, ceramic: true, exec: true, service: false },
      { name: '12-Month SiO2 Hydrophobic Ceramic Sealant', express: false, ceramic: true, exec: true, service: false },
      { name: 'Monsoon High-Pressure Underbody Anti-Rust Rinse', express: false, ceramic: true, exec: true, service: false },
    ]
  },
  {
    category: 'Cockpit Sanitization & Interior Rejuvenation',
    features: [
      { name: '320°F Dry-Vapor Interior Steam Cockpit Sanitization', express: false, ceramic: false, exec: true, service: false },
      { name: 'Fine Leather Deep Conditioning & Fabric Extraction', express: false, ceramic: false, exec: true, service: false },
      { name: 'Hospital-Grade Ozone Air Purification & AC Fogging', express: false, ceramic: false, exec: true, service: false },
      { name: 'Engine Bay Dry Steam Cleaning & Plastic Dressing', express: false, ceramic: false, exec: true, service: false },
    ]
  },
  {
    category: 'Mechanical Diagnostics & OEM Synthetic Fluids',
    features: [
      { name: 'Castrol/Motul 100% Synthetic Engine Oil Change', express: false, ceramic: false, exec: false, service: true },
      { name: 'OEM Oil, Air & Cabin Pollen Filter Replacement', express: false, ceramic: false, exec: false, service: true },
      { name: '45-Point Electrical & Computerized OBD-II Scan', express: false, ceramic: false, exec: false, service: true },
      { name: 'Brake Pad Cleaning & Brake Fluid Moisture Test', express: false, ceramic: false, exec: false, service: true },
    ]
  }
];

const BAY_METHODOLOGY_STAGES = [
  {
    id: '01',
    title: '0-PPM Snow Foam Pre-Wash',
    desc: 'pH-neutral active foam encapsulates grit particles, lifting them away without sponge contact. Rinsed with zero-hardness pure water.',
    image: '/images/foam_wash.jpg',
    chemistry: ['pH-Neutral Snow Foam', '0-PPM RO Pure Water', 'Touchless Air Dry'],
    duration: '35 mins',
    guarantee: '100% Swirl-Free',
  },
  {
    id: '02',
    title: 'Single-Stage Jeweling Polish',
    desc: 'German dual-action random orbital machines remove fine swirl marks and oxidation, unlocking mirror-depth optical clarity.',
    image: '/images/top_down_detailing.png',
    chemistry: ['Rupes DA Polishers', 'Diminishing Micro-Abrasives', 'Paint Depth Gauge'],
    duration: '60 mins',
    guarantee: 'Optical Clarity',
  },
  {
    id: '03',
    title: '320°F Dry Vapor Extraction',
    desc: 'Thermal steam dissolves stubborn grease, destroys allergens, and leaves OEM matte leather completely sterilized and supple.',
    image: '/images/interior_detail.jpg',
    chemistry: ['320°F Thermal Steam', 'pH 7.0 Leather Balm', 'Ozone Sterilization'],
    duration: '45 mins',
    guarantee: '99.9% Pathogen Kill',
  },
];

const PACKAGES_FAQS = [
  {
    question: 'Why is 0-PPM deionized water essential for Indian cars?',
    answer: 'Standard Indian municipal and borewell water contains 250–600+ PPM dissolved mineral solids (calcium, magnesium). When droplets dry under the sun, these minerals chemically etch into clear-coat paint, creating permanent water spots. Our 4-stage reverse osmosis filtration delivers 0-PPM water that evaporates 100% spotless.'
  },
  {
    question: 'How long does the Precision Ceramic Auto Spa protection last?',
    answer: 'Our SiO2 ceramic formula bonds molecularly with the clear coat and provides 12 months of certified hydrophobic protection. Rainwater, road grime, and monsoon mud slide right off without sticking, dramatically reducing wash frequency.'
  },
  {
    question: 'Can I add specific services like Rat Repellent or Underbody Coating?',
    answer: 'Yes! You can toggle any of our studio add-ons directly on this page or during the booking step. Popular additions include 3M Engine Bay Rat Repellent (+₹899) and Monsoon Underbody Anti-Rust (+₹1,499).'
  },
  {
    question: 'Do you offer doorstep flatbed pick-and-drop?',
    answer: 'Yes, VIP Concierge flatbed pick-and-drop is available for all executive and ceramic treatments across Mumbai, Pune, Delhi NCR, Bengaluru, and Hyderabad with real-time GPS tracking and live video bay updates.'
  }
];

export const PackagesPage = ({ onNavigate, onBookPackage, customer, onSignOut }) => {
  const [selectedCategory, setSelectedCategory] = useState(VEHICLE_CATEGORIES[3]); // Default Full-Size SUV
  const [isAnnualPlan, setIsAnnualPlan] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const toggleAddon = (id) => {
    const addon = SERVICE_ADDONS.find((a) => a.id === id);
    setSelectedAddons((prev) => {
      const isAlreadySelected = prev.includes(id);
      const next = isAlreadySelected ? prev.filter((item) => item !== id) : [...prev, id];
      if (addon) {
        setToastMessage(isAlreadySelected ? `Removed: ${addon.name}` : `Added to Studio Visit: ${addon.name} (+₹${addon.price})`);
        setTimeout(() => setToastMessage(''), 3000);
      }
      return next;
    });
  };

  const clearAddons = () => {
    setSelectedAddons([]);
    setToastMessage('Cleared all add-ons');
    setTimeout(() => setToastMessage(''), 2500);
  };

  const getPackagePrice = (basePrice) => {
    const withCategory = basePrice + selectedCategory.surcharge;
    if (isAnnualPlan) {
      // 15% discount for annual membership
      return Math.round(withCategory * 0.85);
    }
    return withCategory;
  };

  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = SERVICE_ADDONS.find((a) => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const toggleFaq = (idx) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  const renderComparisonTable = () => (
    <div className="matrix-table-wrap">
      <table className="matrix-table">
        <thead>
          <tr>
            <th className="feature-col">
              <span className="matrix-col-eyebrow">Studio Treatment Protocol</span>
              <strong className="matrix-col-headline">Feature Comparison</strong>
            </th>
            <th className="pkg-col">
              <span className="pkg-duration-badge"><Clock size={11} /> 35 mins</span>
              <div className="pkg-title-wrap">Signature Foam Wash</div>
              <div className="pkg-price-tag">₹{getPackagePrice(699).toLocaleString('en-IN')}</div>
              <button
                type="button"
                className="matrix-btn-book matrix-btn-dark"
                onClick={() => onBookPackage('express')}
              >
                Book Express <ArrowRight size={13} />
              </button>
            </th>
            <th className="pkg-col highlight-col">
              <span className="matrix-favorite-pill"><Sparkles size={11} /> MOST POPULAR</span>
              <span className="pkg-duration-badge"><Clock size={11} /> 2.0 hrs</span>
              <div className="pkg-title-wrap highlight-title">Precision Ceramic Spa</div>
              <div className="pkg-price-tag highlight-price">₹{getPackagePrice(2499).toLocaleString('en-IN')}</div>
              <button
                type="button"
                className="matrix-btn-book matrix-btn-dark"
                onClick={() => onBookPackage('ceramic-spa')}
              >
                Book Ceramic <ArrowRight size={13} />
              </button>
            </th>
            <th className="pkg-col">
              <span className="pkg-duration-badge"><Clock size={11} /> 3.5 hrs</span>
              <div className="pkg-title-wrap">Executive Detailing</div>
              <div className="pkg-price-tag">₹{getPackagePrice(4999).toLocaleString('en-IN')}</div>
              <button
                type="button"
                className="matrix-btn-book matrix-btn-dark"
                onClick={() => onBookPackage('master-detail')}
              >
                Book Executive <ArrowRight size={13} />
              </button>
            </th>
            <th className="pkg-col">
              <span className="pkg-duration-badge"><Clock size={11} /> 2.5 hrs</span>
              <div className="pkg-title-wrap">Periodic Service</div>
              <div className="pkg-price-tag">₹{getPackagePrice(5499).toLocaleString('en-IN')}</div>
              <button
                type="button"
                className="matrix-btn-book matrix-btn-dark"
                onClick={() => onBookPackage('maintenance-pro')}
              >
                Book Service <ArrowRight size={13} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_SECTIONS.map((sec, sIdx) => (
            <React.Fragment key={sIdx}>
              <tr className="matrix-cat-divider-row">
                <td colSpan={5} className="matrix-cat-divider-td">
                  <span>{sec.category}</span>
                </td>
              </tr>
              {sec.features.map((feat, fIdx) => (
                <tr key={`${sIdx}-${fIdx}`}>
                  <td className="feat-name-td">{feat.name}</td>
                  <td className="check-td">{feat.express ? <Check size={16} className="m-check" /> : <span className="m-dash">—</span>}</td>
                  <td className="check-td highlight-td">{feat.ceramic ? <Check size={16} className="m-check" /> : <span className="m-dash">—</span>}</td>
                  <td className="check-td">{feat.exec ? <Check size={16} className="m-check" /> : <span className="m-dash">—</span>}</td>
                  <td className="check-td">{feat.service ? <Check size={16} className="m-check" /> : <span className="m-dash">—</span>}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className="matrix-tfoot-row">
            <td className="feat-name-td tfoot-summary-td">
              <strong>Select your preferred studio protocol</strong>
              <small>All treatments covered by Unique Bay Guarantee</small>
            </td>
            <td className="tfoot-action-td">
              <div className="tfoot-price">₹{getPackagePrice(699).toLocaleString('en-IN')}</div>
              <button type="button" className="matrix-tfoot-btn" onClick={() => onBookPackage('express')}>Book</button>
            </td>
            <td className="tfoot-action-td highlight-td">
              <div className="tfoot-price">₹{getPackagePrice(2499).toLocaleString('en-IN')}</div>
              <button type="button" className="matrix-tfoot-btn" onClick={() => onBookPackage('ceramic-spa')}>Book</button>
            </td>
            <td className="tfoot-action-td">
              <div className="tfoot-price">₹{getPackagePrice(4999).toLocaleString('en-IN')}</div>
              <button type="button" className="matrix-tfoot-btn" onClick={() => onBookPackage('master-detail')}>Book</button>
            </td>
            <td className="tfoot-action-td">
              <div className="tfoot-price">₹{getPackagePrice(5499).toLocaleString('en-IN')}</div>
              <button type="button" className="matrix-tfoot-btn" onClick={() => onBookPackage('maintenance-pro')}>Book</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div className="packages-page">
      <SiteHeader
        onNavigate={onNavigate}
        currentPage="packages"
        customer={customer}
        onSignOut={onSignOut}
        onOpenBooking={() => onBookPackage('ceramic-spa')}
      />

      <main>
        {/* Clean, Focused Header Section */}
        <section className="packages-header-section">
          <div className="packages-content-head">
            <span className="packages-eyebrow">
              <Sparkles size={13} /> Transparent Studio Tiers
            </span>
            <h2>Precision Car Wash & Detailing Packages</h2>
            <p>
              Compare our 4 certified automotive spa treatments. Transparent pricing in Indian Rupees with 100% swirl-free guarantee and zero hidden bay fees.
            </p>

            {/* Vehicle Category Selector Bar */}
            <div className="packages-hero-segment-bar">
              <span className="packages-segment-label">
                <Car size={14} /> Vehicle Category:
              </span>
              <div className="packages-segment-chips">
                {VEHICLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`segment-chip ${selectedCategory.id === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat.label}
                    {cat.surcharge > 0 && <span className="cat-surcharge-tag">+₹{cat.surcharge}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Billing Frequency & View Mode Switch Row */}
            <div className="packages-hero-options-row">
              <div className="packages-billing-toggle">
                <button
                  type="button"
                  className={`billing-toggle-btn ${!isAnnualPlan ? 'active' : ''}`}
                  onClick={() => setIsAnnualPlan(false)}
                >
                  Single Visit
                </button>
                <button
                  type="button"
                  className={`billing-toggle-btn ${isAnnualPlan ? 'active' : ''}`}
                  onClick={() => setIsAnnualPlan(true)}
                >
                  Annual VIP Pass
                  <span className="save-badge">Save 15%</span>
                </button>
              </div>

              <div className="packages-view-toggle">
                <button
                  type="button"
                  className={`view-toggle-tab ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  Comparison Table View
                </button>
                <button
                  type="button"
                  className={`view-toggle-tab ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                >
                  Tier Cards View
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Core Packages Section: Comparison Table View or Tier Cards View */}
        <section className="packages-grid-section">
          {viewMode === 'table' ? (
            <div className="packages-table-mode-container">
              {renderComparisonTable()}
            </div>
          ) : (
            <div className="packages-cards-container">
              {SERVICE_PACKAGES.map((pkg) => {
                const displayPrice = getPackagePrice(pkg.price);
                const isPopular = pkg.popular;

                return (
                  <div
                    key={pkg.id}
                    className={`packages-tier-card ${isPopular ? 'featured-tier' : ''}`}
                  >
                    {isPopular && (
                      <div className="tier-popular-badge">
                        <Sparkles size={13} /> STUDIO FAVORITE • 12-MONTH SHIELD
                      </div>
                    )}

                    <div className="tier-header">
                      <span className="tier-duration">
                        <Clock size={13} /> {pkg.duration}
                      </span>
                      <h3 className="tier-title">{pkg.name}</h3>
                      <p className="tier-subtitle">{pkg.subtitle}</p>

                      <div className="tier-pricing">
                        <span className="tier-currency">₹</span>
                        <strong className="tier-amount">{displayPrice.toLocaleString('en-IN')}</strong>
                        <span className="tier-period">
                          {isAnnualPlan ? '/ visit (annual rate)' : '/ vehicle'}
                        </span>
                      </div>
                    </div>

                    <div className="tier-features">
                      <span className="tier-features-head">What is included:</span>
                      <ul>
                        {pkg.features.map((feat, i) => (
                          <li key={i}>
                            <Check size={15} className="feat-check" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className="tier-book-btn btn-dark"
                      onClick={() => onBookPackage(pkg.id)}
                    >
                      Book {pkg.name.split(' ')[0]} <ArrowRight size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Interactive Add-on Customizer */}
        <section className="packages-addons-section">
          <div className="packages-addons-head">
            <span className="packages-eyebrow">Studio Enhancement Add-ons</span>
            <h2>Customize Your Bay Protocol</h2>
            <p>
              Enhance any treatment with specialized Indian weather and road defense formulations.
            </p>
          </div>

          <div className="packages-addons-grid">
            {SERVICE_ADDONS.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  className={`addon-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleAddon(addon.id)}
                  aria-pressed={isSelected}
                >
                  <div className="addon-card-left">
                    <div className="addon-checkbox">
                      {isSelected ? <Check size={14} /> : <Plus size={14} />}
                    </div>
                    <div>
                      <h4>{addon.name}</h4>
                      <span className="addon-duration">
                        <Clock size={11} /> {addon.duration} bay time
                      </span>
                    </div>
                  </div>
                  <strong className="addon-price">+₹{addon.price}</strong>
                </button>
              );
            })}
          </div>

          {/* Dynamic Floating Addon Toast Bar */}
          {selectedAddons.length > 0 && (
            <div className="addons-summary-bar" role="status" aria-live="polite">
              <div className="addons-summary-info">
                <div className="addons-toast-badge">
                  <Sparkles size={14} />
                </div>
                <div>
                  <div className="addons-count-text">
                    <strong>{selectedAddons.length}</strong> add-on{selectedAddons.length > 1 ? 's' : ''} selected
                  </div>
                  <div className="addons-sum-price">+₹{addonsTotal.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="addons-toast-actions">
                <button
                  type="button"
                  className="addons-book-cta"
                  onClick={() => onBookPackage('ceramic-spa')}
                >
                  Book with Selected Add-ons <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  className="addons-toast-dismiss"
                  onClick={clearAddons}
                  aria-label="Clear all add-ons"
                  title="Clear add-ons"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Quick Notification Toast */}
          {toastMessage && (
            <div className="addon-notification-toast">
              <CheckCircle size={15} />
              <span>{toastMessage}</span>
            </div>
          )}
        </section>

        {/* Studio Detailing Process Gallery */}
        <section className="packages-process-section">
          <div className="packages-process-head">
            <span className="packages-eyebrow">The Bay Methodology</span>
            <h2>Three Stages of Automotive Perfection</h2>
            <p>
              Every millimeter of paintwork, alloy metal, and cockpit leather receives factory-certified care.
            </p>
          </div>

          <div className="process-table-wrap">
            <table className="process-table">
              <thead>
                <tr>
                  <th className="process-col-stage">Stage</th>
                  <th className="process-col-media">Visual Preview</th>
                  <th className="process-col-protocol">Studio Protocol & Methodology</th>
                  <th className="process-col-chemistry">Chemistry & Equipment</th>
                  <th className="process-col-time">Bay Duration</th>
                  <th className="process-col-cert">Certified Standard</th>
                </tr>
              </thead>
              <tbody>
                {BAY_METHODOLOGY_STAGES.map((stg) => (
                  <tr key={stg.id}>
                    <td className="process-td-stage">
                      <div className="process-stage-circle">
                        <span className="stage-label">Stage</span>
                        <span className="stage-number">{stg.id}</span>
                      </div>
                    </td>
                    <td className="process-td-media">
                      <div className="process-thumb-wrap">
                        <img src={stg.image} alt={stg.title} loading="lazy" />
                      </div>
                    </td>
                    <td className="process-td-protocol">
                      <h4>{stg.title}</h4>
                      <p>{stg.desc}</p>
                    </td>
                    <td className="process-td-chemistry">
                      <div className="process-tag-list">
                        {stg.chemistry.map((item, idx) => (
                          <span key={idx} className="process-tag-pill">{item}</span>
                        ))}
                      </div>
                    </td>
                    <td className="process-td-time">
                      <div className="process-time-badge">
                        <Clock size={13} />
                        <span>{stg.duration}</span>
                      </div>
                    </td>
                    <td className="process-td-cert">
                      <span className="process-cert-badge">
                        <ShieldCheck size={13} /> {stg.guarantee}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Studio Guarantees */}
        <section className="packages-guarantees-bar">
          <div className="guarantee-box">
            <Droplets size={26} className="guarantee-icon" />
            <div>
              <h4>100% Deionized 0-PPM Water</h4>
              <p>Zero mineral calcification or water-spot etching guaranteed.</p>
            </div>
          </div>
          <div className="guarantee-box">
            <ShieldCheck size={26} className="guarantee-icon" />
            <div>
              <h4>Swirl-Free Hand Wash Protocol</h4>
              <p>Dual-bucket grit filtered wash with ultra-dense 1200 GSM microfibers.</p>
            </div>
          </div>
          <div className="guarantee-box">
            <Flame size={26} className="guarantee-icon" />
            <div>
              <h4>320°F Thermal Sanitization</h4>
              <p>Hospital-grade dry steam killing 99.9% of bacteria and viral pathogens.</p>
            </div>
          </div>
          <div className="guarantee-box">
            <Wrench size={26} className="guarantee-icon" />
            <div>
              <h4>OEM Diagnostics & Warranty Safe</h4>
              <p>Certified chemistry preserving manufacturer paint & electrical warranties.</p>
            </div>
          </div>
        </section>

        {/* Packages FAQ Section */}
        <section className="packages-faq-section">
          <div className="packages-faq-head">
            <span className="packages-eyebrow">
              <HelpCircle size={13} /> Common Inquiries
            </span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="packages-faq-list">
            {PACKAGES_FAQS.map((faq, i) => (
              <div
                key={i}
                className={`faq-item ${activeFaq === i ? 'open' : ''}`}
                onClick={() => toggleFaq(i)}
              >
                <div className="faq-question">
                  <h4>{faq.question}</h4>
                  <span className="faq-toggle">{activeFaq === i ? '−' : '+'}</span>
                </div>
                {activeFaq === i && <p className="faq-answer">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Direct Booking CTA */}
        <section className="packages-cta">
          <div>
            <span className="packages-eyebrow">Schedule Your Studio Visit</span>
            <h2>Ready to experience the 7-star detailing standard?</h2>
            <p>Select your preferred slot with instant confirmation and transparent invoicing.</p>
          </div>
          <button
            type="button"
            className="packages-cta-btn"
            onClick={() => onBookPackage('ceramic-spa')}
          >
            <CalendarDays size={16} /> Book Ceramic Auto Spa <ArrowRight size={16} />
          </button>
        </section>
      </main>

      {/* Footer matching Home Page */}
      <FooterReviews
        onOpenBooking={() => onBookPackage('ceramic-spa')}
        onNavigate={onNavigate}
      />
    </div>
  );
};
