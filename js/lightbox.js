
(function () {
  var overlay = null, imgEl = null, btnPrev = null, btnNext = null;
  var images = [], idx = 0;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    imgEl = document.createElement('img');
    imgEl.addEventListener('click', close);

    btnPrev = document.createElement('button');
    btnPrev.type = 'button';
    btnPrev.className = 'lightbox-arrow lightbox-arrow--prev';
    btnPrev.setAttribute('aria-label', 'Previous');
    btnPrev.innerHTML = '&#8249;';
    btnPrev.style.display = 'none';

    btnNext = document.createElement('button');
    btnNext.type = 'button';
    btnNext.className = 'lightbox-arrow lightbox-arrow--next';
    btnNext.setAttribute('aria-label', 'Next');
    btnNext.innerHTML = '&#8250;';
    btnNext.style.display = 'none';

    overlay.appendChild(imgEl);
    document.body.appendChild(overlay);
    document.body.appendChild(btnPrev);
    document.body.appendChild(btnNext);

    overlay.addEventListener('click', close);
    btnPrev.addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
    btnNext.addEventListener('click', function (e) { e.stopPropagation(); go(1); });
  }

  function open(list, start) {
    if (!overlay) build();
    images = Array.prototype.slice.call(list);
    idx    = start;
    show();
    document.addEventListener('keydown', onKey);
  }

  function show() {
    var src = images[idx].currentSrc || images[idx].src;
    var tmp = new Image();
    tmp.onload = function () {
      imgEl.src = src;
      imgEl.alt = images[idx].alt || '';
      var multi = images.length > 1;
      btnPrev.style.display = multi ? 'flex' : 'none';
      btnNext.style.display = multi ? 'flex' : 'none';
      btnPrev.disabled = idx === 0;
      btnNext.disabled = idx === images.length - 1;

      overlay.classList.add('is-open');
    };
    tmp.onerror = function () {
      imgEl.src = src;
      overlay.classList.add('is-open');
    };
    tmp.src = src;
  }

  function go(d) {
    var n = idx + d;
    if (n >= 0 && n < images.length) { idx = n; show(); }
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    btnPrev.style.display = 'none';
    btnNext.style.display = 'none';
    document.removeEventListener('keydown', onKey);

    setTimeout(function () {
      if (!overlay.classList.contains('is-open')) {
        imgEl.src = '';
        images = [];
      }
    }, 280);
  }

  function onKey(e) {
    if (e.key === 'ArrowLeft')  go(-1);
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) {
      e.stopPropagation();
      close();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('.img-grid, .img-grid--2col').forEach(function (grid) {
      var imgs = grid.querySelectorAll('img.zoomable');
      imgs.forEach(function (im, i) {
        im.addEventListener('click', function () { open(imgs, i); });
      });
    });
    /* Natural gallery grids — all images zoomable together */
    document.querySelectorAll('.img-grid--natural').forEach(function (grid) {
      var imgs = grid.querySelectorAll('img');
      imgs.forEach(function (im, i) {
        im.style.cursor = 'zoom-in';
        im.addEventListener('click', function () { open(imgs, i); });
      });
    });

    document.querySelectorAll('img.zoomable-solo').forEach(function (im) {
      im.addEventListener('click', function () { open([im], 0); });
    });
    /* Overview image zoomable */
    document.querySelectorAll('.overview-img-col img').forEach(function (im) {
      im.style.cursor = 'zoom-in';
      im.addEventListener('click', function () { open([im], 0); });
    });
    /* Skin previews */
    document.querySelectorAll('.skin-preview-img').forEach(function (im) {
      im.addEventListener('click', function () { open([im], 0); });
    });

  });
})();
