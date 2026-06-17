'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CampaignsPage() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});

  // The exact list of niches you want to showcase
  const targetNiches = [
    "Doctors", 
    "Chef", 
    "Nutritionist/ Health and Wellness", 
    "Lifestyle", 
    "Fashion"
  ];

  useEffect(() => {
    const fetchPortfolio = async () => {
      // Fetches all videos. The admin panel will save a 'niche' column for each video.
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

  // Fallback videos if a niche has no videos uploaded in the admin panel yet
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
      <nav id="nav" className="scrolled">
        <a href="/" className="nlogo hover-target">
          <img src="/ClaimFameDP-removebg-preview.png" alt="Claim Fame" className="nav-brand-logo" style={{ opacity: 1, transform: 'translateY(0)' }} />
        </a>
        <ul className="nlinks" id="nl">
          <li><a href="/#about-wrap" className="hover-target">About</a></li>
          <li><a href="/services" className="hover-target">Services</a></li>
          <li><a href="/clients" className="hover-target">Clients</a></li>
          <li><a href="/campaigns" className="hover-target" style={{ color: 'var(--p)' }}>Campaigns</a></li>
          <li><a href="/#contact-wrap" className="ncta hover-target">Get In Touch</a></li>
        </ul>
      </nav>

      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: '80px', padding: '0 5%' }}>
        <div className="sec-ey reveal-up" style={{ justifyContent: 'center' }}>
          Industry Expertise
        </div>
        <h2 className="sec-ttl reveal-up d-1" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
          Campaigns by Niche
        </h2>
        <p className="reveal-up d-2" style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', marginTop: '20px' }}>
          Explore our top-performing strategies broken down by industry.
        </p>
      </div>

      {/* ── NICHE CYLINDERS ── */}
      <div style={{ paddingBottom: '120px', overflow: 'hidden' }}>
        {targetNiches.map((nicheName, nIndex) => {
          
          // 1. Filter videos by this specific Niche
          const nicheVideos = portfolio.filter(v => v.niche === nicheName || v.category === nicheName);
          
          // 2. Use real videos if they exist, otherwise use the placeholders
          const displayVideos = nicheVideos.length > 0 ? nicheVideos : defaultReels;
          
          // 3. Math: Duplicate the videos until we have exactly 8 items for a perfect 3D Octagon
          const cylinderReels = [...displayVideos, ...displayVideos, ...displayVideos, ...displayVideos, ...displayVideos].slice(0, 8);
          const totalCards = cylinderReels.length;

          return (
            <div key={nIndex} style={{ marginBottom: '150px' }} className="reveal-up">
              
              {/* Niche Name Title */}
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
                {nicheName}
              </h3>

              {/* The 3D Rotating Cylinder for this Niche */}
              <div className="carousel-scene">
                <div 
                  className="carousel-cylinder hover-target" 
                  /* Alternate the spin direction for every other niche */
                  style={{ animationDirection: nIndex % 2 === 0 ? 'normal' : 'reverse' }}
                >
                  {cylinderReels.map((reel, idx) => {
                    const rotationAngle = (360 / totalCards) * idx;
                    return (
                      <div
                        key={`${nicheName}-${idx}`}
                        className="carousel-card"
                        style={{ transform: `rotateY(${rotationAngle}deg) translateZ(var(--radius))` }}
                      >
                        <div className="carousel-video-container">
                          <video className="carousel-video-asset" src={reel.media_url} autoPlay loop muted playsInline />
                          <div className="carousel-card-meta">
                            <h4 className="carousel-title-txt">{reel.project_name || nicheName}</h4>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Divider between niches */}
              {nIndex !== targetNiches.length - 1 && (
                <div style={{ width: '80%', height: '1px', background: 'var(--gm)', margin: '100px auto 0' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: 'none', paddingBottom: '40px', background: 'var(--w)' }}>
        <div className="ft-bot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', padding: '0 5%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="/" className="hover-target">
              <img src="/ClaimFameDP-removebg-preview.png" alt="Claim Fame" className="ft-brand-logo" style={{ marginBottom: 0, height: '40px' }} />
            </a>
            <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>© 2026 Claim Fame. All rights reserved.</span>
          </div>

          <div className="ft-soc">
            <a href="#" className="hover-target" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="#" className="hover-target" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
          
        </div>
      </footer>
    </div>
  );
}