/**
 * CSD & CSIT Cricket League 2026 — Embeddable Points Table Widget
 * ================================================================
 * Drop this single <script> tag on ANY website to show the live standings.
 *
 * Usage:
 *   <!-- 1. Add a container div wherever you want the widget to appear -->
 *   <div id="csd-cricket-widget"></div>
 *
 *   <!-- 2. Load this script (place anywhere, ideally before </body>) -->
 *   <script src="https://your-domain.com/widget.js"></script>
 *
 * Optional config (set BEFORE loading the script):
 *   <script>
 *     window.CSDWidgetConfig = {
 *       containerId: "csd-cricket-widget",  // default
 *       defaultLeague: "sr",                // "sr" or "jr"
 *       logoBase: "https://your-domain.com/asserts/", // base URL for logos
 *       linkToSite: "https://your-domain.com/points-table.html"
 *     };
 *   </script>
 * ================================================================
 */
(function () {
  "use strict";

  // ── Configuration ──────────────────────────────────────────────────────────
  const cfg = Object.assign({
    containerId:   "csd-cricket-widget",
    defaultLeague: "sr",
    logoBase:      (function () {
      const scripts = document.querySelectorAll("script[src]");
      for (let i = scripts.length - 1; i >= 0; i--) {
        const src = scripts[i].getAttribute("src");
        if (src && src.includes("widget.js")) {
          return src.replace(/widget\.js.*$/, "") + "asserts/";
        }
      }
      return "asserts/";
    })(),
    linkToSite: null,
  }, window.CSDWidgetConfig || {});

  // ── Static Data (mirrors data.js) ──────────────────────────────────────────
  const SR_TEAMS = [
    { id:1, name:"House Vayu",   color:"#287BEA", logo:"vayu.png",    played:4, wins:4, losses:0, nrr:+2.39, points:8 },
    { id:2, name:"House Agni",   color:"#E84545", logo:"agni.png",    played:4, wins:2, losses:2, nrr:-0.40, points:4 },
    { id:3, name:"House Prudvi", color:"#22C55E", logo:"Prudhvi.png", played:3, wins:0, losses:3, nrr:-3.89, points:0 },
    { id:4, name:"House Jal",    color:"#A855F7", logo:"jal.png",     played:4, wins:3, losses:1, nrr:+4.57, points:6 },
    { id:5, name:"House Akash",  color:"#06B6D4", logo:"Akash.png",   played:3, wins:0, losses:3, nrr:-6.53, points:0 },
  ];

  const JR_TEAMS = [
    { id:1, name:"House Vayu",   color:"#287BEA", logo:"vayu.png",    played:4, wins:3, losses:1, nrr:-0.95, points:6 },
    { id:2, name:"House Agni",   color:"#E84545", logo:"agni.png",    played:3, wins:2, losses:1, nrr:+1.36, points:4 },
    { id:3, name:"House Prudvi", color:"#22C55E", logo:"Prudhvi.png", played:4, wins:0, losses:4, nrr:-4.41, points:0 },
    { id:4, name:"House Jal",    color:"#A855F7", logo:"jal.png",     played:4, wins:3, losses:1, nrr:+2.64, points:6 },
    { id:5, name:"House Akash",  color:"#06B6D4", logo:"Akash.png",   played:3, wins:2, losses:1, nrr:+1.97, points:4 },
  ];

  // ── Helpers ────────────────────────────────────────────────────────────────
  function sortTeams(teams) {
    return [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.nrr    !== a.nrr)    return b.nrr    - a.nrr;
      if (b.wins   !== a.wins)   return b.wins   - a.wins;
      return a.id - b.id;
    });
  }

  function fmt(nrr) {
    const n = parseFloat(nrr);
    if (isNaN(n)) return "+0.00";
    return (n >= 0 ? "+" : "") + n.toFixed(2);
  }

  const MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

  function buildRows(teams) {
    return sortTeams(teams).map((t, i) => {
      const nrr = parseFloat(t.nrr);
      const nrrCls = nrr > 0 ? "nrr-pos" : nrr < 0 ? "nrr-neg" : "nrr-zero";
      const qualify = i < 2 ? ' class="qualify"' : '';
      return `
        <tr${qualify}>
          <td class="col-pos"><span class="medal">${MEDALS[i] || (i + 1)}</span></td>
          <td class="col-team">
            <span class="dot" style="background:${t.color}"></span>
            <span class="tname">${t.name}</span>
            ${i < 2 ? '<span class="q-tag">Q</span>' : ""}
          </td>
          <td>${t.played}</td>
          <td>${t.wins}</td>
          <td>${t.losses}</td>
          <td class="${nrrCls}">${fmt(nrr)}</td>
          <td class="col-pts">${t.points}</td>
        </tr>`;
    }).join("");
  }

  // ── CSS (Shadow DOM — zero bleed into host page) ───────────────────────────
  const CSS = `
    :host { display:block; font-family:'Segoe UI',system-ui,sans-serif; }
    .widget {
      background:#0f172a; border-radius:16px; overflow:hidden;
      box-shadow:0 8px 32px rgba(0,0,0,.45); max-width:560px; width:100%; color:#e2e8f0;
    }
    .whead {
      background:linear-gradient(135deg,#1d6ff3 0%,#7c3aed 100%);
      padding:14px 18px 12px; display:flex; align-items:center; justify-content:space-between; gap:8px;
    }
    .whead-title { font-size:14px; font-weight:700; letter-spacing:.4px; line-height:1.3; }
    .whead-sub   { font-size:11px; opacity:.8; }
    .whead-link a {
      color:#fff; font-size:11px; text-decoration:none;
      background:rgba(255,255,255,.18); padding:4px 10px; border-radius:20px; white-space:nowrap;
    }
    .whead-link a:hover { background:rgba(255,255,255,.32); }
    .tabs { display:flex; background:#1e293b; border-bottom:1px solid #334155; }
    .tab {
      flex:1; padding:9px 0; text-align:center; font-size:12px; font-weight:600;
      cursor:pointer; color:#94a3b8; border:none; background:transparent;
      transition:color .2s,box-shadow .2s; letter-spacing:.3px;
    }
    .tab.active { color:#60a5fa; box-shadow:inset 0 -2px 0 #60a5fa; }
    .tab:hover:not(.active) { color:#cbd5e1; }
    .tbl-wrap { overflow-x:auto; }
    table { width:100%; border-collapse:collapse; font-size:12.5px; }
    thead tr { background:#1e293b; }
    thead th {
      padding:7px 10px; text-align:center; font-size:10.5px; font-weight:700;
      text-transform:uppercase; letter-spacing:.6px; color:#64748b;
    }
    thead th.col-team { text-align:left; }
    tbody tr { border-bottom:1px solid #1e293b; transition:background .15s; }
    tbody tr:hover { background:#1e293b88; }
    tbody tr.qualify { background:rgba(29,111,243,.07); }
    tbody td { padding:8px 10px; text-align:center; color:#cbd5e1; }
    .col-pos { width:36px; }
    .medal { font-size:15px; }
    .col-team { text-align:left; display:flex; align-items:center; gap:8px; min-width:140px; }
    .dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
    .tname { font-weight:600; font-size:12.5px; color:#f1f5f9; }
    .q-tag {
      font-size:9px; font-weight:700; background:#1d6ff3; color:#fff;
      padding:1px 5px; border-radius:4px; letter-spacing:.5px;
    }
    .nrr-pos  { color:#4ade80; font-weight:600; }
    .nrr-neg  { color:#f87171; font-weight:600; }
    .nrr-zero { color:#94a3b8; }
    .col-pts  { font-weight:700; font-size:13px; color:#f1f5f9; }
    .wfooter {
      background:#1e293b; padding:7px 14px;
      display:flex; align-items:center; gap:6px; font-size:10.5px; color:#64748b;
    }
    .q-dot { width:8px; height:8px; background:#1d6ff3; border-radius:2px; flex-shrink:0; }
    .panel { display:none; }
    .panel.active { display:block; }
  `;

  // ── HTML Builder ───────────────────────────────────────────────────────────
  function buildHTML(activeLeague) {
    const headLink = cfg.linkToSite
      ? `<span class="whead-link"><a href="${cfg.linkToSite}" target="_blank">View Full ↗</a></span>`
      : "";
    const thead = `<thead><tr>
        <th class="col-pos">#</th>
        <th class="col-team">Team</th>
        <th title="Played">P</th>
        <th title="Wins">W</th>
        <th title="Losses">L</th>
        <th title="Net Run Rate">NRR</th>
        <th title="Points">Pts</th>
      </tr></thead>`;
    return `
      <div class="widget">
        <div class="whead">
          <div>
            <div class="whead-title">🏏 CSD &amp; CSIT Cricket League 2026</div>
            <div class="whead-sub">Official Points Table</div>
          </div>
          ${headLink}
        </div>
        <div class="tabs">
          <button class="tab${activeLeague==="sr"?" active":""}" data-league="sr">Senior League (SR)</button>
          <button class="tab${activeLeague==="jr"?" active":""}" data-league="jr">Junior League (JR)</button>
        </div>
        <div class="panel${activeLeague==="sr"?" active":""}" id="wpanel-sr">
          <div class="tbl-wrap"><table>${thead}<tbody>${buildRows(SR_TEAMS)}</tbody></table></div>
        </div>
        <div class="panel${activeLeague==="jr"?" active":""}" id="wpanel-jr">
          <div class="tbl-wrap"><table>${thead}<tbody>${buildRows(JR_TEAMS)}</tbody></table></div>
        </div>
        <div class="wfooter"><span class="q-dot"></span> Top 2 teams qualify for the Championship Final</div>
      </div>`;
  }

  // ── Mount ──────────────────────────────────────────────────────────────────
  function mount() {
    const container = document.getElementById(cfg.containerId);
    if (!container) {
      console.warn("[CSDWidget] Container #" + cfg.containerId + " not found.");
      return;
    }
    const shadow = container.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = CSS;
    shadow.appendChild(style);
    const wrap = document.createElement("div");
    wrap.innerHTML = buildHTML(cfg.defaultLeague);
    shadow.appendChild(wrap);

    shadow.querySelectorAll(".tab").forEach(btn => {
      btn.addEventListener("click", () => {
        const l = btn.dataset.league;
        shadow.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        shadow.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        shadow.getElementById("wpanel-" + l).classList.add("active");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
