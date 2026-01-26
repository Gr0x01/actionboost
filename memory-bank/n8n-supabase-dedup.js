// ============================================
// DEDUPLICATE NODE - Replace existing code with this
// ============================================

const SUPABASE_URL = 'https://qomiwimfekvfjbjjhzkz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbWl3aW1mZWt2Zmpiampoemt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDE3MTksImV4cCI6MjA4NDM3NzcxOX0.mv0WLMYiYp5hnArPQnKCzPXgDL70qHFPVIQWZ5eUBbg';

// Get all post IDs from input
const allItems = $input.all();
const postIds = allItems
  .filter(i => !i.json._noResults && i.json.postId)
  .map(i => i.json.postId);

if (postIds.length === 0) {
  return [{ json: { _noResults: true } }];
}

// Check which posts we've already sent
let existingIds = [];
try {
  // Quote each ID for the in filter (required for text columns)
  const quotedIds = postIds.map(id => `"${id}"`).join(',');

  const response = await this.helpers.httpRequest({
    method: 'GET',
    url: `${SUPABASE_URL}/rest/v1/reddit_sent_posts?post_id=in.(${quotedIds})&select=post_id`,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    json: true
  });
  existingIds = (response || []).map(r => r.post_id);
  console.log('Found existing posts:', existingIds.length);
} catch(e) {
  console.log('Supabase check error:', e.message);
}

// Filter out posts we've already sent
const newPosts = allItems.filter(item => {
  if (item.json._noResults) return true;
  return !existingIds.includes(item.json.postId);
});

console.log('Input:', allItems.length, 'Existing:', existingIds.length, 'New:', newPosts.length);

if (newPosts.length === 0 || (newPosts.length === 1 && newPosts[0].json._noResults)) {
  return [{ json: { _noResults: true, _deduped: true } }];
}

return newPosts;


// ============================================
// FILTER & BATCH NODE - Replace existing code with this
// ============================================

const SUPABASE_URL = 'https://qomiwimfekvfjbjjhzkz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbWl3aW1mZWt2Zmpiampoemt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDE3MTksImV4cCI6MjA4NDM3NzcxOX0.mv0WLMYiYp5hnArPQnKCzPXgDL70qHFPVIQWZ5eUBbg';

const validPosts = $input.all()
  .filter(i => !i.json._noResults && (i.json.score || 0) >= 7)
  .map(i => i.json);

if (validPosts.length === 0) {
  return [{ json: { _heartbeat: true } }];
}

// Mark posts as sent in Supabase
try {
  const records = validPosts.map(p => ({
    post_id: p.postId,
    subreddit: p.sub,
    title: p.ttl?.substring(0, 200)
  }));

  await this.helpers.httpRequest({
    method: 'POST',
    url: `${SUPABASE_URL}/rest/v1/reddit_sent_posts`,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates'
    },
    body: records,
    json: true
  });
  console.log('Marked as sent:', records.length, 'posts');
} catch(e) {
  console.log('Supabase insert error:', e.message);
}

// Batch into groups of 5
const batches = [];
for (let i = 0; i < validPosts.length; i += 5) {
  batches.push(validPosts.slice(i, i + 5));
}

return batches.map(batch => ({ json: { posts: batch } }));
