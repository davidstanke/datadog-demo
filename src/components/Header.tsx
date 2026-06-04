import { NavLink } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartTotalItems: number;
  onOpenCart: () => void;
}

export default function Header({ cartTotalItems, onOpenCart }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <NavLink to="/" className="logo">
          <span className="logo-emoji">🧸</span>
          <span>ClayFriends</span>
        </NavLink>

        <nav className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end
          >
            Store
          </NavLink>
          <NavLink 
            to="/clay" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Our Clay
          </NavLink>
          <NavLink 
            to="/story" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Our Story
          </NavLink>
        </nav>

        <button 
          className="cart-trigger" 
          onClick={onOpenCart}
          aria-label={`Open shopping cart with ${cartTotalItems} items`}
        >
          <ShoppingBag size={20} />
          <span>Cart</span>
          {cartTotalItems > 0 && (
            <span className="cart-badge">{cartTotalItems}</span>
          )}
        </button>
      </div>
    </header>
  );
}
