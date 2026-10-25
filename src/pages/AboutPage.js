import React, { useState, useRef } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Calendar, ChevronRight, ChevronLeft, Camera } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { FooterReviews } from '../components/FooterReviews';

const DEFAULT_CREATOR_IMAGE = '/images/me.png';

const CREATOR_STORIES = [
  {
    quote: "The detailing bays were built with one obsession: zero compromise on chemistry and craft. When you treat every car like your own masterpiece, the gloss speaks for itself.",
    creator: "Shaik Sharif",
    role: "Founder & Master Automotive Architect",
  },
  {
    quote: "From custom pH-neutral foams formulated for tropical heat to 9H ceramic matrix coatings, every touchpoint at Unique is engineered for uncompromised excellence.",
    creator: "Shaik Sharif",
    role: "Founder & Surface Science Specialist",
  },
  {
    quote: "We didn't just build a workshop; we created an automotive sanctuary with private lounges, transparent live bay feeds, and certified master technicians.",
    creator: "Shaik Sharif",
    role: "Founder & Experience Director",
  },
];

export const AboutPage = ({ onNavigate, customer, onSignOut, onOpenBooking }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imgSrc, setImgSrc] = useState('/images/me.png');
  const fileInputRef = useRef(null);

  // Clear any old cached image so /images/me.png is shown cleanly
  React.useEffect(() => {
    try {
      localStorage.removeItem('unique_creator_profile_img');
    } catch (err) {}
  }, []);

  const handleBooking = () => {
    if (typeof onOpenBooking === 'function') {
      onOpenBooking();
    } else {
      onNavigate('/');
    }
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? CREATOR_STORIES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === CREATOR_STORIES.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = () => {
    if (imgSrc !== DEFAULT_CREATOR_IMAGE) {
      setImgSrc(DEFAULT_CREATOR_IMAGE);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result) {
          setImgSrc(result);
          try {
            localStorage.setItem('unique_creator_profile_img', result);
          } catch (err) {}
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="about-page">
      {/* Reused Header */}
      <SiteHeader
        onNavigate={onNavigate}
        currentPage="about"
        customer={customer}
        onSignOut={onSignOut}
        onOpenBooking={handleBooking}
      />

      <main>
        {/* Hero Section matching main page reference layout */}
        <section className="about-hero-stage" style={{ padding: '36px 5vw 40px', maxWidth: '1600px', margin: '0 auto' }}>
          <div className="hero-main-layout">
            {/* Left Column: Bold Headline & Action */}
            <div className="hero-content-left">
              <div className="headline-wrapper">
                <h1 className="hero-main-title about-hero-title">
                  <span className="title-line">We believe every drive</span>
                  <span className="title-line highlight-phrase">should feel exceptional.</span>
                </h1>
              </div>

              <p className="hero-description">
                Don't deny yourself the pleasure of driving the best cars across India with bespoke 0-PPM foam wash, monsoon protection and master servicing.
              </p>

              <div className="hero-action-row">
                <button
                  type="button"
                  className="schedule-btn-dark"
                  onClick={handleBooking}
                >
                  <Calendar size={16} /> Book Bay Appointment
                </button>
                <a href="#story" className="explore-rates-link">
                  Read Our Story <ChevronRight size={15} />
                </a>
              </div>

              {/* Micro trust rating badge */}
              <div className="hero-trust-bar">
                <div className="rating-stars">★★★★★</div>
                <span className="rating-text">4.98 Rating • 30,000+ Indian Vehicles Treated</span>
              </div>
            </div>

            {/* Right Column: Hero Vehicle on clean background */}
            <div className="hero-visual-right">
              {/* Car Image with soft ground shadow */}
              <div className="car-showcase-box">
                <img
                  src="/images/mahindra_thar.jpg"
                  alt="Mahindra Thar Roxx 4x4"
                  className="hero-car-image"
                />
                <div className="car-ground-shadow"></div>
              </div>

              {/* Floating Vehicle Specs Pill */}
              {/* <div className="car-specs-pill">
                <span className="car-name-bold">Mahindra Thar Roxx 4x4</span>
                <span className="spec-dot">•</span>
                <span className="car-hero-price-tag">₹12.99 – 22.49 Lakh</span>
                <span className="spec-dot">•</span>
                <span>172 BHP</span>
                <span className="spec-dot">•</span>
                <span className="wash-time-tag">Fast Wash: 45 mins</span>
              </div> */}
            </div>
          </div>
        </section>

        {/* Creator Section with Big Circle on Left and Story Matter on Right */}
        <section className="about-story" id="story">
          {/* Left Column: Heading & Solid Blue Circle Image */}
          <div className="creator-story-circle-col">
            <div className="creator-heading-block">
              <h2 className="creator-heading-title">
                More than a service bay: <br />
                meet the creator of Unique.
              </h2>
              <p className="creator-story-lead">
                From our very first detailing bay to thousands of vehicles across India, hear the journey and philosophy directly from our founder.
              </p>
            </div>

            <div className="creator-circle-stage">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div
                className="creator-blue-circle"
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload or change profile photo"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <img
                  src={imgSrc}
                  alt="Shaik Sharif - Founder of Unique"
                  className="creator-portrait-img"
                  onError={handleImageError}
                />
             
              </div>

            </div>
          </div>

          {/* Right Column: Creator Quote, Meta & Pagination */}
          <div className="creator-story-content-col">
            <span className="creator-quote-mark" aria-hidden="true">“</span>

            <p className="creator-quote-text">
              {CREATOR_STORIES[currentSlide].quote}
            </p>

            <div className="creator-quote-pointer-wrap">
              <svg className="creator-quote-pointer" width="70" height="34" viewBox="0 0 70 34" fill="none" aria-hidden="true">
                <path d="M 2 4 L 42 26 L 64 26" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="66" cy="26" r="3.5" fill="#1976d2" />
              </svg>
              <div className="creator-author-card">
                <div className="creator-avatar-wrap">
                  <img src={imgSrc} alt="Shaik Sharif" className="creator-mini-avatar" onError={handleImageError} />
                </div>
                <div className="creator-author-block">
                  <h4>{CREATOR_STORIES[currentSlide].creator}</h4>
                  <span>{CREATOR_STORIES[currentSlide].role}</span>
                </div>
              </div>
            </div>

            <div className="creator-controls-row">
              <button
                type="button"
                className="creator-ctrl-btn"
                onClick={handlePrevSlide}
                aria-label="Previous story"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="creator-ctrl-btn"
                onClick={handleNextSlide}
                aria-label="Next story"
              >
                <ChevronRight size={16} />
              </button>
              <span className="creator-counter-badge">
                {`0${currentSlide + 1} / 0${CREATOR_STORIES.length}`}
              </span>
            </div>

            <button
              type="button"
              className="creator-collection-link"
              onClick={() => onNavigate('/cars')}
            >
              Explore our vehicle collection <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* Values & Standards Grid */}
        <section className="about-values">
          <div className="about-values-heading">
            <div>
              <h2>Why discerning drivers choose Unique.</h2>
            </div>
            <p>
              Every process, chemical formulation, and bay specialist is certified to international
              automotive luxury standards.
            </p>
          </div>

          <div className="about-values-grid">
            <article className="about-value-card">
              <div className="about-value-top">
                <span><ShieldCheck size={24} /></span>
                <span>01 / 03</span>
              </div>
              <h3>Certified Chemistry</h3>
              <p>
                Zero-compromise pH neutral shampoos, non-acidic wheel cleaners, and ceramic sealants
                imported directly from certified manufacturers in Germany and Japan.
              </p>
            </article>

            <article className="about-value-card">
              <div className="about-value-top">
                <span>
                  <img
                    src="/images/reanch.png"
                    alt="Master Technicians"
                    className="about-wrench-icon"
                    onError={(e) => { e.currentTarget.src = '/reanch.png'; }}
                  />
                </span>
                <span>02 / 03</span>
              </div>
              <h3>Master Technicians</h3>
              <p>
                Over 1,200 hours of specialized training per technician covering digital paint gauge
                assessment, dual-action rotary polishing, and OEM torque specifications.
              </p>
            </article>

            <article className="about-value-card">
              <div className="about-value-top">
                <span>
                  <img
                    src="/images/vip.png"
                    alt="VIP Concierge"
                    className="about-vip-icon"
                    onError={(e) => { e.currentTarget.src = '/vip.png'; }}
                  />
                </span>
                <span>03 / 03</span>
              </div>
              <h3>VIP Concierge</h3>
              <p>
                Doorstep flatbed pick-and-drop, private lounge bays with real-time video feeds,
                and dedicated automotive advisors for every visit.
              </p>
            </article>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <div>
            <span className="about-eyebrow">Experience The Difference</span>
            <h2>Ready to give your car the showroom treatment?</h2>
          </div>
          <button type="button" onClick={handleBooking}>
            <Calendar size={16} /> Book an appointment <ArrowRight size={16} />
          </button>
          <div className="about-cta-icon" aria-hidden="true">
            <Sparkles size={180} />
          </div>
        </section>
      </main>

      {/* Reused Footer from Main Page */}
      <FooterReviews
        onOpenBooking={handleBooking}
        onNavigate={onNavigate}
      />
    </div>
  );
};
