'use client';

export default function OurWorkSection({ portfolio, content, isInitialLoad }: { portfolio: any[], content: Record<string, string>, isInitialLoad: boolean }) {
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

  const brandDefaultCreators: Record<string, {name: string, url: string}[]> = {
    "Kapiva": [
      { name: "Sarul Jain", url: "https://www.instagram.com/reel/DPQ_PEtgQz3/?igsh=MXNkNWhwam85MHh4aA==" },
      { name: "Nikita Mithaiwala", url: "https://www.instagram.com/p/DO-3X36EZ3Q/" },
      { name: "Tarneet Kaur", url: "https://www.instagram.com/p/DPOnDDdkv0k/" },
      { name: "Harshita Agarwal", url: "https://www.instagram.com/reel/DO-XvTtEU-f/?igsh=NHpmdHI5aGRuOGZs" },
      { name: "Nikita Shah", url: "https://www.instagram.com/p/DPA2lRJEjHQ/" },
      { name: "Neeru", url: "https://www.instagram.com/reel/DVgaizBkZcF/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" },
      { name: "Nikita Varma", url: "https://www.instagram.com/p/DQbn_QFEzVe/" },
      { name: "Dr. Sowmya Rao", url: "https://www.instagram.com/p/DQbiXHak1vj/" },
      { name: "Mrunalini", url: "https://www.instagram.com/p/DQb7-zzDwqA/" },
      { name: "The Poetic News", url: "https://www.facebook.com/reel/1257428143001159/?fs=e&mibextid=wwXIfr&rdid=zawRoqoMYYXGg7rc&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2Fr%2F1D1N3KPkA3%2F%3Fmibextid%3DwwXIfr#" },
      { name: "Parth Shah", url: "https://www.instagram.com/reels/DU8XTs9jLEU/" }
    ],
    "Multani": [
      { name: "Aashika Bhatia", url: "https://www.instagram.com/p/DYhTeG1OnvD/" },
      { name: "Niti Taylor", url: "https://www.instagram.com/p/DYbsebKPsIO/" },
      { name: "Dr. Neha Gupta", url: "https://www.instagram.com/p/DXweXRNzoUi/" },
      { name: "Varun Jhamb", url: "https://www.instagram.com/p/DXjlotvk3RE/" },
      { name: "Amit Saxena", url: "https://www.instagram.com/p/DXtkH2HiAFG/" },
      { name: "Oh My Veggies", url: "https://www.instagram.com/p/DXjD8PbkzSE/" },
      { name: "Sumit Chauhan", url: "https://www.instagram.com/p/DXhCMs7gEcZ/" },
      { name: "Arup Ghosh", url: "https://www.instagram.com/reels/DYBXuHzJEeP/" }
    ],
    "Zouk": [
      { name: "Mehak", url: "https://www.instagram.com/reel/DRFTr1tjC10/" },
      { name: "Vidhi Shah", url: "https://www.instagram.com/reel/DRHfKolDWem/?igsh=YTloM3doaWFjcXYw" },
      { name: "Radhika Sehgal", url: "https://www.instagram.com/reel/DRH1Hvmk7_N/?igsh=MTdjMnA0d3o4NmVqNQ%3D%3D" },
      { name: "Henna Jain", url: "https://www.instagram.com/reel/DRCrlDOjEb2/?igsh=dW03bDJqcWV6Mngz" },
      { name: "Steffilyne", url: "https://www.instagram.com/reel/DREq9jJE8Uo/?igsh=MWZsdmIzYjByZDV4bw==" },
      { name: "Shruti Naxane", url: "https://www.instagram.com/reel/DQ_uKLpjHek/?igsh=Mzl6NTloYjN2OGt2" },
      { name: "Venus Shah", url: "https://www.instagram.com/p/DSH1VgBiSw4/" },
      { name: "Vrushali", url: "https://www.instagram.com/reel/DSuDWUGjT6i/?igsh=ajczc3BqMWhtMm4y" },
      { name: "Ankita", url: "https://www.instagram.com/reel/DSwZPTlE8TI/?igsh=MW1xZ2w0MjNqcHM5NQ==" },
      { name: "Khushi Gupta", url: "https://www.instagram.com/reel/DS2WLfnjuUj/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" },
      { name: "Srishti", url: "https://www.instagram.com/reel/DSz49arE6rD/?igsh=NDZodTFxM25lNnU5" }
    ],
    "Louis Stitch": [
      { name: "Neha Sanjay", url: "https://www.instagram.com/reel/DYcVklUvgY6/?hl=en" },
      { name: "Aryan", url: "https://www.instagram.com/reel/DYPUqsPI7op/?hl=en" },
      { name: "Samadh", url: "https://www.instagram.com/reel/DYSBitboXba/?hl=en" },
      { name: "Usman", url: "https://www.instagram.com/reel/DWOaQo9kgO-/?hl=en" },
      { name: "Samadh", url: "https://www.instagram.com/reel/DWB-UACiLIb/?hl=en" },
      { name: "Usman", url: "https://www.instagram.com/reel/DYe0hRtyWEC/?hl=en" }
    ]
  };

  const getDefaultReelsForBrand = (brandName: string) => {
    const creators = brandDefaultCreators[brandName] || [
      { name: "Ananya Sharma", url: "#" },
      { name: "Rahul Verma", url: "#" }
    ];
    const videos = [
      '/bg.mp4'
    ];
    return creators.map((creator, index) => ({
      id: `default-${brandName}-${index}`,
      project_name: creator.name,
      media_url: `${videos[index % videos.length]}|||${creator.url}`,
      brand_name: brandName
    }));
  };

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
              { id: '1', brandName: 'KAPIVA', bgColor: 'rgba(119, 138, 94, 0.8)', imageUrl: '/kapiva-dia.jpeg', tagline: 'Ayurvedic Nutrition\n& Wellness', stats: [{v: '320%', l: 'Sales Increase'}, {v: '2.8M+', l: 'Reach Generated'}] },
              { id: '2', brandName: 'MULTANI', bgColor: 'rgba(156, 111, 68, 0.8)', imageUrl: '/multani.jpeg', tagline: 'Holistic Ayurvedic\nHealing', stats: [{v: '200%', l: 'Growth in Followers'}, {v: '150%', l: 'Engagement Boost'}] },
              { id: '3', brandName: 'LOUIS STITCH', bgColor: 'rgba(40, 40, 40, 0.8)', imageUrl: '/louis-stitch-shoe.jpeg', tagline: 'Premium Men\'s\nFashion', stats: [{v: '180%', l: 'Increase in Reach'}, {v: '90+', l: 'Creators Onboarded'}] },
              { id: '4', brandName: 'TRUEBASICS', bgColor: 'rgba(109, 76, 130, 0.8)', imageUrl: '/truebasics.jpeg', tagline: 'Science-Backed\nSupplements', stats: [{v: '250%', l: 'Engagement Growth'}, {v: '3M+', l: 'Impressions'}] },
              { id: '5', brandName: 'ZOUK', bgColor: 'rgba(176, 60, 60, 0.8)', imageUrl: '/zouk-bag.jpeg', tagline: 'Uniquely Indian\nVegan Bags', stats: [{v: '400%', l: 'Sales Boost'}, {v: '50+', l: 'Campaigns'}] },
            ];
          }

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {brandCards.map((c: any) => (
                <div key={c.id} style={{ borderRadius: '24px', overflow: 'hidden', position: 'relative', color: '#fff', display: 'flex', flexDirection: 'column', height: '400px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  
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
                        <h2 style={{ fontFamily: 'var(--fh)', fontSize: '1.8rem', fontWeight: 900, marginBottom: '15px', letterSpacing: '-0.02em', background: 'var(--w)', color: c.bgColor.replace(/rgba?\(([^,]+),([^,]+),([^,]+).*/, 'rgb($1,$2,$3)'), padding: '4px 12px', borderRadius: '4px', display: 'inline-block' }}>{c.brandName}</h2>
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
                    <div key={`r1-${idx}`} className="video-marquee-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--w)', padding: 0 }}>
                      {(() => {
                        const [videoSrc, externalUrl] = (reel.media_url || '').split('|||');
                        const content = (
                          <>
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                              <video className="video-marquee-asset" src={videoSrc} autoPlay loop muted playsInline />
                              <div className="video-card-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', padding: '20px 16px 12px' }}>
                                <h4 className="video-card-creator-name" style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{reel.project_name}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
                                  ▶ {((idx * 47) % 900) + 100}K
                                </div>
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

              <div className="video-marquee-container">
                <div className="video-marquee-track" style={{ animationDirection: 'reverse', animationDuration: '65s' }}>
                  {marquee2.map((reel, idx) => (
                    <div key={`r2-${idx}`} className="video-marquee-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--w)', padding: 0 }}>
                      {(() => {
                        const [videoSrc, externalUrl] = (reel.media_url || '').split('|||');
                        const content = (
                          <>
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                              <video className="video-marquee-asset" src={videoSrc} autoPlay loop muted playsInline />
                              <div className="video-card-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', padding: '20px 16px 12px' }}>
                                <h4 className="video-card-creator-name" style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{reel.project_name}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
                                  ▶ {((idx * 83) % 900) + 100}K
                                </div>
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
            </div>
          );
        })()}
      </div>
    </div>
  );
}
