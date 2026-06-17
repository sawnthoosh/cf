'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [buttonText, setButtonText] = useState('Send Message →');
  const [logos, setLogos] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchLogos = async () => {
      const { data } = await supabase
        .from('client_logos')
        .select('*')
        .order('created_at', { ascending: true });
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
        data.forEach((item: any) => {
          contentMap[item.section_key] = item.content_value;
        });
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
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      };
      window.addEventListener('mousemove', onMouseMove);

      const animateCursor = () => {
        fX += (mouseX - fX) * 0.15;
        fY += (mouseY - fY) * 0.15;
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
    const handleScroll = () => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    const hbg = document.getElementById('hbg');
    const nl = document.getElementById('nl');
    if (hbg && nl) {
      hbg.addEventListener('click', () => nl.classList.toggle('open'));
    }

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
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      brand: formData.get('brand') as string,
      phone: formData.get('phone') as string,
      service: formData.get('service') as string,
      message: formData.get('message') as string,
    };

    const { error } = await supabase.from('form_submissions').insert([submissionData]);

    if (error) {
      console.error('Error submitting form:', error);
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

  const renderedReels = portfolio.length > 0 ? portfolio : defaultReels;

  return (
    <>
      <div id="cursor"></div>
      <div id="cursor-follower"></div>

      <nav id="nav">
        <a href="/" className="nlogo hover-target">
          <span className="nlogo-claim">Claim</span><span className="nlogo-fame">Fame</span>
        </a>
        <ul className="nlinks" id="nl">
          <li><a href="/#about-wrap" className="hover-target">About</a></li>
          {/* Linked explicitly to standalone sub-routes */}
          <li><a href="/services" className="hover-target">Services</a></li>
          <li><a href="/clients" className="hover-target">Clients</a></li>
          <li><a href="#contact-wrap" className="ncta hover-target">{content['nav_cta'] || 'Get In Touch'}</a></li>
        </ul>
        <div className="hbg hover-target" id="hbg">
          <span></span><span></span><span></span>
        </div>
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
          
          <div className="hero-fullscreen-content">
            <h1 className="agency-name-huge hover-target">
              <span className="nlogo-claim">Claim</span><span className="nlogo-fame">Fame</span>
            </h1>
          </div>
        </div>

        {/* ── CLEAN LOGO STRIP MARQUEE ── */}
        <div className="white-strip-marquee">
          <div className="marquee-track">
            {(() => {
              const fallbackLogos = [
                { id: 'f1', logo_url: '/kapiva-logo.png', brand_name: 'Kapiva' },
                { id: 'f2', logo_url: '/zouk-logo.webp', brand_name: 'Zouk' },
                { id: 'f3', logo_url: '/mama-earth-logo.png', brand_name: 'Mamaearth' },
                { id: 'f4', logo_url: '/wow-skin-logo.jpg', brand_name: 'Wow Skin' },
                { id: 'f5', logo_url: '/boat-logo.webp', brand_name: 'boAt' }
              ];
              
              let baseLogos = logos.length > 0 ? logos : fallbackLogos;
              let displayLogos = baseLogos.length < 5 ? [...baseLogos, ...baseLogos, ...baseLogos] : baseLogos;

              return (
                <>
                  <div className="marquee-group">
                    {displayLogos.map((client, i) => (
                      <div key={`g1-${i}`} className="marquee-logo hover-target">
                        <img src={client.logo_url} alt={client.brand_name} />
                      </div>
                    ))}
                  </div>
                  <div className="marquee-group" aria-hidden="true">
                    {displayLogos.map((client, i) => (
                      <div key={`g2-${i}`} className="marquee-logo hover-target">
                        <img src={client.logo_url} alt={client.brand_name} />
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div className="page-section" id="about-wrap">
        <section className="inner-section">
          <div className="sec-inner">
            <div className="about-g">
              <div className="about-vis reveal-up">
                <img
                  src={content['about_image_url'] || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop"}
                  alt="Claim Fame Team"
                />
              </div>
              <div className="about-txt reveal-up d-1">
                <div className="sec-ey">{content['about_eyebrow'] || 'Who We Are'}</div>
                <h2 className="sec-ttl" dangerouslySetInnerHTML={{ __html: content['about_title'] || 'We Exist for Brands That Want to Trend.' }} />
                <p dangerouslySetInnerHTML={{ 
                  __html: content['about_paragraph'] || '<strong>Claim Fame</strong> is your one-stop shop for all your marketing needs. We handle the heavy lifting across influencer marketing, social media, PR, performance marketing, and production, turning your wild ideas into conversations people actually want to have.<br /><br />No fluff, no fake hype. Just razor-sharp strategy and execution that feels <strong>100% real.</strong> We don\'t just build campaigns. We build presence.' 
                }} />
                <a href="#contact-wrap" className="btn-p hover-target" style={{ marginTop: '10px' }}>
                  {content['about_btn'] || 'Partner With Us'}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── CASE STUDIES REELS SHOWCASE ── */}
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

      {/* ── CONTACT ── */}
      <div className="page-section bg-gray" id="contact-wrap">
        <section className="inner-section" style={{ borderTop: '1px solid var(--gm)' }}>
          <div className="sec-inner">
            <div className="sec-ey reveal-up">{content['contact_eyebrow'] || 'Get In Touch'}</div>
            <div className="ct-g">
              <div className="reveal-up d-1">
                <div className="ct-tagline" dangerouslySetInnerHTML={{ __html: content['contact_tagline'] || 'Let\'s Build Something<br /><em class="nlogo-claim">Great Together.</em>' }} />
                <div className="ct-items">
                  <div className="ct-item hover-target">
                    <div className="ct-item-ic">📧</div>
                    <div className="ct-item-tx"><a href={`mailto:${content['contact_email'] || 'hello@letsclaimfame.com'}`}>{content['contact_email'] || 'hello@letsclaimfame.com'}</a></div>
                  </div>
                  <div className="ct-item hover-target">
                    <div className="ct-item-ic">📞</div>
                    <div className="ct-item-tx"><a href={`tel:${content['contact_phone'] || '+911234567890'}`}>{content['contact_phone'] || '+91 12345 67890'}</a></div>
                  </div>
                  <div className="ct-item">
                    <div className="ct-item-ic">📍</div>
                    <div className="ct-item-tx">{content['contact_location'] || 'New Delhi, India'}</div>
                  </div>
                </div>
                <a href={content['contact_wa_link'] || 'https://wa.me/911234567890'} className="wa-btn hover-target" target="_blank" rel="noreferrer">
                  {content['contact_wa_text'] || 'Chat on WhatsApp'}
                </a>
              </div>

              <div className="ct-form reveal-up d-2">
                <form onSubmit={handleSubmit}>
                  <div className="f-row">
                    <div className="fg">
                      <label className="flb">Name</label>
                      <input type="text" name="name" className="fi hover-target" placeholder="Your Name" required />
                    </div>
                    <div className="fg">
                      <label className="flb">Email</label>
                      <input type="email" name="email" className="fi hover-target" placeholder="brand@email.com" required />
                    </div>
                  </div>
                  <div className="f-row">
                    <div className="fg">
                      <label className="flb">Brand</label>
                      <input type="text" name="brand" className="fi hover-target" placeholder="Your Brand" required />
                    </div>
                    <div className="fg">
                      <label className="flb">Phone</label>
                      <input type="tel" name="phone" className="fi hover-target" placeholder="+91 00000 00000" required />
                    </div>
                  </div>
                  <div className="fg full">
                    <label className="flb">Service</label>
                    <select className="fs fi hover-target" name="service" defaultValue="" required>
                      <option value="" disabled>Select a service</option>
                      <option value="Campaign Strategy">Campaign Strategy</option>
                      <option value="Influencer Marketing">Influencer Marketing</option>
                      <option value="Meme Marketing">Meme Marketing</option>
                      <option value="Content Production">Content Production</option>
                      <option value="Brand Collabs">Brand Collabs</option>
                      <option value="Performance">Performance</option>
                      <option value="UGC Content">UGC Content</option>
                    </select>
                  </div>
                  <div className="fg full">
                    <label className="flb">Message</label>
                    <textarea className="ft hover-target" name="message" placeholder="Tell us about your brand goals..." required></textarea>
                  </div>
                  <button type="submit" className="fsub hover-target">{buttonText}</button>
                </form>
              </div>
            </div>
          </div>
        </section>

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
                <li><a href="/services" className="hover-target">Our Services</a></li>
                <li><a href="/clients" className="hover-target">Our Clients</a></li>
              </ul>
            </div>
            <div className="reveal-up d-2">
              <div className="ft-col-ttl">Services</div>
              <ul className="ft-lks">
                <li><a href="/services" className="hover-target">Influencer Marketing</a></li>
                <li><a href="/services" className="hover-target">Campaign Strategy</a></li>
                <li><a href="/services" className="hover-target">Content Production</a></li>
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
          <div className="ft-bot reveal-up">
            <span>{content['footer_copyright'] || '© 2026 Claim Fame. All rights reserved.'}</span>
          </div>
        </footer>
      </div>
    </>
  );
}