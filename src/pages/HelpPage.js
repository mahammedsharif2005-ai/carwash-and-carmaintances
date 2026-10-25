import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Phone,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Check,
  ChevronDown,
  Search,
  X,
  Send,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { FooterReviews } from '../components/FooterReviews';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'booking', label: 'Bookings & Rescheduling' },
  { id: 'detailing', label: '0-PPM Water & Protocols' },
  { id: 'ceramic', label: 'Ceramic Matrix & Warranty' },
  { id: 'concierge', label: 'VIP Pickup & Concierge' },
  { id: 'store', label: 'Store Orders & Shipping' }
];

const FAQS_DATA = [
  {
    id: 1,
    category: 'detailing',
    question: 'How does your 0-PPM deionized water guarantee 100% swirl-free washing?',
    answer: 'Standard municipal tap water in Mumbai and Pune contains 250 to 650+ PPM of dissolved minerals (calcium, magnesium, lime). When water evaporates under sunlight, these minerals calcify into microscopic crystals that scratch paint when wiped. Our multi-stage reverse-osmosis resin filtration purifies water down to 0-PPM (zero parts per million). It evaporates 100% spotless without requiring high-friction towel rubbing.',
    tags: ['0-ppm', 'water', 'swirl-free', 'scratch', 'minerals']
  },
  {
    id: 2,
    category: 'ceramic',
    question: 'What does the 3-Year 9H SiO2 Ceramic Matrix warranty cover?',
    answer: 'Our 3-Year warranty protects against environmental oxidation, UV paint fading, acid rain etching, bird dropping corrosion, and loss of hydrophobic water-beading contact angle (>110°). You receive a digital warranty certificate tied to your VIN, with complimentary bi-annual maintenance checkups and top-ups at any Unique Studio bay in Mumbai or Pune.',
    tags: ['ceramic', 'warranty', '9h', 'hydrophobic', 'protection']
  },
  {
    id: 3,
    category: 'booking',
    question: 'Can I reschedule or cancel my service booking without penalties?',
    answer: 'Yes, completely free of charge. You can reschedule or cancel up to 4 hours prior to your scheduled bay appointment directly online, via WhatsApp concierge, or over phone. We do not charge cancellation fees or hold your payment.',
    tags: ['cancel', 'reschedule', 'booking', 'appointment', 'fee']
  },
  {
    id: 4,
    category: 'concierge',
    question: 'How does the door-to-door VIP vehicle pickup and drop work?',
    answer: 'For Master Maintenance and Ceramic Coating bookings, our bonded and insured studio transport drivers collect your vehicle from your residence or office anywhere in Mumbai (BKC, South Mumbai, Bandra, Juhu, Thane) and Pune (Koregaon Park, Baner, Kalyani Nagar). Vehicles are returned sanitized, sealed with steering and seat protective covers, and fully inspected.',
    tags: ['pickup', 'drop', 'concierge', 'doorstep', 'mumbai', 'pune']
  },
  {
    id: 5,
    category: 'ceramic',
    question: 'How should I care for my car after ceramic coating or paint jeweling?',
    answer: 'Allow 48 hours before the first wash to ensure complete nano-bonding. After that, always use pH-neutral car wash shampoo (available in our Maintenance Store), a two-bucket grit guard system, and plush microfiber towels (minimum 500 GSM). Avoid high-alkaline roadside wash centers and nylon roller car washes.',
    tags: ['maintenance', 'aftercare', 'shampoo', 'wash', 'ceramic']
  },
  {
    id: 6,
    category: 'detailing',
    question: 'Do you measure clearcoat paint thickness before machine polishing?',
    answer: 'Yes, every vehicle undergoes a multi-point computerized ultrasonic paint depth gauge scan across all body panels. If clearcoat thickness is below 85 microns, we avoid aggressive compounding and apply non-abrasive jeweling glazes to safeguard the original OEM paint layer.',
    tags: ['paint', 'polish', 'microns', 'clearcoat', 'inspection']
  },
  {
    id: 7,
    category: 'detailing',
    question: 'What happens if it rains immediately after my ceramic coating service?',
    answer: 'All ceramic coatings applied in our studio bays are cured under short-wave infrared (IR) baking lamps inside our climate-controlled clean rooms before handoff. This accelerates hydrophobic cross-linking, making your vehicle 100% weather-proof and rain-safe the moment it leaves our studio.',
    tags: ['monsoon', 'rain', 'curing', 'infrared', 'drying']
  },
  {
    id: 8,
    category: 'store',
    question: 'What are the delivery timelines and return terms for Store products?',
    answer: 'Orders placed before 2:00 PM are dispatched on the same business day. Delivery takes 24–48 hours across Maharashtra and 3–5 business days nationwide. Unopened products in original packaging can be returned within 14 days for a full refund.',
    tags: ['shipping', 'delivery', 'returns', 'store', 'order']
  }
];

