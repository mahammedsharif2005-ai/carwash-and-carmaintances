import React, { useEffect, useState } from 'react';
import { X, Check, Calendar, Clock, Car, Sparkles } from 'lucide-react';
import { SERVICE_PACKAGES, SERVICE_ADDONS } from '../data/carsData';

export const BookingModal = ({ isOpen, onClose, selectedCar, defaultServiceId, customer, onConfirmBooking }) => {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(defaultServiceId || 'ceramic-spa');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [vehicleType, setVehicleType] = useState('Full-Size SUV (Thar / Fortuner)');
  const [selectedDate, setSelectedDate] = useState('Tomorrow, Oct 21');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingNumber, setBookingNumber] = useState('');

  useEffect(() => {
    if (isOpen && customer) {
      setCustomerName(customer.name || '');
      setCustomerEmail(customer.email || '');
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const activePkg = SERVICE_PACKAGES.find((p) => p.id === selectedPackage) || SERVICE_PACKAGES[1];
  
  const calculateTotal = () => {
    let total = activePkg.price;
    selectedAddons.forEach((addonId) => {
      const addon = SERVICE_ADDONS.find((a) => a.id === addonId);
      if (addon) total += addon.price;
    });
    if (vehicleType.includes('Full-Size SUV')) total += 300;
    return total;
  };

  const toggleAddon = (id) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter((item) => item !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);
    try {
      const result = await onConfirmBooking({
        customerName,
        email: customerEmail,
        phone: customerPhone,
        vehicle: `${selectedCar?.name || ''} ${selectedCar?.model || ''}`.trim(),
        vehicleType,
        packageId: activePkg.id,
        addonIds: selectedAddons,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
      });
      setBookingNumber(`UNQ-${String(result.booking.id).padStart(6, '0')}`);
      setBookingConfirmed(true);
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setBookingConfirmed(false);
    setBookingError('');
    setBookingNumber('');
    setStep(1);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleResetAndClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleResetAndClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {!bookingConfirmed ? (
          <div>
            <div className="modal-header">
              <div className="modal-badge">
                <Sparkles size={14} /> VIP Concierge Booking
              </div>
              <h2 className="modal-title">Book Auto Spa & Maintenance</h2>
              <p className="modal-subtitle">
                Treating your <strong>{selectedCar?.name} {selectedCar?.model}</strong> with precision 0-PPM deionized water & Swiss ceramic care.
              </p>
            </div>

            {/* Stepper */}
            <div className="modal-steps">
              <button
                className={`step-btn ${step === 1 ? 'active' : ''}`}
                onClick={() => setStep(1)}
              >
                1. Select Services
              </button>
              <button
                className={`step-btn ${step === 2 ? 'active' : ''}`}
                onClick={() => setStep(2)}
              >
                2. Schedule & Details
              </button>
            </div>

            {step === 1 && (
              <div className="modal-body-step">
                {/* Vehicle Class */}
                <div className="modal-section">
                  <label className="section-label">Vehicle Category</label>
                  <div className="vehicle-pills">
                    {['Hatchback / Compact', 'Sedan / Saloon', 'Compact SUV / Creta', 'Full-Size SUV (Thar / Fortuner)'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`pill-btn ${vehicleType === type ? 'active' : ''}`}
                        onClick={() => setVehicleType(type)}
                      >
                        <Car size={15} />
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Package */}
                <div className="modal-section">
                  <label className="section-label">Care Package</label>
                  <div className="package-options-grid">
                    {SERVICE_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`package-card-option ${selectedPackage === pkg.id ? 'active' : ''}`}
                        onClick={() => setSelectedPackage(pkg.id)}
                      >
                        <div className="package-card-header">
                          <div>
                            <div className="package-name">{pkg.name}</div>
                            <div className="package-time"><Clock size={12} /> {pkg.duration}</div>
                          </div>
                          <div className="package-price">₹{pkg.price.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="package-desc">{pkg.subtitle}</div>
                        {selectedPackage === pkg.id && (
                          <div className="check-mark">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="modal-section">
                  <label className="section-label">Indian Monsoon & Engine Enhancements</label>
                  <div className="addons-grid">
                    {SERVICE_ADDONS.map((addon) => {
                      const isChecked = selectedAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          className={`addon-pill ${isChecked ? 'active' : ''}`}
                          onClick={() => toggleAddon(addon.id)}
                        >
                          <div className={`addon-checkbox ${isChecked ? 'checked' : ''}`}>
                            {isChecked && <Check size={12} />}
                          </div>
                          <span className="addon-title">{addon.name}</span>
                          <span className="addon-price">+₹{addon.price.toLocaleString('en-IN')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="modal-footer-action">
                  <div className="total-summary">
                    <span className="summary-label">Estimated Investment</span>
                    <span className="summary-amount">₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                  <button className="primary-pill-btn" onClick={() => setStep(2)}>
                    Next: Choose Date & Time →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleConfirm} className="modal-body-step">
                <div className="modal-section">
                  <label className="section-label">Pick Appointment Date</label>
                  <div className="date-options">
                    {['Tomorrow, Oct 21', 'Wednesday, Oct 22', 'Thursday, Oct 23', 'Friday, Oct 24'].map((d) => (
                      <button
                        type="button"
                        key={d}
                        className={`date-pill ${selectedDate === d ? 'active' : ''}`}
                        onClick={() => setSelectedDate(d)}
                      >
                        <Calendar size={14} /> {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-section">
                  <label className="section-label">Preferred Time Slot</label>
                  <div className="time-options">
                    {['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '05:00 PM'].map((t) => (
                      <button
                        type="button"
                        key={t}
                        className={`time-pill ${selectedTime === t ? 'active' : ''}`}
                        onClick={() => setSelectedTime(t)}
                      >
                        <Clock size={13} /> {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-section">
                  <label className="section-label">Contact Information</label>
                  <div className="input-grid">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      className="modal-input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <input
                      type="tel"
                      required
                      placeholder="+91 Mobile Number (for Bay SMS update)"
                      className="modal-input"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      className="modal-input full-width"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Summary bar */}
                <div className="booking-review-card">
                  <div className="review-row">
                    <span>Vehicle:</span>
                    <strong>{selectedCar?.name} {selectedCar?.model} ({vehicleType})</strong>
                  </div>
                  <div className="review-row">
                    <span>Selected Package:</span>
                    <strong>{activePkg.name} (₹{activePkg.price.toLocaleString('en-IN')})</strong>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="review-row">
                      <span>Add-ons ({selectedAddons.length}):</span>
                      <strong>
                        {selectedAddons
                          .map((id) => SERVICE_ADDONS.find((a) => a.id === id)?.name)
                          .join(', ')}
                      </strong>
                    </div>
                  )}
                  <div className="review-row highlight">
                    <span>Scheduled Arrival:</span>
                    <strong>{selectedDate} at {selectedTime}</strong>
                  </div>
                  <div className="review-divider"></div>
                  <div className="review-row total">
                    <span>Total Due At Bay:</span>
                    <span className="total-digits">₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="modal-footer-action">
                  <button type="button" className="secondary-pill-btn" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className="primary-pill-btn" disabled={bookingLoading}>
                    {bookingLoading ? 'Saving reservation…' : 'Confirm Bay Reservation'}
                  </button>
                </div>
                {bookingError && <p className="booking-submit-error" role="alert">{bookingError}</p>}
              </form>
            )}
          </div>
        ) : (
          <div className="modal-success-screen">
            <div className="success-icon-bubble">
              <Check size={40} />
            </div>
            <h2 className="success-title">Reservation Confirmed!</h2>
            <p className="success-subtitle">
              We have reserved Service Bay #2 at <strong>Unique Auto Spa India</strong> for your{' '}
              <strong>{selectedCar?.name} {selectedCar?.model}</strong>.
            </p>

            <div className="ticket-card">
              <div className="ticket-header">
                <span>UNIQUE AUTO SPA PASS</span>
                <span className="ticket-code">#{bookingNumber}</span>
              </div>
              <div className="ticket-body">
                <div>
                  <div className="ticket-label">TIME & DATE</div>
                  <div className="ticket-val">{selectedDate} — {selectedTime}</div>
                </div>
                <div>
                  <div className="ticket-label">SERVICE PACKAGE</div>
                  <div className="ticket-val">{activePkg.name}</div>
                </div>
                <div>
                  <div className="ticket-label">CLIENT</div>
                  <div className="ticket-val">{customerName || 'VIP Guest'}</div>
                </div>
                <div>
                  <div className="ticket-label">TOTAL ESTIMATE</div>
                  <div className="ticket-val gold">₹{calculateTotal().toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="ticket-footer">
                <Sparkles size={14} /> Complimentary air-conditioned customer lounge with Wi-Fi & tea/coffee while your car is serviced.
              </div>
            </div>

            <button className="primary-pill-btn" onClick={handleResetAndClose}>
              Done & Return to Showroom
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
