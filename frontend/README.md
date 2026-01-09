# PZM iPhone Store Frontend

Professional React frontend for the PZM iPhone Store built with Vite, TypeScript, and TailwindCSS.

## 🚀 Quick Start

### Staging (preferred workflow)

```bash
npm install
npm run build:staging
npm run deploy:staging
```

The app is published to Cloudflare Pages at `https://test.pzm.ae`.

> Note: Cloudflare Pages' CLI does not accept `--env` for Pages deploys. Use `--branch <branch-name>` when using `wrangler pages deploy` (the `deploy:staging` and `deploy:production` scripts use `--branch`).

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

### Favicons
The site uses a local favicon at `/favicon.png` (place the image at `frontend/public/favicon.png`). If you prefer to serve the favicon from R2 instead, you can keep the R2 URL (`https://r2.pzm.ae/favicon/mini_logo.png`) and update `index.html` accordingly.

## 📝 Environment Variables

Create `.env.production` for production:
```env
VITE_API_URL=https://api.pzm.ae
```

Create `.env.staging` for staging:
```env
VITE_API_URL=https://test.pzm.ae/api
```

> Note: Local development instructions were removed; use the staging workflow to publish and test changes.
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
