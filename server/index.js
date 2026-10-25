require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const cors = require('cors');
const express = require('express');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 5000);
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unique_showroom',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '32kb' }));

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const sendError = (res, status, message) => res.status(status).json({ error: message });
const cleanText = (value) => typeof value === 'string' ? value.trim() : '';
const validDiscountCode = (code) => /^[A-Z0-9_-]{3,32}$/.test(code);
const tokenSecret = () => process.env.ADMIN_TOKEN_SECRET || '';
const passwordKeyLength = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, passwordKeyLength, (error, key) => {
      if (error) return reject(error);
      return resolve(`${salt}:${key.toString('base64url')}`);
    });
  });
}

function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string') return Promise.resolve(false);
  const [salt, hash] = storedHash.split(':');
  if (!/^[A-Za-z0-9_-]{22}$/.test(salt || '') || !/^[A-Za-z0-9_-]{86}$/.test(hash || '')) return Promise.resolve(false);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, passwordKeyLength, (error, key) => {
      if (error) return reject(error);
      const expected = Buffer.from(hash, 'base64url');
      return resolve(crypto.timingSafeEqual(key, expected));
    });
  });
}

function validateCustomerCredentials(body) {
  const name = cleanText(body.name);
  const email = cleanText(body.email).toLowerCase();
  const phone = cleanText(body.phone);
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) {
    throw Object.assign(new Error('Enter a valid email address.'), { status: 400 });
  }
  if (password.length < 8 || password.length > 120) {
    throw Object.assign(new Error('Password must be between 8 and 120 characters.'), { status: 400 });
  }
  if (name && (name.length < 2 || name.length > 120)) {
    throw Object.assign(new Error('Name must be between 2 and 120 characters.'), { status: 400 });
  }
  if (phone.length > 20) {
    throw Object.assign(new Error('Enter a valid phone number.'), { status: 400 });
  }
  return { name, email, phone, password };
}

function createAdminToken(username, secret = tokenSecret(), now = Date.now()) {
  if (!secret) throw new Error('ADMIN_TOKEN_SECRET is not configured.');
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    role: 'admin',
    exp: Math.floor(now / 1000) + 8 * 60 * 60,
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyAdminToken(token, secret = tokenSecret(), now = Date.now()) {
  if (!secret || typeof token !== 'string') return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest();
  let actual;
  try { actual = Buffer.from(signature, 'base64url'); } catch (error) { return false; }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return false;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return claims.role === 'admin' && typeof claims.sub === 'string' && claims.exp > Math.floor(now / 1000);
  } catch (error) {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!verifyAdminToken(token)) return sendError(res, 401, 'Admin sign-in is required.');
  return next();
}

