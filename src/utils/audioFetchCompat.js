/**
 * Firefox compatibility shim for audio assets loaded through three.js.
 *
 * <audio> preloads and three's FileLoader can request the same sound file.
 * Firefox caches the 206 Partial Content response produced by the media
 * preload and may serve that same 206 to a later fetch(). three's FileLoader
 * rejects every status other than 200, and that rejection used to bubble out
 * of the Suspense boundary and unmount the whole React tree: the page went
 * blank in Firefox while Chrome, which returned 200 from its cache, worked.
 *
 * For audio requests we bypass the HTTP cache, and if a server still responds
 * with a 206 that already covers the whole file we hand three a normal 200.
 */
const AUDIO_URL = /\.(mp3|ogg|oga|wav|m4a|aac)([?#].*)?$/i;

const isCompleteRange = (header) => {
  const match = header && /^bytes\s+(\d+)-(\d+)\/(\d+)$/.exec(header.trim());
  if (!match) return false;

  const start = Number(match[1]);
  const end = Number(match[2]);
  const total = Number(match[3]);

  return start === 0 && end + 1 === total;
};

export const installAudioFetchCompat = () => {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
  if (window.__audioFetchCompatInstalled) return;
  window.__audioFetchCompatInstalled = true;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async function audioSafeFetch(input, init) {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (!AUDIO_URL.test(url)) return nativeFetch(input, init);

    const response = await nativeFetch(input, { ...(init || {}), cache: 'no-store' });
    if (response.status !== 206) return response;

    const contentRange = response.headers.get('content-range');
    if (!isCompleteRange(contentRange)) return response;

    // The body already holds the entire file, so present it as a normal 200.
    const body = await response.arrayBuffer();
    const headers = new Headers();
    const contentType = response.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    headers.set('content-length', String(body.byteLength));

    return new Response(body, { status: 200, statusText: 'OK', headers });
  };
};
