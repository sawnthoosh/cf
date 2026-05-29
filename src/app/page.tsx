'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [buttonText, setButtonText] = useState('Send Message →');
  const [logos, setLogos] = useState<any[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchLogos = async () => {
      const { data } = await supabase
        .from('client_logos')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setLogos(data);
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

  return (
    <>
      <div id="cursor"></div>
      <div id="cursor-follower"></div>

      <nav id="nav">
        <a href="#hero" className="nlogo hover-target">
          <span className="nlogo-claim">Claim</span><span className="nlogo-fame">Fame</span>
        </a>
        <ul className="nlinks" id="nl">
          <li><a href="#about-wrap" className="hover-target">About</a></li>
          <li><a href="#services-wrap" className="hover-target">Services</a></li>
          <li><a href="#clients-wrap" className="hover-target">Clients</a></li>
          <li><a href="#contact-wrap" className="ncta hover-target">{content['nav_cta'] || 'Get In Touch'}</a></li>
        </ul>
        <div className="hbg hover-target" id="hbg">
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="page-section" id="hero">
        <div className="hero-bg-accent"></div>
        <div className="hero-content-wrapper">
          <div className="hero-grid">
            <div className="hero-text reveal-up">
              <div className="h-tag">{content['hero_tagline'] || 'Claim Fame - The real fame story starts here!'}</div>
              <h1 
                className="h1" 
                dangerouslySetInnerHTML={{ 
                  __html: content['hero_headline'] || 'Building Brands<br />Through <em class="nlogo-claim">Influence.</em>' 
                }} 
              />
              <p className="h-sub">
                {content['hero_subheadline'] || 'Your one-stop creative powerhouse for influencer marketing, social media, PR, performance & production. No fluff — just razor-sharp strategy.'}
              </p>
              <div className="h-ctas">
                <a href="#contact-wrap" className="btn-p hover-target">{content['hero_btn_primary'] || 'Get In Touch'}</a>
                <a href="#services-wrap" className="btn-s hover-target">{content['hero_btn_secondary'] || 'View Our Work'}</a>
              </div>
            </div>
            <div className="hero-visual reveal-up d-1">
              <div className="video-preview-card">
                <video
                  autoPlay loop muted playsInline
                  poster="https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=600&auto=format&fit=crop"
                >
                  <source src={content['hero_video_url'] || "https://www.w3schools.com/html/mov_bbb.mp4"} type="video/mp4" />
                </video>
                <div className="v-play-btn hover-target">▶</div>
                <div className="v-badge"><span></span> {content['hero_video_badge'] || 'Trending Now'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── DYNAMIC MARQUEE ── */}
        <div className="mq-stack reveal-up d-2">
          <div className="mq-label">{content['marquee_label'] || "Brands We've Collaborated With"}</div>
          <div className="mq-belt">
            {logos.length > 0 ? (
              [...logos, ...logos].map((client, i) => (
                <div key={`${client.id}-${i}`} className="mq-item hover-target">
                  <img src={client.logo_url} alt={client.brand_name} />
                </div>
              ))
            ) : (
              <>
                <div className="mq-item hover-target"><img src="/kapiva-logo.png" alt="Kapiva" /></div>
                <div className="mq-item hover-target"><img src="/zouk-logo.webp" alt="Zouk" /></div>
                <div className="mq-item hover-target"><img src="/louis-stitch-logo.jpg" alt="Louis Stitch" /></div>
                <div className="mq-item hover-target"><img src="/mama-earth-logo.png" alt="Mamaearth" /></div>
              </>
            )}
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
                  __html: content['about_paragraph'] || '<strong>Claim Fame</strong>—based in Delhi, stirring things up globally—is your one-stop shop for all your marketing needs. We handle the heavy lifting across influencer marketing, social media, PR, performance marketing, and production, turning your wild ideas into conversations people actually want to have.<br /><br />No fluff, no fake hype. Just razor-sharp strategy and execution that feels <strong>100% real.</strong> We don\'t just build campaigns. We build presence.' 
                }} />
                <a href="#contact-wrap" className="btn-p hover-target" style={{ marginTop: '10px' }}>
                  {content['about_btn'] || 'Partner With Us'}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── SERVICES ── */}
      <div className="page-section bg-gray" id="services-wrap">
        <section className="inner-section" style={{ borderTop: '1px solid var(--gm)' }}>
          <div className="sec-inner">
            <div className="svc-hd reveal-up">
              <div className="sec-ey" style={{ justifyContent: 'center' }}>{content['services_eyebrow'] || 'Our Expertise'}</div>
              <h2 className="sec-ttl">{content['services_title'] || 'What We Do'}</h2>
            </div>

            <div className="svc-orbit-wrap reveal-up d-1">
              <div className="svc-universe">
                <div className="svc-center-star">CLAIM<br />FAME<br /><span>Services</span></div>
                <div className="svc-ring-line r1"></div>
                <div className="svc-ring-line r2"></div>

                <div className="svc-ring">
                  {/* Service 1 */}
                  <div className="svc-arm" style={{ transform: 'rotateZ(0deg) translateY(-450px)' }}>
                    <div className="svc-anti-spin"><div className="svc-anti-arm" style={{ transform: 'rotateZ(0deg)' }}><div className="svc-stand-up"><div className="svc-c">
                      <div className="svc-ic-wrap"><div className="svc-ic">🎯</div><div className="svc-nm">{content['svc_1_title'] || 'Campaign Strategy'}</div></div>
                      <div className="svc-ds-wrap"><div className="svc-ds">{content['svc_1_desc'] || "Data-driven blueprints built around your brand's unique goals and target audience — from concept to execution."}</div></div>
                    </div></div></div></div>
                  </div>
                  {/* Service 2 */}
                  <div className="svc-arm" style={{ transform: 'rotateZ(51.4deg) translateY(-450px)' }}>
                    <div className="svc-anti-spin"><div className="svc-anti-arm" style={{ transform: 'rotateZ(-51.4deg)' }}><div className="svc-stand-up"><div className="svc-c">
                      <div className="svc-ic-wrap"><div className="svc-ic">🤝</div><div className="svc-nm">{content['svc_2_title'] || 'Influencer Marketing'}</div></div>
                      <div className="svc-ds-wrap"><div className="svc-ds">{content['svc_2_desc'] || "Access our verified creator network of 1200+. Nano to mega — we match the right voice to your brand."}</div></div>
                    </div></div></div></div>
                  </div>
                  {/* Service 3 */}
                  <div className="svc-arm" style={{ transform: 'rotateZ(102.8deg) translateY(-450px)' }}>
                    <div className="svc-anti-spin"><div className="svc-anti-arm" style={{ transform: 'rotateZ(-102.8deg)' }}><div className="svc-stand-up"><div className="svc-c">
                      <div className="svc-ic-wrap"><div className="svc-ic">😄</div><div className="svc-nm">{content['svc_3_title'] || 'Meme Marketing'}</div></div>
                      <div className="svc-ds-wrap"><div className="svc-ds">{content['svc_3_desc'] || "We speak internet fluently. Viral-first content that inserts your brand into culture without feeling forced."}</div></div>
                    </div></div></div></div>
                  </div>
                  {/* Service 4 */}
                  <div className="svc-arm" style={{ transform: 'rotateZ(154.2deg) translateY(-450px)' }}>
                    <div className="svc-anti-spin"><div className="svc-anti-arm" style={{ transform: 'rotateZ(-154.2deg)' }}><div className="svc-stand-up"><div className="svc-c">
                      <div className="svc-ic-wrap"><div className="svc-ic">🎬</div><div className="svc-nm">{content['svc_4_title'] || 'Content Production'}</div></div>
                      <div className="svc-ds-wrap"><div className="svc-ds">{content['svc_4_desc'] || "End-to-end production: scripting, shooting, editing and delivery of brand-quality video and photo content."}</div></div>
                    </div></div></div></div>
                  </div>
                  {/* Service 5 */}
                  <div className="svc-arm" style={{ transform: 'rotateZ(205.7deg) translateY(-450px)' }}>
                    <div className="svc-anti-spin"><div className="svc-anti-arm" style={{ transform: 'rotateZ(-205.7deg)' }}><div className="svc-stand-up"><div className="svc-c">
                      <div className="svc-ic-wrap"><div className="svc-ic">🔗</div><div className="svc-nm">{content['svc_5_title'] || 'Brand Collabs'}</div></div>
                      <div className="svc-ds-wrap"><div className="svc-ds">{content['svc_5_desc'] || "Powerful brand-to-brand deals that expand reach, credibility and audience without the heavy ad spend."}</div></div>
                    </div></div></div></div>
                  </div>
                  {/* Service 6 */}
                  <div className="svc-arm" style={{ transform: 'rotateZ(257.1deg) translateY(-450px)' }}>
                    <div className="svc-anti-spin"><div className="svc-anti-arm" style={{ transform: 'rotateZ(-257.1deg)' }}><div className="svc-stand-up"><div className="svc-c">
                      <div className="svc-ic-wrap"><div className="svc-ic">📈</div><div className="svc-nm">{content['svc_6_title'] || 'Performance'}</div></div>
                      <div className="svc-ds-wrap"><div className="svc-ds">{content['svc_6_desc'] || "High-ROI performance campaigns engineered to drive measurable conversions and scalable growth."}</div></div>
                    </div></div></div></div>
                  </div>
                  {/* Service 7 */}
                  <div className="svc-arm" style={{ transform: 'rotateZ(308.5deg) translateY(-450px)' }}>
                    <div className="svc-anti-spin"><div className="svc-anti-arm" style={{ transform: 'rotateZ(-308.5deg)' }}><div className="svc-stand-up"><div className="svc-c">
                      <div className="svc-ic-wrap"><div className="svc-ic">📱</div><div className="svc-nm">{content['svc_7_title'] || 'UGC Content'}</div></div>
                      <div className="svc-ds-wrap"><div className="svc-ds">{content['svc_7_desc'] || "Authentic, scalable user-generated content that converts. Real people, real voices, real results."}</div></div>
                    </div></div></div></div>
                  </div>
                </div>
              </div>
            </div>
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

            <div className="cl-g reveal-up">
              {logos.length > 0 ? (
                logos.map((client, i) => (
                  <div key={client.id} className={`cl-c hover-target${i % 4 !== 0 ? ` d-${i % 4}` : ''}`}>
                    <div className="cl-logo-wrap">
                      <img src={client.logo_url} alt={client.brand_name} />
                    </div>
                    <div className="cl-nm">{client.brand_name}</div>
                  </div>
                ))
              ) : (
                <div style={{textAlign: 'center', width: '100%'}}>No clients uploaded yet.</div>
              )}
            </div>
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
                    <div className="ct-item-tx">{content['contact_location'] || 'New Delhi, India · Working Globally'}</div>
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
              <p className="ft-tag">{content['footer_tagline'] || 'Delhi-based influencer marketing & creative media agency. The real fame story starts here.'}</p>
            </div>
            <div className="reveal-up d-1">
              <div className="ft-col-ttl">Quick Links</div>
              <ul className="ft-lks">
                <li><a href="#hero" className="hover-target">Home</a></li>
                <li><a href="#about-wrap" className="hover-target">About Us</a></li>
                <li><a href="#clients-wrap" className="hover-target">Clients</a></li>
              </ul>
            </div>
            <div className="reveal-up d-2">
              <div className="ft-col-ttl">Services</div>
              <ul className="ft-lks">
                <li><a href="#services-wrap" className="hover-target">Influencer Marketing</a></li>
                <li><a href="#services-wrap" className="hover-target">Campaign Strategy</a></li>
                <li><a href="#services-wrap" className="hover-target">Content Production</a></li>
                <li><a href="#services-wrap" className="hover-target">UGC Content</a></li>
              </ul>
            </div>
            <div className="reveal-up d-3">
              <div className="ft-col-ttl">Contact</div>
              <ul className="ft-lks">
                <li><a href={`mailto:${content['contact_email'] || 'hello@letsclaimfame.com'}`} className="hover-target">{content['contact_email'] || 'hello@letsclaimfame.com'}</a></li>
                <li><a href={`tel:${content['contact_phone'] || '+911234567890'}`} className="hover-target">{content['contact_phone'] || '+91 12345 67890'}</a></li>
                <li><a href="#" className="hover-target">{content['contact_location'] || 'New Delhi, India'}</a></li>
              </ul>
            </div>
          </div>
          <div className="ft-bot reveal-up">
            <span>{content['footer_copyright'] || '© 2026 Claim Fame. All rights reserved.'}</span>
            <div className="ft-soc">
              <a href={content['social_ig'] || '#'} className="hover-target" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
              <a href={content['social_li'] || '#'} className="hover-target" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
              <a href={content['social_x'] || '#'} className="hover-target" aria-label="X"><svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.076H5.036z"/></svg></a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