function validateDiscount(body) {
  const code = cleanText(body.code).toUpperCase();
  const discountType = body.discountType;
  const discountValue = Number(body.discountValue);
  const minimumOrder = Number(body.minimumOrder || 0);
  const usageLimit = body.usageLimit === undefined || body.usageLimit === null || body.usageLimit === ''
    ? null
    : Number(body.usageLimit);
  const expiresAt = body.expiresAt || null;

  if (!validDiscountCode(code)) throw Object.assign(new Error('Use 3–32 letters, numbers, underscores, or hyphens for the code.'), { status: 400 });
  if (!['percentage', 'fixed'].includes(discountType)) throw Object.assign(new Error('Choose a valid discount type.'), { status: 400 });
  if (!Number.isFinite(discountValue) || discountValue <= 0 || (discountType === 'percentage' && discountValue > 100)) {
    throw Object.assign(new Error('Enter a valid discount value. Percentage discounts cannot exceed 100%.'), { status: 400 });
  }
  if (!Number.isFinite(minimumOrder) || minimumOrder < 0) throw Object.assign(new Error('Minimum order must be zero or more.'), { status: 400 });
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) throw Object.assign(new Error('Usage limit must be a positive whole number.'), { status: 400 });
  if (expiresAt) {
    const date = new Date(`${expiresAt}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresAt) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== expiresAt) {
      throw Object.assign(new Error('Expiry date must be a valid date in YYYY-MM-DD format.'), { status: 400 });
    }
  }
  return {
    code, discountType, discountValue, minimumOrder, usageLimit,
    active: body.active === false || body.active === 0 ? 0 : 1,
    expiresAt,
  };
}

function serializeDiscount(row) {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discountType,
    discountValue: row.discountValue,
    minimumOrder: row.minimumOrder,
    usageLimit: row.usageLimit,
    usageCount: row.usageCount,
    active: Boolean(row.active),
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

async function loadOrders() {
  const [orders] = await pool.query(
    `SELECT id, order_number AS orderNumber, customer_name AS customerName,
            email, phone, address, subtotal, discount_amount AS discountAmount,
            discount_code AS discountCode, total, status, created_at AS createdAt
     FROM orders ORDER BY created_at DESC`
  );
  if (!orders.length) return [];
  const ids = orders.map((order) => order.id);
  const [items] = await pool.query(
    `SELECT order_id AS orderId, product_id AS productId, product_name AS productName,
            unit_price AS unitPrice, quantity
     FROM order_items WHERE order_id IN (?) ORDER BY id`,
    [ids]
  );
  const itemsByOrder = new Map(orders.map((order) => [order.id, []]));
  items.forEach((item) => itemsByOrder.get(item.orderId).push({
    productId: item.productId,
    productName: item.productName,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
  }));
  return orders.map((order) => ({ ...order, items: itemsByOrder.get(order.id) }));
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/customer', asyncRoute(async (req, res) => {
  let customer;
  try {
    customer = validateCustomerCredentials(req.body);
  } catch (error) {
    return sendError(res, error.status || 400, error.message);
  }
  const [existing] = await pool.execute(
    'SELECT id, name, email, phone, password_hash AS passwordHash FROM customers WHERE email = ?',
    [customer.email]
  );
  if (existing.length) {
    const account = existing[0];
    if (!await verifyPassword(customer.password, account.passwordHash)) {
      return sendError(res, 401, 'The email or password is incorrect.');
    }
    return res.json({
      customer: { id: account.id, name: account.name, email: account.email, phone: account.phone || '' },
    });
  }
  if (customer.name.length < 2) {
    return sendError(res, 400, 'Enter your name to create a customer account.');
  }
  const passwordHash = await hashPassword(customer.password);
  try {
    const [result] = await pool.execute(
      'INSERT INTO customers (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [customer.name, customer.email, customer.phone || null, passwordHash]
    );
    return res.status(201).json({
      customer: {
        id: result.insertId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendError(res, 409, 'An account with this email was just created. Sign in with your password.');
    }
    throw error;
  }
}));

app.post('/api/auth/admin', asyncRoute(async (req, res) => {
  const username = cleanText(req.body.username);
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const configuredUsername = process.env.ADMIN_USERNAME || '';
  if (!configuredUsername || !process.env.ADMIN_PASSWORD || !tokenSecret()) {
    return sendError(res, 503, 'Admin login is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_TOKEN_SECRET in server/.env.');
  }
  const [accounts] = await pool.execute(
    'SELECT username, password_hash AS passwordHash FROM admin_users WHERE username = ?',
    [username]
  );
  const account = accounts[0];
  if (!account || !await verifyPassword(password, account.passwordHash)) {
    return sendError(res, 401, 'The admin ID or password is incorrect.');
  }
  return res.json({ token: createAdminToken(username), username });
}));

app.get('/api/customers', requireAdmin, asyncRoute(async (req, res) => {
  const [customers] = await pool.query(
    `SELECT id, name, email, phone, created_at AS createdAt
     FROM customers ORDER BY created_at DESC`
  );
  res.json({ customers });
}));

app.post('/api/bookings', asyncRoute(async (req, res) => {
  const customerName = cleanText(req.body.customerName);
  const email = cleanText(req.body.email).toLowerCase();
  const phone = cleanText(req.body.phone);
  const packageId = cleanText(req.body.packageId);
  const vehicleType = cleanText(req.body.vehicleType);
  const vehicle = cleanText(req.body.vehicle);
  const appointmentDate = cleanText(req.body.appointmentDate);
  const appointmentTime = cleanText(req.body.appointmentTime);
  const addonIds = Array.isArray(req.body.addonIds) ? [...new Set(req.body.addonIds.map(cleanText))] : [];
  if (customerName.length < 2 || customerName.length > 120) return sendError(res, 400, 'Enter a valid customer name.');
  if (email.length > 190 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendError(res, 400, 'Enter a valid email address.');
  if (phone.length < 7 || phone.length > 20) return sendError(res, 400, 'Enter a valid phone number.');
  if (!vehicle || vehicle.length > 180 || !vehicleType || vehicleType.length > 100) return sendError(res, 400, 'Enter valid vehicle details.');
  if (!appointmentDate || appointmentDate.length > 40 || !appointmentTime || appointmentTime.length > 20) return sendError(res, 400, 'Choose a valid appointment date and time.');
  if (!packageId || addonIds.length > 10 || addonIds.some((id) => !/^[a-z0-9-]{1,60}$/.test(id))) return sendError(res, 400, 'Choose a valid service package and add-ons.');

  const [packages] = await pool.execute(
    'SELECT id, name, price FROM service_packages WHERE id = ?',
    [packageId]
  );
  if (!packages.length) return sendError(res, 400, 'The selected service package is unavailable.');
  let addons = [];
  if (addonIds.length) {
    const [rows] = await pool.query('SELECT id, name, price FROM service_addons WHERE id IN (?)', [addonIds]);
    if (rows.length !== addonIds.length) return sendError(res, 400, 'One or more selected add-ons are unavailable.');
    addons = rows;
  }
  const packagePrice = Number(packages[0].price);
  const addonTotal = addons.reduce((sum, addon) => sum + Number(addon.price), 0);
  const vehicleSurcharge = vehicleType.includes('Full-Size SUV') ? 300 : 0;
  const total = packagePrice + addonTotal + vehicleSurcharge;
  const [result] = await pool.execute(
    `INSERT INTO service_bookings
      (customer_name, email, phone, vehicle, vehicle_type, package_id, package_name,
       addon_ids, appointment_date, appointment_time, total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      customerName, email, phone, vehicle, vehicleType, packageId, packages[0].name,
      JSON.stringify(addonIds), appointmentDate, appointmentTime, total,
    ]
  );
  res.status(201).json({
    booking: {
      id: result.insertId, customerName, email, phone, vehicle, vehicleType,
      packageId, packageName: packages[0].name, addonIds,
      addons: addons.map((addon) => ({ id: addon.id, name: addon.name, price: addon.price })),
      appointmentDate, appointmentTime, total, status: 'pending',
      createdAt: new Date().toISOString(),
    },
  });
}));

