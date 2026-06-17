'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ClientsPage() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});

  // The exact list of brands you want to showcase
  const targetBrands = [
    "Kapiva", 
    "Multani", 
    "Louis Stitch", 
    "Salon Tym", 
    "Zouk", 
    "Kalki", 
    "Concious Chemist", 
    "Above Humen"
  ];

  useEffect(() => {
    const fetchPortfolio = async () => {
      // Assuming your portfolio table has a 'brand_name' column to link videos to brands
      const { data } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
      if (data) setPortfolio(data);
    };

    const fetchContent = async () => {
      const { data } = await supabase.from('site_content').select('*');
      if (data) {
        const contentMap: Record<string, string> = {};
        data.forEach((item: any) => { contentMap[item.section_key] = item.content_value; });
        setContent(contentMap);
      }
    };

    fetchPortfolio();
    fetchContent();

    // Intersection Observer for scroll animations
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));
    
    // ── CURSOR LOGIC ──
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0, fX = 0, fY = 0;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (cursor) cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    if (window.innerWidth > 768 && cursor && follower) {
      window.addEventListener('mousemove', onMouseMove);

      const animateCursor = () => {
        fX += (mouseX - fX) * 0.15; fY += (mouseY - fY) * 0.15;
        follower.style.transform = `translate3d(${fX}px, ${fY}px, 0)`;
        animationFrameId = requestAnimationFrame(animateCursor);
      };
      animateCursor();

      document.querySelectorAll('a, button, input, textarea, select, .hover-target, .carousel-cylinder').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('link-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('link-hover'));
      });
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Fallback videos if a brand has no videos uploaded in the admin panel yet
  const defaultReels = [
    { id: 'df1', project_name: 'Campaign Reel', media_url: 'https://cdn.pixabay.com/video/2021/04/12/70881-537449557_large.mp4' },
    { id: 'df2', project_name: 'UGC Content', media_url: 'https://cdn.pixabay.com/video/2020/03/17/33718-392520300_large.mp4' }
  ];

  return (
    <div style={{ background: 'var(--w)', minHeight: '100vh', paddingTop: '140px' }}>
      
      {/* ── CURSOR ELEMENTS ── */}
      <div id="cursor"></div>
      <div id="cursor-follower"></div>

      {/* ── NAV ── */}
      <nav id="nav" className="scrolled" style={{ justifyContent: 'flex-end' }}>
        <ul className="nlinks" id="nl">
          <li><a href="/#about-wrap" className="hover-target">About</a></li>
          <li><a href="/services" className="hover-target">Services</a></li>
          <li><a href="/clients" className="hover-target" style={{ color: 'var(--p)' }}>Clients</a></li>
          <li><a href="/campaigns" className="hover-target">Campaigns</a></li>
          <li><a href="/#contact-wrap" className="ncta hover-target">Get In Touch</a></li>
          
        </ul>
      </nav>

      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: '80px', padding: '0 5%' }}>
        <div className="sec-ey reveal-up" style={{ justifyContent: 'center' }}>
          Our Partners
        </div>
        <h2 className="sec-ttl reveal-up d-1" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
          The Brands We Scale
        </h2>
      </div>

      {/* ── BRAND CYLINDERS ── */}
      <div style={{ paddingBottom: '120px', overflow: 'hidden' }}>
        {targetBrands.map((brandName, bIndex) => {
          
          // 1. Filter videos by this specific brand name
          const brandVideos = portfolio.filter(v => v.brand_name === brandName);
          
          // 2. Use real videos if they exist, otherwise use the placeholders
          const displayVideos = brandVideos.length > 0 ? brandVideos : defaultReels;
          
          // 3. Math: Duplicate the videos until we have exactly 8 items for a perfect 3D Octagon
          const cylinderReels = [...displayVideos, ...displayVideos, ...displayVideos, ...displayVideos, ...displayVideos].slice(0, 8);
          const totalCards = cylinderReels.length;

          return (
            <div key={bIndex} style={{ marginBottom: '150px' }} className="reveal-up">
              
              {/* Brand Name Title */}
              <h3 
                style={{ 
                  fontFamily: 'var(--fh)', 
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                  fontWeight: 900, 
                  textAlign: 'center', 
                  color: 'var(--k)',
                  marginBottom: '20px',
                  letterSpacing: '-0.03em'
                }}
              >
                {brandName}
              </h3>

              {/* The 3D Rotating Cylinder for this Brand */}
              <div className="carousel-scene">
                <div 
                  className="carousel-cylinder hover-target" 
                  /* Alternate the spin direction for every other brand so it looks incredibly dynamic */
                  style={{ animationDirection: bIndex % 2 === 0 ? 'normal' : 'reverse' }}
                >
                  {cylinderReels.map((reel, idx) => {
                    const rotationAngle = (360 / totalCards) * idx;
                    return (
                      <div
                        key={`${brandName}-${idx}`}
                        className="carousel-card"
                        style={{ transform: `rotateY(${rotationAngle}deg) translateZ(var(--radius))` }}
                      >
                        <div className="carousel-video-container">
                          {/* playsInline and muted are critical for mobile autoplay */}
                          <video className="carousel-video-asset" src={reel.media_url} autoPlay loop muted playsInline />
                          <div className="carousel-card-meta">
                            <h4 className="carousel-title-txt">{reel.project_name || brandName}</h4>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Soft divider line between brands */}
              {bIndex !== targetBrands.length - 1 && (
                <div style={{ width: '80%', height: '1px', background: 'var(--gm)', margin: '100px auto 0' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: 'none' }}>
        <div className="ft-bot reveal-up" style={{ justifyContent: 'center' }}>
          <span>{content['footer_copyright'] || '© 2026 Claim Fame. All rights reserved.'}</span>
        </div>
      </footer>

    </div>
  );
}