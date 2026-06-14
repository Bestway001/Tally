import { api } from './api.js';
import { todayISO } from './helpers.js';

export async function renderStudy(root, state) {
  const { logs } = await api('/study');
  const today = todayISO();

  const todayHours = logs.filter((l) => l.log_date === today).reduce((s, l) => s + l.hours, 0);
  const studiedDates = new Set(logs.map((l) => l.log_date));

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 6 * 86400000).toISOString().slice(0, 10);
  const weekHours = logs.filter((l) => l.log_date >= weekAgo).reduce((s, l) => s + l.hours, 0);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthPrefix = now.toISOString().slice(0, 7);

  root.innerHTML = `
    <div class="metrics">
      <div class="metric"><div class="label">Today's hours</div><div class="value good">${todayHours.toFixed(1)}</div></div>
      <div class="metric"><div class="label">Last 7 days</div><div class="value">${weekHours.toFixed(1)}</div></div>
      <div class="metric"><div class="label">Days studied</div><div class="value">${studiedDates.size}</div></div>
    </div>

    <div class="card"><h2><i class="ti ti-calendar ic"></i> This month</h2>
      <div class="calendar">
        ${Array.from({ length: daysInMonth }, (_, i) => {
          const d = String(i + 1).padStart(2, '0');
          const hit = studiedDates.has(`${monthPrefix}-${d}`);
          return `<div class="cal-day ${hit ? 'hit' : ''}">${i + 1}</div>`;
        }).join('')}
      </div>
      <p class="muted-note">Green = a day you logged study time</p>
    </div>

    <div class="card"><h2><i class="ti ti-plus ic"></i> Log a study session</h2>
      <div class="line-form">
        <input class="input" id="s-subject" placeholder="Subject e.g. MTH 201" style="flex:2;" />
        <input class="input" id="s-hours" type="number" step="0.5" min="0" placeholder="Hours" style="max-width:90px;" />
        <input class="input" id="s-date" type="date" value="${today}" style="max-width:150px;" />
        <button class="btn btn-primary" id="s-add"><i class="ti ti-plus"></i> Log</button>
      </div>
    </div>

    <div class="card"><h2><i class="ti ti-history ic"></i> Recent sessions</h2>
      ${logs.length ? logs.slice(0, 15).map((l) => `
        <div class="row"><span>${l.subject} <span class="meta">· ${l.log_date}</span></span>
          <span style="display:flex;align-items:center;gap:10px;"><strong>${l.hours}h</strong>
            <button class="btn btn-danger" data-del="${l.id}" aria-label="Remove"><i class="ti ti-trash"></i></button></span>
        </div>`).join('') : '<p class="empty">No study sessions logged yet.</p>'}
    </div>`;

  document.getElementById('s-add').addEventListener('click', async () => {
    const subject = document.getElementById('s-subject').value.trim();
    const hours = Number(document.getElementById('s-hours').value);
    const logDate = document.getElementById('s-date').value;
    if (!subject || !hours || !logDate) return;
    await api('/study', { method: 'POST', body: { logDate, subject, hours } });
    renderStudy(root, state);
  });

  root.querySelectorAll('[data-del]').forEach((b) =>
    b.addEventListener('click', async () => {
      await api(`/study/${b.dataset.del}`, { method: 'DELETE' });
      renderStudy(root, state);
    })
  );
}
