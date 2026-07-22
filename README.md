# Premium Pet Groomer Master — Premium Redesign

Reusable, mobile-first static website template for Hungarian pet-grooming businesses.

## Configuration

Edit `assets/js/site-config.js` for:

- business identity;
- phone, email and WhatsApp;
- address, Maps and review links;
- booking destination;
- opening hours;
- review score/count;
- brand colours;
- hero, about and gallery images.

The default map intentionally shows a neutral placeholder. Add an exact, verified `mapsSearch` and `mapsEmbed` URL for each real business so the template never displays competing groomers.

## Preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Deployment

Static Cloudflare Pages deployment. No build command is required; publish the repository root.

## Real launch checklist

- Replace all stock photographs with client-owned, permissioned images where possible.
- Replace every review placeholder with a real, permissioned review.
- Enter verified contact details and exact Maps URLs.
- Complete the privacy notice and imprint.
- Test phone, booking, WhatsApp and map links on a real device.
