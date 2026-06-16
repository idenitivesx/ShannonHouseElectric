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
      projects: (data && Array.isArray(data.projects) ? data.projects : []) || [],
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function applyProjects(projects) {
    var section = document.querySelector("[data-portal-projects-section]");
    var grid = document.querySelector("[data-portal='projects']");
    var placeholder = document.getElementById("jobs-placeholder");
    if (!section || !grid) return;

    if (!Array.isArray(projects) || projects.length === 0) {
      grid.innerHTML = "";
      if (placeholder) placeholder.hidden = false;
      section.hidden = false;
      return;
    }

    if (placeholder) placeholder.hidden = true;

    var sorted = projects.slice().sort(function (a, b) {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    section.hidden = false;
    grid.innerHTML = sorted
      .map(function (project) {
        var before = project.beforePhotos[0];
        var after = project.afterPhotos[0] || before;
        if (!after) return "";

        var meta = [project.serviceType, project.location].filter(Boolean).join(" · ");
        var photosHtml = "";

        if (before && before.src && before.src !== after.src) {
          photosHtml +=
            '<div class="project-photo-pair">' +
            '<figure class="project-photo project-photo-before">' +
            '<img src="' +
            escapeHtml(before.src) +
            '" alt="' +
            escapeHtml(before.alt || "Before") +
            '" loading="lazy">' +
            '<figcaption>Before</figcaption></figure>' +
            '<figure class="project-photo project-photo-after">' +
            '<img src="' +
            escapeHtml(after.src) +
            '" alt="' +
            escapeHtml(after.alt || "After") +
            '" loading="lazy">' +
            '<figcaption>After</figcaption></figure>' +
            "</div>";
        } else {
          photosHtml +=
            '<figure class="project-photo project-photo-single">' +
            '<img src="' +
            escapeHtml(after.src) +
            '" alt="' +
            escapeHtml(after.alt || project.title || "Project photo") +
            '" loading="lazy">' +
            "</figure>";
        }

        return (
          '<article class="project-card">' +
          photosHtml +
          '<div class="project-card-body">' +
          '<h3 class="project-card-title">' +
          escapeHtml(project.title || "Recent project") +
          "</h3>" +
          (meta ? '<p class="project-card-meta">' + escapeHtml(meta) + "</p>" : "") +
          (project.description
            ? '<p class="project-card-desc">' + escapeHtml(project.description) + "</p>"
            : "") +
          (project.testimonial
            ? '<blockquote class="project-card-quote">"' +
              escapeHtml(project.testimonial) +
              '"</blockquote>'
            : "") +
          "</div></article>"
        );
      })
      .filter(Boolean)
      .join("");
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
      if (el.classList.contains("site-brand") || el.classList.contains("footer-brand")) {
        el.textContent = name;
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
      section.hidden = true;
      grid.innerHTML = "";
      return;
    }

    section.hidden = false;
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
    applyProjects(content.projects);

    var addressEl = document.querySelector("[data-portal='address']");
    if (addressEl) addressEl.textContent = content.address;

    var hoursEl = document.querySelector("[data-portal='hours']");
    if (hoursEl) hoursEl.textContent = content.hoursDisplay;

    document.querySelectorAll("[data-portal='phone']").forEach(function (el) {
      el.setAttribute("href", telHref(content.phone));
      if (el.classList.contains("mobile-call-bar")) {
        el.textContent = "Call Duane · " + phone;
        return;
      }
      if (el.classList.contains("hero-phone")) {
        var numberEl = el.querySelector(".hero-phone-number");
        if (numberEl) numberEl.textContent = phone;
        return;
      }
      if (el.classList.contains("estimate-phone")) {
        el.textContent = phone;
        return;
      }
      if (el.classList.contains("nav-call")) {
        el.textContent = "Call Duane";
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
