import { useState, useEffect } from 'react';
import { RouterProvider, useOutletContext, Outlet } from 'react-router-dom';
import { createBrowserRouter } from '@datadog/browser-rum-react/react-router-v6';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  Lock, 
  ArrowRight
} from 'lucide-react';

// Shared components & pages
import type { Product } from './data/products';
import Header from './components/Header';
import Footer from './components/Footer';
import Store from './pages/Store';
import AboutClay from './pages/AboutClay';
import OurStory from './pages/OurStory';

// Define Cart Item Type
interface CartItem {
  product: Product;
  quantity: number;
}

export function AppLayout() {
  // --- States ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [orderId, setOrderId] = useState<string>('');
  
  // Checkout Form Fields (Prefilled with cozy fake details for instant one-click adoption)
  const [formName, setFormName] = useState<string>('Aria Bennett');
  const [formEmail, setFormEmail] = useState<string>('aria.bennett@cozymail.com');
  const [formAddress, setFormAddress] = useState<string>('456 Whimsical Woods Road');
  const [formCity, setFormCity] = useState<string>('Forestville');
  const [formZip, setFormZip] = useState<string>('90210');
  
  // Credit Card Specific Fields (sync to visual card face, prefilled)
  const [cardNumber, setCardNumber] = useState<string>('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('123');
  const [cardNameOnCard, setCardNameOnCard] = useState<string>('ARIA BENNETT');

  // --- Cart Actions ---
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    // Open drawer on add for immediate tactile feedback
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // --- Favorites Toggle ---
  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // --- Calculated Values ---
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingCost = cartSubtotal > 35 ? 0 : 4.99; // Free shipping over $35
  const grandTotal = cartSubtotal + shippingCost;

  // --- Mock Card Input Formatting Helpers ---
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // numbers only
    if (value.length > 16) value = value.slice(0, 16);
    // Format card as "XXXX XXXX XXXX XXXX"
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // numbers only
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvc(value);
  };

  // --- Checkout Flow Control ---
  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false); // Close cart drawer
    setPaymentStep('form');
    setIsCheckoutOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep('processing');
    
    // Simulate a secure, detailed cloud payment gateway validation and charge
    setTimeout(() => {
      const randomId = 'CF-' + Math.floor(100000 + Math.random() * 900000);
      setOrderId(randomId);
      setPaymentStep('success');
      clearCart();
    }, 2500);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setPaymentStep('form');
  };

  // Prevent background scrolling when sheets/modals are active
  useEffect(() => {
    if (isCartOpen || isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, isCheckoutOpen]);

  return (
    <div className="app-container">
      {/* --- SHARED HEADER --- */}
      <Header 
        cartTotalItems={cartTotalItems} 
        onOpenCart={() => setIsCartOpen(true)} 
      />

      {/* --- PAGE ROUTES --- */}
      <Outlet context={{ cart, addToCart, favorites, toggleFavorite }} />

        {/* --- CART DRAWER OVERLAY --- */}
        <div 
          className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
          onClick={() => setIsCartOpen(false)}
        >
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2 className="cart-title">
                <ShoppingCart size={22} />
                <span>Adoption Cart</span>
              </h2>
              <button className="close-drawer-btn" onClick={() => setIsCartOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="empty-cart-view">
                  <span className="empty-cart-emoji">🧸</span>
                  <h3 className="empty-cart-title">Your cart is empty</h3>
                  <p className="empty-cart-p">No tiny companions are waiting here yet! Browse our catalog to find a new friend.</p>
                  <button className="shop-now-btn" onClick={() => setIsCartOpen(false)}>
                    Browse Shop
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.product.id}>
                      <div className="cart-item-img-wrapper">
                        <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
                      </div>
                      <div className="cart-item-details">
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h4 className="cart-item-title">{item.product.name}</h4>
                            <span className="cart-item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Sculpted Clay Pet
                          </p>
                        </div>
                        
                        <div className="cart-item-ctrls">
                          <div className="qty-counter">
                            <button className="qty-btn" onClick={() => updateQuantity(item.product.id, -1)}>
                              <Minus size={12} />
                            </button>
                            <span className="qty-val">{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(item.product.id, 1)}>
                              <Plus size={12} />
                            </button>
                          </div>
                          
                          <button className="remove-item-btn" onClick={() => removeFromCart(item.product.id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-totals-table">
                  <div className="totals-row">
                    <span>Adoption Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="totals-row">
                    <span>Cozy Insured Shipping</span>
                    <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  {shippingCost > 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '-4px' }}>
                      Adopt ${(35 - cartSubtotal).toFixed(2)} more for FREE shipping!
                    </p>
                  )}
                  <div className="totals-row grand-total">
                    <span>Total Contribution</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button className="checkout-btn" onClick={handleStartCheckout}>
                  <Lock size={16} />
                  <span>Proceed to Adoption Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- CHECKOUT MODAL --- */}
        <div className={`modal-overlay ${isCheckoutOpen ? 'open' : ''}`} onClick={handleCloseCheckout}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <h2 className="checkout-modal-title">
                <Lock size={20} style={{ color: 'var(--primary)' }} />
                <span>Adoption Checkout Portal</span>
              </h2>
              {paymentStep !== 'processing' && (
                <button className="close-drawer-btn" onClick={handleCloseCheckout}>
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="checkout-modal-body">
              {/* STEP 1: BILLING & PAYMENT FORM */}
              {paymentStep === 'form' && (
                <form className="checkout-form" onSubmit={handlePaymentSubmit}>
                  <div className="checkout-cols">
                    {/* Left Column: Form Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <div className="checkout-form-section">
                        <h3>1. Delivery Address</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              required 
                              placeholder="Aria Bennett"
                              value={formName}
                              onChange={(e) => {
                                setFormName(e.target.value);
                                if (!cardNameOnCard) setCardNameOnCard(e.target.value.toUpperCase());
                              }}
                            />
                          </div>
                          <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input 
                              type="email" 
                              className="input-field" 
                              required 
                              placeholder="aria@example.com"
                              value={formEmail}
                              onChange={(e) => setFormEmail(e.target.value)}
                            />
                          </div>
                          <div className="input-group">
                            <label className="input-label">Street Address</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              required 
                              placeholder="456 Whimsical Woods Rd"
                              value={formAddress}
                              onChange={(e) => setFormAddress(e.target.value)}
                            />
                          </div>
                          <div className="input-row">
                            <div className="input-group">
                              <label className="input-label">City</label>
                              <input 
                                type="text" 
                                className="input-field" 
                                required 
                                placeholder="Forestville"
                                value={formCity}
                                onChange={(e) => setFormCity(e.target.value)}
                              />
                            </div>
                            <div className="input-group">
                              <label className="input-label">ZIP Code</label>
                              <input 
                                type="text" 
                                className="input-field" 
                                required 
                                placeholder="90210"
                                value={formZip}
                                onChange={(e) => setFormZip(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Visual Credit Card and Order Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="checkout-form-section">
                        <h3>2. Mock Credit Card</h3>
                        
                        {/* Interactive CSS Card */}
                        <div className="mock-credit-card">
                          <div className="mock-card-glow"></div>
                          <div className="mock-card-header">
                            <span className="mock-card-logo">CLAY CARD</span>
                            <span style={{ fontSize: '1.25rem' }}>💳</span>
                          </div>
                          <div className="mock-card-chip"></div>
                          <div className="mock-card-number">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>
                          <div className="mock-card-footer">
                            <div>
                              <div className="mock-card-holder">Cardholder</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cardNameOnCard || 'YOUR NAME'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div className="mock-card-holder">Expires</div>
                              <div className="mock-card-expiry">{cardExpiry || 'MM/YY'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Card Inputs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          <div className="input-group">
                            <label className="input-label">Cardholder Name</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              required 
                              placeholder="ARIA BENNETT"
                              value={cardNameOnCard}
                              onChange={(e) => setCardNameOnCard(e.target.value.toUpperCase())}
                            />
                          </div>
                          <div className="input-group">
                            <label className="input-label">Card Number</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              required 
                              placeholder="4111 2222 3333 4444"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                            />
                          </div>
                          <div className="input-row">
                            <div className="input-group">
                              <label className="input-label">Expiry (MM/YY)</label>
                              <input 
                                type="text" 
                                className="input-field" 
                                required 
                                placeholder="12/28"
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                              />
                            </div>
                            <div className="input-group">
                              <label className="input-label">CVC (3 digits)</label>
                              <input 
                                type="password" 
                                className="input-field" 
                                required 
                                placeholder="***"
                                value={cardCvc}
                                onChange={handleCvcChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Review Box */}
                      <div className="checkout-summary-box">
                        <h4 className="checkout-summary-title">Summary</h4>
                        <div className="checkout-summary-list">
                          {cart.map(item => (
                            <div className="checkout-summary-item" key={item.product.id}>
                              <span>{item.product.name} (x{item.quantity})</span>
                              <strong>${(item.product.price * item.quantity).toFixed(2)}</strong>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
                          <span>Total Paid Contribution</span>
                          <span>${grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="checkout-btn" style={{ maxWidth: '280px' }}>
                      <span>Complete Mock Secure Charge</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: PROCESSING MOCK PAYMENT */}
              {paymentStep === 'processing' && (
                <div className="processing-container">
                  <div className="spinner-clay"></div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Securely sculpting connection...</h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
                    Our mock polymer payment validator is sculpting your transaction token and validating card details. Please hold steady!
                  </p>
                </div>
              )}

              {/* STEP 3: TRANSACTION SUCCESS */}
              {paymentStep === 'success' && (
                <div className="success-container">
                  <div className="success-clay-icon">📦✨🧸</div>
                  <div className="order-id-badge">Order ID: {orderId}</div>
                  <h2 className="success-h2">Adoption Confirmed!</h2>
                  <p className="success-p">
                    Thank you so much, <strong>{formName || 'friend'}</strong>! Your clay companions have officially been adopted. 
                    We are tucking them cozy inside insulated boxes with bubble wraps, and shipping them straight to:
                  </p>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)', maxWidth: '380px' }}>
                    <strong>{formAddress}</strong>, {formCity}, {formZip}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    A confirmation email has been sent to <strong>{formEmail || 'your email'}</strong>. Let the cozy clay friendships begin!
                  </p>
                  <button className="continue-shopping-btn" onClick={handleCloseCheckout}>
                    Continue Browsing Shop
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- SHARED FOOTER --- */}
        <Footer />
      </div>
  );
}

// Wrapper for Store to inject layout context props
function StoreRoute() {
  const { cart, addToCart, favorites, toggleFavorite } = useOutletContext<{
    cart: CartItem[];
    addToCart: (product: Product) => void;
    favorites: string[];
    toggleFavorite: (productId: string) => void;
  }>();
  
  return (
    <Store 
      cart={cart} 
      onAddToCart={addToCart} 
      favorites={favorites} 
      onToggleFavorite={toggleFavorite} 
    />
  );
}

// Cute clay-themed Error Fallback Component
function ErrorFallback({ resetError, error }: { resetError: () => void; error: any }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: 'var(--bg-primary, #fbfaf7)',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary, #ffffff)',
        borderRadius: '24px',
        padding: '3rem 2rem',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(139, 115, 85, 0.08)',
        border: '1px solid var(--border-color, #efece6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{
          fontSize: '4rem',
          filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.05))',
        }}>🩹🧸</div>
        
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          color: 'var(--text-primary, #2d2621)',
          margin: 0
        }}>Barnaby got a bit stuck!</h1>
        
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary, #60524a)',
          lineHeight: '1.6',
          margin: 0
        }}>
          One of our clay companions took an unexpected spill while baking. Our real-time monitoring (Datadog RUM) has been notified and our studio sculptors are on the case!
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '12px',
            padding: '1rem',
            width: '100%',
            textAlign: 'left',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            <code style={{
              fontSize: '0.8rem',
              color: '#dc2626',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap'
            }}>
              {error.toString()}
            </code>
          </div>
        )}
        
        <button 
          onClick={resetError} 
          className="shop-now-btn" 
          style={{
            marginTop: '0.5rem',
            padding: '0.8rem 2rem',
            borderRadius: '50px',
            backgroundColor: 'var(--primary, #8e6c4e)',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(142, 108, 78, 0.2)'
          }}
        >
          Carefully Re-bake App
        </button>
      </div>
    </div>
  );
}

// Configure Router with Datadog-integrated Router
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '',
        element: <StoreRoute />
      },
      {
        path: 'clay',
        element: <AboutClay />
      },
      {
        path: 'story',
        element: <OurStory />
      }
    ]
  }
]);

// Main App wrapped with Datadog ErrorBoundary
export default function App() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
