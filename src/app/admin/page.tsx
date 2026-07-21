'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'leads' | 'landing' | 'clients_page'>('leads');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Loading & UI Action States
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ text: string; isError: boolean } | null>(null);

  // Form States for Client Page Reels uploads
  const [clientReelFile, setClientReelFile] = useState<File | null>(null);
  const [clientProjectName, setClientProjectName] = useState('');
  const [clientReelLink, setClientReelLink] = useState('');
  const [clientViews, setClientViews] = useState('');
  const [clientBrandName, setClientBrandName] = useState('');

  // Form States for Brand Cards uploads
  const [brandCardFile, setBrandCardFile] = useState<File | null>(null);
  const [bcName, setBcName] = useState('');
  const [bcTagline, setBcTagline] = useState('');
  const [bcColor, setBcColor] = useState('rgba(119, 138, 94, 0.9)');
  const [hexColor, setHexColor] = useState('#778a5e');

  useEffect(() => {
    // Auth guard: redirect to login if no active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/admin/login');
      } else {
        setAuthChecked(true);
        fetchDashboardData();
      }
    });
  }, []);

  const triggerAlert = (text: string, isError = false) => {
    setAlert({ text, isError });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: inbox } = await supabase.from('form_submissions').select('*').order('created_at', { ascending: false });
      const { data: portfolio } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
      const { data: content } = await supabase.from('site_content').select('*');

      if (inbox) setSubmissions(inbox);
      if (portfolio) setPortfolioItems(portfolio);
      if (content) setContentItems(content);
    } catch (err) {
      triggerAlert('Database synchronization failed', true);
    } finally {
      setLoading(false);
    }
  };

  const uploadFileToBucket = async (file: File, bucketName: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        triggerAlert(`Upload failed: ${uploadError.message}`, true);
        return null;
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err: any) {
      console.error('Upload exception:', err);
      triggerAlert(`Upload error: ${err?.message || 'Unknown error'}`, true);
      return null;
    }
  };

  const handleStaticMediaOverride = async (keyName: string, file: File) => {
    setActionLoading(keyName);
    try {
      const bucket = keyName.includes('video') ? 'portfolio' : 'logos';
      const uploadedUrl = await uploadFileToBucket(file, bucket);
      
      if (!uploadedUrl) throw new Error('Storage uploaded route generation error');

      const existingRecord = contentItems.find(item => item.section_key === keyName);

      if (existingRecord) {
        await supabase.from('site_content').update({ content_value: uploadedUrl }).eq('id', existingRecord.id);
      } else {
        await supabase.from('site_content').insert([{ section_key: keyName, content_value: uploadedUrl }]);
      }

      triggerAlert(`${keyName.replace(/_/g, ' ')} uploaded and applied successfully!`);
      fetchDashboardData();
    } catch (err) {
      triggerAlert('Media layout push failed', true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddBrandCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandCardFile || !bcName) return triggerAlert('Fill out all required fields', true);
    setActionLoading('bc_submit');
    try {
      const url = await uploadFileToBucket(brandCardFile, 'logos');
      if (!url) throw new Error();

      const currentDataStr = contentItems.find(i => i.section_key === 'brand_cards_data')?.content_value || '[]';
      let currentData = [];
      try { currentData = JSON.parse(currentDataStr); } catch(e){}
      
      const newCard = { 
        id: Date.now().toString(), 
        brandName: bcName, 
        bgColor: bcColor, 
        imageUrl: url,
        tagline: bcTagline
      };
      const updatedData = [...currentData, newCard];

      const existingRecord = contentItems.find(i => i.section_key === 'brand_cards_data');
      if (existingRecord) {
        await supabase.from('site_content').update({ content_value: JSON.stringify(updatedData) }).eq('id', existingRecord.id);
      } else {
        await supabase.from('site_content').insert([{ section_key: 'brand_cards_data', content_value: JSON.stringify(updatedData) }]);
      }
      
      triggerAlert('Brand card added successfully!');
      setBcName('');
      setBcTagline('');
      setBrandCardFile(null);
      fetchDashboardData();
    } catch {
      triggerAlert('Failed adding brand card', true);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePurgeBrandCard = async (cardId: string) => {
    if (confirm('Delete this brand card?')) {
      const existingRecord = contentItems.find(i => i.section_key === 'brand_cards_data');
      if (!existingRecord) return;
      const currentData = JSON.parse(existingRecord.content_value || '[]');
      const updatedData = currentData.filter((c: any) => c.id !== cardId);
      await supabase.from('site_content').update({ content_value: JSON.stringify(updatedData) }).eq('id', existingRecord.id);
      triggerAlert('Brand card deleted.');
      fetchDashboardData();
    }
  };

  const handleAddClientPageReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientReelFile || !clientProjectName || !clientBrandName) return triggerAlert('Fill out creator name, brand name, and attach video file', true);

    setActionLoading('client_reel_submit');
    try {
      const url = await uploadFileToBucket(clientReelFile, 'portfolio');
      if (!url) throw new Error();

      // Format: videoUrl|||instaLink|||viewsCount
      let finalUrl = url;
      if (clientReelLink || clientViews) {
        finalUrl = `${url}|||${clientReelLink || ''}|||${clientViews || ''}`;
      }
      await supabase.from('portfolio').insert([{ project_name: clientProjectName, media_url: finalUrl, brand_name: clientBrandName }]);
      
      triggerAlert(`Reel uploaded successfully under ${clientBrandName}!`);
      setClientProjectName('');
      setClientReelLink('');
      setClientViews('');
      setClientBrandName('');
      setClientReelFile(null);
      fetchDashboardData();
    } catch {
      triggerAlert('Failed uploading reel asset', true);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePurgeAssetRecord = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this video reel asset?')) {
      await supabase.from('portfolio').delete().eq('id', id);
      triggerAlert('Video deleted successfully.');
      fetchDashboardData();
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (confirm('Delete this form submission permanently?')) {
      await supabase.from('form_submissions').delete().eq('id', id);
      triggerAlert('Submission deleted.');
      fetchDashboardData();
    }
  };

  const uniqueSettings = contentItems.filter((item, index, self) =>
    index === self.findIndex((t) => t.section_key === item.section_key)
  );

  const getLiveAssetUrl = (key: string) => uniqueSettings.find(i => i.section_key === key)?.content_value || '';

  // Convert hex color to rgba helper
  const handleHexColorChange = (hex: string) => {
    setHexColor(hex);
    // Convert hex to rgb with 0.85 opacity
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    setBcColor(`rgba(${r}, ${g}, ${b}, 0.85)`);
  };

  // Don't render until auth check is complete
  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', color: '#7c3aed', fontSize: '1.1rem', fontWeight: 700 }}>
        Verifying access...
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '40px 5%', fontFamily: 'system-ui, sans-serif', color: '#2d3748' }}>
      
      {alert && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, background: alert.isError ? '#e53e3e' : '#2b6cb0', color: '#fff', padding: '16px 28px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          {alert.text}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: '#fff', padding: '24px 30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>ClaimFame Command Center</h1>
          <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem', marginTop: '4px' }}>Real-time section asset manager & website editor.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={async () => { await supabase.auth.signOut(); router.replace('/admin/login'); }} style={{ padding: '10px 20px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#c53030' }}>Sign Out</button>
          <button onClick={() => window.location.href = '/'} style={{ padding: '10px 20px', background: '#edf2f7', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#4a5568' }}>Exit Center</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', background: '#edf2f7', padding: '6px', borderRadius: '40px', width: 'fit-content' }}>
        {[
          { id: 'leads', label: '📥 Inbox Leads' },
          { id: 'landing', label: '🏠 Hero & Who We Are' },
          { id: 'clients_page', label: '🤝 Clients & Brand Cards' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 24px', borderRadius: '30px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
              background: activeTab === tab.id ? '#7c3aed' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#4a5568'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: '#7c3aed', fontWeight: 700, textAlign: 'center', padding: '40px' }}>Loading data...</div>}

      {!loading && activeTab === 'leads' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '18px 24px', fontSize: '0.8rem', fontWeight: 700, color: '#718096' }}>CONTACT DETAILS</th>
                <th style={{ padding: '18px 24px', fontSize: '0.8rem', fontWeight: 700, color: '#718096' }}>SERVICE EXPECTATION & MESSAGE</th>
                <th style={{ padding: '18px 24px', fontSize: '0.8rem', fontWeight: 700, color: '#718096', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: '#a0aec0' }}>No submissions yet.</td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '24px', width: '35%' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1a202c' }}>{sub.name}</div>
                      <div style={{ color: '#7c3aed', fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>{sub.email}</div>
                      {sub.phone && <div style={{ color: '#4a5568', fontSize: '0.85rem', marginTop: '2px' }}>📞 {sub.phone}</div>}
                      {sub.brand && <div style={{ fontWeight: 700, fontSize: '0.85rem', background: '#edf2f7', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>Brand: {sub.brand}</div>}
                    </td>
                    <td style={{ padding: '24px', width: '50%' }}>
                      <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-block', marginBottom: '8px' }}>{sub.service}</span>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.5' }}>{sub.message}</p>
                    </td>
                    <td style={{ padding: '24px', width: '15%', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteSubmission(sub.id)}
                        style={{ padding: '8px 16px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'landing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>🎥 Fullscreen Hero Background Video</h3>
              <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '20px' }}>Select an MP4 file to completely replace the main entry header loop stream asset.</p>
              <input type="file" accept="video/mp4" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleStaticMediaOverride('hero_video_url', file);
              }} />
              {actionLoading === 'hero_video_url' && <p style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem', marginTop: '10px' }}>Processing large file stream upload...</p>}
              {getLiveAssetUrl('hero_video_url') && <a href={getLiveAssetUrl('hero_video_url')} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '15px', fontSize: '0.85rem', color: '#7c3aed', fontWeight: 600 }}>Link to Live Video Asset</a>}
            </div>

            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>🖼️ Who We Are Showcase Team Photo</h3>
              <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '20px' }}>Attach an image file to swap the display photograph next to the strategic goals section context.</p>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleStaticMediaOverride('about_image_url', file);
              }} />
              {actionLoading === 'about_image_url' && <p style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem', marginTop: '10px' }}>Syncing image data...</p>}
              {getLiveAssetUrl('about_image_url') && <img src={getLiveAssetUrl('about_image_url')} alt="About Showcase" style={{ height: '60px', marginTop: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'block' }} />}
            </div>

          </div>

          <div style={{ background: '#fff', padding: '35px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>📝 Live Page Text Editor</h3>
            <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '25px' }}>Edit any text on the website here and click Save — changes go live instantly.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { key: 'hero_marquee_text', label: '🎬 Hero Marquee Text', desc: 'The scrolling text banner below the hero logo', placeholder: 'THE REAL FAME STORY STARTS HERE!' },
                { key: 'about_headline', label: '🏠 About Section Headline', desc: 'The big heading in the "Who We Are" section', placeholder: 'Helping brands claim their spotlight...' },
                { key: 'about_body', label: '🏠 About Section Body Text', desc: 'The paragraph below the headline in "Who We Are"', placeholder: 'We partner with brands with ambitions...' },
                { key: 'stat1_label', label: '📊 Stat #1 Label (500+)', desc: 'Label under the first stat counter', placeholder: 'Creators Activated' },
                { key: 'stat2_label', label: '📊 Stat #2 Label (10M+)', desc: 'Label under the second stat counter', placeholder: 'Views' },
                { key: 'stat3_label', label: '📊 Stat #3 Label (50+)', desc: 'Label under the third stat counter', placeholder: 'Campaigns Executed' },
                { key: 'stat4_label', label: '📊 Stat #4 Label (20+)', desc: 'Label under the fourth stat counter', placeholder: 'Brands' },
                { key: 'contact_eyebrow', label: '📬 Contact Eyebrow Text', desc: 'Small label above the contact headline', placeholder: 'Get In Touch' },
                { key: 'contact_tagline', label: '📬 Contact Headline (HTML)', desc: 'The big headline in the contact section — supports HTML like <br />', placeholder: "Let's Build Something<br /><em>Great Together.</em>" },
                { key: 'contact_email', label: '📧 Contact Email Address', desc: 'Email shown in contact section and footer', placeholder: 'kritika@letsclaimfame.com' },
                { key: 'contact_phone', label: '📞 Contact Phone Number', desc: 'Phone number shown in contact section and footer', placeholder: '+91 96437 37794, +91 89208 00014' },
                { key: 'contact_location', label: '📍 Contact Location', desc: 'Location shown in contact section and footer', placeholder: 'New Delhi, India' },
                { key: 'contact_wa_link', label: '💬 WhatsApp Link', desc: 'Full WhatsApp URL for the chat button', placeholder: 'https://wa.me/919643737794' },
                { key: 'contact_wa_text', label: '💬 WhatsApp Button Text', desc: 'Label on the WhatsApp chat button', placeholder: 'Chat on WhatsApp' },
                { key: 'footer_tagline', label: '🦶 Footer Tagline', desc: 'The short description paragraph in the footer', placeholder: 'Helping brands claim their spotlight...' },
                { key: 'nav_cta', label: '🔗 Nav CTA Button Text', desc: 'Text on the top-right navigation button', placeholder: 'Get In Touch' },
                { key: 'instagram_url', label: '📸 Instagram Profile URL', desc: 'Full Instagram URL for the footer icon link', placeholder: 'https://www.instagram.com/letsclaimfame' },
                { key: 'linkedin_url', label: '💼 LinkedIn Profile URL', desc: 'Full LinkedIn URL for the footer icon link', placeholder: 'https://www.linkedin.com/company/lets-claim-fame' },
              ].map(field => {
                const existing = contentItems.find(i => i.section_key === field.key);
                const domFieldId = `tf-${field.key}`;
                return (
                    <div key={field.key} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '220px', flexShrink: 0 }}>
                        <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', color: '#2d3748' }}>{field.label}</label>
                        <span style={{ fontSize: '0.75rem', color: '#718096', display: 'block' }}>{field.desc}</span>
                      </div>
                      <textarea
                        id={domFieldId}
                        defaultValue={existing?.content_value || ''}
                        rows={field.key.includes('body') || field.key.includes('tagline') || field.key.includes('footer') ? 3 : 1}
                        placeholder={field.placeholder}
                        style={{ flex: 1, padding: '10px 14px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                      />
                      <button
                        onClick={async () => {
                          const el = document.getElementById(domFieldId) as HTMLTextAreaElement;
                          if (!el) return;
                          const val = el.value;
                          if (existing) {
                            await supabase.from('site_content').update({ content_value: val }).eq('id', existing.id);
                          } else {
                            await supabase.from('site_content').insert([{ section_key: field.key, content_value: val }]);
                          }
                          triggerAlert(`${field.label} saved!`);
                          fetchDashboardData();
                        }}
                        style={{ padding: '10px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Save
                      </button>
                      {existing && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete the "${field.label}" entry? This cannot be undone.`)) {
                              await supabase.from('site_content').delete().eq('id', existing.id);
                              triggerAlert(`${field.label} deleted.`);
                              fetchDashboardData();
                            }
                          }}
                          style={{ padding: '10px 20px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {!loading && activeTab === 'clients_page' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* SECTION 1: REELS UPLOAD & REELS LIST */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>🎥 Upload Campaign Reel Card</h3>
              <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '20px' }}>All 4 details on the reel card are customizable here.</p>
              
              <form onSubmit={handleAddClientPageReel} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>1. CREATOR NAME (shown on reel overlay)</label>
                  <input type="text" value={clientProjectName} onChange={(e) => setClientProjectName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }} placeholder="e.g., Neha Sanjay" required />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>2. BRAND NAME (shown at reel card bottom)</label>
                  <input type="text" value={clientBrandName} onChange={(e) => setClientBrandName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }} placeholder="e.g., Kapiva, Zouk, Louis Stitch" required />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>3. VIEWS COUNT (shown on reel overlay)</label>
                  <input type="text" value={clientViews} onChange={(e) => setClientViews(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }} placeholder="e.g., 523K" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>4. INSTAGRAM REEL LINK (Optional)</label>
                  <input type="url" value={clientReelLink} onChange={(e) => setClientReelLink(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }} placeholder="e.g., https://instagram.com/reel/..." />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>5. REEL VIDEO FILE (MP4)</label>
                  <input type="file" accept="video/*" onChange={(e) => setClientReelFile(e.target.files?.[0] || null)} required />
                </div>

                <button type="submit" disabled={actionLoading === 'client_reel_submit'} style={{ padding: '14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}>
                  {actionLoading === 'client_reel_submit' ? 'Processing File...' : 'Upload Reel →'}
                </button>
              </form>
            </div>

            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Active Campaign Reels ({portfolioItems.length})</h3>
              {portfolioItems.length === 0 ? (
                <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>No uploaded reels yet. Use the form on the left to upload reels.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {portfolioItems.map(item => {
                    const parts = (item.media_url || '').split('|||');
                    const viewsText = parts[2] || '';
                    return (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a202c' }}>{item.project_name}</div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {item.brand_name && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '3px 10px', borderRadius: '4px' }}>Brand: {item.brand_name}</span>}
                            {viewsText && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2b6cb0', background: '#ebf8ff', padding: '3px 10px', borderRadius: '4px' }}>Views: {viewsText}</span>}
                          </div>
                        </div>
                        <button onClick={() => handlePurgeAssetRecord(item.id)} style={{ padding: '8px 14px', color: '#e53e3e', background: '#fff', border: '1px solid #fed7d7', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: BRAND CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>🏷️ Add Brand Photo Card</h3>
              <form onSubmit={handleAddBrandCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>BRAND NAME (shown at bottom box)</label>
                  <input type="text" value={bcName} onChange={(e) => setBcName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }} placeholder="e.g., KAPIVA, MULTANI, ZOUK" required />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>BACKGROUND TINT COLOR</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <input 
                      type="color" 
                      value={hexColor} 
                      onChange={(e) => handleHexColorChange(e.target.value)} 
                      style={{ width: '45px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }} 
                    />
                    <input 
                      type="text" 
                      value={bcColor} 
                      onChange={(e) => setBcColor(e.target.value)} 
                      style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '0.85rem' }} 
                      placeholder="e.g. rgba(119, 138, 94, 0.9) or #778a5e" 
                    />
                  </div>
                  {/* Preset quick buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { name: 'Olive Green', rgba: 'rgba(119, 138, 94, 0.9)', hex: '#778a5e' },
                      { name: 'Multani Brown', rgba: 'rgba(156, 111, 68, 0.9)', hex: '#9c6f44' },
                      { name: 'Charcoal Dark', rgba: 'rgba(40, 40, 40, 0.9)', hex: '#282828' },
                      { name: 'Truebasics Purple', rgba: 'rgba(109, 76, 130, 0.9)', hex: '#6d4c82' },
                      { name: 'Zouk Red', rgba: 'rgba(176, 60, 60, 0.9)', hex: '#b03c3c' }
                    ].map(p => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => { setBcColor(p.rgba); setHexColor(p.hex); }}
                        style={{ padding: '4px 8px', background: p.hex, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>BRAND TAGLINE</label>
                  <input type="text" value={bcTagline} onChange={(e) => setBcTagline(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }} placeholder="e.g. Clean Nutrition Snacking Brand" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>BACKGROUND PRODUCT IMAGE</label>
                  <input type="file" accept="image/*" onChange={(e) => setBrandCardFile(e.target.files?.[0] || null)} required />
                </div>

                <button type="submit" disabled={actionLoading === 'bc_submit'} style={{ padding: '14px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}>
                  {actionLoading === 'bc_submit' ? 'Processing File...' : 'Upload Brand Card'}
                </button>
              </form>
            </div>

            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Active Brand Cards</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(() => {
                  const bcStr = contentItems.find(i => i.section_key === 'brand_cards_data')?.content_value || '[]';
                  try {
                    const cards = JSON.parse(bcStr);
                    if (cards.length === 0) return <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>No custom brand cards added yet.</p>;
                    return cards.map((c: any) => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ width: '40px', height: '40px', background: c.bgColor, borderRadius: '8px', overflow: 'hidden' }}>
                            <img src={c.imageUrl} alt={c.brandName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800 }}>{c.brandName}</div>
                            {c.tagline && <div style={{ fontSize: '0.75rem', color: '#718096' }}>{c.tagline}</div>}
                          </div>
                        </div>
                        <button onClick={() => handlePurgeBrandCard(c.id)} style={{ padding: '6px 12px', color: '#e53e3e', background: '#fff', border: '1px solid #fed7d7', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                      </div>
                    ));
                  } catch(e) { return null; }
                })()}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}