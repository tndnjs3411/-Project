(function () {
  const data = window.SPELLS_DATA || { spells: [] };
  const spells = data.spells;
  const SRC = data.source || "";

  // ---------- helpers ----------
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byName = (n) => spells.find((s) => s.name === n) || null;

  // ---------- 0. Cover ----------
  document.getElementById("cover-count").textContent = spells.length;

  // ---------- 2. Overall stats ----------
  const complexities = spells.map((s) => s.complexity);
  const mean = complexities.reduce((a, b) => a + b, 0) / complexities.length;
  const min = Math.min(...complexities);
  const max = Math.max(...complexities);
  document.getElementById("stat-count").textContent = spells.length;
  document.getElementById("stat-mean").textContent = mean.toFixed(1);
  document.getElementById("stat-min").textContent = min;
  document.getElementById("stat-max").textContent = max;

  // ---------- 3. Complexity distribution ----------
  const counts = {};
  for (let i = min; i <= max; i++) counts[i] = 0;
  spells.forEach((s) => { counts[s.complexity] = (counts[s.complexity] || 0) + 1; });
  const maxCount = Math.max(...Object.values(counts));

  const chart = document.getElementById("dist-chart");
  for (let level = min; level <= max; level++) {
    const count = counts[level] || 0;
    const pct = maxCount ? Math.round((count / maxCount) * 100) : 0;
    const col = document.createElement("div");
    col.className = "bar-col";
    col.innerHTML =
      '<span class="bar-val">' + count + "</span>" +
      '<div class="bar-track"><div class="bar" style="--h:' + pct + '%"></div></div>' +
      '<span class="bar-label">' + level + "학년</span>";
    chart.appendChild(col);
  }

  // ---------- 4. Difficulty tiers ----------
  const tierDefs = [
    { label: "초급 (1~2)", lo: 1, hi: 2, note: "처음 배우는 기본 마법" },
    { label: "중급 (3~5)", lo: 3, hi: 5, note: "실전에 자주 쓰는 실용 마법" },
    { label: "고급 (6~7)", lo: 6, hi: 7, note: "위험하거나 난해한 마법" },
  ];
  const tierGrid = document.getElementById("tier-cards");
  tierDefs.forEach((t) => {
    const members = spells.filter((s) => s.complexity >= t.lo && s.complexity <= t.hi);
    const card = document.createElement("div");
    card.className = "tier-card";
    card.innerHTML =
      "<h3>" + t.label + " · " + members.length + "개</h3>" +
      "<small>" + t.note + "</small><ul>" +
      members.map((s) => "<li>" + esc(s.name) + " <small>(난이도 " + s.complexity + ")</small></li>").join("") +
      "</ul>";
    tierGrid.appendChild(card);
  });

  // ---------- 5. Categories (keyword classification) ----------
  const CAT_RULES = [
    { label: "어둠의 마법", match: (s) => s.name === "Avada Kedavra" || s.name === "Sectumsempra" },
    { label: "방어·보호", match: (s) => /dementor|patronus|boggart/i.test(s.description) },
    { label: "전투·무장해제", match: (s) => /duel/i.test(s.description) },
    { label: "정신·기억", match: (s) => /memory|wipe/i.test(s.description) },
    { label: "생활·실용", match: () => true },
  ];
  const catMap = {};
  spells.forEach((s) => {
    const cat = CAT_RULES.find((r) => r.match(s));
    (catMap[cat.label] = catMap[cat.label] || []).push(s);
  });
  const catGrid = document.getElementById("cat-grid");
  Object.keys(catMap).forEach((label) => {
    const members = catMap[label];
    const card = document.createElement("div");
    card.className = "tier-card";
    card.innerHTML =
      "<h3>" + label + " · " + members.length + "개</h3><ul>" +
      members.map((s) => "<li>" + esc(s.name) + " <small>(난이도 " + s.complexity + ")</small></li>").join("") +
      "</ul>";
    catGrid.appendChild(card);
  });

  // ---------- 6. Insights ----------
  const high = spells.filter((s) => s.complexity === 7).map((s) => s.name);
  const mode = spells
    .reduce((acc, s) => { acc[s.complexity] = (acc[s.complexity] || 0) + 1; return acc; }, {});
  const modeLevel = Object.keys(mode).reduce((a, b) => (mode[a] >= mode[b] ? a : b));
  const insights = [
    "평균 난이도는 " + mean.toFixed(1) + "로 중급 중심, 최빈 난이도는 " + modeLevel + "학년(" + mode[modeLevel] + "개)이다.",
    "최고 난이도(7학년)는 " + high.join(", ") + " — 둘 다 어둡거나 치명적인 마법이다.",
    "생활·실용 주문이 " + (catMap["생활·실용"] || []).length + "개로 가장 많아, 마법 세계에서 일상 마법이 차지하는 비중이 크다.",
    "최저 난이도(1학년) 주문은 Wingardium Leviosa, Alohomora — 누구나 가장 먼저 배우는 마법이다.",
    "설명이 위트 있는 비공식 데이터로, 실제 서적 내 난이도 체계와는 다를 수 있다.",
  ];
  const insightList = document.getElementById("insights");
  insights.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    insightList.appendChild(li);
  });

  // ---------- 7. Full spell table ----------
  const tbody = document.querySelector("#spells-table tbody");
  spells.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + s.number + "</td>" +
      "<td>" + esc(s.name) + "</td>" +
      "<td>" + esc(s.description) + "</td>" +
      '<td><span class="badge">' + s.complexity + "</span></td>";
    tbody.appendChild(tr);
  });

  // ---------- 8. Init reveal.js ----------
  Reveal.initialize({
    hash: true,
    transition: "fade",
    backgroundTransition: "fade",
  });
  Reveal.sync();
})();
