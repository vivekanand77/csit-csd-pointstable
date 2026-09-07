// ============================================================
// ADMIN.JS — Admin panel logic (SR + JR leagues)
// ============================================================

const ADMIN_PASSWORD = "csd-csit-2026"; // <-- Change password here

let selectedTeamId  = null;
let activeLeague    = "sr"; // "sr" | "jr"
let undoSnapshot    = null;

// ============================================================
// AUTH
// ============================================================
function checkAuth() {
  const authed      = sessionStorage.getItem("csd_admin_auth");
  const loginSection = document.getElementById("admin-login");
  const dashSection  = document.getElementById("admin-dashboard");
  if (!loginSection || !dashSection) return;
  if (authed === "1") {
    loginSection.style.display = "none";
    dashSection.style.display  = "block";
    initDashboard();
  } else {
    loginSection.style.display = "flex";
    dashSection.style.display  = "none";
  }
}

function handleLogin() {
  const input = document.getElementById("admin-password");
  const err   = document.getElementById("login-error");
  if (input.value === ADMIN_PASSWORD) {
    sessionStorage.setItem("csd_admin_auth", "1");
    err.textContent = "";
    checkAuth();
  } else {
    err.textContent = "Incorrect password. Please try again.";
    input.value = "";
    input.focus();
  }
}

function handleLogout() {
  sessionStorage.removeItem("csd_admin_auth");
  checkAuth();
}

// ============================================================
// LEAGUE SWITCHING
// ============================================================
function switchAdminLeague(league) {
  activeLeague    = league;
  selectedTeamId  = null;

  // toggle tab styles
  document.querySelectorAll(".admin-league-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.league === league);
  });

  // update label
  const lbl = document.getElementById("league-label");
  if (lbl) lbl.textContent = league === "sr" ? "SR League" : "JR League";

  // re-populate team dropdown
  populateTeamSelect();

  // hide editor until a team is chosen
  const panel = document.getElementById("team-editor");
  if (panel) panel.style.display = "none";

  // re-render preview table
  renderAdminTable();
}

// ============================================================
// DASHBOARD
// ============================================================
function initDashboard() {
  populateTeamSelect();
  renderAdminTable();

  const sel = document.getElementById("team-select");
  if (sel) sel.addEventListener("change", () => {
    selectedTeamId = parseInt(sel.value) || null;
    loadTeamEditor();
  });
}

// Returns SR or JR teams from localStorage
function getCurrentTeams() {
  return activeLeague === "sr" ? loadTeams() : loadJRTeams();
}

function saveCurrentTeams(teams) {
  if (activeLeague === "sr") saveTeams(teams);
  else saveJRTeams(teams);
}

function populateTeamSelect() {
  const teams = getCurrentTeams();
  const sel   = document.getElementById("team-select");
  if (!sel) return;
  sel.innerHTML = '<option value="">— Select a team —</option>';
  teams.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name;
    sel.appendChild(opt);
  });
  if (selectedTeamId) sel.value = selectedTeamId;
}

function getSelectedTeam() {
  return getCurrentTeams().find(t => t.id === selectedTeamId) || null;
}

function loadTeamEditor() {
  const panel = document.getElementById("team-editor");
  const team  = getSelectedTeam();
  if (!team) { if (panel) panel.style.display = "none"; return; }
  if (panel) panel.style.display = "block";

  document.getElementById("ed-played").textContent = team.played;
  document.getElementById("ed-wins").textContent   = team.wins;
  document.getElementById("ed-losses").textContent = team.losses;
  // Show combined Ties + No-Result so the displayed value is always accurate
  document.getElementById("ed-ties").textContent   = (team.ties || 0) + (team.noResult || 0);
  document.getElementById("ed-points").textContent = team.points;
  document.getElementById("ed-nrr").value          = parseFloat(team.nrr).toFixed(2);
}

