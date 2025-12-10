# PZM iPhone Store Frontend

Professional React frontend for the PZM iPhone Store built with Vite, TypeScript, and TailwindCSS.

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

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

## 📝 Environment Variables

Create `.env.production` for production:
```env
VITE_API_URL=https://api.pzm.ae
```

Create `.env.development` for development:
```env
VITE_API_URL=http://localhost:8787
```

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
