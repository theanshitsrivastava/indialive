// generate-sitemap.js (ESM-compatible)

import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
import { finished } from 'node:stream/promises';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://dlmyycjetgqyvhvxksbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbXl5Y2pldGdxeXZodnhrc2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4ODUzMzksImV4cCI6MjA1MTQ2MTMzOX0.683CxrKK2-7H6iX2hK-K59kKPWiQuRSWwtqv1d4N-iE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Your domain name
const baseUrl = 'https://indialive.org';

// Pages other than news
const staticRoutes = ['/', '/about', '/contact', '/admin'];

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: baseUrl });
  const writeStream = createWriteStream(resolve('public', 'sitemap.xml'));
  sitemap.pipe(writeStream);

  // Static Routes
  staticRoutes.forEach(route => {
    sitemap.write({ url: route, changefreq: 'daily', priority: 0.7 });
  });

  // Dynamic News Routes
  const { data, error } = await supabase.from('posts').select('slug');

  if (error) {
    console.error('❌ Error fetching news from Supabase:', error);
    return;
  }

  data.forEach(post => {
    sitemap.write({ url: `/news/${post.slug}`, changefreq: 'daily', priority: 0.9 });
  });

  sitemap.end();

  await Promise.all([
    streamToPromise(sitemap),
    finished(writeStream)
  ]);

  console.log('✅ Sitemap successfully created at public/sitemap.xml');
}

generateSitemap().catch(console.error);
