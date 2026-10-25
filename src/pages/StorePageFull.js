import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, X, Plus, Minus, Trash2, Search, SlidersHorizontal,
  Star, Package, ArrowRight, ChevronDown, CheckCircle, Truck, Shield,
  ChevronLeft, Home, Check
} from 'lucide-react';
import { STORE_CATEGORIES, STORE_PRODUCTS } from '../data/storeData';

/* ═══════════════════════════════════════════════════════════
   STORE NAVBAR
════════════════════════════════════════════════════════════ */
const StoreNavbar = ({ cartCount, cartTotal, onOpenCart }) => (
  <header className="store-navbar">
    <div className="store-navbar-inner">
      {/* Left: Logo + Back */}
      <div className="store-nav-left">
        <Link to="/" className="store-back-btn" aria-label="Back to Home">
          <ChevronLeft size={16} />
          <Home size={15} />
        </Link>
        <div className="store-nav-logo">
          <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor">
            <path d="M16 3C8.82 3 3 8.82 3 16C3 23.18 8.82 29 16 29C22.25 29 27.46 24.6 28.72 18.72H19.5C18.6 19.5 17.38 20 16 20C13.79 20 12 18.21 12 16C12 13.79 13.79 12 16 12C17.38 12 18.6 12.5 19.5 13.28H28.72C27.46 7.4 22.25 3 16 3Z" />
          </svg>
          <span className="store-nav-brand">Unique</span>
          <span className="store-nav-divider">|</span>
          <span className="store-nav-section">Parts Store</span>
        </div>
      </div>

      {/* Center: nav links */}
      <nav className="store-nav-links-center">
        <a href="#engine" className="store-nav-link">Engine & Oil</a>
        <a href="#wash" className="store-nav-link">Car Wash</a>
        <a href="#filters" className="store-nav-link">Filters</a>
        <a href="#tires" className="store-nav-link">Tyres & Wheels</a>
        <a href="#interior" className="store-nav-link">Interior</a>
        <a href="#protection" className="store-nav-link">Paint Protection</a>
      </nav>

      {/* Right: Cart */}
      <button className="store-nav-cart-btn" onClick={onOpenCart} aria-label="Open cart" id="navbar-cart-btn">
        <ShoppingCart size={18} />
        <span>Cart</span>
        {cartCount > 0 && (
          <>
            <span className="nav-cart-badge">{cartCount}</span>
            <span className="nav-cart-total">₹{cartTotal.toLocaleString('en-IN')}</span>
          </>
        )}
      </button>
    </div>
  </header>
);

/* ═══════════════════════════════════════════════════════════
   CART SIDEBAR
════════════════════════════════════════════════════════════ */
const CartSidebar = ({ cartItems, onUpdateQty, onRemove, onClose, onCheckout }) => {
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
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart"><X size={20} /></button>
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
                  <img src={item.image} alt={item.name} className="cart-item-img"
                    onError={(e) => { e.target.style.display = 'none'; }} />
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
                    <button onClick={() => onUpdateQty(item.id, item.qty - 1)}><Minus size={12} /></button>
                    <span>{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, item.qty + 1)}><Plus size={12} /></button>
                  </div>
                  <button className="remove-item-btn" onClick={() => onRemove(item.id)}><Trash2 size={14} /></button>
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
            <div className="cart-shipping-note"><Truck size={13} /><span>Free delivery on orders above ₹999 across India</span></div>
            <button className="checkout-btn" onClick={onCheckout}>Proceed to Checkout <ArrowRight size={16} /></button>
            <button className="continue-shopping-btn" onClick={onClose}>Continue Shopping</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD
