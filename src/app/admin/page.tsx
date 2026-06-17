'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [buttonText, setButtonText] = useState('Send Message →');
  const [logos, setLogos] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [newProject, setNewProject] = useState({ project_name: '', description: '', file: null as File | null });
  const [newClient, setNewClient] = useState({ brand_name: '', file: null as File | null });
  
  // Hero Video & About Image Upload State Handlers
  const [heroVideo, setHeroVideo] = useState<File | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [aboutImage, setAboutImage] = useState<File | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

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

  const handleHeroVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroVideo) return;
    setIsVideoUploading(true);

    const fileName = `hero-video/${Date.now()}-${heroVideo.name}`;
    const { error: uploadError } = await supabase.storage.from('agency-media').upload(fileName, heroVideo);
    
    if (uploadError) {
      alert('Error uploading video. Make sure file is under limits.');
      setIsVideoUploading(false);
      return;
    }

    const { data } = supabase.storage.from('agency-media').getPublicUrl(fileName);
    const { data: existing } = await supabase.from('site_content').select('*').eq('section_key', 'hero_video_url');
    
    if (existing && existing.length > 0) {
      await supabase.from('site_content').update({ content_value: data.publicUrl }).eq('section_key', 'hero_video_url');
    } else {
      await supabase.from('site_content').insert([{ section_key: 'hero_video_url', content_value: data.publicUrl }]);
    }

    setHeroVideo(null);
    checkSessionAndFetchData();
    setIsVideoUploading(false);
    alert('Hero video updated successfully!');
  };

  const handleAboutImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutImage) return;
    setIsImageUploading(true);

    const fileName = `about-image/${Date.now()}-${aboutImage.name}`;
    const { error: uploadError } = await supabase.storage.from('agency-media').upload(fileName, aboutImage);

    if (uploadError) {
      alert('Error uploading image asset to bucket storage.');
      setIsImageUploading(false);
      return;
    }

    const { data } = supabase.storage.from('agency-media').getPublicUrl(fileName);
    const { data: existing } = await supabase.from('site_content').select('*').eq('section_key', 'about_image_url');

    if (existing && existing.length > 0) {
      await supabase.from('site_content').update({ content_value: data.publicUrl }).eq('section_key', 'about_image_url');
    } else {
      await supabase.from('site_content').insert([{ section_key: 'about_image_url', content_value: data.publicUrl }]);
    }

    setAboutImage(null);
    checkSessionAndFetchData();
    setIsImageUploading(false);
    alert('About Section image asset replaced successfully!');
  };

    if (error) {
      alert('Error updating text parameters.');
      console.error(error);
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

      <main className="admin-main">
        <div style={{display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap'}}>
          {['inbox', 'portfolio', 'clients', 'settings'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              style={{
                padding: '12px 24px', borderRadius: '100px', border: 'none', 
                background: activeTab === tab ? 'var(--p)' : 'var(--w)', 
                color: activeTab === tab ? '#fff' : 'var(--k)', 
                cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--fb)',
                boxShadow: activeTab === tab ? '0 10px 25px rgba(143,30,174,0.25)' : '0 4px 10px rgba(0,0,0,0.03)'
              }}>
              {tab === 'portfolio' ? '🎬 CAMPAIGN REELS' : tab.toUpperCase()}
            </button>
          ))}
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

        {activeTab === 'portfolio' && (
          <div className="admin-card" style={{padding: '30px'}}>
            <h2 style={{fontFamily: 'var(--fh)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '5px'}}>Add Client Vertical Video</h2>
            <p style={{color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px'}}>Upload short 9:16 portrait MP4 files for the "Things We Brought To Life" section.</p>
            <form onSubmit={handleAddProject} style={{display: 'flex', gap: '10px', marginBottom: '40px', flexWrap: 'wrap'}}>
              <input type="text" placeholder="Campaign Name / Brand" value={newProject.project_name} className="fi" required onChange={e => setNewProject({...newProject, project_name: e.target.value})} style={{flex: 1, minWidth: '200px'}} />
              <input type="file" accept="video/mp4,video/webm" className="fi" required onChange={e => setNewProject({...newProject, file: e.target.files?.[0] || null})} style={{flex: 1, minWidth: '200px'}} />
              <button type="submit" className="fsub" disabled={isUploading} style={{width: 'auto', padding: '0 30px', margin: 0}}>{isUploading ? 'Uploading...' : 'Upload Video'}</button>
            </form>
            
            <h3 style={{fontFamily: 'var(--fh)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px'}}>Live Vertical Clips</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px'}}>
              {portfolio.map(p => (
                <div key={p.id} style={{background: 'var(--g)', padding: '15px', borderRadius: '16px', border: '1px solid var(--gm)'}}>
                  <video src={p.media_url} style={{width:'100%', height:'280px', objectFit:'cover', borderRadius: '12px'}} muted loop playsInline />
                  <p style={{fontFamily: 'var(--fh)', fontWeight: 700, marginTop: '15px', color: 'var(--k)', fontSize: '0.95rem'}}>{p.project_name}</p>
                  <button onClick={() => supabase.from('portfolio').delete().eq('id', p.id).then(checkSessionAndFetchData)} style={{marginTop: '10px', background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, width: '100%'}}>Delete Video</button>
                </div>
              ))}
              {portfolio.length === 0 && <div style={{color: 'var(--muted)', gridColumn: '1/-1'}}>No campaign reels uploaded yet.</div>}
            </div>
          </div>
        </section>
      </div>

        {activeTab === 'clients' && (
          <div className="admin-card" style={{padding: '30px'}}>
            <h2 style={{fontFamily: 'var(--fh)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px'}}>Add Client Logo</h2>
            <form onSubmit={handleAddClient} style={{display: 'flex', gap: '10px', marginBottom: '40px', flexWrap: 'wrap'}}>
              <input type="text" placeholder="Brand Name" value={newClient.brand_name} className="fi" required onChange={e => setNewClient({...newClient, brand_name: e.target.value})} style={{flex: 1, minWidth: '200px'}} />
              <input type="file" className="fi" required onChange={e => setNewClient({...newClient, file: e.target.files?.[0] || null})} style={{flex: 1, minWidth: '200px'}} />
              <button type="submit" className="fsub" disabled={isUploading} style={{width: 'auto', padding: '0 30px', margin: 0}}>{isUploading ? 'Uploading...' : 'Upload Logo'}</button>
            </form>

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

        {activeTab === 'settings' && (
          <div className="admin-card" style={{padding: '30px'}}>
            
            {/* HERO VIDEO FORM */}
            <div style={{ marginBottom: '30px', padding: '25px', background: 'var(--g)', border: '1px solid var(--gm)', borderRadius: '16px' }}>
              <h3 style={{fontFamily: 'var(--fh)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '5px'}}>Update Hero Video Loop</h3>
              <p style={{color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '15px'}}>Upload a premium background video file for your landing screen display.</p>
              <form onSubmit={handleHeroVideoUpload} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <input type="file" accept="video/mp4,video/webm" className="fi" required onChange={e => setHeroVideo(e.target.files?.[0] || null)} style={{flex: 1, minWidth: '250px', background: 'var(--w)'}} />
                <button type="submit" className="fsub" disabled={isVideoUploading} style={{width: 'auto', padding: '0 30px', margin: 0}}>
                  {isVideoUploading ? 'Uploading Video...' : 'Upload Video'}
                </button>
              </form>
            </div>

            {/* NEW SECTION IMAGE FORM (Screenshot 2026-06-13 at 8.45.44 PM.jpg) */}
            <div style={{ marginBottom: '50px', padding: '25px', background: 'var(--g)', border: '1px solid var(--gm)', borderRadius: '16px' }}>
              <h3 style={{fontFamily: 'var(--fh)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '5px'}}>Update "Who We Are" Image</h3>
              <p style={{color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '15px'}}>Upload a high-end photo to replace the current office graphic asset image display.</p>
              <form onSubmit={handleAboutImageUpload} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <input type="file" accept="image/*" className="fi" required onChange={e => setAboutImage(e.target.files?.[0] || null)} style={{flex: 1, minWidth: '250px', background: 'var(--w)'}} />
                <button type="submit" className="fsub" disabled={isImageUploading} style={{width: 'auto', padding: '0 30px', margin: 0}}>
                  {isImageUploading ? 'Uploading Image...' : 'Upload Image'}
                </button>
              </form>
            </div>

            <h2 style={{fontFamily: 'var(--fh)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px'}}>Edit Website Texts</h2>
            {siteContent.length === 0 ? (
              <p style={{color: 'var(--muted)'}}>No configuration mappings synchronized inside your content dataset fields.</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
                {siteContent.map((item) => (
                  <div key={item.id} className="fg" style={{marginBottom: 0}}>
                    <label className="flb" style={{textTransform: 'uppercase', color: 'var(--p)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em'}}>
                      {item.section_key.replace(/_/g, ' ')}
                    </label>
                    <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                      <textarea className="fi" defaultValue={item.content_value} id={`input-${item.section_key}`} style={{minHeight: '60px', flex: 1, minWidth: '250px'}} />
                      <button 
                        className="fsub" 
                        disabled={isUploading}
                        onClick={() => {
                          const el = document.getElementById(`input-${item.section_key}`) as HTMLTextAreaElement;
                          handleUpdateContent(item.section_key, el.value);
                        }}
                        style={{width: 'auto', padding: '0 30px', margin: 0, height: 'auto'}}
                      >
                        {isUploading ? 'Saving...' : 'Save'}
                      </button>
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