// Deduplicate: filter out posts we've already sent
const staticData = $getWorkflowStaticData('global');
if (!staticData.sentPosts) {
  staticData.sentPosts = {};
}

// LOG HOW MANY POSTS ARE TRACKED
console.log('sentPosts count:', Object.keys(staticData.sentPosts).length);
console.log('sentPosts keys:', Object.keys(staticData.sentPosts).slice(0, 5));

// Clean up old entries (older than 24 hours)
const now = Date.now();
const oneDayAgo = now - (24 * 60 * 60 * 1000);
for (const [key, timestamp] of Object.entries(staticData.sentPosts)) {
  if (timestamp < oneDayAgo) {
    delete staticData.sentPosts[key];
  }
}

const newPosts = [];
for (const item of $input.all()) {
  if (item.json._noResults) {
    newPosts.push(item);
    continue;
  }

  const postId = item.json.postId;
  if (!staticData.sentPosts[postId]) {
    newPosts.push(item);
  } else {
    console.log('SKIPPING duplicate:', postId);
  }
}

if (newPosts.length === 0 || (newPosts.length === 1 && newPosts[0].json._noResults)) {
  return [{ json: { _noResults: true, _deduped: true } }];
}

return newPosts;
