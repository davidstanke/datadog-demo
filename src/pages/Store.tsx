import { useState } from 'react';
import { Sparkles, ArrowRight, Heart, ShoppingCart } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import type { Product } from '../data/products';

interface StoreProps {
  cart: { product: Product; quantity: number }[];
  onAddToCart: (product: Product) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
}

export default function Store({ cart, onAddToCart, favorites, onToggleFavorite }: StoreProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredProducts = activeFilter === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeFilter);

  return (
    <>
      {/* --- HERO BANNER --- */}
      <section className="hero">
        <div className="hero-deco-blob hero-deco-blob-1"></div>
        <div className="hero-deco-blob hero-deco-blob-2"></div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>100% Handcrafted Polymer Clay</span>
          </div>
          <h1>Adorable little clay companions for your desk.</h1>
          <p>Each figurine is meticulously sculpted, detailed with tiny accessories, and baked to perfection. Bring a pinch of cozy magic home today.</p>
          <a href="#shop" className="hero-cta" onClick={(e) => {
            e.preventDefault();
            document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <span>Adopt a Friend</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* --- MAIN SHOP AREA --- */}
      <main className="main-content" id="shop">
        <div className="section-title-bar">
          <div>
            <h2 className="section-title">The Clay Companion Shop</h2>
            <p className="section-subtitle">Sculpted with premium details, rosy blushing cheeks, and endless charm.</p>
          </div>
          
          {/* Filters */}
          <div className="filter-bar">
            {['all', 'woodland', 'ocean', 'domestic', 'jungle'].map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                onClick={() => {
                  setActiveFilter(cat);
                  console.info(`[Shop Event] Filter Changed | Category: ${cat}`);
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              {product.tag && (
                <span className="product-tag">{product.tag}</span>
              )}
              
              <button 
                className={`product-favorite ${favorites.includes(product.id) ? 'liked' : ''}`}
                onClick={() => onToggleFavorite(product.id)}
                aria-label="Add to favorites"
              >
                <Heart size={18} fill={favorites.includes(product.id) ? '#ff4d6d' : 'none'} />
              </button>

              <div className="product-image-wrapper">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="product-img" 
                  loading="lazy"
                />
              </div>

              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                <div className="product-meta-row">
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <button 
                    className={`add-to-cart-btn ${cart.some(item => item.product.id === product.id) ? 'added' : ''}`}
                    onClick={() => onAddToCart(product)}
                  >
                    <ShoppingCart size={16} />
                    <span>
                      {cart.some(item => item.product.id === product.id) ? 'Added!' : 'Adopt'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
