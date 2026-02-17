(function () {
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
    });
  } else {
    wireImageFallbacks();
    updateYears();
  }
})();
