import { Sparkles, Compass, Flame, Palette, Heart, Check } from 'lucide-react';

export default function AboutClay() {
  const steps = [
    {
      icon: <Compass size={24} style={{ color: 'var(--primary)' }} />,
      title: '1. Hand Sculpting',
      desc: 'Each friend begins as a raw, custom-blended block of professional-grade polymer clay. Using tiny precision steel loops, wooden needles, and fingers, we meticulously sculpt body postures, individual facial features, and cute little details (like Barnaby\'s tiny ears or Pip\'s chubby snout).'
    },
    {
      icon: <Flame size={24} style={{ color: 'var(--primary)' }} />,
      title: '2. Precision Curing',
      desc: 'To lock in their shape forever, the sculpted models are placed into digital convection ovens and baked at exactly 275°F (135°C). This thermal curing process causes the polymer molecules to fuse completely, transforming pliable clay into a highly durable, lightweight, and water-resistant synthetic stone.'
    },
    {
      icon: <Palette size={24} style={{ color: 'var(--primary)' }} />,
      title: '3. Hand-Painted Details',
      desc: 'Once fully cooled, every figurine receives its unique personality. We apply professional-grade acrylic pigments to paint glossy black eyes, cute smiles, and add that signature soft pink blush onto their cheeks. Finally, a protective, UV-stable premium matte varnish is brushed on to prevent scratching.'
    }
  ];

  const careTips = [
    { title: 'Keeping Clean', desc: 'Dust your clay friends occasionally using a soft, dry makeup brush or a dry microfiber cloth. Avoid coarse sponges or abrasive scrubbers.' },
    { title: 'Safe Heights', desc: 'While cured polymer clay is highly durable and slightly flexible, small appendages (like tiny sloth claws or piglet ears) can chip if dropped from high distances onto tile or concrete. Keep them safe on your desk!' },
    { title: 'Moisture & Water', desc: 'Our figurines are cured and varnished to be highly water-resistant. Damp wiping is perfectly fine, but please keep them out of prolonged baths, swimming pools, or hot dishwashers.' },
    { title: 'Sunlight Exposure', desc: 'Our acrylics and glazes are UV-stable, but keeping them away from direct, harsh summer sunlight for years ensures their pastel colors stay vivid forever.' }
  ];

  return (
    <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative' }}>
        <div className="hero-badge" style={{ margin: '0 auto 1rem auto' }}>
          <Sparkles size={14} />
          <span>The Polymer Process</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          About Our Clay Craft
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover the care, time, and science that goes into baking each and every tiny polymer clay desk companion we craft.
        </p>
      </div>

      {/* The 3-Step Process Grid */}
      <div style={{ marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2.5rem', textAlign: 'center' }}>
          Our 3-Step Creation Journey
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {steps.map((step, idx) => (
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
                transition: 'all var(--transition-fast)'
              }}
              className="about-step-card"
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
                {step.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{step.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Clay Figurine Care Guide Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-rose) 0%, var(--accent-peach) 100%)',
        borderRadius: '28px',
        padding: '3rem 2.5rem',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Heart size={24} style={{ color: '#ff4d6d' }} fill="#ff4d6d" />
            <span>Clay Companion Care Guide</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2.5rem', maxWidth: '700px' }}>
            Polymer clay is a wonderfully resilient and slightly flexible material, but since our friends are handcrafted and miniature, a tiny bit of care goes a long way in ensuring they stay cozy forever!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {careTips.map((tip, idx) => (
              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(8px)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} style={{ color: 'var(--accent-mint-dark)' }} />
                  <span>{tip.title}</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
