
/* GAMEBOY DESKTOP KIT (broken_heaven, admin, sysber, ransomaly, testing_zone...)

   - The palette (4 shades) is chosen by the class of <html>: gb-green | gb-purple | gb-red.
   - Sprites of the interface live in media/BROKEN_HEAVEN/ and are OPTIONAL: while a file does not exist the
     page draws a placeholder with CSS. Draw them in 4 shades of GRAY: an SVG filter (#gbTint) repaints
     them with the palette of the page, so the same sprite works in green, purple and red. */

(function () {
  'use strict';

  var PALETTES = {
    green:  ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
    purple: ['#1a0533', '#4b1d7a', '#9a5fd6', '#e2c6ff'],
    red:    ['#1a0000', '#7a0000', '#ff1414', '#ff9a9a']
  };

  var SPRITES = ['bg', 'overlay', 'folder', 'folder_hover', 'cursor'];
  var SIZES = {
    bg:      ['--bg-size', 'cover'],
    zone_bg: ['--bg-size', 'cover'],
    overlay: ['--ov-size', 'auto']
  };

  function channel(pal, i) {
    return pal.map(function (c) {
      return (parseInt(c.substr(1 + 2 * i, 2), 16) / 255).toFixed(3);
    }).join(' ');
  }

  function tintFilter(pal) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">' +
      '<filter id="gbTint" color-interpolation-filters="sRGB">' +
      '<feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0"/>' +
      '<feComponentTransfer>' +
      '<feFuncR type="table" tableValues="' + channel(pal, 0) + '"/>' +
      '<feFuncG type="table" tableValues="' + channel(pal, 1) + '"/>' +
      '<feFuncB type="table" tableValues="' + channel(pal, 2) + '"/>' +
      '</feComponentTransfer></filter></svg>';
  }

  window.SAMSIDE_GB = {

    init: function (theme, extraSprites) {
      var cl = document.documentElement.classList;
      if (theme) {
        cl.add('gb-' + theme);
      } else {
        theme = 'green';
        Object.keys(PALETTES).forEach(function (t) { if (cl.contains('gb-' + t)) theme = t; });
      }

      var holder = document.createElement('div');
      holder.innerHTML = tintFilter(PALETTES[theme] || PALETTES.green);
      document.body.insertBefore(holder.firstChild, document.body.firstChild);

      SPRITES.concat(extraSprites || []).forEach(function (name) {
        var url = SAMSIDE.url('media/BROKEN_HEAVEN/' + name + '.png');
        var img = new Image();
        img.onload = function () {
          var root = document.documentElement.style;
          root.setProperty('--sp-' + name, 'url("' + url + '")');
          if (SIZES[name]) root.setProperty(SIZES[name][0], SIZES[name][1]);
          if (name === 'cursor') {
            var st = document.createElement('style');
            st.textContent =
              '.gb-stage, .gb-stage * { cursor: url("' + url + '") 0 0, auto; }' +
              '.gb-stage a, .gb-stage button { cursor: url("' + url + '") 0 0, pointer; }';
            document.head.appendChild(st);
          }
        };
        img.src = url;
      });

      var clocks = document.querySelectorAll('[data-gb-clock]');
      function tick() {
        var d = new Date();
        var t = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
        Array.prototype.forEach.call(clocks, function (c) { c.textContent = t; });
      }
      tick();
      setInterval(tick, 10000);
    }
  };
})();
