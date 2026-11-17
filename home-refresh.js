// This listener is independent of reservation and gallery scripts.
const homeLogo = document.querySelector('header .logo');
if (homeLogo) {
  homeLogo.href = 'index.html';
  homeLogo.setAttribute('aria-label', '메인으로 이동하고 새로고침');
  homeLogo.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const home = new URL('index.html', window.location.href);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    try {
      history.replaceState(null, '', home.href);
      window.location.reload();
    } catch {
      window.location.assign(home.href);
    }
  });
}
