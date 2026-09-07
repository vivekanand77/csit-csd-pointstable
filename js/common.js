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
    localStorage.setItem("csd_csit_data_version", DATA_VERSION);
  }
}

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

function saveMatches(matches) {
  localStorage.setItem("csd_csit_matches", JSON.stringify(matches));
}

function loadMatches() {
  const stored = localStorage.getItem("csd_csit_matches");
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return JSON.parse(JSON.stringify(DEFAULT_MATCHES));
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
  const sign = n >= 0 ? "+" : "";
  return sign + n.toFixed(2);
}

// ---- Active nav highlight ----
function setActiveNav() {
  const path = window.location.pathname.replace(/\/$/, "");
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href").replace(/\/$/, "");
    if (
      path.endsWith(href) ||
      (href === "/index.html" && (path === "" || path.endsWith("/")))
    ) {
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
    toggle.querySelector(".bar1").style.transform = open ? "rotate(45deg) translate(5px,5px)" : "";
    toggle.querySelector(".bar2").style.opacity   = open ? "0" : "1";
    toggle.querySelector(".bar3").style.transform = open ? "rotate(-45deg) translate(5px,-5px)" : "";
  });

  document.addEventListener("click", e => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", false);
      toggle.querySelector(".bar1").style.transform = "";
      toggle.querySelector(".bar2").style.opacity   = "1";
      toggle.querySelector(".bar3").style.transform = "";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  initHamburger();
});
