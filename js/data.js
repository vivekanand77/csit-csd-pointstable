// ============================================================
// CSD & CSIT TOURNAMENT — MASTER DATA FILE
// Edit this file and commit to GitHub to update the live site.
// ============================================================

// ⚠️  INCREMENT THIS every time you edit default team data below.
// The browser will automatically clear cached localStorage and
// load the fresh defaults from this file on next page load.
const DATA_VERSION = "2026-09-07-v6";


const DEFAULT_TEAMS = [
  {
    id: 1,
    name: "House Vayu (SR)",
    color: "#287BEA",
    logo: "asserts/vayu.png",
    played: 3,
    wins: 3,
    losses: 0,
    ties: 0,
    noResult: 0,
    nrr: 2.03,
    points: 6
  },
  {
    id: 2,
    name: "House Agni (SR)",
    color: "#E84545",
    logo: "asserts/agni.png",
    played: 3,
    wins: 1,
    losses: 2,
    ties: 0,
    noResult: 0,
    nrr: -1.33,
    points: 2
  },
  {
    id: 3,
    name: "House Prudvi (SR)",
    color: "#22C55E",
    logo: "asserts/Prudhvi.png",
    played: 1,
    wins: 0,
    losses: 1,
    ties: 0,
    noResult: 0,
    nrr: -3.49,
    points: 0
  },
  {
    id: 4,
    name: "House Jal (SR)",
    color: "#A855F7",
    logo: "asserts/jal.png",
    played: 2,
    wins: 1,
    losses: 1,
    ties: 0,
    noResult: 0,
    nrr: +0.92,
    points: 2
  },
  {
    id: 5,
    name: "House Akash (SR)",
    color: "#06B6D4",
    logo: "asserts/Akash.png",
    played: 1,
    wins: 0,
    losses: 1,
    ties: 0,
    noResult: 0,
    nrr: -0.17,
    points: 0
  }
];

// ============================================================
// JR LEAGUE TEAMS  (same house names, separate standings)
// ============================================================

const DEFAULT_JR_TEAMS = [
  {
    id: 1,
    name: "House Vayu (JR)",
    color: "#287BEA",
    logo: "asserts/vayu.png",
    played: 2,
    wins: 1,
    losses: 1,
    ties: 0,
    noResult: 0,
    nrr: -2.32,
    points: 2
  },
  {
    id: 2,
    name: "House Agni (JR)",
    color: "#E84545",
    logo: "asserts/agni.png",
    played: 2,
    wins: 2,
    losses: 0,
    ties: 0,
    noResult: 0,
    nrr: +5.50,
    points: 4
  },
  {
    id: 3,
    name: "House Prudvi (JR)",
    color: "#22C55E",
    logo: "asserts/Prudhvi.png",
    played: 2,
    wins: 0,
    losses: 2,
    ties: 0,
    noResult: 0,
    nrr: -5.37,
    points: 0
  },
  {
    id: 4,
    name: "House Jal (JR)",
    color: "#A855F7",
    logo: "asserts/jal.png",
    played: 1,
    wins: 0,
    losses: 1,
    ties: 0,
    noResult: 0,
    nrr: -0.96,
    points: 0
  },

  {
    id: 5,
    name: "House Akash (JR)",
    color: "#06B6D4",
    logo: "asserts/Akash.png",
    played: 1,
    wins: 1,
    losses: 0,
    ties: 0,
    noResult: 0,
    nrr: +5.37,
    points: 2
  }
];

// ============================================================
// MATCHES DATA
// ============================================================