// ---- Combined Ties / NR increment / decrement ----
// Fixes the bug where minus couldn't reduce T/NR when team.ties==0 but team.noResult>0.
// Decrement drains noResult first, then ties. Increment always adds to ties.
function updateTiesNR(delta) {
  const teams = getCurrentTeams();
  const idx   = teams.findIndex(t => t.id === selectedTeamId);
  if (idx === -1) return;
  const t = teams[idx];
  if (delta > 0) {
    t.ties = (t.ties || 0) + delta;
  } else {
    // Drain noResult first, then ties
    const canReduceNR = t.noResult || 0;
    if (canReduceNR > 0) {
      t.noResult = Math.max(0, canReduceNR + delta);
    } else {
      t.ties = Math.max(0, (t.ties || 0) + delta);
    }
  }
  saveSnapshot();
  saveCurrentTeams(teams);
  loadTeamEditor();
  renderAdminTable();
}

// ============================================================
// FIELD UPDATES
// ============================================================
function updateField(field, delta) {
  const teams = getCurrentTeams();
  const idx   = teams.findIndex(t => t.id === selectedTeamId);
  if (idx === -1) return;
  const val = (parseFloat(teams[idx][field]) || 0) + delta;
  teams[idx][field] = field === "nrr" ? val : Math.max(0, Math.round(val));
  saveSnapshot();
  saveCurrentTeams(teams);
  loadTeamEditor();
  renderAdminTable();
}

function recordWin() {
  const teams = getCurrentTeams();
  const idx   = teams.findIndex(t => t.id === selectedTeamId);
  if (idx === -1) return;
  saveSnapshot();
  teams[idx].played = (teams[idx].played || 0) + 1;
  teams[idx].wins   = (teams[idx].wins   || 0) + 1;
  teams[idx].points = (teams[idx].points || 0) + 2;
  saveCurrentTeams(teams);
  loadTeamEditor(); renderAdminTable();
  showToast("Win recorded — +1 Played, +1 Win, +2 Points");
}

function recordLoss() {
  const teams = getCurrentTeams();
  const idx   = teams.findIndex(t => t.id === selectedTeamId);
  if (idx === -1) return;
  saveSnapshot();
  teams[idx].played = (teams[idx].played || 0) + 1;
  teams[idx].losses = (teams[idx].losses || 0) + 1;
  saveCurrentTeams(teams);
  loadTeamEditor(); renderAdminTable();
  showToast("Loss recorded — +1 Played, +1 Loss");
}

function recordTie() {
  const teams = getCurrentTeams();
  const idx   = teams.findIndex(t => t.id === selectedTeamId);
  if (idx === -1) return;
  saveSnapshot();
  teams[idx].played = (teams[idx].played || 0) + 1;
  teams[idx].ties   = (teams[idx].ties   || 0) + 1;
  teams[idx].points = (teams[idx].points || 0) + 1;
  saveCurrentTeams(teams);
  loadTeamEditor(); renderAdminTable();
  showToast("Tie recorded — +1 Played, +1 Tie, +1 Point");
}

function adjustPoints(delta) {
  updateField("points", delta);
  showToast(`Points ${delta > 0 ? "+" : ""}${delta}`);
}

function saveNRR() {
  const input = document.getElementById("ed-nrr");
  const val   = parseFloat(input.value);
  if (isNaN(val)) { showToast("Invalid NRR value", "error"); return; }
  const teams = getCurrentTeams();
  const idx   = teams.findIndex(t => t.id === selectedTeamId);
  if (idx === -1) return;
  saveSnapshot();
  teams[idx].nrr = val;
  saveCurrentTeams(teams);
  renderAdminTable();
  showToast("NRR updated");
}

