import { readFile, writeFile } from 'node:fs/promises';
import { isVisibleOnTopicPage } from '../src/utils/professorVisibility.js';

const siteUrl = 'https://eesa.dece.nycu.edu.tw/nycueelab/';
const dataUrl = new URL('../../backend/NewData.json', import.meta.url);
const outputUrl = new URL('../public/sitemap.xml', import.meta.url);
const data = JSON.parse(await readFile(dataUrl, 'utf8'));

if (!Array.isArray(data.professors)) {
  throw new Error('Professor data must contain a professors array.');
}

// Use the same publication rules as the public research directory.
const professors = data.professors.filter((professor) =>
  typeof professor?.name === 'string' &&
  professor.name.trim() !== '' &&
  professor.name.trim() !== 'Prof.' &&
  isVisibleOnTopicPage(professor)
);

if (professors.some((professor) => !Number.isSafeInteger(professor.id) || professor.id <= 0)) {
  throw new Error('Each published professor must have a positive integer ID.');
}

const professorIds = [...new Set(professors.map((professor) => professor.id))]
  .sort((a, b) => a - b);
const paths = ['', 'topicpage', ...professorIds.map((id) => `professor/${id}`)];
const entries = paths.map((path) =>
  `  <url>\n    <loc>${new URL(path, siteUrl).href}</loc>\n  </url>`
);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
  '',
].join('\n');

await writeFile(outputUrl, sitemap, 'utf8');
console.log(`Generated sitemap.xml with ${paths.length} URLs (${professorIds.length} professors).`);
