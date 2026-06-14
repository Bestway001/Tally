import { api } from "./api.js";
import { naira, CATEGORIES } from "./helpers.js";

function statusFor(pct, hasBudget) {
  if (!hasBudget)
    return {
      bg: "#eee",
      fg: "#777",
      bar: "#bbb",
      icon: "ti-wallet",
      msg: "Set a budget to begin",
    };
  if (pct >= 90)
    return {
      bg: "var(--red-soft)",
      fg: "var(--red)",
      bar: "var(--red)",
      icon: "ti-alert-triangle",
      msg: "Danger — you are nearly out of money",
    };
  if (pct >= 70)
    return {
      bg: "var(--amber-soft)",
      fg: "var(--amber)",
      bar: "var(--amber)",
      icon: "ti-alert-circle",
      msg: "Careful — slow down your spending",
    };
  if (pct >= 40)
    return {
      bg: "var(--gold-soft)",
      fg: "var(--gold)",
      bar: "var(--gold)",
      icon: "ti-coin",
      msg: "On track — keep an eye on it",
    };
  return {
    bg: "var(--green-soft)",
    fg: "var(--green)",
    bar: "var(--green)",
    icon: "ti-circle-check",
    msg: "Healthy — spending is under control",
  };
}

export async function renderBudget(root, state, refreshUser) {
  const { user } = state;
  const { expenses } = await api("/expenses");

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthName = new Date().toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });

  const budget =
    user.budgetMonth === currentMonth ? user.monthlyBudget || 0 : 0;
  const monthExpenses = expenses.filter((e) =>
    (e.spent_on || "").startsWith(currentMonth),
  );
  const spent = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const remaining = budget - spent;
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const st = statusFor(pct, budget > 0);

  root.innerHTML = `
    <div class="card" style="text-align:center;">
      <div class="status-ring" style="background:${st.bg};color:${st.fg};"><i class="ti ${st.icon}"></i></div>
      <div style="color:${st.fg};font-weight:500;font-size:14px;">${st.msg}</div>
      <div class="bar"><span style="width:${pct}%;background:${st.bar};"></span></div>
      <div class="bar-legend"><span>${pct.toFixed(0)}% spent</span><span>${naira(spent)} of ${naira(budget)}</span></div>
    </div>

    <div class="metrics">
      <div class="metric"><div class="label">Budget</div><div class="value">${naira(budget)}</div></div>
      <div class="metric"><div class="label">Spent</div><div class="value bad">${naira(spent)}</div></div>
      <div class="metric"><div class="label">Remaining</div>
        <div class="value ${remaining >= 0 ? "good" : "bad"}">${naira(Math.abs(remaining))}${remaining < 0 ? " over" : ""}</div></div>
    </div>

    <div class="card"><h2><i class="ti ti-settings ic"></i> Monthly budget</h2>
      <div class="line-form">
        <input class="input" id="b-amount" type="number" value="${budget || ""}" placeholder="e.g. 50000" />
        <button class="btn btn-primary" id="b-save"><i class="ti ti-check"></i> Save</button>
      </div>
    </div>

    <div class="card"><h2><i class="ti ti-plus ic"></i> Add expense</h2>
      <div class="line-form">
        <input class="input" id="e-desc" placeholder="What did you spend on?" style="flex:2;" />
        <input class="input" id="e-amount" type="number" placeholder="Amount ₦" style="max-width:120px;" />
      </div>
      <div class="line-form">
        <select id="e-cat">${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select>
        <button class="btn btn-primary" id="e-add"><i class="ti ti-plus"></i> Add</button>
      </div>
    </div>

    <div class="card"><h2><i class="ti ti-receipt ic"></i> Expenses for ${monthName}</h2>
      ${
        monthExpenses.length
          ? monthExpenses
              .map(
                (e) => `
        <div class="row"><span>${e.description} <span class="meta">· ${e.category} · ${e.spent_on}</span></span>
          <strong>${naira(e.amount)}</strong>
        </div>`,
              )
              .join("")
          : `<p class="empty">No expenses yet for ${monthName}.</p>`
      }
    </div>`;

  document.getElementById("b-save").addEventListener("click", async () => {
    const amount = Number(document.getElementById("b-amount").value) || 0;
    await api("/me", {
      method: "PATCH",
      body: { monthlyBudget: amount, budgetMonth: currentMonth },
    });
    await refreshUser();
    renderBudget(root, state, refreshUser);
  });

  document.getElementById("e-add").addEventListener("click", async () => {
    const description = document.getElementById("e-desc").value.trim();
    const amount = Number(document.getElementById("e-amount").value);
    const category = document.getElementById("e-cat").value;

    const warn = (msg) => {
      let box = document.getElementById("e-warn");
      if (!box) {
        box = document.createElement("div");
        box.id = "e-warn";
        box.className = "alert alert-error";
        box.style.marginTop = "12px";
        document.getElementById("e-add").closest(".card").appendChild(box);
      }
      box.textContent = msg;
    };

    if (!description || !amount) return;

    if (budget <= 0) {
      return warn("Please set your monthly budget before adding an expense.");
    }
    if (remaining <= 0) {
      return warn(
        `You've reached your ${naira(budget)} budget for this month. Raise your budget to add more.`,
      );
    }
    if (amount > remaining) {
      return warn(
        `Not enough balance. You have only ${naira(remaining)} left, but tried to spend ${naira(amount)}.`,
      );
    }

    await api("/expenses", {
      method: "POST",
      body: { description, amount, category },
    });
    renderBudget(root, state, refreshUser);
  });
}
