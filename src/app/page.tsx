'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Counter from '@/components/Counter';
export default function Home() {
  const [buttonText, setButtonText] = useState('Send Message →');
  const [logos, setLogos] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchLogos = async () => {
      const { data } = await supabase.from('client_logos').select('*').order('created_at', { ascending: true });
      if (data) setLogos(data);
    };

    const fetchPortfolio = async () => {
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

    Promise.all([fetchLogos(), fetchPortfolio(), fetchContent()]).then(() => {
      setIsInitialLoad(false);
    });

    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0, fX = 0, fY = 0;
    let animationFrameId: number;

    if (window.innerWidth > 768 && cursor && follower) {
      const onMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      };
      window.addEventListener('mousemove', onMouseMove);

      const animateCursor = () => {
        fX += (mouseX - fX) * 0.15; fY += (mouseY - fY) * 0.15;
        follower.style.transform = `translate3d(${fX}px, ${fY}px, 0)`;
        animationFrameId = requestAnimationFrame(animateCursor);
      };
      animateCursor();

      document.querySelectorAll('a, button, input, textarea, select, .hover-target').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('link-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('link-hover'));
      });
    }

    const nav = document.getElementById('nav');
    const handleScroll = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', handleScroll);

    const hbg = document.getElementById('hbg');
    const nl = document.getElementById('nl');
    if (hbg && nl) hbg.addEventListener('click', () => nl.classList.toggle('open'));

    const revealOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, revealOptions);
    document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

    return () => {
      window.removeEventListener('mousemove', () => {});
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonText('Sending...');
    const formData = new FormData(e.currentTarget);
    const submissionData = {
      name: formData.get('name') as string, email: formData.get('email') as string,
      brand: formData.get('brand') as string, phone: formData.get('phone') as string,
      service: formData.get('service') as string, message: formData.get('message') as string,
    };
    const { error } = await supabase.from('form_submissions').insert([submissionData]);
    if (error) {
      setButtonText('Error! Try again.');
      setTimeout(() => setButtonText('Send Message →'), 3000);
    } else {
      setButtonText('✓ Message Sent!');
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setButtonText('Send Message →'), 3000);
    }
  };

  const defaultReels = [
    { id: 'df1', project_name: 'Beardo Global Campaign', media_url: 'https://cdn.pixabay.com/video/2021/04/12/70881-537449557_large.mp4' },
    { id: 'df2', project_name: 'Mamaearth UGC Concept', media_url: 'https://cdn.pixabay.com/video/2020/03/17/33718-392520300_large.mp4' },
    { id: 'df3', project_name: 'Zouk Lookbook Reels', media_url: 'https://cdn.pixabay.com/video/2020/09/11/49622-458145244_large.mp4' },
    { id: 'df4', project_name: 'Kapiva Nutrition Campaign', media_url: 'https://cdn.pixabay.com/video/2021/11/04/94595-645851174_large.mp4' }
  ];

  const fetchedReels = portfolio.length > 0 ? portfolio : defaultReels;
  
  // Generate marquee items: repeat list of reels so that it has enough items to fill screen width,
  // then double it so that the infinite translation scroll marquee loop (-50%) is completely seamless.
  const getMarqueeItems = (items: any[]) => {
    if (items.length === 0) return [];
    let repeated = [...items];
    while (repeated.length < 10) {
      repeated = [...repeated, ...items];
    }
    return [...repeated, ...repeated];
  };

  const marqueeReels = getMarqueeItems(fetchedReels);


  return (
    <>
      <div id="cursor"></div>
      <div id="cursor-follower"></div>

      <nav id="nav">
        {/* Logo fades in on scroll based on CSS */}
        <a href="/" className="nlogo hover-target">
          <img src="/ClaimFameDP-removebg-preview.png" alt="Claim Fame" className="nav-brand-logo" />
        </a>
        <ul className="nlinks" id="nl">
          <li><a href="/" className="hover-target">Home</a></li>
          <li><a href="/services" className="hover-target">Services</a></li>
          <li><a href="/clients" className="hover-target">Our Work</a></li>
          <li><a href="#contact-wrap" className="ncta hover-target">{content['nav_cta'] || 'Get In Touch'}</a></li>
        </ul>
        <div className="hbg hover-target" id="hbg"><span></span><span></span><span></span></div>
      </nav>

      {/* ── FULLSCREEN HERO WITH PNG IMAGE LOGO ── */}
      <div id="hero" style={{ position: 'relative', width: '100%', backgroundColor: 'var(--k)' }}>
        <div className="hero-fullscreen">
          {isInitialLoad ? (
            <div className="hero-video-bg" style={{ backgroundColor: 'var(--k)' }} />
          ) : (
            <video key={content['hero_video_url'] || 'fallback'} className="hero-video-bg" autoPlay loop muted playsInline>
              <source src={content['hero_video_url'] || "/bg.mp4"} type="video/mp4" />
            </video>
          )}
          <div className="hero-fullscreen-content reveal-up">
            <div className="hero-custom-logo-container hover-target">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <h1 className="hero-title-text">
                  <span className="line-1">claim</span>
                  <br />
                  <span className="line-2">fame</span>
                </h1>
                <svg className="logo-sparkles" viewBox="0 0 32 32">
                  <path d="M16 4c0 6.63-5.37 12-12 12 6.63 0 12 5.37 12 12 0-6.63 5.37-12 12-12-6.63 0-12-5.37-12-12z" fill="var(--y)" stroke="var(--w)" strokeWidth="1.5" />
                  <path d="M28 2c0 2.21-1.79 4-4 4 2.21 0 4 1.79 4 4 0-2.21 1.79-4 4-4-2.21 0-4-1.79-4-4z" fill="var(--y)" stroke="var(--w)" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── TYPOGRAPHY OUTLINE MARQUEE ── */}
        <div className="white-strip-marquee">
          <div className="marquee-track hover-target">
            <div className="marquee-text-group">
              <span className="marquee-outline-text">THE REAL FAME STORY STARTS HERE!</span>
              <span className="marquee-outline-text">THE REAL FAME STORY STARTS HERE!</span>
              <span className="marquee-outline-text">THE REAL FAME STORY STARTS HERE!</span>
            </div>
            <div className="marquee-text-group" aria-hidden="true">
              <span className="marquee-outline-text">THE REAL FAME STORY STARTS HERE!</span>
              <span className="marquee-outline-text">THE REAL FAME STORY STARTS HERE!</span>
              <span className="marquee-outline-text">THE REAL FAME STORY STARTS HERE!</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div className="page-section bg-gray" id="about-wrap">
        <section className="inner-section">
          <div className="sec-inner">
            <div className="about-g">
              <div className="about-vis reveal-up">
                {!isInitialLoad && <img src={content['about_image_url'] || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop"} alt="Claim Fame Team" />}
              </div>
              <div className="about-txt reveal-up d-2">
                <div className="sec-ey">WHO WE ARE</div>
                <h2 className="sec-ttl" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: '1.2', marginBottom: '30px' }}>
                  Helping brands claim their spotlight with the perfect blend of strategy, creativity, and impact.
                </h2>
                <p>
                  We partner with brands with ambitions to create attention, influence, and impact through influencer marketing, PR, social media, performance marketing, and production.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── STATS DIVIDER ── */}
      <div className="page-section" style={{ background: 'var(--p)', color: '#fff', padding: '60px 5%' }}>
        <div className="reveal-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto', gap: '30px' }}>
          <div style={{ textAlign: 'center', flex: '1 1 200px' }}>
            <h3 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '5px', fontFamily: 'var(--fh)' }}><Counter end={500} suffix="+" /></h3>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Creators Activated</p>
          </div>
          <div style={{ textAlign: 'center', flex: '1 1 200px' }}>
            <h3 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '5px', fontFamily: 'var(--fh)' }}><Counter end={10} suffix="M+" /></h3>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Views</p>
          </div>
          <div style={{ textAlign: 'center', flex: '1 1 200px' }}>
            <h3 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '5px', fontFamily: 'var(--fh)' }}><Counter end={50} suffix="+" /></h3>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Campaigns Executed</p>
          </div>
          <div style={{ textAlign: 'center', flex: '1 1 200px' }}>
            <h3 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '5px', fontFamily: 'var(--fh)' }}><Counter end={20} suffix="+" /></h3>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Brands</p>
          </div>
        </div>
      </div>


      {/* ── HORIZONTAL VIDEO MARQUEE ── */}
      <div className="page-section" id="portfolio-wrap" style={{ background: 'var(--w)', paddingBottom: '120px', paddingTop: '60px', overflow: 'hidden' }}>
        <div style={{ textAlign: 'left', marginBottom: '60px', padding: '0 5%', maxWidth: '1400px', margin: '0 auto' }}>
          <div className="sec-ey reveal-up" style={{ color: 'var(--p)', justifyContent: 'flex-start', marginBottom: '10px' }}>
            — {content['portfolio_eyebrow'] || 'A FEW THINGS WE BROUGHT TO LIFE'}
          </div>
        </div>

        {/* Marquee Wrapper */}
        <div className="video-marquee-container reveal-up d-3">
          <div className="video-marquee-track">
            {marqueeReels.map((reel, idx) => {
              return (
                <div
                  key={`${reel.id}-${idx}`}
                  className="video-marquee-card"
                >
                  {(() => {
                    const [videoSrc, externalUrl] = (reel.media_url || '').split('|||');
                    const content = (
                      <>
                        <video className="video-marquee-asset" src={videoSrc} autoPlay loop muted playsInline />
                        <div className="video-card-overlay">
                          <h4 className="video-card-creator-name">{reel.project_name}</h4>
                          {externalUrl && <span style={{ fontSize: '0.8rem', background: 'var(--p)', padding: '4px 8px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>View Original ↗</span>}
                        </div>
                      </>
                    );
                    return externalUrl ? <a href={externalUrl} target="_blank" rel="noreferrer" style={{ display: 'block', height: '100%', color: 'inherit' }}>{content}</a> : content;
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
     
      {/* ── CONTACT ── */}
      <div className="page-section bg-gray" id="contact-wrap">
        <section className="inner-section" style={{ borderTop: '1px solid var(--gm)' }}>
          <div className="sec-inner">
            <div className="sec-ey reveal-up">{content['contact_eyebrow'] || 'Get In Touch'}</div>
            <div className="ct-g">
              <div className="reveal-up d-1">
                <div className="ct-tagline" dangerouslySetInnerHTML={{ __html: content['contact_tagline'] || 'Let\'s Build Something<br /><em class="nlogo-claim">Great Together.</em>' }} />
                <div className="ct-items">
                  <div className="ct-item hover-target"><div className="ct-item-ic">📧</div><div className="ct-item-tx"><a href={`mailto:${content['contact_email'] || 'kritika@letsclaimfame.com'}`}>{content['contact_email'] || 'kritika@letsclaimfame.com'}</a></div></div>
                  <div className="ct-item hover-target"><div className="ct-item-ic">📞</div><div className="ct-item-tx"><a href={`tel:${content['contact_phone'] || '+919643737794'}`}>{content['contact_phone'] || '+91 96437 37794, +91 89208 00014'}</a></div></div>
                  <div className="ct-item"><div className="ct-item-ic">📍</div><div className="ct-item-tx">{content['contact_location'] || 'New Delhi, India'}</div></div>
                </div>
                <a href={content['contact_wa_link'] || 'https://wa.me/919643737794'} className="wa-btn hover-target" target="_blank" rel="noreferrer">{content['contact_wa_text'] || 'Chat on WhatsApp'}</a>
              </div>
              <div className="ct-form reveal-up d-2">
                <form onSubmit={handleSubmit}>
                  <div className="f-row"><div className="fg"><label className="flb">Name</label><input type="text" name="name" className="fi hover-target" placeholder="Your Name" required /></div><div className="fg"><label className="flb">Email</label><input type="email" name="email" className="fi hover-target" placeholder="brand@email.com" required /></div></div>
                  <div className="f-row"><div className="fg"><label className="flb">Brand</label><input type="text" name="brand" className="fi hover-target" placeholder="Your Brand" required /></div><div className="fg"><label className="flb">Phone</label><input type="tel" name="phone" className="fi hover-target" placeholder="+91 00000 00000" required /></div></div>
                  <div className="fg full"><label className="flb">Service</label><select className="fs fi hover-target" name="service" defaultValue="" required><option value="" disabled>Select a service</option><option value="Campaign Strategy">Campaign Strategy</option><option value="Influencer Marketing">Influencer Marketing</option><option value="Meme Marketing">Meme Marketing</option><option value="Content Production">Content Production</option><option value="Brand Collabs">Brand Collabs</option><option value="Performance">Performance</option><option value="UGC Content">UGC Content</option></select></div>
                  <div className="fg full"><label className="flb">Message</label><textarea className="ft hover-target" name="message" placeholder="Tell us about your brand goals..." required></textarea></div>
                  <button type="submit" className="fsub hover-target">{buttonText}</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div> {/* Correctly closes contact-wrap */}
       
      {/* ── FULL FOOTER ── */}
      <footer style={{ borderTop: 'none', padding: '80px 5% 40px', background: 'var(--w)' }}>
        
        {/* Main Footer Content Area (4 Columns) */}
        <div className="ft-g">
          
          {/* Column 1: Big Logo & Tagline */}
          <div>
            <a href="/" className="hover-target">
              <img src="/ClaimFameDP-removebg-preview.png" alt="Claim Fame" style={{ width: '175px', height: 'auto', objectFit: 'contain', marginBottom: '24px', display: 'block' }} />
            </a>
            <p className="ft-tag">
              Helping brands claim their spotlight with the perfect blend of strategy, creativity, and impact. We build presence, not just campaigns.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="ft-col-ttl">Company</h4>
            <ul className="ft-lks">
              <li><a href="/#about-wrap" className="hover-target">About Us</a></li>
              <li><a href="/services" className="hover-target">Our Services</a></li>
              <li><a href="/#contact-wrap" className="hover-target">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Showcase */}
          <div>
            <h4 className="ft-col-ttl">Showcase</h4>
            <ul className="ft-lks">
              <li><a href="/clients" className="hover-target">Our Work</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Drop */}
          <div>
            <h4 className="ft-col-ttl">Reach Out</h4>
            <ul className="ft-lks">
              <li><a href="mailto:kritika@letsclaimfame.com" className="hover-target">kritika@letsclaimfame.com</a></li>
              <li><a href="tel:+919643737794" className="hover-target">+91 96437 37794, +91 89208 00014</a></li>
              <li style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '10px' }}>New Delhi, India<br/>Working Globally</li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar & Socials */}
        <div className="ft-bot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', paddingTop: '30px', borderTop: '1px solid var(--gm)' }}>
          
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>© 2026 Claim Fame. All rights reserved.</span>

          <div className="ft-soc">
            {/* Instagram */}
            <a href={content['instagram_url'] || "https://www.instagram.com/letsclaimfame"} target="_blank" rel="noreferrer" className="hover-target" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            {/* LinkedIn */}
            <a href={content['linkedin_url'] || "https://www.linkedin.com/company/lets-claim-fame"} target="_blank" rel="noreferrer" className="hover-target" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            {/* X (formerly Twitter) */}
            <a href={content['x_url'] || "https://x.com/letsclaimfame"} target="_blank" rel="noreferrer" className="hover-target" aria-label="X (formerly Twitter)">
              <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
          
        </div>
      </footer>
    </>
  );
}
