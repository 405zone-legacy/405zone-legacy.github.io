(function () {
  'use strict';

  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    var zoomKeys = ['+', '-', '=', '0'];
    if ((e.ctrlKey || e.metaKey) && zoomKeys.indexOf(e.key) !== -1) e.preventDefault();
  }, { passive: false });

  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });

  var TOP_CLICKABLE_SEL = 'button, [role="button"], a[href]';

  document.addEventListener('auxclick', function (e) {
    if (e.button !== 1) return;
    var el = e.target.closest(TOP_CLICKABLE_SEL);
    if (!el) return;
    e.preventDefault();
    el.click();
  }, true);

  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    var el = e.target.closest(TOP_CLICKABLE_SEL);
    if (el) el.click();
  }, true);

  var siteLoading = document.getElementById('site-loading');
  if (siteLoading) {
    function hideSiteLoading() {
      siteLoading.classList.add('is-hidden');
      setTimeout(function () { siteLoading.remove(); }, 450);
    }
    if (document.readyState === 'complete') hideSiteLoading();
    else window.addEventListener('load', hideSiteLoading);
  }

  (function () {
    var KEY = 'secretEventsEnabled';
    var btn = document.getElementById('secret-events-toggle');
    if (!btn) return;

    function isEnabled() {
      var v;
      try { v = localStorage.getItem(KEY); } catch (e) { return true; }
      return v === null ? true : v === 'true';
    }
    function setEnabled(v) {
      try { localStorage.setItem(KEY, v ? 'true' : 'false'); } catch (e) {}
    }
    function render() {
      btn.classList.toggle('is-on', isEnabled());
    }
    btn.addEventListener('click', function () {
      setEnabled(!isEnabled());
      render();
    });
    render();
  })();

  var splashEl = document.getElementById('hub-splash');
  if (splashEl && typeof SPLASHES !== 'undefined') {
    var sp = (typeof getAnniversarySplash === 'function' && getAnniversarySplash())
           || SPLASHES[Math.floor(Math.random() * SPLASHES.length)];
    splashEl.textContent = sp.text;
    splashEl.style.color = sp.color || '#ffff55';
  }

  var INDEX_BASE = location.pathname.replace(/[^\/]*$/, '');

  function pathnameToHref(p) {
    var r = p.startsWith(INDEX_BASE) ? p.slice(INDEX_BASE.length) : p.replace(/^\//, '');
    return './' + r;
  }
  function hrefToParam(h) { return h.replace(/^\.\//, '').replace(/\.html$/, ''); }
  function paramToHref(p) { return './' + p + '.html'; }
  function getParentHref(h) {
    if (!h) return null;
    var parts = hrefToParam(h).split('/');
    if (parts.length <= 1) return null;
    parts.pop();
    return paramToHref(parts.join('/'));
  }

  var LABELS = {
    '':                                                                             'Home',
    'wiki':                                                                         'Wiki',
    'projects':                                                                     'Projects',
    'news':                                                                         'News',
    'about':                                                                        'About',
    'music':                                                                        'Music',
    'wiki/porkys-legacy-og':                                                        "Pork's Legacy",
    'wiki/porkys-legacy-era-of-corruption':                                         "Pork's Legacy: Era of Corruption",
    'wiki/porkys-legacy-era-of-corruption/knoweldge-research':                      'Knowledge Research',
    'wiki/porkys-legacy-era-of-corruption/corruption-research':                     'Corruption Research',
    'wiki/porkys-legacy-era-of-corruption/corruption-research/global-impact':       'Global Impact',
    'wiki/porkys-legacy-era-of-corruption/corruption-research/ominous-valley':      'Ominous Valley',
    'wiki/porkys-legacy-era-of-corruption/corruption-research/corrupted-spore':     'Corrupted Spore',
    'wiki/porkys-legacy-era-of-corruption/corruption-research/hazed-plains':        'Hazed Plains',
    'wiki/porkys-legacy-era-of-corruption/corruption-research/sinner-land':         'Sinner Land',
    'wiki/porkys-legacy-era-of-corruption/corruption-research/broken_heaven':       'broken_heaven',
    'wiki/porkys-legacy-era-of-corruption/corruption-research/error_3008-samside':  'Error3008 (THE SAMSIDE)',
    'projects/porkys-legacy':                                                       "Porky's Legacy",
    'projects/porkys-legacy-era-of-corruption':                                     "Porky's Legacy: Era of Corruption",
    'projects/rewinded-nights':                                                     'Rewinded Nights',
    'projects/rewinded-misery':                                                     'Rewinded Misery',
  };

  function labelFor(param) {
    if (param in LABELS) return LABELS[param];
    var seg = param.split('/').pop();
    return seg.replace(/-/g, ' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); });
  }

  /* ── DOM ── */
  var hub    = document.getElementById('hub');
  var panel  = document.getElementById('spa-panel');
  var frame  = document.getElementById('spa-frame');
  var backBtn   = document.getElementById('spa-back');
  var backLabel = document.getElementById('spa-back-label');

  var currentHref = null;
  var animRunning = true;

  var backLabelWrap = document.getElementById('spa-back-label-wrap');
  var _backScrollRaf = null, _backScrollPos = 0, _backScrollDir = 1, _backScrollPause = 0;

  function updateBackBtn() {
    if (!backBtn || !backLabel) return;
    var parent = getParentHref(currentHref);
    var label  = labelFor(parent ? hrefToParam(parent) : '');
    backLabel.textContent = label;

    /* Reset and measure scroll to apply ping-pong animation for long titles without overflowing the button. */
    backLabel.style.transform = 'translateX(0)';
    _backScrollPos = 0; _backScrollDir = 1; _backScrollPause = 0;
    if (_backScrollRaf) { cancelAnimationFrame(_backScrollRaf); _backScrollRaf = null; }
    if (!backLabelWrap) return;
    requestAnimationFrame(function () {
      var textW = backLabel.scrollWidth, wrapW = backLabelWrap.clientWidth;
      if (textW <= wrapW + 2) return;
      var overflow = textW - wrapW, speed = 0.4;
      function scrollTick() {
        if (_backScrollPause > 0) { _backScrollPause--; _backScrollRaf = requestAnimationFrame(scrollTick); return; }
        _backScrollPos += speed * _backScrollDir;
        if (_backScrollPos >= overflow) { _backScrollPos = overflow; _backScrollDir = -1; _backScrollPause = 120; }
        else if (_backScrollPos <= 0)   { _backScrollPos = 0;        _backScrollDir =  1; _backScrollPause = 120; }
        backLabel.style.transform = 'translateX(' + (-_backScrollPos) + 'px)';
        _backScrollRaf = requestAnimationFrame(scrollTick);
      }
      _backScrollPause = 90;
      _backScrollRaf = requestAnimationFrame(scrollTick);
    });
  }

  function doEscape() {
    if (!panel.classList.contains('is-open')) return;
    var parent = getParentHref(currentHref);
    if (parent) openPanel(parent);
    else         closePanel();
  }

  /* Only update state if the load matches the expectedHref, ignoring obsolete navigations. */
  var expectedHref = null;
  var loadTimeout  = null;

  /* Use location.replace() to navigate the iframe without adding history entries, keeping the main state synchronized. */
  function navigateFrame(href) {
    try {
      frame.contentWindow.location.replace(href);
    } catch (e) {
      frame.src = href;
    }
  }

  function openPanel(href, addToHistory) {
    currentHref  = href;
    expectedHref = href;

    /* Clear any stuck state from a previous navigation */
    clearTimeout(loadTimeout);

    frame.classList.add('loading');
    panel.classList.add('is-loading');
    hub.classList.add('panel-open');
    animRunning = false;
    panel.classList.add('is-open');
    if (backBtn) backBtn.classList.add('visible');
    updateBackBtn();
    navigateFrame(href);

    /* Safety net: if frame.load never fires within 12s, recover cleanly */
    loadTimeout = setTimeout(function () {
      if (expectedHref === href) {
        frame.classList.remove('loading');
        panel.classList.remove('is-loading');
      }
    }, 12000);

    if (addToHistory !== false) {
      var param = hrefToParam(href);
      history.pushState({ p: param }, '', location.pathname + '?p=' + encodeURIComponent(param));
    }
  }

  function closePanel(addToHistory) {
    expectedHref = null;
    currentHref  = null;
    clearTimeout(loadTimeout);
    frame.classList.remove('loading');
    panel.classList.remove('is-loading');
    panel.classList.remove('is-open');
    if (backBtn) backBtn.classList.remove('visible');
    hub.classList.remove('panel-open');
    animRunning = true;
    /* Swap src AFTER transition so frame.load on about:blank is ignored */
    setTimeout(function () { navigateFrame('about:blank'); }, 420);
    if (addToHistory !== false) history.pushState({}, '', location.pathname);
    if (window.MusicPlayer) window.MusicPlayer.changePage('');
  }

  document.querySelectorAll('.hub-btn, .hub-logo').forEach(function (el) {
    var href = el.dataset.href;
    function go(e) { if (e) e.preventDefault(); openPanel(href); }
    el.addEventListener('click', go);
  });

  if (backBtn) {
    backBtn.addEventListener('click', doEscape);
    backBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') doEscape();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') doEscape();
  });

  window.addEventListener('message', function (e) {
    if (!e.data) return;

    if (e.data.type === 'spa-navigate') {

      var fullUrl = e.data.resolved || e.data.href || '';
      var pathname = '';
      try {
        pathname = new URL(fullUrl).pathname;
      } catch (_) {

        var m = fullUrl.replace(/\\/g, '/').match(/(\/[^?#]+\.html)/i);
        pathname = m ? m[1] : '';
      }
      if (pathname) openPanel(pathnameToHref(pathname));
    }

    if (e.data.type === 'spa-escape') doEscape();

    if (e.data.type === 'spa-hard-reset') {
      window.location.href = window.location.pathname;
    }
  });

  /* Sync URL when iframe finishes loading. */
  frame.addEventListener('load', function () {
    if (!expectedHref) return; /* about:blank or stale load */

    clearTimeout(loadTimeout);
    frame.classList.remove('loading');
    panel.classList.remove('is-loading');

    var param = hrefToParam(currentHref || expectedHref);
    history.replaceState({ p: param }, '', location.pathname + '?p=' + encodeURIComponent(param));
    if (window.MusicPlayer) window.MusicPlayer.changePage(param);
    updateBackBtn();
  });

  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.p) {
      openPanel(paramToHref(e.state.p), false);
      if (window.MusicPlayer) window.MusicPlayer.changePage(e.state.p);
    } else {
      closePanel(false);
    }
  });

  (function () {
    var p = new URLSearchParams(location.search).get('p');
    if (p) openPanel(paramToHref(p), false);
    else if (window.MusicPlayer) window.MusicPlayer.changePage('');
  })();

  var BUTTONS = [
    { id:'btn-projects', ax:4, fx:.55, px:0,   ay:9,  fy:.42, py:0   },
    { id:'btn-news',     ax:5, fx:.48, px:1.1, ay:11, fy:.38, py:.7  },
    { id:'btn-music',    ax:3, fx:.60, px:2.0, ay:8,  fy:.50, py:1.4 },
    { id:'btn-wiki',     ax:6, fx:.44, px:.5,  ay:10, fy:.36, py:2.1 },
  ];
  var TM = {
    'btn-projects':'translate(-50%,-50%)',
    'btn-news':    'translate(50%,-50%)',
    'btn-music':   'translate(-50%,50%)',
    'btn-wiki':    'translate(50%,50%)',
  };
  var btnEls = BUTTONS.map(function(c){
    var el=document.getElementById(c.id); return el?{el:el,c:c}:null;
  }).filter(Boolean);

  var logoEl    = document.getElementById('hub-logo');
  var splashDiv = document.getElementById('hub-splash');
  var t = 0;

  var MOBILE_MQ = window.matchMedia('(max-width: 900px)');

  function tick() {
    if (animRunning) {
      t += 0.08;
      var mobile = MOBILE_MQ.matches;
      btnEls.forEach(function(item){
        var c=item.c;
        var x=c.ax*Math.sin(c.fx*t+c.px), y=c.ay*Math.cos(c.fy*t+c.py);
        item.el.style.transform = (mobile ? '' : TM[item.el.id]+' ') + 'translate('+x+'px,'+y+'px)';
      });
      var rot = 12 * Math.sin(0.28 * t);
      if (logoEl)    logoEl.style.transform = 'rotate('+rot+'deg)';
      if (splashDiv) {
        //  ULTRA NECESSARY COMMENT IN THIS LINE OF CODE SPECIALLY ;3 ... WHY ARE YOU LOOKING IN HERE SILLY?! >:3c
        var b = 1 + 0.08*Math.abs(Math.sin(t*1.8));
        splashDiv.style.transform = (mobile ? '' : 'translateX(-50%) ') + 'rotate('+(-rot*.9)+'deg) scale('+b+')';
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  var GIFS=[17,27], TOTAL=40;
  var lA=document.getElementById('bg-layer-a'), lB=document.getElementById('bg-layer-b');
  if (lA && lB) {
    var active=lA, hidden=lB, cur=-1;
    function rnd(){
      var n; do{n=Math.floor(Math.random()*TOTAL)+1;}while(n===cur); cur=n;
      return './media/HOME/BG/'+n+'.'+(GIFS.indexOf(n)!==-1?'gif':'png');
    }
    function rotate(){
      hidden.style.backgroundImage='url("'+rnd()+'")';
      hidden.style.opacity='0';
      requestAnimationFrame(function(){
        hidden.style.opacity='0.22'; active.style.opacity='0';
        var tmp=active; active=hidden; hidden=tmp;
      });
    }
    active.style.backgroundImage='url("'+rnd()+'")';
    active.style.opacity='0.22';
    setInterval(rotate,5000);
  }
})();
