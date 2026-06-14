import { api } from './api.js';
import {
  gradesFor, gradePoint, degreeClass, gpaOf, gradePill, levelsUpTo,
} from './helpers.js';

export async function renderCGPA(root, state, refreshUser) {
  const { user } = state;
  const { courses } = await api('/courses');
  const scale = user.scale;

  function bySession(level, semester) {
    return courses.filter((c) => c.level === level && c.semester === semester);
  }

  let allUnits = 0, allPoints = 0, any = false;
  const breakdown = [];
  levelsUpTo(user.currentLevel).forEach((level) => {
    ['first', 'second'].forEach((semester) => {
      const { gpa, units, valid } = gpaOf(bySession(level, semester));
      if (valid) { allUnits += units; allPoints += gpa * units; any = true; }
      breakdown.push({ level, semester, gpa, units, valid });
    });
  });
  const cgpa = allUnits ? allPoints / allUnits : 0;
  const dc = degreeClass(scale, cgpa);

  root.innerHTML = `
    <div class="card" style="display:flex;justify-content:flex-end;padding:14px 18px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <label style="font-size:13px;color:var(--muted);">Current level</label>
        <select id="lvl" style="width:auto;">
          ${[100, 200, 300, 400, 500].map((l) => `<option value="${l}" ${l === user.currentLevel ? 'selected' : ''}>${l} level</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="metrics">
      <div class="metric"><div class="label">CGPA</div>
        <div class="value ${any ? (cgpa >= (scale === 5 ? 4.5 : 3.6) ? 'good' : '') : ''}">${any ? cgpa.toFixed(2) : '—'}</div></div>
      <div class="metric"><div class="label">Total units</div><div class="value">${allUnits}</div></div>
      <div class="metric"><div class="label">Degree class</div>
        <div class="value" style="font-size:14px;">${any ? `<span class="pill ${dc.pill}">${dc.label}</span>` : '—'}</div></div>
    </div>

    ${any ? `<div class="card"><h2><i class="ti ti-chart-bar ic"></i> GPA history</h2>
      ${breakdown.filter((b) => b.valid).map((b) => `
        <div class="row"><span>${b.level} level — ${b.semester === 'first' ? '1st' : '2nd'} semester</span>
        <span><span class="meta">${b.units} units</span> &nbsp; <strong>GPA ${b.gpa.toFixed(2)}</strong></span></div>`).join('')}
    </div>` : ''}

    <div class="card"><h2><i class="ti ti-list ic"></i> Grading scale (${scale}.0)</h2>
      <table class="table"><tr><th>Grade</th><th>Score</th><th>Points</th></tr>
        ${gradesFor(scale).map((g, i) => {
          const next = gradesFor(scale)[i - 1];
          const top = next ? next.min - 1 : 100;
          return `<tr><td><span class="pill ${gradePill(scale, g.point)}">${g.label}</span></td><td>${g.min}–${top}%</td><td>${g.point}.0</td></tr>`;
        }).join('')}
      </table></div>

    ${levelsUpTo(user.currentLevel).map((level) => `
      <div class="card"><h2><i class="ti ti-school ic"></i> ${level} level</h2>
        ${['first', 'second'].map((semester) => {
          const list = bySession(level, semester);
          const { gpa, units, valid } = gpaOf(list);
          return `<div class="session">
            <div class="session-head"><span class="t">${semester === 'first' ? 'First' : 'Second'} semester</span>
              <span class="g">${valid ? `GPA ${gpa.toFixed(2)} · ${units} units` : ''}</span></div>
            ${list.length ? list.map((c) => `
              <div class="row"><span>${c.name} <span class="meta">· ${c.units} unit${c.units > 1 ? 's' : ''}</span></span>
                <span style="display:flex;align-items:center;gap:10px;">
                  <span class="pill ${gradePill(scale, c.grade_point)}">${c.grade}</span>
                  <button class="btn btn-danger" data-del="${c.id}" aria-label="Remove"><i class="ti ti-trash"></i></button>
                </span></div>`).join('') : '<p class="empty">No courses yet.</p>'}
            <div class="line-form">
              <input class="input" id="cn-${level}-${semester}" placeholder="Course code" style="flex:2;" />
              <select id="cu-${level}-${semester}" style="max-width:80px;"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>6</option></select>
              <select id="cg-${level}-${semester}" style="max-width:75px;">${gradesFor(scale).map((g) => `<option>${g.label}</option>`).join('')}</select>
              <button class="btn btn-primary" data-add="${level}-${semester}"><i class="ti ti-plus"></i> Add</button>
            </div>
          </div>`;
        }).join('')}
      </div>`).join('')}
  `;

  document.getElementById('lvl').addEventListener('change', async (e) => {
    await api('/me', { method: 'PATCH', body: { currentLevel: Number(e.target.value) } });
    await refreshUser();
    renderCGPA(root, state, refreshUser);
  });

  root.querySelectorAll('[data-add]').forEach((b) =>
    b.addEventListener('click', async () => {
      const [level, semester] = b.dataset.add.split('-');
      const name = document.getElementById(`cn-${level}-${semester}`).value.trim();
      const units = Number(document.getElementById(`cu-${level}-${semester}`).value);
      const grade = document.getElementById(`cg-${level}-${semester}`).value;
      if (!name) return;
      await api('/courses', {
        method: 'POST',
        body: { level: Number(level), semester, name, units, grade, gradePoint: gradePoint(scale, grade) },
      });
      renderCGPA(root, state, refreshUser);
    })
  );

  root.querySelectorAll('[data-del]').forEach((b) =>
    b.addEventListener('click', async () => {
      await api(`/courses/${b.dataset.del}`, { method: 'DELETE' });
      renderCGPA(root, state, refreshUser);
    })
  );
}
