
window.SecretEvents = (function () {
  var KEY = 'secretEventsEnabled';
  var MOBILE_MQ = '(max-width: 900px)';

  function isMobile() {
    return typeof window.matchMedia === 'function' && window.matchMedia(MOBILE_MQ).matches;
  }

  function isEnabled() {
    /* THE CHANCES EASTER EGGES ARE ALWAYS DISABLED IN PHONES DUE TO THE BUTTON NOT BEING IN THERE! */
    if (isMobile()) return false;
    var v;
    try { v = localStorage.getItem(KEY); } catch (e) { return true; }
    return v === null ? true : v === 'true'; /* default: TRUE */
  }

  function setEnabled(v) {
    try { localStorage.setItem(KEY, v ? 'true' : 'false'); } catch (e) {}
  }

  function roll(oneIn) {
    if (!isEnabled()) return false;
    return Math.random() < (1 / oneIn);
  }

  return { isEnabled: isEnabled, setEnabled: setEnabled, roll: roll };
})();

var IN_SPA = window.self !== window.top;
if (IN_SPA) document.documentElement.classList.add('in-spa');

var CLICKABLE_SEL = 'a[href], a[data-href-stash], button, [role="button"], [data-href]';

function realHref(a) {
  return a.getAttribute('href') || a.getAttribute('data-href-stash') || '';
}

if (IN_SPA) {

  function isInternalHtml(a) {
    var raw = realHref(a);
    if (!raw || raw.startsWith('#') || raw.startsWith('javascript') ||
        raw.startsWith('mailto') || raw.startsWith('tel')) return false;
    if (a.target === '_blank') return false;
    return (raw.endsWith('.html') || raw.includes('.html?') || raw.includes('.html#'));
  }

  function resolvedHref(a) {

    if (a.getAttribute('href')) return a.href;
    return new URL(realHref(a), location.href).href;
  }

  function navigateTo(a) {
    window.parent.postMessage({ type: 'spa-navigate', resolved: resolvedHref(a) }, '*');
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || !isInternalHtml(a)) return;
    e.preventDefault();
    navigateTo(a);
  }, true);
}

document.addEventListener('auxclick', function (e) {
  if (e.button !== 1) return;
  var el = e.target.closest(CLICKABLE_SEL);
  if (!el) return;
  e.preventDefault();
  e.stopPropagation();
  el.click();
}, true);

document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  var el = e.target.closest(CLICKABLE_SEL);
  if (el) el.click();
}, true);

if (IN_SPA) {

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      window.parent.postMessage({ type: 'spa-escape' }, '*');
    }
  });
}

document.addEventListener('mouseover', function (e) {
  var a = e.target.closest('a[href]');
  if (!a) return;
  a.setAttribute('data-href-stash', a.getAttribute('href'));
  a.removeAttribute('href');
}, true);

document.addEventListener('mousedown', function (e) {
  var a = e.target.closest('a[data-href-stash]');
  if (a) a.setAttribute('href', a.getAttribute('data-href-stash'));
}, true);

document.addEventListener('mouseout', function (e) {
  var a = e.target.closest('a[data-href-stash]');
  if (a) a.setAttribute('href', a.getAttribute('data-href-stash'));
}, true);

document.addEventListener('wheel', function (e) {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

document.addEventListener('keydown', function (e) {
  var zoomKeys = ['+', '-', '=', '0'];
  if ((e.ctrlKey || e.metaKey) && zoomKeys.indexOf(e.key) !== -1) e.preventDefault();
}, { passive: false });

document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

document.addEventListener('dragstart', function (e) {
  if (e.target && e.target.closest('img, a, [role="button"]')) e.preventDefault();
});

document.addEventListener('DOMContentLoaded', function () {
  var nameEl = document.getElementById('footer-credit-name');
  if (!nameEl || nameEl.tagName === 'A') return;
  if (/\babout\.html$/.test(location.pathname)) return; /* ABOUT IN FOOTER */

  var thisScript = document.currentScript ||
    Array.prototype.find.call(document.scripts, function (s) { return /js\/global\.js$/.test(s.src); });
  var prefix = './';
  if (thisScript) {
    var m = thisScript.getAttribute('src').match(/^((?:\.\.\/)*|\.\/)js\/global\.js$/);
    if (m) prefix = m[1] || './';
  }

  var a = document.createElement('a');
  a.href = prefix + 'about.html';
  a.id = nameEl.id;
  a.className = nameEl.className;
  a.textContent = nameEl.textContent;
  nameEl.replaceWith(a);
});

document.addEventListener('DOMContentLoaded', function () {
  var nav = document.querySelector('.wiki-nav');
  if (!nav) return;
  var current = location.pathname.split('/').pop();
  nav.querySelectorAll('a[href]').forEach(function (a) {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
});