(function () {
    var N = 7;

    var FLOAT = [
        { ax:3, fx:.52, px:0,   ay:6, fy:.40, py:0   },
        { ax:4, fx:.45, px:1.0, ay:7, fy:.55, py:.8  },
        { ax:2, fx:.60, px:2.1, ay:5, fy:.38, py:1.6 },
        { ax:5, fx:.48, px:.5,  ay:6, fy:.44, py:2.4 },
        { ax:3, fx:.55, px:1.8, ay:7, fy:.50, py:3.2 },
        { ax:4, fx:.42, px:.9,  ay:5, fy:.46, py:4.0 },
        { ax:2, fx:.58, px:1.4, ay:6, fy:.36, py:4.8 }
    ];

    var scene = document.getElementById('cr-scene');
    if (!scene) return;

    var items = [];
    var t = 0;

    function calcPositions() {
        var size = scene.offsetWidth;
        var cx = size / 2, cy = size / 2;
        var r = size * 0.40;
        items = [];
        for (var i = 0; i < N; i++) {
            var el = document.getElementById('cr-' + i);
            if (!el) continue;
            var angle = (2 * Math.PI * i / N) - Math.PI / 2;
            var bx = cx + r * Math.cos(angle);
            var by = cy + r * Math.sin(angle);
            el.style.left = (bx / size * 100) + '%';
            el.style.top  = (by / size * 100) + '%';
            items.push({ el: el, f: FLOAT[i] });
        }
    }

    function tick() {
        t += 0.07;
        items.forEach(function (item) {
            var f = item.f;
            var fx = f.ax * Math.sin(f.fx * t + f.px);
            var fy = f.ay * Math.cos(f.fy * t + f.py);
            item.el.style.transform = 'translate(calc(-50% + ' + fx + 'px), calc(-50% + ' + fy + 'px))';
        });
        requestAnimationFrame(tick);
    }

    function init() {
        calcPositions();
        requestAnimationFrame(tick);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    window.addEventListener('resize', calcPositions);
})();
