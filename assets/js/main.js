(function () {
  var SITE_LANGUAGE_KEY = "michapps_language";
  var sharedTranslations = {
    es: {
      "nav.home": "Inicio",
      "nav.pcn": "Pañales CN",
      "nav.scn": "Suplementos CN",
      "nav.pequedosis": "PequeDosis",
      "nav.memomed": "MemoMed",
      "nav.centum": "Centum",
      "footer.apps": "Apps",
      "footer.games": "Juegos",
      "footer.support": "Soporte",
      "footer.contact": "Contacto",
      "footer.policy": "Política de privacidad",
      "common.support": "Soporte",
      "common.privacy": "Política de privacidad"
    },
    en: {
      "nav.home": "Home",
      "nav.pcn": "Pañales CN",
      "nav.scn": "Suplementos CN",
      "nav.pequedosis": "PequeDosis",
      "nav.memomed": "MemoMed",
      "nav.centum": "Centum",
      "footer.apps": "Apps",
      "footer.games": "Games",
      "footer.support": "Support",
      "footer.contact": "Contact",
      "footer.policy": "Privacy policy",
      "common.support": "Support",
      "common.privacy": "Privacy policy"
    }
  };

  function getPageTranslations() {
    if (window.pageTranslations && typeof window.pageTranslations === "object") {
      return window.pageTranslations;
    }
    return { es: {}, en: {} };
  }

  function mergeTranslations(base, extra) {
    var result = { es: {}, en: {} };

    ["es", "en"].forEach(function (lang) {
      var baseSet = (base && base[lang]) || {};
      var extraSet = (extra && extra[lang]) || {};
      result[lang] = Object.assign({}, baseSet, extraSet);
    });

    return result;
  }

  function setMetaContent(selector, value) {
    if (!value) {
      return;
    }
    var node = document.querySelector(selector);
    if (node) {
      node.setAttribute("content", value);
    }
  }

  function applyLanguage(translations, lang) {
    var selected = translations[lang] ? lang : "es";
    var dict = translations[selected] || {};

    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      if (dict[key]) {
        node.textContent = dict[key];
      }
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (node) {
      var key = node.getAttribute("data-i18n-html");
      if (dict[key]) {
        node.innerHTML = dict[key];
      }
    });

    document.documentElement.setAttribute("lang", selected);

    if (dict["meta.title"]) {
      document.title = dict["meta.title"];
    }
    setMetaContent("meta[name='description']", dict["meta.description"]);
    setMetaContent("meta[property='og:title']", dict["meta.ogTitle"]);
    setMetaContent("meta[property='og:description']", dict["meta.ogDescription"]);
    setMetaContent("meta[property='og:locale']", dict["meta.ogLocale"]);

    document.querySelectorAll(".lang-flag[data-lang]").forEach(function (button) {
      var isActive = button.getAttribute("data-lang") === selected;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    try {
      localStorage.setItem(SITE_LANGUAGE_KEY, selected);
    } catch (error) {
      return;
    }
  }

  function getInitialLanguage(translations) {
    try {
      var saved = localStorage.getItem(SITE_LANGUAGE_KEY);
      if (saved && translations[saved]) {
        return saved;
      }
    } catch (error) {
      // Ignore storage errors and use fallback.
    }

    if (navigator.language && navigator.language.toLowerCase().indexOf("en") === 0 && translations.en) {
      return "en";
    }

    return "es";
  }

  function wireLanguageSelector() {
    var hasTranslatableNodes = document.querySelector("[data-i18n], [data-i18n-html]");
    var hasLanguageButtons = document.querySelector(".lang-flag[data-lang]");

    if (!hasTranslatableNodes && !hasLanguageButtons) {
      return;
    }

    var translations = mergeTranslations(sharedTranslations, getPageTranslations());
    var initialLanguage = getInitialLanguage(translations);

    document.querySelectorAll(".lang-flag[data-lang]").forEach(function (button) {
      button.addEventListener("click", function () {
        applyLanguage(translations, button.getAttribute("data-lang"));
      });
    });

    applyLanguage(translations, initialLanguage);
  }

  function buildSvgDataUri(initials) {
    var safeInitials = (initials || "MA").slice(0, 2).toUpperCase();
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="' +
      safeInitials +
      '"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e92a2"/><stop offset="100%" stop-color="#0f766e"/></linearGradient></defs><rect width="160" height="160" rx="80" fill="url(%23g)"/><text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Open Sans, Arial, sans-serif" font-size="52" font-weight="700">' +
      safeInitials +
      "</text></svg>";

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function applyFallback(img) {
    if (!img) {
      return;
    }

    var fallbackSrc = img.getAttribute("data-fallback");
    var fallbackState = img.dataset.fallbackState || "0";

    if (fallbackState !== "2" && fallbackSrc && fallbackState === "0") {
      try {
        if (img.src !== new URL(fallbackSrc, window.location.href).href) {
          img.dataset.fallbackState = "1";
          img.src = fallbackSrc;
          return;
        }
      } catch (error) {
        img.dataset.fallbackState = "1";
        img.src = fallbackSrc;
        return;
      }
    }

    if (fallbackState === "2") {
      return;
    }

    var initials = img.getAttribute("data-initials") || "MA";
    img.dataset.fallbackState = "2";
    img.src = buildSvgDataUri(initials);
  }

  function wireImageFallbacks() {
    var images = document.querySelectorAll("img[data-fallback], img[data-initials]");
    images.forEach(function (img) {
      img.addEventListener("error", function () {
        applyFallback(img);
      });

      if (!img.getAttribute("alt")) {
        img.setAttribute("alt", "Icono de aplicación");
      }

      if (img.complete && img.naturalWidth === 0) {
        applyFallback(img);
      }
    });
  }

  function updateYears() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll("[data-current-year]").forEach(function (node) {
      node.textContent = year;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      wireImageFallbacks();
      updateYears();
      wireLanguageSelector();
    });
  } else {
    wireImageFallbacks();
    updateYears();
    wireLanguageSelector();
  }
})();
