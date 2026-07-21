'use client';

export default function OurWorkSection({ portfolio, content, isInitialLoad }: { portfolio: any[], content: Record<string, string>, isInitialLoad: boolean }) {
  return (
    <div id="our-work" style={{ background: 'var(--w)', paddingTop: '60px' }}>
      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: '80px', padding: '0 5%' }}>
        <h2 className="sec-ttl reveal-up d-1" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', margin: 0 }}>
          OUR WORK
        </h2>
      </div>

      {/* ── BRAND CARDS SECTION ── */}
      <div className="page-section" style={{ padding: '0 5% 80px', maxWidth: '1400px', margin: '0 auto' }}>
        {(() => {
          if (isInitialLoad) return <div style={{ height: '400px' }} />;
          
          const bcStr = content['brand_cards_data'] || '[]';
          let brandCards: any[] = [];
          try { brandCards = JSON.parse(bcStr); } catch(e){}
          
          if (brandCards.length === 0) {
            brandCards = [
              { id: '1', brandName: 'KAPIVA', bgColor: 'rgba(119, 138, 94, 0.8)', imageUrl: '/kapiva-dia.jpeg', tagline: 'Ayurvedic Nutrition\n& Wellness' },
              { id: '2', brandName: 'MULTANI', bgColor: 'rgba(156, 111, 68, 0.8)', imageUrl: '/multani.jpeg', tagline: 'Holistic Ayurvedic\nHealing' },
              { id: '3', brandName: 'LOUIS STITCH', bgColor: 'rgba(40, 40, 40, 0.8)', imageUrl: '/louis-stitch-shoe.jpeg', tagline: 'Premium Men\'s\nFashion' },
              { id: '4', brandName: 'TRUEBASICS', bgColor: 'rgba(109, 76, 130, 0.8)', imageUrl: '/truebasics.jpeg', tagline: 'Science-Backed\nSupplements' },
              { id: '5', brandName: 'ZOUK', bgColor: 'rgba(176, 60, 60, 0.8)', imageUrl: '/zouk-bag.jpeg', tagline: 'Uniquely Indian\nVegan Bags' },
            ];
          }

          return (
            <div className="video-marquee-container" style={{ margin: '0 -5.5vw' }}>
              <div className="video-marquee-track" style={{ animationDuration: '30s' }}>
                {[...brandCards, ...brandCards, ...brandCards, ...brandCards].map((c: any, index: number) => (
                  <div key={`${c.id}-${index}`} style={{ width: '320px', flexShrink: 0, margin: '0 10px', borderRadius: '24px', overflow: 'hidden', color: '#fff', display: 'flex', flexDirection: 'column', height: '400px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: c.bgColor || 'var(--w)' }}>
                    
                    {/* Top: Image Section */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                      <img src={c.imageUrl} alt={c.brandName} style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
                    </div>

                    {/* Bottom: Text Section */}
                    <div style={{ padding: '25px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h2 style={{ fontFamily: 'var(--fh)', fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.02em', background: 'var(--w)', color: c.bgColor ? c.bgColor.replace(/rgba?\(([^,]+),([^,]+),([^,]+).*/, 'rgb($1,$2,$3)') : '#333', padding: '4px 12px', borderRadius: '4px', display: 'inline-block', alignSelf: 'flex-start' }}>{c.brandName}</h2>
                      {c.tagline && (
                        <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: '1.3', margin: 0, whiteSpace: 'pre-line' }}>{c.tagline}</p>
                      )}
                    </div>
                  </div>
              ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── 2 ROWS MIXED MARQUEES ── */}
      {(() => {
        const defaultReels = [
          { id: 'd1', project_name: 'Sarul Jain', brand_name: 'Kapiva', media_url: '/bg.mp4|||https://www.instagram.com/reel/DPQ_PEtgQz3/|||476K' },
          { id: 'd2', project_name: 'Aashika Bhatia', brand_name: 'Multani', media_url: '/bg.mp4|||https://www.instagram.com/p/DYhTeG1OnvD/|||523K' },
          { id: 'd3', project_name: 'Neha Sanjay', brand_name: 'Louis Stitch', media_url: '/bg.mp4|||https://www.instagram.com/reel/DYcVklUvgY6/|||617K' },
          { id: 'd4', project_name: 'Vrushali', brand_name: 'Zouk', media_url: '/bg.mp4|||https://www.instagram.com/reel/DSuDWUGjT6i/|||429K' },
          { id: 'd5', project_name: 'Tarneet Kaur', brand_name: 'Kapiva', media_url: '/bg.mp4|||https://www.instagram.com/p/DPOnDDdkv0k/|||382K' },
          { id: 'd6', project_name: 'Shruti Naxane', brand_name: 'Zouk', media_url: '/bg.mp4|||https://www.instagram.com/reel/DQ_uKLpjHek/|||664K' },
        ];

        const allReels = portfolio && portfolio.length > 0 ? portfolio : defaultReels;
        const midpoint = Math.ceil(allReels.length / 2);
        const row1 = allReels.slice(0, midpoint);
        const row2 = allReels.slice(midpoint);

        const getMarqueeItems = (items: any[]) => {
          if (items.length === 0) return [];
          let repeated = [...items];
          while (repeated.length < 10) {
            repeated = [...repeated, ...items];
          }
          return [...repeated, ...repeated];
        };

        const marquee1 = getMarqueeItems(row1);
        const marquee2 = getMarqueeItems(row2);

        return (
          <div style={{ paddingBottom: '120px', overflow: 'hidden' }}>
            <div className="reveal-up">
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--k)' }}>Campaign Reels That Delivered</h3>
              </div>
              
              <div className="video-marquee-container" style={{ marginBottom: '30px' }}>
                <div className="video-marquee-track" style={{ animationDuration: '60s' }}>
                  {marquee1.map((reel, idx) => (
                    <div key={`r1-${idx}`} className="video-marquee-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--w)', padding: 0 }}>
                      {(() => {
                        const urlParts = (reel.media_url || '').split('|||');
                        const videoSrc = urlParts[0] || '';
                        const externalUrl = urlParts[1] || '';
                        const viewsCount = urlParts[2] || '';
                        const content = (
                          <>
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                              <video className="video-marquee-asset" src={videoSrc} autoPlay loop muted playsInline />
                              <div className="video-card-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', padding: '20px 16px 12px' }}>
                                <h4 className="video-card-creator-name" style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{reel.project_name}</h4>
                                {viewsCount && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
                                    ▶ {viewsCount}
                                  </div>
                                )}
                                {externalUrl && <span style={{ fontSize: '0.8rem', background: 'var(--p)', padding: '4px 8px', borderRadius: '4px', marginTop: '6px', display: 'inline-block', color: '#fff' }}>View Original ↗</span>}
                              </div>
                            </div>
                            <div style={{ height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--w)', borderTop: '1px solid var(--gm)' }}>
                              <span style={{ fontWeight: 900, color: 'var(--k)', letterSpacing: '-0.02em', fontSize: '1.1rem' }}>{reel.brand_name || 'Creator'}</span>
                            </div>
                          </>
                        );
                        return externalUrl ? <a href={externalUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'inherit', textDecoration: 'none' }}>{content}</a> : content;
                      })()}
                    </div>
                  ))}
                </div>
              </div>

              {marquee2.length > 0 && (
                <div className="video-marquee-container">
                  <div className="video-marquee-track" style={{ animationDirection: 'reverse', animationDuration: '65s' }}>
                    {marquee2.map((reel, idx) => (
                      <div key={`r2-${idx}`} className="video-marquee-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--w)', padding: 0 }}>
                        {(() => {
                          const urlParts = (reel.media_url || '').split('|||');
                          const videoSrc = urlParts[0] || '';
                          const externalUrl = urlParts[1] || '';
                          const viewsCount = urlParts[2] || '';
                          const content = (
                            <>
                              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                                <video className="video-marquee-asset" src={videoSrc} autoPlay loop muted playsInline />
                                <div className="video-card-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', padding: '20px 16px 12px' }}>
                                  <h4 className="video-card-creator-name" style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{reel.project_name}</h4>
                                  {viewsCount && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
                                      ▶ {viewsCount}
                                    </div>
                                  )}
                                  {externalUrl && <span style={{ fontSize: '0.8rem', background: 'var(--p)', padding: '4px 8px', borderRadius: '4px', marginTop: '6px', display: 'inline-block', color: '#fff' }}>View Original ↗</span>}
                                </div>
                              </div>
                              <div style={{ height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--w)', borderTop: '1px solid var(--gm)' }}>
                                <span style={{ fontWeight: 900, color: 'var(--k)', letterSpacing: '-0.02em', fontSize: '1.1rem' }}>{reel.brand_name || 'Creator'}</span>
                              </div>
                            </>
                          );
                          return externalUrl ? <a href={externalUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'inherit', textDecoration: 'none' }}>{content}</a> : content;
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