const DEFAULT_MATCHES = [
  {
    id: 1,
    matchNo: 1,
    teamA: "House Vayu (SR)",
    teamB: "House Agni (JR)",
    date: "2026-09-10",
    time: "09:00 AM",
    venue: "College Ground A",
    status: "COMPLETED",
    scoreA: "142/7",
    scoreB: "138/9",
    result: "House Vayu (SR) won by 4 runs"
  },
  {
    id: 2,
    matchNo: 2,
    teamA: "House Prudvi (SR)",
    teamB: "House Jal (JR)",
    date: "2026-09-10",
    time: "11:30 AM",
    venue: "College Ground B",
    status: "COMPLETED",
    scoreA: "156/5",
    scoreB: "157/3",
    result: "House Jal (JR) won by 7 wickets"
  },
  {
    id: 3,
    matchNo: 3,
    teamA: "House Akash (JR)",
    teamB: "House Terra (SR)",
    date: "2026-09-11",
    time: "09:00 AM",
    venue: "College Ground A",
    status: "COMPLETED",
    scoreA: "178/4",
    scoreB: "120/10",
    result: "House Akash (JR) won by 58 runs"
  },
  {
    id: 4,
    matchNo: 4,
    teamA: "House Agni (JR)",
    teamB: "House Prudvi (SR)",
    date: "2026-09-12",
    time: "09:00 AM",
    venue: "College Ground A",
    status: "COMPLETED",
    scoreA: "165/6",
    scoreB: "130/10",
    result: "House Agni (JR) won by 35 runs"
  },
  {
    id: 5,
    matchNo: 5,
    teamA: "House Vayu (SR)",
    teamB: "House Akash (JR)",
    date: "2026-09-13",
    time: "09:00 AM",
    venue: "College Ground B",
    status: "UPCOMING",
    scoreA: null,
    scoreB: null,
    result: null
  },
  {
    id: 6,
    matchNo: 6,
    teamA: "House Jal (JR)",
    teamB: "House Terra (SR)",
    date: "2026-09-13",
    time: "11:30 AM",
    venue: "College Ground A",
    status: "UPCOMING",
    scoreA: null,
    scoreB: null,
    result: null
  },
  {
    id: 7,
    matchNo: 7,
    teamA: "House Agni (JR)",
    teamB: "House Akash (JR)",
    date: "2026-09-14",
    time: "09:00 AM",
    venue: "College Ground A",
    status: "UPCOMING",
    scoreA: null,
    scoreB: null,
    result: null
  }
];

// ============================================================
// LEADERS DATA
// ============================================================

const DEFAULT_RUN_SCORERS = [
  { rank: 1, name: "Arjun Sharma", team: "House Akash (JR)", runs: 245, balls: 198, fours: 22, sixes: 8, sr: "123.7", hs: "89*" },
  { rank: 2, name: "Ravi Patel", team: "House Agni (JR)", runs: 198, balls: 175, fours: 18, sixes: 5, sr: "113.1", hs: "76" },
  { rank: 3, name: "Kiran Reddy", team: "House Vayu (SR)", runs: 176, balls: 160, fours: 14, sixes: 6, sr: "110.0", hs: "65" },
  { rank: 4, name: "Suresh Kumar", team: "House Jal (JR)", runs: 154, balls: 132, fours: 12, sixes: 4, sr: "116.7", hs: "71*" },
  { rank: 5, name: "Pranav Nair", team: "House Prudvi (SR)", runs: 132, balls: 118, fours: 10, sixes: 3, sr: "111.9", hs: "58" }
];

const DEFAULT_WICKET_TAKERS = [
  { rank: 1, name: "Deepak Verma", team: "House Akash (JR)", wickets: 9, overs: "18.0", runs: 110, economy: "6.1", best: "4/22" },
  { rank: 2, name: "Mohit Singh", team: "House Agni (JR)", wickets: 7, overs: "15.3", runs: 98, economy: "6.3", best: "3/18" },
  { rank: 3, name: "Aditya Rao", team: "House Prudvi (SR)", wickets: 6, overs: "14.0", runs: 92, economy: "6.6", best: "3/24" },
  { rank: 4, name: "Vijay Das", team: "House Jal (JR)", wickets: 5, overs: "12.2", runs: 78, economy: "6.3", best: "2/15" },
  { rank: 5, name: "Harsh Mehta", team: "House Terra (SR)", wickets: 4, overs: "11.0", runs: 85, economy: "7.7", best: "2/20" }
];
