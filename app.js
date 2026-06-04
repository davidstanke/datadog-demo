import tracer from 'dd-trace';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173; // Matching the simulation port or dev standard

// Configure Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Configure Session for Cart State
app.use(session({
  secret: 'cozy-canine-clay-figurines-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: false // Set to true if using HTTPS
  }
}));

// Dog Figurine Catalog
const PRODUCTS = [
  {
    id: 'cooper',
    name: 'Cooper the Corgi',
    category: 'herding',
    price: 18.50,
    description: 'A fluffy, stubby-legged clay Pembroke Welsh Corgi wearing a tiny knitted red collar. Cooper loves lounging in miniature moss-covered clay gardens.',
    image: '/images/corgi.png',
    bgGradient: 'from-orange-100 to-amber-50',
    borderColor: 'border-orange-200',
    tag: 'Best Seller',
    isBestSeller: true
  },
  {
    id: 'hachi',
    name: 'Hachi the Shiba Inu',
    category: 'companion',
    price: 19.50,
    description: 'A proud, smiling Shiba Inu sitting on a miniature moss-covered clay stone. Hachi captures the gentle and loyal spirit of the breed with realistic clay texture.',
    image: '/images/shiba.png',
    bgGradient: 'from-amber-100 to-yellow-50',
    borderColor: 'border-amber-200',
    tag: 'New Release'
  },
  {
    id: 'bella',
    name: 'Bella the Golden Retriever',
    category: 'sporting',
    price: 18.00,
    description: 'A happy, golden-furred puppy with a tiny hand-sculpted clay tennis ball. Features delicate, layered texturing to simulate soft, fluffy ears.',
    image: '/images/golden.png',
    bgGradient: 'from-yellow-100 to-orange-50',
    borderColor: 'border-yellow-200',
    isBestSeller: true
  },
  {
    id: 'pierre',
    name: 'Pierre the French Bulldog',
    category: 'companion',
    price: 17.50,
    description: 'A charming brindle Frenchie with iconic bat ears. Pierre wears a cozy red and white hand-striped ceramic scarf that adds a splash of color.',
    image: '/images/frenchie.png',
    bgGradient: 'from-rose-100 to-pink-50',
    borderColor: 'border-rose-200',
    tag: 'Customer Favorite'
  },
  {
    id: 'dash',
    name: 'Dash the Dachshund',
    category: 'hound',
    price: 16.50,
    description: 'A sleek, long, low-to-the-ground chocolate Dachshund curled up happily on a miniature clay plaid blanket. Incredibly sweet detailing on the nose and paws.',
    image: '/images/dachshund.png',
    bgGradient: 'from-stone-100 to-zinc-50',
    borderColor: 'border-stone-200'
  },
  {
    id: 'barnaby',
    name: 'Barnaby the Pug',
    category: 'companion',
    price: 16.00,
    description: 'A chubby, wrinkly-faced fawn pug wearing a tiny polymer clay birthday hat. Barnaby features detailed rolls and expressive black-beaded clay eyes.',
    image: '/images/pug.png',
    bgGradient: 'from-emerald-100 to-teal-50',
    borderColor: 'border-emerald-200',
    tag: 'Limited Edition'
  }
];

// Helper: Ensure cart exists in session
function getCart(req) {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  return req.session.cart;
}

// Middleware: Global templates variables
app.use((req, res, next) => {
  const cart = getCart(req);
  res.locals.cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  res.locals.currentPath = req.path;
  next();
});

// --- ROUTES ---

// 1. Catalog Page (Home)
app.get('/', (req, res) => {
  const selectedCategory = req.query.category || 'all';
  
  let filteredProducts = PRODUCTS;
  if (selectedCategory !== 'all') {
    filteredProducts = PRODUCTS.filter(p => p.category === selectedCategory);
  }
  
  res.render('index', { 
    products: filteredProducts, 
    selectedCategory,
    categories: ['all', 'companion', 'herding', 'sporting', 'hound']
  });
});

// 2. Product Detail Page
app.get('/product/:id', (req, res) => {
  const product = PRODUCTS.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).send('Product not found');
  }
  res.render('product', { product });
});

// 3. Shopping Cart Page
app.get('/cart', (req, res) => {
  const cart = getCart(req);
  
  // Assemble full product info for cart items
  const cartItems = cart.map(cartItem => {
    const product = PRODUCTS.find(p => p.id === cartItem.productId);
    return {
      product,
      quantity: cartItem.quantity
    };
  }).filter(item => item.product !== undefined);
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 35 ? 0 : (subtotal > 0 ? 4.99 : 0);
  const total = subtotal + shipping;
  
  res.render('cart', { 
    cartItems, 
    subtotal, 
    shipping, 
    total 
  });
});

