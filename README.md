# Elite Express Logistics Liberia (EEL) - Enterprise PWA Messenger

A clean, production-grade 100% Progressive Web Application (PWA) real-time operational dispatch messenger built for **Elite Express Logistics Liberia (EEL)**.

![EEL PWA Messenger](https://img.shields.io/badge/PWA-100%25-F59E0B?style=for-the-badge&logo=pwa&logoColor=0F172A)
![Brand](https://img.shields.io/badge/Brand-Amber%20Gold%20%26%20Navy%20Blue-0F172A?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Supabase%20%2B%20IndexedDB-1E3A8A?style=for-the-badge&logo=supabase)

---

## 🌟 Features & Highlights

- **Aesthetics & Branding**: Tailored to **Elite Express Logistics Liberia (EEL)** with Navy Blue (`#0F172A`), Amber Gold (`#F59E0B`), and Clean White (`#FFFFFF`).
- **Dynamic Company Logo Manager**: Admin screen contains a dynamic logo upload box (converts images into persistent DataURLs) without hardcoding static images.
- **Dual Real-time Engine**:
  - **Supabase Cloud**: Connect live PostgreSQL tables, Auth, and Storage buckets via Admin System Settings.
  - **Zero-Config PWA / Offline Mode**: Built-in BroadcastChannel & IndexedDB sync enables real-time messaging across browser tabs instantly on GitHub Pages without requiring initial credentials!
- **Real Working Share Pickers**:
  - 📁 **File Picker**: Document upload (PDF, DOCX, XLSX, ZIP), size check, MIME icon formatting, direct file downloads.
  - 📷 **Image Picker**: Cargo photo selection, canvas compressed preview thumbnails, photo captions, and full-screen Lightbox modal viewer.
  - 📍 **Location Sharing**: HTML5 Geolocation API pinpointing latitude/longitude, OpenStreetMap embedded map preview, accuracy metrics, and direct external launch in Google Maps.
- **Executive Admin Portal**:
  - **Workforce Staff Manager**: Register staff, assign roles (Admin, Dispatcher, Driver/Worker), search staff, **Suspend worker**, **Ban worker**, or **Delete worker**.
  - **Group Chat Channel Creator**: Build custom group channels (e.g. *EEL General Operations*, *Monrovia Freeport Dispatch*), select staff members with checkboxes.
  - **System Settings**: Upload custom company logo, edit company tagline, and configure Supabase URL & Anon API keys.
- **100% PWA Compliance**:
  - Full `manifest.json` with app icons, standalone display mode, theme colors.
  - Service Worker (`sw.js`) handling cache-first strategies, offline fallback page (`offline.html`), push notification simulation.
  - In-app **Install App** button responding to native `beforeinstallprompt` browser events.
- **GitHub Pages Ready**:
  - Configured with relative base paths (`base: './'`) in `vite.config.js` so that deploying the `dist` directory or repo to GitHub Pages works 100% out of the box!

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start Vite local server
npm run dev

# 3. Open browser at http://localhost:3000
```

---

## 📦 How to Deploy on GitHub Pages

**Recommended: automatic deployment (this repo includes the workflow already).**

This repo ships with `.github/workflows/deploy.yml`, which builds the app fresh and
publishes it on every push to `main` — no manual `npm run build` or `dist` folder to
keep in sync, ever. One-time setup:

1. Push this repo to GitHub as normal (`git add . && git commit -m "..." && git push`).
2. In your repo on GitHub: **Settings → Pages → Build and deployment → Source**, choose
   **GitHub Actions** (not "Deploy from a branch").
3. That's it. Check the **Actions** tab to watch the build; once it's green, your site is
   live at `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/`. Every future push updates it
   automatically within a minute or two.

**Manual alternative** (only if you'd rather not use Actions):
```bash
npm install
npm run build
npx gh-pages -d dist
```
Remember: with this manual path, the live site only updates when you re-run these
commands after every code change — that's exactly what the Actions workflow above
exists to avoid.

---

## 🗄️ Supabase PostgreSQL Setup (Optional)

Run the following SQL in your Supabase SQL Editor to enable cloud database sync:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Worker',
  department TEXT,
  status TEXT DEFAULT 'Active',
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'text',
  file_data JSONB,
  image_data JSONB,
  location JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent'
);

CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  members TEXT[] DEFAULT '{}',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Then paste your **Supabase URL** and **Anon API Key** into the Admin Portal -> System Settings tab!

---

## 📁 Downloadable Project File

A pre-packaged, complete project `.zip` file is generated in the root directory:
- `eel-pwa-messenger.zip`
