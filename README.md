# Cécile Mackowiak — site artiste peintre

Site de vente de tableaux originaux (Next.js 15, Supabase, Stripe, Sendcloud).

## Développement local

```bash
npm install
cp .env.example .env
npm run dev
```

## Tests

```bash
npm test
npm run build
```

## Production (VPS Hostinger + Traefik)

URL : https://cecile-mackowiak.srv962831.hstgr.cloud

Déploiement via MCP Hostinger `VPS_createNewProjectV1` avec le repo GitHub et les variables d'environnement (voir `.env.example`).

Après déploiement, configurer les webhooks :

- Stripe : `https://cecile-mackowiak.srv962831.hstgr.cloud/api/webhooks/stripe`
- Sendcloud : `https://cecile-mackowiak.srv962831.hstgr.cloud/api/webhooks/sendcloud`
