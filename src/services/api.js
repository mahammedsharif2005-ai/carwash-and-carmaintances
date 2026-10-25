const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(sessionStorage.getItem('adminToken')
          ? { Authorization: `Bearer ${sessionStorage.getItem('adminToken')}` }
          : {}),
        ...options.headers,
      },
      ...options,
    });
  } catch (error) {
    throw new Error('Cannot reach the backend. Start the Node.js API and check its database connection.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) sessionStorage.removeItem('adminToken');
    const error = new Error(data.error || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const getOrders = () => request('/orders');
export const getCustomers = () => request('/customers');
export const updateOrderStatus = (id, status) => request(`/orders/${id}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status }),
});
export const getDiscounts = () => request('/discounts');
export const createDiscount = (discount) => request('/discounts', {
  method: 'POST',
  body: JSON.stringify(discount),
});
export const updateDiscount = (id, discount) => request(`/discounts/${id}`, {
  method: 'PUT',
  body: JSON.stringify(discount),
});
export const deleteDiscount = (id) => request(`/discounts/${id}`, { method: 'DELETE' });
export const createOrder = (order) => request('/orders', {
  method: 'POST',
  body: JSON.stringify(order),
});
export const createServiceBooking = (booking) => request('/bookings', {
  method: 'POST',
  body: JSON.stringify(booking),
});
export const getServiceBookings = () => request('/bookings');
export const updateServiceBookingStatus = (id, status) => request(`/bookings/${id}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status }),
});
export const adminLogin = (credentials) => request('/auth/admin', {
  method: 'POST',
  body: JSON.stringify(credentials),
});
export const customerLogin = (credentials) => request('/auth/customer', {
  method: 'POST',
  body: JSON.stringify(credentials),
});