app.get('/api/bookings', requireAdmin, asyncRoute(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, customer_name AS customerName, email, phone, vehicle, vehicle_type AS vehicleType,
            package_id AS packageId, package_name AS packageName, addon_ids AS addonIds,
            appointment_date AS appointmentDate, appointment_time AS appointmentTime,
            total, status, created_at AS createdAt
     FROM service_bookings ORDER BY created_at DESC`
  );
  const bookings = rows.map((booking) => ({
    ...booking,
    addonIds: Array.isArray(booking.addonIds) ? booking.addonIds : JSON.parse(booking.addonIds || '[]'),
  }));
  const uniqueCustomers = new Set(bookings.map((booking) => booking.email.toLowerCase())).size;
  const carWashRequests = bookings.filter((booking) =>
    booking.packageId === 'express' || /wash/i.test(booking.packageName)
  ).length;
  res.json({ bookings, summary: { total: bookings.length, uniqueCustomers, carWashRequests } });
}));

app.patch('/api/bookings/:id/status', requireAdmin, asyncRoute(async (req, res) => {
  const status = cleanText(req.body.status);
  if (!['approved', 'rejected', 'completed'].includes(status)) return sendError(res, 400, 'Choose a valid booking status.');
  const [rows] = await pool.execute(
    'SELECT id, status FROM service_bookings WHERE id = ?',
    [req.params.id]
  );
  if (!rows.length) return sendError(res, 404, 'Service booking not found.');
  const transitions = {
    pending: ['approved', 'rejected'],
    approved: ['completed'],
    rejected: [],
    completed: [],
  };
  if (!transitions[rows[0].status].includes(status)) {
    return sendError(res, 409, `A booking cannot move from ${rows[0].status} to ${status}.`);
  }
  await pool.execute('UPDATE service_bookings SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ booking: { id: Number(req.params.id), status } });
}));

app.get('/api/orders', requireAdmin, asyncRoute(async (req, res) => {
  res.json({ orders: await loadOrders() });
}));

app.post('/api/orders', asyncRoute(async (req, res) => {
  const customer = req.body.customer || {};
  const customerName = cleanText(customer.name);
  const email = cleanText(customer.email).toLowerCase();
  const phone = cleanText(customer.phone);
  const address = cleanText(customer.address);
  const incomingItems = req.body.items;
  if (customerName.length < 2 || customerName.length > 120) return sendError(res, 400, 'Enter a valid customer name.');
  if (email.length > 190 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendError(res, 400, 'Enter a valid email address.');
  if (phone.length < 7 || phone.length > 20) return sendError(res, 400, 'Enter a valid phone number.');
  if (address.length < 5 || address.length > 500) return sendError(res, 400, 'Enter a delivery address.');
  if (!Array.isArray(incomingItems) || incomingItems.length < 1 || incomingItems.length > 50) return sendError(res, 400, 'Your cart must contain between 1 and 50 products.');

  const quantities = new Map();
  for (const item of incomingItems) {
    const productId = cleanText(item.id);
    const quantity = Number(item.qty);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return sendError(res, 400, 'Cart contains an invalid product or quantity.');
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    if (quantities.get(productId) > 99) return sendError(res, 400, 'A product quantity cannot exceed 99.');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const ids = [...quantities.keys()];
    const [products] = await connection.query(
      'SELECT id, name, price, in_stock AS inStock FROM products WHERE id IN (?)',
      [ids]
    );
    if (products.length !== ids.length) {
      await connection.rollback();
      return sendError(res, 400, 'One or more products are no longer available.');
    }
    if (products.some((product) => !product.inStock)) {
      await connection.rollback();
      return sendError(res, 409, 'Your cart contains a product that is currently out of stock.');
    }

    const subtotal = products.reduce((sum, product) => sum + product.price * quantities.get(product.id), 0);
    const code = req.body.discountCode ? cleanText(req.body.discountCode).toUpperCase() : '';
    let discount = null;
    let discountAmount = 0;
    if (code) {
      if (!validDiscountCode(code)) {
        await connection.rollback();
        return sendError(res, 400, 'Enter a valid discount code.');
      }
      const [rows] = await connection.query(
        `SELECT id, code, discount_type AS discountType, discount_value AS discountValue,
                minimum_order AS minimumOrder, usage_limit AS usageLimit, usage_count AS usageCount
         FROM discounts
         WHERE code = ? AND active = 1
           AND (expires_at IS NULL OR expires_at >= CURRENT_DATE)
           AND (usage_limit IS NULL OR usage_count < usage_limit)
         FOR UPDATE`,
        [code]
      );
      discount = rows[0];
      if (!discount) {
        await connection.rollback();
        return sendError(res, 400, 'That discount code is invalid, expired, or has reached its usage limit.');
      }
      if (subtotal < discount.minimumOrder) {
        await connection.rollback();
        return sendError(res, 400, `This code requires a minimum order of ₹${discount.minimumOrder}.`);
      }
      discountAmount = discount.discountType === 'percentage'
        ? Math.round(subtotal * discount.discountValue / 100)
        : Math.min(discount.discountValue, subtotal);
    }
    const total = Math.max(0, subtotal - discountAmount);
    const orderNumber = `UQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const [result] = await connection.execute(
      `INSERT INTO orders
        (order_number, customer_name, email, phone, address, subtotal, discount_amount, discount_code, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderNumber, customerName, email, phone, address, subtotal, discountAmount, code || null, total]
    );
    const orderId = result.insertId;
    const orderItems = products.map((product) => [
      orderId, product.id, product.name, product.price, quantities.get(product.id),
    ]);
    await connection.query(
      'INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES ?',
      [orderItems]
    );
    if (discount) await connection.execute('UPDATE discounts SET usage_count = usage_count + 1 WHERE id = ?', [discount.id]);
    await connection.commit();
    res.status(201).json({
      order: {
        id: orderId, orderNumber, customerName, email, phone, address,
        subtotal, discountAmount, discountCode: code || null, total, status: 'pending',
        createdAt: new Date().toISOString(),
        items: products.map((product) => ({
          productId: product.id, productName: product.name,
          unitPrice: product.price, quantity: quantities.get(product.id),
        })),
      },
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.patch('/api/orders/:id/status', requireAdmin, asyncRoute(async (req, res) => {
  const status = cleanText(req.body.status);
  const allowedStatuses = ['approved', 'rejected', 'processing', 'shipped', 'completed'];
  if (!allowedStatuses.includes(status)) return sendError(res, 400, 'Choose a valid order status.');
  const [rows] = await pool.execute(
    `SELECT id, order_number AS orderNumber, status FROM orders WHERE id = ?`,
    [req.params.id]
  );
  const order = rows[0];
  if (!order) return sendError(res, 404, 'Order not found.');
  const validNextStatuses = {
    pending: ['approved', 'rejected'],
    approved: ['processing', 'shipped', 'completed'],
    processing: ['shipped', 'completed'],
    shipped: ['completed'],
    completed: [],
    rejected: [],
  };
  if (!validNextStatuses[order.status].includes(status)) {
    return sendError(res, 409, `An order cannot move from ${order.status} to ${status}.`);
  }
  await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, order.id]);
  const [updated] = await pool.execute(
    `SELECT id, order_number AS orderNumber, customer_name AS customerName,
            email, phone, address, subtotal, discount_amount AS discountAmount,
            discount_code AS discountCode, total, status, created_at AS createdAt
     FROM orders WHERE id = ?`,
    [order.id]
  );
  const [items] = await pool.execute(
    `SELECT product_id AS productId, product_name AS productName,
            unit_price AS unitPrice, quantity
     FROM order_items WHERE order_id = ? ORDER BY id`,
    [order.id]
  );
  res.json({ order: { ...updated[0], items } });
}));

app.get('/api/discounts', requireAdmin, asyncRoute(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, code, discount_type AS discountType, discount_value AS discountValue,
            minimum_order AS minimumOrder, usage_limit AS usageLimit, usage_count AS usageCount,
            active, expires_at AS expiresAt, created_at AS createdAt
     FROM discounts ORDER BY created_at DESC`
  );
  res.json({ discounts: rows.map(serializeDiscount) });
}));

