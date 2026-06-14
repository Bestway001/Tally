import { api } from "./api.js";

export async function renderTarget(root, state) {
  const { user } = state;
  const scale = user.scale;
  const { courses } = await api("/courses");

  const counted = courses.filter((c) => c.level <= user.currentLevel);
  const currentUnits = counted.reduce((s, c) => s + c.units, 0);
  const currentPoints = counted.reduce(
    (s, c) => s + c.grade_point * c.units,
    0,
  );
  const currentCGPA = currentUnits ? currentPoints / currentUnits : 0;

  root.innerHTML = `
    <div class="metrics">
      <div class="metric"><div class="label">Current CGPA</div><div class="value good">${currentUnits ? currentCGPA.toFixed(2) : "—"}</div></div>
      <div class="metric"><div class="label">Units completed</div><div class="value">${currentUnits}</div></div>
      <div class="metric"><div class="label">Scale</div><div class="value">${scale}.0</div></div>
    </div>

    <div class="card"><h2><i class="ti ti-target ic"></i> What do I need next semester?</h2>
      ${currentUnits ? "" : '<div class="alert alert-error">Add some courses in the CGPA tab first, so we know your current standing.</div>'}
      <div class="field"><label>CGPA you are aiming for</label>
        <input class="input" id="t-target" type="number" step="0.01" min="0" max="${scale}" placeholder="e.g. ${scale === 5 ? "4.50" : "3.60"}" /></div>
      <div class="field"><label>Units you'll take next semester</label>
        <input class="input" id="t-units" type="number" min="1" placeholder="e.g. 24" /></div>
      <button class="btn btn-primary btn-block" id="t-calc"><i class="ti ti-calculator"></i> Calculate</button>
      <div id="t-result" style="margin-top:16px;"></div>
    </div>`;

  document.getElementById("t-calc").addEventListener("click", () => {
    const target = Number(document.getElementById("t-target").value);
    const nextUnits = Number(document.getElementById("t-units").value);
    const out = document.getElementById("t-result");

    if (!target || target <= 0 || target > scale) {
      out.innerHTML = `<div class="alert alert-error">Enter a target CGPA between 0 and ${scale}.0.</div>`;
      return;
    }
    if (!nextUnits || nextUnits <= 0) {
      out.innerHTML = `<div class="alert alert-error">Enter how many units you'll take next semester.</div>`;
      return;
    }

    const totalUnits = currentUnits + nextUnits;
    const required = (target * totalUnits - currentPoints) / nextUnits;
    const maxReachable = (currentPoints + scale * nextUnits) / totalUnits;

    let html;
    if (required <= 0) {
      html = `<div class="alert alert-ok">You're already above ${target.toFixed(2)}. Even a weak semester keeps you there — just don't drop the ball.</div>`;
    } else if (required > scale) {
      html = `<div class="alert alert-error">
        A ${target.toFixed(2)} CGPA isn't reachable in one semester with ${nextUnits} units —
        you'd need a GPA of ${required.toFixed(2)}, but the most you can score is ${scale}.0.
        The best you can reach next semester is <strong>${maxReachable.toFixed(2)}</strong>. Spread the goal over more semesters.</div>`;
    } else {
      const pct = (required / scale) * 100;
      const pill =
        pct >= 90 ? "pill-red" : pct >= 75 ? "pill-amber" : "pill-green";
      const word =
        pct >= 90 ? "Very demanding" : pct >= 75 ? "Challenging" : "Achievable";
      html = `<div class="card" style="margin:0;text-align:center;">
        <div class="label" style="color:var(--muted);">You need to average</div>
        <div class="value" style="font-size:34px;font-family:'Fraunces',serif;">${required.toFixed(2)} GPA</div>
        <div style="margin-top:6px;">next semester across ${nextUnits} units &nbsp;<span class="pill ${pill}">${word}</span></div>
      </div>`;
    }
    out.innerHTML = html;
  });
}
