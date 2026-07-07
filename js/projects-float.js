(function () {
  'use strict';

  var ITEMS = [
    { id:'pf-header-pl',   ax:2.4, fx:.26, px:0,   ay:3.4, fy:.21, py:0,   rotAmp:4, rotF:.18, rotP:0   },
    { id:'pf-header-rs',   ax:2.2, fx:.23, px:1.3, ay:3.2, fy:.25, py:1.0, rotAmp:4, rotF:.16, rotP:1.4 },
    { id:'pf-card-pl-og',  ax:2.0, fx:.30, px:.4,  ay:2.8, fy:.20, py:1.8, hover:true },
    { id:'pf-card-pl-eoc', ax:2.2, fx:.25, px:1.7, ay:3.0, fy:.23, py:2.6, hover:true },
    { id:'pf-card-rn',     ax:1.8, fx:.28, px:2.4, ay:2.6, fy:.27, py:3.4, hover:true },
    { id:'pf-card-rm',     ax:2.4, fx:.21, px:.9,  ay:3.2, fy:.18, py:4.2, hover:true }
  ];

  var items = ITEMS.map(function (c) {
    var el = document.getElementById(c.id);
    return el ? { el: el, c: c } : null;
  }).filter(Boolean);

  if (!items.length) return;

  var t = 0;

  function tick() {
    if (window.innerWidth > 560) {
      t += 0.035;
      items.forEach(function (item) {
        var c = item.c;
        var x = c.ax * Math.sin(c.fx * t + c.px);
        var y = c.ay * Math.cos(c.fy * t + c.py);
        var scale = (c.hover && item.el.matches(':hover')) ? 1.07 : 1;
        var transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
        if (c.rotAmp) {
          var rot = c.rotAmp * Math.sin(c.rotF * t + c.rotP);
          transform += ' rotate(' + rot + 'deg)';
        }
        item.el.style.transform = transform;
      });
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();