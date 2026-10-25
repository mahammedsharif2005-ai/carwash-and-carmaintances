import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowRight, BadgePercent, BarChart3, Bell,
  CalendarDays, Check, CheckCircle2, ChevronDown, CircleDollarSign, Clock3, Eye, LayoutDashboard,
  Menu, Package, Plus, Search, Settings2, ShieldCheck, ShoppingBag,
  Tag, Users, X,
} from 'lucide-react';
import {
  createDiscount, deleteDiscount, getCustomers, getDiscounts, getOrders, updateDiscount,
  getServiceBookings, updateOrderStatus, updateServiceBookingStatus,
} from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { EmptyState, MetricCard } from '../components/AdminDataViews';
import { Toast } from '../components/Toast';
import ServiceBookingsPage from './ServiceBookingsPage';
import './AdminPage.css';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const dateLabel = (value) => new Date(value).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});
const dateKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const dateKeySafe = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateKey(date);
};
const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);
const buildPeriodReports = (orders, bookings, period) => {
  const reports = new Map();
  const addRecord = (record, type) => {
    const date = dateKeySafe(record.createdAt);
    if (!date) return;
    const key = period === 'month' ? date.slice(0, 7) : date.slice(0, 4);
    const report = reports.get(key) || {
      key,
      label: period === 'month'
        ? new Date(`${key}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : key,
      orderCount: 0,
      orderRevenue: 0,
      bookingCount: 0,
      bookingValue: 0,
    };
    if (type === 'order') {
      report.orderCount += 1;
      if (record.status !== 'rejected') report.orderRevenue += Number(record.total || 0);
    } else {
      report.bookingCount += 1;
      if (record.status !== 'rejected') report.bookingValue += Number(record.total || 0);
    }
    reports.set(key, report);
  };
  orders.forEach((order) => addRecord(order, 'order'));
  bookings.forEach((booking) => addRecord(booking, 'booking'));
  return [...reports.values()].sort((a, b) => b.key.localeCompare(a.key));
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'bookings', label: 'Service bookings', icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'discounts', label: 'Discounts', icon: BadgePercent },
];

const AdminPage = ({ onNavigate, onSignOut }) => {
  const [section, setSection] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingSummary, setBookingSummary] = useState({ total: 0, uniqueCustomers: 0, carWashRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportPeriod, setReportPeriod] = useState('month');
  const [saving, setSaving] = useState(false);
  const [discountForm, setDiscountForm] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [orderData, discountData, bookingData, customerData] = await Promise.all([
        getOrders(), getDiscounts(), getServiceBookings(), getCustomers(),
      ]);
      setOrders(orderData.orders);
      setCustomers(customerData.customers);
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
  const pendingOrderCount = useMemo(
    () => orders.filter((order) => order.status === 'pending').length,
    [orders]
  );
  const pendingBookingCount = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending').length,
    [bookings]
  );
  const notificationCount = pendingOrderCount + pendingBookingCount;

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) =>
      [order.orderNumber, order.customerName, order.email, order.phone]
        .some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [orders, search]);
  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.email, customer.phone]
        .some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [customers, search]);

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
  const reportData = useMemo(() => {
    const query = reportSearch.trim().toLowerCase();
    const inDateRange = (createdAt) => {
      const key = dateKeySafe(createdAt);
      return key && (!reportStartDate || key >= reportStartDate) && (!reportEndDate || key <= reportEndDate);
    };
    const matchesSearch = (values) => !query || values.some((value) => String(value || '').toLowerCase().includes(query));
    const reportOrders = orders.filter((order) => inDateRange(order.createdAt)
      && matchesSearch([order.orderNumber, order.customerName, order.email, order.phone]));
    const reportBookings = bookings.filter((booking) => inDateRange(booking.createdAt)
      && matchesSearch([booking.customerName, booking.email, booking.phone, booking.vehicle, booking.packageName]));
    return { orders: reportOrders, bookings: reportBookings };
  }, [orders, bookings, reportSearch, reportStartDate, reportEndDate]);
  const monthlyReports = useMemo(
    () => buildPeriodReports(reportData.orders, reportData.bookings, 'month'),
    [reportData]
  );
  const yearlyReports = useMemo(
    () => buildPeriodReports(reportData.orders, reportData.bookings, 'year'),
    [reportData]
  );
  const reportTotals = useMemo(() => ({
    orders: reportData.orders.length,
    orderRevenue: reportData.orders.filter((order) => order.status !== 'rejected')
      .reduce((total, order) => total + Number(order.total || 0), 0),
    bookings: reportData.bookings.length,
    bookingValue: reportData.bookings.filter((booking) => booking.status !== 'rejected')
      .reduce((total, booking) => total + Number(booking.total || 0), 0),
  }), [reportData]);

  return (
    <div className={`admin-shell ${sidebarCollapsed ? 'admin-shell-sidebar-collapsed' : ''}`}>
      <AdminSidebar
        items={NAV_ITEMS.map((item) => ({
          ...item,
          count: item.id === 'orders' ? summary.pending : item.id === 'bookings' ? bookingSummary.total : 0,
        }))}
        activeItem={section}
        onSelect={(id) => {
          setSection(id);
          setMobileNavOpen(false);
        }}
        onSignOut={onSignOut}
        counts={{
          orders: summary.pending,
          bookings: bookingSummary.total,
        }}
        mobileNavOpen={mobileNavOpen}
        onCloseMobileMenu={() => setMobileNavOpen(false)}
      />
      {mobileNavOpen && <button className="admin-nav-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-toggle"
            aria-label="Toggle sidebar navigation"
            title="Toggle sidebar navigation"
            aria-expanded={window.innerWidth <= 760 ? mobileNavOpen : !sidebarCollapsed}
            aria-controls="admin-sidebar"
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
            <div className="admin-notification-wrap">
              <button
                className="admin-icon-btn"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                aria-controls="admin-notifications"
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={18} />
                {notificationCount > 0 && <i />}
              </button>
              {notificationsOpen && (
                <section className="admin-notifications" id="admin-notifications" aria-label="Notifications">
                  <div className="admin-notifications-heading">
                    <b>Notifications</b>
                    <span>{notificationCount}</span>
                  </div>
                  {notificationCount ? (
                    <div className="admin-notification-list">
                      {pendingOrderCount > 0 && (
                        <button
                          onClick={() => {
                            setSection('orders');
                            setNotificationsOpen(false);
                          }}
                        >
                          <span className="admin-notification-icon"><ShoppingBag size={16} /></span>
                          <span><b>{pendingOrderCount} pending {pendingOrderCount === 1 ? 'order' : 'orders'}</b><small>Review customer orders</small></span>
                          <ArrowRight size={15} />
                        </button>
                      )}
                      {pendingBookingCount > 0 && (
                        <button
                          onClick={() => {
                            setSection('bookings');
                            setNotificationsOpen(false);
                          }}
                        >
                          <span className="admin-notification-icon"><Package size={16} /></span>
                          <span><b>{pendingBookingCount} pending {pendingBookingCount === 1 ? 'service booking' : 'service bookings'}</b><small>Review service requests</small></span>
                          <ArrowRight size={15} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="admin-notifications-empty">You’re all caught up.</p>
                  )}
                </section>
              )}
            </div>
            <div className="admin-profile"><div className="admin-avatar">A</div><span><b>Admin</b><small>Store manager</small></span><ChevronDown size={14} /></div>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading">
            <div>
              <div className="admin-eyebrow"><span /> SHOWROOM MANAGEMENT</div>
              <h1>{section === 'overview' ? 'Good morning, Admin' : section === 'orders' ? 'Orders' : section === 'bookings' ? 'Service bookings' : section === 'customers' ? 'Customers' : section === 'reports' ? 'Reports' : 'Discounts'}</h1>
              <p>{section === 'overview' ? 'Here’s what’s happening at your store today.' : section === 'orders' ? 'Review, approve, and keep track of customer orders.' : section === 'bookings' ? 'See who requested a wash or service and manage reservations.' : section === 'customers' ? 'View customer accounts registered with your showroom.' : section === 'reports' ? 'Review monthly and yearly order and service performance.' : 'Create and manage promotional codes for your store.'}</p>
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
                <ServiceBookingsPage
                  bookings={bookings}
                  bookingSummary={bookingSummary}
                  saving={saving}
                  onStatusChange={changeBookingStatus}
                />
              )}
              {section === 'customers' && (
                <section className="admin-panel admin-orders-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <h2>Customer accounts <span className="admin-total-count">{filteredCustomers.length}</span></h2>
                      <p>Customers who have registered with the showroom.</p>
                    </div>
                    <div className="admin-order-tools">
                      <label className="admin-search">
                        <Search size={16} />
                        <input
                          aria-label="Search customers"
                          placeholder="Search customers…"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                  {filteredCustomers.length ? (
                    <div className="admin-table-scroll">
                      <table className="admin-orders-table">
                        <thead><tr><th>CUSTOMER</th><th>EMAIL</th><th>PHONE</th><th>REGISTERED</th></tr></thead>
                        <tbody>
                          {filteredCustomers.map((customer) => (
                            <tr key={customer.id}>
                              <td><b>{customer.name}</b></td>
                              <td>{customer.email}</td>
                              <td>{customer.phone || '—'}</td>
                              <td>{dateLabel(customer.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      title={customers.length ? 'No matching customers' : 'No customer accounts yet'}
                      text={customers.length ? 'Try searching by name, email, or phone number.' : 'New customer accounts will appear here after sign-in.'}
                    />
                  )}
                </section>
              )}
              {section === 'reports' && (
                <>
                  <section className="admin-report-filters" aria-label="Report filters">
                    <label className="admin-report-search">
                      <Search size={16} />
                      <input
                        aria-label="Search reports"
                        placeholder="Search customer, order, vehicle, or service…"
                        value={reportSearch}
                        onChange={(event) => setReportSearch(event.target.value)}
                      />
                    </label>
                    <label className="admin-report-date">
                      <span>From</span>
                      <input
                        aria-label="Report start date"
                        type="date"
                        value={reportStartDate}
                        max={reportEndDate || undefined}
                        onChange={(event) => setReportStartDate(event.target.value)}
                      />
                    </label>
                    <label className="admin-report-date">
                      <span>To</span>
                      <input
                        aria-label="Report end date"
                        type="date"
                        value={reportEndDate}
                        min={reportStartDate || undefined}
                        onChange={(event) => setReportEndDate(event.target.value)}
                      />
                    </label>
                    {(reportSearch || reportStartDate || reportEndDate) && (
                      <button
                        className="admin-report-clear"
                        onClick={() => {
                          setReportSearch('');
                          setReportStartDate('');
                          setReportEndDate('');
                        }}
                      >
                        Clear filters
                      </button>
                    )}
                  </section>
                  <div className="admin-report-summary">
                    <MetricCard icon={ShoppingBag} label="Orders" value={reportTotals.orders} note="Matching selected filters" tone="dark" />
                    <MetricCard icon={CircleDollarSign} label="Order revenue" value={money(reportTotals.orderRevenue)} note="Excludes rejected orders" tone="blue" />
                    <MetricCard icon={Package} label="Service bookings" value={reportTotals.bookings} note="Matching selected filters" tone="green" />
                    <MetricCard icon={CircleDollarSign} label="Estimated service value" value={money(reportTotals.bookingValue)} note="Excludes rejected bookings" tone="amber" />
                  </div>
                  <ReportTable
                    period={reportPeriod}
                    onPeriodChange={setReportPeriod}
                    reports={reportPeriod === 'month' ? monthlyReports : yearlyReports}
                  />
                  <p className="admin-report-note">
                    Service booking values are estimates, not recorded payments. Revenue and estimates exclude rejected records.
                  </p>
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

const ReportTable = ({ period, onPeriodChange, reports }) => {
  const isMonthly = period === 'month';
  return (
  <section className="admin-panel admin-report-panel">
    <div className="admin-panel-heading">
      <div>
        <h2>{isMonthly ? 'Monthly report' : 'Yearly report'}</h2>
        <p>Orders and service bookings grouped by {isMonthly ? 'month' : 'year'}.</p>
      </div>
      <label className="admin-report-period">
        <CalendarDays size={15} />
        <select
          aria-label="Report period"
          value={period}
          onChange={(event) => onPeriodChange(event.target.value)}
        >
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
        <ChevronDown size={13} />
      </label>
    </div>
    {reports.length ? (
      <div className="admin-table-scroll">
        <table className="admin-report-table">
          <thead>
            <tr><th>PERIOD</th><th>ORDERS</th><th>ORDER REVENUE</th><th>SERVICE BOOKINGS</th><th>EST. SERVICE VALUE</th></tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.key}>
                <td><b>{report.label}</b></td>
                <td>{report.orderCount}</td>
                <td><b>{money(report.orderRevenue)}</b></td>
                <td>{report.bookingCount}</td>
                <td><b>{money(report.bookingValue)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : <p className="admin-report-empty">No {isMonthly ? 'monthly' : 'yearly'} data matches the selected filters.</p>}
  </section>
  );
};

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

export { AdminPage };