function resetTeam() {
  const team = getSelectedTeam();
  if (!team) return;
  const confirmed = confirm(`Reset ALL stats for "${team.name}" to zero? (Undo is available.)`);
  if (!confirmed) return;
  const teams = getCurrentTeams();
  const idx   = teams.findIndex(t => t.id === selectedTeamId);
  saveSnapshot();
  Object.assign(teams[idx], { played: 0, wins: 0, losses: 0, ties: 0, noResult: 0, nrr: 0, points: 0 });
  saveCurrentTeams(teams);
  loadTeamEditor(); renderAdminTable();
  showToast(`${team.name} reset to zero`, "warn");
}

// ============================================================
// UNDO
// ============================================================
function saveSnapshot() {
  // Store league + data together so undo restores the right table
  undoSnapshot = { league: activeLeague, data: localStorage.getItem(activeLeague === "sr" ? "csd_csit_teams" : "csd_csit_jr_teams") };
}

function undoLast() {
  if (!undoSnapshot) { showToast("Nothing to undo", "error"); return; }
  const key = undoSnapshot.league === "sr" ? "csd_csit_teams" : "csd_csit_jr_teams";
  if (undoSnapshot.data) localStorage.setItem(key, undoSnapshot.data);
  else localStorage.removeItem(key);
  undoSnapshot = null;
  loadTeamEditor(); renderAdminTable();
  showToast("Last change undone");
}

// ============================================================
// SAVE ALL CHANGES  (explicit Save Changes button)
// ============================================================
function saveAllChanges() {
  saveCurrentTeams(getCurrentTeams()); // re-persist current state
  renderAdminTable();
  showToast("\uD83D\uDCBE Changes saved!");
}

// ============================================================
// PREVIEW TABLE
// ============================================================
function renderAdminTable() {
  const teams = sortTeams(getCurrentTeams());
  const tbody = document.getElementById("admin-preview-body");
  if (!tbody) return;
  tbody.innerHTML = "";
  teams.forEach((team, i) => {
    const nrr = parseFloat(team.nrr);
    const tr  = document.createElement("tr");
    if (team.id === selectedTeamId) tr.classList.add("selected-row");
    const logoHtml = team.logo
      ? `<img src="${team.logo}" alt="" class="team-logo-sm" />`
      : `<span class="team-dot" style="background:${team.color||'#287BEA'}"></span>`;
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td style="display:flex;align-items:center;gap:0">${logoHtml}${team.name}</td>
      <td>${team.played}</td>
      <td>${team.wins}</td>
      <td>${team.losses}</td>
      <td>${(team.ties||0)+(team.noResult||0)}</td>
      <td class="${nrr>0?'nrr-pos':nrr<0?'nrr-neg':'nrr-zero'}">${formatNRR(nrr)}</td>
      <td class="col-pts">${team.points}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// EXPORT / IMPORT / RESET ALL
// ============================================================
function exportData() {
  const label = activeLeague.toUpperCase();
  const data  = getCurrentTeams();
  const blob  = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  a.href      = url;
  a.download  = `csd_csit_${activeLeague}_teams_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`${label} data exported`);
}

function importData() {
  const input    = document.createElement("input");
  input.type     = "file";
  input.accept   = "application/json";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error();
        saveCurrentTeams(data);
        initDashboard();
        showToast(`${activeLeague.toUpperCase()} data imported`);
      } catch {
        showToast("Invalid JSON file", "error");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function resetAllData() {
  const label     = activeLeague.toUpperCase();
  const confirmed = confirm(`Reset ALL ${label} teams to default data? This will clear localStorage for ${label} league.`);
  if (!confirmed) return;
  const key = activeLeague === "sr" ? "csd_csit_teams" : "csd_csit_jr_teams";
  localStorage.removeItem(key);
  selectedTeamId = null;
  initDashboard();
  document.getElementById("team-editor").style.display = "none";
  showToast(`${label} data reset to defaults`, "warn");
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type = "success") {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className   = "admin-toast show " + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);

  const pwInput = document.getElementById("admin-password");
  if (pwInput) pwInput.addEventListener("keydown", e => { if (e.key === "Enter") handleLogin(); });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
});
