const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://apslrigkgrnicjkvetpm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwc2xyaWdrZ3JuaWNqa3ZldHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDE3MzgsImV4cCI6MjA5OTAxNzczOH0.1J1sRMmej66US7usv5qaakxIBohZZclBhw__zKKEpW0'
);

async function run() {
  const brandCards = [
    { id: '1', brandName: 'KAPIVA', bgColor: 'rgba(119, 138, 94, 0.8)', imageUrl: '/kapiva-dia.jpeg', tagline: 'Ayurvedic Nutrition\n& Wellness' },
    // Multani image is mistakenly named louis-stitch-shoe.jpeg
    { id: '2', brandName: 'MULTANI', bgColor: 'rgba(156, 111, 68, 0.8)', imageUrl: '/louis-stitch-shoe.jpeg', tagline: 'Holistic Ayurvedic\nHealing' },
    // Louis Stitch image is mistakenly named zouk-bag.jpeg
    { id: '3', brandName: 'LOUIS STITCH', bgColor: 'rgba(40, 40, 40, 0.8)', imageUrl: '/zouk-bag.jpeg', tagline: "Premium Men's\nFashion" },
    { id: '4', brandName: 'TRUEBASICS', bgColor: 'rgba(109, 76, 130, 0.8)', imageUrl: '/truebasics.jpeg', tagline: 'Science-Backed\nSupplements' },
    // Zouk image is missing in public, so we leave it empty or point to a placeholder. Let's point it to the logo for now or leave the wrong image so the user can replace it.
    { id: '5', brandName: 'ZOUK', bgColor: 'rgba(176, 60, 60, 0.8)', imageUrl: '/zouk-logo.webp', tagline: 'Uniquely Indian\nVegan Bags' }
  ];

  const { error } = await supabase.from('site_content').upsert({ section_key: 'brand_cards_data', content_value: JSON.stringify(brandCards) }, { onConflict: 'section_key' });
  if (error) console.error('Error inserting brand cards:', error);
  else console.log('Database successfully updated with fixed mappings and line breaks!');
}
run();
