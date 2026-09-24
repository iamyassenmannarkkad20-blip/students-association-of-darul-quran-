import { query } from './index';

async function seedRealVideos() {
  console.log('Seeding official SADQ YouTube videos...');
  
  const videos = [
    {
      title: 'SADQ Campus Spotlight - Edition 01',
      description: 'Official student association visual capture and academy moments.',
      media_type: 'youtube',
      media_url: 'https://youtube.com/shorts/loBBhKjIQZM',
      category: 'Campus Life',
    },
    {
      title: 'SADQ Student Expressions - Edition 02',
      description: 'Darul Quran Islamic Academy student talents and initiatives.',
      media_type: 'youtube',
      media_url: 'https://youtube.com/shorts/WhdDqjPkxD8',
      category: 'Student Growth',
    },
    {
      title: 'SADQ Activities & Leadership - Edition 03',
      description: 'Collaborative projects and youth engagement at SADQ.',
      media_type: 'youtube',
      media_url: 'https://youtube.com/shorts/3oKM3MJ012I',
      category: 'Activities',
    },
  ];

  for (const v of videos) {
    await query(
      `INSERT INTO media_items (title, description, media_type, media_url, category, status)
       VALUES ($1, $2, $3, $4, $5, 'PUBLISHED')`,
      [v.title, v.description, v.media_type, v.media_url, v.category]
    );
  }

  console.log('Successfully inserted official SADQ videos into Supabase PostgreSQL!');
  process.exit(0);
}

seedRealVideos().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
