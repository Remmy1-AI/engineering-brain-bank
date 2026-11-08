# KB'S BRAIN BANK

**ENGINEER WITH KB** · Learn • Share • Succeed

One-stop platform for engineering students to find and share course slides, lecture notes, past questions, and peer materials.

## Live site

**https://boye.study**

Owner admin: **https://admin.boye.study** (also redirects from `https://boye.study/admin`)

Student uploads: **https://forms.boye.study** (also redirects from `https://boye.study/upload`)

Repository: https://github.com/Remmy1-AI/engineering-brain-bank

## Pages

| Page | Path |
|------|------|
| Home | `index.html` |
| Courses | `courses.html` |
| Course detail | `course.html?id=` |
| Resources / Ask the Brain Bank | `resources.html` |
| Student upload | `https://forms.boye.study` (`forms.html`) |
| About | `about.html` |
| Owner Admin | `https://admin.boye.study` (`admin.html`) |

## Stack

Static HTML / CSS / vanilla JS on **Vercel** (`boye.study`).

- **Supabase** — Auth (Admin), Postgres catalog, programmes  
- **GitHub** `materials/` — existing library files (unchanged)  
- **Cloudflare R2** — new Admin + forms uploads (`source=r2`)

## Brand

- Near-black background, white text, gold `#FFB800`
- Crest logo · blueprint hero · gold swoosh title accent
- Tagline: Learn • Share • Succeed
- Closing: From him, FOR GESA.

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
   Create the owner account with email + password (this is who signs in at `https://admin.boye.study`).
4. **Project Settings → API**  
   Copy **Project URL** and the **anon public** key (not `service_role`).
5. Edit [`js/supabase-config.js`](js/supabase-config.js):

   ```js
   window.EBB_SUPABASE = {
     url: "https://YOUR_PROJECT_REF.supabase.co",
     anonKey: "YOUR_ANON_PUBLIC_KEY",
   };
   ```

6. Commit and push to `main` (or edit the file on GitHub). After deploy, open `https://admin.boye.study`, sign in, and upload materials.
7. **Programmes (departments)** — in SQL Editor, run [`supabase/schema_programmes.sql`](supabase/schema_programmes.sql).  
   This creates the `programmes` table (seeded with Civil…Materials…etc.). After that, Admin → **Programmes** can add new ones (e.g. a missing faculty programme).
8. **Student inbox (forms.boye.study)** — in SQL Editor, run [`supabase/schema_forms_inbox.sql`](supabase/schema_forms_inbox.sql).  
   This lets anonymous visitors insert **unpublished** catalog rows for review. File bytes go to R2 when configured.
9. **R2 source allow-list** — run [`supabase/schema_r2_source.sql`](supabase/schema_r2_source.sql) so `materials.source` may be `r2`.

### Cloudflare R2 setup (new uploads)

Existing GitHub library files stay on GitHub. **New** Admin / forms uploads go to R2.

1. Cloudflare dashboard → **R2** → Create bucket (e.g. `ebb-materials`).
2. Enable **Public access** (R2.dev subdomain or custom domain like `files.boye.study`).
3. **Manage R2 API Tokens** → Create token with Object Read & Write on that bucket.  
   Copy **Access Key ID**, **Secret Access Key**, and note your **Account ID**.
4. Bucket **Settings → CORS** — allow `PUT`/`GET`/`HEAD` from `https://boye.study`, `https://admin.boye.study`, `https://forms.boye.study`.
5. In **Vercel → Project → Settings → Environment Variables** (Production), add:

   | Name | Value |
   |---|---|
   | `R2_ACCOUNT_ID` | Cloudflare account id |
   | `R2_ACCESS_KEY_ID` | R2 token access key |
   | `R2_SECRET_ACCESS_KEY` | R2 token secret |
   | `R2_BUCKET_NAME` | bucket name |
   | `R2_PUBLIC_BASE_URL` | public base, e.g. `https://pub-….r2.dev` |

6. Set the same public base in [`js/supabase-config.js`](js/supabase-config.js) as `EBB_FILES.r2PublicBase` (optional if every row stores `download_url`).
7. Redeploy. Admin + forms uploads will use `/api/r2-presign` → R2. Until env is set, uploads fall back to Supabase Storage.

### Allowed uploads (Admin)

PDF, PPT/PPTX, DOC/DOCX, TXT, MD, plus common images/video (MP4) for admin uploads. The bulk course library stays on GitHub; new files go to R2.

### Hybrid file hosting (catalog in Supabase)

- **Supabase** = materials **catalog** (metadata, publish flag, download/share counts).
- **GitHub** `materials/` = existing file warehouse (unchanged).
- **Cloudflare R2** = new uploads (`source=r2`, keys under `uploads/` or `inbox/`).
- UI stays on KB'S BRAIN BANK: in-page **Watch** + **Download**.

Re-seed catalog (owner machine; secrets in `~/.config/ebb/supabase.env`, not in repo):

```bash
python3 scripts/seed_github_materials.py
```

Schema patch: [`supabase/schema_github_hybrid.sql`](supabase/schema_github_hybrid.sql).

### Public Storage URLs (optional admin uploads)

`{SUPABASE_URL}/storage/v1/object/public/materials/{file_path}`

Metadata visibility is gated by RLS on the `materials` table (`published = true` for anon).
