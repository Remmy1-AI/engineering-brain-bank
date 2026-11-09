/* forms.boye.study — student contribution portal */
(function () {
  "use strict";

  const INBOX_PREFIX = "inbox/";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function setText(el, text) {
    if (el) el.textContent = text || "";
  }

  function show(el, on) {
    if (!el) return;
    el.hidden = !on;
  }

  function fillSelect(sel, items, placeholder) {
    if (!sel) return;
    sel.innerHTML =
      `<option value="">${placeholder}</option>` +
      items.map((d) => `<option value="${d.id}">${d.name}</option>`).join("");
  }

  function setProgress(ratio, label) {
    const bar = qs("#up-progress-bar");
    const wrap = qs("#up-progress");
    const lab = qs("#up-progress-label");
    show(wrap, true);
    if (bar) bar.style.width = `${Math.round(Math.max(0, Math.min(1, ratio)) * 100)}%`;
    setText(lab, label || "");
  }

  function onUploadProgress(ratio, label) {
    setProgress(ratio, label);
  }

  function resetProgress() {
    const wrap = qs("#up-progress");
    const bar = qs("#up-progress-bar");
    show(wrap, false);
    if (bar) bar.style.width = "0%";
    setText(qs("#up-progress-label"), "");
  }

  async function uploadLegacyStorage(sb, path, file, contentType) {
    setProgress(0.75, "Uploading to Brain Bank…");
    const { error } = await sb.storage.from("materials").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: contentType || file.type || undefined,
    });
    if (error) throw error;
    setProgress(0.9, "Saving details…");
  }

  function init() {
    const form = qs("#forms-upload");
    if (!form) return;

    const deptSel = qs("#up-dept");
    const levelSel = qs("#up-level");
    const semSel = qs("#up-sem");
    const typeSel = qs("#up-type");
    const fileInput = qs("#up-file");
    const fileDrop = qs("#file-drop");
    const fileName = qs("#file-name");
    const fileMeta = qs("#file-meta");
    const errEl = qs("#up-error");
    const okEl = qs("#up-ok");
    const submitBtn = qs("#up-submit");

    async function loadDeptOptions() {
      if (!window.EBB) return;
      try {
        if (window.EBBApi && EBBApi.isConfigured()) {
          const programmes = await EBBApi.listProgrammes();
          if (programmes && programmes.length) EBB.applyProgrammes(programmes);
        }
      } catch (err) {
        console.warn("[forms] programmes:", err?.message || err);
      }
      fillSelect(deptSel, EBB.departments, "Select department");
    }

    if (window.EBB) {
      loadDeptOptions();
      fillSelect(levelSel, EBB.levels, "Select level");
      fillSelect(semSel, EBB.semesters, "Select semester");
      fillSelect(typeSel, EBB.materialTypes, "Select type");
    }

    if (fileInput && window.EBBApi) {
      fileInput.setAttribute("accept", EBBApi.acceptAttr());
    }

    let prepared = null;

    function showFile(f) {
      prepared = null;
      setText(fileName, f ? f.name : "");
      setText(fileMeta, "");
      if (!f) return;
      setText(
        fileMeta,
        window.EBBCompress
          ? `Selected · ${EBBCompress.formatBytes(f.size)}`
          : `Selected · ${f.size} bytes`
      );
    }

    if (fileDrop && fileInput) {
      fileDrop.addEventListener("click", () => fileInput.click());
      fileDrop.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInput.click();
        }
      });
      fileDrop.addEventListener("dragover", (e) => {
        e.preventDefault();
        fileDrop.classList.add("dragover");
      });
      fileDrop.addEventListener("dragleave", () => fileDrop.classList.remove("dragover"));
      fileDrop.addEventListener("drop", (e) => {
        e.preventDefault();
        fileDrop.classList.remove("dragover");
        if (e.dataTransfer.files?.[0]) {
          fileInput.files = e.dataTransfer.files;
          showFile(e.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener("change", () => showFile(fileInput.files?.[0]));
    }

    form.addEventListener("reset", () => {
      showFile(null);
      show(errEl, false);
      show(okEl, false);
      resetProgress();
      prepared = null;
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      show(errEl, false);
      show(okEl, false);

      const required = [
        "up-dept",
        "up-level",
        "up-sem",
        "up-code",
        "up-name",
        "up-topic",
        "up-type",
        "up-lecturer",
      ];
      for (const id of required) {
        const el = qs("#" + id);
        if (!el || !String(el.value || "").trim()) {
          setText(errEl, "Please fill in all required fields.");
          show(errEl, true);
          el?.focus();
          return;
        }
      }

      const rawFile = fileInput?.files?.[0];
      if (!rawFile) {
        setText(errEl, "Please choose a file to upload.");
        show(errEl, true);
        return;
      }
      if (window.EBBApi && !EBBApi.isAllowedFile(rawFile)) {
        setText(errEl, "File type not allowed. Use PDF, Office, images, or notes formats.");
        show(errEl, true);
        return;
      }
      if (!window.EBBApi || !EBBApi.isConfigured()) {
        setText(errEl, "Upload service is not configured yet.");
        show(errEl, true);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Working…";
      }

      try {
        setProgress(0.05, "Preparing…");
        prepared = await (window.EBBCompress
          ? EBBCompress.prepareUploadFile(rawFile, setProgress)
          : {
              file: rawFile,
              originalBytes: rawFile.size,
              compressedBytes: rawFile.size,
              compressed: false,
              note: "",
            });

        if (prepared.note) setText(fileMeta, prepared.note);

        const file = prepared.file;
        const sb = await EBBApi.getClient();
        if (!sb) throw new Error("Could not connect to upload service.");

        let path;
        let source = "storage";
        let publicUrl = null;

        if (window.EBBR2) {
          try {
            const up = await EBBR2.uploadFile(file, {
              prefix: "inbox",
              onProgress: onUploadProgress,
            });
            path = up.key;
            source = "r2";
            publicUrl = up.publicUrl;
          } catch (r2err) {
            if (r2err && r2err.code === "r2_not_configured") {
              console.warn("[forms] R2 not configured, using Supabase Storage inbox");
            } else {
              throw r2err;
            }
          }
        }

        if (!path) {
          const safeName = String(file.name || "file").replace(/[^\w.\-()+ ]+/g, "_");
          path = `${INBOX_PREFIX}${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}-${safeName}`;
          await uploadLegacyStorage(sb, path, file, file.type || undefined);
        }

        const title = `${qs("#up-code").value.trim()} — ${qs("#up-topic").value.trim()}`;
        const description = [
          qs("#up-name").value.trim(),
          `Semester ${qs("#up-sem").value}`,
          `Lecturer: ${qs("#up-lecturer").value.trim()}`,
          prepared.compressed
            ? `Optimized upload ${EBBCompress.formatBytes(prepared.originalBytes)} → ${EBBCompress.formatBytes(prepared.compressedBytes)}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ");

        const { error: insErr } = await sb.from("materials").insert({
          title,
          description,
          course_code: qs("#up-code").value.trim(),
          department: qs("#up-dept").value,
          level: qs("#up-level").value,
          material_type: qs("#up-type").value || "shared",
          file_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          file_size: file.size,
          published: false,
          source,
          download_url: publicUrl,
          external_url: publicUrl,
          uploaded_by: null,
        });
        if (insErr) {
          try {
            if (source === "r2") {
              // Inbox deletes need auth; best-effort skip for anon orphan
            } else {
              await sb.storage.from("materials").remove([path]);
            }
          } catch (_) {}
          throw insErr;
        }

        setProgress(1, "Done");
        const thanks =
          "Received — thanks. ENGINEER WITH KB will review and publish it to the library.";
        form.reset();
        showFile(null);
        setText(okEl, thanks);
        show(okEl, true);
        setTimeout(resetProgress, 1200);
      } catch (err) {
        console.error(err);
        const msg = err?.message || String(err);
        const needsR2 = /r2_not_configured|R2 is not configured/i.test(msg);
        const needsSql =
          /row-level security|policy|permission|not allowed|inbox/i.test(msg);
        setText(
          errEl,
          needsR2
            ? "File storage (R2) is not connected yet. Ask the owner to finish Cloudflare R2 setup."
            : needsSql
              ? "Upload blocked by catalog permissions. Ask the owner to run supabase/schema_forms_inbox.sql and schema_r2_source.sql in Supabase."
              : msg || "Upload failed. Try again on Wi‑Fi."
        );
        show(errEl, true);
        resetProgress();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit for review";
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
