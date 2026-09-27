/* Engineering Brain Bank — Owner Admin (vanilla IIFE) */
(function () {
  "use strict";

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function show(el, on) {
    if (!el) return;
    el.hidden = !on;
  }

  function setError(id, msg) {
    const el = qs("#" + id);
    if (!el) return;
    if (msg) {
      el.textContent = msg;
      el.hidden = false;
    } else {
      el.textContent = "";
      el.hidden = true;
    }
  }

  async function boot() {
    const panelSetup = qs("#panel-setup");
    const panelLogin = qs("#panel-login");
    const panelDash = qs("#panel-dash");
    const btnLogout = qs("#btn-logout");

    if (!window.EBBApi || !EBBApi.isConfigured()) {
      show(panelSetup, true);
      show(panelLogin, false);
      show(panelDash, false);
      return;
    }

    const sb = await EBBApi.getClient();
    if (!sb) {
      show(panelSetup, true);
      return;
    }

    // Fill selects
    const deptSel = qs("#up-dept");
    const levelSel = qs("#up-level");
    const typeSel = qs("#up-type");
    const fileInput = qs("#up-file");
    if (deptSel && window.EBB) {
      deptSel.innerHTML = `<option value="">—</option>` +
        EBB.departments.map((d) => `<option value="${d.id}">${d.name}</option>`).join("");
    }
    if (levelSel && window.EBB) {
      levelSel.innerHTML = `<option value="">—</option>` +
        EBB.levels.map((l) => `<option value="${l.id}">${l.name}</option>`).join("");
    }
    if (typeSel && window.EBB) {
      typeSel.innerHTML = EBB.materialTypes.map((t) =>
        `<option value="${t.id}">${t.name}</option>`
      ).join("");
    }
    if (fileInput) fileInput.setAttribute("accept", EBBApi.acceptAttr());

    async function enterDash(session) {
      show(panelSetup, false);
      show(panelLogin, false);
      show(panelDash, true);
      show(btnLogout, true);
      const userEl = qs("#dash-user");
      if (userEl) userEl.textContent = session?.user?.email || "Signed in";
      await refreshAll();
    }

    function enterLogin() {
      show(panelSetup, false);
      show(panelLogin, true);
      show(panelDash, false);
      show(btnLogout, false);
    }

    const { data: { session } } = await sb.auth.getSession();
    if (session) await enterDash(session);
    else enterLogin();

    sb.auth.onAuthStateChange(async (_event, sess) => {
      if (sess) await enterDash(sess);
      else enterLogin();
    });

    qs("#login-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      setError("login-error", "");
      const email = qs("#login-email")?.value?.trim();
      const password = qs("#login-password")?.value || "";
      const btn = qs("#login-submit");
      if (btn) btn.disabled = true;
      try {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } catch (err) {
        setError("login-error", err.message || "Sign-in failed");
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    btnLogout?.addEventListener("click", async () => {
      await sb.auth.signOut();
    });

    qs("#btn-refresh")?.addEventListener("click", () => refreshAll());

    qs("#upload-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      setError("upload-error", "");
      const okEl = qs("#upload-ok");
      if (okEl) { okEl.hidden = true; okEl.textContent = ""; }

      const title = qs("#up-title")?.value?.trim();
      const description = qs("#up-desc")?.value?.trim() || null;
      const course_code = qs("#up-code")?.value?.trim() || null;
      const department = qs("#up-dept")?.value || null;
      const level = qs("#up-level")?.value || null;
      const material_type = qs("#up-type")?.value || "shared";
      const published = !!qs("#up-published")?.checked;
      const file = qs("#up-file")?.files?.[0];

      if (!title) { setError("upload-error", "Title is required."); return; }
      if (!file) { setError("upload-error", "Choose a file."); return; }
      if (!EBBApi.isAllowedFile(file)) {
        setError("upload-error", "File type not allowed. Use PDF, PPT/PPTX, DOC/DOCX, TXT, or MD.");
        return;
      }

      const btn = qs("#upload-submit");
      if (btn) { btn.disabled = true; btn.textContent = "Uploading…"; }

      try {
        const { data: userData } = await sb.auth.getUser();
        const uid = userData?.user?.id || null;
        const safeName = file.name.replace(/[^\w.\-()+ ]+/g, "_");
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

        const { error: upErr } = await sb.storage
          .from("materials")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || undefined,
          });
        if (upErr) throw upErr;

        const { error: insErr } = await sb.from("materials").insert({
          title,
          description,
          course_code,
          department,
          level,
          material_type,
          file_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          file_size: file.size,
          published,
          uploaded_by: uid,
        });
        if (insErr) {
          // best-effort cleanup
          try { await sb.storage.from("materials").remove([path]); } catch (_) {}
          throw insErr;
        }

        if (okEl) {
          okEl.textContent = "Uploaded successfully.";
          okEl.hidden = false;
        }
        qs("#upload-form").reset();
        if (qs("#up-published")) qs("#up-published").checked = true;
        await refreshAll();
      } catch (err) {
        setError("upload-error", err.message || "Upload failed");
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = "Upload"; }
      }
    });

    qs("#materials-tbody")?.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");
      if (!id || !action) return;

      try {
        if (action === "toggle") {
          const published = btn.getAttribute("data-published") === "true";
          const { error } = await sb.from("materials").update({ published: !published }).eq("id", id);
          if (error) throw error;
          await refreshAll();
        } else if (action === "delete") {
          if (!confirm("Delete this material and its file?")) return;
          const path = btn.getAttribute("data-path");
          const { error } = await sb.from("materials").delete().eq("id", id);
          if (error) throw error;
          if (path) {
            try { await sb.storage.from("materials").remove([path]); } catch (_) {}
          }
          await refreshAll();
        } else if (action === "open") {
          const path = btn.getAttribute("data-path");
          const url = EBBApi.getPublicFileUrl(path);
          if (url) window.open(url, "_blank", "noopener");
        }
      } catch (err) {
        alert(err.message || "Action failed");
      }
    });

    async function refreshAll() {
      await Promise.all([loadStats(), loadMaterials()]);
    }

    async function loadStats() {
      try {
        const { data, error } = await sb.rpc("admin_stats");
        if (error) throw error;
        qs("#stat-visits").textContent = String(data?.visits ?? 0);
        qs("#stat-downloads").textContent = String(data?.downloads ?? 0);
        qs("#stat-shares").textContent = String(data?.shares ?? 0);
        qs("#stat-materials").textContent = String(data?.materials ?? 0);
      } catch (err) {
        // Fallback: compute from materials + page_views count if RPC missing
        console.warn("[admin] admin_stats:", err.message || err);
        try {
          const mats = await EBBApi.listAllMaterials();
          qs("#stat-materials").textContent = String(mats.length);
          qs("#stat-downloads").textContent = String(mats.reduce((s, m) => s + (m.download_count || 0), 0));
          qs("#stat-shares").textContent = String(mats.reduce((s, m) => s + (m.share_count || 0), 0));
          const { count } = await sb.from("page_views").select("*", { count: "exact", head: true });
          qs("#stat-visits").textContent = String(count ?? "—");
        } catch (_) {
          qs("#stat-visits").textContent = "—";
        }
      }
    }

    async function loadMaterials() {
      const tbody = qs("#materials-tbody");
      if (!tbody) return;
      try {
        const rows = await EBBApi.listAllMaterials();
        if (!rows.length) {
          tbody.innerHTML = `<tr><td colspan="7" class="admin-muted">No materials yet. Upload one above.</td></tr>`;
          return;
        }
        tbody.innerHTML = rows.map((m) => `
          <tr>
            <td data-label="Title">
              <strong>${escapeHtml(m.title)}</strong>
              <div class="admin-muted">${escapeHtml(m.file_name || "")}</div>
            </td>
            <td data-label="Course">${escapeHtml(m.course_code || "—")}</td>
            <td data-label="Type">${escapeHtml(m.material_type || "—")}</td>
            <td data-label="Downloads">${m.download_count || 0}</td>
            <td data-label="Shares">${m.share_count || 0}</td>
            <td data-label="Status">
              <button type="button" class="btn btn-ghost btn-sm"
                data-action="toggle" data-id="${m.id}" data-published="${m.published ? "true" : "false"}">
                ${m.published ? "Published" : "Hidden"}
              </button>
            </td>
            <td class="admin-row-actions" data-label="Actions">
              <button type="button" class="btn btn-ghost btn-sm" data-action="open" data-id="${m.id}" data-path="${escapeHtml(m.file_path)}">Open</button>
              <button type="button" class="btn btn-ghost btn-sm admin-danger" data-action="delete" data-id="${m.id}" data-path="${escapeHtml(m.file_path)}">Delete</button>
            </td>
          </tr>`).join("");
      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="admin-error">${escapeHtml(err.message || "Failed to load")}</td></tr>`;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    boot().catch((err) => {
      console.error(err);
      const panel = qs("#panel-setup");
      if (panel) {
        panel.hidden = false;
        const lead = panel.querySelector(".admin-lead");
        if (lead) lead.textContent = "Could not start admin: " + (err.message || err);
      }
    });
  });
})();
