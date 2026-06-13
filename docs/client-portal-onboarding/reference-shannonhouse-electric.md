# Reference — Shannonhouse Electric (site #2)

| Item | Value |
|------|--------|
| Client name | Shannonhouse Electric |
| Client slug | `shannonhouse-electric` |
| Site slug | `main` |
| Hub siteId | `b8cbc97c-0a15-4cb8-a407-e2209d094985` |
| Hub clientId | `f536eb85-67e1-44aa-b702-08b27d59f2de` |
| Vercel production URL | [https://shannonhouse-electric.vercel.app](https://shannonhouse-electric.vercel.app) |
| Custom domain (pending DNS) | [https://sh-electric.net](https://sh-electric.net) |
| Spoke repo | [github.com/idenitivesx/ShannonHouseElectric](https://github.com/idenitivesx/ShannonHouseElectric) |
| Spoke path (local) | `/Users/iden/Documents/projects/shannonhouse-electric` |
| Host | **Vercel** (`iiden5796-8051s-projects`) — migrated from Netlify June 2026 |
| Netlify | **Removed** (site deleted) |

## Vercel project

| Item | Value |
|------|--------|
| Project | `shannonhouse-electric` |
| Project ID | `prj_C7kjKOtLfdATnbqa0RRpsNW1zPLf` |
| GitHub | `idenitivesx/ShannonHouseElectric` (connected) |
| Deploy hook | `portal-publish-shannonhouse-electric` → stored in hub DB ✓ |

## URLs

| Purpose | URL |
|---------|-----|
| Public settings API | `https://idenworks.com/api/public/sites/shannonhouse-electric/main/settings` |
| Live published.json | `https://shannonhouse-electric.vercel.app/content/published.json` |
| Client portal | `https://idenworks.com/portal` |
| Admin site settings | `https://idenworks.com/admin/sites/b8cbc97c-0a15-4cb8-a407-e2209d094985/settings` |

## Portal login

| Field | Value |
|-------|--------|
| Email | `duane@sh-electric.net` |
| Initial password | `Shannonhouse2026!` (change on first login) |

## Custom domain (sh-electric.net)

Netlify site removed. Point DNS to Vercel:

1. Vercel Dashboard → **shannonhouse-electric** → Settings → Domains
2. Add `sh-electric.net` and `www.sh-electric.net` if not already on this project
3. Update DNS at your registrar per Vercel instructions (usually `A` → `76.76.21.21` or CNAME → `cname.vercel-dns.com`)
4. After DNS propagates, update hub site domain back to `sh-electric.net` in admin

If domain shows "assigned to another project", remove it from the other Vercel project first in the dashboard.

## Verify

```bash
curl -s "https://idenworks.com/api/public/sites/shannonhouse-electric/main/settings" | jq '.settings.phone'
curl -s "https://shannonhouse-electric.vercel.app/content/published.json" | jq '.phone, .source'
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_C7kjKOtLfdATnbqa0RRpsNW1zPLf/v5BjUjG7rG"  # deploy hook test
```

## Spoke files

| File | Purpose |
|------|---------|
| `scripts/sync-portal-content.mjs` | Build-time fetch → `public/content/published.json` |
| `public/content/site-fallback.json` | Committed baseline |
| `public/portal-content.js` | Runtime DOM patching |
| `vercel.json` | Vercel build config |
| `index.html` | `data-portal="..."` hooks |
