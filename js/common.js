// ============================================================
// COMMON.JS — Shared utilities across all pages
// ============================================================

// ---- Version-aware localStorage helpers ----
// When DATA_VERSION in data.js changes, old cached localStorage is cleared
// automatically so fresh defaults from data.js are used.

function _checkVersion() {
  const stored = localStorage.getItem("csd_csit_data_version");
  if (stored !== DATA_VERSION) {
    localStorage.removeItem("csd_csit_teams");
    localStorage.removeItem("csd_csit_jr_teams");
    localStorage.removeItem("csd_csit_matches");
    localStorage.removeItem("csd_csit_run_scorers");
    localStorage.removeItem("csd_csit_wicket_takers");
    localStorage.setItem("csd_csit_data_version", DATA_VERSION);
  }
}

// ---- SR Teams ----
function saveTeams(teams) {
  localStorage.setItem("csd_csit_teams", JSON.stringify(teams));
}

function loadTeams() {
  _checkVersion();
  const stored = localStorage.getItem("csd_csit_teams");
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return JSON.parse(JSON.stringify(DEFAULT_TEAMS)); // deep clone
}

// ---- JR Teams ----
function saveJRTeams(teams) {
  localStorage.setItem("csd_csit_jr_teams", JSON.stringify(teams));
}

function loadJRTeams() {
  _checkVersion();
  const stored = localStorage.getItem("csd_csit_jr_teams");
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return JSON.parse(JSON.stringify(DEFAULT_JR_TEAMS)); // deep clone
}

// ---- Matches / Fixtures ----
function saveMatches(matches) {
  localStorage.setItem("csd_csit_matches", JSON.stringify(matches));
}

function loadMatches() {
  _checkVersion();
  const stored = localStorage.getItem("csd_csit_matches");
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return JSON.parse(JSON.stringify(DEFAULT_MATCHES));
}

// ---- Top Run Scorers ----
function saveRunScorers(scorers) {
  localStorage.setItem("csd_csit_run_scorers", JSON.stringify(scorers));
}

function loadRunScorers() {
  _checkVersion();
  const stored = localStorage.getItem("csd_csit_run_scorers");
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return JSON.parse(JSON.stringify(DEFAULT_RUN_SCORERS));
}

// ---- Top Wicket Takers ----
function saveWicketTakers(bowlers) {
  localStorage.setItem("csd_csit_wicket_takers", JSON.stringify(bowlers));
}

function loadWicketTakers() {
  _checkVersion();
  const stored = localStorage.getItem("csd_csit_wicket_takers");
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return JSON.parse(JSON.stringify(DEFAULT_WICKET_TAKERS));
}

// ---- Sorting ----
function sortTeams(teams) {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.nrr    !== a.nrr)    return b.nrr    - a.nrr;
    if (b.wins   !== a.wins)   return b.wins   - a.wins;
    return a.id - b.id;
  });
}

// ---- NRR display ----
function formatNRR(nrr) {
  const n    = parseFloat(nrr);
  if (isNaN(n)) return "+0.00";
  const sign = n >= 0 ? "+" : "";
  return sign + n.toFixed(2);
}

// ---- Status Badge helper ----
function statusBadge(status) {
  const map = {
    UPCOMING: '<span class="badge badge-upcoming">Upcoming</span>',
    LIVE: '<span class="badge badge-live">🔴 Live</span>',
    COMPLETED: '<span class="badge badge-completed">Completed</span>'
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

// ---- Date Formatter helper ----
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

// ---- Active nav highlight ----
function setActiveNav() {
  const path = window.location.pathname.replace(/\/$/, "");
  const currentFile = path.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
    const href = link.getAttribute("href") ? link.getAttribute("href").split("/").pop() : "";
    if (href === currentFile || (currentFile === "" && href === "index.html") || (currentFile === "/" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

// ---- Hamburger menu ----
function initHamburger() {
  const toggle = document.getElementById("nav-toggle");
  const menu   = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    const b1 = toggle.querySelector(".bar1");
    const b2 = toggle.querySelector(".bar2");
    const b3 = toggle.querySelector(".bar3");
    if (b1) b1.style.transform = open ? "rotate(45deg) translate(5px,5px)" : "";
    if (b2) b2.style.opacity   = open ? "0" : "1";
    if (b3) b3.style.transform = open ? "rotate(-45deg) translate(5px,-5px)" : "";
  });

  document.addEventListener("click", e => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", false);
      const b1 = toggle.querySelector(".bar1");
      const b2 = toggle.querySelector(".bar2");
      const b3 = toggle.querySelector(".bar3");
      if (b1) b1.style.transform = "";
      if (b2) b2.style.opacity   = "1";
      if (b3) b3.style.transform = "";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  initHamburger();
});
