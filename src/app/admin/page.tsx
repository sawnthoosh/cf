'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'leads' | 'landing' | 'case_studies' | 'clients_page' | 'campaigns_page'>('leads');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  
  // Loading & UI Action States
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ text: string; isError: boolean } | null>(null);

  // Form States for Brand Page uploads
  const [clientReelFile, setClientReelFile] = useState<File | null>(null);
  const [clientProjectName, setClientProjectName] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Kapiva');

  // Form States for Niche Campaigns uploads
  const [campaignReelFile, setCampaignReelFile] = useState<File | null>(null);
  const [campaignProjectName, setCampaignProjectName] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('Lifestyle');

  // Form States for Brand Cards uploads
  const [brandCardFile, setBrandCardFile] = useState<File | null>(null);
  const [bcName, setBcName] = useState('');
  const [bcColor, setBcColor] = useState('#ffffff');

  // Form States for Landing Page Case Studies uploads
  const [caseStudyFile, setCaseStudyFile] = useState<File | null>(null);
  const [caseStudyName, setCaseStudyName] = useState('');

  const targetBrands = ["Kapiva", "Multani", "Louis Stitch", "Salon Tym", "Zouk", "Kalki", "Concious Chemist", "Above Humen"];
  const targetNiches = ["Doctors", "Chef", "Nutritionist/ Health and Wellness", "Lifestyle", "Fashion"];

  useEffect(() => {
    fetchDashboardData();
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

  // Direct File Uploader to Supabase Storage Bucket
  const uploadFileToBucket = async (file: File, bucketName: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // 1. HERO VIDEO & ABOUT PHOTO ASSET HOT-SWAPPERS
  const handleStaticMediaOverride = async (keyName: string, file: File) => {
    setActionLoading(keyName);
    try {
      const bucket = keyName.includes('video') ? 'portfolio' : 'logos';
      const uploadedUrl = await uploadFileToBucket(file, bucket);
      
      if (!uploadedUrl) throw new Error('Storage uploaded route generation error');

      // Check if row schema exists to prevent multi-row insert glitches
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

  const handleUpdateTextValue = async (keyName: string, id: string, newValue: string) => {
    const { error } = await supabase.from('site_content').update({ content_value: newValue }).eq('id', id);
    if (error) triggerAlert('Failed to update text block', true);
    else triggerAlert('Text copy changes saved live!');
  };

  // 2. DISPATCH CAROUSEL CASE STUDY FILE UPLOAD
  const handleAddCaseStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseStudyFile || !caseStudyName) return triggerAlert('Provide project name and attach file', true);
    
    setActionLoading('case_study_submit');
    try {
      const url = await uploadFileToBucket(caseStudyFile, 'portfolio');
      if (!url) throw new Error();

      await supabase.from('portfolio').insert([{ project_name: caseStudyName, media_url: url, is_case_study: true }]);
      triggerAlert('New case study reel successfully added to the home page carousel!');
      setCaseStudyName('');
      setCaseStudyFile(null);
      fetchDashboardData();
    } catch {
      triggerAlert('Failed uploading case study reel', true);
    } finally {
      setActionLoading(null);
    }
  };

  // 2b. DISPATCH BRAND CARD UPLOAD
  const handleAddBrandCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandCardFile || !bcName) return triggerAlert('Fill out all fields', true);
    setActionLoading('bc_submit');
    try {
      const url = await uploadFileToBucket(brandCardFile, 'logos');
      if (!url) throw new Error();

      const currentDataStr = contentItems.find(i => i.section_key === 'brand_cards_data')?.content_value || '[]';
      let currentData = [];
      try { currentData = JSON.parse(currentDataStr); } catch(e){}
      const newCard = { id: Date.now().toString(), brandName: bcName, bgColor: bcColor, imageUrl: url };
      const updatedData = [...currentData, newCard];

      const existingRecord = contentItems.find(i => i.section_key === 'brand_cards_data');
      if (existingRecord) {
        await supabase.from('site_content').update({ content_value: JSON.stringify(updatedData) }).eq('id', existingRecord.id);
      } else {
        await supabase.from('site_content').insert([{ section_key: 'brand_cards_data', content_value: JSON.stringify(updatedData) }]);
      }
      
      triggerAlert('Brand card added successfully!');
      setBcName('');
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

  // 3. DISPATCH BRAND PARTNER OCTAGON VIDEO UPLOAD
  const handleAddClientPageReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientReelFile || !clientProjectName) return triggerAlert('Fill out all fields and attach video file', true);

    setActionLoading('client_reel_submit');
    try {
      const url = await uploadFileToBucket(clientReelFile, 'portfolio');
      if (!url) throw new Error();

      await supabase.from('portfolio').insert([{ project_name: clientProjectName, media_url: url, brand_name: selectedBrand }]);
      triggerAlert(`Reel linked and deployed successfully under ${selectedBrand}!`);
      setClientProjectName('');
      setClientReelFile(null);
      fetchDashboardData();
    } catch {
      triggerAlert('Failed uploading brand reel asset', true);
    } finally {
      setActionLoading(null);
    }
  };

  // 4. DISPATCH NICHE CAMPAIGN CYLINDER VIDEO UPLOAD
  const handleAddCampaignPageReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignReelFile || !campaignProjectName) return triggerAlert('Fill out fields and select file', true);

    setActionLoading('campaign_reel_submit');
    try {
      const url = await uploadFileToBucket(campaignReelFile, 'portfolio');
      if (!url) throw new Error();

      await supabase.from('portfolio').insert([{ project_name: campaignProjectName, media_url: url, niche: selectedNiche }]);
      triggerAlert(`Reel linked and deployed successfully under ${selectedNiche}!`);
      setCampaignProjectName('');
      setCampaignReelFile(null);
      fetchDashboardData();
    } catch {
      triggerAlert('Failed uploading campaign niche asset', true);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePurgeAssetRecord = async (id: string) => {
    if (confirm('Are you completely sure you want to permanently delete this video reel asset?')) {
      await supabase.from('portfolio').delete().eq('id', id);
      triggerAlert('Video completely cleared from rotation.');
      fetchDashboardData();
    }
  };

  // ── RECTIFIES FIELD MULTIPLICATION GLITCH ──
  const uniqueSettings = contentItems.filter((item, index, self) =>
    index === self.findIndex((t) => t.section_key === item.section_key)
  );

  const getLiveAssetUrl = (key: string) => uniqueSettings.find(i => i.section_key === key)?.content_value || '';

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '40px 5%', fontFamily: 'system-ui, sans-serif', color: '#2d3748' }}>
      
      {alert && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, background: alert.isError ? '#e53e3e' : '#2b6cb0', color: '#fff', padding: '16px 28px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          {alert.text}
        </div>
      )}

      {/* Admin Masthead branding */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: '#fff', padding: '24px 30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>ClaimFame Command Center</h1>
          <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem', marginTop: '4px' }}>Real-time section asset manager & secure routing interface platform.</p>
        </div>
        <button onClick={() => window.location.href = '/'} style={{ padding: '10px 20px', background: '#edf2f7', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#4a5568' }}>Exit Center</button>
      </div>

      {/* Navigation Sub-Deck Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', background: '#edf2f7', padding: '6px', borderRadius: '40px', width: 'fit-content' }}>
        {[
          { id: 'leads', label: '📥 Inbox Leads' },
          { id: 'landing', label: '🏠 Hero & Who We Are' },
          { id: 'case_studies', label: '💎 Home Case Studies' },
          { id: 'clients_page', label: '🤝 Clients (By Brand)' }
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

      {loading && <div style={{ color: '#7c3aed', fontWeight: 700, textAlign: 'center', padding: '40px' }}>Loading production inventory components...</div>}

      {/* SECTION 1: LEADS INBOX */}
      {!loading && activeTab === 'leads' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '18px 24px', fontSize: '0.8rem', fontWeight: 700, color: '#718096' }}>CONTACT DETAILS</th>
                <th style={{ padding: '18px 24px', fontSize: '0.8rem', fontWeight: 700, color: '#718096' }}>SERVICE EXPECTATION & MESSAGE</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '24px', width: '35%' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1a202c' }}>{sub.name}</div>
                    <div style={{ color: '#7c3aed', fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>{sub.email}</div>
                    {sub.phone && <div style={{ color: '#4a5568', fontSize: '0.85rem', marginTop: '2px' }}>📞 {sub.phone}</div>}
                    {sub.brand && <div style={{ fontWeight: 700, fontSize: '0.85rem', background: '#edf2f7', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>Brand: {sub.brand}</div>}
                  </td>
                  <td style={{ padding: '24px', width: '65%' }}>
                    <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-block', marginBottom: '8px' }}>{sub.service}</span>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.5' }}>{sub.message}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 2: LANDING PAGE MEDIA OVERRIDES (HERO VIDEO & ABOUT PHOTO) */}
      {!loading && activeTab === 'landing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* File Upload Grid Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* Box A: Screen Hero Streaming Background Video */}
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

            {/* Box B: Who We Are Creative Display Photo */}
            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>🖼️ Who We Are Showcase Team Photo</h3>
              <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '20px' }}>Attach an image file to swap the display photograph next to the strategic goals section context.</p>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleStaticMediaOverride('about_image_url', file);
              }} />
              {actionLoading === 'about_image_url' && <p style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem', marginTop: '10px' }}>Syncing vector data maps...</p>}
              {getLiveAssetUrl('about_image_url') && <img src={getLiveAssetUrl('about_image_url')} alt="About Showcase" style={{ height: '60px', marginTop: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'block' }} />}
            </div>

          </div>

          {/* Glitch-Free Interface Text Array Control Box */}
          <div style={{ background: '#fff', padding: '35px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '25px' }}>📝 Live Page Interface Text Blocks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {uniqueSettings.filter(i => !i.section_key.includes('url') && !i.section_key.includes('image') && !i.section_key.includes('video')).map(item => {
                const domFieldId = `field-${item.id}`;
                return (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>{item.section_key.replace(/_/g, ' ')}</label>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <textarea id={domFieldId} defaultValue={item.content_value} rows={item.content_value.length > 80 ? 3 : 1} style={{ flex: 1, padding: '12px 16px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical', outline: 'none' }} />
                      <button onClick={() => {
                        const textarea = document.getElementById(domFieldId) as HTMLTextAreaElement;
                        if (textarea) handleUpdateTextValue(item.section_key, item.id, textarea.value);
                      }} style={{ padding: '12px 24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 3: HOME PAGE GENERAL CASE STUDIES REELS */}
      {!loading && activeTab === 'case_studies' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Deploy Home Case Study Reel</h3>
            <form onSubmit={handleAddCaseStudy} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>PROJECT NAME</label>
                <input type="text" value={caseStudyName} onChange={(e) => setCaseStudyName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }} placeholder="e.g., Mamaearth Brand Core Concept" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>MP4 VIDEO FILE</label>
                <input type="file" accept="video/*" onChange={(e) => setCaseStudyFile(e.target.files?.[0] || null)} required />
              </div>
              <button type="submit" disabled={actionLoading === 'case_study_submit'} style={{ padding: '14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                {actionLoading === 'case_study_submit' ? 'Uploading...' : 'Inject into Main Carousel →'}
              </button>
            </form>
          </div>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Active Landing Page Cylinder Wheels</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {portfolioItems.filter(i => i.is_case_study || (!i.brand_name && !i.niche)).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 700 }}>{item.project_name}</span>
                  <button onClick={() => handlePurgeAssetRecord(item.id)} style={{ padding: '6px 12px', color: '#e53e3e', background: '#fff', border: '1px solid #e53e3e', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: CLIENTS WEB PAGE BRANDS SECTIONS */}
      {!loading && activeTab === 'clients_page' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Link Video Asset into Client Page Reels</h3>
              <form onSubmit={handleAddClientPageReel} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>BRAND / CREATOR NAME</label>
                  <input type="text" value={clientProjectName} onChange={(e) => setClientProjectName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }} placeholder="e.g., SarulJain - Kapiva" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>REEL FILE DEPLOYMENT (MP4)</label>
                  <input type="file" accept="video/*" onChange={(e) => setClientReelFile(e.target.files?.[0] || null)} required />
                </div>
                <button type="submit" disabled={actionLoading === 'client_reel_submit'} style={{ padding: '14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  {actionLoading === 'client_reel_submit' ? 'Processing File...' : 'Upload Reel'}
                </button>
              </form>
            </div>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Active Clients Page Reels</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {portfolioItems.filter(i => i.brand_name).map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.project_name}</div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed' }}>Assigned Video</span>
                    </div>
                    <button onClick={() => handlePurgeAssetRecord(item.id)} style={{ padding: '6px 12px', color: '#e53e3e', background: '#fff', border: '1px solid #e53e3e', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Add Brand Photo Card</h3>
              <form onSubmit={handleAddBrandCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>BRAND NAME</label>
                  <input type="text" value={bcName} onChange={(e) => setBcName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }} placeholder="e.g., Kapiva" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>BACKGROUND COLOR HEX</label>
                  <input type="color" value={bcColor} onChange={(e) => setBcColor(e.target.value)} style={{ width: '100%', padding: '4px', height: '40px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>BRAND / PRODUCT IMAGE</label>
                  <input type="file" accept="image/*" onChange={(e) => setBrandCardFile(e.target.files?.[0] || null)} required />
                </div>
                <button type="submit" disabled={actionLoading === 'bc_submit'} style={{ padding: '14px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
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
                    return cards.map((c: any) => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ width: '40px', height: '40px', background: c.bgColor, borderRadius: '8px', overflow: 'hidden' }}>
                            <img src={c.imageUrl} alt={c.brandName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ fontWeight: 700 }}>{c.brandName}</div>
                        </div>
                        <button onClick={() => handlePurgeBrandCard(c.id)} style={{ padding: '6px 12px', color: '#e53e3e', background: '#fff', border: '1px solid #e53e3e', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
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