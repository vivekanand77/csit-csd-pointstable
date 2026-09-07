// ============================================================
// POINTS-TABLE.JS — Renders the standings table (with team logos)
// ============================================================

function renderPointsTable() {
  const teams = sortTeams(loadTeams());
  const tbody = document.getElementById("standings-body");
  if (!tbody) return;
  tbody.innerHTML = "";
  buildRows(teams, tbody);
}

function buildRows(teams, tbody) {
  teams.forEach((team, index) => {
    const pos = index + 1;
    const nrr = parseFloat(team.nrr);
    const nrrClass = nrr > 0 ? "nrr-pos" : nrr < 0 ? "nrr-neg" : "nrr-zero";

    // Logo: use team.logo if present, else fall back to colored dot
    const logoHtml = team.logo
      ? `<img src="${team.logo}" alt="${team.name} logo" class="team-logo" />`
      : `<span class="team-dot" style="background:${team.color || '#287BEA'}"></span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-pos">
        <span class="pos-badge ${pos <= 2 ? 'pos-qualify' : ''}">${pos}</span>
      </td>
      <td class="col-team" style="display:flex;align-items:center;gap:0">
        ${logoHtml}
        <span class="team-name">${team.name}</span>
      </td>
      <td class="col-stat">${team.played}</td>
      <td class="col-stat">${team.wins}</td>
      <td class="col-stat">${team.losses}</td>
      <td class="col-stat">${(team.ties || 0) + (team.noResult || 0)}</td>
      <td class="col-nrr ${nrrClass}">${formatNRR(nrr)}</td>
      <td class="col-pts">${team.points}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderPointsTable();
});
