import { api, getToken, clearToken } from "./api.js";
import { initials } from "./helpers.js";
import { renderAuth } from "./auth.js";
import { renderCGPA } from "./cgpa.js";
import { renderStudy } from "./study.js";
import { renderBudget } from "./budget.js";
import { renderTarget } from "./target.js";
import { setupFeedback } from "./feedback.js";

const app = document.getElementById("app");
const state = { user: null, tab: "cgpa" };

async function refreshUser() {
  const { user } = await api("/me");
  state.user = user;
}

function showAuth() {
  app.innerHTML = '<div id="auth-root"></div>';
  renderAuth(document.getElementById("auth-root"), {
    onAuthed: async (user) => {
      state.user = user;
      showApp();
    },
  });
}

function logout() {
  clearToken();
  state.user = null;
  showAuth();
}

function drawTab() {
  const root = document.getElementById("tab-content");
  root.innerHTML = '<div class="loading-spin"></div>';
  if (state.tab === "cgpa") renderCGPA(root, state, refreshUser);
  else if (state.tab === "study") renderStudy(root, state);
  else if (state.tab === "budget") renderBudget(root, state, refreshUser);
  else renderTarget(root, state);
}

function showApp() {
  const u = state.user;
  app.innerHTML = `
    <div class="topbar"><div class="container">
      <span class="brand wordmark"><span class="dot"></span> Tally</span>
      <button class="btn" id="logout" style="color:#fff;border-color:rgba(255,255,255,0.4);background:transparent;">
        <i class="ti ti-logout"></i> Sign out</button>
    </div></div>
    <div class="container" style="padding-top:22px;">
      <div class="card profile">
        <div class="who">
          <div class="avatar">${initials(u.name)}</div>
          <div>
            <div class="name">${u.name}</div>
            <div class="sub">${[u.department, u.university].filter(Boolean).join(" · ")}</div>
            <div class="sub">Matric: ${u.matric} · ${u.scale}.0 scale</div>
          </div>
        </div>
      </div>
      <div class="tabs">
        <button class="tab" data-tab="cgpa"><i class="ti ti-school"></i> CGPA</button>
        <button class="tab" data-tab="study"><i class="ti ti-clock"></i> Study tracker</button>
        <button class="tab" data-tab="budget"><i class="ti ti-wallet"></i> Budget</button>
        <button class="tab" data-tab="target"><i class="ti ti-target"></i> Target</button>
      </div>
      <div id="tab-content"></div>
    </div>`;

  document.getElementById("logout").addEventListener("click", logout);

  function paintTabs() {
    app
      .querySelectorAll("[data-tab]")
      .forEach((b) => b.classList.toggle("on", b.dataset.tab === state.tab));
  }
  app.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      state.tab = b.dataset.tab;
      paintTabs();
      drawTab();
      // setupFeedback();
    }),
  );

  paintTabs();
  drawTab();
  setupFeedback();
}

async function boot() {
  if (!getToken()) return showAuth();
  try {
    await refreshUser();
    showApp();
  } catch {
    logout();
    document.getElementById("fb-fab")?.remove();
    document.getElementById("fb-overlay")?.remove();
  }
}

boot();
