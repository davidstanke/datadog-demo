export default function Footer() {
  return (
    <footer className="footer" id="about">
      <div className="footer-inner">
        <div className="footer-logo">
          <span>🧸</span>
          <span>ClayFriends Boutique</span>
        </div>
        <p className="footer-p">
          Each ClayFriend is lovingly crafted by hand in small, curated batches. 
          Because they are handmade, every figurine possesses tiny, delightful differences 
          that make them unique individuals ready for adoption.
        </p>
        <div className="footer-socials">
          <a href="#" className="social-link" onClick={(e) => { e.preventDefault(); alert("Follow us on Instagram @ClayFriendsBoutique for cute behind-the-scenes sculpting reels!"); }} aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a href="#" className="social-link" onClick={(e) => { e.preventDefault(); alert("Connect on Twitter @ClayFriends for shop updates!"); }} aria-label="Twitter">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
          </a>
        </div>
        <div className="footer-copy">
          <p>&copy; {new Date().getFullYear()} ClayFriends. Sculpted with love in our cozy workshop.</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
            This is a standard mock storefront designed with Cozy Pastel aesthetics. No real money or real shipping is processed.
          </p>
        </div>
      </div>
    </footer>
  );
}