export const HelpPage = ({ onNavigate, customer, onSignOut, onOpenBooking }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(1); // First item open by default
  const [faqFeedback, setFaqFeedback] = useState({});

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    name: customer?.name || '',
    phone: '',
    email: customer?.email || '',
    vehicleModel: '',
    subject: 'Appointment Rescheduling & Booking Advice',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((faq) => {
      const matchesCategory =
        activeCategory === 'all' || faq.category === activeCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.tags.some((t) => t.includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleFaq = (id) => {
    setExpandedFaq((prev) => (prev === id ? null : id));
  };

  const handleFeedback = (id, type) => {
    setFaqFeedback((prev) => ({ ...prev, [id]: type }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.name || !ticketForm.phone || !ticketForm.message) {
      alert('Please fill in your name, phone number, and inquiry details.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketNum = `UQ-CONCIERGE-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket({
        ticketNumber: ticketNum,
        ...ticketForm,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 600);
  };

  const resetForm = () => {
    setSubmittedTicket(null);
    setTicketForm({
      name: customer?.name || '',
      phone: '',
      email: customer?.email || '',
      vehicleModel: '',
      subject: 'Appointment Rescheduling & Booking Advice',
      message: ''
    });
  };

  return (
    <div className="help-page">
      <SiteHeader
        onNavigate={onNavigate}
        currentPage="help"
        customer={customer}
        onSignOut={onSignOut}
        onOpenBooking={onOpenBooking}
      />

      <main>
        {/* Help Hero & Instant Search Section */}
        <section className="help-hero">
          <div className="help-hero-inner">
            <span className="help-eyebrow">
              <HelpCircle size={14} /> 24/7 Studio Concierge & Client Support
            </span>
            <h1>How can our studio team<br />assist your drive?</h1>
            <p>
              Direct communication with master technicians, clearcoat specialists, and VIP concierge dispatch across Mumbai and Pune clean-room bays.
            </p>

            {/* Interactive Live Search Bar */}
            <div className="help-search-container">
              <Search size={18} className="help-search-icon" />
              <input
                type="text"
                placeholder="Search topics, protocols (e.g. 0-PPM water, warranty, cancellation, ceramic care, pickup)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search help center"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="help-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="help-search-result-hint">
                Found <strong>{filteredFaqs.length}</strong> {filteredFaqs.length === 1 ? 'article' : 'articles'} matching "{searchQuery}"
              </div>
            )}
          </div>
        </section>

        {/* 3 Instant Touchpoints (Hotline, WhatsApp, Walk-In) */}
        <section className="help-channels-section">
          <div className="help-channels-grid">
            {/* Channel 1: Studio Hotline */}
            <div className="help-channel-card">
              <div className="channel-icon-wrap">
                <Phone size={22} />
              </div>
              <div className="channel-status-badge">
                <span className="channel-pulse-dot" />
                <span>Live Studio Hotline</span>
              </div>
              <h3>Master Detailing Hotline</h3>
              <p>Speak directly with our Chief Bay Supervisor for booking guidance, emergency decontamination, or concierge pickup.</p>
              <div className="channel-meta">
                <strong>+91 (022) 8900-9274</strong>
                <span>Mon – Sun: 8:00 AM – 8:30 PM (IST)</span>
              </div>
              <a href="tel:+919820084721" className="channel-btn">
                <Phone size={14} /> Call Studio Concierge
              </a>
            </div>

            {/* Channel 2: WhatsApp Media Bay */}
            <div className="help-channel-card highlighted">
              <div className="channel-icon-wrap">
                <MessageSquare size={22} />
              </div>
              <div className="channel-status-badge">
                <span className="channel-pulse-dot" />
                <span>Photo & Video Telemetry</span>
              </div>
              <h3>Studio WhatsApp Desk</h3>
              <p>Send photos or video clips of swirl marks, paint chips, or interior wear for a complimentary expert assessment within 10 minutes.</p>
              <div className="channel-meta">
                <strong>+91 98200 84722</strong>
                <span>Average Response: Under 8 mins</span>
              </div>
              <a
                href="https://wa.me/919820084722?text=Hello%20Unique%20Studio%20Team%2C%20I%20need%20assistance%20with%20my%20vehicle."
                target="_blank"
                rel="noreferrer"
                className="channel-btn whatsapp-btn"
              >
                <MessageSquare size={14} /> Chat on WhatsApp <ExternalLink size={13} />
              </a>
            </div>

            {/* Channel 3: Studio Clean-Rooms */}
            <div className="help-channel-card">
              <div className="channel-icon-wrap">
                <Building2 size={22} />
              </div>
              <div className="channel-status-badge">
                <span>Climate-Controlled Bays</span>
              </div>
              <h3>Walk-In Clean Rooms</h3>
              <p>Visit our dust-free optical lighting tunnels in Worli (Mumbai) & Koregaon Park (Pune). Free paint thickness inspection included.</p>
              <div className="channel-meta">
                <strong>Worli, Mumbai & Koregaon Park, Pune</strong>
                <span>Espresso Bar & Wi-Fi Lounge Included</span>
              </div>
              <a href="#locations" className="channel-btn">
                <MapPin size={14} /> View Studio Bays
              </a>
            </div>
          </div>
        </section>

        {/* Knowledge Base & FAQs Section */}
        <section className="help-faq-section" id="faqs">
          <div className="help-section-head">
            <span className="help-eyebrow">Studio Knowledge Base</span>
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about our chemistry, warranty terms, bay operations, and VIP pickup services.</p>
          </div>

          {/* Category Filter Pills */}
          <div className="help-category-pills" role="tablist" aria-label="FAQ categories">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`help-cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                role="tab"
                aria-selected={activeCategory === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="help-accordion-wrap">
            {filteredFaqs.length === 0 ? (
              <div className="help-empty-search">
                <p>No answers found matching "{searchQuery}".</p>
                <button
                  type="button"
                  className="help-empty-reset"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  <RotateCcw size={13} /> View All Questions
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = expandedFaq === faq.id;
                const feedback = faqFeedback[faq.id];
                return (
                  <div key={faq.id} className={`help-faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="help-faq-question-btn"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-text">
                        <span className="faq-cat-tag">
                          {FAQ_CATEGORIES.find((c) => c.id === faq.category)?.label || 'General'}
                        </span>
                        {faq.question}
                      </span>
                      <span className="faq-toggle-icon">
                        <ChevronDown size={18} className={`chevron ${isOpen ? 'rotated' : ''}`} />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="help-faq-answer-pane">
                        <p>{faq.answer}</p>

                        <div className="help-faq-footer">
                          <div className="faq-helpful-prompt">
                            <span>Was this answer helpful?</span>
                            <button
                              type="button"
                              className={`faq-vote-btn ${feedback === 'yes' ? 'voted' : ''}`}
                              onClick={() => handleFeedback(faq.id, 'yes')}
                              aria-label="Vote helpful"
                            >
                              <ThumbsUp size={12} /> Yes
                            </button>
                            <button
                              type="button"
                              className={`faq-vote-btn ${feedback === 'no' ? 'voted' : ''}`}
                              onClick={() => handleFeedback(faq.id, 'no')}
                              aria-label="Vote not helpful"
                            >
                              <ThumbsDown size={12} /> No
                            </button>
                            {feedback && <span className="faq-vote-ack">Thank you for your feedback!</span>}
                          </div>
                          <span className="faq-verified-stamp">
                            <ShieldCheck size={13} /> Verified by Master Detailing Supervisor
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Concierge Inquiry Ticket Dispatch Section */}
        <section className="help-ticket-section" id="inquiry">
          <div className="help-ticket-grid">
            <div className="help-ticket-info">
              <span className="help-eyebrow">Priority Dispatch</span>
              <h2>Submit a Direct Studio Inquiry</h2>
              <p>
                Have a bespoke requirement, complex paint question, or fleet inquiry? Submit your details directly to our studio supervisors.
              </p>

              <div className="ticket-assurances">
                <div className="assurance-row">
                  <div className="assurance-check">
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <div>
                    <strong>15-Minute Guaranteed Response</strong>
                    <span>Our bay lead will call or message back immediately during studio operating hours.</span>
                  </div>
                </div>

                <div className="assurance-row">
                  <div className="assurance-check">
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <div>
                    <strong>Direct Master Detailer Review</strong>
                    <span>No generic bots. Every request is inspected by a certified chemical & paint specialist.</span>
                  </div>
                </div>

                <div className="assurance-row">
                  <div className="assurance-check">
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <div>
                    <strong>Complimentary Paint Thickness Consult</strong>
                    <span>Bring your car in anytime for a free ultrasonic clearcoat gauge reading.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Form / Confirmation Card */}
            <div className="help-ticket-form-card">
              {submittedTicket ? (
                <div className="ticket-success-screen">
                  <div className="ticket-success-icon">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3>Concierge Request Dispatched</h3>
                  <p className="ticket-success-num">Ticket #{submittedTicket.ticketNumber}</p>
                  <p className="ticket-success-msg">
                    Thank you, <strong>{submittedTicket.name}</strong>. Your inquiry regarding <em>"{submittedTicket.subject}"</em> has been forwarded to our Worli Studio Bay Lead. We will contact you at <strong>{submittedTicket.phone}</strong> shortly.
                  </p>
                  <div className="ticket-success-meta">
                    <span>Logged: {submittedTicket.createdAt}</span>
                    <span>Status: Dispatched to Bay Team</span>
                  </div>
                  <button type="button" className="ticket-another-btn" onClick={resetForm}>
                    <RotateCcw size={13} /> Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="ticket-form">
                  <h3>Direct Studio Request</h3>

                  <div className="form-row-dual">
                    <div className="form-group">
                      <label htmlFor="ticket-name">Full Name *</label>
                      <input
                        id="ticket-name"
                        type="text"
                        placeholder="e.g. Rohit Sharma"
                        value={ticketForm.name}
                        onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="ticket-phone">Phone / WhatsApp *</label>
                      <input
                        id="ticket-phone"
                        type="tel"
                        placeholder="e.g. +91 98200 12345"
                        value={ticketForm.phone}
                        onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-dual">
                    <div className="form-group">
                      <label htmlFor="ticket-email">Email Address</label>
                      <input
                        id="ticket-email"
                        type="email"
                        placeholder="rohit@example.com"
                        value={ticketForm.email}
                        onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="ticket-vehicle">Vehicle Make & Model</label>
                      <input
                        id="ticket-vehicle"
                        type="text"
                        placeholder="e.g. Toyota Fortuner, Thar Roxx"
                        value={ticketForm.vehicleModel}
                        onChange={(e) => setTicketForm({ ...ticketForm, vehicleModel: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="ticket-subject">Inquiry Subject *</label>
                    <select
                      id="ticket-subject"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    >
                      <option value="Appointment Rescheduling & Booking Advice">Appointment Rescheduling & Booking Advice</option>
                      <option value="9H Ceramic Matrix Warranty Claim">9H Ceramic Matrix Warranty Claim</option>
                      <option value="Technical Clearcoat & Scratch Advice">Technical Clearcoat & Scratch Advice</option>
                      <option value="Doorstep VIP Pickup & Transport">Doorstep VIP Pickup & Transport</option>
                      <option value="Store Product Delivery & Inquiries">Store Product Delivery & Inquiries</option>
                      <option value="Corporate Fleet Detailing Package">Corporate Fleet Detailing Package</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="ticket-message">Message Details *</label>
                    <textarea
                      id="ticket-message"
                      rows="4"
                      placeholder="Describe your question, paint condition, or preferred appointment time..."
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="ticket-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Dispatching to Bay Team...' : (
                      <>
                        <Send size={15} /> Dispatch to Studio Concierge <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Studio Bay Locations Clean-Room Directory */}
        <section className="help-locations-section" id="locations">
          <div className="help-section-head">
            <span className="help-eyebrow">Studio Clean-Room Bays</span>
            <h2>Visit Our Facilities</h2>
            <p>Purpose-built optical inspection clean-rooms equipped with 0-PPM water generators and infrared baking lamps.</p>
          </div>

          <div className="help-locations-grid">
            <div className="help-location-card">
              <div className="location-card-head">
                <MapPin size={20} className="location-pin" />
                <div>
                  <h3>Mumbai Flagship Studio</h3>
                  <span className="location-sub">Central Clean-Room Bay Hub</span>
                </div>
              </div>
              <p className="location-address">
                Plot 14-B, G-Block, Bandra Kurla Complex (BKC) / Lower Parel Access Road, Mumbai, Maharashtra 400051
              </p>
              <div className="location-specs">
                <span>✓ 4 Isolated Dust-Free Detailing Bays</span>
                <span>✓ Short-Wave Infrared Paint Curing Tunnels</span>
                <span>✓ Private Client Lounge with Single-Origin Espresso</span>
                <span>✓ High-Speed EV Fast Chargers (CCS2)</span>
              </div>
              <div className="location-actions">
                <a
                  href="https://maps.google.com/?q=Bandra+Kurla+Complex+Mumbai"
                  target="_blank"
                  rel="noreferrer"
                  className="location-btn"
                >
                  <MapPin size={13} /> Open in Google Maps <ExternalLink size={12} />
                </a>
                <span className="location-hours">Open Daily: 8 AM – 8:30 PM</span>
              </div>
            </div>

            <div className="help-location-card">
              <div className="location-card-head">
                <MapPin size={20} className="location-pin" />
                <div>
                  <h3>Pune Master Studio Bay</h3>
                  <span className="location-sub">High-Precision Detailing Suite</span>
                </div>
              </div>
              <p className="location-address">
                North Main Road, Near Lane 5, Koregaon Park, Pune, Maharashtra 411001
              </p>
              <div className="location-specs">
                <span>✓ 3 Ceramic Matrix Application Chambers</span>
                <span>✓ 320°F Thermal Steam Sanitization Bays</span>
                <span>✓ High-Resolution Paint Defect Inspection Lighting</span>
                <span>✓ Secure Over-Night Vehicle Storage</span>
              </div>
              <div className="location-actions">
                <a
                  href="https://maps.google.com/?q=Koregaon+Park+Pune"
                  target="_blank"
                  rel="noreferrer"
                  className="location-btn"
                >
                  <MapPin size={13} /> Open in Google Maps <ExternalLink size={12} />
                </a>
                <span className="location-hours">Open Daily: 8:30 AM – 8:00 PM</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterReviews
        onOpenBooking={onOpenBooking}
        onNavigate={onNavigate}
      />
    </div>
  );
};
