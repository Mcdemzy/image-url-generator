# Image URL Generator

Drop images (or videos), get back hosted Cloudinary URLs. Built for the specific workflow of *"I need a shareable image link right now"* — without touching a backend, a folder, or a deploy.

<img width="1893" height="932" alt="image" src="https://github.com/user-attachments/assets/c178329b-5da8-42be-9aed-4982b2bce244" />


## What it does

- Drag & drop (or click to browse) images and videos
- Uploads them straight to your Cloudinary account via an **unsigned upload preset** — no backend, no API secret, no server
- Returns a copyable URL per file, plus a **Copy all** button
- Copy as **Plain** text, **Markdown**, or **HTML**
- Optional upload folder — type `galleries/wedding-2026` and every file in that batch lands there in Cloudinary
- Guard rails: 10 MB per image, 100 MB per video, 20 files at a time
- Uploads persist across refreshes (`localStorage`), retry failed uploads with one click

## Why

I build a lot of small sites, and I kept running into the same two annoyances:

1. Committing image folders into repos, then deploying them, then swapping a picture and re-deploying just for that
2. Opening the Cloudinary dashboard, uploading one file, clicking through, copying the URL, closing the tab — every single time

This is the 20-second version of that. Drop file, get link, paste. For big galleries especially, "Copy all as HTML" straight into a project and move on.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Cloudinary (unsigned uploads — no SDK, raw `XMLHttpRequest` so we get real upload progress)
- No backend. No server. No database. Just the browser talking to Cloudinary.

## Setup

You'll need a free [Cloudinary](https://cloudinary.com) account. The free tier is generous enough for personal use.

### 1. Create an unsigned upload preset

In your Cloudinary dashboard:

- Go to **Settings → Upload → Add upload preset**
- Set **Signing Mode** to **Unsigned** ← this is the important one
- Give it a name (e.g. `image-url-preset`)
- Save

Optional but recommended:

- **Unique filename:** on (prevents same-name collisions)
- **Use filename as display name:** on (so files are findable in your Media Library)

Do **not** enable "Overwrite assets with the same public ID" unless you know exactly why you want it.

### 2. Clone and install

```bash
git clone https://github.com/Mcdemzy/image-url-generator.git
cd image-url-generator
npm install
```

### 3. Add your credentials

Create a `.env` file in the project root:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=image-url-preset
```

You can find your cloud name at the top of the Cloudinary dashboard, next to "Cloud name" in your product environment panel. It is not a secret — unsigned uploads are designed to be called from the browser.

### 4. Run it

```bash
npm run dev
```

Open the URL Vite prints, drop a file, and it should upload.

## Deploying it

It's a static site after `npm run build` — Netlify, Vercel, Cloudflare Pages, GitHub Pages, whatever. Add the two env vars in the host's dashboard and you're done.

> **Warning:** if you deploy this publicly, anyone can upload to your Cloudinary account using your preset. Either keep it local, keep it behind auth, or set up a restricted preset with size limits. This repo is meant to be cloned, not hosted as a service.

## How it works

The whole upload path is ~80 lines in `src/lib/cloudinary.ts`:

1. `FormData` with the file and the upload preset name
2. `XMLHttpRequest` POST to `https://api.cloudinary.com/v1_1/<cloud>/image/upload` (or `/video/upload` for videos)
3. Listen to `upload.onprogress` for a real progress bar
4. Parse `secure_url` from the JSON response

No backend, no SDK, no CORS proxy. Cloudinary accepts unsigned uploads from the browser directly.

## Project structure

```text
src/
  components/
    DropZone.tsx        # drag & drop + file picker
    QueueItemRow.tsx    # one upload row (progress, URL, copy, retry)
    FolderInput.tsx     # optional upload folder
    OutputBar.tsx       # sticky "Copy all" bar with format toggle
    Toasts.tsx          # error / info notifications
  lib/
    cloudinary.ts       # the actual upload
    constants.ts        # limits, byte formatter
    storage.ts          # localStorage persistence
  types.ts
  App.tsx
```

## Alternatives

If you want a hosted version and don't care about running your own: [Cloudinary's own Upload Widget](https://cloudinary.com/documentation/upload_widget) does most of this out of the box. I built this because I wanted the URL-in-a-textarea flow, copy-all-as-markdown, and per-batch folders — which the widget doesn't do as cleanly.
