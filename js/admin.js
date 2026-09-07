// ============================================================
// ADMIN.JS — Full Tournament Admin Management
// Standings, Fixtures, Top Scorers & Top Bowlers CRUD
// ============================================================

const ADMIN_PASSWORD = "csd-csit-2026"; // <-- Admin password

let selectedTeamId   = null;
let activeLeague     = "sr"; // "sr" | "jr"
let activeSection    = "standings"; // "standings" | "fixtures" | "scorers" | "bowlers"
let undoSnapshot     = null;

// ============================================================
// AUTH
// ============================================================
function checkAuth() {
  const authed       = sessionStorage.getItem("csd_admin_auth");
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
// MAIN NAVIGATION TABS
// ============================================================
function switchAdminSection(sec) {
  activeSection = sec;
  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.id === `tab-btn-${sec}`);
  });
  document.querySelectorAll(".admin-sec").forEach(el => {
    el.style.display = el.id === `sec-${sec}` ? "block" : "none";
  });

  if (sec === "standings") {
    renderAdminTable();
  } else if (sec === "fixtures") {
    renderAdminFixtures();
  } else if (sec === "scorers") {
    renderAdminScorers();
  } else if (sec === "bowlers") {
    renderAdminBowlers();
  }
}

// ============================================================
// DASHBOARD INITIALIZATION
// ============================================================
function initDashboard() {
  populateTeamSelect();
  renderAdminTable();
  renderAdminFixtures();
  renderAdminScorers();
  renderAdminBowlers();

  const sel = document.getElementById("team-select");
  if (sel) {
    sel.addEventListener("change", () => {
      selectedTeamId = parseInt(sel.value) || null;
      loadTeamEditor();
    });
  }
}

// ============================================================
// SECTION 1: STANDINGS MANAGEMENT
// ============================================================
function switchAdminLeague(league) {
  activeLeague   = league;
  selectedTeamId = null;

  document.querySelectorAll(".admin-league-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.league === league);
  });

  const pl = document.getElementById("preview-league-label");
  if (pl) pl.textContent = league === "sr" ? "SR League" : "JR League";

  populateTeamSelect();
  const panel = document.getElementById("team-editor");
  if (panel) panel.style.display = "none";
  renderAdminTable();
}

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
  document.getElementById("ed-ties").textContent   = (team.ties || 0) + (team.noResult || 0);
  document.getElementById("ed-points").textContent = team.points;
  document.getElementById("ed-nrr").value          = parseFloat(team.nrr).toFixed(2);
}

