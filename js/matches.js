// ============================================================
// MATCHES.JS — Renders match schedule and results
// ============================================================

function statusBadge(status) {
  const map = {
    UPCOMING: '<span class="badge badge-upcoming">Upcoming</span>',
    LIVE: '<span class="badge badge-live">🔴 Live</span>',
    COMPLETED: '<span class="badge badge-completed">Completed</span>'
  };
  return map[status] || '';
}

function renderMatches() {
  const matches = loadMatches();
  const container = document.getElementById("matches-container");
  if (!container) return;

  // Group by status: LIVE first, then UPCOMING, then COMPLETED
  const order = { LIVE: 0, UPCOMING: 1, COMPLETED: 2 };
  const sorted = [...matches].sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));

  container.innerHTML = "";

  sorted.forEach(m => {
    const isCompleted = m.status === "COMPLETED";
    const card = document.createElement("div");
    card.className = `match-card ${m.status.toLowerCase()}`;
    card.innerHTML = `
      <div class="match-card-header">
        <span class="match-no">Match #${m.matchNo}</span>
        ${statusBadge(m.status)}
      </div>
      <div class="match-teams">
        <div class="match-team ${isCompleted && m.result && m.result.startsWith(m.teamA) ? 'winner' : ''}">
          <span class="team-label">${m.teamA}</span>
          ${isCompleted ? `<span class="match-score">${m.scoreA || '—'}</span>` : ''}
        </div>
        <div class="vs-divider">VS</div>
        <div class="match-team ${isCompleted && m.result && m.result.startsWith(m.teamB) ? 'winner' : ''}">
          <span class="team-label">${m.teamB}</span>
          ${isCompleted ? `<span class="match-score">${m.scoreB || '—'}</span>` : ''}
        </div>
      </div>
      ${isCompleted && m.result ? `<div class="match-result">${m.result}</div>` : ''}
      <div class="match-meta">
        <span>📅 ${formatDate(m.date)}</span>
        <span>🕐 ${m.time}</span>
        <span>📍 ${m.venue}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

document.addEventListener("DOMContentLoaded", renderMatches);
