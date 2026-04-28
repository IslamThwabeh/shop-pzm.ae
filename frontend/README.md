# PZM Computers & Phones Store Frontend

Professional React frontend for the PZM Computers & Phones Store built with Vite, TypeScript, and TailwindCSS.

## 🚀 Quick Start

### Staging (preferred workflow)

```bash
npm install
npm run build:staging
npm run deploy:staging
```

The app is published to Cloudflare Pages at `https://test.pzm.ae`.

> Note: Cloudflare Pages' CLI does not accept `--env` for Pages deploys. Use `--branch <branch-name>` when using `wrangler pages deploy`. This project deploys staging with `--branch staging` and production with `--branch main`.

### Production Build

```bash
npm run build
npm run preview
```

### Deploy to Cloudflare Pages

```bash
npm run deploy
```

## 📁 Project Structure

```
src/
├── main.tsx           # Entry point
├── App.tsx            # Main component
├── App.css            # App styles
├── index.css          # Global styles
├── components/        # Reusable components
├── context/           # React context (Cart, Auth)
├── pages/             # Page components
└── services/          # API client
```

## 🔧 Configuration

- **Vite**: Fast build tool
- **React 18**: UI framework
- **TypeScript**: Type safety
- **TailwindCSS**: Utility-first CSS
- **Axios**: HTTP client
- **react-router-dom**: Client-side routing (install with `npm install react-router-dom`)

### Favicons
The site uses a local favicon at `/favicon.png` (place the image at `frontend/public/favicon.png`). If you prefer to serve the favicon from R2 instead, you can keep the R2 URL (`https://r2.pzm.ae/favicon/mini_logo.png`) and update `index.html` accordingly.

## 📝 Environment Variables

Create `.env.production` for production:
```env
VITE_SITE_URL=https://pzm.ae
VITE_API_BASE_URL=https://pzm.ae/api
VITE_GOOGLE_ADS_ID=AW-16481610525

# Optional: set these only after creating the matching Google Ads conversions
VITE_GOOGLE_ADS_BEGIN_CHECKOUT_LABEL=
VITE_GOOGLE_ADS_PURCHASE_LABEL=
VITE_GOOGLE_ADS_PHONE_LABEL=
VITE_GOOGLE_ADS_WHATSAPP_LABEL=
VITE_GOOGLE_ADS_WHATSAPP_PRODUCT_LABEL=
VITE_GOOGLE_ADS_WHATSAPP_SERVICE_LABEL=
VITE_GOOGLE_ADS_WHATSAPP_APPOINTMENT_LABEL=
```

Create `.env.staging` for staging:
```env
VITE_SITE_URL=https://test.pzm.ae
VITE_API_BASE_URL=https://test.pzm.ae/api
VITE_GOOGLE_ADS_ID=AW-16481610525
```

> Note: Local development instructions were removed; use the staging workflow to publish and test changes.

The frontend now emits these analytics events at the owning interaction points:
- `add_to_cart` from the shared cart context
- `begin_checkout` when checkout opens with cart items
- `purchase` on order confirmation
- `generate_lead` for WhatsApp lead flows
- `contact` for direct phone links

Google Ads conversion snippets fire only when the corresponding `VITE_GOOGLE_ADS_*_LABEL` value is configured.
## 🚢 Deployment

Deploy to Cloudflare Pages:
```bash
npm run deploy
```

This will:
1. Build the frontend
2. Deploy to Cloudflare Pages
3. Make it available at your Pages domain

## 📚 Learn More

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Cloudflare Pages](https://pages.cloudflare.com)
