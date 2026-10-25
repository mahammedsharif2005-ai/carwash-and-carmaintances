import React, { useMemo, useState } from 'react';
import {
  CalendarDays, CarFront, ChevronDown, CircleDollarSign, Download,
  Package, Search, Users,
} from 'lucide-react';
import { BookingsTable, EmptyState, MetricCard } from '../components/AdminDataViews';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const dateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const todayKey = () => dateKey(new Date());
const dateLabel = (value) => new Date(value).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});

const ServiceBookingsPage = ({ bookings, bookingSummary, saving, onStatusChange }) => {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const today = new Date();
    const rangeStart = dateRange === 'today' ? today
      : dateRange === '7days' ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
        : dateRange === '30days' ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)
          : null;
    const startKey = rangeStart ? dateKey(rangeStart) : '';
    return bookings.filter((booking) => {
      const matchesSearch = !query || [
        booking.customerName, booking.email, booking.phone, booking.vehicle, booking.packageName,
      ].some((value) => String(value || '').toLowerCase().includes(query));
      const createdKey = dateKey(booking.createdAt);
      return matchesSearch && (!startKey || (createdKey && createdKey >= startKey));
    });
  }, [bookings, search, dateRange]);

  const todayBookings = bookings.filter((booking) => dateKey(booking.createdAt) === todayKey());
  const todayBookingValue = todayBookings
    .filter((booking) => booking.status !== 'rejected')
    .reduce((sum, booking) => sum + Number(booking.total || 0), 0);

  const serviceBreakdown = useMemo(() => {
    const services = new Map();
    filteredBookings.forEach((booking) => {
      const service = services.get(booking.packageId) || {
        id: booking.packageId || booking.packageName,
        name: booking.packageName,
        count: 0,
        value: 0,
      };
      service.count += 1;
      if (booking.status !== 'rejected') service.value += Number(booking.total || 0);
      services.set(service.id, service);
    });
    return [...services.values()].sort((a, b) => b.count - a.count);
  }, [filteredBookings]);

  const dailyBookingValues = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return {
        key: dateKey(date),
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateLabel: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        value: 0,
      };
    });
    const byDay = new Map(days.map((day) => [day.key, day]));
    bookings.forEach((booking) => {
      const day = byDay.get(dateKey(booking.createdAt));
      if (day && booking.status !== 'rejected') day.value += Number(booking.total || 0);
    });
    return days;
  }, [bookings]);
  const maxDailyBookingValue = Math.max(...dailyBookingValues.map((day) => day.value), 1);
  const estimatedValue = filteredBookings
    .filter((booking) => booking.status !== 'rejected')
    .reduce((sum, booking) => sum + Number(booking.total || 0), 0);

  const exportBookings = () => {
    const columns = ['Customer name', 'Phone', 'Email', 'Vehicle', 'Service', 'Booking date', 'Appointment date', 'Appointment time', 'Estimated value', 'Status'];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = filteredBookings.map((booking) => [
      booking.customerName, booking.phone, booking.email, booking.vehicle,
      booking.packageName, dateLabel(booking.createdAt), booking.appointmentDate,
      booking.appointmentTime, booking.total, booking.status,
    ]);
    const csv = [columns, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `service-bookings-${todayKey()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="admin-service-summary">
        <MetricCard icon={Package} label="Service bookings" value={bookingSummary.total} note="All customer reservations" tone="dark" />
        <MetricCard icon={Users} label="Unique customers" value={bookingSummary.uniqueCustomers} note="By customer email" tone="blue" />
        <MetricCard icon={CarFront} label="Car wash requests" value={bookingSummary.carWashRequests} note="Wash package bookings" tone="green" />
        <MetricCard icon={CircleDollarSign} label="Today's service income" value={money(todayBookingValue)} note="Booking estimate; excludes rejected" tone="amber" />
      </div>
      <div className="admin-booking-analytics">
        <section className="admin-analytics-card">
          <div className="admin-analytics-heading"><div><h3>Daily service income</h3><p>Estimated value of requests created in the last 7 days</p></div><span className="admin-analytics-badge"><CalendarDays size={13} /> 7 days</span></div>
          <div className="admin-revenue-chart" role="img" aria-label="Daily estimated booking value for the last seven days">
            {dailyBookingValues.map((day) => (
              <div className="admin-chart-column" key={day.key}>
                <span className="admin-chart-value">{day.value ? money(day.value) : '—'}</span>
                <div className="admin-chart-bar-track"><div className="admin-chart-bar" style={{ height: `${day.value ? Math.max(8, day.value / maxDailyBookingValue * 100) : 0}%` }} /></div>
                <b>{day.label}</b><small>{day.dateLabel}</small>
              </div>
            ))}
          </div>
          <p className="admin-analytics-disclaimer">Booking estimates, not payment records. Rejected requests are excluded.</p>
        </section>
        <section className="admin-analytics-card">
          <div className="admin-analytics-heading"><div><h3>Service demand</h3><p>Bookings by selected service package</p></div><span className="admin-analytics-badge">{serviceBreakdown.length} services</span></div>
          <div className="admin-service-breakdown">
            {serviceBreakdown.length ? serviceBreakdown.map((service) => (
              <div className="admin-service-breakdown-row" key={service.id}>
                <span className="admin-service-dot" />
                <span className="admin-service-breakdown-name">{service.name}<small>{service.count} booking{service.count === 1 ? '' : 's'}</small></span>
                <b>{money(service.value)}</b>
              </div>
            )) : <p className="admin-analytics-empty">Service package counts will appear after customers book.</p>}
          </div>
        </section>
      </div>
      <div className="admin-bookings-toolbar">
        <div className="admin-bookings-toolbar-stats"><span><b>{filteredBookings.length}</b> requests shown</span><span><b>{money(estimatedValue)}</b> estimated value</span></div>
        <div className="admin-booking-filters">
          <label className="admin-date-filter"><CalendarDays size={15} /><select value={dateRange} onChange={(event) => setDateRange(event.target.value)} aria-label="Filter bookings by date"><option value="today">Today</option><option value="7days">Last 7 days</option><option value="30days">Last 30 days</option><option value="all">All dates</option></select><ChevronDown size={13} /></label>
          <button className="admin-export-btn" onClick={exportBookings} disabled={!filteredBookings.length}><Download size={15} /> Export CSV</button>
        </div>
      </div>
      <section className="admin-panel admin-orders-panel">
        <div className="admin-panel-heading">
          <div><h2>Customer service requests <span className="admin-total-count">{filteredBookings.length}</span></h2><p>{bookingSummary.carWashRequests} car wash requests from {bookingSummary.uniqueCustomers} unique customers overall.</p></div>
          <div className="admin-order-tools"><label className="admin-search"><Search size={16} /><input placeholder="Search customers or service…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
        </div>
        <BookingsTable bookings={filteredBookings} saving={saving} onStatusChange={onStatusChange} />
        {filteredBookings.length === 0 && <EmptyState title={bookings.length ? 'No matching bookings' : 'No service bookings yet'} text={bookings.length ? 'Try another date, customer, vehicle, or service name.' : 'Customer reservations will show here after they are submitted.'} />}
      </section>
    </>
  );
};

export default ServiceBookingsPage;
