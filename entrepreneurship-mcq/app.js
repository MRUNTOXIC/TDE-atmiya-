(function () {
  const STORAGE_KEY = "entrepreneurshipMcqTrainer:v1";
  const THEME_KEY = "entrepreneurshipMcqTrainer:theme";
  // index = box; box 1 is "repeat soon" so it stays due immediately.
  const BOX_INTERVALS_DAYS = [0, 0, 1, 3, 7, 14];

  const state = {
    route: "dashboard",
    activeUnitId: null,
    questions: [],
    units: [],
    progress: {},
    session: null, // { mode, queue, idx, revealed, answers }
  };

  const $ = (sel) => document.querySelector(sel);
  const viewRoot = () => $("#viewRoot");

  function now() {
    return Date.now();
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};
      return parsed;
    } catch {
      return {};
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  }

  function ensureProgressFor(id) {
    if (!state.progress[id]) {
      state.progress[id] = {
        box: 1,
        dueAt: 0,
        seen: 0,
        correct: 0,
        wrong: 0,
        fav: false,
        note: "",
        lastAnswer: null,
      };
    }
    return state.progress[id];
  }

  function dueCount() {
    const t = now();
    let count = 0;
    for (const q of state.questions) {
      const p = ensureProgressFor(q.id);
      if ((p.dueAt || 0) <= t) count += 1;
    }
    return count;
  }

  function pickQuestions({ unitIds, limit, dueOnly, shuffle }) {
    const t = now();
    let pool = state.questions;
    if (unitIds && unitIds.length) {
      const set = new Set(unitIds);
      pool = pool.filter((q) => set.has(q.unitId));
    }
    if (dueOnly) pool = pool.filter((q) => (ensureProgressFor(q.id).dueAt || 0) <= t);
    if (shuffle) pool = shuffleArray(pool.slice());
    if (limit && limit > 0) pool = pool.slice(0, limit);
    return pool;
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    const label = theme === "light" ? "Light" : "Dark";
    const el = $("#themeLabel");
    if (el) el.textContent = label;
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return setTheme(saved);
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(prefersLight ? "light" : "dark");
  }

  function renderUnits() {
    const unitList = $("#unitList");
    unitList.innerHTML = state.units
      .map((u) => {
        const active = u.id === state.activeUnitId ? "is-active" : "";
        const learned = countLearnedInUnit(u.id);
        const pct = u.count ? Math.round((learned / u.count) * 100) : 0;
        return `
          <div class="unit-item ${active}" role="button" tabindex="0" data-unit="${escapeHtml(u.id)}">
            <div class="unit-name">
              <div class="unit-title">${escapeHtml(u.label)}</div>
              <div class="unit-sub">${learned}/${u.count} mastered • ${pct}%</div>
            </div>
            <div class="badge">${u.count}</div>
          </div>
        `;
      })
      .join("");
  }

  function countLearnedInUnit(unitId) {
    let n = 0;
    for (const q of state.questions) {
      if (q.unitId !== unitId) continue;
      const p = ensureProgressFor(q.id);
      if ((p.box || 1) >= 4) n += 1;
    }
    return n;
  }

  function setRoute(route) {
    state.route = route;
    state.session = null;
    document.querySelectorAll(".nav-item").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.route === route);
    });
    renderView();
  }

  function setActiveUnit(unitId) {
    state.activeUnitId = unitId;
    renderUnits();
    renderView();
  }

  function startLearn({ unitIds, dueOnly, random } = {}) {
    const queue = pickQuestions({
      unitIds,
      limit: null,
      dueOnly: !!dueOnly,
      shuffle: !!random || !dueOnly,
    });
    state.session = {
      mode: "learn",
      queue,
      idx: 0,
      revealed: false,
      lastMark: null,
    };
    state.route = "learn";
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("is-active", b.dataset.route === "learn"));
    renderView();
  }

  function startTest({ unitIds, count, shuffle, instantFeedback } = {}) {
    const queue = pickQuestions({ unitIds, limit: null, dueOnly: false, shuffle: !!shuffle });
    const selected = count && count > 0 && count < queue.length ? queue.slice(0, count) : queue;
    state.session = {
      mode: "test",
      queue: selected,
      idx: 0,
      answers: {}, // id -> chosenKey
      instantFeedback: !!instantFeedback,
      revealedIds: {}, // id -> true (show correct/wrong styling)
      recordedIds: {}, // id -> true (progress already recorded)
      finished: false, // guard against double-recording
    };
    state.route = "test";
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("is-active", b.dataset.route === "test"));
    renderView();
  }

  function markLearnResult(questionId, knewIt) {
    const p = ensureProgressFor(questionId);
    p.seen += 1;
    if (knewIt) {
      p.correct += 1;
      p.box = Math.min(5, (p.box || 1) + 1);
    } else {
      p.wrong += 1;
      p.box = 1;
    }
    const intervalDays = BOX_INTERVALS_DAYS[p.box] ?? 7;
    p.dueAt = now() + intervalDays * 24 * 60 * 60 * 1000;
    saveProgress();
    renderUnits();
  }

  function recordTestAnswer(questionId, chosenKey) {
    const p = ensureProgressFor(questionId);
    p.seen += 1;
    p.lastAnswer = chosenKey;
    const q = state.questions.find((x) => x.id === questionId);
    const correct = q ? q.correct : null;
    if (chosenKey && correct && chosenKey === correct) {
      p.correct += 1;
      p.box = Math.min(5, (p.box || 1) + 1);
    } else {
      p.wrong += 1;
      p.box = 1;
    }
    const intervalDays = BOX_INTERVALS_DAYS[p.box] ?? 7;
    p.dueAt = now() + intervalDays * 24 * 60 * 60 * 1000;
    saveProgress();
    renderUnits();
  }

  function toggleFav(questionId) {
    const p = ensureProgressFor(questionId);
    p.fav = !p.fav;
    saveProgress();
    renderView();
  }

  function updateNote(questionId, note) {
    const p = ensureProgressFor(questionId);
    p.note = String(note || "");
    saveProgress();
  }

  function resetProgress() {
    if (!confirm("Reset all saved progress?")) return;
    state.progress = {};
    saveProgress();
    renderUnits();
    renderView();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatUnitPills(unitIds) {
    if (!unitIds || !unitIds.length) return `<span class="pill warn">All units</span>`;
    return unitIds
      .map((id) => {
        const u = state.units.find((x) => x.id === id);
        return `<span class="pill">${escapeHtml(u ? u.label : id)}</span>`;
      })
      .join(" ");
  }

  function renderDashboard() {
    const total = state.questions.length;
    const due = dueCount();
    const mastered = state.questions.filter((q) => (ensureProgressFor(q.id).box || 1) >= 4).length;
    const favs = state.questions.filter((q) => ensureProgressFor(q.id).fav).length;

    viewRoot().innerHTML = `
      <div class="grid">
        <div class="card">
          <h1 class="h1">Dashboard</h1>
          <div class="muted">Your personal unit-wise MCQ gym. Study due cards for memory, then test for speed.</div>
          <div class="hr"></div>
          <div class="grid two">
            <div class="kpi"><div class="kpi-label">Total MCQs</div><div class="kpi-value">${total}</div></div>
            <div class="kpi"><div class="kpi-label">Due now</div><div class="kpi-value">${due}</div></div>
            <div class="kpi"><div class="kpi-label">Mastered (box ≥ 4)</div><div class="kpi-value">${mastered}</div></div>
            <div class="kpi"><div class="kpi-label">Favourites</div><div class="kpi-value">${favs}</div></div>
          </div>
          <div class="footer-actions">
            <div class="row">
              <button class="btn btn-small" type="button" data-action="study-due">Study due (${due})</button>
              <button class="btn btn-small btn-ghost" type="button" data-action="learn-active-unit">Learn active unit</button>
              <button class="btn btn-small btn-ghost" type="button" data-action="test-active-unit">Test active unit</button>
            </div>
            <button class="btn btn-small btn-danger" type="button" data-action="reset-progress">Reset progress</button>
          </div>
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="panel-title" style="margin:0 0 8px 0;">Recommended</div>
              <div class="q">1) Study due cards (memory), 2) Learn a unit (understand), 3) Test (speed).</div>
              <div class="muted" style="margin-top:8px;">Tip: Add a short note in your own words for tough questions.</div>
            </div>
            <div>
              <div class="panel-title" style="margin:0 0 8px 0;">Active Unit</div>
              ${state.activeUnitId ? `<div class="row">${formatUnitPills([state.activeUnitId])}</div>` : `<div class="muted">Select a unit from the left.</div>`}
              <div class="hr"></div>
              <button class="btn btn-small" type="button" data-action="learn-active-unit">Learn</button>
              <button class="btn btn-small btn-ghost" type="button" data-action="test-active-unit">Test</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderLearn() {
    if (!state.session || state.session.mode !== "learn") {
      const unitOptions = state.units
        .map((u) => `<option value="${escapeHtml(u.id)}">${escapeHtml(u.label)} (${u.count})</option>`)
        .join("");
      viewRoot().innerHTML = `
        <div class="card">
          <h1 class="h1">Learn</h1>
          <div class="muted">Flashcard-style learning with spaced repetition boxes (Leitner-style).</div>
          <div class="hr"></div>
          <div class="grid two">
            <div>
              <label class="tiny">Unit</label>
              <select class="select" id="learnUnit">
                <option value="">All units</option>
                ${unitOptions}
              </select>
            </div>
            <div>
              <label class="tiny">Mode</label>
              <select class="select" id="learnMode">
                <option value="due">Study due (recommended)</option>
                <option value="all">Learn all (shuffled)</option>
              </select>
            </div>
          </div>
          <div class="footer-actions">
            <div class="row">
              <button class="btn btn-small" type="button" data-action="start-learn">Start learning</button>
              <button class="btn btn-small btn-ghost" type="button" data-action="start-random-learn">Random learn</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const s = state.session;
    const q = s.queue[s.idx];
    if (!q) {
      viewRoot().innerHTML = `
        <div class="card">
          <h1 class="h1">Learn</h1>
          <div class="muted">Session complete.</div>
          <div class="hr"></div>
          <div class="row">
            <span class="pill good">Nice work</span>
            <span class="pill">Try “Due” daily for memory</span>
          </div>
          <div class="footer-actions">
            <div class="row">
              <button class="btn btn-small" type="button" data-action="study-due">Study due</button>
              <button class="btn btn-small btn-ghost" type="button" data-action="go-learn-config">New learn session</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const p = ensureProgressFor(q.id);
    const total = s.queue.length;
    const idx = s.idx + 1;
    const revealed = !!s.revealed;
    const fav = !!p.fav;

    const opts = ["a", "b", "c", "d"]
      .map((k) => {
        const classes = revealed ? (k === q.correct ? "opt is-correct" : "opt") : "opt";
        return `
          <div class="${classes}" data-action="noop">
            <div class="opt-key">${k.toUpperCase()}</div>
            <div class="opt-text">${escapeHtml(q.options[k])}</div>
          </div>
        `;
      })
      .join("");

    viewRoot().innerHTML = `
      <div class="card">
        <div class="row" style="justify-content:space-between;">
          <div class="row">
            <span class="pill">${escapeHtml(q.unitLabel)}</span>
            <span class="pill">Card ${idx}/${total}</span>
            <span class="pill">Box ${p.box || 1}</span>
          </div>
          <button class="chip" type="button" data-action="toggle-fav" data-qid="${escapeHtml(q.id)}">
            ${fav ? "★ Favourite" : "☆ Favourite"}
          </button>
        </div>
        <div class="hr"></div>
        <div class="q">${escapeHtml(q.question)}</div>
        <div class="opts">${opts}</div>
        <div class="footer-actions">
          <div class="row">
            <button class="btn btn-small" type="button" data-action="reveal">Show answer</button>
            <button class="btn btn-small btn-ghost" type="button" data-action="prev">Prev</button>
            <button class="btn btn-small btn-ghost" type="button" data-action="next">Next</button>
          </div>
          <div class="row">
            <button class="btn btn-small" type="button" data-action="knew">I knew it</button>
            <button class="btn btn-small btn-danger" type="button" data-action="missed">I missed</button>
          </div>
        </div>
        <div class="hr"></div>
        <div class="grid">
          <div>
            <div class="tiny">Your note (helps memorize)</div>
            <textarea class="textarea" id="noteBox" placeholder="Write a short tip in your words…">${escapeHtml(p.note || "")}</textarea>
            <div class="tiny" style="margin-top:6px;">Saved automatically.</div>
          </div>
        </div>
      </div>
    `;

    const noteBox = $("#noteBox");
    if (noteBox) {
      noteBox.addEventListener("input", () => updateNote(q.id, noteBox.value), { passive: true });
    }
  }

  function renderTest() {
    if (!state.session || state.session.mode !== "test") {
      const unitChecks = state.units
        .map(
          (u) => `
            <label class="pill" style="cursor:pointer;">
              <input type="checkbox" class="unitCheck" value="${escapeHtml(u.id)}" />
              ${escapeHtml(u.label)} (${u.count})
            </label>
          `,
        )
        .join(" ");
      viewRoot().innerHTML = `
        <div class="card">
          <h1 class="h1">Test</h1>
          <div class="muted">Create a unit-wise test and check your score.</div>
          <div class="hr"></div>
          <div class="grid">
            <div>
              <div class="tiny">Units (leave empty = all units)</div>
              <div class="row">${unitChecks}</div>
            </div>
            <div class="grid two">
              <div>
                <label class="tiny">No. of questions</label>
                <select class="select" id="testCount">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="0">All</option>
                </select>
              </div>
              <div>
                <label class="tiny">Options</label>
                <select class="select" id="testOptions">
                  <option value="shuffle">Shuffle questions</option>
                  <option value="ordered">Keep order</option>
                </select>
              </div>
            </div>
            <div class="row">
              <label class="pill" style="cursor:pointer;">
                <input type="checkbox" id="instantFeedback" checked />
                Instant feedback
              </label>
            </div>
          </div>
          <div class="footer-actions">
            <div class="row">
              <button class="btn btn-small" type="button" data-action="start-test">Start test</button>
              <button class="btn btn-small btn-ghost" type="button" data-action="test-active-unit">Test active unit</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const s = state.session;
    const q = s.queue[s.idx];
    const total = s.queue.length;
    const idx = s.idx + 1;

    if (!q) {
      const result = scoreTest();
      viewRoot().innerHTML = `
        <div class="card">
          <h1 class="h1">Test Result</h1>
          <div class="row">
            <span class="pill good">Score: ${result.correct}/${result.total}</span>
            <span class="pill">Accuracy: ${result.accuracy}%</span>
            <span class="pill bad">Wrong: ${result.wrong}</span>
          </div>
          <div class="hr"></div>
          <div class="panel-title" style="margin:0 0 8px 0;">Review wrong answers</div>
          <div class="list">${result.wrongListHtml}</div>
          <div class="footer-actions">
            <div class="row">
              <button class="btn btn-small" type="button" data-action="go-test-config">New test</button>
              <button class="btn btn-small btn-ghost" type="button" data-action="retry-wrong">Retry wrong</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const chosen = s.answers[q.id] || null;
    const revealed = !!s.revealedIds[q.id];
    const unanswered = chosen ? "" : `<span class="pill warn">Unanswered</span>`;

    const opts = ["a", "b", "c", "d"]
      .map((k) => {
        const isChosen = chosen === k;
        const isCorrect = k === q.correct;
        const classes = !revealed
          ? `opt ${isChosen ? "is-active" : ""}`
          : `opt ${isCorrect ? "is-correct" : isChosen ? "is-wrong" : ""}`;
        return `
          <div class="${classes}" role="button" tabindex="0" data-action="choose" data-key="${k}">
            <div class="opt-key">${k.toUpperCase()}</div>
            <div class="opt-text">${escapeHtml(q.options[k])}</div>
          </div>
        `;
      })
      .join("");

    viewRoot().innerHTML = `
      <div class="card">
        <div class="row" style="justify-content:space-between;">
          <div class="row">
            <span class="pill">${escapeHtml(q.unitLabel)}</span>
            <span class="pill">Q ${idx}/${total}</span>
            ${unanswered}
          </div>
          <span class="pill">${Object.keys(s.answers).length} answered</span>
        </div>
        <div class="hr"></div>
        <div class="q">${escapeHtml(q.question)}</div>
        <div class="opts">${opts}</div>
        <div class="footer-actions">
          <div class="row">
            <button class="btn btn-small btn-ghost" type="button" data-action="test-prev">Prev</button>
            <button class="btn btn-small btn-ghost" type="button" data-action="test-next">Next</button>
          </div>
          <div class="row">
            <button class="btn btn-small btn-ghost" type="button" data-action="test-reveal">
              ${revealed ? "Hide" : "Check answer"}
            </button>
            <button class="btn btn-small" type="button" data-action="finish-test">Finish</button>
          </div>
        </div>
      </div>
    `;
  }

  function scoreTest() {
    const s = state.session;
    const wrong = [];
    let correct = 0;
    for (const q of s.queue) {
      const chosen = s.answers[q.id];
      if (chosen && chosen === q.correct) correct += 1;
      else wrong.push({ q, chosen });
    }
    const total = s.queue.length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const wrongListHtml = wrong
      .slice(0, 50)
      .map(({ q, chosen }) => {
        return `
          <div class="item">
            <div class="item-top">
              <div class="item-title">${escapeHtml(q.question)}</div>
              <span class="badge">${escapeHtml(q.unitLabel)}</span>
            </div>
            <div class="tiny">Your answer: ${chosen ? chosen.toUpperCase() : "—"} • Correct: ${q.correct.toUpperCase()}</div>
            <div class="tiny">Correct option: ${escapeHtml(q.options[q.correct])}</div>
          </div>
        `;
      })
      .join("");
    return { correct, wrong: wrong.length, total, accuracy, wrongListHtml, wrong };
  }

  function renderDue() {
    const due = pickQuestions({ unitIds: state.activeUnitId ? [state.activeUnitId] : [], limit: null, dueOnly: true, shuffle: false });
    viewRoot().innerHTML = `
      <div class="card">
        <h1 class="h1">Due</h1>
        <div class="muted">Questions due for review (based on your boxes).</div>
        <div class="hr"></div>
        <div class="row">
          <span class="pill">Due now: ${due.length}</span>
          ${state.activeUnitId ? `<span class="pill">${escapeHtml(state.units.find((u) => u.id === state.activeUnitId)?.label || state.activeUnitId)}</span>` : `<span class="pill warn">All units</span>`}
        </div>
        <div class="footer-actions">
          <div class="row">
            <button class="btn btn-small" type="button" data-action="study-due">Study due</button>
            <button class="btn btn-small btn-ghost" type="button" data-action="clear-active-unit">Clear unit filter</button>
          </div>
        </div>
        <div class="hr"></div>
        <div class="list">
          ${due.slice(0, 40).map((q) => `<div class="item"><div class="item-top"><div class="item-title">${escapeHtml(q.question)}</div><span class="badge">${escapeHtml(q.unitLabel)}</span></div><div class="tiny">Box ${ensureProgressFor(q.id).box || 1}</div></div>`).join("")}
        </div>
        ${due.length > 40 ? `<div class="tiny" style="margin-top:10px;">Showing 40 of ${due.length} due questions.</div>` : ""}
      </div>
    `;
  }

  function renderSearch() {
    viewRoot().innerHTML = `
      <div class="card">
        <h1 class="h1">Search</h1>
        <div class="muted">Type a keyword to find MCQs. Tip: search “IPR”, “BEP”, “SWOT”.</div>
        <div class="hr"></div>
        <input class="input" id="searchBox" placeholder="Search questions…" />
        <div class="hr"></div>
        <div class="list" id="searchResults"></div>
      </div>
    `;
    const box = $("#searchBox");
    const results = $("#searchResults");
    const doSearch = () => {
      const term = String(box.value || "").trim().toLowerCase();
      if (!term) {
        results.innerHTML = `<div class="tiny">Start typing to search.</div>`;
        return;
      }
      const matches = state.questions
        .filter((q) => q.question.toLowerCase().includes(term) || Object.values(q.options).some((o) => String(o).toLowerCase().includes(term)))
        .slice(0, 40);
      results.innerHTML = matches
        .map((q) => {
          const p = ensureProgressFor(q.id);
          return `
            <div class="item">
              <div class="item-top">
                <div class="item-title">${escapeHtml(q.question)}</div>
                <span class="badge">${escapeHtml(q.unitLabel)}</span>
              </div>
              <div class="tiny">Box ${p.box || 1} • ${p.fav ? "★ Favourite" : "☆"}</div>
              <div class="row" style="margin-top:8px;">
                <button class="btn btn-small btn-ghost" type="button" data-action="learn-one" data-qid="${escapeHtml(q.id)}">Learn this</button>
                <button class="btn btn-small btn-ghost" type="button" data-action="toggle-fav" data-qid="${escapeHtml(q.id)}">${p.fav ? "Unfavourite" : "Favourite"}</button>
              </div>
            </div>
          `;
        })
        .join("");
      if (!matches.length) results.innerHTML = `<div class="tiny">No matches.</div>`;
    };
    results.innerHTML = `<div class="tiny">Start typing to search.</div>`;
    box.addEventListener("input", doSearch, { passive: true });
  }

  function renderStats() {
    const total = state.questions.length;
    let seen = 0;
    let correct = 0;
    let wrong = 0;
    let fav = 0;
    for (const q of state.questions) {
      const p = ensureProgressFor(q.id);
      if (p.seen) seen += 1;
      correct += p.correct || 0;
      wrong += p.wrong || 0;
      if (p.fav) fav += 1;
    }
    const attempts = correct + wrong;
    const acc = attempts ? Math.round((correct / attempts) * 100) : 0;
    viewRoot().innerHTML = `
      <div class="card">
        <h1 class="h1">Stats</h1>
        <div class="muted">Progress is saved in your browser (localStorage).</div>
        <div class="hr"></div>
        <div class="grid two">
          <div class="kpi"><div class="kpi-label">Questions seen</div><div class="kpi-value">${seen}/${total}</div></div>
          <div class="kpi"><div class="kpi-label">Attempts</div><div class="kpi-value">${attempts}</div></div>
          <div class="kpi"><div class="kpi-label">Correct</div><div class="kpi-value">${correct}</div></div>
          <div class="kpi"><div class="kpi-label">Wrong</div><div class="kpi-value">${wrong}</div></div>
          <div class="kpi"><div class="kpi-label">Accuracy</div><div class="kpi-value">${acc}%</div></div>
          <div class="kpi"><div class="kpi-label">Favourites</div><div class="kpi-value">${fav}</div></div>
        </div>
        <div class="hr"></div>
        <div class="footer-actions">
          <button class="btn btn-small btn-danger" type="button" data-action="reset-progress">Reset progress</button>
        </div>
      </div>
    `;
  }

  function renderNotes() {
    const data = window.MCQ_NOTES;
    if (!data) {
      viewRoot().innerHTML = `
        <div class="card">
          <h1 class="h1">Notes</h1>
          <div class="muted">Notes data not loaded.</div>
        </div>
      `;
      return;
    }

    const notesHtml = data.notes
      .map((n) => {
        const body = (n.body || []).map((p) => `<div class="note-body">${escapeHtml(p)}</div>`).join("");
        const bullets = (n.bullets || []).length
          ? `<ul class="note-list">${n.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
          : "";
        const footer = n.footer ? `<div class="note-footer">${escapeHtml(n.footer)}</div>` : "";
        return `
          <details>
            <summary>${escapeHtml(n.title)}</summary>
            ${body}
            ${bullets}
            ${footer}
          </details>
        `;
      })
      .join("");

    const impHtml = data.importantQuestions
      .map((u) => {
        return `
          <details>
            <summary>${escapeHtml(u.unit)} – Important Questions</summary>
            <ul class="note-list">
              ${u.items.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}
            </ul>
          </details>
        `;
      })
      .join("");

    viewRoot().innerHTML = `
      <div class="grid">
        <div class="card">
          <h1 class="h1">Notes</h1>
          <div class="muted">Quick theory revision + unit-wise important questions.</div>
          <div class="hr"></div>
          <div class="grid">
            ${notesHtml}
          </div>
        </div>

        <div class="card">
          <h1 class="h1">Important Questions</h1>
          <div class="muted">AI-curated revision questions based on your Unit 1–5 syllabus + MCQs.</div>
          <div class="hr"></div>
          <div class="grid">
            ${impHtml}
          </div>
        </div>
      </div>
    `;
  }

  function renderView() {
    if (state.route === "dashboard") return renderDashboard();
    if (state.route === "learn") return renderLearn();
    if (state.route === "test") return renderTest();
    if (state.route === "notes") return renderNotes();
    if (state.route === "due") return renderDue();
    if (state.route === "search") return renderSearch();
    if (state.route === "stats") return renderStats();
    return renderDashboard();
  }

  function init() {
    initTheme();
    state.progress = loadProgress();

    const parsed = window.MCQ_SOURCE.parse(window.MCQ_SOURCE.raw);
    state.questions = parsed.questions;
    state.units = parsed.units;
    state.activeUnitId = state.units[0]?.id || null;

    // Migration: earlier versions treated "UNIT – 4: ..." as a full string id; map it to unit-4.
    // This keeps progress if you opened the app before the unit-title parser was improved.
    const oldUnit4 = "UNIT – 4: SUPPORT AGENCIES, INCUBATORS & IPR";
    const oldPrefix = `${oldUnit4}:`;
    const newPrefix = "unit-4:";
    const keys = Object.keys(state.progress || {});
    for (const k of keys) {
      if (!k.startsWith(oldPrefix)) continue;
      const suffix = k.slice(oldPrefix.length);
      const nk = `${newPrefix}${suffix}`;
      if (!state.progress[nk]) state.progress[nk] = state.progress[k];
    }
    saveProgress();

    renderUnits();
    renderView();

    const parseInfo = $("#parseInfo");
    const expected = 250;
    const got = state.questions.length;
    const msg =
      got === expected
        ? `Loaded ${got} MCQs.`
        : `Loaded ${got} MCQs from your pasted text. If you want exactly ${expected}, paste the remaining questions and I’ll add them.`;
    parseInfo.textContent = msg;

    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-route], [data-action], .unit-item");
      if (!target) return;

      if (target.classList.contains("unit-item")) {
        const unitId = target.dataset.unit;
        if (unitId) setActiveUnit(unitId);
        return;
      }

      if (target.dataset.route) {
        setRoute(target.dataset.route);
        return;
      }

      const action = target.dataset.action;
      if (!action) return;

      if (action === "start-due" || action === "study-due") {
        startLearn({ unitIds: state.activeUnitId ? [state.activeUnitId] : [], dueOnly: true });
        return;
      }

      if (action === "start-random-learn") {
        startLearn({ unitIds: [], dueOnly: false, random: true });
        return;
      }

      if (action === "learn-active-unit") {
        if (!state.activeUnitId) return;
        startLearn({ unitIds: [state.activeUnitId], dueOnly: false, random: true });
        return;
      }

      if (action === "test-active-unit") {
        if (!state.activeUnitId) return;
        startTest({ unitIds: [state.activeUnitId], count: 25, shuffle: true, instantFeedback: true });
        return;
      }

      if (action === "go-learn-config") {
        state.session = null;
        state.route = "learn";
        renderView();
        return;
      }

      if (action === "go-test-config") {
        state.session = null;
        state.route = "test";
        renderView();
        return;
      }

      if (action === "clear-active-unit") {
        state.activeUnitId = null;
        renderUnits();
        renderView();
        return;
      }

      if (action === "start-learn") {
        const unitId = ($("#learnUnit") || {}).value || "";
        const mode = ($("#learnMode") || {}).value || "due";
        startLearn({
          unitIds: unitId ? [unitId] : [],
          dueOnly: mode === "due",
          random: mode !== "due",
        });
        return;
      }

      if (action === "reveal") {
        if (!state.session) return;
        state.session.revealed = true;
        renderView();
        return;
      }

      if (action === "prev" || action === "next") {
        const s = state.session;
        if (!s || s.mode !== "learn") return;
        const dir = action === "next" ? 1 : -1;
        s.idx = Math.max(0, Math.min(s.queue.length - 1, s.idx + dir));
        s.revealed = false;
        renderView();
        return;
      }

      if (action === "knew" || action === "missed") {
        const s = state.session;
        if (!s || s.mode !== "learn") return;
        const q = s.queue[s.idx];
        if (!q) return;
        markLearnResult(q.id, action === "knew");
        s.revealed = true;
        s.idx = Math.min(s.queue.length, s.idx + 1);
        s.revealed = false;
        renderView();
        return;
      }

      if (action === "toggle-fav") {
        const id = target.dataset.qid;
        if (id) toggleFav(id);
        return;
      }

      if (action === "learn-one") {
        const id = target.dataset.qid;
        const q = state.questions.find((x) => x.id === id);
        if (!q) return;
        state.session = { mode: "learn", queue: [q], idx: 0, revealed: false };
        state.route = "learn";
        document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("is-active", b.dataset.route === "learn"));
        renderView();
        return;
      }

      if (action === "reset-progress") {
        resetProgress();
        return;
      }

      if (action === "start-test") {
        const unitIds = Array.from(document.querySelectorAll(".unitCheck:checked")).map((x) => x.value);
        const count = Number(($("#testCount") || {}).value || "25");
        const opt = ($("#testOptions") || {}).value || "shuffle";
        const instantFeedback = !!($("#instantFeedback") || {}).checked;
        startTest({ unitIds, count: count || 0, shuffle: opt === "shuffle", instantFeedback });
        return;
      }

      if (action === "choose") {
        const s = state.session;
        if (!s || s.mode !== "test") return;
        const key = target.dataset.key;
        const q = s.queue[s.idx];
        if (!q || !key) return;
        if (s.instantFeedback && s.revealedIds[q.id]) return; // lock once answered (prevents double-count)
        s.answers[q.id] = key;
        if (s.instantFeedback) s.revealedIds[q.id] = true;
        if (s.instantFeedback && !s.recordedIds[q.id]) {
          recordTestAnswer(q.id, key);
          s.recordedIds[q.id] = true;
        }
        renderView();
        return;
      }

      if (action === "test-reveal") {
        const s = state.session;
        if (!s || s.mode !== "test") return;
        const q = s.queue[s.idx];
        if (!q) return;
        // In non-instant mode this only reveals; it does NOT record progress.
        s.revealedIds[q.id] = !s.revealedIds[q.id];
        renderView();
        return;
      }

      if (action === "test-prev" || action === "test-next") {
        const s = state.session;
        if (!s || s.mode !== "test") return;
        const dir = action === "test-next" ? 1 : -1;
        s.idx = Math.max(0, Math.min(s.queue.length, s.idx + dir));
        renderView();
        return;
      }

      if (action === "finish-test") {
        const s = state.session;
        if (!s || s.mode !== "test") return;
        if (s.finished) return;
        // Ensure progress recorded for non-instant mode too (record once).
        if (!s.instantFeedback) {
          for (const q of s.queue) {
            if (s.recordedIds[q.id]) continue;
            recordTestAnswer(q.id, s.answers[q.id] || null);
            s.recordedIds[q.id] = true;
          }
        }
        s.finished = true;
        s.idx = s.queue.length; // triggers result view
        renderView();
        return;
      }

      if (action === "retry-wrong") {
        const result = scoreTest();
        const wrongQs = result.wrong.map((w) => w.q);
        state.session = { mode: "test", queue: wrongQs, idx: 0, answers: {}, instantFeedback: true, revealed: false };
        state.route = "test";
        renderView();
        return;
      }
    });

    const themeToggle = $("#themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const cur = document.documentElement.dataset.theme === "light" ? "light" : "dark";
        setTheme(cur === "light" ? "dark" : "light");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
