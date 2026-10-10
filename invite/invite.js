(() => {
  const url = new URL(window.location.href);
  const legacyToken = /^\/invite\/([a-f0-9]{64})\/?$/.exec(url.pathname)?.[1];
  if (legacyToken) {
    // GitHub Pages loads this same page as 404.html for previously shared URLs.
    // Move to the real static page, preserving only the public invite token.
    window.location.replace(`/invite/?token=${legacyToken}`);
    return;
  }

  const tokens = url.searchParams.getAll('token');
  const token = url.pathname === '/invite/' && tokens.length === 1 && tokens[0].length === 64 &&
    /^[a-f0-9]{64}$/.test(tokens[0]) ? tokens[0] : null;
  const message = document.getElementById('message');
  if (!token) {
    document.title = 'Page unavailable — RedPlate';
    document.getElementById('heading').textContent = 'This page is unavailable.';
    message.textContent = 'Check the link or ask your friend to share a new invite.';
    return;
  }

  const ua = navigator.userAgent;
  const android = /Android/i.test(ua);
  const ios = /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && (/Mobile/.test(ua) || navigator.maxTouchPoints > 1));
  if (!android && !ios) {
    document.getElementById('heading').textContent = 'Open this invite on your phone.';
    message.textContent = 'A phone is required to view your friend’s profile in Red Plate. Open this link on your iPhone or Android phone.';
    return;
  }

  const open = document.getElementById('open-app');
  // An explicit Android intent targets our package and stays on the invite
  // page when the app is unavailable. The link is launched by a user tap.
  const fallback = encodeURIComponent(`https://redplate.app/invite/?token=${token}`);
  open.href = android
    ? `intent://invite/${token}#Intent;scheme=redplate;package=app.redplate;S.browser_fallback_url=${fallback};end`
    : `redplate://invite/${token}`;
  open.hidden = false;
  document.getElementById('install-ios').hidden = android;
  document.getElementById('install-help').hidden = false;
  message.textContent = android
    ? 'Red Plate is not on Google Play yet. If you already installed it, open your friend’s invite below.'
    : 'Already have Red Plate? Open your friend’s profile below. Otherwise, install the app first.';

  // Give Safari's Smart App Banner the complete invite for its Open action.
  document.querySelector('meta[name="apple-itunes-app"]').content =
    `app-id=6810594165, app-argument=https://redplate.app/invite/?token=${token}`;
})();
