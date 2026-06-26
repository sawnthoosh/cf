'use client';

import { useState } from 'react';

export default function ServicesPage() {
  const [activeService, setActiveService] = useState<number | null>(null);

  const agencyServices = [
    { id: '01', title: 'Social Media', image: '/svc_social.png', bullets: ['Custom content strategies.', 'Tailored media plans.', 'Impactful brand visibility.'] },
    { id: '02', title: 'Product Shoot', image: '/svc_product.png', bullets: ['High-quality product photography.', 'Dynamic visuals.', 'Scroll-stopping content.'] },
    { id: '03', title: 'Meme Marketing', image: '/svc_meme.png', bullets: ['Collaboration with meme pages.', 'Witty and relatable content.', 'Organic engagement boost.'] },
    { id: '04', title: 'Performance Marketing', image: '/svc_performance.png', bullets: ['Targeted Meta/Google ads.', 'E-commerce conversion focus.', 'Scalable ad strategy.'] },
    { id: '05', title: 'Influencer Marketing', image: '/svc_influencer.png', bullets: ['Wide network of influencers.', 'Authentic niche connections.', 'Transparent pricing models.'] },
    { id: '06', title: 'Video Editing', image: '/svc_video.png', bullets: ['High-retention editing.', 'Professional motion design.', 'Strategic algorithm alignment.'] }
  ];

  return (
    <div style={{ background: 'var(--w)', minHeight: '100vh', paddingTop: '140px' }}>
      <nav id="nav" className="scrolled">
        <a href="/" className="nlogo hover-target">
          <img src="/ClaimFameDP-removebg-preview.png" alt="Claim Fame" className="nav-brand-logo" />
        </a>
        <ul className="nlinks" id="nl">
          <li><a href="/">Home</a></li>
          <li><a href="/services" style={{ color: 'var(--p)' }}>Services</a></li>
          <li><a href="/clients">Our Work</a></li>
          <li><a href="/#contact-wrap" className="ncta">Get In Touch</a></li>
        </ul>
      </nav>

      <div style={{ padding: '40px 2%', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ color: 'var(--p)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '15px' }}>— OUR SERVICES —</div>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '60px' }}>
          <h2 className="sec-ttl" style={{ margin: 0, fontSize: '3.5rem' }}>What We Do</h2>
          <div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '50px', height: '4px', background: 'var(--p)', borderRadius: '2px' }}></div>
        </div>
        
        {/* STATIC GRID */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '24px', 
          padding: '0 2%' 
        }}>
          {agencyServices.map((svc, index) => {
            const isActive = activeService === index;
            return (
              <div 
                key={index} 
                onClick={() => setActiveService(isActive ? null : index)}
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: isActive ? 'var(--p)' : 'var(--w)',
                  borderRadius: '16px',
                  boxShadow: isActive ? '0 20px 40px rgba(156, 39, 176, 0.3)' : '0 10px 30px rgba(0,0,0,0.04)',
                  transition: 'all 0.4s ease',
                  height: '340px',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  border: isActive ? 'none' : '1px solid #f0f0f0'
                }}
              >
                {!isActive && (
                  <>
                    <div style={{ 
                      flex: 1, 
                      backgroundColor: 'var(--gm)',
                      backgroundImage: `url(${svc.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px'
                    }}></div>
                    <div style={{ 
                      height: '80px', 
                      background: 'var(--w)', 
                      borderRadius: '16px', 
                      display: 'flex',
                      alignItems: 'center', 
                      padding: '0 20px'
                    }}>
                      <div style={{ color: 'var(--y)', fontWeight: 700, fontSize: '1.5rem', marginRight: '20px', fontFamily: 'var(--fh)' }}>{svc.id}</div>
                      <div style={{ width: '1px', height: '40px', background: '#eaeaea', marginRight: '20px' }}></div>
                      <h4 style={{ color: 'var(--k)', flex: 1, fontSize: '1.15rem', margin: 0, fontWeight: 600 }}>{svc.title}</h4>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', background: 'var(--p)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', 
                        fontSize: '1.2rem', flexShrink: 0
                      }}>→</div>
                    </div>
                  </>
                )}

                {isActive && (
                  <div style={{ color: '#fff', padding: '40px 30px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px', fontSize: '1.5rem' }}>{svc.title}</h4>
                    <ul style={{ listStyle: 'none', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {svc.bullets.map((bullet, bIndex) => (
                        <li key={bIndex}>✦ {bullet}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}