// 4. Add to Cart Endpoint
app.post('/cart/add', (req, res) => {
  const { productId } = req.body;
  const product = PRODUCTS.find(p => p.id === productId);
  
  if (!product) {
    return res.status(400).send('Invalid product');
  }

  // Deliberate exception for Barnaby the Pug
  // if (productId === 'barnaby') {
  //   throw new Error(`Adoption failed: Deliberate server-side exception triggered while attempting to adopt ${product.name}!`);
  // }

  
  const cart = getCart(req);
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  
  console.log(`[Server Cart] Added ${product.name} to cart. Total items: ${cart.reduce((sum, i) => sum + i.quantity, 0)}`);
  
  // Determine redirect (either cart page or stay on detail/home page)
  const redirectTo = req.body.redirectTo || '/cart';
  res.redirect(redirectTo);
});

// 5. Update Cart Endpoint
app.post('/cart/update', (req, res) => {
  const { productId, action } = req.body;
  const cart = getCart(req);
  const itemIndex = cart.findIndex(item => item.productId === productId);
  
  if (itemIndex > -1) {
    if (action === 'increase') {
      cart[itemIndex].quantity += 1;
    } else if (action === 'decrease') {
      cart[itemIndex].quantity -= 1;
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
      }
    } else if (action === 'remove') {
      cart.splice(itemIndex, 1);
    }
  }
  
  res.redirect('/cart');
});

// 6. Checkout Page (Pre-populated)
app.get('/checkout', (req, res) => {
  const cart = getCart(req);
  if (cart.length === 0) {
    return res.redirect('/');
  }
  
  const cartItems = cart.map(cartItem => {
    const product = PRODUCTS.find(p => p.id === cartItem.productId);
    return { product, quantity: cartItem.quantity };
  }).filter(item => item.product !== undefined);
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 35 ? 0 : 4.99;
  const total = subtotal + shipping;

  // Fake user profile to prefill form for instant 1-click completion
  const fakeUser = {
    name: 'Aria Bennett',
    email: 'aria.bennett@cozymail.com',
    address: '456 Whimsical Woods Road',
    city: 'Forestville',
    zip: '90210',
    cardName: 'ARIA BENNETT',
    cardNumber: '4111 2222 3333 4444',
    cardExpiry: '12/28',
    cardCvc: '123'
  };

  res.render('checkout', { 
    cartItems, 
    subtotal, 
    shipping, 
    total,
    user: fakeUser
  });
});

// 7. Submit Checkout Endpoint
app.post('/checkout/submit', (req, res) => {
  const cart = getCart(req);
  if (cart.length === 0) {
    return res.redirect('/');
  }
  
  const cartItems = cart.map(cartItem => {
    const product = PRODUCTS.find(p => p.id === cartItem.productId);
    return { product, quantity: cartItem.quantity };
  }).filter(item => item.product !== undefined);
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 35 ? 0 : 4.99;
  const total = subtotal + shipping;

  // Collect form details for checkout processing
  const { name, email, address, city, zip } = req.body;

  // Generate a mock Order ID
  const orderId = 'CCC-' + Math.floor(100000 + Math.random() * 900000);
  
  // Store order details in session to render in success page
  req.session.lastOrder = {
    orderId,
    name,
    email,
    address,
    city,
    zip,
    items: cartItems,
    total: total.toFixed(2)
  };
  
  // Clear the shopping cart
  req.session.cart = [];
  
  console.log(`[Server Checkout] Order completed successfully! Order ID: ${orderId} | Customer: ${name}`);
  res.redirect('/success');
});

// 8. Success / Confirmation Page
app.get('/success', (req, res) => {
  const lastOrder = req.session.lastOrder;
  if (!lastOrder) {
    return res.redirect('/');
  }
  res.render('success', { order: lastOrder });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Cozy Clay Canines Error Log]:', err.stack || err);
  
  // Tag active span with the error details for Datadog Error Tracking
  const activeSpan = tracer.scope().active();
  if (activeSpan) {
    activeSpan.setTag('error', err);
  }

  res.status(500).render('error', { 
    message: 'Oops! Something went wrong. Try again later!' 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n🏡 Cozy Clay Canines server is running at: http://localhost:${PORT}\n`);
});
