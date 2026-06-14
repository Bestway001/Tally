import { api, setToken } from "./api.js";

export function renderAuth(root, { onAuthed }) {
  let mode = "login";

  // <h1 class="wordmark">Tally</h1>;

  function passField(id, placeholder) {
    return `
      <div class="pass-field">
        <input class="input" type="password" id="${id}" placeholder="${placeholder}" />
        <button class="toggle" type="button" data-toggle="${id}" aria-label="Show password">
          <i class="ti ti-eye"></i>
        </button>
      </div>`;
  }

  function draw() {
    root.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-hero">
          <div class="badge-circle"><i class="ti ti-school"></i></div>
          <h1 class="wordmark">Tally</h1>
          <p>Track your CGPA, study time and budget — saved to your account.</p>
        </div>
        <div class="switcher">
          <button data-mode="login" class="${mode === "login" ? "on" : ""}">Sign in</button>
          <button data-mode="signup" class="${mode === "signup" ? "on" : ""}">Create account</button>
        </div>
        <div id="auth-alert"></div>
        <div class="card">
          ${
            mode === "signup"
              ? `
            <div class="field"><label>Full name</label><input class="input" id="f-name" placeholder="e.g. Chukwuemeka Obi" /></div>
            <div class="field"><label>University</label><input class="input" id="f-uni" placeholder="e.g. University of Ibadan" /></div>
            <div class="field"><label>Department</label><input class="input" id="f-dept" placeholder="e.g. Computer Science" /></div>
            <div class="field"><label>Grading scale</label>
              <select id="f-scale"><option value="5">5.0 scale</option><option value="4">4.0 scale</option></select></div>
            <div class="field"><label>Entry level</label>
              <select id="f-entry"><option value="100">100 level</option><option value="200">200 level</option><option value="300">300 level</option></select></div>
          `
              : ""
          }
          <div class="field"><label>Matric number</label><input class="input" id="f-matric" placeholder="e.g. 20/52HA001" /></div>
          <div class="field"><label>Password</label>${passField("f-pass", "Enter password")}</div>
          ${mode === "signup" ? `<div class="field"><label>Confirm password</label>${passField("f-pass2", "Re-enter password")}</div>` : ""}
          <button class="btn btn-primary btn-block" id="f-submit">
            <i class="ti ti-${mode === "login" ? "login" : "user-plus"}"></i>
            ${mode === "login" ? "Sign in" : "Create account"}
          </button>
        </div>
      </div>`;

    root.querySelectorAll("[data-mode]").forEach((b) =>
      b.addEventListener("click", () => {
        mode = b.dataset.mode;
        draw();
      }),
    );

    root.querySelectorAll("[data-toggle]").forEach((b) =>
      b.addEventListener("click", () => {
        const inp = document.getElementById(b.dataset.toggle);
        const showing = inp.type === "text";
        inp.type = showing ? "password" : "text";
        b.innerHTML = `<i class="ti ti-eye${showing ? "" : "-off"}"></i>`;
        b.setAttribute(
          "aria-label",
          showing ? "Show password" : "Hide password",
        );
      }),
    );

    document.getElementById("f-submit").addEventListener("click", submit);
  }

  function showError(msg) {
    document.getElementById("auth-alert").innerHTML =
      `<div class="alert alert-error">${msg}</div>`;
  }

  async function submit() {
    const val = (id) => (document.getElementById(id)?.value || "").trim();
    try {
      let res;
      if (mode === "signup") {
        if (val("f-pass") !== val("f-pass2"))
          return showError("Passwords do not match.");
        res = await api("/signup", {
          method: "POST",
          body: {
            name: val("f-name"),
            university: val("f-uni"),
            department: val("f-dept"),
            matric: val("f-matric"),
            password: val("f-pass"),
            scale: Number(val("f-scale")),
            entryLevel: Number(val("f-entry")),
          },
        });
      } else {
        res = await api("/login", {
          method: "POST",
          body: { matric: val("f-matric"), password: val("f-pass") },
        });
      }
      setToken(res.token);
      onAuthed(res.user);
    } catch (e) {
      showError(e.message);
    }
  }

  draw();
}