════════════════════════════════════════════════════════════ */
const ProductCard = ({ product, onAddToCart, cartQty }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

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
        {product.badge && (
          <div className="product-badge" style={{ background: product.badgeColor }}>{product.badge}</div>
        )}
        {discount && <div className="product-discount-tag">-{discount}%</div>}
        {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
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
          {discount && <span className="save-tag">Save {discount}%</span>}
        </div>

        {product.inStock ? (
          cartQty > 0 ? (
            <div className="in-cart-indicator">
              <CheckCircle size={15} />
              <span>{cartQty} in cart</span>
              <button className="add-more-btn" onClick={() => onAddToCart(product)}><Plus size={13} /></button>
            </div>
          ) : (
            <button className="add-to-cart-btn" onClick={() => onAddToCart(product)} id={`add-${product.id}`}>
              <ShoppingCart size={15} />Add to Cart
            </button>
          )
        ) : (
          <button className="notify-btn" disabled>Notify When Available</button>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   STORE PAGE — SEPARATE FULL PAGE
════════════════════════════════════════════════════════════ */
export const StorePageFull = () => {
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

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

  const totalCartItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  /* ── Cart handlers ── */
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleUpdateQty = (id, qty) => {
    if (qty <= 0) setCartItems((prev) => prev.filter((i) => i.id !== id));
    else setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };

  const handleRemove = (id) => setCartItems((prev) => prev.filter((i) => i.id !== id));

  const handleCheckout = () => {
    setIsCartOpen(false);
    setOrderPlaced(true);
    setTimeout(() => { setCartItems([]); setOrderPlaced(false); }, 3500);
  };

  /* ── Filtered & Sorted products ── */
  const filteredProducts = useMemo(() => {
    let items = STORE_PRODUCTS;
    if (activeCategory !== 'all') items = items.filter((p) => p.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((p) =>
        p.name.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'price-asc': return [...items].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...items].sort((a, b) => b.price - a.price);
      case 'rating': return [...items].sort((a, b) => b.rating - a.rating);
      case 'reviews': return [...items].sort((a, b) => b.reviews - a.reviews);
      default: return items;
    }
  }, [activeCategory, searchQuery, sortBy]);

  const getCartQty = (id) => cartItems.find((i) => i.id === id)?.qty || 0;

  return (
    <div className="store-full-page">
      {/* Sticky Navbar */}
      <StoreNavbar
        cartCount={totalCartItems}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* ── Hero Banner ── */}
      <div className="store-hero-banner">
        <div className="store-hero-content">
          <div className="store-hero-tag">
            <Package size={14} /> Auto Parts &amp; Maintenance Products
          </div>
          <h1 className="store-hero-title">Premium Maintenance Store</h1>
          <p className="store-hero-subtitle">
            Genuine oils, filters, coatings &amp; care products — pan India delivery within 2–4 days.
          </p>
          <div className="store-hero-stats">
            <div className="store-stat"><strong>14+</strong><span>Products</span></div>
            <div className="store-stat-divider" />
            <div className="store-stat"><strong>100%</strong><span>Genuine</span></div>
            <div className="store-stat-divider" />
            <div className="store-stat"><strong>30-Day</strong><span>Returns</span></div>
            <div className="store-stat-divider" />
            <div className="store-stat"><strong>Free</strong><span>Above ₹999</span></div>
          </div>
        </div>
      </div>

      {/* ── Trust Bar ── */}
      <div className="store-trust-strip">
        <div className="store-trust-strip-inner">
          <div className="trust-strip-item"><Truck size={16} /><span>Free delivery above ₹999</span></div>
          <div className="trust-strip-sep" />
          <div className="trust-strip-item"><Shield size={16} /><span>100% Genuine Products</span></div>
          <div className="trust-strip-sep" />
          <div className="trust-strip-item"><CheckCircle size={16} /><span>30-Day Easy Returns</span></div>
          <div className="trust-strip-sep" />
          <div className="trust-strip-item"><Package size={16} /><span>Pan India Delivery</span></div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="store-main-layout">
        {/* ── Left Sidebar — Categories ── */}
        <aside className="store-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Categories</h3>
            <ul className="sidebar-cat-list">
              {STORE_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    className={`sidebar-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                    id={`sidebar-cat-${cat.id}`}
                  >
                    <span>{cat.label}</span>
                    <span className="sidebar-cat-count">
                      {cat.id === 'all' ? STORE_PRODUCTS.length : STORE_PRODUCTS.filter(p => p.category === cat.id).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price range info */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Sort By</h3>
            <ul className="sidebar-cat-list">
              {[
                { value: 'featured', label: 'Featured' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
                { value: 'rating', label: 'Top Rated' },
                { value: 'reviews', label: 'Most Reviewed' },
              ].map((opt) => (
                <li key={opt.value}>
                  <button
                    className={`sidebar-cat-btn ${sortBy === opt.value ? 'active' : ''}`}
                    onClick={() => setSortBy(opt.value)}
                  >
                    <span>{opt.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Back to Main Site */}
          <div className="sidebar-section">
            <Link to="/" className="sidebar-back-home-btn">
              <ChevronLeft size={15} /> Back to Main Site
            </Link>
          </div>
        </aside>

        {/* ── Right — Products ── */}
        <div className="store-products-panel">
          {/* Toolbar */}
          <div className="store-toolbar">
            {/* Search */}
            <div className="store-search-bar">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="store-search-input"
                id="store-search"
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')}><X size={14} /></button>
              )}
            </div>

            {/* Custom Luxury Sort Dropdown with Checkboxes */}
            <div className="store-sort-dropdown-wrap" ref={sortDropdownRef}>
              <button
                type="button"
                className={`store-sort-btn ${isSortOpen ? 'open' : ''}`}
                onClick={() => setIsSortOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <SlidersHorizontal size={14} className="sort-icon" />
                <span className="sort-btn-label">
                  {[
                    { value: 'featured', label: 'Featured' },
                    { value: 'price-asc', label: 'Price: Low → High' },
                    { value: 'price-desc', label: 'Price: High → Low' },
                    { value: 'rating', label: 'Top Rated' },
                    { value: 'reviews', label: 'Most Reviewed' },
                  ].find((o) => o.value === sortBy)?.label || 'Featured'}
                </span>
                <ChevronDown size={13} className={`select-arrow ${isSortOpen ? 'rotated' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="store-custom-dropdown-popover" role="listbox">
                  <div className="dropdown-section-title">Sort Selection</div>
                  <div className="dropdown-checkbox-group">
                    {[
                      { value: 'featured', label: 'Featured' },
                      { value: 'price-asc', label: 'Price: Low → High' },
                      { value: 'price-desc', label: 'Price: High → Low' },
                      { value: 'rating', label: 'Top Rated' },
                      { value: 'reviews', label: 'Most Reviewed' },
                    ].map((opt) => {
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
                </div>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="store-results-count">
            Showing <strong>{filteredProducts.length}</strong> product{filteredProducts.length !== 1 ? 's' : ''}
            {activeCategory !== 'all' && <span> in {STORE_CATEGORIES.find(c => c.id === activeCategory)?.label}</span>}
            {searchQuery && <span> for "{searchQuery}"</span>}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="store-products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  cartQty={getCartQty(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="store-empty-results">
              <Search size={48} strokeWidth={1} />
              <h3>No products found</h3>
              <p>Try adjusting your search or category filter</p>
              <button className="reset-filters-btn" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Cart Sidebar ── */}
      {isCartOpen && (
        <CartSidebar
          cartItems={cartItems}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemove}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />
      )}

      {/* ── Success Toast ── */}
      {orderPlaced && (
        <div className="order-success-toast">
          <CheckCircle size={20} />
          <span>Order placed successfully! Confirmation SMS sent.</span>
        </div>
      )}

      {/* ── Store Footer ── */}
      <footer className="store-page-footer">
        <div className="store-footer-inner">
          <div className="store-footer-brand">
            <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
              <path d="M16 3C8.82 3 3 8.82 3 16C3 23.18 8.82 29 16 29C22.25 29 27.46 24.6 28.72 18.72H19.5C18.6 19.5 17.38 20 16 20C13.79 20 12 18.21 12 16C12 13.79 13.79 12 16 12C17.38 12 18.6 12.5 19.5 13.28H28.72C27.46 7.4 22.25 3 16 3Z" />
            </svg>
            <span>Unique Car Care &amp; Parts</span>
          </div>
          <span className="store-footer-copy">© {new Date().getFullYear()} Unique Car Care India Pvt. Ltd. All rights reserved.</span>
          <Link to="/" className="store-footer-home-link">← Back to Main Site</Link>
        </div>
      </footer>
    </div>
  );
};
