import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import path from 'path';

// 1️⃣ Your domain
const hostname = 'https://yourdomain.com';

// 2️⃣ Your static routes
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  // Add more static routes here
];

// 3️⃣ Fetch dynamic URLs if needed
async function getDynamicUrls() {
  // Example:
  // const res = await fetch('https://api.yoursite.com/posts');
  // const posts = await res.json();
  // return posts.map(post => ({
  //   url: `/blog/${post.slug}`,
  //   changefreq: 'weekly',
  //   priority: 0.8
  // }));

  return []; // If none, return an empty array
}

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname });
  const writeStream = createWriteStream(path.resolve('./public/sitemap.xml'));

  sitemap.pipe(writeStream);

  // Add static links
  links.forEach(link => sitemap.write(link));

  // Add dynamic links
  const dynamicLinks = await getDynamicUrls();
  dynamicLinks.forEach(link => sitemap.write(link));

  sitemap.end();

  await streamToPromise(sitemap);

  console.log('✅ Sitemap generated at /public/sitemap.xml');
}

generateSitemap().catch(err => {
  console.error('❌ Error generating sitemap:', err);
});
