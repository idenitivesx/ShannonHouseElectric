# Reference — Shannonhouse Electric (site #2)

| Item | Value |
|------|--------|
| Client name | Shannonhouse Electric |
| Client slug | `shannonhouse-electric` |
| Site slug | `main` |
| Hub siteId | `b8cbc97c-0a15-4cb8-a407-e2209d094985` |
| Hub clientId | `f536eb85-67e1-44aa-b702-08b27d59f2de` |
| Live domain | [https://sh-electric.net](https://sh-electric.net) |
| Spoke repo | [github.com/idenitivesx/ShannonHouseElectric](https://github.com/idenitivesx/ShannonHouseElectric) |
| Spoke path (local) | `/Users/iden/Documents/projects/shannonhouse-electric` |
| Host | **Vercel** (iiden5796 team) — migrated from Netlify |

## URLs

| Purpose | URL |
|---------|-----|
| Public settings API | `https://idenworks.com/api/public/sites/shannonhouse-electric/main/settings` |
| Live published.json | `https://sh-electric.net/content/published.json` (after deploy) |
| Client portal | `https://idenworks.com/portal` |
| Admin site settings | `https://idenworks.com/admin/sites/b8cbc97c-0a15-4cb8-a407-e2209d094985/settings` |

## Portal login

| Field | Value |
|-------|--------|
| Email | `duane@sh-electric.net` |
| Initial password | `Shannonhouse2026!` (change on first login) |

## Env vars (Vercel Production)

Set in Vercel → Project → Settings → Environment Variables (backup; also embedded in `package.json` build):

```
PORTAL_CONTENT_ENABLED=true
PORTAL_API_BASE=https://idenworks.com
PORTAL_CLIENT_SLUG=shannonhouse-electric
PORTAL_SITE_SLUG=main
```

## Deploy hook (Vercel)

1. Vercel → **Project → Settings → Git → Deploy Hooks**
2. Create hook: name `portal-publish-shannonhouse-electric`, branch `main`
3. Copy URL (`https://api.vercel.com/v1/integrations/deploy/prj_.../...`)
4. Store in hub:

```bash
cd idenlabsio
node --env-file=.env --import tsx scripts/set-site-deploy-hook.ts \
  shannonhouse-electric main "https://api.vercel.com/v1/integrations/deploy/..."
```

Hub deploy status polling works with Vercel hooks (same as Kee Kleaned It).

## Hub setup script

```bash
cd idenlabsio
node --env-file=.env --import tsx scripts/setup-shannonhouse-pilot.ts https://idenworks.com
```

## Verify

```bash
# Hub API
curl -s "https://idenworks.com/api/public/sites/shannonhouse-electric/main/settings" | jq '.settings.phone'

# Local sync
cd shannonhouse-electric
PORTAL_CONTENT_ENABLED=true npm run sync
grep source public/content/published.json

# After Vercel deploy
curl -s "https://sh-electric.net/content/published.json" | jq '.phone, .source'
```

## Spoke files (pattern from Kee)

| File | Purpose |
|------|---------|
| `scripts/sync-portal-content.mjs` | Build-time fetch → `public/content/published.json` |
| `public/content/site-fallback.json` | Committed baseline |
| `public/portal-content.js` | Runtime DOM patching |
| `index.html` | `data-portal="..."` hooks |

Vite copies `public/` to `dist/` at build time.
