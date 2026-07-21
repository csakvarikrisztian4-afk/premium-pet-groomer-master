# Premium Pet Groomer Master

Reusable, mobile-first static website foundation for Hungarian pet-grooming businesses.

## Branch model

- `main`: reconstructed, deployable baseline.
- `premium-redesign`: design and conversion experiments.

## Customisation

Edit `assets/js/site-config.js` for business identity, contact details, map/review/booking links, opening hours, colours and images. Edit `index.html` when a client needs different services, gallery captions, reviews or FAQs.

## Preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Deployment

Static deployment; no build command is required. Cloudflare Pages can publish the repository root directly.

Before launch, complete `docs/CLIENT-CUSTOMISATION.md`. Never commit credentials, customer data, private spreadsheets, webhook secrets or API keys.
