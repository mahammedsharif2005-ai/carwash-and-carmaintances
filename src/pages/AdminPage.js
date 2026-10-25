import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowRight, BadgePercent, Bell,
  CalendarDays, CarFront, Check, CheckCircle2, ChevronDown, CircleDollarSign, Clock3, Download, Eye, LayoutDashboard,
  LogOut, Menu, Package, Plus, Search, Settings2, ShieldCheck, ShoppingBag,
  Tag, Users, X,
} from 'lucide-react';
import {
  createDiscount, deleteDiscount, getDiscounts, getOrders, updateDiscount,
  getServiceBookings, updateOrderStatus, updateServiceBookingStatus,
} from '../services/api';
import { Toast } from '../components/Toast';
import './AdminPage.css';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const dateLabel = (value) => new Date(value).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});
const dateKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const dateOffset = (days) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
};
const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'bookings', label: 'Service bookings', icon: Package },
  { id: 'discounts', label: 'Discounts', icon: BadgePercent },
];

const AdminPage = ({ onNavigate, onSignOut }) => {
  const [section, setSection] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingSummary, setBookingSummary] = useState({ total: 0, uniqueCustomers: 0, carWashRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [bookingDateRange, setBookingDateRange] = useState('all');
  const [saving, setSaving] = useState(false);
  const [discountForm, setDiscountForm] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [orderData, discountData, bookingData] = await Promise.all([
        getOrders(), getDiscounts(), getServiceBookings(),
      ]);
      setOrders(orderData.orders);
      setDiscounts(discountData.discounts);
      setBookings(bookingData.bookings);
      setBookingSummary(bookingData.summary);
    } catch (loadError) {
      if (loadError.status === 401) {
        onSignOut();
        return;
      }
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [onSignOut]);

  useEffect(() => { refresh(); }, [refresh]);

  const summary = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    approved: orders.filter((order) => order.status === 'approved').length,
    revenue: orders.filter((order) => order.status !== 'rejected')
      .reduce((sum, order) => sum + Number(order.total), 0),
  }), [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) =>
      [order.orderNumber, order.customerName, order.email, order.phone]
        .some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [orders, search]);

  const changeStatus = async (orderId, status) => {
    setSaving(true);
    setError('');
    try {
      const { order } = await updateOrderStatus(orderId, status);
      setOrders((existing) => existing.map((item) => item.id === order.id ? { ...item, ...order } : item));
    } catch (updateError) {
      if (updateError.status === 401) onSignOut();
      else setError(updateError.message);
    } finally {
      setSaving(false);
    }
  };

  const changeBookingStatus = async (bookingId, status) => {
    setSaving(true);
    setError('');
    try {
      const { booking } = await updateServiceBookingStatus(bookingId, status);
      setBookings((existing) => existing.map((item) => item.id === booking.id ? { ...item, ...booking } : item));
    } catch (updateError) {
      if (updateError.status === 401) onSignOut();
      else setError(updateError.message);
    } finally {
      setSaving(false);
    }
  };

  const saveDiscount = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      code: discountForm.code.trim().toUpperCase(),
      discountType: discountForm.discountType,
      discountValue: Number(discountForm.discountValue),
      minimumOrder: Number(discountForm.minimumOrder || 0),
      usageLimit: discountForm.usageLimit === '' ? null : Number(discountForm.usageLimit),
      active: Boolean(discountForm.active),
      expiresAt: discountForm.expiresAt || null,
    };
    try {
      if (discountForm.id) {
        await updateDiscount(discountForm.id, payload);
      } else {
        await createDiscount(payload);
      }
      setDiscountForm(null);
      await refresh();
    } catch (saveError) {
      if (saveError.status === 401) onSignOut();
      else setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeDiscount = async (id) => {
    setSaving(true);
    setError('');
    try {
      await deleteDiscount(id);
      setDiscounts((existing) => existing.filter((discount) => discount.id !== id));
    } catch (deleteError) {
      if (deleteError.status === 401) onSignOut();
      else setError(deleteError.message);
    } finally {
      setSaving(false);
    }
  };

  const openDiscountForm = (discount = null) => setDiscountForm(discount ? {
    ...discount,
    expiresAt: discount.expiresAt ? new Date(discount.expiresAt).toISOString().slice(0, 10) : '',
    usageLimit: discount.usageLimit ?? '',
  } : {
    code: '', discountType: 'percentage', discountValue: 10,
    minimumOrder: 0, usageLimit: '', active: true, expiresAt: '',
  });

  const recentOrders = orders.slice(0, 5);
  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rangeStart = bookingDateRange === 'today' ? dateOffset(0)
      : bookingDateRange === '7days' ? dateOffset(6)
        : bookingDateRange === '30days' ? dateOffset(29) : null;
    return bookings.filter((booking) => {
      const matchesSearch = !query || [booking.customerName, booking.email, booking.phone, booking.vehicle, booking.packageName]
        .some((value) => String(value || '').toLowerCase().includes(query));
      const matchesDate = !rangeStart || new Date(booking.createdAt) >= rangeStart;
      return matchesSearch && matchesDate;
    });
  }, [bookings, search, bookingDateRange]);
  const todayBookings = bookings.filter((booking) => dateKey(booking.createdAt) === dateKey(new Date()));
  const todayBookingValue = todayBookings
    .filter((booking) => booking.status !== 'rejected')
    .reduce((sum, booking) => sum + Number(booking.total), 0);
  const serviceBreakdown = useMemo(() => {
    const services = new Map();
    filteredBookings.forEach((booking) => {
      const service = services.get(booking.packageId) || {
        id: booking.packageId, name: booking.packageName, count: 0, value: 0,
      };
      service.count += 1;
      if (booking.status !== 'rejected') service.value += Number(booking.total);
      services.set(booking.packageId, service);
    });
    return [...services.values()].sort((a, b) => b.count - a.count);
  }, [filteredBookings]);
  const dailyBookingValues = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = dateOffset(6 - index);
      return {
        key: dateKey(date),
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateLabel: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        value: 0,
        bookings: 0,
      };
    });
    const byDay = new Map(days.map((day) => [day.key, day]));
    bookings.forEach((booking) => {
      const day = byDay.get(dateKey(booking.createdAt));
      if (day) {
        day.bookings += 1;
        if (booking.status !== 'rejected') day.value += Number(booking.total);
      }
    });
    return days;
  }, [bookings]);
  const maxDailyBookingValue = Math.max(...dailyBookingValues.map((day) => day.value), 1);

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
    link.download = `service-bookings-${dateKey(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`admin-shell ${sidebarCollapsed ? 'admin-shell-sidebar-collapsed' : ''}`}>
      <aside className={`admin-sidebar ${mobileNavOpen ? 'admin-sidebar-open' : ''}`}>
        <div className="admin-brand">
          <span className="admin-brand-mark"><span>U</span></span>
          <span><strong>UNIQUE</strong><small>SHOWROOM ADMIN</small></span>
          <button className="admin-mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X size={19} /></button>
        </div>
        <div className="admin-side-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`admin-nav-item ${section === id ? 'active' : ''}`} title={label} aria-current={section === id ? 'page' : undefined} onClick={() => { setSection(id); setMobileNavOpen(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {id === 'orders' && summary.pending > 0 && <span className="admin-nav-count">{summary.pending}</span>}
              {id === 'bookings' && bookingSummary.total > 0 && <span className="admin-nav-count">{bookingSummary.total}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-store-link">
            <span className="admin-store-icon"><ShieldCheck size={17} /></span>
            <span><b>Store status</b><small><i /> Open and accepting orders</small></span>
          </div>
          <button className="admin-nav-item admin-back-store" title="Sign out" onClick={onSignOut}><LogOut size={17} /><span>Sign out</span></button>
        </div>
      </aside>
      {mobileNavOpen && <button className="admin-nav-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-toggle"
            aria-label="Toggle sidebar navigation"
            title="Toggle sidebar navigation"
            onClick={() => {
              if (window.innerWidth <= 760) {
                setMobileNavOpen((open) => !open);
              } else {
                setSidebarCollapsed((collapsed) => !collapsed);
              }
            }}
          ><Menu size={21} /></button>
          <div className="admin-breadcrumb">Unique Showroom <span>/</span> <b>{NAV_ITEMS.find((item) => item.id === section)?.label}</b></div>
          <div className="admin-top-actions">
            <button className="admin-icon-btn" aria-label="Notifications"><Bell size={18} /><i /></button>
            <div className="admin-profile"><div className="admin-avatar">A</div><span><b>Admin</b><small>Store manager</small></span><ChevronDown size={14} /></div>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading">
            <div>
              <div className="admin-eyebrow"><span /> SHOWROOM MANAGEMENT</div>
              <h1>{section === 'overview' ? 'Good morning, Admin' : section === 'orders' ? 'Orders' : section === 'bookings' ? 'Service bookings' : 'Discounts'}</h1>
              <p>{section === 'overview' ? 'Here’s what’s happening at your store today.' : section === 'orders' ? 'Review, approve, and keep track of customer orders.' : section === 'bookings' ? 'See who requested a wash or service and manage reservations.' : 'Create and manage promotional codes for your store.'}</p>
            </div>
            <div className="admin-heading-actions">
              <button className="admin-date-pill"><Clock3 size={15} /> All time <ChevronDown size={14} /></button>
              <button className="admin-refresh-btn" onClick={refresh} aria-label="Refresh dashboard"><Activity size={16} /></button>
            </div>
          </div>

          {error && (
            <Toast
              message={error}
              title="Backend Connection Alert"
              type="error"
              onClose={() => setError('')}
              duration={8000}
            />
          )}
          {error && <div className="admin-error" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
          {loading ? (
            <div className="admin-loading"><span className="admin-spinner" /> Loading store data…</div>
          ) : (
            <>
              {section === 'overview' && (
                <>
                  <div className="admin-metrics-grid">
                    <MetricCard icon={ShoppingBag} label="Total orders" value={summary.total} note="All orders received" tone="dark" />
                    <MetricCard icon={Clock3} label="Awaiting approval" value={summary.pending} note="Needs your attention" tone="amber" />
                    <MetricCard icon={CheckCircle2} label="Approved orders" value={summary.approved} note="Ready for fulfilment" tone="green" />
                    <MetricCard icon={CircleDollarSign} label="Order value" value={money(summary.revenue)} note="Excludes rejected orders" tone="blue" />
                  </div>
                  <section className="admin-panel admin-overview-orders">
                    <div className="admin-panel-heading"><div><h2>Recent orders</h2><p>Latest customer purchases</p></div><button className="admin-text-link" onClick={() => setSection('orders')}>View all orders <ArrowRight size={15} /></button></div>
                    <OrdersTable orders={recentOrders} saving={saving} onStatusChange={changeStatus} onView={setViewingOrder} compact />
                    {orders.length === 0 && <EmptyState title="No orders yet" text="Orders placed in the maintenance store will appear here." />}
                  </section>
                  <section className="admin-highlight-banner">
                    <div className="admin-highlight-icon"><Tag size={21} /></div>
                    <div><b>Give customers a reason to come back</b><span>Set up a discount code to encourage the next purchase.</span></div>
                    <button onClick={() => { setSection('discounts'); openDiscountForm(); }}>Create discount <ArrowRight size={15} /></button>
                  </section>
                </>
              )}
              {section === 'orders' && (
                <section className="admin-panel admin-orders-panel">
                  <div className="admin-panel-heading"><div><h2>All orders <span className="admin-total-count">{orders.length}</span></h2><p>Approve incoming orders and update fulfilment status.</p></div><div className="admin-order-tools"><label className="admin-search"><Search size={16} /><input placeholder="Search orders…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div></div>
                  <OrdersTable orders={filteredOrders} saving={saving} onStatusChange={changeStatus} onView={setViewingOrder} />
                  {filteredOrders.length === 0 && <EmptyState title={orders.length ? 'No matching orders' : 'No orders yet'} text={orders.length ? 'Try another name, email, or order number.' : 'New customer checkouts will show up here.'} />}
                </section>
              )}
              {section === 'bookings' && (
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
                    <div className="admin-bookings-toolbar-stats"><span><b>{filteredBookings.length}</b> requests shown</span><span><b>{money(filteredBookings.filter((booking) => booking.status !== 'rejected').reduce((sum, booking) => sum + Number(booking.total), 0))}</b> estimated value</span></div>
                    <div className="admin-booking-filters">
                      <label className="admin-date-filter"><CalendarDays size={15} /><select value={bookingDateRange} onChange={(event) => setBookingDateRange(event.target.value)} aria-label="Filter bookings by date"><option value="today">Today</option><option value="7days">Last 7 days</option><option value="30days">Last 30 days</option><option value="all">All dates</option></select><ChevronDown size={13} /></label>
                      <button className="admin-export-btn" onClick={exportBookings} disabled={!filteredBookings.length}><Download size={15} /> Export CSV</button>
                    </div>
                  </div>
                  <section className="admin-panel admin-orders-panel">
                    <div className="admin-panel-heading"><div><h2>Customer service requests <span className="admin-total-count">{filteredBookings.length}</span></h2><p>{bookingSummary.carWashRequests} car wash requests from {bookingSummary.uniqueCustomers} unique customers overall.</p></div><div className="admin-order-tools"><label className="admin-search"><Search size={16} /><input placeholder="Search customers or service…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div></div>
                    <BookingsTable bookings={filteredBookings} saving={saving} onStatusChange={changeBookingStatus} />
                    {filteredBookings.length === 0 && <EmptyState title={bookings.length ? 'No matching bookings' : 'No service bookings yet'} text={bookings.length ? 'Try another date, customer, vehicle, or service name.' : 'Customer reservations will show here after they are submitted.'} />}
                  </section>
                </>
              )}
              {section === 'discounts' && (
                <>
                  <div className="admin-discount-summary">
                    <div><span className="admin-summary-icon"><BadgePercent size={19} /></span><span><small>Discount codes</small><b>{discounts.length}</b></span></div>
                    <div><span className="admin-summary-icon admin-summary-green"><Check size={19} /></span><span><small>Active offers</small><b>{discounts.filter((item) => item.active).length}</b></span></div>
                    <button className="admin-primary-btn" onClick={() => openDiscountForm()}><Plus size={17} /> Create discount</button>
                  </div>
                  <section className="admin-panel">
                    <div className="admin-panel-heading"><div><h2>Your discount codes</h2><p>Customers can enter these codes during checkout.</p></div></div>
                    <div className="admin-discount-list">
                      {discounts.map((discount) => (
                        <div className="admin-discount-row" key={discount.id}>
                          <div className="admin-coupon-symbol"><BadgePercent size={20} /></div>
                          <div className="admin-coupon-main"><b>{discount.code}</b><span>{discount.discountType === 'percentage' ? `${discount.discountValue}% off` : `${money(discount.discountValue)} off`} {Number(discount.minimumOrder) > 0 && `· min. order ${money(discount.minimumOrder)}`}</span></div>
                          <div className={`admin-status-pill ${discount.active ? 'status-approved' : 'status-rejected'}`}><i />{discount.active ? 'Active' : 'Inactive'}</div>
                          <span className="admin-coupon-usage">{discount.usageCount || 0}{discount.usageLimit ? ` / ${discount.usageLimit}` : ''} uses</span>
                          <span className="admin-coupon-date">{discount.expiresAt ? `Ends ${dateLabel(discount.expiresAt)}` : 'No expiry'}</span>
                          <div className="admin-row-actions"><button onClick={() => openDiscountForm(discount)} aria-label={`Edit ${discount.code}`}><Settings2 size={16} /></button><button onClick={() => removeDiscount(discount.id)} aria-label={`Delete ${discount.code}`}><X size={16} /></button></div>
                        </div>
                      ))}
                    </div>
                    {discounts.length === 0 && <EmptyState title="No discount codes" text="Create your first offer to make it available at checkout." action={<button className="admin-primary-btn" onClick={() => openDiscountForm()}><Plus size={16} /> Create discount</button>} />}
                  </section>
                  <div className="admin-discount-note"><ShieldCheck size={17} /><span>Discounts are checked and calculated by the backend when an order is placed.</span></div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {discountForm && (
        <div className="admin-modal-backdrop" onClick={(event) => event.target === event.currentTarget && setDiscountForm(null)}>
          <form className="admin-discount-modal" onSubmit={saveDiscount}>
            <div className="admin-modal-heading"><div><span className="admin-modal-icon"><BadgePercent size={20} /></span><span><h2>{discountForm.id ? 'Edit discount' : 'Create discount'}</h2><p>Set an offer customers can use at checkout.</p></span></div><button type="button" onClick={() => setDiscountForm(null)} aria-label="Close"><X size={19} /></button></div>
            <label>Discount code<input required maxLength="32" value={discountForm.code} onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })} placeholder="e.g. WELCOME10" /></label>
            <div className="admin-form-grid">
              <label>Discount type<select value={discountForm.discountType} onChange={(e) => setDiscountForm({ ...discountForm, discountType: e.target.value })}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed amount (₹)</option></select></label>
              <label>Discount value<input type="number" min="1" step="0.01" required value={discountForm.discountValue} onChange={(e) => setDiscountForm({ ...discountForm, discountValue: e.target.value })} /></label>
            </div>
            <div className="admin-form-grid">
              <label>Minimum order (₹)<input type="number" min="0" step="1" value={discountForm.minimumOrder} onChange={(e) => setDiscountForm({ ...discountForm, minimumOrder: e.target.value })} /></label>
              <label>Usage limit<input type="number" min="1" step="1" placeholder="Unlimited" value={discountForm.usageLimit} onChange={(e) => setDiscountForm({ ...discountForm, usageLimit: e.target.value })} /></label>
            </div>
            <label>Expiry date<input type="date" value={discountForm.expiresAt} onChange={(e) => setDiscountForm({ ...discountForm, expiresAt: e.target.value })} /></label>
            <label className="admin-toggle-label"><input type="checkbox" checked={discountForm.active} onChange={(e) => setDiscountForm({ ...discountForm, active: e.target.checked })} /><span>Make this code active</span></label>
            <div className="admin-modal-footer"><button type="button" className="admin-secondary-btn" onClick={() => setDiscountForm(null)}>Cancel</button><button className="admin-primary-btn" disabled={saving}>{saving ? 'Saving…' : discountForm.id ? 'Save changes' : 'Create code'}</button></div>
          </form>
        </div>
      )}
      {viewingOrder && (
        <div className="admin-modal-backdrop" onClick={(event) => event.target === event.currentTarget && setViewingOrder(null)}>
          <section className="admin-order-modal" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
            <div className="admin-modal-heading"><div><span className="admin-modal-icon"><ShoppingBag size={19} /></span><span><h2 id="order-detail-title">Order {viewingOrder.orderNumber}</h2><p>Placed {dateLabel(viewingOrder.createdAt)}</p></span></div><button onClick={() => setViewingOrder(null)} aria-label="Close order details"><X size={19} /></button></div>
            <div className="admin-order-customer"><div><small>CUSTOMER</small><b>{viewingOrder.customerName}</b><span>{viewingOrder.email}</span><span>{viewingOrder.phone}</span></div><div><small>DELIVERY ADDRESS</small><p>{viewingOrder.address}</p></div></div>
            <div className="admin-order-modal-items"><div className="admin-order-items-head"><b>Items ordered</b><span>{viewingOrder.items.reduce((sum, item) => sum + Number(item.quantity), 0)} items</span></div>{viewingOrder.items.map((item) => <div className="admin-order-item-row" key={item.productId}><span>{item.productName}<small>Qty {item.quantity} × {money(item.unitPrice)}</small></span><b>{money(item.unitPrice * item.quantity)}</b></div>)}</div>
            <div className="admin-order-totals"><span>Subtotal <b>{money(viewingOrder.subtotal)}</b></span>{Number(viewingOrder.discountAmount) > 0 && <span>Discount {viewingOrder.discountCode && <small>({viewingOrder.discountCode})</small>} <b>−{money(viewingOrder.discountAmount)}</b></span>}<span className="admin-order-grand-total">Total <b>{money(viewingOrder.total)}</b></span></div>
            <div className="admin-order-modal-footer"><span className={`admin-status-pill status-${viewingOrder.status}`}><i />{statusLabel(viewingOrder.status)}</span><button className="admin-secondary-btn" onClick={() => setViewingOrder(null)}>Close details</button></div>
          </section>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, note, tone }) => (
  <article className="admin-metric-card"><div className={`admin-metric-icon metric-${tone}`}><Icon size={19} /></div><span className="admin-metric-label">{label}</span><b className="admin-metric-value">{value}</b><span className="admin-metric-note"><i />{note}</span></article>
);

const OrdersTable = ({ orders, saving, onStatusChange, onView, compact = false }) => (
  <div className="admin-table-scroll">
    <table className="admin-orders-table">
      <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>ITEMS</th><th>TOTAL</th><th>STATUS</th><th>{compact ? 'ACTION' : 'UPDATE STATUS'}</th></tr></thead>
      <tbody>{orders.map((order) => (
        <tr key={order.id}>
          <td><b className="admin-order-number">{order.orderNumber}</b></td>
          <td><span className="admin-customer-name">{order.customerName}</span><small className="admin-customer-email">{order.email}</small></td>
          <td>{dateLabel(order.createdAt)}</td>
          <td>{order.items.reduce((count, item) => count + Number(item.quantity), 0)} items</td>
          <td><b>{money(order.total)}</b></td>
          <td><span className={`admin-status-pill status-${order.status}`}><i />{statusLabel(order.status)}</span></td>
          <td><div className="admin-order-actions"><button className="admin-view-btn" onClick={() => onView(order)} aria-label={`View order ${order.orderNumber}`}><Eye size={14} />View</button>{order.status === 'pending' ? <div className="admin-approve-actions"><button disabled={saving} className="admin-approve-btn" onClick={() => onStatusChange(order.id, 'approved')}><Check size={14} /> Approve</button><button disabled={saving} className="admin-reject-btn" onClick={() => onStatusChange(order.id, 'rejected')}>Reject</button></div> : <select className="admin-status-select" value={order.status} disabled={saving} onChange={(event) => onStatusChange(order.id, event.target.value)} aria-label={`Update ${order.orderNumber} status`}>{['approved', 'processing', 'shipped', 'completed', 'rejected'].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select>}</div></td>
        </tr>
      ))}</tbody>
    </table>
  </div>
);

const BookingsTable = ({ bookings, saving, onStatusChange }) => (
  <div className="admin-table-scroll">
    <table className="admin-orders-table">
      <thead><tr><th>CUSTOMER</th><th>SERVICE &amp; VEHICLE</th><th>APPOINTMENT</th><th>ESTIMATE</th><th>STATUS</th><th>UPDATE</th></tr></thead>
      <tbody>{bookings.map((booking) => (
        <tr key={booking.id}>
          <td><span className="admin-customer-name">{booking.customerName}</span><small className="admin-customer-email">{booking.email} · {booking.phone}</small></td>
          <td><span className="admin-customer-name">{booking.packageName}</span><small className="admin-customer-email">{booking.vehicle} · {booking.vehicleType}</small></td>
          <td>{booking.appointmentDate}<small className="admin-customer-email">{booking.appointmentTime}</small></td>
          <td><b>{money(booking.total)}</b></td>
          <td><span className={`admin-status-pill status-${booking.status}`}><i />{statusLabel(booking.status)}</span></td>
          <td>{booking.status === 'pending' ? <div className="admin-approve-actions"><button disabled={saving} className="admin-approve-btn" onClick={() => onStatusChange(booking.id, 'approved')}><Check size={14} /> Approve</button><button disabled={saving} className="admin-reject-btn" onClick={() => onStatusChange(booking.id, 'rejected')}>Reject</button></div> : booking.status === 'approved' ? <button disabled={saving} className="admin-approve-btn" onClick={() => onStatusChange(booking.id, 'completed')}>Mark complete</button> : <span className="admin-customer-email">—</span>}</td>
        </tr>
      ))}</tbody>
    </table>
  </div>
);

const EmptyState = ({ title, text, action }) => (
  <div className="admin-empty-state"><span><Package size={23} /></span><b>{title}</b><p>{text}</p>{action}</div>
);

export { AdminPage };
