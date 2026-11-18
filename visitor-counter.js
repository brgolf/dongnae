(() => {
  const endpoint = 'https://my-hub-plum-delta.vercel.app/api/dongnae-visitors';
  const storageKey = 'dongnae-visitor-id';
  try {
    let visitorId = localStorage.getItem(storageKey);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(storageKey, visitorId);
    }
    fetch(endpoint, { method: 'POST', body: visitorId, keepalive: true, credentials: 'omit' })
      .catch(() => {});
  } catch {
    // Leave the homepage usable when storage or networking is unavailable.
  }
})();
