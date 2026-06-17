'use client';

import { useState } from 'react';

export default function ServicesPage() {
  const [activeService, setActiveService] = useState<number | null>(null);

  const agencyServices = [
    { title: 'Social Media', icon: '📱', bullets: ['Custom content strategies.', 'Tailored media plans.', 'Impactful brand visibility.'] },
    { title: 'Product Shoot', icon: '📷', bullets: ['High-quality product photography.', 'Dynamic visuals.', 'Scroll-stopping content.'] },
    { title: 'Meme Marketing', icon: '😂', bullets: ['Collaboration with meme pages.', 'Witty and relatable content.', 'Organic engagement boost.'] },
    { title: 'Performance', icon: '🎯', bullets: ['Targeted Meta/Google ads.', 'E-commerce conversion focus.', 'Scalable ad strategy.'] },
    { title: 'Influencer', icon: '📸', bullets: ['Wide network of influencers.', 'Authentic niche connections.', 'Transparent pricing models.'] },
    { title: 'Video Editing', icon: '📹', bullets: ['High-retention editing.', 'Professional motion design.', 'Strategic algorithm alignment.'] }
  ];

  return (
    <div style={{ background: 'var(--w)', minHeight: '100vh', paddingTop: '140px' }}>
      <nav id="nav" className="scrolled">
        <a href="/" className="nlogo hover-target">
          <img src="/ClaimFameDP-removebg-preview.png" alt="Claim Fame" className="nav-brand-logo" />
        </a>
        <ul className="nlinks" id="nl">
          <li><a href="/#about-wrap">About</a></li>
          <li><a href="/services" style={{ color: 'var(--p)' }}>Services</a></li>
          <li><a href="/clients">Clients</a></li>
          <li><a href="/#contact-wrap" className="ncta">Get In Touch</a></li>
          
         
        </ul>
      </nav>

      <div style={{ padding: '40px 2%', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="sec-ey" style={{ marginLeft: '3%' }}>Our Expertise</div>
        <h2 className="sec-ttl" style={{ marginBottom: '50px', marginLeft: '3%' }}>What We Do</h2>
        
        {/* STATIC GRID - This structure never changes */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px', 
          padding: '0 2%' 
        }}>
          {agencyServices.map((svc, index) => {
            const isActive = activeService === index;
            return (
              <div 
                key={index} 
                onClick={() => setActiveService(isActive ? null : index)}
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  padding: '30px',
                  background: isActive ? 'var(--p)' : 'rgba(143, 30, 174, 0.08)',
                  borderRadius: '24px',
                  border: '1px solid var(--gm)',
                  transition: 'all 0.4s ease',
                  height: '240px', // Static height to keep grid rigid
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* ICON & TITLE - Only visible if card is NOT active */}
                {!isActive && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{svc.icon}</div>
                    <h4 style={{ color: 'var(--k)' }}>{svc.title}</h4>
                  </>
                )}

                {/* MATTER - Only visible if card IS active, stays inside the card */}
                {isActive && (
                  <div style={{ color: '#fff', textAlign: 'left', width: '100%' }}>
                    <h4 style={{ marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>{svc.title}</h4>
                    <ul style={{ listStyle: 'none', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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