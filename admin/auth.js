// Shared login gate for every page under /admin.
// Loads before page scripts; resolves when the session cookie is valid.

(function () {
  const overlayId = "admin-login-overlay";

  function showLogin() {
    if (document.getElementById(overlayId)) return;

    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.innerHTML = `
      <style>
        #${overlayId} {
          position: fixed; inset: 0; z-index: 9999; background: #f6f6f4;
          display: flex; align-items: center; justify-content: center; padding: 1.25rem;
          font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a;
        }
        #${overlayId} .box {
          width: 100%; max-width: 360px; background: #fff; border: 1px solid #eee;
          border-radius: 12px; padding: 1.25rem;
        }
        #${overlayId} h1 { margin: 0 0 0.35rem; font-size: 1.15rem; }
        #${overlayId} p { margin: 0 0 1rem; color: #666; font-size: 0.9rem; }
        #${overlayId} input {
          width: 100%; box-sizing: border-box; padding: 0.7rem; border: 1px solid #ddd;
          border-radius: 8px; font-size: 0.95rem; margin-bottom: 0.75rem;
        }
        #${overlayId} button {
          width: 100%; padding: 0.75rem; border: none; border-radius: 8px;
          background: #111; color: #fff; font-weight: 700; cursor: pointer;
        }
        #${overlayId} .err { color: #b3261e; font-size: 0.85rem; min-height: 1.2rem; margin-bottom: 0.5rem; }
      </style>
      <div class="box">
        <h1>GABAN Admin</h1>
        <p>Enter the admin password to continue.</p>
        <div class="err" id="admin-login-error"></div>
        <form id="admin-login-form">
          <input id="admin-login-password" type="password" autocomplete="current-password" required>
          <button type="submit">Continue</button>
        </form>
      </div>`;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const form = document.getElementById("admin-login-form");
    const passwordEl = document.getElementById("admin-login-password");
    const errEl = document.getElementById("admin-login-error");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.textContent = "";
      try {
        const res = await fetch("/api/admin/check", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordEl.value })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          errEl.textContent = data.error || "Wrong password.";
          return;
        }
        overlay.remove();
        document.body.style.overflow = "";
        window.dispatchEvent(new CustomEvent("admin-ready"));
      } catch (err) {
        errEl.textContent = err.message;
      }
    });

    passwordEl.focus();
  }

  async function ensureAdmin() {
    try {
      const res = await fetch("/api/admin/check", { credentials: "include" });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("admin-ready"));
        return;
      }
    } catch {
      // fall through to login form
    }
    showLogin();
  }

  window.adminReady = new Promise((resolve) => {
    window.addEventListener("admin-ready", () => resolve(), { once: true });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureAdmin);
  } else {
    ensureAdmin();
  }
})();
