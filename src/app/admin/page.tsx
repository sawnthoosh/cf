'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]); // NEW: CMS State
  
  const [isUploading, setIsUploading] = useState(false);
  const [newProject, setNewProject] = useState({ project_name: '', description: '', file: null as File | null });
  const [newClient, setNewClient] = useState({ brand_name: '', file: null as File | null });

  useEffect(() => {
    checkSessionAndFetchData();
  }, []);

  const checkSessionAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/admin/login'; return; }

    const { data: inbox } = await supabase.from('form_submissions').select('*').order('created_at', { ascending: false });
    const { data: port } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
    const { data: cli } = await supabase.from('client_logos').select('*');
    const { data: content } = await supabase.from('site_content').select('*').order('id', { ascending: true }); // NEW: Fetch Content
    
    if (inbox) setSubmissions(inbox);
    if (port) setPortfolio(port);
    if (cli) setClients(cli);
    if (content) setSiteContent(content);
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/admin/login'; };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.file || !newProject.project_name) return;
    setIsUploading(true);
    const fileName = `projects/${Math.random()}`;
    await supabase.storage.from('agency-media').upload(fileName, newProject.file);
    const { data } = supabase.storage.from('agency-media').getPublicUrl(fileName);
    await supabase.from('portfolio').insert([{ project_name: newProject.project_name, description: newProject.description, media_url: data.publicUrl, is_active: true }]);
    setNewProject({ project_name: '', description: '', file: null });
    checkSessionAndFetchData();
    setIsUploading(false);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.file || !newClient.brand_name) return;
    setIsUploading(true);
    const fileName = `logos/${Math.random()}`;
    await supabase.storage.from('agency-media').upload(fileName, newClient.file);
    const { data } = supabase.storage.from('agency-media').getPublicUrl(fileName);
    await supabase.from('client_logos').insert([{ brand_name: newClient.brand_name, logo_url: data.publicUrl }]);
    setNewClient({ brand_name: '', file: null });
    checkSessionAndFetchData();
    setIsUploading(false);
  };

  // NEW: Update Content Function
  const handleUpdateContent = async (key: string, newValue: string) => {
    setIsUploading(true);
    const { error } = await supabase.from('site_content').update({ content_value: newValue }).eq('section_key', key);
    
    if (error) {
      alert('Error updating content.');
      console.error(error);
    } else {
      checkSessionAndFetchData();
    }
    setIsUploading(false);
  };

  if (loading) return <div className="admin-bg" style={{padding: '100px', textAlign: 'center'}}>Loading control center...</div>;

  return (
    <div className="admin-bg">
      <nav className="admin-nav">
        <a href="/" className="nlogo"><span className="nlogo-claim">Claim</span><span className="nlogo-fame">Fame</span> Admin</a>
        <button onClick={handleLogout} className="admin-logout">Sign Out</button>
      </nav>

      <main className="admin-main">
        <div style={{display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap'}}>
          {/* Added 'settings' to the tabs array */}
          {['inbox', 'portfolio', 'clients', 'settings'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              style={{
                padding: '12px 24px', borderRadius: '100px', border: 'none', 
                background: activeTab === tab ? 'var(--p)' : 'var(--w)', 
                color: activeTab === tab ? '#fff' : 'var(--k)', 
                cursor: 'pointer', fontWeight: 600,
                boxShadow: activeTab === tab ? '0 10px 25px rgba(143,30,174,0.25)' : '0 4px 10px rgba(0,0,0,0.03)'
              }}>
              {tab === 'settings' ? '⚙️ SITE SETTINGS' : tab.toUpperCase()}
            </button>
          ))}
        </div>
        
        {activeTab === 'inbox' && (
          <div className="admin-card"><table className="admin-table"><thead><tr><th>Date</th><th>Contact</th><th>Request</th></tr></thead><tbody>{submissions.map(sub => <tr key={sub.id}><td>{new Date(sub.created_at).toLocaleDateString()}</td><td><div className="td-name">{sub.name}</div><div className="td-email">{sub.email}</div></td><td><span className="td-svc-badge">{sub.service}</span><p className="td-msg">{sub.message}</p></td></tr>)}</tbody></table></div>
        )}

        {activeTab === 'portfolio' && (
          <div className="admin-card" style={{padding: '20px'}}>
            <form onSubmit={handleAddProject} style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
              <input type="text" placeholder="Project Name" className="fi" required onChange={e => setNewProject({...newProject, project_name: e.target.value})} />
              <input type="file" className="fi" required onChange={e => setNewProject({...newProject, file: e.target.files?.[0] || null})} />
              <button type="submit" className="fsub" disabled={isUploading} style={{width: 'auto', padding: '0 20px', margin: 0}}>{isUploading ? '...' : 'Add Project'}</button>
            </form>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
              {portfolio.map(p => (
                <div key={p.id} style={{background: '#f9f9f9', padding: '10px', borderRadius: '8px'}}>
                  {p.media_url.match(/\.(mp4|webm)$/i) ? <video src={p.media_url} style={{width:'100%', height:'100px', objectFit:'cover'}} /> : <img src={p.media_url} style={{width:'100%', height:'100px', objectFit:'cover'}} />}
                  <p style={{fontWeight: 'bold', marginTop: '10px'}}>{p.project_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="admin-card" style={{padding: '20px'}}>
            <form onSubmit={handleAddClient} style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
              <input type="text" placeholder="Brand Name" className="fi" required onChange={e => setNewClient({...newClient, brand_name: e.target.value})} />
              <input type="file" className="fi" required onChange={e => setNewClient({...newClient, file: e.target.files?.[0] || null})} />
              <button type="submit" className="fsub" disabled={isUploading} style={{width: 'auto', padding: '0 20px', margin: 0}}>{isUploading ? '...' : 'Add Logo'}</button>
            </form>
            <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
              {clients.map(c => (
                <div key={c.id} style={{textAlign: 'center', background: '#f9f9f9', padding: '10px', borderRadius: '8px', position: 'relative'}}>
                  <img src={c.logo_url} style={{width: '80px', height: '80px', objectFit: 'contain'}} />
                  <p style={{fontSize: '0.8rem', marginTop: '5px', fontWeight: 600}}>{c.brand_name}</p>
                  <button onClick={() => supabase.from('client_logos').delete().eq('id', c.id).then(checkSessionAndFetchData)} style={{marginTop: '10px', background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.75rem'}}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEW: Site Settings Tab */}
        {activeTab === 'settings' && (
          <div className="admin-card" style={{padding: '30px'}}>
            <h2 style={{fontFamily: 'var(--fh)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px'}}>Edit Website Text</h2>
            {siteContent.length === 0 ? (
              <p style={{color: 'var(--muted)'}}>No content keys found in the database. Add rows to your site_content table!</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                {siteContent.map((item) => (
                  <div key={item.id} className="fg" style={{marginBottom: 0}}>
                    <label className="flb" style={{textTransform: 'capitalize', color: 'var(--p)'}}>
                      {item.section_key.replace(/_/g, ' ')}
                    </label>
                    <div style={{display: 'flex', gap: '10px'}}>
                      <textarea 
                        className="fi" 
                        defaultValue={item.content_value}
                        id={`input-${item.section_key}`}
                        style={{minHeight: '60px', padding: '12px'}}
                      />
                      <button 
                        className="fsub" 
                        style={{width: '120px', padding: '0', margin: 0}}
                        disabled={isUploading}
                        onClick={() => {
                          const el = document.getElementById(`input-${item.section_key}`) as HTMLTextAreaElement;
                          handleUpdateContent(item.section_key, el.value);
                        }}
                      >
                        {isUploading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}