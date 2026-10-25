import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { SiteHeader } from './components/SiteHeader';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';

const originalFetch = global.fetch;
const originalInnerWidth = window.innerWidth;

afterEach(() => {
  global.fetch = originalFetch;
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('customerProfile');
});

test('requires customer sign-in before product checkout and resumes checkout afterward', async () => {
  window.history.replaceState({}, '', '/');
  global.fetch = jest.fn((url) => Promise.resolve({
    ok: true,
    json: async () => url.endsWith('/auth/customer')
      ? { customer: { id: 1, name: 'Aanya Mehta', email: 'aanya@example.com', phone: '' } }
      : {},
  }));
  render(<App />);

  fireEvent.click(screen.getByRole('link', { name: 'Maintenance' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Add to Cart' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Open cart' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sign in to checkout' }));

  expect(window.location.pathname).toBe('/login');
  expect(screen.getByRole('heading', { name: 'Come on in.' })).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: 'Aanya Mehta' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'aanya@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'securepass123' } });
  fireEvent.click(screen.getByRole('button', { name: /Continue to showroom/ }));

  expect(await screen.findByRole('heading', { name: 'Delivery details' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/maintenance');
  expect(screen.getByLabelText('Full name')).toHaveValue('Aanya Mehta');
  expect(screen.getByLabelText('Email address')).toHaveValue('aanya@example.com');
});

test('opens the maintenance store as a separate page', () => {
  window.history.replaceState({}, '', '/');
  render(<App />);

  fireEvent.click(screen.getByRole('link', { name: 'Maintenance' }));

  expect(screen.getByRole('heading', { name: 'Premium Maintenance Store' })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Search oils, filters, coatings...')).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Store' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('heading', { name: 'VIP Concierge' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Book Service Bay' })).toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toHaveTextContent('Unique Car Care & Maintenance India Pvt. Ltd.');
  expect(screen.queryByText('Best Seller')).not.toBeInTheDocument();
  expect(screen.queryByText(/-\d+%|Save \d+%/)).not.toBeInTheDocument();
});

test('mobile showroom navigation can be opened and closed', () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  window.history.replaceState({}, '', '/');
  render(<App />);

  const menuToggle = screen.getByRole('button', { name: 'Toggle main navigation' });
  const navigation = screen.getByRole('navigation', { name: 'Main Navigation' });

  expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(menuToggle);
  expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
  expect(navigation).toHaveClass('hero-nav-links-open');

  fireEvent.click(screen.getByRole('link', { name: 'About Us' }));
  expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  expect(window.location.pathname).toBe('/about');
});

test('mobile interior-page navigation can be opened and closed', () => {
  const onNavigate = jest.fn();
  render(<SiteHeader onNavigate={onNavigate} currentPage="about" />);

  const menuToggle = screen.getByRole('button', { name: 'Toggle main navigation' });
  const navigation = screen.getByRole('navigation', { name: 'Main navigation' });

  fireEvent.click(menuToggle);
  expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
  expect(navigation).toHaveClass('store-site-nav-open');

  fireEvent.click(screen.getByRole('button', { name: 'Cars' }));
  expect(onNavigate).toHaveBeenCalledWith('/cars');
  expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
});

test('opens the dedicated about page from the main navigation', () => {
  window.history.replaceState({}, '', '/');
  render(<App />);

  fireEvent.click(screen.getByRole('link', { name: 'About Us' }));

  expect(window.location.pathname).toBe('/about');
  expect(screen.getByRole('heading', { name: /We believe every drive should feel exceptional/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'About Us' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('heading', { name: /More than a service bay/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'VIP Concierge' })).toBeInTheDocument();
});

test('opens the dedicated cars page and updates its featured vehicle', () => {
  window.history.replaceState({}, '', '/');
  render(<App />);

  fireEvent.click(screen.getByRole('link', { name: 'Cars' }));

  expect(window.location.pathname).toBe('/cars');
  expect(screen.getByRole('heading', { name: /Every car has its own character/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cars' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('heading', { name: 'Find your car.' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'View Toyota Fortuner Legender 4x4' }));

  expect(screen.getByRole('heading', { name: 'Fortuner Legender 4x4' })).toBeInTheDocument();
  expect(screen.getByText(/Selected for your Toyota/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Book for this car/ })).toBeInTheDocument();
});

test('opens the dedicated help and concierge page from the main navigation', () => {
  window.history.replaceState({}, '', '/');
  render(<App />);

  fireEvent.click(screen.getByRole('link', { name: 'Help' }));

  expect(window.location.pathname).toBe('/help');
  expect(screen.getByRole('heading', { name: /How can our studio team/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Help' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByPlaceholderText(/Search topics, protocols/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Submit a Direct Studio Inquiry' })).toBeInTheDocument();
});

test('shows order metrics in the admin dashboard', async () => {
  const order = {
    id: 1,
    orderNumber: 'UQ-TEST-1234',
    customerName: 'Aarav Patel',
    email: 'aarav@example.com',
    phone: '9876543210',
    address: '12 Market Road, Pune',
    subtotal: 599,
    discountAmount: 0,
    discountCode: null,
    total: 599,
    status: 'pending',
    createdAt: '2026-10-22T10:00:00.000Z',
    items: [{ productId: '3m-shampoo', productName: '3M Auto Wash Shampoo', unitPrice: 599, quantity: 1 }],
  };
  const booking = {
    id: 7,
    customerName: 'Aarav Patel',
    email: 'aarav@example.com',
    phone: '9876543210',
    vehicle: 'Mahindra Thar Roxx 4x4',
    vehicleType: 'Full-Size SUV (Thar / Fortuner)',
    packageId: 'express',
    packageName: 'Signature Snow Foam Wash',
    appointmentDate: 'Tomorrow, Oct 23',
    appointmentTime: '10:30 AM',
    total: 999,
    status: 'pending',
  };
  const customer = {
    id: 12,
    name: 'Aanya Mehta',
    email: 'aanya@example.com',
    phone: '+91 9876543210',
    createdAt: '2026-10-20T10:00:00.000Z',
  };
  sessionStorage.setItem('adminToken', 'test-admin-token');
  global.fetch = jest.fn((url) => Promise.resolve({
    ok: true,
    json: async () => url.endsWith('/orders')
      ? { orders: [order] }
      : url.endsWith('/bookings')
        ? { bookings: [booking], summary: { total: 1, uniqueCustomers: 1, carWashRequests: 1 } }
        : url.endsWith('/customers')
          ? { customers: [customer] }
        : { discounts: [] },
  }));

  render(<AdminPage onNavigate={() => {}} />);

  expect(await screen.findByRole('button', { name: 'View order UQ-TEST-1234' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Good morning, Admin' })).toBeInTheDocument();
  expect(screen.getByText('Total orders')).toBeInTheDocument();
  expect(screen.getByText('Awaiting approval')).toBeInTheDocument();
  expect(screen.getByText('Approved orders')).toBeInTheDocument();
  expect(screen.queryByText('Car wash requests')).not.toBeInTheDocument();
  const sidebarToggle = screen.getByRole('button', { name: 'Toggle sidebar navigation' });
  fireEvent.click(sidebarToggle);
  expect(sidebarToggle.closest('.admin-shell')).toHaveClass('admin-shell-sidebar-collapsed');
  fireEvent.click(sidebarToggle);
  expect(sidebarToggle.closest('.admin-shell')).not.toHaveClass('admin-shell-sidebar-collapsed');

  fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
  expect(screen.getByText('1 pending order')).toBeInTheDocument();
  expect(screen.getByText('1 pending service booking')).toBeInTheDocument();
  fireEvent.click(screen.getByText('1 pending order'));
  expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'View order UQ-TEST-1234' }));
  expect(screen.getByRole('dialog', { name: 'Order UQ-TEST-1234' })).toBeInTheDocument();
  expect(screen.getByText('3M Auto Wash Shampoo')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close order details' }));

  fireEvent.click(screen.getByRole('button', { name: /Service bookings/ }));
  expect(screen.getByRole('heading', { name: /Customer service requests/ })).toBeInTheDocument();
  expect(screen.getByText('Aarav Patel')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Export CSV/ })).toBeEnabled();
  expect(screen.getByText('Car wash requests')).toBeInTheDocument();
  expect(screen.getByText('Daily service income')).toBeInTheDocument();
  expect(screen.getByText('Service demand')).toBeInTheDocument();
  expect(screen.getAllByText('Signature Snow Foam Wash').length).toBeGreaterThan(0);
  expect(screen.getByLabelText('Filter bookings by date')).toHaveValue('all');

  fireEvent.click(screen.getByRole('button', { name: 'Customers' }));
  expect(screen.getByRole('heading', { name: /Customer accounts/ })).toBeInTheDocument();
  expect(screen.getByText('aanya@example.com')).toBeInTheDocument();
  expect(screen.getByText('+91 9876543210')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Discounts' }));
  expect(screen.getByRole('heading', { name: 'Discounts' })).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: /Create discount/ })[0]);
  expect(screen.getByRole('heading', { name: 'Create discount' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reports' }));
  expect(screen.getByRole('heading', { name: 'Monthly report' })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search reports' }), { target: { value: 'Aarav' } });
  fireEvent.change(screen.getByLabelText('Report start date'), { target: { value: '2026-10-22' } });
  fireEvent.change(screen.getByLabelText('Report end date'), { target: { value: '2026-10-22' } });
  expect(screen.getByText('October 2026').closest('tr')).toHaveTextContent('₹599');
  fireEvent.change(screen.getByLabelText('Report period'), { target: { value: 'year' } });
  expect(screen.getByRole('heading', { name: 'Yearly report' })).toBeInTheDocument();
  expect(screen.getByText('2026').closest('tr')).toHaveTextContent('₹599');
});

test('mobile admin menu toggle opens and closes the sidebar', async () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  sessionStorage.setItem('adminToken', 'test-admin-token');
  global.fetch = jest.fn((url) => Promise.resolve({
    ok: true,
    json: async () => url.endsWith('/orders')
      ? { orders: [] }
      : url.endsWith('/bookings')
        ? { bookings: [], summary: { total: 0, uniqueCustomers: 0, carWashRequests: 0 } }
        : url.endsWith('/customers')
          ? { customers: [] }
        : { discounts: [] },
  }));

  render(<AdminPage onNavigate={() => {}} />);
  const menuToggle = await screen.findByRole('button', { name: 'Toggle sidebar navigation' });

  expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(menuToggle);
  expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
  expect(document.getElementById('admin-sidebar')).toHaveClass('admin-sidebar-open');

  fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
  expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  expect(document.getElementById('admin-sidebar')).not.toHaveClass('admin-sidebar-open');
});

test('customer sign-in takes a name and email and continues to the showroom', async () => {
  const onNavigate = jest.fn();
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: async () => ({
      customer: { id: 1, name: 'Aanya Mehta', email: 'aanya@example.com', phone: '' },
    }),
  }));
  render(<LoginPage onNavigate={onNavigate} />);

  fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: 'Aanya Mehta' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'aanya@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'securepass123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue to showroom' }));

  await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('/'));
  expect(JSON.parse(sessionStorage.getItem('customerProfile'))).toEqual({
    id: 1,
    name: 'Aanya Mehta',
    email: 'aanya@example.com',
    phone: '',
  });
});

test('admin sign-in stores the API token and opens the dashboard', async () => {
  const onNavigate = jest.fn();
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: async () => ({ token: 'signed-admin-token', username: 'admin' }),
  }));
  render(<LoginPage onNavigate={onNavigate} />);

  fireEvent.click(screen.getByRole('tab', { name: 'Admin' }));
  fireEvent.change(screen.getByLabelText('Admin ID'), { target: { value: 'admin' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin@123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in to admin' }));

  await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('/admin'));
  expect(sessionStorage.getItem('adminToken')).toBe('signed-admin-token');
});
