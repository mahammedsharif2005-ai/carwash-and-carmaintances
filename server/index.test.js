const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAdminToken, hashPassword, validateCustomerCredentials,
  validateDiscount, verifyAdminToken, verifyPassword,
} = require('./index');

test('admin sessions are signed and expire after eight hours', () => {
  const secret = 'test-secret';
  const now = 1_800_000_000_000;
  const token = createAdminToken('admin', secret, now);

  assert.equal(verifyAdminToken(token, secret, now), true);
  assert.equal(verifyAdminToken(token, 'different-secret', now), false);
  assert.equal(verifyAdminToken(token, secret, now + 8 * 60 * 60 * 1000 + 1000), false);
});

test('password hashes are salted and only verify the matching password', async () => {
  const firstHash = await hashPassword('correct-horse-battery');
  const secondHash = await hashPassword('correct-horse-battery');

  assert.ok(firstHash.length <= 160);
  assert.notEqual(firstHash, secondHash);
  assert.equal(await verifyPassword('correct-horse-battery', firstHash), true);
  assert.equal(await verifyPassword('incorrect-password', firstHash), false);
  assert.equal(await verifyPassword('correct-horse-battery', 'invalid'), false);
});

test('normalizes customer credentials and rejects weak passwords', () => {
  assert.deepEqual(validateCustomerCredentials({
    name: ' Aanya Mehta ',
    email: ' AANYA@example.com ',
    phone: '+91 9876543210',
    password: 'securepass123',
  }), {
    name: 'Aanya Mehta',
    email: 'aanya@example.com',
    phone: '+91 9876543210',
    password: 'securepass123',
  });
  assert.throws(
    () => validateCustomerCredentials({ email: 'aanya@example.com', password: 'short' }),
    /between 8 and 120/
  );
});

test('normalizes valid discount codes and supports unlimited usage', () => {
  const discount = validateDiscount({
    code: '  welcome_10 ',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrder: 1000,
    active: true,
  });

  assert.equal(discount.code, 'WELCOME_10');
  assert.equal(discount.usageLimit, null);
  assert.equal(discount.active, 1);
});

test('rejects percentage discounts above 100 percent', () => {
  assert.throws(
    () => validateDiscount({ code: 'SAVE', discountType: 'percentage', discountValue: 101 }),
    /cannot exceed 100%/
  );
});

test('rejects malformed expiry dates', () => {
  assert.throws(
    () => validateDiscount({ code: 'SAVE', discountType: 'fixed', discountValue: 100, expiresAt: '2026-02-30' }),
    /valid date/
  );
});
