const TOKEN_KEY = "naija_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// --- loading spinner (shows automatically during requests) ---
let spinnerEl = null;
let activeRequests = 0;
let showTimer = null;

function ensureSpinner() {
  if (spinnerEl) return spinnerEl;
  spinnerEl = document.createElement("div");
  spinnerEl.id = "app-spinner";
  spinnerEl.className = "app-spinner hidden";
  spinnerEl.innerHTML = '<div class="app-spinner-ring"></div>';
  document.body.appendChild(spinnerEl);
  return spinnerEl;
}

function showSpinner() {
  activeRequests++;
  if (showTimer) return;
  showTimer = setTimeout(() => {
    ensureSpinner().classList.remove("hidden");
  }, 350);
}

function hideSpinner() {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    clearTimeout(showTimer);
    showTimer = null;
    if (spinnerEl) spinnerEl.classList.add("hidden");
  }
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  showSpinner();
  try {
    const res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }
    return data;
  } finally {
    hideSpinner();
  }
}
