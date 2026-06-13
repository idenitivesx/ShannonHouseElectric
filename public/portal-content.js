(function () {
  var LOCAL_LOGO = "/logo.jpg";

  var FALLBACK = {
    businessName: "Shannonhouse Electric",
    phone: "724-654-8890",
    email: "duane@sh-electric.net",
    logoUrl: null,
    address: "Youngstown, OH & Lawrence County, PA",
    businessHours: [],
    hoursDisplay: "Mon–Fri 8am–5pm · Sat 9am–1pm · Emergency 24/7",
    socialLinks: { facebook: "", instagram: "", google: "" },
    seoTitle: "Shannonhouse Electric | Youngstown, OH & Lawrence County, PA",
    seoDescription:
      "Shannonhouse Electric serves Youngstown, OH and surrounding areas, plus Lawrence County, PA. Residential and emergency electrical services. Call (724) 654-8890.",
    reviews: [],
  };

  function digits(phone) {
    return String(phone).replace(/\D/g, "");
  }

  function displayPhone(phone) {
    var normalized = digits(phone);
    if (normalized.length === 10) {
      return (
        "(" +
        normalized.slice(0, 3) +
        ") " +
        normalized.slice(3, 6) +
        "-" +
        normalized.slice(6)
      );
    }
    return phone;
  }

  function telHref(phone) {
    return "tel:" + digits(phone);
  }

  function mergeContent(data) {
    return {
      businessName: (data && data.businessName) || FALLBACK.businessName,
      phone: (data && data.phone) || FALLBACK.phone,
      email: (data && data.email) || FALLBACK.email,
      logoUrl: (data && data.logoUrl) || FALLBACK.logoUrl || null,
      address: (data && data.address) || FALLBACK.address,
      hoursDisplay: (data && data.hoursDisplay) || FALLBACK.hoursDisplay,
      socialLinks: (data && data.socialLinks) || FALLBACK.socialLinks,
      seoTitle: (data && data.seoTitle) || FALLBACK.seoTitle,
      seoDescription: (data && data.seoDescription) || FALLBACK.seoDescription,
      reviews: (data && Array.isArray(data.reviews) ? data.reviews : FALLBACK.reviews) || [],
    };
  }

  function applyBusinessName(name) {
    document.querySelectorAll("[data-portal='businessName']").forEach(function (el) {
      if (el.classList.contains("brand-name")) {
        var parts = name.trim().split(/\s+/);
        var main = (parts[0] || "Shannonhouse").toUpperCase();
        var accent = (parts.slice(1).join(" ") || "Electric").toUpperCase();
        el.innerHTML = main + ' <span class="brand-accent">' + accent + "</span>";
        return;
      }
      if (el.tagName === "IMG") {
        el.setAttribute("alt", name + " Logo");
        return;
      }
      el.textContent = name;
    });
  }

  function applySeo(content) {
    var titleEl = document.querySelector("title[data-portal='seoTitle']");
    if (titleEl) titleEl.textContent = content.seoTitle;

    var metaDesc = document.querySelector("meta[name='description'][data-portal='seoDescription']");
    if (metaDesc) metaDesc.setAttribute("content", content.seoDescription);
  }

  function applyLogo(logoUrl) {
    var src = logoUrl || LOCAL_LOGO;
    document.querySelectorAll(".logo-img, .logo-display").forEach(function (img) {
      img.onerror = function () {
        this.onerror = null;
        this.src = LOCAL_LOGO;
      };
      img.src = src;
    });

    var favicon = document.querySelector("link[data-portal='logo']");
    if (favicon) favicon.href = src;
  }

  function renderStars(rating) {
    var count = Math.max(0, Math.min(5, Number(rating) || 0));
    var stars = "";
    for (var i = 0; i < 5; i += 1) {
      stars += i < count ? "★" : "☆";
    }
    return stars;
  }

  function applyReviews(reviews) {
    var section = document.querySelector("[data-portal-reviews-section]");
    var grid = document.querySelector("[data-portal='reviews']");
    if (!section || !grid) return;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      section.querySelector(".reviews-empty")?.removeAttribute("hidden");
      grid.innerHTML = "";
      return;
    }

    var empty = section.querySelector(".reviews-empty");
    if (empty) empty.hidden = true;

    grid.innerHTML = reviews
      .map(function (review) {
        return (
          '<article class="review-card">' +
          '<div class="review-stars" aria-label="' +
          review.rating +
          ' out of 5 stars">' +
          renderStars(review.rating) +
          "</div>" +
          '<p class="review-body">' +
          (review.body || "") +
          "</p>" +
          '<p class="review-author">' +
          (review.authorName || "Customer") +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function applyContent(content, loadSource) {
    var phone = displayPhone(content.phone);
    var email = content.email;

    console.log("[portal-content] applyContent", {
      loadSource: loadSource,
      phone: content.phone,
      displayPhone: phone,
    });

    applySeo(content);
    applyLogo(content.logoUrl);
    applyBusinessName(content.businessName);
    applyReviews(content.reviews);

    var addressEl = document.querySelector("[data-portal='address']");
    if (addressEl) addressEl.textContent = content.address;

    var hoursEl = document.querySelector("[data-portal='hours']");
    if (hoursEl) hoursEl.textContent = content.hoursDisplay;

    document.querySelectorAll("[data-portal='phone']").forEach(function (el) {
      el.setAttribute("href", telHref(content.phone));
      if (el.classList.contains("mobile-call-bar")) {
        el.innerHTML =
          '<i class="fa-solid fa-phone fa-icon fa-icon-sm" aria-hidden="true"></i> Call ' + phone;
        return;
      }
      if (el.tagName === "A" && el.textContent.trim().match(/\d/)) {
        el.textContent = phone;
      }
    });

    document.querySelectorAll("[data-portal='email']").forEach(function (el) {
      el.setAttribute("href", "mailto:" + email);
      if (el.textContent.includes("@")) {
        el.textContent = email;
      }
    });
  }

  function loadAndApply() {
    fetch("/content/published.json")
      .then(function (response) {
        if (!response.ok) throw new Error("published.json unavailable");
        return response.json();
      })
      .then(function (data) {
        applyContent(mergeContent(data), data.source || "published.json");
      })
      .catch(function (error) {
        console.warn("[portal-content] using embedded fallback", error);
        applyContent(mergeContent(FALLBACK), "embedded-fallback");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAndApply);
  } else {
    loadAndApply();
  }
})();
