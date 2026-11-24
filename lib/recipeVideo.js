const youtubeHosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com'];

export function youtubeEmbedUrl(value) {
  if (typeof value !== 'string') return null;

  const link = value.trim();
  if (!/^https?:\/\//i.test(link) || !URL.canParse(link)) return null;
  const url = new URL(link);
  if (url.username || url.password || url.port) {
    return null;
  }

  let id;
  if (url.hostname === 'youtu.be') {
    id = url.pathname.match(/^\/([^/]+)\/?$/)?.[1];
  } else if (youtubeHosts.includes(url.hostname)) {
    id = url.pathname === '/watch'
      ? url.searchParams.get('v')
      : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1];
  }

  return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}
