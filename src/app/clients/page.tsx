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
          <li><a href="/clients" className="hover-target" style={{ color: 'var(--p)' }}>Our Work</a></li>
          <li><a href="/#contact-wrap" className="ncta hover-target">Get In Touch</a></li>
        </ul>
      </nav>

      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: '80px', padding: '0 5%' }}>
        <h2 className="sec-ttl reveal-up d-1" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', margin: 0 }}>
          OUR WORK
        </h2>
      </div>

      {/* ── BRAND CARDS SECTION ── */}
      <div className="page-section" style={{ padding: '0 5% 80px', maxWidth: '1400px', margin: '0 auto' }}>
        {(() => {
          const bcStr = content['brand_cards_data'] || '[]';
          let brandCards: any[] = [];
          try { brandCards = JSON.parse(bcStr); } catch(e){}
          
          if (brandCards.length === 0) {
            brandCards = [
              { id: '1', brandName: 'KAPIVA', bgColor: 'rgba(119, 138, 94, 0.9)', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop', tagline: 'Ayurvedic Nutrition\\n& Wellness', stats: [{v: '320%', l: 'Sales Increase'}, {v: '2.8M+', l: 'Reach Generated'}, {v: '45+', l: 'Creators Activated'}] },
              { id: '2', brandName: 'THE WHOLE TRUTH', bgColor: 'rgba(156, 111, 68, 0.9)', imageUrl: 'https://images.unsplash.com/photo-1622484211148-522646271a9c?q=80&w=1000&auto=format&fit=crop', tagline: 'Clean Nutrition\\nSnacking Brand', stats: [{v: '200%', l: 'Growth in Followers'}, {v: '150%', l: 'Engagement Boost'}, {v: '25+', l: 'Campaigns Executed'}] },
              { id: '3', brandName: 'PLUM', bgColor: 'rgba(136, 98, 155, 0.9)', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop', tagline: 'Clean, Vegan\\nBeauty', stats: [{v: '180%', l: 'Increase in Reach'}, {v: '90+', l: 'Creators Onboarded'}, {v: '60+', l: 'Pieces of Content'}] },
              { id: '4', brandName: 'SUGAR.FIT', bgColor: 'rgba(109, 76, 130, 0.9)', imageUrl: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=1000&auto=format&fit=crop', tagline: 'Health & Fitness\\nBrand', stats: [{v: '250%', l: 'Engagement Growth'}, {v: '3M+', l: 'Impressions'}, {v: '35+', l: 'Fitness Creators'}] },
            ];
          }

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {brandCards.map((c: any) => (
                <div key={c.id} className="reveal-up" style={{ borderRadius: '24px', overflow: 'hidden', position: 'relative', color: '#fff', display: 'flex', flexDirection: 'column', height: '400px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  
                  {/* Background Image & Color Overlay */}
                  <img src={c.imageUrl} alt={c.brandName} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: c.bgColor || 'rgba(0,0,0,0.5)', zIndex: 2, mixBlendMode: 'multiply' }}></div>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)', zIndex: 3 }}></div>

                  {/* Content Overlay */}
                  <div style={{ position: 'relative', zIndex: 4, display: 'flex', flexDirection: 'column', height: '100%', padding: '30px' }}>
                    
                    <div style={{ flex: 1 }}>
                      {/* Logo or Brand Name */}
                      {c.logoUrl ? (
                        <img src={c.logoUrl} alt={c.brandName} style={{ height: '35px', objectFit: 'contain', marginBottom: '15px' }} />
                      ) : (
                        <h2 style={{ fontFamily: 'var(--fh)', fontSize: '1.8rem', fontWeight: 900, marginBottom: '15px', letterSpacing: '-0.02em', background: '#fff', color: c.bgColor.replace(/rgba?\(([^,]+),([^,]+),([^,]+).*/, 'rgb($1,$2,$3)'), padding: '4px 12px', borderRadius: '4px', display: 'inline-block' }}>{c.brandName}</h2>
                      )}
                      
                      {/* Tagline */}
                      {c.tagline && (
                        <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: '1.3', margin: 0, whiteSpace: 'pre-line' }}>{c.tagline}</p>
                      )}
                    </div>

                    {/* Stats Section */}
                    {c.stats && c.stats.length > 0 && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {c.stats.map((s: any, i: number) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderRight: i !== c.stats.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none', paddingRight: '10px' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--fh)', letterSpacing: '-0.02em' }}>{s.v}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.9, lineHeight: '1.2' }}>{s.l}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* ── 2 ROWS MIXED MARQUEES ── */}
      <div style={{ paddingBottom: '120px', overflow: 'hidden' }}>
        {(() => {
          let allReels: any[] = [];
          targetBrands.forEach(brand => {
            const brandVideos = portfolio.filter(v => v.brand_name === brand);
            if (brandVideos.length > 0) {
              allReels.push(...brandVideos);
            } else {
              allReels.push(...getDefaultReelsForBrand(brand));
            }
          });

          // Shuffle for a good mix
          allReels = allReels.sort(() => 0.5 - Math.random());
          
          const midpoint = Math.ceil(allReels.length / 2);
          const row1 = allReels.slice(0, midpoint);
          const row2 = allReels.slice(midpoint);

          const getMarqueeItems = (items: any[]) => {
            if (items.length === 0) return [];
            let repeated = [...items];
            while (repeated.length < 15) {
              repeated = [...repeated, ...items];
            }
            return [...repeated, ...repeated];
          };

          const marquee1 = getMarqueeItems(row1);
          const marquee2 = getMarqueeItems(row2);

          return (
            <div className="reveal-up">
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--k)' }}>Campaign Reels That Delivered</h3>
              </div>
              <div className="video-marquee-container" style={{ marginBottom: '30px' }}>
                <div className="video-marquee-track" style={{ animationDuration: '60s' }}>
                  {marquee1.map((reel, idx) => (
                    <div key={`r1-${idx}`} className="video-marquee-card" style={{ display: 'flex', flexDirection: 'column', background: '#fff', padding: 0 }}>
                      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                        <video className="video-marquee-asset" src={reel.media_url} autoPlay loop muted playsInline />
                        <div className="video-card-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', padding: '20px 16px 12px' }}>
                          <h4 className="video-card-creator-name" style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{reel.project_name}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
                            ▶ {((idx * 47) % 900) + 100}K
                          </div>
                        </div>
                      </div>
                      <div style={{ height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderTop: '1px solid #edf2f7' }}>
                        <span style={{ fontWeight: 900, color: '#1a202c', letterSpacing: '-0.02em', fontSize: '1.1rem' }}>{reel.brand_name || 'Creator'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="video-marquee-container">
                <div className="video-marquee-track" style={{ animationDirection: 'reverse', animationDuration: '65s' }}>
                  {marquee2.map((reel, idx) => (
                    <div key={`r2-${idx}`} className="video-marquee-card" style={{ display: 'flex', flexDirection: 'column', background: '#fff', padding: 0 }}>
                      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                        <video className="video-marquee-asset" src={reel.media_url} autoPlay loop muted playsInline />
                        <div className="video-card-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', padding: '20px 16px 12px' }}>
                          <h4 className="video-card-creator-name" style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{reel.project_name}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
                            ▶ {((idx * 83) % 900) + 100}K
                          </div>
                        </div>
                      </div>
                      <div style={{ height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderTop: '1px solid #edf2f7' }}>
                        <span style={{ fontWeight: 900, color: '#1a202c', letterSpacing: '-0.02em', fontSize: '1.1rem' }}>{reel.brand_name || 'Creator'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
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