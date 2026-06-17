'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [buttonText, setButtonText] = useState('Send Message →');
  const [logos, setLogos] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  
  // Interactive Active Service State Tracker
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    const fetchLogos = async () => {
      const { data } = await supabase.from('client_logos').select('*').order('created_at', { ascending: true });
      if (data) setLogos(data);
    };

    const fetchPortfolio = async () => {
      const { data } = await supabase
        .from('portfolio')
        .select('*')
        .order('created_at', { ascending: false });
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

    fetchLogos();
    fetchPortfolio();
    fetchContent();

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

  // Static Data mapping matching WhatsApp Image 2026-06-10 at 21.16.28_2.jpeg
  const agencyServices = [
    {
      title: 'Social Media Planning',
      icon: '📱',
      bullets: [
        'Craft tailored media plans.',
        'Develop customized content calendars.',
        'Boost your online visibility.',
        'Ensure an impactful brand presence across platforms.'
      ]
    },
    {
      title: 'Product Shoot',
      icon: '📷',
      bullets: [
        'We create clean, high-quality product shots.',
        'Develop dynamic, influencer-led visuals.',
        'Craft scroll-stopping content that brings your brand to life.',
        'Your product is the "Main Character".'
      ]
    },
    {
      title: 'Meme Marketing',
      icon: '😊',
      bullets: [
        'We collaborate with popular meme pages.',
        'We also collaborate with AI pages.',
        'Craft witty and relatable content.',
        'Boost your brand\'s online visibility.',
        'Drive high engagement organically.'
      ]
    },
    {
      title: 'Performance Marketing',
      icon: '🎯',
      bullets: [
        'Google Ads – Capture active buyers via search, display & video.',
        'Meta Ads – Targeted ads on Facebook & Instagram.',
        'E-commerce Ads – Boost online store & marketplace sales.',
        'Amazon/Flipkart Ads – Promote products and increase visibility on Amazon and Flipkart shoppers.',
        'Quick Commerce Ads – Advertise on Blinkit, Zepto & Instamart.'
      ]
    },
    {
      title: 'Influencer Marketing',
      icon: '🎬',
      bullets: [
        'Teaming up with Influencers from across India.',
        'Covering every language and every niche.',
        'Curating authentic voices that truly connect with the audience.',
        'Helping your brand to speak louder and connect deeper.',
        'Getting the best prices and transparency of price with brands and creators.'
      ]
    },
    {
      title: 'Video Editing',
      icon: '📹',
      bullets: [
        'We partner with editors who master high-retention techniques to stop the scroll and keep eyes on your brand.',
        'Elevate your visuals with dynamic motion design and professional typography that makes your message pop.',
        'Leverage cutting-edge AI video technology to create futuristic, shareable content that stands out from the crowd.',
        'Our team ensures every video is strategically cut for maximum impact on specific social algorithms.'
      ]
    }
  ];

  const defaultReels = [
    { id: 'df1', project_name: 'Beardo Global Campaign', media_url: 'https://cdn.pixabay.com/video/2021/04/12/70881-537449557_large.mp4' },
    { id: 'df2', project_name: 'Mamaearth UGC Concept', media_url: 'https://cdn.pixabay.com/video/2020/03/17/33718-392520300_large.mp4' },
    { id: 'df3', project_name: 'Zouk Lookbook Reels', media_url: 'https://cdn.pixabay.com/video/2020/09/11/49622-458145244_large.mp4' },
    { id: 'df4', project_name: 'Kapiva Nutrition Campaign', media_url: 'https://cdn.pixabay.com/video/2021/11/04/94595-645851174_large.mp4' }
  ];

  const renderedReels = portfolio.length > 0 ? portfolio : defaultReels;

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
          <li><a href="#about-wrap" className="hover-target">About</a></li>
          <li><a href="#services-wrap" className="hover-target">Services</a></li>
          <li><a href="#portfolio-wrap" className="hover-target">Campaigns</a></li>
          <li><a href="#clients-wrap" className="hover-target">Clients</a></li>
          <li><a href="#contact-wrap" className="ncta hover-target">{content['nav_cta'] || 'Get In Touch'}</a></li>
        </ul>
        <div className="hbg hover-target" id="hbg"><span></span><span></span><span></span></div>
      </nav>

      {/* ── FULLSCREEN HERO WITH KINETIC LOGO ── */}
      <div id="hero" style={{ position: 'relative', width: '100%', backgroundColor: 'var(--k)' }}>
        <div className="hero-fullscreen">
          <video
            key={content['hero_video_url'] || 'fallback'}
            className="hero-video-bg"
            autoPlay loop muted playsInline
          >
            <source src={content['hero_video_url'] || "/bg.mp4"} type="video/mp4" />
          </video>
          <div className="hero-fullscreen-content reveal-up">
            <h1 className="agency-name-huge hover-target">
              <span className="nlogo-claim">Claim</span><span className="nlogo-fame">Fame</span>
            </h1>
          </div>
        </div>

        {/* ── LOGO MARQUEE REEL ── */}
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
      <div className="page-section" id="about-wrap">
        <section className="inner-section">
          <div className="sec-inner">
            <div className="about-g">
              <div className="about-vis reveal-up">
                <img src={content['about_image_url'] || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop"} alt="Claim Fame Team" />
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

      {/* ── INTERACTIVE INLINE SERVICES TAB LAYER (TEXT NOT VISIBLE DIRECTLY) ── */}
      <div className="page-section bg-gray" id="services-wrap" style={{ borderTop: '1px solid var(--gm)', paddingBottom: '120px', paddingTop: '100px' }}>
        <section className="inner-section" style={{ display: 'block', padding: '0 5%' }}>
          <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
            
            <div className="sec-ey">{content['services_eyebrow'] || 'Our Expertise'}</div>
            <h2 className="sec-ttl" style={{ marginBottom: '50px', color: 'var(--p)' }}>
              Our Services
            </h2>
            
            {/* Horizontal Line Tab Arrangement Row */}
            <div className="services-inline-row reveal-up">
              {agencyServices.map((svc, index) => (
                <div 
                  key={index} 
                  className={`service-line-tab hover-target ${activeService === index ? 'active-tab' : ''}`}
                  onClick={() => setActiveService(index)}
                >
                  <div className="tab-icon-frame">{svc.icon}</div>
                  <h4 className="tab-title-txt">{svc.title}</h4>
                  <div className="tab-active-indicator"></div>
                </div>
              ))}
            </div>

            {/* Dynamic Details Box Display Matrix - Revealing Text only on click selection */}
            <div className="services-details-matrix-display reveal-up d-1">
              <div className="details-display-card">
                <div className="details-header-row">
                  <span className="details-brand-icon">{agencyServices[activeService].icon}</span>
                  <h3>{agencyServices[activeService].title}</h3>
                </div>
                <ul className="details-bullets-list">
                  {agencyServices[activeService].bullets.map((bullet, bIndex) => (
                    <li key={bIndex} className="details-bullet-item">
                      <span className="bullet-checkmark">✦</span>
                      <p>{bullet}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </section>
      </div>

     {/* ── VERTICAL REELS SHOWCASE ── */}
<div className="page-section" id="portfolio-wrap" style={{ background: 'var(--w)', paddingBottom: '120px', paddingTop: '60px' }}>
  <section className="inner-section" style={{ display: 'block' }}>
    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
      <div className="sec-ey reveal-up" style={{ justifyContent: 'center' }}>
        {content['portfolio_eyebrow'] || 'Case Studies'}
      </div>
      <h2 className="sec-ttl reveal-up d-1">
        {content['portfolio_title'] || 'A Few Things We Brought To Life'}
      </h2>
      <p className="reveal-up d-2" style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
        {content['portfolio_subtitle'] || 'Creator-led campaigns. Real impact. Internet culture at the core.'}
      </p>
    </div>

    {/* Dynamic Auto-Filling Video Container Layer */}
    <div className="reels-grid-container reveal-up d-3">
      {renderedReels.map((reel) => (
        <div key={reel.id} className="reel-card-wrapper hover-target">
          <div className="reel-video-container">
            <video
              className="reel-video-asset"
              src={reel.media_url}
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
          <div className="reel-card-meta">
            <h4 className="reel-title-txt">{reel.project_name}</h4>
          </div>
        </div>
      ))}
    </div>
  </section>
</div>

      {/* ── CLIENTS ── */}
      <div className="page-section" id="clients-wrap">
        <section className="inner-section" style={{ borderTop: '1px solid var(--gm)' }}>
          <div className="sec-inner">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="sec-ey reveal-up">{content['clients_eyebrow'] || 'Our Clients'}</div>
              <h2 className="sec-ttl reveal-up d-1">{content['clients_title'] || 'The Brands We Scale'}</h2>
            </div>

        {/* 3D Scene Wrapper */}
        <div className="carousel-scene reveal-up d-3">
          {/* Rotating Cylinder Container */}
          <div className="carousel-cylinder hover-target">
            {cylinderReels.map((reel, idx) => {
              const rotationAngle = (360 / totalCards) * idx;
              return (
                <div
                  key={`${reel.id}-${idx}`}
                  className="carousel-card"
                  style={{ transform: `rotateY(${rotationAngle}deg) translateZ(var(--radius))` }}
                >
                  <div className="carousel-video-container">
                    <video className="carousel-video-asset" src={reel.media_url} autoPlay loop muted playsInline />
                    <div className="carousel-card-meta">
                      <h4 className="carousel-title-txt">{reel.project_name}</h4>
                    </div>
                  </div>
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
                  <div className="ct-item hover-target"><div className="ct-item-ic">📧</div><div className="ct-item-tx"><a href={`mailto:${content['contact_email'] || 'hello@letsclaimfame.com'}`}>{content['contact_email'] || 'hello@letsclaimfame.com'}</a></div></div>
                  <div className="ct-item hover-target"><div className="ct-item-ic">📞</div><div className="ct-item-tx"><a href={`tel:${content['contact_phone'] || '+911234567890'}`}>{content['contact_phone'] || '+91 12345 67890'}</a></div></div>
                  <div className="ct-item"><div className="ct-item-ic">📍</div><div className="ct-item-tx">{content['contact_location'] || 'New Delhi, India'}</div></div>
                </div>
                <a href={content['contact_wa_link'] || 'https://wa.me/911234567890'} className="wa-btn hover-target" target="_blank" rel="noreferrer">{content['contact_wa_text'] || 'Chat on WhatsApp'}</a>
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
              {/* Increased height to 100px so it's bold and clearly visible */}
              <img src="/ClaimFameDP-removebg-preview.png" alt="Claim Fame" style={{ height: '175px', width: 'auto', objectFit: 'contain', marginBottom: '24px', display: 'block' }} />
            </a>
            <p className="ft-tag">
              Helping brands claim their spotlight with the perfect blend of strategy, creativity, and impact. We build presence, not just campaigns.
            </p>
          </div>

        <footer>
          <div className="ft-g">
            <div className="reveal-up">
              <a href="#hero" className="ft-logo">
                <span className="nlogo-claim">Claim</span><span className="nlogo-fame">Fame</span>
              </a>
              <p className="ft-tag">{content['footer_tagline'] || 'Delhi-based influencer marketing agency.'}</p>
            </div>
            <div className="reveal-up d-1">
              <div className="ft-col-ttl">Quick Links</div>
              <ul className="ft-lks">
                <li><a href="#hero" className="hover-target">Home</a></li>
                <li><a href="#about-wrap" className="hover-target">About Us</a></li>
                <li><a href="#portfolio-wrap" className="hover-target">Campaigns</a></li>
                <li><a href="#clients-wrap" className="hover-target">Clients</a></li>
              </ul>
            </div>
            <div className="reveal-up d-2">
              <div className="ft-col-ttl">Services</div>
              <ul className="ft-lks">
                <li><a href="#services-wrap" className="hover-target">Influencer Marketing</a></li>
                <li><a href="#services-wrap" className="hover-target">Campaign Strategy</a></li>
                <li><a href="#services-wrap" className="hover-target">Content Production</a></li>
              </ul>
            </div>
            <div className="reveal-up d-3">
              <div className="ft-col-ttl">Contact</div>
              <ul className="ft-lks">
                <li><a href={`mailto:${content['contact_email'] || 'hello@letsclaimfame.com'}`} className="hover-target">{content['contact_email'] || 'hello@letsclaimfame.com'}</a></li>
                <li><a href={`tel:${content['contact_phone'] || '+911234567890'}`} className="hover-target">{content['contact_phone'] || '+91 12345 67890'}</a></li>
              </ul>
            </div>
          </div>

          {/* Column 3: Showcase */}
          <div>
            <h4 className="ft-col-ttl">Showcase</h4>
            <ul className="ft-lks">
              <li><a href="/clients" className="hover-target">Our Clients</a></li>
              <li><a href="/campaigns" className="hover-target">Campaigns by Niche</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Drop */}
          <div>
            <h4 className="ft-col-ttl">Reach Out</h4>
            <ul className="ft-lks">
              <li><a href="mailto:hello@letsclaimfame.com" className="hover-target">hello@letsclaimfame.com</a></li>
              <li><a href="tel:+911234567890" className="hover-target">+91 12345 67890</a></li>
              <li style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '10px' }}>New Delhi, India<br/>Working Globally</li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar & Socials */}
        <div className="ft-bot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', paddingTop: '30px', borderTop: '1px solid var(--gm)' }}>
          
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>© 2026 Claim Fame. All rights reserved.</span>

          <div className="ft-soc">
            {/* Instagram */}
            <a href="#" className="hover-target" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="hover-target" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            {/* Twitter / X */}
            <a href="#" className="hover-target" aria-label="Twitter">
              <svg viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.38 4.482A13.94 13.94 0 011.671 3.149a4.93 4.93 0 001.523 6.574 4.903 4.903 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.084 4.928 4.928 0 004.6 3.419A9.9 9.9 0 010 19.54a13.94 13.94 0 007.548 2.212c9.057 0 14.01-7.506 14.01-14.01 0-.213-.005-.425-.014-.636A10.025 10.025 0 0024 4.557z"/></svg>
            </a>
          </div>
          
        </div>
      </footer>
    </>
  );
}