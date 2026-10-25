import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Gauge,
  ShieldCheck,
  Search,
  Check,
  X,
  Droplets,
  Flame,
  Activity,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  IndianRupee
} from 'lucide-react';
import { CAR_BRANDS } from '../data/carsData';
import { SiteHeader } from '../components/SiteHeader';
import { FooterReviews } from '../components/FooterReviews';

const BRAND_FILTERS = ['All', 'Mahindra', 'Tata Motors', 'Toyota', 'Hyundai', 'Kia', 'Maruti Suzuki', 'Renault', 'MG Motor', 'Honda'];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured Fleet' },
  { value: 'price-asc', label: 'Wash Price: Low to High' },
  { value: 'price-desc', label: 'Wash Price: High to Low' },
  { value: 'hp-desc', label: 'Horsepower: High to Low' },
  { value: 'time-asc', label: 'Wash Time: Fastest First' }
];

const STUDIO_STANDARDS = [
  {
    icon: Droplets,
    title: '0-PPM Deionized Water',
    description: 'Multi-stage resin filtration eliminates 100% of minerals and hard water calcification for a spot-free, swirl-proof finish.'
  },
  {
    icon: ShieldCheck,
    title: '9H SiO2 Ceramic Matrix',
    description: 'Extreme hydrophobic barrier engineered specifically for harsh Indian sun, monsoon acid rain, and highway industrial fallout.'
  },
  {
    icon: Flame,
    title: '320°F Dry-Vapor Steam',
    description: 'Hospital-grade thermal sanitization dissolves grease, eliminates interior bacteria, and restores OEM matte leather texture.'
  },
  {
    icon: Activity,
    title: 'OEM OBD-II Diagnostics',
    description: 'Computerized 45-point health inspection covering battery life, powertrain sensors, and electronic safety calibration.'
  }
];

