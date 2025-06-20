import axios from 'axios';
import * as cheerio from 'cheerio';
import supabase from '../config/supabase.js';

const TTL = 60 * 60 * 1000; // 1 hour in milliseconds

const fetchUpdatesFromSites = async () => {
  try {
    const reliefHTML = await axios.get('https://reliefweb.int');
    const redCrossHTML = await axios.get('https://www.redcross.org');

    const relief$ = cheerio.load(reliefHTML.data);
    const redCross$ = cheerio.load(redCrossHTML.data);

    // Extract top 5 headlines or titles
    const reliefUpdates = relief$('article h3')
      .slice(0, 5)
      .map((i, el) => relief$(el).text().trim())
      .get();

    const redCrossUpdates = redCross$('h3, h2')
      .slice(0, 5)
      .map((i, el) => redCross$(el).text().trim())
      .get();

    return {
      relief: reliefUpdates,
      redCross: redCrossUpdates,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error scraping sites:', err);
    return null;
  }
};

const getOfficialUpdates = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `official_updates_${id}`;

  const { data: cached, error: cacheError } = await supabase
    .from('cache')
    .select('value, expires_at')
    .eq('key', cacheKey)
    .single();

  const now = new Date();

  if (cached && new Date(cached.expires_at) > now) {
    return res.json({
      source: 'cache',
      updates: cached.value,
    });
  }

  const updates = await fetchUpdatesFromSites();

  if (!updates) {
    return res.status(500).json({ error: 'Failed to fetch updates' });
  }

  // Store in cache
  const expiresAt = new Date(now.getTime() + TTL).toISOString();

  await supabase.from('cache')
    .upsert([{ key: cacheKey, value: updates, expires_at: expiresAt }]);

  return res.json({
    source: 'live',
    updates,
  });
};

export default getOfficialUpdates;