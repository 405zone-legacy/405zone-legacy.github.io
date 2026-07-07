
(function () {
  var MEDIA_BASE = "media/NEWS";

  var EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

  function tryExtensions(img, year, index, extIndex) {
    if (extIndex >= EXTENSIONS.length) {
      img.style.display = "none";
      return;
    }
    var ext = EXTENSIONS[extIndex];
    img.onerror = function () {
      tryExtensions(img, year, index, extIndex + 1);
    };
    img.src = MEDIA_BASE + "/" + year + "/N" + index + "." + ext;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".news-year").forEach(function (yearSection) {
      var year = yearSection.dataset.year;
      var images = yearSection.querySelectorAll(".js-news-img");
      var total = images.length;

      images.forEach(function (img, i) {
        var index = total - i;
        tryExtensions(img, year, index, 0);
      });
    });
  });
})();
