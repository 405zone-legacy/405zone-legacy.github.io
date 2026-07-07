
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".skin-selector").forEach(function (selector) {
      var thumbs = selector.querySelectorAll(".skin-thumb");
      var previewImg = selector.querySelector(".skin-preview-img");
      var previewName = selector.querySelector(".skin-preview-name");
      var previewDesc = selector.querySelector(".skin-preview-desc");

      thumbs.forEach(function (thumb) {
        thumb.addEventListener("click", function () {
          thumbs.forEach(function (t) { t.classList.remove("is-active"); });
          thumb.classList.add("is-active");

          if (previewImg) {
            previewImg.src = thumb.dataset.img;
            previewImg.alt = thumb.dataset.name || "";
          }
          if (previewName) previewName.textContent = thumb.dataset.name || "";
          if (previewDesc) previewDesc.textContent = thumb.dataset.desc || "";
        });
      });
    });
  });
})();
