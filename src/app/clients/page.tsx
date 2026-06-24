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

  // Brand Default Creators Map from design document
  const brandDefaultCreators: Record<string, string[]> = {
    "Kapiva": ["Sarul Jain", "Nikita Mithaiwala", "Tarneet Kaur", "Harshita Agarwal", "Nikita Shah", "Neeru", "Nikita Varma", "Dr. Sowmya Rao", "Mrunalini", "The Poetic News", "Parth Shah"],
    "Multani": ["Aashika Bhatia", "Niti Taylor", "Dr. Neha Gupta", "Varun Jhamb", "Amit Saxena", "Oh My Veggies", "Sumit Chauhan", "Arup Ghosh"],
    "Zouk": ["Mehak", "Vidhi Shah", "Radhika Sehgal", "Henna Jain", "Steffilyne", "Shruti Naxane", "Venus Shah", "Vrushali", "Ankita", "Khushi Gupta", "Srishti"],
    "Louis Stitch": ["Neha Sanjay", "Aryan", "Samadh", "Usman"]
  };

  const getDefaultReelsForBrand = (brandName: string) => {
    const creators = brandDefaultCreators[brandName] || ["Ananya Sharma", "Rahul Verma", "Pooja Patel", "Vikram Singh"];
    const videos = [
      'https://cdn.pixabay.com/video/2021/04/12/70881-537449557_large.mp4',
      'https://cdn.pixabay.com/video/2020/03/17/33718-392520300_large.mp4',
      'https://cdn.pixabay.com/video/2020/09/11/49622-458145244_large.mp4',
      'https://cdn.pixabay.com/video/2021/11/04/94595-645851174_large.mp4'
    ];
    return creators.map((creator, index) => ({
      id: `default-${brandName}-${index}`,
      project_name: creator,
      media_url: videos[index % videos.length],
      brand_name: brandName
    }));
  };

  return (
    <div style={{ background: 'var(--w)', minHeight: '100vh', paddingTop: '140px' }}>
      
      {/* ── CURSOR ELEMENTS ── */}
      <div id="cursor"></div>
      <div id="cursor-follower"></div>

      {/* ── NAV ── */}
      <nav id="nav" className="scrolled">
        <a href="/" className="nlogo hover-target">
          <img src="/ClaimFameDP-removebg-preview.png" alt="Claim Fame" className="nav-brand-logo" />
        </a>
        <ul className="nlinks" id="nl">
          <li><a href="/#about-wrap" className="hover-target">About</a></li>
          <li><a href="/services" className="hover-target">Services</a></li>
          <li><a href="/clients" className="hover-target" style={{ color: 'var(--p)' }}>Clients</a></li>
          <li><a href="/#contact-wrap" className="ncta hover-target">Get In Touch</a></li>
        </ul>
      </nav>

      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: '80px', padding: '0 5%' }}>
        <h2 className="sec-ttl reveal-up d-1" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', margin: 0 }}>
          OUR WORK
        </h2>
      </div>

      {/* ── BRAND MARQUEES ── */}
      <div style={{ paddingBottom: '120px', overflow: 'hidden' }}>
        {targetBrands.map((brandName, bIndex) => {
          
          // 1. Filter videos by this specific brand name
          const brandVideos = portfolio.filter(v => v.brand_name === brandName);
          
          // 2. Use real videos if they exist, otherwise use the brand-specific default reels
          const displayVideos = brandVideos.length > 0 ? brandVideos : getDefaultReelsForBrand(brandName);
          
          // Helper to generate infinite marquee reels
          const getMarqueeItems = (items: any[]) => {
            if (items.length === 0) return [];
            let repeated = [...items];
            while (repeated.length < 10) {
              repeated = [...repeated, ...items];
            }
            return [...repeated, ...repeated];
          };

          const marqueeReels = getMarqueeItems(displayVideos);

          return (
            <div key={bIndex} style={{ marginBottom: '100px' }} className="reveal-up">
              
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

              {/* The Horizontal Scrolling Marquee for this Brand */}
              <div className="video-marquee-container">
                <div 
                  className="video-marquee-track"
                  style={{ 
                    animationDirection: bIndex % 2 === 0 ? 'normal' : 'reverse',
                    animationDuration: '40s'
                  }}
                >
                  {marqueeReels.map((reel, idx) => {
                    return (
                      <div
                        key={`${brandName}-${idx}`}
                        className="video-marquee-card"
                        style={{ background: 'var(--gm)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', border: '1px solid var(--p)' }}
                      >
                        <div style={{ color: 'var(--p)', fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', marginBottom: '10px', fontFamily: 'var(--fh)' }}>
                          {reel.project_name || 'Creator'}
                        </div>
                        <div style={{ color: 'var(--k)', fontSize: '1.1rem', fontWeight: 600, textAlign: 'center' }}>
                          {brandName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Soft divider line between brands */}
              {bIndex !== targetBrands.length - 1 && (
                <div style={{ width: '80%', height: '1px', background: 'var(--gm)', margin: '80px auto 0' }} />
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