import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ShoppingCart, X, Plus, Minus, Trash2, Search, SlidersHorizontal,
  Star, Package, ArrowRight, ChevronDown, CheckCircle, Truck, Shield, Check
} from 'lucide-react';
import { STORE_CATEGORIES, STORE_PRODUCTS } from '../data/storeData';
import { SiteHeader } from './SiteHeader';

/* ═══════════════════════════════════════════════════════════
   CART SIDEBAR COMPONENT
════════════════════════════════════════════════════════════ */
const CartSidebar = ({ cartItems, onUpdateQty, onRemove, onClose, onCheckout, isSignedIn }) => {
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const totalSavings = cartItems.reduce((s, i) => s + ((i.originalPrice || i.price) - i.price) * i.qty, 0);

  return (
    <div className="cart-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cart-sidebar">
        {/* Header */}
        <div className="cart-header">
          <div>
            <h2 className="cart-title">Your Cart</h2>
            <span className="cart-count-label">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingCart size={48} strokeWidth={1} />
              <h3>Your cart is empty</h3>
              <p>Add premium maintenance products to get started</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                  />
                  <span className="cart-item-img-fallback" style={{display:'none'}}>🛒</span>
                </div>
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-sub">{item.subtitle}</p>
                  <div className="cart-item-price-row">
                    <span className="cart-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    {item.originalPrice && (
                      <span className="cart-item-original">₹{(item.originalPrice * item.qty).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button onClick={() => onUpdateQty(item.id, item.qty - 1)} aria-label="Decrease quantity">
                      <Minus size={12} />
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, item.qty + 1)} aria-label="Increase quantity">
                      <Plus size={12} />
                    </button>
                  </div>
                  <button className="remove-item-btn" onClick={() => onRemove(item.id)} aria-label="Remove item">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            {totalSavings > 0 && (
              <div className="cart-savings-bar">
                <CheckCircle size={14} />
                <span>You save ₹{totalSavings.toLocaleString('en-IN')} on this order!</span>
              </div>
            )}
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="cart-shipping-note">
              <Truck size={13} />
              <span>Free delivery on orders above ₹999 across India</span>
            </div>
            <button className="checkout-btn" onClick={onCheckout}>
              {isSignedIn ? 'Proceed to Checkout' : 'Sign in to checkout'} <ArrowRight size={16} />
            </button>
            <button className="continue-shopping-btn" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD COMPONENT
════════════════════════════════════════════════════════════ */
const ProductCard = ({ product, onAddToCart, cartQty }) => {
  return (
    <div className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`}>
      {/* Product Image */}
      <div className="product-image-area">
        <img
          src={product.image}
          alt={product.name}
          className="product-real-img"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
          }}
        />
        {!product.inStock && (
          <div className="out-of-stock-overlay">Out of Stock</div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-body">
        <div className="product-rating-row">
          <Star size={12} fill="#f59e0b" color="#f59e0b" />
          <span className="product-rating">{product.rating}</span>
          <span className="product-reviews">({product.reviews} reviews)</span>
        </div>

        <h3 className="product-name">{product.name}</h3>
        <p className="product-subtitle">{product.subtitle}</p>

        <div className="product-specs-row">
          {product.specs.map((spec, i) => (
            <span key={i} className="product-spec-tag">{spec}</span>
          ))}
        </div>

        <div className="product-price-row">
          <div className="price-group">
            <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="product-orig-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        {product.inStock ? (
          cartQty > 0 ? (
            <div className="in-cart-indicator">
              <CheckCircle size={15} />
              <span>{cartQty} in cart</span>
              <button className="add-more-btn" onClick={() => onAddToCart(product)}>
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              className="add-to-cart-btn"
              onClick={() => onAddToCart(product)}
              id={`add-to-cart-${product.id}`}
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          )
        ) : (
          <button className="notify-btn" disabled>
            Notify When Available
          </button>
        )}
      </div>
    </div>
  );
};

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
];

/* ═══════════════════════════════════════════════════════════
   MAIN STORE PAGE COMPONENT
════════════════════════════════════════════════════════════ */
export const StorePage = ({ cartItems, onAddToCart, onUpdateCartQty, onRemoveFromCart, onCheckout, onNavigate, customerProfile, onRequireSignIn, resumeCheckout, onCheckoutResume, onSignOut, onOpenBooking }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: customerProfile?.name || '',
    email: customerProfile?.email || '',
    phone: customerProfile?.phone || '',
    address: '',
  });
  const [discountCode, setDiscountCode] = useState('');

  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  useEffect(() => {
    if (resumeCheckout && customerProfile && cartItems.length > 0) {
      setIsCartOpen(false);
      setCheckoutError('');
      setIsCheckoutOpen(true);
      onCheckoutResume();
    }
  }, [resumeCheckout, customerProfile, cartItems.length, onCheckoutResume]);

  const totalCartItems = cartItems.reduce((s, i) => s + i.qty, 0);

  const filteredProducts = useMemo(() => {
    let items = STORE_PRODUCTS;

    // Category filter
    if (activeCategory !== 'all') {
      items = items.filter((p) => p.category === activeCategory);
    }

    // In-stock checkbox filter
    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    // Top-rated checkbox filter
    if (topRatedOnly) {
      items = items.filter((p) => p.rating >= 4.7);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        return [...items].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...items].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...items].sort((a, b) => b.rating - a.rating);
      case 'reviews':
        return [...items].sort((a, b) => b.reviews - a.reviews);
      default:
        return items; // featured / default order
    }
  }, [activeCategory, searchQuery, sortBy, inStockOnly, topRatedOnly]);

  const getCartQty = (productId) => {
    const item = cartItems.find((i) => i.id === productId);
    return item ? item.qty : 0;
  };

  const openCheckout = () => {
    if (!customerProfile) {
      onRequireSignIn();
      return;
    }
    setIsCartOpen(false);
    setCheckoutError('');
    setIsCheckoutOpen(true);
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      await onCheckout({
        customer,
        items: cartItems.map(({ id, qty }) => ({ id, qty })),
        discountCode: discountCode.trim() || null,
      });
      setIsCheckoutOpen(false);
      setOrderPlaced(true);
      setTimeout(() => setOrderPlaced(false), 4000);
      setCustomer({ name: '', email: '', phone: '', address: '' });
      setDiscountCode('');
    } catch (error) {
      setCheckoutError(error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="store-full-page">
      <SiteHeader onNavigate={onNavigate} currentPage="store" customer={customerProfile} onSignOut={onSignOut} onOpenBooking={onOpenBooking} />
      <section className="store-page-wrapper" id="store">
      {/* ── Store Top Bar ── */}
      <div className="store-top-bar">
        <div className="store-top-content">
          <div className="store-heading-block">
            <div className="section-mini-tag">
              <Package size={13} /> Auto Parts &amp; Products
            </div>
            <h2 className="store-main-heading">Premium Maintenance Store</h2>
            <p className="store-sub-heading">
              Genuine oils, filters, coatings &amp; care products — delivered to your doorstep across India.
            </p>
          </div>

          {/* Cart Button */}
          <button
            className="store-cart-fab"
            onClick={() => setIsCartOpen(true)}
            id="open-cart-btn"
            aria-label="Open cart"
          >
            <ShoppingCart size={20} />
            {totalCartItems > 0 && (
              <span className="cart-fab-count">{totalCartItems}</span>
            )}
            {totalCartItems > 0 && (
              <span className="cart-fab-label">
                ₹{cartItems.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString('en-IN')}
              </span>
            )}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="store-trust-bar">
          <div className="store-trust-item">
            <Truck size={16} /> <span>Free delivery above ₹999</span>
          </div>
          <div className="store-trust-item">
            <Shield size={16} /> <span>100% Genuine Products</span>
          </div>
          <div className="store-trust-item">
            <CheckCircle size={16} /> <span>30-Day Easy Returns</span>
          </div>
          <div className="store-trust-item">
            <Package size={16} /> <span>Pan India Delivery</span>
          </div>
        </div>
      </div>

      {/* ── Order Success Toast ── */}
      {orderPlaced && (
        <div className="order-success-toast">
          <CheckCircle size={20} />
          <span>Order submitted! The showroom team will review and approve it.</span>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="checkout-overlay" onClick={(event) => event.target === event.currentTarget && !checkoutLoading && setIsCheckoutOpen(false)}>
          <form className="checkout-dialog" onSubmit={handleCheckout}>
            <div className="checkout-dialog-heading">
              <div><span className="checkout-dialog-icon"><Package size={19} /></span><span><h3>Delivery details</h3><p>Where should we send your order?</p></span></div>
              <button type="button" onClick={() => setIsCheckoutOpen(false)} aria-label="Close checkout"><X size={19} /></button>
            </div>
            <label>Full name<input required maxLength="120" autoComplete="name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></label>
            <div className="checkout-form-row">
              <label>Email address<input required type="email" maxLength="190" autoComplete="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /></label>
              <label>Phone number<input required type="tel" maxLength="20" autoComplete="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /></label>
            </div>
            <label>Delivery address<textarea required maxLength="500" rows="3" autoComplete="street-address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} /></label>
            <label>Discount code <span className="checkout-optional">optional</span><input maxLength="32" value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} placeholder="Enter a code" /></label>
            {checkoutError && <div className="checkout-error" role="alert">{checkoutError}</div>}
            <div className="checkout-total-row"><span>Order total</span><b>₹{cartItems.reduce((sum, item) => sum + item.price * item.qty, 0).toLocaleString('en-IN')}</b></div>
            <button className="checkout-submit-btn" disabled={checkoutLoading || cartItems.length === 0}>{checkoutLoading ? 'Submitting order…' : 'Place order for approval'} <ArrowRight size={16} /></button>
            <p className="checkout-admin-note">Your order will be reviewed by our showroom team before fulfilment.</p>
          </form>
        </div>
      )}

      {/* ── Filters & Search Row ── */}
      <div className="store-filters-row">
        <div className="store-search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search oils, filters, coatings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="store-search-input"
            id="store-search-input"
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick Checkbox Filter Pills */}
        <div className="store-quick-checkboxes">
          <label className={`quick-checkbox-pill ${inStockOnly ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="sr-only"
            />
            <span className={`custom-checkbox-box ${inStockOnly ? 'checked' : ''}`}>
              {inStockOnly && <Check size={11} strokeWidth={3} />}
            </span>
            <span>In Stock Only</span>
          </label>
          <label className={`quick-checkbox-pill ${topRatedOnly ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={topRatedOnly}
              onChange={(e) => setTopRatedOnly(e.target.checked)}
              className="sr-only"
            />
            <span className={`custom-checkbox-box ${topRatedOnly ? 'checked' : ''}`}>
              {topRatedOnly && <Check size={11} strokeWidth={3} />}
            </span>
            <span>4.7+ ★ Rated</span>
          </label>
        </div>

        {/* Custom Luxury Sort Dropdown with Checkboxes */}
        <div className="store-sort-dropdown-wrap" ref={sortDropdownRef}>
          <button
            type="button"
            className={`store-sort-btn ${isSortOpen ? 'open' : ''}`}
            onClick={() => setIsSortOpen((prev) => !prev)}
            id="store-sort-select"
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
          >
            <SlidersHorizontal size={14} className="sort-icon" />
            <span className="sort-btn-label">
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Featured'}
            </span>
            <ChevronDown size={13} className={`select-arrow ${isSortOpen ? 'rotated' : ''}`} />
          </button>

          {isSortOpen && (
            <div className="store-custom-dropdown-popover" role="listbox">
              <div className="dropdown-section-title">Sort Selection</div>
              <div className="dropdown-checkbox-group">
                {SORT_OPTIONS.map((opt) => {
                  const isChecked = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`dropdown-checkbox-row ${isChecked ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(opt.value);
                        setIsSortOpen(false);
                      }}
                      role="option"
                      aria-selected={isChecked}
                    >
                      <span className={`custom-checkbox-box ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span className="dropdown-row-label">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="dropdown-popover-divider" />

              <div className="dropdown-section-title">Filter Checkboxes</div>
              <div className="dropdown-checkbox-group">
                <button
                  type="button"
                  className={`dropdown-checkbox-row ${inStockOnly ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInStockOnly((prev) => !prev);
                  }}
                >
                  <span className={`custom-checkbox-box ${inStockOnly ? 'checked' : ''}`}>
                    {inStockOnly && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="dropdown-row-label">In-Stock Items Only</span>
                </button>

                <button
                  type="button"
                  className={`dropdown-checkbox-row ${topRatedOnly ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTopRatedOnly((prev) => !prev);
                  }}
                >
                  <span className={`custom-checkbox-box ${topRatedOnly ? 'checked' : ''}`}>
                    {topRatedOnly && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="dropdown-row-label">Top Rated (4.7+ ★)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div className="store-category-tabs">
        {STORE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`store-cat-tab ${activeCategory === cat.id ? 'active-cat' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            id={`cat-tab-${cat.id}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Results Count ── */}
      <div className="store-results-count">
        Showing <strong>{filteredProducts.length}</strong> product{filteredProducts.length !== 1 ? 's' : ''}
        {activeCategory !== 'all' && (
          <span> in {STORE_CATEGORIES.find((c) => c.id === activeCategory)?.label}</span>
        )}
        {searchQuery && <span> for "{searchQuery}"</span>}
      </div>

      {/* ── Products Grid ── */}
      {filteredProducts.length > 0 ? (
        <div className="store-products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              cartQty={getCartQty(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="store-empty-results">
          <Search size={48} strokeWidth={1} />
          <h3>No products found</h3>
          <p>Try adjusting your search or category filter</p>
          <button
            className="reset-filters-btn"
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── Cart Sidebar ── */}
      {isCartOpen && (
        <CartSidebar
          cartItems={cartItems}
          onUpdateQty={onUpdateCartQty}
          onRemove={onRemoveFromCart}
          onClose={() => setIsCartOpen(false)}
          onCheckout={openCheckout}
          isSignedIn={Boolean(customerProfile)}
        />
      )}
      </section>
    </div>
  );
};
