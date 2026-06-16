import { api } from "./api.js";

export function setupFeedback() {
  if (document.getElementById("fb-fab")) return;

  const btn = document.createElement("button");
  btn.id = "fb-fab";
  btn.className = "fb-fab";
  btn.innerHTML = '<i class="ti ti-message-2"></i> Feedback';
  document.body.appendChild(btn);

  const overlay = document.createElement("div");
  overlay.id = "fb-overlay";
  overlay.className = "fb-overlay hidden";
  overlay.innerHTML = `
    <div class="fb-modal">
      <h2><i class="ti ti-message-2 ic"></i> Send feedback</h2>
      <p style="font-size:13px;color:var(--muted);margin-bottom:12px;">What's working? What's missing or annoying? Be honest — it helps.</p>
      <textarea id="fb-text" class="input" rows="4" placeholder="Your feedback..."></textarea>
      <div id="fb-msg" style="margin-top:10px;"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;">
        <button class="btn" id="fb-cancel">Cancel</button>
        <button class="btn btn-primary" id="fb-send"><i class="ti ti-send"></i> Send</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const open = () => overlay.classList.remove("hidden");
  const close = () => {
    overlay.classList.add("hidden");
    document.getElementById("fb-msg").innerHTML = "";
    document.getElementById("fb-text").value = "";
  };

  btn.addEventListener("click", open);
  document.getElementById("fb-cancel").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.getElementById("fb-send").addEventListener("click", async () => {
    const message = document.getElementById("fb-text").value.trim();
    const msgBox = document.getElementById("fb-msg");
    if (!message) {
      msgBox.innerHTML =
        '<div class="alert alert-error">Please type something first.</div>';
      return;
    }
    try {
      await api("/feedback", { method: "POST", body: { message } });
      msgBox.innerHTML =
        '<div class="alert alert-ok">Thank you! Your feedback was sent.</div>';
      document.getElementById("fb-text").value = "";
      setTimeout(close, 1200);
    } catch (e) {
      msgBox.innerHTML = `<div class="alert alert-error">${e.message}</div>`;
    }
  });
}