app.post('/api/discounts', requireAdmin, asyncRoute(async (req, res) => {
  let discount;
  try { discount = validateDiscount(req.body); } catch (error) { return sendError(res, error.status || 400, error.message); }
  const [result] = await pool.execute(
    `INSERT INTO discounts (code, discount_type, discount_value, minimum_order, usage_limit, active, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [discount.code, discount.discountType, discount.discountValue, discount.minimumOrder, discount.usageLimit, discount.active, discount.expiresAt]
  );
  res.status(201).json({ discount: { id: result.insertId, ...discount, usageCount: 0 } });
}));

app.put('/api/discounts/:id', requireAdmin, asyncRoute(async (req, res) => {
  let discount;
  try { discount = validateDiscount(req.body); } catch (error) { return sendError(res, error.status || 400, error.message); }
  const [existing] = await pool.execute('SELECT id FROM discounts WHERE id = ?', [req.params.id]);
  if (!existing.length) return sendError(res, 404, 'Discount code not found.');
  await pool.execute(
    `UPDATE discounts SET code = ?, discount_type = ?, discount_value = ?,
       minimum_order = ?, usage_limit = ?, active = ?, expires_at = ?
     WHERE id = ?`,
    [discount.code, discount.discountType, discount.discountValue, discount.minimumOrder, discount.usageLimit, discount.active, discount.expiresAt, req.params.id]
  );
  res.json({ discount: { id: Number(req.params.id), ...discount } });
}));

app.delete('/api/discounts/:id', requireAdmin, asyncRoute(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM discounts WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return sendError(res, 404, 'Discount code not found.');
  res.status(204).end();
}));

app.use((req, res) => sendError(res, 404, 'API route not found.'));
app.use((error, req, res, next) => {
  console.error(error);
  if (error.code === 'ER_DUP_ENTRY') return sendError(res, 409, 'That order number or discount code already exists.');
  if (error.code === 'ER_NO_REFERENCED_ROW_2') return sendError(res, 400, 'The selected product is not available.');
  return sendError(res, error.status || 500, error.status ? error.message : 'An unexpected server error occurred.');
});

async function start() {
  try {
    await pool.query('SELECT 1');
    await pool.query(
      `CREATE TABLE IF NOT EXISTS customers (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        phone VARCHAR(20) NULL,
        password_hash VARCHAR(160) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS admin_users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(80) NOT NULL UNIQUE,
        password_hash VARCHAR(160) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`
    );
    if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && tokenSecret()) {
      const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);
      await pool.execute(
        `INSERT INTO admin_users (username, password_hash) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
        [process.env.ADMIN_USERNAME.trim(), passwordHash]
      );
    }
    app.listen(port, () => console.log(`Unique Showroom API listening on http://localhost:${port}`));
  } catch (error) {
    console.error('Could not initialize the API database. Check that XAMPP MySQL is running and server/.env matches your database.', error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) start();

module.exports = {
  app,
  createAdminToken,
  hashPassword,
  validateCustomerCredentials,
  validateDiscount,
  verifyAdminToken,
  verifyPassword,
};
