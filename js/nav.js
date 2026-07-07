
(function () {
  var STORAGE_KEY = "zone405_nav_open";

  function normalize(pathname) {
    return pathname.replace(/\/index\.html$/, "/").replace(/\/+$/, "") || "/";
  }

  function navId(li) {
    var a = li.querySelector(":scope > .nav-row > a");
    return a ? normalize(a.pathname) : "";
  }

  function setToggleState(li, isOpen) {
    li.classList.toggle("is-open", isOpen);
    var btn = li.querySelector(":scope > .nav-row > .nav-toggle");
    if (btn) btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function saveOpenState() {
    var open = [];
    document.querySelectorAll(".main-nav li.has-children.is-open").forEach(function (li) {
      open.push(navId(li));
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch (e) {

    }
  }

  function loadOpenState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var nav = document.querySelector(".main-nav");
    if (!nav) return;

    var current = normalize(location.pathname);

    var allLinks = nav.querySelectorAll("a[href]");
    var selectedLi = null;
    allLinks.forEach(function (a) {
      if (normalize(a.pathname) === current) selectedLi = a.closest("li");
    });

    if (selectedLi) {
      selectedLi.classList.add("is-selected");
      var node = selectedLi.parentElement; // containing <ul>
      while (node) {
        var ancestorLi = node.closest("li.has-children");
        if (!ancestorLi) break;
        setToggleState(ancestorLi, true);
        node = ancestorLi.parentElement;
      }
    }

    var savedOpen = loadOpenState();
    nav.querySelectorAll("li.has-children").forEach(function (li) {
      if (savedOpen.indexOf(navId(li)) !== -1) setToggleState(li, true);
    });

    nav.querySelectorAll(".nav-toggle").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var li = btn.closest("li.has-children");
        setToggleState(li, !li.classList.contains("is-open"));
        saveOpenState();
      });
    });

    var mobileToggle = document.querySelector(".nav-mobile-toggle");
    if (mobileToggle) {
      mobileToggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("is-open");
        mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      nav.querySelectorAll("a[href]").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
        });
      });
    }
  });
})();
