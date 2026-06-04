import { Sparkles, Trophy, Leaf, Smile, Star } from 'lucide-react';

export default function OurStory() {
  const timeline = [
    {
      year: '2022',
      title: 'Kitchen Baking Mishaps',
      desc: 'Our journey began in a small apartment kitchen table with a single box of polymer clay, basic wooden clay loops, and some baking pans. After a few bubbly, overbaked disasters, we successfully sculpted the very first Barnaby the Bear. Our friends loved them, and the spark of custom miniature sculpting was ignited.'
    },
    {
      year: '2023',
      title: 'The Tiny Studio Move',
      desc: 'With our kitchen overflowing with colorful clay blocks, we moved our tools into a tiny, sunny studio room. We upgraded to digital convection ovens for flawless curing, mastered custom blending premium color clays to get that signature soft "Cozy Pastel" tint, and began sculpting new companions like Pip and Luna.'
    },
    {
      year: '2024',
      title: 'ClayFriends Worldwide',
      desc: 'In early 2024, we officially launched the ClayFriends Boutique! What started as a local hobby became an online sanctuary for desk workers. Today, thousands of miniature clay companions have been adopted and are sitting happily on computer screens and office desks across the globe, bringing smiles to workspaces.'
    }
  ];

  const values = [
    {
      icon: <Smile size={24} style={{ color: 'var(--primary)' }} />,
      title: 'Desk Companion Joy',
      desc: 'Our main goal is simple: to make your workspace feel a little less digital and a lot more cozy. A tiny, smiling clay friend is a peaceful anchor in a busy workday.'
    },
    {
      icon: <Leaf size={24} style={{ color: 'var(--primary)' }} />,
      title: 'True Artisanship',
      desc: 'We never use factory molds or industrial casting. Every single piglet snout, bear eye, and sheep curl is individually rolled and attached by hand with love.'
    },
    {
      icon: <Star size={24} style={{ color: 'var(--primary)' }} />,
      title: 'Cozy Safe Shipping',
      desc: 'Our friends are packed with the ultimate care. We place each companion in a custom snug nest of recycled paper, meaning they travel warm and arrive in perfect shape.'
    }
  ];

  return (
    <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative' }}>
        <div className="hero-badge" style={{ margin: '0 auto 1rem auto' }}>
          <Sparkles size={14} />
          <span>Our Humble Origins</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          The Story of ClayFriends
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          How a tiny box of clay and some apartment oven trials grew into a global boutique of miniature smiling desk companions.
        </p>
      </div>

      {/* 3-Step History Timeline */}
      <div style={{ marginBottom: '5rem', position: 'relative' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3rem', textAlign: 'center' }}>
          Our 3-Step Journey
        </h2>
        
        {/* Timeline Path Line (Dashed) */}
        <div style={{
          position: 'absolute',
          top: '160px',
          bottom: '80px',
          left: '50%',
          width: '2px',
          borderLeft: '2px dashed var(--border-color)',
          transform: 'translateX(-50%)',
          zIndex: 1,
          display: 'block'
        }} className="timeline-line"></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', position: 'relative', zIndex: 2 }} className="timeline-list">
          {timeline.map((item, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '2.5rem',
                flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse'
              }}
              className="timeline-item-row"
            >
              {/* Year & Text Side */}
              <div style={{
                flex: 1,
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
                textAlign: idx % 2 === 0 ? 'right' : 'left'
              }} className="timeline-text-box">
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}>{item.year}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.desc}</p>
              </div>

              {/* Center Dot */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--bg-primary)',
                border: '3px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 3
              }}>
                <Trophy size={16} style={{ color: 'var(--primary)' }} />
              </div>

              {/* Empty Spacer Side to balance grid */}
              <div style={{ flex: 1 }} className="timeline-spacer"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Values Title */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>
          What Guides Our Hands
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
          Behind every sculpt, glaze, and package we send out lie three simple, heart-felt core values.
        </p>

        {/* Values Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {values.map((val, idx) => (
            <div 
              key={idx} 
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                textAlign: 'center',
                alignItems: 'center'
              }}
            >
              <div style={{
                background: 'var(--bg-secondary)',
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {val.icon}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{val.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