function updateTiesNR(delta) {
  const teams = getCurrentTeams();
  const idx   = teams.findIndex(t => t.id === selectedTeamId);
  if (idx === -1) return;
  const t = teams[idx];
  if (delta > 0) {
    t.ties = (t.ties || 0) + delta;
  } else {
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
  const confirmed = confirm(`Reset ALL stats for "${team.name}" to zero?`);
  if (!confirmed) return;
  const teams = getCurrentTeams();
  const idx   = teams.findIndex(t => t.id === selectedTeamId);
  saveSnapshot();
  Object.assign(teams[idx], { played: 0, wins: 0, losses: 0, ties: 0, noResult: 0, nrr: 0, points: 0 });
  saveCurrentTeams(teams);
  loadTeamEditor(); renderAdminTable();
  showToast(`${team.name} reset to zero`, "warn");
}

function saveSnapshot() {
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

function saveAllChanges() {
  saveCurrentTeams(getCurrentTeams());
  renderAdminTable();
  showToast("💾 Changes saved!");
}

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
      <td class="col-pos"><span class="pos-badge ${i<2?'pos-qualify':''}">${i + 1}</span></td>
      <td style="display:flex;align-items:center;gap:0">${logoHtml}${team.name}</td>
      <td class="col-stat">${team.played}</td>
      <td class="col-stat">${team.wins}</td>
      <td class="col-stat">${team.losses}</td>
      <td class="col-stat">${(team.ties||0)+(team.noResult||0)}</td>
      <td class="col-nrr ${nrr>0?'nrr-pos':nrr<0?'nrr-neg':'nrr-zero'}">${formatNRR(nrr)}</td>
      <td class="col-pts">${team.points}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// SECTION 2: FIXTURES CRUD
// ============================================================
function renderAdminFixtures() {
  const matches = loadMatches();
  const tbody = document.getElementById("fixtures-admin-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!matches.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">No fixtures scheduled. Click "+ Add New Fixture" above.</td></tr>';
    return;
  }

  // Sort by matchNo
  const sorted = [...matches].sort((a, b) => (parseInt(a.matchNo) || 0) - (parseInt(b.matchNo) || 0));

  sorted.forEach(m => {
    const tr = document.createElement("tr");
    const scoresDisplay = (m.scoreA || m.scoreB)
      ? `<div style="font-weight:700">${m.scoreA || '—'} vs ${m.scoreB || '—'}</div>`
      : '';
    const resultDisplay = m.result ? `<div style="font-size:12px;color:var(--green);font-weight:600">${m.result}</div>` : '';

    tr.innerHTML = `
      <td style="font-weight:700">#${m.matchNo}</td>
      <td>${statusBadge(m.status)}</td>
      <td>
        <div style="font-weight:700;color:var(--navy)">${m.teamA}</div>
        <div style="font-size:12px;color:var(--text-muted)">vs ${m.teamB}</div>
      </td>
      <td>
        <div>📅 ${formatDate(m.date)}</div>
        <div style="font-size:12px;color:var(--text-muted)">🕐 ${m.time || 'TBD'}</div>
      </td>
      <td>${m.venue || 'College Ground'}</td>
      <td>
        ${scoresDisplay}
        ${resultDisplay || (!scoresDisplay ? '<span style="color:var(--text-muted)">—</span>' : '')}
      </td>
      <td style="text-align:right">
        <div class="table-actions" style="justify-content:flex-end">
          <button class="btn btn-edit btn-xs" onclick="openEditFixtureModal(${m.id})">✏️ Edit</button>
          <button class="btn btn-danger btn-xs" onclick="deleteFixture(${m.id})">🗑️ Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddFixtureModal() {
  document.getElementById("fixture-modal-title").textContent = "Add New Fixture";
  document.getElementById("fx-id").value = "";
  
  const matches = loadMatches();
  const nextNo = matches.length ? Math.max(...matches.map(m => parseInt(m.matchNo) || 0)) + 1 : 1;
  document.getElementById("fx-no").value = nextNo;
  document.getElementById("fx-status").value = "UPCOMING";
  document.getElementById("fx-team-a").value = "";
  document.getElementById("fx-team-b").value = "";
  document.getElementById("fx-date").value = new Date().toISOString().slice(0, 10);
  document.getElementById("fx-time").value = "09:00 AM";
  document.getElementById("fx-venue").value = "College Ground A";
  document.getElementById("fx-score-a").value = "";
  document.getElementById("fx-score-b").value = "";
  document.getElementById("fx-result").value = "";

  openModal("fixture-modal");
}

function openEditFixtureModal(id) {
  const matches = loadMatches();
  const m = matches.find(x => x.id === id);
  if (!m) return;

  document.getElementById("fixture-modal-title").textContent = `Edit Match #${m.matchNo}`;
  document.getElementById("fx-id").value = m.id;
  document.getElementById("fx-no").value = m.matchNo;
  document.getElementById("fx-status").value = m.status || "UPCOMING";
  document.getElementById("fx-team-a").value = m.teamA || "";
  document.getElementById("fx-team-b").value = m.teamB || "";
  document.getElementById("fx-date").value = m.date || "";
  document.getElementById("fx-time").value = m.time || "";
  document.getElementById("fx-venue").value = m.venue || "";
  document.getElementById("fx-score-a").value = m.scoreA || "";
  document.getElementById("fx-score-b").value = m.scoreB || "";
  document.getElementById("fx-result").value = m.result || "";

  openModal("fixture-modal");
}

function saveFixtureForm() {
  const idVal   = document.getElementById("fx-id").value;
  const matchNo = parseInt(document.getElementById("fx-no").value) || 1;
  const status  = document.getElementById("fx-status").value;
  const teamA   = document.getElementById("fx-team-a").value.trim();
  const teamB   = document.getElementById("fx-team-b").value.trim();
  const date    = document.getElementById("fx-date").value;
  const time    = document.getElementById("fx-time").value.trim();
  const venue   = document.getElementById("fx-venue").value.trim();
  const scoreA  = document.getElementById("fx-score-a").value.trim() || null;
  const scoreB  = document.getElementById("fx-score-b").value.trim() || null;
  const result  = document.getElementById("fx-result").value.trim() || null;

  if (!teamA || !teamB) {
    showToast("Please enter both Team A and Team B", "error");
    return;
  }

  const matches = loadMatches();

  if (idVal) {
    // Edit existing
    const id = parseInt(idVal);
    const idx = matches.findIndex(m => m.id === id);
    if (idx !== -1) {
      matches[idx] = { ...matches[idx], matchNo, status, teamA, teamB, date, time, venue, scoreA, scoreB, result };
      saveMatches(matches);
      showToast(`Match #${matchNo} updated successfully!`);
    }
  } else {
    // Add new
    const newId = matches.length ? Math.max(...matches.map(m => m.id || 0)) + 1 : 1;
    matches.push({ id: newId, matchNo, status, teamA, teamB, date, time, venue, scoreA, scoreB, result });
    saveMatches(matches);
    showToast(`New Match #${matchNo} added successfully!`);
  }

  closeModal("fixture-modal");
  renderAdminFixtures();
}

function deleteFixture(id) {
  const matches = loadMatches();
  const m = matches.find(x => x.id === id);
  if (!m) return;

  if (!confirm(`Are you sure you want to delete Match #${m.matchNo} (${m.teamA} vs ${m.teamB})?`)) return;

  const updated = matches.filter(x => x.id !== id);
  saveMatches(updated);
  renderAdminFixtures();
  showToast(`Match #${m.matchNo} removed`, "warn");
}

// ============================================================
// SECTION 3: TOP SCORERS / BATSMEN CRUD
// ============================================================
function renderAdminScorers() {
  const scorers = loadRunScorers();
  const tbody = document.getElementById("scorers-admin-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!scorers.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted)">No top scorers added yet. Click "+ Add New Scorer" above.</td></tr>';
    return;
  }

  scorers.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="rank-badge ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${p.rank || (i+1)}</span></td>
      <td style="font-weight:700;color:var(--navy)">${p.name}</td>
      <td>${p.team}</td>
      <td style="font-weight:800;color:var(--blue)">${p.runs}</td>
      <td>${p.balls ?? '—'}</td>
      <td>${p.fours ?? 0} / ${p.sixes ?? 0}</td>
      <td>${p.sr ?? '—'}</td>
      <td style="font-weight:600;color:var(--green)">${p.hs ?? '—'}</td>
      <td style="text-align:right">
        <div class="table-actions" style="justify-content:flex-end">
          <button class="btn btn-edit btn-xs" onclick="openEditScorerModal(${i})">✏️ Edit</button>
          <button class="btn btn-danger btn-xs" onclick="deleteScorer(${i})">🗑️ Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddScorerModal() {
  document.getElementById("scorer-modal-title").textContent = "Add Top Scorer";
  document.getElementById("sc-index").value = "";
  document.getElementById("sc-name").value = "";
  document.getElementById("sc-team").value = "";
  document.getElementById("sc-runs").value = "";
  document.getElementById("sc-balls").value = "";
  document.getElementById("sc-fours").value = "";
  document.getElementById("sc-sixes").value = "";
  document.getElementById("sc-sr").value = "";
  document.getElementById("sc-hs").value = "";
  openModal("scorer-modal");
}

function openEditScorerModal(index) {
  const scorers = loadRunScorers();
  const p = scorers[index];
  if (!p) return;

  document.getElementById("scorer-modal-title").textContent = `Edit Scorer: ${p.name}`;
  document.getElementById("sc-index").value = index;
  document.getElementById("sc-name").value = p.name || "";
  document.getElementById("sc-team").value = p.team || "";
  document.getElementById("sc-runs").value = p.runs ?? "";
  document.getElementById("sc-balls").value = p.balls ?? "";
  document.getElementById("sc-fours").value = p.fours ?? "";
  document.getElementById("sc-sixes").value = p.sixes ?? "";
  document.getElementById("sc-sr").value = p.sr || "";
  document.getElementById("sc-hs").value = p.hs || "";

  openModal("scorer-modal");
}

function saveScorerForm() {
  const indexVal = document.getElementById("sc-index").value;
  const name     = document.getElementById("sc-name").value.trim();
  const team     = document.getElementById("sc-team").value.trim();
  const runs     = parseInt(document.getElementById("sc-runs").value) || 0;
  const balls    = parseInt(document.getElementById("sc-balls").value) || 0;
  const fours    = parseInt(document.getElementById("sc-fours").value) || 0;
  const sixes    = parseInt(document.getElementById("sc-sixes").value) || 0;
  let sr         = document.getElementById("sc-sr").value.trim();
  const hs       = document.getElementById("sc-hs").value.trim() || `${runs}`;

  if (!name || !team) {
    showToast("Please enter player name and team", "error");
    return;
  }

  // Auto calculate Strike Rate if balls provided and SR blank
  if (!sr && balls > 0) {
    sr = ((runs / balls) * 100).toFixed(1);
  }

  const scorers = loadRunScorers();
  const scorerObj = { name, team, runs, balls, fours, sixes, sr: sr || "—", hs };

  if (indexVal !== "") {
    const idx = parseInt(indexVal);
    scorers[idx] = scorerObj;
  } else {
    scorers.push(scorerObj);
  }

  // Re-sort by runs descending & reassign ranks
  scorers.sort((a, b) => (b.runs || 0) - (a.runs || 0));
  scorers.forEach((p, i) => { p.rank = i + 1; });

  saveRunScorers(scorers);
  closeModal("scorer-modal");
  renderAdminScorers();
  showToast("Top scorer saved successfully!");
}

function deleteScorer(index) {
  const scorers = loadRunScorers();
  const p = scorers[index];
  if (!p) return;

  if (!confirm(`Delete "${p.name}" from top scorers list?`)) return;

  scorers.splice(index, 1);
  scorers.forEach((item, i) => { item.rank = i + 1; });
  saveRunScorers(scorers);
  renderAdminScorers();
  showToast(`${p.name} removed from scorers`, "warn");
}

// ============================================================
// SECTION 4: TOP BOWLERS / WICKET TAKERS CRUD
// ============================================================
function renderAdminBowlers() {
  const bowlers = loadWicketTakers();
  const tbody = document.getElementById("bowlers-admin-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!bowlers.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted)">No top bowlers added yet. Click "+ Add New Bowler" above.</td></tr>';
    return;
  }

  bowlers.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="rank-badge ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${p.rank || (i+1)}</span></td>
      <td style="font-weight:700;color:var(--navy)">${p.name}</td>
      <td>${p.team}</td>
      <td style="font-weight:800;color:var(--blue)">${p.wickets}</td>
      <td>${p.overs ?? '—'}</td>
      <td>${p.runs ?? '—'}</td>
      <td>${p.economy ?? '—'}</td>
      <td style="font-weight:600;color:var(--blue)">${p.best ?? '—'}</td>
      <td style="text-align:right">
        <div class="table-actions" style="justify-content:flex-end">
          <button class="btn btn-edit btn-xs" onclick="openEditBowlerModal(${i})">✏️ Edit</button>
          <button class="btn btn-danger btn-xs" onclick="deleteBowler(${i})">🗑️ Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddBowlerModal() {
  document.getElementById("bowler-modal-title").textContent = "Add Top Bowler";
  document.getElementById("bo-index").value = "";
  document.getElementById("bo-name").value = "";
  document.getElementById("bo-team").value = "";
  document.getElementById("bo-wickets").value = "";
  document.getElementById("bo-overs").value = "";
  document.getElementById("bo-runs").value = "";
  document.getElementById("bo-eco").value = "";
  document.getElementById("bo-best").value = "";
  openModal("bowler-modal");
}

function openEditBowlerModal(index) {
  const bowlers = loadWicketTakers();
  const p = bowlers[index];
  if (!p) return;

  document.getElementById("bowler-modal-title").textContent = `Edit Bowler: ${p.name}`;
  document.getElementById("bo-index").value = index;
  document.getElementById("bo-name").value = p.name || "";
  document.getElementById("bo-team").value = p.team || "";
  document.getElementById("bo-wickets").value = p.wickets ?? "";
  document.getElementById("bo-overs").value = p.overs || "";
  document.getElementById("bo-runs").value = p.runs ?? "";
  document.getElementById("bo-eco").value = p.economy || "";
  document.getElementById("bo-best").value = p.best || "";

  openModal("bowler-modal");
}

function saveBowlerForm() {
  const indexVal = document.getElementById("bo-index").value;
  const name     = document.getElementById("bo-name").value.trim();
  const team     = document.getElementById("bo-team").value.trim();
  const wickets  = parseInt(document.getElementById("bo-wickets").value) || 0;
  const overs    = document.getElementById("bo-overs").value.trim() || "—";
  const runs     = parseInt(document.getElementById("bo-runs").value) || 0;
  let economy    = document.getElementById("bo-eco").value.trim();
  const best     = document.getElementById("bo-best").value.trim() || `${wickets}/${runs}`;

  if (!name || !team) {
    showToast("Please enter bowler name and team", "error");
    return;
  }

  // Auto calculate economy if overs numeric and eco blank
  if (!economy && overs !== "—") {
    const ovNum = parseFloat(overs);
    if (!isNaN(ovNum) && ovNum > 0) {
      economy = (runs / ovNum).toFixed(1);
    }
  }

  const bowlers = loadWicketTakers();
  const bowlerObj = { name, team, wickets, overs, runs, economy: economy || "—", best };

  if (indexVal !== "") {
    const idx = parseInt(indexVal);
    bowlers[idx] = bowlerObj;
  } else {
    bowlers.push(bowlerObj);
  }

  // Re-sort by wickets descending & reassign ranks
  bowlers.sort((a, b) => (b.wickets || 0) - (a.wickets || 0));
  bowlers.forEach((p, i) => { p.rank = i + 1; });

  saveWicketTakers(bowlers);
  closeModal("bowler-modal");
  renderAdminBowlers();
  showToast("Top bowler saved successfully!");
}

function deleteBowler(index) {
  const bowlers = loadWicketTakers();
  const p = bowlers[index];
  if (!p) return;

  if (!confirm(`Delete "${p.name}" from top bowlers list?`)) return;

  bowlers.splice(index, 1);
  bowlers.forEach((item, i) => { item.rank = i + 1; });
  saveWicketTakers(bowlers);
  renderAdminBowlers();
  showToast(`${p.name} removed from bowlers`, "warn");
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "flex";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}

// Close modals when clicking backdrop
document.addEventListener("click", e => {
  if (e.target.classList && e.target.classList.contains("admin-modal-backdrop")) {
    e.target.style.display = "none";
  }
});

// ============================================================
// TOAST NOTIFICATIONS
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
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

// ============================================================
// INITIALIZATION
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
