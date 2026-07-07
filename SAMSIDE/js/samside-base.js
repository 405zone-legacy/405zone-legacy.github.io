
(function () {
  'use strict';

  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey) e.preventDefault();               // pinch-zoom via trackpad/ctrl+wheel
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    // Blocks keyboard zoom (Ctrl/Cmd + '+' '-' '0') and scroll via arrow keys/space
    var zoomKeys = ['+', '-', '=', '0'];
    if ((e.ctrlKey || e.metaKey) && zoomKeys.indexOf(e.key) !== -1) e.preventDefault();
  }, { passive: false });

  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  window.SAMSIDE = {

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

    redirectAfter: function (ms, href) {
      href = href || SAMSIDE.rootHref('index.html');
      setTimeout(function () { window.location.href = href; }, ms);
    },

    rootHref: function (path) {
      return '../../' + path;
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
