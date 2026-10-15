# Engineering Brain Bank

**KB4GESA / Korle Boye** · Learn • Share • Succeed

One-stop platform for engineering students to find and share course slides, lecture notes, past questions, and peer materials.

## Live site

**https://remmy1-ai.github.io/engineering-brain-bank/**

Owner admin: **https://remmy1-ai.github.io/engineering-brain-bank/admin.html**

Repository: https://github.com/Remmy1-AI/engineering-brain-bank

## Pages

| Page | Path |
|------|------|
| Home | `index.html` |
| Courses | `courses.html` |
| Course detail | `course.html?id=` |
| Resources / Ask the Brain Bank | `resources.html` |
| Upload (request) | `upload.html` |
| About | `about.html` |
| Owner Admin | `admin.html` |

## Stack

Static HTML / CSS / vanilla JS on GitHub Pages. Relative asset paths (`./css/...`) for base `/engineering-brain-bank/`.

Backend (optional until configured): **Supabase** Auth + Postgres + Storage. The front end uses only the **anon key** + user session. Never commit the `service_role` key.

## Brand

- Near-black background, white text, gold `#FFB800`
- Crest logo · blueprint hero · gold swoosh title accent
- Tagline: Learn • Share • Succeed
- Closing: From Korle Boye, For Korle Boye.

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Supabase setup (owner)

Do this once so Admin uploads, live materials, visit/download/share stats work.

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is fine).
2. Open **SQL Editor** → New query → paste the full contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.  
   This creates `materials`, `page_views`, RPCs (`increment_download`, `increment_share`, `record_page_view`, `admin_stats`), RLS policies, and the public `materials` storage bucket.
3. **Authentication → Users → Add user**  
   Create the owner account with email + password (this is who signs in at `/admin.html`).
4. **Project Settings → API**  
   Copy **Project URL** and the **anon public** key (not `service_role`).
5. Edit [`js/supabase-config.js`](js/supabase-config.js):

   ```js
   window.EBB_SUPABASE = {
     url: "https://YOUR_PROJECT_REF.supabase.co",
     anonKey: "YOUR_ANON_PUBLIC_KEY",
   };
   ```

6. Commit and push to `main` (or edit the file on GitHub). After Pages rebuilds, open `/admin.html`, sign in, and upload materials.

### Allowed uploads (Admin)

PDF, PPT/PPTX, DOC/DOCX, TXT, MD, plus common images/video (MP4) for admin uploads. The bulk course library is **not** stored in Supabase Storage.

### Hybrid file hosting (catalog in Supabase)

- **Supabase** = materials **catalog** (metadata, publish flag, download/share counts).
- **GitHub** `materials/` = file warehouse via  
  `https://raw.githubusercontent.com/Remmy1-AI/engineering-brain-bank/main/{path}`
- The repo must be **public** so students can watch/download without logging into GitHub.
- UI stays on Engineering Brain Bank: in-page **Watch** (video/PDF/image modal) + **Download** (blob save). No Drive redirects.

Re-seed catalog (owner machine; secrets in `~/.config/ebb/supabase.env`, not in repo):

```bash
python3 scripts/seed_github_materials.py
```

Schema patch: [`supabase/schema_github_hybrid.sql`](supabase/schema_github_hybrid.sql).

### Public Storage URLs (optional admin uploads)

`{SUPABASE_URL}/storage/v1/object/public/materials/{file_path}`

Metadata visibility is gated by RLS on the `materials` table (`published = true` for anon).
