import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { ShowroomHero } from './components/ShowroomHero';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { ServicePackages } from './components/ServicePackages';
import { MaintenanceSchedule } from './components/MaintenanceSchedule';
import { FooterReviews } from './components/FooterReviews';
import { BookingModal } from './components/BookingModal';
import { VideoModal } from './components/VideoModal';
import { StorePage } from './components/StorePage';
import { AboutPage } from './pages/AboutPage';
import { CarsPage } from './pages/CarsPage';
import { PackagesPage } from './pages/PackagesPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { HelpPage } from './pages/HelpPage';
import { createOrder, createServiceBooking } from './services/api';
import { CAR_BRANDS } from './data/carsData';

const APP_BASE_PATH = process.env.PUBLIC_URL
  ? new URL(process.env.PUBLIC_URL, window.location.origin).pathname.replace(/\/$/, '')
  : '';

const getCurrentPath = () => {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const appPath = APP_BASE_PATH
    && (pathname === APP_BASE_PATH || pathname.startsWith(`${APP_BASE_PATH}/`))
    ? pathname.slice(APP_BASE_PATH.length)
    : pathname;
  return appPath.replace(/\/+$/, '') || '/';
};

const getCustomerProfile = () => {
  try {
    return JSON.parse(sessionStorage.getItem('customerProfile') || 'null');
  } catch (error) {
    sessionStorage.removeItem('customerProfile');
    return null;
  }
};

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(CAR_BRANDS[0]);
  const [defaultServiceId, setDefaultServiceId] = useState('ceramic-spa');
  const [currentPath, setCurrentPath] = useState(getCurrentPath);

  // ── Cart State ──
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getCurrentPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((path) => {
    window.history.pushState({}, '', `${APP_BASE_PATH}${path}`);
    setCurrentPath(path);
  }, []);

  const handleOpenBooking = (car = null, serviceId = 'ceramic-spa') => {
    if (car) setSelectedCar(car);
    setDefaultServiceId(serviceId);
    setIsBookingOpen(true);
  };

  // ── Cart Handlers ──
  const handleAddToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const handleUpdateCartQty = useCallback((productId, newQty) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.id === productId ? { ...i, qty: newQty } : i))
      );
    }
  }, []);

  const handleRemoveFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const handleCheckout = useCallback(async (orderDetails) => {
    const order = await createOrder(orderDetails);
    setCartItems([]);
    return order;
  }, []);

  const handleServiceBooking = useCallback(async (bookingDetails) => {
    const booking = await createServiceBooking(bookingDetails);
    return booking;
  }, []);

  const handleCustomerSignOut = () => {
    sessionStorage.removeItem('customerProfile');
    navigateTo('/login');
  };
  const handleAdminSignOut = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    navigateTo('/login');
  }, [navigateTo]);

  return (
    <>
      {currentPath === '/login' ? (
        <LoginPage onNavigate={navigateTo} />
      ) : currentPath.startsWith('/admin') ? (
        sessionStorage.getItem('adminToken')
          ? <AdminPage onNavigate={navigateTo} onSignOut={handleAdminSignOut} />
          : <LoginPage onNavigate={navigateTo} initialMode="admin" />
      ) : currentPath === '/about' ? (
        <AboutPage
          onNavigate={navigateTo}
          customer={getCustomerProfile()}
          onSignOut={handleCustomerSignOut}
          onOpenBooking={() => handleOpenBooking(selectedCar)}
        />
      ) : currentPath === '/cars' ? (
        <CarsPage
          onNavigate={navigateTo}
          onBookCar={(car) => handleOpenBooking(car)}
          customer={getCustomerProfile()}
          onSignOut={handleCustomerSignOut}
        />
      ) : currentPath === '/packages' ? (
        <PackagesPage
          onNavigate={navigateTo}
          onBookPackage={(pkgId, car) => handleOpenBooking(car || selectedCar, pkgId)}
          customer={getCustomerProfile()}
          onSignOut={handleCustomerSignOut}
        />
      ) : currentPath === '/help' ? (
        <HelpPage
          onNavigate={navigateTo}
          customer={getCustomerProfile()}
          onSignOut={handleCustomerSignOut}
          onOpenBooking={() => handleOpenBooking(selectedCar)}
        />
      ) : currentPath === '/maintenance' ? (
        <main className="maintenance-store-page">
          <StorePage
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveFromCart={handleRemoveFromCart}
            onCheckout={handleCheckout}
            onNavigate={navigateTo}
            customerProfile={getCustomerProfile()}
            onSignOut={handleCustomerSignOut}
            onOpenBooking={() => handleOpenBooking(selectedCar)}
          />
          <FooterReviews
            onOpenBooking={() => handleOpenBooking(selectedCar)}
            onNavigate={navigateTo}
          />
        </main>
      ) : (
        <div className="app-viewport">
          <main className="app-center-stage">
            <ShowroomHero
              onOpenBooking={handleOpenBooking}
              onNavigate={navigateTo}
              customer={getCustomerProfile()}
              onCustomerSignOut={handleCustomerSignOut}
            />
            <div className="content-sections-wrapper">
              <BeforeAfterSlider />
              <ServicePackages
                onBookPackage={(pkgId) => handleOpenBooking(selectedCar, pkgId)}
                onNavigate={navigateTo}
              />
              <MaintenanceSchedule
                onBookService={() => handleOpenBooking(selectedCar, 'maintenance-pro')}
              />
              <FooterReviews
                onOpenBooking={() => handleOpenBooking(selectedCar)}
                onNavigate={navigateTo}
              />
            </div>
          </main>
        </div>
      )}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedCar={selectedCar}
        defaultServiceId={defaultServiceId}
        customer={getCustomerProfile()}
        onConfirmBooking={handleServiceBooking}
      />
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </>
  );
}

export default App;
