import React from 'react';
import { Check, Package } from 'lucide-react';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

export const MetricCard = ({ icon: Icon, label, value, note, tone }) => (
  <article className="admin-metric-card">
    <div className={`admin-metric-icon metric-${tone}`}><Icon size={19} /></div>
    <span className="admin-metric-label">{label}</span>
    <b className="admin-metric-value">{value}</b>
    <span className="admin-metric-note"><i />{note}</span>
  </article>
);

export const BookingsTable = ({ bookings, saving, onStatusChange }) => (
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

export const EmptyState = ({ title, text, action }) => (
  <div className="admin-empty-state"><span><Package size={23} /></span><b>{title}</b><p>{text}</p>{action}</div>
);
