import { query } from './index';

async function replaceVideos() {
  console.log('Replacing old YouTube Shorts with new SADQ Live videos...');

  // Remove old shorts
  const deleted = await query(`DELETE FROM media_items WHERE media_url LIKE '%shorts%' RETURNING id`);
  console.log(`Deleted ${deleted.rowCount} old Shorts entries.`);

  // Insert 4 new official Live videos
  const videos = [
    {
      title: 'SADQ Official Live Broadcast – Public Samajam',
      description: 'Official SADQ public Samajam live broadcast from Darul Quran Islamic Academy.',
      media_type: 'youtube',
      media_url: 'https://www.youtube.com/live/3C9AQZe52Fw',
      category: 'Samajam Board',
    },
    {
      title: 'SADQ Official Live Broadcast – Campus Activities',
      description: 'Student campus activities and community engagement, live from SADQ.',
      media_type: 'youtube',
      media_url: 'https://www.youtube.com/live/ZPtXPfNoluc',
      category: 'Campus Life',
    },
    {
      title: 'SADQ Official Live Broadcast – Institutional Programme',
      description: 'Official institutional programme broadcast by Students Association of Darul Quran Islamic Academy.',
      media_type: 'youtube',
      media_url: 'https://www.youtube.com/live/C4yb_29rAxw',
      category: 'Official Programme',
    },
    {
      title: 'SADQ Official Live Broadcast – Student Leadership',
      description: 'Student leadership and organisational activities broadcast live from SADQ.',
      media_type: 'youtube',
      media_url: 'https://www.youtube.com/live/2qJDBtYlNgk',
      category: 'Leadership',
    },
  ];

  for (const v of videos) {
    await query(
      `INSERT INTO media_items (title, description, media_type, media_url, category, status)
       VALUES ($1, $2, $3, $4, $5, 'PUBLISHED')`,
      [v.title, v.description, v.media_type, v.media_url, v.category]
    );
  }

  const check = await query(`SELECT id, title, media_url FROM media_items ORDER BY created_at DESC`);
  console.log('Current media_items in DB:');
  check.rows.forEach((r: any) => console.log(' -', r.title, '|', r.media_url));

  console.log('\nDone! 4 new official SADQ Live videos seeded successfully.');
  process.exit(0);
}

replaceVideos().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
