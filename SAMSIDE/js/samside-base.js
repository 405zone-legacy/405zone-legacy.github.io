
(function () {
  'use strict';

  /* WHERE AM I?
     Every asset / page link is resolved from the location of THIS script, so a page can live at
     ANY depth inside SAMSIDE without breaking its media, sfx or redirects. */
  var me = document.currentScript;
  if (!me) {
    var all = document.getElementsByTagName('script');
    for (var k = all.length - 1; k >= 0; k--) {
      if (/samside-base\.js/.test(all[k].src)) { me = all[k]; break; }
    }
  }
  var BASE = me ? new URL('../', me.src).href : '../';        // .../SAMSIDE/
  var SITE = me ? new URL('../../', me.src).href : '../../';  // .../ (root of the website)

  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey) e.preventDefault();               // AVOID ZOOMING
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    // UNABLE "MOVES" :3c
    var zoomKeys = ['+', '-', '=', '0'];
    if ((e.ctrlKey || e.metaKey) && zoomKeys.indexOf(e.key) !== -1) e.preventDefault();
  }, { passive: false });

  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  window.SAMSIDE = {

    /* ---------- PATHS ---------- */

    // SAMSIDE.url('media/asstin.png')  ->  absolute URL inside SAMSIDE/
    url: function (path) { return BASE + (path || ''); },

    // SAMSIDE.site('404.html')  ->  absolute URL inside the ROOT of the website
    site: function (path) { return SITE + (path || ''); },

    rootHref: function (path) {
      return SITE + (path || '');
    },

    /* ---------- RANDOM HELPERS ---------- */

    rand: function (min, max) { return min + Math.random() * (max - min); },
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    chance: function (p) { return Math.random() < p; },

    /* ---------- TEXT ---------- */

    typewriter: function (el, text, opts) {
      opts = opts || {};
      var speed = opts.speed || 35;
      var onDone = opts.onDone || function () {};
      var i = 0;
      el.textContent = '';
      var cancelled = false;
      function step() {
        if (cancelled) return;
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(step, speed);
        } else {
          onDone();
        }
      }
      step();
      return function cancel() { cancelled = true; };
    },

    // TERMINAL: types several elements (<p>) one after another. Returns a function that finishes it instantly.
    typeBlocks: function (els, opts) {
      opts = opts || {};
      var speed = (opts.speed != null) ? opts.speed : 10;
      var gap = (opts.gap != null) ? opts.gap : 350;
      var texts = [], bi = 0, ci = 0, timer = null, done = false;
      els = Array.prototype.slice.call(els);
      els.forEach(function (el) { texts.push(el.textContent); el.textContent = ''; el.hidden = true; });
      function scroll() { if (opts.scroller) opts.scroller.scrollTop = opts.scroller.scrollHeight; }
      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        els.forEach(function (el, i) { el.hidden = false; el.textContent = texts[i]; });
        scroll();
        if (opts.onDone) opts.onDone();
      }
      function step() {
        if (done) return;
        if (bi >= els.length) { finish(); return; }
        var el = els[bi], t = texts[bi];
        if (ci === 0) el.hidden = false;
        if (ci < t.length) {
          ci++;
          el.textContent = t.slice(0, ci);
          scroll();
          timer = setTimeout(step, speed);
        } else {
          bi++; ci = 0;
          timer = setTimeout(step, gap);
        }
      }
      step();
      return finish;
    },

    /* ---------- AUDIO ---------- */

    playSafe: function (src, opts) {
      opts = opts || {};
      try {
        var audio = new Audio(src);
        audio.loop = !!opts.loop;
        audio.volume = (opts.volume != null) ? opts.volume : 1;
        var p = audio.play();
        if (p && p.catch) p.catch(function () {  });
        return audio;
      } catch (e) {
        return null;
      }
    },

    // BACKGROUND MUSIC: tries to start right away; if the browser blocks it (autoplay policy), it starts on the
    // first click / tap / key. opts.startAt() -> seconds: lets a page keep the track in sync with its own clock.
    bgm: function (src, opts) {
      opts = opts || {};
      var a;
      try {
        a = new Audio(src);
        a.loop = !!opts.loop;
        a.volume = (opts.volume != null) ? opts.volume : .8;
      } catch (e) { return null; }
      var evs = ['click', 'keydown', 'touchend', 'pointerup'];
      function off() { evs.forEach(function (n) { document.removeEventListener(n, unlock, true); }); }
      function unlock() {
        off();
        if (opts.startAt) {
          try {
            var t = opts.startAt();
            if (isFinite(t) && t > 0 && (!isFinite(a.duration) || t < a.duration)) a.currentTime = t;
          } catch (e) {}
        }
        var q = a.play();
        if (q && q.catch) q.catch(function () {});
      }
      var p;
      try { p = a.play(); } catch (e) {}
      if (p && p.catch) {
        p.catch(function () { evs.forEach(function (n) { document.addEventListener(n, unlock, true); }); });
      }
      return a;
    },

    /* ---------- NAVIGATION ---------- */

    redirectAfter: function (ms, href) {
      href = href || SAMSIDE.rootHref('index.html');
      setTimeout(function () { window.location.href = href; }, ms);
    },

    randomPosition: function (el, pad) {
      pad = pad || 40;
      var w = window.innerWidth, h = window.innerHeight;
      var x = pad + Math.random() * (w - pad * 2);
      var y = pad + Math.random() * (h - pad * 2);
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    },

    morseMap: {
      'a':'.-','b':'-...','c':'-.-.','d':'-..','e':'.','f':'..-.','g':'--.','h':'....',
      'i':'..','j':'.---','k':'-.-','l':'.-..','m':'--','n':'-.','o':'---','p':'.--.',
      'q':'--.-','r':'.-.','s':'...','t':'-','u':'..-','v':'...-','w':'.--','x':'-..-',
      'y':'-.--','z':'--..',' ':'/'
    },
    toMorse: function (text) {
      var self = this;
      return text.toLowerCase().split('').map(function (c) {
        return self.morseMap[c] || '';
      }).join(' ');
    }
  };
})();