export const CarsPage = ({ onNavigate, onBookCar, customer, onSignOut }) => {
  const [selectedCar, setSelectedCar] = useState(CAR_BRANDS[0]);
  const [activeBrandFilter, setActiveBrandFilter] = useState('All');
  const [minPrice, setMinPrice] = useState(500);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [searchQuery, setSearchQuery] = useState('');
  const [only4x4, setOnly4x4] = useState(false);
  const [only3YrWarranty, setOnly3YrWarranty] = useState(false);
  const [onlyFastWash, setOnlyFastWash] = useState(false);
  const [onlyHighPower, setOnlyHighPower] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCar = (car) => {
    setSelectedCar(car);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeBrandFilter !== 'All') count++;
    if (searchQuery.trim() !== '') count++;
    if (minPrice > 500 || maxPrice < 1000) count++;
    if (only4x4) count++;
    if (only3YrWarranty) count++;
    if (onlyFastWash) count++;
    if (onlyHighPower) count++;
    if (sortBy !== 'featured') count++;
    return count;
  }, [
    activeBrandFilter,
    searchQuery,
    minPrice,
    maxPrice,
    only4x4,
    only3YrWarranty,
    onlyFastWash,
    onlyHighPower,
    sortBy
  ]);

  const clearFilters = () => {
    setActiveBrandFilter('All');
    setSearchQuery('');
    setMinPrice(500);
    setMaxPrice(1000);
    setOnly4x4(false);
    setOnly3YrWarranty(false);
    setOnlyFastWash(false);
    setOnlyHighPower(false);
    setSortBy('featured');
  };

  const filteredCars = useMemo(() => {
    const is4x4Car = (car) => {
      const text = `${car.model} ${car.tagline}`.toLowerCase();
      return text.includes('4x4') || text.includes('allgrip') || text.includes('all-wheel');
    };

    const parsePrice = (p) => parseInt(p.replace(/[^0-9]/g, ''), 10) || 0;

    let items = CAR_BRANDS.filter((car) => {
      const matchesBrand =
        activeBrandFilter === 'All' || car.name.toLowerCase() === activeBrandFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        car.name.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.tagline.toLowerCase().includes(q) ||
        car.recommendedService.toLowerCase().includes(q) ||
        car.specs.hp.toLowerCase().includes(q);

      const price = parsePrice(car.washPrice);
      const matchesPrice = price >= minPrice && price <= maxPrice;

      const matches4x4 = !only4x4 || is4x4Car(car);
      const matchesWarranty = !only3YrWarranty || car.specs.ceramicWarranty.includes('3');

      const washMinutes = parseInt(car.specs.washTime.replace(/[^0-9]/g, ''), 10) || 0;
      const matchesFastWash = !onlyFastWash || washMinutes <= 40;

      const hpNum = parseInt(car.specs.hp.replace(/[^0-9]/g, ''), 10) || 0;
      const matchesHighPower = !onlyHighPower || hpNum >= 170;

      return (
        matchesBrand &&
        matchesSearch &&
        matchesPrice &&
        matches4x4 &&
        matchesWarranty &&
        matchesFastWash &&
        matchesHighPower
      );
    });

    const parseHp = (h) => parseInt(h.replace(/[^0-9]/g, ''), 10) || 0;
    const parseTime = (t) => parseInt(t.replace(/[^0-9]/g, ''), 10) || 0;

    switch (sortBy) {
      case 'price-asc':
        return [...items].sort((a, b) => parsePrice(a.washPrice) - parsePrice(b.washPrice));
      case 'price-desc':
        return [...items].sort((a, b) => parsePrice(b.washPrice) - parsePrice(a.washPrice));
      case 'hp-desc':
        return [...items].sort((a, b) => parseHp(b.specs.hp) - parseHp(a.specs.hp));
      case 'time-asc':
        return [...items].sort((a, b) => parseTime(a.specs.washTime) - parseTime(b.specs.washTime));
      default:
        return items;
    }
  }, [
    activeBrandFilter,
    searchQuery,
    minPrice,
    maxPrice,
    only4x4,
    only3YrWarranty,
    onlyFastWash,
    onlyHighPower,
    sortBy
  ]);

  return (
    <div className="cars-page">
      <SiteHeader
        onNavigate={onNavigate}
        currentPage="cars"
        customer={customer}
        onSignOut={onSignOut}
        onOpenBooking={() => onBookCar(selectedCar)}
      />

      <main>
        {/* Accessible Page Heading & Selected Model Tracker */}
        <h1 className="sr-only">Every car has its own character.</h1>
        <h2 className="sr-only">{selectedCar.model}</h2>

        {/* Collection & Filter Section */}
        <section className="cars-collection" id="vehicle-list">
          <div className="cars-collection-heading">
            <div>
              <span className="cars-eyebrow">Studio Fleet Portfolio</span>
              <h2>Find your car.</h2>
            </div>
          </div>

          {/* Enhanced Luxury Filter Bar */}
          <div className="cars-filter-toolbar">
            {/* Row 1: Search & Luxury Sort Dropdown */}
            <div className="cars-filter-top-row">
              <div className="cars-search-box">
                <Search size={16} className="cars-search-icon" />
                <input
                  type="text"
                  placeholder="Search brand, model, 4x4, turbo, engine specs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search vehicles"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="cars-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Custom Luxury Sort & Filter Dropdown with Checkboxes */}
              <div className="cars-sort-dropdown-wrap" ref={sortDropdownRef}>
                <button
                  type="button"
                  className={`cars-sort-btn ${isSortOpen ? 'open' : ''}`}
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  id="cars-sort-select"
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                >
                  <SlidersHorizontal size={14} className="sort-icon" />
                  <span className="sort-btn-label">
                    {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Featured Fleet'}
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="cars-filter-badge-dot">{activeFilterCount}</span>
                  )}
                  <ChevronDown size={13} className={`select-arrow ${isSortOpen ? 'rotated' : ''}`} />
                </button>

                {isSortOpen && (
                  <div className="cars-custom-dropdown-popover" role="listbox">
                    <div className="dropdown-section-title">Sort Collection</div>
                    <div className="dropdown-checkbox-group">
                      {SORT_OPTIONS.map((opt) => {
                        const isChecked = sortBy === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            className={`dropdown-checkbox-row ${isChecked ? 'active' : ''}`}
                            onClick={() => {
                              setSortBy(opt.value);
                              setIsSortOpen(false);
                            }}
                            role="option"
                            aria-selected={isChecked}
                          >
                            <span className={`custom-checkbox-box ${isChecked ? 'checked' : ''}`}>
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </span>
                            <span className="dropdown-row-label">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="dropdown-popover-divider" />

                    <div className="dropdown-section-title">Quick Filter Checkboxes</div>
                    <div className="dropdown-checkbox-group">
                      <button
                        type="button"
                        className={`dropdown-checkbox-row ${only4x4 ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOnly4x4((prev) => !prev);
                        }}
                      >
                        <span className={`custom-checkbox-box ${only4x4 ? 'checked' : ''}`}>
                          {only4x4 && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className="dropdown-row-label">4x4 / AWD Capable</span>
                      </button>

                      <button
                        type="button"
                        className={`dropdown-checkbox-row ${only3YrWarranty ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOnly3YrWarranty((prev) => !prev);
                        }}
                      >
                        <span className={`custom-checkbox-box ${only3YrWarranty ? 'checked' : ''}`}>
                          {only3YrWarranty && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className="dropdown-row-label">3-Year SiO2 Warranty</span>
                      </button>

                      <button
                        type="button"
                        className={`dropdown-checkbox-row ${onlyFastWash ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOnlyFastWash((prev) => !prev);
                        }}
                      >
                        <span className={`custom-checkbox-box ${onlyFastWash ? 'checked' : ''}`}>
                          {onlyFastWash && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className="dropdown-row-label">Express Wash (≤40m)</span>
                      </button>

                      <button
                        type="button"
                        className={`dropdown-checkbox-row ${onlyHighPower ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOnlyHighPower((prev) => !prev);
                        }}
                      >
                        <span className={`custom-checkbox-box ${onlyHighPower ? 'checked' : ''}`}>
                          {onlyHighPower && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className="dropdown-row-label">High Power (170+ BHP)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Wash Price Range Filter Controller */}
            <div className="cars-range-card">
              <div className="cars-range-card-header">
                <div className="cars-range-indicator">
                  <span className="cars-range-indicator-label">Wash Price Range:</span>
                  <span className="cars-range-indicator-val">
                    ₹{minPrice} – ₹{maxPrice}
                  </span>
                  <span className="cars-range-badge-count">
                    {filteredCars.length} {filteredCars.length === 1 ? 'model' : 'models'}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="cars-range-presets" role="group" aria-label="Price range presets">
                  <button
                    type="button"
                    className={`cars-range-preset-pill ${minPrice === 500 && maxPrice === 1000 ? 'active' : ''}`}
                    onClick={() => { setMinPrice(500); setMaxPrice(1000); }}
                  >
                    All (₹500 - ₹1,000)
                  </button>
                  <button
                    type="button"
                    className={`cars-range-preset-pill ${minPrice === 500 && maxPrice === 699 ? 'active' : ''}`}
                    onClick={() => { setMinPrice(500); setMaxPrice(699); }}
                  >
                    Under ₹700
                  </button>
                  <button
                    type="button"
                    className={`cars-range-preset-pill ${minPrice === 700 && maxPrice === 849 ? 'active' : ''}`}
                    onClick={() => { setMinPrice(700); setMaxPrice(849); }}
                  >
                    ₹700 – ₹850
                  </button>
                  <button
                    type="button"
                    className={`cars-range-preset-pill ${minPrice === 850 && maxPrice === 1000 ? 'active' : ''}`}
                    onClick={() => { setMinPrice(850); setMaxPrice(1000); }}
                  >
                    ₹850+
                  </button>
                </div>
              </div>

              {/* Range Slider Track & Inputs */}
              <div className="cars-range-sliders-row">
                <div className="cars-range-slider-col">
                  <div className="cars-slider-meta">
                    <label htmlFor="cars-min-range">Min Budget: <strong>₹{minPrice}</strong></label>
                    <span className="cars-slider-sub">Starting from ₹500</span>
                  </div>
                  <input
                    id="cars-min-range"
                    type="range"
                    min="500"
                    max="950"
                    step="50"
                    value={minPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val <= maxPrice) setMinPrice(val);
                    }}
                    className="cars-range-input"
                    aria-label="Minimum wash price"
                  />
                </div>

                <div className="cars-range-slider-col">
                  <div className="cars-slider-meta">
                    <label htmlFor="cars-max-range">Max Budget: <strong>₹{maxPrice}</strong></label>
                    <span className="cars-slider-sub">Up to ₹1,000</span>
                  </div>
                  <input
                    id="cars-max-range"
                    type="range"
                    min="550"
                    max="1000"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= minPrice) setMaxPrice(val);
                    }}
                    className="cars-range-input"
                    aria-label="Maximum wash price"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Brand Filter Pills */}
            <div className="cars-brand-pills" role="tablist" aria-label="Filter by brand">
              {BRAND_FILTERS.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  className={`cars-brand-pill ${activeBrandFilter === brand ? 'active' : ''}`}
                  onClick={() => setActiveBrandFilter(brand)}
                  role="tab"
                  aria-selected={activeBrandFilter === brand}
                >
                  {brand}
                </button>
              ))}
            </div>

            {/* Row 5: Meta summary with results count and reset */}
            <div className="cars-filter-meta">
              <div className="cars-filter-meta-left">
                <span>Showing <strong>{filteredCars.length}</strong> of {CAR_BRANDS.length} models</span>
                {activeFilterCount > 0 && (
                  <span className="cars-active-filter-badge">
                    {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button type="button" className="cars-filter-reset" onClick={clearFilters}>
                  <RotateCcw size={12} /> Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Vehicles Grid */}
          {filteredCars.length === 0 ? (
            <div className="cars-empty-state">
              <p>No vehicles match your active filters or search criteria.</p>
              <button type="button" onClick={clearFilters} className="cars-empty-reset">
                <RotateCcw size={13} style={{ marginRight: '6px' }} /> Reset All Filters ({CAR_BRANDS.length} Vehicles)
              </button>
            </div>
          ) : (
            <div className="cars-grid">
              {filteredCars.map((car, index) => {
                const isSelected = car.id === selectedCar.id;
                return (
                  <article className={`cars-card${isSelected ? ' selected' : ''}`} key={car.id}>
                    <button
                      className="cars-card-select"
                      onClick={() => selectCar(car)}
                      aria-label={`View ${car.name} ${car.model}`}
                      aria-pressed={isSelected}
                    >
                      <span className="cars-card-image">
                        <img src={car.image} alt={`${car.name} ${car.model}`} loading="lazy" />
                        <span className="cars-card-index">{String(index + 1).padStart(2, '0')}</span>
                        <span className="cars-card-action">
                          {isSelected ? <Check size={16} /> : <ArrowRight size={16} />}
                        </span>
                      </span>
                      <span className="cars-card-copy">
                        <div className="cars-card-make-row">
                          <span className="cars-card-make">{car.year} • {car.name}</span>
                          {car.price && <span className="cars-card-showroom-badge">{car.price}</span>}
                        </div>
                        <strong>{car.model}</strong>
                        <span className="cars-card-tagline">{car.tagline}</span>
                      </span>
                    </button>
                    <div className="cars-card-specs">
                      <span><Gauge size={14} />{car.specs.hp}</span>
                      <span><Clock3 size={14} />{car.specs.washTime}</span>
                      <span><ShieldCheck size={14} />{car.specs.ceramicWarranty}</span>
                    </div>
                    <div className="cars-card-footer">
                      <div className="cars-card-pricing-group">
                        <span className="cars-card-price-label">Studio Wash</span>
                        <span className="cars-card-price">from <strong>{car.washPrice}</strong></span>
                      </div>
                      <button
                        type="button"
                        className="cars-card-quick-book"
                        onClick={() => onBookCar(car)}
                        aria-label={`Book service for ${car.name} ${car.model}`}
                      >
                        Book <ArrowRight size={13} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Selected Vehicle Recommendation Bay — Redesigned Luxury Concierge Bay */}
        <section className="cars-recommendation" aria-live="polite">
          {/* Subtle ambient lighting layer */}
          <div className="cars-rec-glow" aria-hidden="true" />

          {/* Top Bar with Status Badge and Vehicle Telemetry */}
          <div className="cars-rec-topbar">
            <div className="cars-rec-badge">
              <span className="cars-rec-dot" />
              <span>Selected for your {selectedCar.name}</span>
            </div>
            <div className="cars-rec-specs-chips">
              {selectedCar.price && (
                <span className="cars-rec-spec-chip"><IndianRupee size={12} /> {selectedCar.price}</span>
              )}
              <span className="cars-rec-spec-chip"><Gauge size={12} /> {selectedCar.specs.hp}</span>
              <span className="cars-rec-spec-chip"><Clock3 size={12} /> {selectedCar.specs.washTime}</span>
              <span className="cars-rec-spec-chip"><ShieldCheck size={12} /> {selectedCar.specs.ceramicWarranty} Warranty</span>
            </div>
          </div>

          <div className="cars-rec-content-grid">
            {/* Left Column: Tailored Service Specifications */}
            <div className="cars-recommendation-copy">
              <h2>{selectedCar.recommendedService}</h2>
              <p>
                Engineered specifically for your {selectedCar.year} {selectedCar.model}. Our master technicians
                calibrate each studio protocol to your vehicle's clearcoat hardness, underbody geometry, and powertrain diagnostics.
              </p>

              {/* 4 Feature Micro-Cards */}
              <div className="cars-rec-highlights-grid">
                <div className="cars-rec-highlight-card">
                  <div className="cars-rec-check-icon">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div className="cars-rec-highlight-text">
                    <strong>0-PPM Deionized Snow Foam</strong>
                    <span>Swirl-free guarantee with pure resin filtration</span>
                  </div>
                </div>

                <div className="cars-rec-highlight-card">
                  <div className="cars-rec-check-icon">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div className="cars-rec-highlight-text">
                    <strong>9H SiO2 Ceramic Matrix</strong>
                    <span>Extreme hydrophobic shield against Indian UV & acid rain</span>
                  </div>
                </div>

                <div className="cars-rec-highlight-card">
                  <div className="cars-rec-check-icon">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div className="cars-rec-highlight-text">
                    <strong>45-Point OBD-II Diagnostics</strong>
                    <span>OEM electronic scan & powertrain telemetry check</span>
                  </div>
                </div>

                <div className="cars-rec-highlight-card">
                  <div className="cars-rec-check-icon">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div className="cars-rec-highlight-text">
                    <strong>320°F Dry-Vapor Sanitization</strong>
                    <span>Hospital-grade bacterial interior cleanse & leather revive</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Car Visual & Decision Hub */}
            <div className="cars-recommendation-meta">
              {/* Selected Car Visual Hub */}
              <div className="cars-rec-car-card">
                <div className="cars-rec-car-media">
                  <img
                    src={selectedCar.image}
                    alt={`${selectedCar.name} ${selectedCar.model}`}
                    className="cars-rec-car-img"
                    key={`rec-${selectedCar.id}`}
                  />
                  <div className="cars-rec-car-shadow" />
                </div>
                <div className="cars-rec-car-caption">
                  <span className="cars-rec-car-model">{selectedCar.model}</span>
                  <span className="cars-rec-car-tagline">{selectedCar.tagline}</span>
                </div>
              </div>

              {/* Dual Service Price Hub */}
              <div className="cars-rec-pricing-grid">
                <div className="cars-rec-price-card">
                  <span className="cars-rec-price-title">Signature Wash Spa</span>
                  <strong className="cars-rec-price-amount">{selectedCar.washPrice}</strong>
                  <span className="cars-rec-price-sub">Swirl-free exterior treatment</span>
                </div>

                <div className="cars-rec-price-card active-plan">
                  <span className="cars-rec-price-badge">Recommended</span>
                  <span className="cars-rec-price-title">Master Maintenance</span>
                  <strong className="cars-rec-price-amount">{selectedCar.maintenancePrice}</strong>
                  <span className="cars-rec-price-sub">Full 45-point studio overhaul</span>
                </div>
              </div>

              {/* Booking CTA Button (Pure Crisp White on Dark Obsidian, No Gold!) */}
              <button
                type="button"
                className="cars-rec-book-btn"
                onClick={() => onBookCar(selectedCar)}
                aria-label={`Book service for ${selectedCar.name} ${selectedCar.model}`}
              >
                <CalendarDays size={16} /> Book for this car <ArrowRight size={15} />
              </button>

              <div className="cars-rec-trust-bar">
                <span>✓ Instant Confirmation</span>
                <span className="bullet-sep">•</span>
                <span>✓ Swirl-Free Guarantee</span>
                <span className="bullet-sep">•</span>
                <span>✓ Pay at Studio</span>
              </div>
            </div>
          </div>
        </section>

        {/* Studio Detailing Standards & Technology */}
        <section className="cars-standards-section">
          <div className="cars-standards-head">
            <span className="cars-eyebrow">Precision Detailing Science</span>
            <h2>The Unique Studio Standard</h2>
            <p>
              We treat every vehicle as a precision mechanical instrument, utilizing world-class
              touchless washing systems and certified ceramic chemistry.
            </p>
          </div>

          <div className="cars-standards-grid">
            {STUDIO_STANDARDS.map((std, i) => {
              const Icon = std.icon;
              return (
                <div key={i} className="cars-standard-card">
                  <div className="cars-standard-icon">
                    <Icon size={24} />
                  </div>
                  <h3>{std.title}</h3>
                  <p>{std.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Reused Footer from Main Landing Page */}
      <FooterReviews
        onOpenBooking={() => onBookCar(selectedCar)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
