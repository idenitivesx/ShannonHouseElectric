import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const fallbackPath = path.join(root, "public/content/site-fallback.json");
const publishedPath = path.join(root, "public/content/published.json");

const fallback = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));

const enabled = process.env.PORTAL_CONTENT_ENABLED === "true";
const apiBase = (process.env.PORTAL_API_BASE || "https://idenworks.com").replace(/\/$/, "");
const clientSlug = process.env.PORTAL_CLIENT_SLUG || "shannonhouse-electric";
const siteSlug = process.env.PORTAL_SITE_SLUG || "main";

console.log("[portal-content] build sync starting");
console.log("[portal-content] env PORTAL_CONTENT_ENABLED =", JSON.stringify(process.env.PORTAL_CONTENT_ENABLED));
console.log("[portal-content] resolved clientSlug =", clientSlug);
console.log("[portal-content] fallback phone =", fallback.phone);

const DAY_SHORT = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function formatTime(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;
  let hour = Number(match[1]);
  const minutes = match[2];
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minutes} ${period}`;
}

function formatBusinessHours(hours, fallbackDisplay) {
  if (!Array.isArray(hours) || hours.length === 0) return fallbackDisplay;

  const hasTimes = hours.some((entry) => entry.open && entry.close);
  if (hasTimes) {
    return hours
      .map((entry) => {
        const label = DAY_SHORT[entry.day] || entry.day;
        if (entry.closed) return `${label}: Closed`;
        if (entry.open && entry.close) {
          return `${label} ${formatTime(entry.open)} – ${formatTime(entry.close)}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(" · ");
  }

  return fallbackDisplay;
}

function mergeSocialLinks(portal = {}) {
  const base = fallback.socialLinks || {};
  const incoming = portal.socialLinks || {};
  return {
    facebook: incoming.facebook || base.facebook || "",
    instagram: incoming.instagram || base.instagram || "",
    google: incoming.google || base.google || "",
  };
}

function normalizeGalleryItem(item) {
  const alt = item.altText || item.filename || "Project photo";
  const captionParts = alt.split(" — ");
  return {
    id: item.id,
    src: item.publicUrl,
    alt: captionParts[0],
    caption: captionParts.length > 1 ? captionParts.slice(1).join(" — ") : alt,
    sortOrder: item.sortOrder ?? 0,
  };
}

function galleryFromMedia(media = []) {
  return media
    .filter((item) => item.category === "gallery" && item.publicUrl)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(normalizeGalleryItem);
}

function heroFromMedia(media = []) {
  const heroItem = media.find((item) => item.category === "hero" && item.publicUrl);
  if (!heroItem) return null;
  return {
    src: heroItem.publicUrl,
    alt: heroItem.altText || "Hero image",
  };
}

function normalizeProjects(manifest) {
  if (!manifest?.projects?.length) return [];
  return manifest.projects.map((project) => ({
    id: project.id,
    title: project.title || "",
    slug: project.slug || "",
    serviceType: project.serviceType || "",
    location: project.location || "",
    description: project.description || "",
    beforePhotos: Array.isArray(project.beforePhotos) ? project.beforePhotos : [],
    afterPhotos: Array.isArray(project.afterPhotos) ? project.afterPhotos : [],
    completedAt: project.completedAt || null,
    testimonial: project.testimonial || "",
    tags: project.tags || [],
    featured: Boolean(project.featured),
    sortOrder: project.sortOrder ?? 0,
  }));
}

function mergeFields(portal = {}, reviews = [], media = [], manifest = null) {
  const businessHours =
    Array.isArray(portal.businessHours) && portal.businessHours.length
      ? portal.businessHours
      : fallback.businessHours || [];

  const normalizedReviews = Array.isArray(reviews) && reviews.length
    ? reviews.map((review) => ({
        authorName: review.authorName,
        rating: review.rating,
        body: review.body,
        source: review.source || "manual",
        sortOrder: review.sortOrder ?? 0,
      }))
    : fallback.reviews || [];

  const galleryFromManifest = manifest?.gallery?.length ? manifest.gallery : [];
  const galleryFromMediaItems = galleryFromMedia(media);
  const gallery = galleryFromManifest.length
    ? galleryFromManifest
    : galleryFromMediaItems.length
      ? galleryFromMediaItems
      : fallback.gallery || [];

  const projects = manifest?.projects?.length
    ? normalizeProjects(manifest)
    : fallback.projects || [];

  const hero = manifest?.hero || heroFromMedia(media) || fallback.hero || null;

  return {
    businessName: portal.businessName || fallback.businessName,
    phone: portal.phone || fallback.phone,
    email: portal.email || fallback.email,
    logoUrl: portal.logoUrl || fallback.logoUrl || null,
    address: portal.address || fallback.address,
    businessHours,
    hoursDisplay: formatBusinessHours(businessHours, fallback.hoursDisplay),
    socialLinks: mergeSocialLinks(portal),
    seoTitle: portal.seoTitle || fallback.seoTitle,
    seoDescription: portal.seoDescription || fallback.seoDescription,
    serviceAreas: portal.serviceAreas?.length ? portal.serviceAreas : fallback.serviceAreas || [],
    serviceCatalog: portal.serviceCatalog?.length ? portal.serviceCatalog : fallback.serviceCatalog || [],
    homepage: portal.homepage && Object.keys(portal.homepage).length ? portal.homepage : fallback.homepage || {},
    reviews: normalizedReviews,
    gallery,
    projects,
    hero,
    portalApi: {
      base: apiBase,
      clientSlug,
      siteSlug,
    },
    syncedAt: new Date().toISOString(),
    source: "fallback",
  };
}

function writePublished(payload) {
  fs.mkdirSync(path.dirname(publishedPath), { recursive: true });
  fs.writeFileSync(publishedPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    "[portal-content] wrote published.json phone =",
    payload.phone,
    "source =",
    payload.source
  );
}

async function syncFromPortal() {
  const url = `${apiBase}/api/public/sites/${clientSlug}/${siteSlug}/settings`;

  try {
    console.log("[portal-content] fetching", url);
    const response = await fetch(url);
    const responseText = await response.text();
    console.log("[portal-content] response status =", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText.slice(0, 120)}`);
    }

    const payload = JSON.parse(responseText);
    const merged = mergeFields(
      payload.settings || {},
      payload.reviews || [],
      payload.media || [],
      payload.manifest || null,
    );
    merged.source = "portal";
    writePublished(merged);
    console.log(`[portal-content] synced from ${url}`);
  } catch (error) {
    writePublished(mergeFields());
    console.warn(`[portal-content] fetch failed, using fallback: ${error.message}`);
  }
}

async function main() {
  if (!enabled) {
    writePublished(mergeFields());
    console.warn("[portal-content] PORTAL_CONTENT_ENABLED is not true; wrote fallback only");
    return;
  }

  await syncFromPortal();
}

main();
