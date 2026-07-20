const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://apslrigkgrnicjkvetpm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwc2xyaWdrZ3JuaWNqa3ZldHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDE3MzgsImV4cCI6MjA5OTAxNzczOH0.1J1sRMmej66US7usv5qaakxIBohZZclBhw__zKKEpW0'
);

async function run() {
  const brandCards = [
    { id: '1', brandName: 'KAPIVA', bgColor: 'rgba(119, 138, 94, 0.8)', imageUrl: '/kapiva-dia.jpeg', tagline: 'Ayurvedic Nutrition\\n& Wellness' },
    { id: '2', brandName: 'MULTANI', bgColor: 'rgba(156, 111, 68, 0.8)', imageUrl: '/multani.jpeg', tagline: 'Holistic Ayurvedic\\nHealing' },
    { id: '3', brandName: 'LOUIS STITCH', bgColor: 'rgba(40, 40, 40, 0.8)', imageUrl: '/louis-stitch-shoe.jpeg', tagline: "Premium Men's\\nFashion" },
    { id: '4', brandName: 'TRUEBASICS', bgColor: 'rgba(109, 76, 130, 0.8)', imageUrl: '/truebasics.jpeg', tagline: 'Science-Backed\\nSupplements' },
    { id: '5', brandName: 'ZOUK', bgColor: 'rgba(176, 60, 60, 0.8)', imageUrl: '/zouk-bag.jpeg', tagline: 'Uniquely Indian\\nVegan Bags' }
  ];

  const { error } = await supabase.from('site_content').upsert({ section_key: 'brand_cards_data', content_value: JSON.stringify(brandCards) }, { onConflict: 'section_key' });
  if (error) console.error('Error inserting brand cards:', error);

  const creators = [
    { brand: 'Kapiva', name: 'Sarul Jain', url: 'https://www.instagram.com/reel/DPQ_PEtgQz3/?igsh=MXNkNWhwam85MHh4aA==' },
    { brand: 'Kapiva', name: 'Nikita Mithaiwala', url: 'https://www.instagram.com/p/DO-3X36EZ3Q/' },
    { brand: 'Kapiva', name: 'Tarneet Kaur', url: 'https://www.instagram.com/p/DPOnDDdkv0k/' },
    { brand: 'Multani', name: 'Aashika Bhatia', url: 'https://www.instagram.com/p/DYhTeG1OnvD/' },
    { brand: 'Multani', name: 'Niti Taylor', url: 'https://www.instagram.com/p/DYbsebKPsIO/' },
    { brand: 'Multani', name: 'Dr. Neha Gupta', url: 'https://www.instagram.com/p/DXweXRNzoUi/' },
    { brand: 'Louis Stitch', name: 'Neha Sanjay', url: 'https://www.instagram.com/reel/DYcVklUvgY6/?hl=en' },
    { brand: 'Louis Stitch', name: 'Aryan', url: 'https://www.instagram.com/reel/DYPUqsPI7op/?hl=en' },
    { brand: 'Louis Stitch', name: 'Samadh', url: 'https://www.instagram.com/reel/DYSBitboXba/?hl=en' },
    { brand: 'Zouk', name: 'Mehak', url: 'https://www.instagram.com/reel/DRFTr1tjC10/' },
    { brand: 'Zouk', name: 'Vidhi Shah', url: 'https://www.instagram.com/reel/DRHfKolDWem/?igsh=YTloM3doaWFjcXYw' },
    { brand: 'Zouk', name: 'Radhika Sehgal', url: 'https://www.instagram.com/reel/DRH1Hvmk7_N/?igsh=MTdjMnA0d3o4NmVqNQ%3D%3D' },
  ];
  
  const defaultVideo = '/bg.mp4';
  
  const portfolioItems = creators.map((c) => ({
    project_name: c.name,
    media_url: `${defaultVideo}|||${c.url}`,
    brand_name: c.brand,
    description: ''
  }));
  
  // Clear old default portfolio items just in case
  await supabase.from('portfolio').delete().neq('id', 0);
  await supabase.from('portfolio').insert(portfolioItems);
  
  console.log('Database successfully populated with hardcoded fallback data!');
}
run();
