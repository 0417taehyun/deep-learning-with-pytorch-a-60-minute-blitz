/*
 * Quiz engine for "Deep Learning with PyTorch: A 60 Minute Blitz".
 *
 * Used by two kinds of pages:
 *   N/quiz.html  <body data-page="chapter" data-root="..">  loads N/questions.js
 *   main.html    <body data-page="hub" data-root=".">       loads every N/questions.js
 *
 * Each questions.js pushes one chapter object onto window.QUIZ_CHAPTERS.
 * Progress lives in localStorage under "pytorch-blitz-quiz:*" keys.
 */
(() => {
  "use strict";

  /* ---------- data ---------- */
  const PAGE = document.body.dataset.page === "hub" ? "hub" : "chapter";
  const ROOT = (document.body.dataset.root || ".").replace(/\/+$/, "");
  const CHAPTERS = (window.QUIZ_CHAPTERS || []).slice().sort((a, b) => Number(a.dir) - Number(b.dir));
  const BY_ID = new Map();
  CHAPTERS.forEach((ch) => ch.questions.forEach((q) => BY_ID.set(q.id, { q, ch })));
  const NAV = [
    { dir: "1", title: { ko: "텐서", en: "Tensors" } },
    { dir: "2", title: { ko: "autograd", en: "autograd" } },
    { dir: "3", title: { ko: "분류기 학습", en: "Training a Classifier" } },
    { dir: "4", title: { ko: "신경망", en: "Neural Networks" } },
  ];
  const PREFIX = "pytorch-blitz-quiz:";
  const LANG_KEY = PREFIX + "lang";
  const MIXED_KEY = PREFIX + "mixed";
  const MIX_SETTINGS_KEY = PREFIX + "mixed-settings";
  const LETTERS = "ABCDEFGH";
  const SERIES = "Deep Learning with PyTorch: A 60 Minute Blitz";
  const app = document.getElementById("app");

  const UI = {
    ko: {
      intro: (t, b) => `튜토리얼 핵심 개념 ${t}문제와, 튜토리얼에는 없지만 꼭 알아야 할 심화 ${b}문제로 구성되어 있어요. 답을 고르면 각 선택지가 왜 정답이고 왜 오답인지 바로 보여 줘요.`,
      source: "공식 튜토리얼 보기",
      others: "퀴즈 목록",
      home: "← 퀴즈 홈",
      reset: "↺ 처음부터",
      answered: (d, n) => `<b>${d}</b> / ${n} 풀이`,
      tagTutorial: "튜토리얼", tagTutorialTip: "공식 튜토리얼에서 다루는 내용",
      tagBeyond: "심화 · 튜토리얼 밖", tagBeyondTip: "튜토리얼에는 직접 나오지 않지만 함께 알아 두면 좋은 필수 지식",
      whyCorrect: "✓ 정답인 이유", whyWrong: "✗ 오답인 이유", whyOther: "오답인 이유", mine: "내 선택",
      correct: "정답이에요!", wrong: "아쉬워요, 오답이에요.", answerIs: (l) => `정답은 ${l}입니다.`,
      concept: "핵심 정리", tryit: "직접 실행해 보기", copy: "복사", copied: "복사됨 ✓",
      prev: "← 이전", next: "다음 →", finish: "결과 보기",
      hint: "<kbd>1</kbd>–<kbd>4</kbd> 선택 · <kbd>←</kbd> <kbd>→</kbd> 이동",
      confirmReset: "진행 상황을 지우고 처음부터 다시 풀까요? (선택지 순서도 다시 섞여요)",
      resultTitle: "결과",
      tutorialScore: "튜토리얼 문제", beyondScore: "심화 문제",
      unanswered: (n) => `아직 안 푼 문제가 ${n}개 있어요.`,
      continue_: "남은 문제 풀기", retryWrong: "틀린 문제만 다시 풀기", restart: "처음부터 다시 풀기",
      reviewTitle: "문제별 결과 (눌러서 해설 다시 보기)",
      msg: (r) => r === 1 ? "완벽해요! 이 범위의 개념을 확실히 이해했어요. 🎉"
        : r >= .75 ? "아주 좋아요! 틀린 문제의 해설만 한 번 더 확인해 보세요."
        : r >= .5 ? "절반 이상 맞혔어요. 해설을 읽고 튜토리얼을 한 번 더 보면 금방 채울 수 있어요."
        : "괜찮아요, 퀴즈는 배우는 도구예요. 해설의 코드를 main.py에서 직접 실행해 본 뒤 다시 도전해 보세요.",
      // hub
      hubTitle: "PyTorch 60분 블리츠 퀴즈",
      hubIntro: "단원을 골라 차례로 풀거나, 여러 단원의 문제를 섞어서 풀어 보세요. 풀이 기록은 이 브라우저에 저장돼요.",
      chaptersTitle: "단원별 퀴즈",
      chaptersSub: "각 단원의 문제 목록에서 원하는 문제로 바로 이동할 수도 있어요.",
      tutorialLink: "튜토리얼 ↗",
      qcount: (n, t, b) => `${n}문제 · 튜토리얼 ${t} · 심화 ${b}`,
      notStarted: "아직 시작하지 않았어요",
      progressLine: (d, n, c, w) => `${d}/${n} 풀이 · ✓ ${c} · ✗ ${w}`,
      startCh: "풀기", continueCh: "이어 풀기", reviewCh: "다시 보기",
      listShow: "문제 목록", listHide: "목록 접기",
      mixTitle: "섞어서 풀기",
      mixSub: "고른 단원의 문제를 무작위로 섞어서 출제해요. 선택지 순서도 매번 섞이고, 기록은 단원 퀴즈와 따로 저장돼요.",
      mixChapters: "단원", mixKind: "문제 종류", mixScope: "범위", mixCount: "문제 수",
      kindAll: "전체", kindTutorial: "튜토리얼", kindBeyond: "심화",
      scopeAll: "모든 문제", scopeWrong: (n) => `단원 퀴즈에서 틀린 문제 (${n})`,
      countAll: "전부",
      poolInfo: (n, m) => n ? `조건에 맞는 문제 ${n}개 중 ${m}개를 출제해요.` : "조건에 맞는 문제가 없어요. 조건을 바꿔 보세요.",
      mixStart: (m) => `${m}문제 섞어서 시작`,
      resumeInfo: (d, n) => `진행 중인 섞어 풀기: ${n}문제 중 <b>${d}</b>개 풀이`,
      resume: "이어 풀기", discard: "버리기",
      confirmReplace: "진행 중인 섞어 풀기를 버리고 새로 시작할까요?",
      mixedTitle: "섞어서 풀기",
      mixedSub: (chs, n) => `${chs} · ${n}문제`,
      reshuffle: "같은 조건으로 새로 섞기", changeSettings: "조건 바꾸기",
      homeBtn: "퀴즈 홈으로",
      footnote: "터미널에서 `make quiz` 또는 `python3 quiz.py`로 이 페이지를 열 수 있어요.",
      loadError: "문제 파일(questions.js)을 불러오지 못했어요.",
    },
    en: {
      intro: (t, b) => `${t} questions on the tutorial's core concepts, plus ${b} "beyond the tutorial" questions on must-know related knowledge. After you answer, every option explains why it is right or wrong.`,
      source: "Open the official tutorial",
      others: "Quizzes",
      home: "← Quiz home",
      reset: "↺ Restart",
      answered: (d, n) => `<b>${d}</b> / ${n} answered`,
      tagTutorial: "Tutorial", tagTutorialTip: "Covered in the official tutorial",
      tagBeyond: "Beyond the tutorial", tagBeyondTip: "Not covered directly in the tutorial, but essential related knowledge",
      whyCorrect: "✓ Why this is correct", whyWrong: "✗ Why this is wrong", whyOther: "Why this is wrong", mine: "Your pick",
      correct: "Correct!", wrong: "Not quite.", answerIs: (l) => `The answer is ${l}.`,
      concept: "Key takeaways", tryit: "Try it yourself", copy: "Copy", copied: "Copied ✓",
      prev: "← Prev", next: "Next →", finish: "See results",
      hint: "<kbd>1</kbd>–<kbd>4</kbd> select · <kbd>←</kbd> <kbd>→</kbd> navigate",
      confirmReset: "Clear your progress and start over? (Option order will be reshuffled.)",
      resultTitle: "Results",
      tutorialScore: "Tutorial questions", beyondScore: "Beyond-the-tutorial questions",
      unanswered: (n) => `You still have ${n} unanswered question${n > 1 ? "s" : ""}.`,
      continue_: "Continue", retryWrong: "Retry wrong answers", restart: "Start over",
      reviewTitle: "Per-question results (click to review the explanation)",
      msg: (r) => r === 1 ? "Perfect! You've nailed these concepts. 🎉"
        : r >= .75 ? "Great job! Just review the explanations for the ones you missed."
        : r >= .5 ? "More than half right. Read the explanations, revisit the tutorial, and you'll fill the gaps quickly."
        : "No worries — quizzes are for learning. Run the explanation snippets in your main.py, then try again.",
      // hub
      hubTitle: "PyTorch 60-Minute Blitz Quizzes",
      hubIntro: "Work through a chapter, or mix questions from several chapters. Your progress is saved in this browser.",
      chaptersTitle: "Quizzes by chapter",
      chaptersSub: "Open a chapter's question list to jump straight to any question.",
      tutorialLink: "Tutorial ↗",
      qcount: (n, t, b) => `${n} questions · ${t} tutorial · ${b} beyond`,
      notStarted: "Not started yet",
      progressLine: (d, n, c, w) => `${d}/${n} answered · ✓ ${c} · ✗ ${w}`,
      startCh: "Start", continueCh: "Continue", reviewCh: "Review",
      listShow: "Questions", listHide: "Hide list",
      mixTitle: "Mixed practice",
      mixSub: "Questions from the chapters you pick, in random order. Options are reshuffled too, and progress is saved separately from the chapter quizzes.",
      mixChapters: "Chapters", mixKind: "Type", mixScope: "Scope", mixCount: "Questions",
      kindAll: "All", kindTutorial: "Tutorial", kindBeyond: "Beyond",
      scopeAll: "All questions", scopeWrong: (n) => `Missed in chapter quizzes (${n})`,
      countAll: "All",
      poolInfo: (n, m) => n ? `${m} of ${n} matching questions will be asked.` : "No questions match. Try different settings.",
      mixStart: (m) => `Start ${m} mixed question${m > 1 ? "s" : ""}`,
      resumeInfo: (d, n) => `Mixed practice in progress: <b>${d}</b> of ${n} answered`,
      resume: "Continue", discard: "Discard",
      confirmReplace: "Discard the mixed practice in progress and start a new one?",
      mixedTitle: "Mixed practice",
      mixedSub: (chs, n) => `${chs} · ${n} questions`,
      reshuffle: "Reshuffle with same settings", changeSettings: "Change settings",
      homeBtn: "Back to quiz home",
      footnote: "Open this page from a terminal with `make quiz` or `python3 quiz.py`.",
      loadError: "Couldn't load the question file (questions.js).",
    },
  };

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const L = (v) => (v == null ? "" : typeof v === "string" ? v : v[lang] ?? v.en ?? v.ko ?? "");
  const clamp = (x, lo, hi) => Math.min(Math.max(lo, x), hi);
  const navTitle = (dir) => { const n = NAV.find((x) => x.dir === dir); return n ? L(n.title) : dir; };

  function inline(s) {
    return String(s).split(/(`[^`]+`)/g).map((part) => {
      if (part.length > 1 && part[0] === "`" && part[part.length - 1] === "`") return "<code>" + esc(part.slice(1, -1)) + "</code>";
      return esc(part).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    }).join("");
  }
  function md(s) {
    return String(s).trim().split(/\n{2,}/).map((block) => {
      let html = "", para = [], list = [];
      const flushP = () => { if (para.length) { html += "<p>" + para.map(inline).join("<br>") + "</p>"; para = []; } };
      const flushL = () => { if (list.length) { html += "<ul>" + list.map((x) => "<li>" + inline(x) + "</li>").join("") + "</ul>"; list = []; } };
      for (const line of block.split("\n")) {
        if (/^- /.test(line)) { flushP(); list.push(line.slice(2)); } else { flushL(); para.push(line); }
      }
      flushP(); flushL();
      return html;
    }).join("");
  }
  const KW = new Set(["import", "from", "as", "def", "class", "return", "for", "in", "if", "else", "elif", "with", "while", "not", "and", "or", "is", "None", "True", "False", "lambda", "try", "except", "pass", "super", "self", "print"]);
  function hl(code) {
    const re = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|[fr]?"(?:\\.|[^"\\\n])*"|[fr]?'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|([A-Za-z_]\w*)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="t-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="t-str">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="t-num">' + esc(m[3]) + "</span>";
      else out += KW.has(m[4]) ? '<span class="t-kw">' + esc(m[4]) + "</span>" : esc(m[4]);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }
  const trimCode = (c) => String(c).replace(/^\n+|\s+$/g, "");
  const codeBlock = (c) => '<pre class="code"><code>' + hl(trimCode(c)) + "</code></pre>";
  function shuffled(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } },
  };
  function initialLang() {
    try { const s = localStorage.getItem(LANG_KEY); if (s === "ko" || s === "en") return s; } catch (e) { /* ignore */ }
    return /^en/i.test(navigator.language || "") ? "en" : "ko";
  }
  let lang = initialLang();

  /* ---------- sessions ----------
   * A session is { mode: "chapter" | "mixed", key, st }, where st is
   * { items: [question ids], answers: {id: option index}, order: {id: [option permutation]},
   *   current, view: "quiz" | "result", settings }  (settings only for mixed practice). */
  const nOpts = (id) => BY_ID.get(id).q.options.length;
  function freshState(ids, settings) {
    const order = {};
    ids.forEach((id) => { order[id] = shuffled(nOpts(id)); });
    return { items: ids.slice(), answers: {}, order, current: 0, view: "quiz", settings: settings || null };
  }
  function sanitize(raw, ids) {
    if (!raw || !raw.order || !ids.length || !ids.every((id) => BY_ID.has(id))) return null;
    const isPerm = (p, n) => Array.isArray(p) && p.length === n && p.slice().sort((a, b) => a - b).every((v, i) => v === i);
    if (!ids.every((id) => isPerm(raw.order[id], nOpts(id)))) return null;
    const answers = {};
    ids.forEach((id) => {
      const a = raw.answers && raw.answers[id];
      if (Number.isInteger(a) && a >= 0 && a < nOpts(id)) answers[id] = a;
    });
    return {
      items: ids.slice(), answers, order: raw.order,
      current: clamp(raw.current | 0, 0, ids.length - 1),
      view: raw.view === "result" ? "result" : "quiz",
      settings: raw.settings || null,
    };
  }
  const chapterIds = (ch) => ch.questions.map((q) => q.id);
  const loadChapterState = (ch) => sanitize(store.get(PREFIX + ch.id), chapterIds(ch));
  function loadMixedState() {
    const raw = store.get(MIXED_KEY);
    return raw && Array.isArray(raw.items) ? sanitize(raw, raw.items) : null;
  }
  const save = (sess) => store.set(sess.key, sess.st);
  const isCorrect = (st, id) => st.answers[id] != null && BY_ID.get(id).q.options[st.answers[id]].ok;
  function stats(st, pred) {
    let c = 0, w = 0, t = 0;
    st.items.forEach((id) => {
      const { q, ch } = BY_ID.get(id);
      if (pred && !pred(q, ch)) return;
      t++;
      if (st.answers[id] == null) return;
      q.options[st.answers[id]].ok ? c++ : w++;
    });
    return { c, w, t, done: c + w };
  }

  let chapterSess = null;
  let mixedSess = null;
  if (PAGE === "chapter" && CHAPTERS.length) {
    const ch = CHAPTERS[0];
    chapterSess = { mode: "chapter", key: PREFIX + ch.id, ch, st: loadChapterState(ch) || freshState(chapterIds(ch)) };
    const m = /^#q(\d+)$/.exec(location.hash);
    if (m) { chapterSess.st.view = "quiz"; chapterSess.st.current = clamp(Number(m[1]) - 1, 0, chapterSess.st.items.length - 1); }
  } else if (PAGE === "hub") {
    const st = loadMixedState();
    mixedSess = st ? { mode: "mixed", key: MIXED_KEY, st } : null;
  }

  /* ---------- mixed practice settings ---------- */
  const KINDS = ["all", "tutorial", "beyond"], SCOPES = ["all", "wrong"], COUNTS = [10, 20, 0];
  function loadMix() {
    const s = store.get(MIX_SETTINGS_KEY) || {};
    const dirs = CHAPTERS.map((c) => c.dir);
    return {
      chapters: Array.isArray(s.chapters) ? s.chapters.filter((d) => dirs.includes(d)) : dirs,
      kind: KINDS.includes(s.kind) ? s.kind : "all",
      scope: SCOPES.includes(s.scope) ? s.scope : "all",
      count: COUNTS.includes(s.count) ? s.count : 10,
    };
  }
  let mix = PAGE === "hub" ? loadMix() : null;
  const openLists = new Set();

  function pool(settings) {
    const out = [];
    CHAPTERS.forEach((ch) => {
      if (!settings.chapters.includes(ch.dir)) return;
      const chSt = settings.scope === "wrong" ? loadChapterState(ch) : null;
      ch.questions.forEach((q) => {
        if (settings.kind !== "all" && q.tag !== settings.kind) return;
        if (settings.scope === "wrong" && !(chSt && chSt.answers[q.id] != null && !isCorrect(chSt, q.id))) return;
        out.push(q.id);
      });
    });
    return out;
  }
  const route = () => (PAGE === "hub" && location.hash === "#mixed" && mixedSess ? "mixed" : "home");
  const activeSession = () => (PAGE === "chapter" ? chapterSess : route() === "mixed" ? mixedSess : null);

  /* ---------- shared view parts ---------- */
  const langSeg = () => `
    <div class="seg" role="group" aria-label="Language">
      <button type="button" data-act="lang" data-lang="ko" aria-pressed="${lang === "ko"}">한국어</button>
      <button type="button" data-act="lang" data-lang="en" aria-pressed="${lang === "en"}">English</button>
    </div>`;
  const tagChip = (q, withTip) => {
    const u = UI[lang];
    return q.tag === "beyond"
      ? `<span class="tag tag-beyond"${withTip ? ` title="${esc(u.tagBeyondTip)}"` : ""}>${u.tagBeyond}</span>`
      : withTip ? `<span class="tag tag-tutorial" title="${esc(u.tagTutorialTip)}">${u.tagTutorial}</span>` : "";
  };
  const statusIcon = (st, id) => st && st.answers[id] != null
    ? (isCorrect(st, id) ? '<span class="ok-t">✓</span>' : '<span class="bad-t">✗</span>')
    : '<span style="color:var(--muted)">–</span>';

  function progressView(sess) {
    const u = UI[lang], st = sess.st, s = stats(st), N = st.items.length;
    const dots = st.items.map((id, i) => {
      const { q } = BY_ID.get(id);
      const cls = ["dot"];
      if (st.answers[id] != null) cls.push(isCorrect(st, id) ? "d-ok" : "d-bad");
      if (q.tag === "beyond") cls.push("d-beyond");
      if (st.view === "quiz" && i === st.current) cls.push("d-cur");
      const label = `Q${i + 1}${st.answers[id] != null ? (isCorrect(st, id) ? " ✓" : " ✗") : ""}`;
      return `<button type="button" class="${cls.join(" ")}" data-act="goto" data-i="${i}" aria-label="${label}" title="${esc(L(q.topic))}">${i + 1}</button>`;
    }).join("");
    return `
      <section class="progress">
        <div class="progress-meta">
          <span>${u.answered(s.done, N)}</span>
          <span><span class="ok-t">✓ ${s.c}</span> · <span class="bad-t">✗ ${s.w}</span></span>
        </div>
        <div class="bar"><div style="width:${(s.done / N) * 100}%"></div></div>
        <div class="dots">${dots}</div>
      </section>`;
  }

  function quizView(sess) {
    const u = UI[lang], st = sess.st, N = st.items.length;
    const i = st.current, id = st.items[i];
    const { q, ch } = BY_ID.get(id);
    const order = st.order[id];
    const ans = st.answers[id];
    const isAns = ans != null;
    const correctLetter = LETTERS[order.indexOf(q.options.findIndex((o) => o.ok))];

    const opts = order.map((oi, k) => {
      const o = q.options[oi];
      const cls = ["opt"];
      let mark = "";
      if (isAns) {
        if (o.ok) { cls.push("is-correct"); mark = "✓"; }
        else if (oi === ans) { cls.push("is-wrong"); mark = "✗"; }
        else cls.push("is-dim");
      }
      const body = o.c != null ? `<pre>${hl(trimCode(o.c))}</pre>` : inline(L(o.t));
      const mine = isAns && oi === ans ? `<span class="mine">${u.mine}</span>` : "";
      const kind = o.ok ? "ok" : oi === ans ? "bad" : "other";
      const why = isAns
        ? `<div class="why why-${kind}"><span class="why-label">${o.ok ? u.whyCorrect : oi === ans ? u.whyWrong : u.whyOther}</span><div class="prose">${md(L(o.why))}</div></div>`
        : "";
      return `<li>
          <button type="button" class="${cls.join(" ")}" data-act="pick" data-idx="${oi}" ${isAns ? "disabled" : ""}>
            <span class="letter">${LETTERS[k]}</span>
            <span class="opt-body">${body}${mine}</span>
            <span class="mark" aria-hidden="true">${mark}</span>
          </button>${why}
        </li>`;
    }).join("");

    const ok = isAns && q.options[ans].ok;
    const feedback = isAns ? `
        <div class="feedback ${ok ? "ok" : "bad"}" role="status">${ok ? "✓ " + u.correct : "✗ " + u.wrong + ` <span class="sub">${u.answerIs(correctLetter)}</span>`}</div>
        <div class="explain">
          <h3>${u.concept}</h3>
          <div class="prose">${md(L(q.explain))}</div>
          ${q.tryit ? `<div class="tryit"><div class="tryit-head"><span>${u.tryit}</span><button type="button" class="ghost" data-act="copy">${u.copy}</button></div>${codeBlock(q.tryit)}</div>` : ""}
        </div>` : "";

    const chChip = sess.mode === "mixed" ? `<span class="chip-ch">${esc(ch.dir)}. ${esc(navTitle(ch.dir))}</span>` : "";
    return `
      ${progressView(sess)}
      <article class="card" id="card">
        <div class="card-head">
          <span class="qnum">Q${i + 1}</span>${chChip}${tagChip(q, true)}
          <span class="topic">${esc(L(q.topic))}</span>
        </div>
        <div class="question prose">${md(L(q.q))}</div>
        ${q.code ? codeBlock(q.code) : ""}
        <ol class="options">${opts}</ol>
        ${feedback}
      </article>
      <div class="nav">
        <button type="button" class="btn" data-act="prev" ${i === 0 ? "disabled" : ""}>${u.prev}</button>
        <span class="hint">${u.hint}</span>
        <button type="button" class="btn primary" data-act="next" id="nextBtn">${i === N - 1 ? u.finish : u.next}</button>
      </div>`;
  }

  function resultView(sess) {
    const u = UI[lang], st = sess.st, N = st.items.length;
    const s = stats(st);
    const boxes = [];
    const sT = stats(st, (q) => q.tag !== "beyond"), sB = stats(st, (q) => q.tag === "beyond");
    if (sT.t) boxes.push(`<div>${u.tutorialScore}<b>${sT.c} / ${sT.t}</b></div>`);
    if (sB.t) boxes.push(`<div>${u.beyondScore}<b>${sB.c} / ${sB.t}</b></div>`);
    const perChapter = sess.mode === "mixed"
      ? CHAPTERS.map((ch) => ({ ch, s: stats(st, (q, c) => c === ch) })).filter((x) => x.s.t)
        .map(({ ch, s: cs }) => `<div>${esc(ch.dir)}. ${esc(navTitle(ch.dir))}<b>${cs.c} / ${cs.t}</b></div>`).join("")
      : "";
    const left = N - s.done;
    const items = st.items.map((id, i) => {
      const { q, ch } = BY_ID.get(id);
      const where = sess.mode === "mixed" ? `<span class="chip-ch">${esc(ch.dir)}</span> ` : "";
      return `<li><button type="button" data-act="goto" data-i="${i}"><span class="rq">Q${i + 1}</span>${statusIcon(st, id)}<span>${where}${esc(L(q.topic))}</span>${tagChip(q, false)}</button></li>`;
    }).join("");
    const homeAction = sess.mode === "mixed"
      ? `<button type="button" class="btn" data-act="reshuffle">${u.reshuffle}</button><a class="btn" href="#home">${u.changeSettings}</a>`
      : `<button type="button" class="btn" data-act="restart">${u.restart}</button><a class="btn" href="${ROOT}/main.html">${u.homeBtn}</a>`;
    return `
      ${progressView(sess)}
      <article class="card result-card" id="card">
        <h2>${u.resultTitle}</h2>
        <div class="score-big">${s.c}<small> / ${N}</small></div>
        <p>${esc(u.msg(s.c / N))}</p>
        ${left ? `<p class="bad-t">${u.unanswered(left)}</p>` : ""}
        <div class="split">${boxes.join("")}</div>
        ${perChapter ? `<div class="split">${perChapter}</div>` : ""}
        <div class="actions">
          ${left ? `<button type="button" class="btn primary" data-act="continue">${u.continue_}</button>` : ""}
          ${s.w ? `<button type="button" class="btn ${left ? "" : "primary"}" data-act="retry-wrong">${u.retryWrong}</button>` : ""}
          ${homeAction}
        </div>
        <h3 style="margin:22px 0 0;font-size:15px">${u.reviewTitle}</h3>
        <ol class="review">${items}</ol>
      </article>`;
  }

  const sessionView = (sess) => (sess.st.view === "result" ? resultView(sess) : quizView(sess));

  /* ---------- page views ---------- */
  function chapterHeader() {
    const u = UI[lang], ch = chapterSess.ch;
    const nB = ch.questions.filter((q) => q.tag === "beyond").length, nT = ch.questions.length - nB;
    const sib = NAV.map((s) => s.dir === ch.dir
      ? `<span class="cur">${s.dir}. ${esc(L(s.title))}</span>`
      : `<a href="${ROOT}/${s.dir}/quiz.html">${s.dir}. ${esc(L(s.title))}</a>`).join("");
    return `
      <header>
        <div class="top-row">
          <div class="brand"><a class="home-link" href="${ROOT}/main.html">${u.home}</a><span class="badge">QUIZ ${esc(ch.dir)}</span></div>
          <div class="tools">${langSeg()}<button type="button" class="ghost" data-act="reset">${u.reset}</button></div>
        </div>
        <h1>${esc(L(ch.title))}</h1>
        <p class="intro">${esc(u.intro(nT, nB))} <a href="${esc(ch.source)}" target="_blank" rel="noopener">${u.source} ↗</a></p>
        <nav class="siblings" aria-label="${u.others}">${u.others}: ${sib}</nav>
      </header>`;
  }

  function mixedHeader() {
    const u = UI[lang], st = mixedSess.st;
    const dirs = CHAPTERS.filter((ch) => st.items.some((id) => BY_ID.get(id).ch === ch)).map((ch) => `${ch.dir}. ${navTitle(ch.dir)}`);
    return `
      <header>
        <div class="top-row">
          <div class="brand"><a class="home-link" href="#home">${u.home}</a><span class="badge">MIX</span></div>
          <div class="tools">${langSeg()}</div>
        </div>
        <h1>${u.mixedTitle}</h1>
        <p class="intro">${esc(u.mixedSub(dirs.join(", "), st.items.length))}</p>
      </header>`;
  }

  function hubView() {
    const u = UI[lang];
    const cards = CHAPTERS.map((ch) => {
      const st = loadChapterState(ch);
      const n = ch.questions.length;
      const nB = ch.questions.filter((q) => q.tag === "beyond").length;
      const s = st ? stats(st) : { c: 0, w: 0, done: 0 };
      const label = !s.done ? u.startCh : s.done < n ? u.continueCh : u.reviewCh;
      const open = openLists.has(ch.dir);
      const list = open ? `<ol class="qlist">${ch.questions.map((q, i) =>
        `<li><a href="${ROOT}/${ch.dir}/quiz.html#q${i + 1}"><span class="rq">Q${i + 1}</span>${statusIcon(st, q.id)}<span>${esc(L(q.topic))}</span>${tagChip(q, false)}</a></li>`).join("")}</ol>` : "";
      return `
        <article class="ch-card">
          <div class="ch-top"><span class="badge">QUIZ ${esc(ch.dir)}</span><a href="${esc(ch.source)}" target="_blank" rel="noopener">${u.tutorialLink}</a></div>
          <h3>${esc(L(ch.title))}</h3>
          <p class="desc">${esc(L(ch.summary))}</p>
          <p class="meta">${esc(u.qcount(n, n - nB, nB))}</p>
          <div class="bar"><div style="width:${(s.done / n) * 100}%"></div></div>
          <p class="meta">${s.done ? esc(u.progressLine(s.done, n, s.c, s.w)) : u.notStarted}</p>
          <div class="ch-actions">
            <a class="btn primary small" href="${ROOT}/${ch.dir}/quiz.html">${label}</a>
            <button type="button" class="btn small" data-act="toggle-list" data-dir="${esc(ch.dir)}" aria-expanded="${open}">${open ? u.listHide : u.listShow}</button>
          </div>
          ${list}
        </article>`;
    }).join("");

    const p = pool(mix);
    const m = mix.count ? Math.min(mix.count, p.length) : p.length;
    const wrongN = pool({ ...mix, scope: "wrong" }).length;
    const chip = (act, attrs, pressed, label, disabled) =>
      `<button type="button" class="chip" data-act="${act}" ${attrs} aria-pressed="${pressed}" ${disabled ? "disabled" : ""}>${label}</button>`;
    const chapterChips = CHAPTERS.map((ch) => chip("mix-ch", `data-dir="${esc(ch.dir)}"`, mix.chapters.includes(ch.dir), `${esc(ch.dir)}. ${esc(navTitle(ch.dir))}`)).join("");
    const kindChips = [["all", u.kindAll], ["tutorial", u.kindTutorial], ["beyond", u.kindBeyond]]
      .map(([v, label]) => chip("mix-set", `data-k="kind" data-v="${v}"`, mix.kind === v, label)).join("");
    const scopeChips = chip("mix-set", 'data-k="scope" data-v="all"', mix.scope === "all", u.scopeAll)
      + chip("mix-set", 'data-k="scope" data-v="wrong"', mix.scope === "wrong", esc(u.scopeWrong(wrongN)), !wrongN && mix.scope !== "wrong");
    const countChips = COUNTS.map((v) => chip("mix-set", `data-k="count" data-v="${v}"`, mix.count === v, v ? String(v) : u.countAll)).join("");
    let resume = "";
    if (mixedSess) {
      const ms = stats(mixedSess.st);
      resume = `
        <div class="resume">
          <span>${u.resumeInfo(ms.done, mixedSess.st.items.length)}</span>
          <span class="ch-actions">
            <a class="btn primary small" href="#mixed">${u.resume}</a>
            <button type="button" class="btn small" data-act="discard-mixed">${u.discard}</button>
          </span>
        </div>`;
    }

    return `
      <header>
        <div class="top-row">
          <div class="brand"><span class="badge">QUIZ</span>${esc(SERIES)}</div>
          <div class="tools">${langSeg()}</div>
        </div>
        <h1>${u.hubTitle}</h1>
        <p class="intro">${esc(u.hubIntro)}</p>
      </header>
      <section class="section">
        <h2>${u.chaptersTitle}</h2>
        <p class="sub">${esc(u.chaptersSub)}</p>
        <div class="ch-grid">${cards}</div>
      </section>
      <section class="section">
        <h2>${u.mixTitle}</h2>
        <p class="sub">${esc(u.mixSub)}</p>
        <div class="panel">
          ${resume}
          <div class="field"><span class="label">${u.mixChapters}</span><div class="chips">${chapterChips}</div></div>
          <div class="field"><span class="label">${u.mixKind}</span><div class="chips">${kindChips}</div></div>
          <div class="field"><span class="label">${u.mixScope}</span><div class="chips">${scopeChips}</div></div>
          <div class="field"><span class="label">${u.mixCount}</span><div class="chips">${countChips}</div></div>
          <div class="mix-foot">
            <span class="meta">${esc(u.poolInfo(p.length, m))}</span>
            <button type="button" class="btn primary" data-act="start-mixed" ${p.length ? "" : "disabled"}>${esc(u.mixStart(m))}</button>
          </div>
        </div>
      </section>
      <p class="footnote">${inline(u.footnote)}</p>`;
  }

  function render() {
    document.documentElement.lang = lang;
    if (!CHAPTERS.length) { app.innerHTML = `<p>${UI[lang].loadError}</p>`; return; }
    if (PAGE === "chapter") {
      document.title = `${L(chapterSess.ch.title)} · Quiz ${chapterSess.ch.dir}`;
      app.innerHTML = chapterHeader() + sessionView(chapterSess);
      save(chapterSess);
      syncHash();
    } else if (route() === "mixed") {
      document.title = `${UI[lang].mixedTitle} · PyTorch Blitz Quiz`;
      app.innerHTML = mixedHeader() + sessionView(mixedSess);
      save(mixedSess);
    } else {
      document.title = UI[lang].hubTitle;
      app.innerHTML = hubView();
    }
  }

  /* ---------- actions ---------- */
  function syncHash() {
    const st = chapterSess.st;
    const hash = st.view === "quiz" ? "#q" + (st.current + 1) : "";
    if (location.hash === hash) return;
    try { history.replaceState(null, "", location.pathname + location.search + hash); } catch (e) { /* some browsers block this on file:// */ }
  }
  function scrollToCard() {
    const el = document.getElementById("card");
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function go(sess, i) {
    sess.st.view = "quiz";
    sess.st.current = clamp(i, 0, sess.st.items.length - 1);
    render();
    scrollToCard();
  }
  function pick(sess, idx) {
    const id = sess.st.items[sess.st.current];
    if (sess.st.answers[id] != null) return;
    sess.st.answers[id] = idx;
    render();
    const fb = app.querySelector(".feedback");
    if (fb) fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const nb = document.getElementById("nextBtn");
    if (nb) nb.focus({ preventScroll: true });
  }
  function next(sess) {
    if (sess.st.current < sess.st.items.length - 1) go(sess, sess.st.current + 1);
    else { sess.st.view = "result"; render(); scrollToCard(); }
  }
  function retryWrong(sess) {
    const wrong = sess.st.items.filter((id) => sess.st.answers[id] != null && !isCorrect(sess.st, id));
    if (!wrong.length) return;
    wrong.forEach((id) => { delete sess.st.answers[id]; sess.st.order[id] = shuffled(nOpts(id)); });
    go(sess, sess.st.items.indexOf(wrong[0]));
  }
  function restartChapter(ask) {
    if (!chapterSess) return;
    if (ask &&Object.keys(chapterSess.st.answers).length && !confirm(UI[lang].confirmReset)) return;
    chapterSess.st = freshState(chapterSess.st.items);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function startMixed(settings, force) {
    const p = pool(settings);
    if (!p.length) return;
    if (!force && mixedSess) {
      const s = stats(mixedSess.st);
      if (s.done > 0 && s.done < mixedSess.st.items.length && !confirm(UI[lang].confirmReplace)) return;
    }
    const ids = shuffled(p.length).map((i) => p[i]).slice(0, settings.count || p.length);
    mixedSess = { mode: "mixed", key: MIXED_KEY, st: freshState(ids, { ...settings, chapters: settings.chapters.slice() }) };
    save(mixedSess);
    if (location.hash === "#mixed") { render(); window.scrollTo(0, 0); }
    else location.hash = "mixed";
  }
  async function copyCode(sess, btn) {
    const { q } = BY_ID.get(sess.st.items[sess.st.current]);
    const text = trimCode(q.tryit || "");
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e2) { /* ignore */ }
      ta.remove();
    }
    btn.textContent = UI[lang].copied;
    setTimeout(() => { btn.textContent = UI[lang].copy; }, 1400);
  }
  function setMix(k, v) {
    if (k === "count") mix.count = Number(v);
    else mix[k] = v;
    store.set(MIX_SETTINGS_KEY, mix);
    render();
  }

  app.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    const sess = activeSession();
    switch (b.dataset.act) {
      case "lang":
        lang = b.dataset.lang;
        try { localStorage.setItem(LANG_KEY, lang); } catch (err) { /* ignore */ }
        render();
        break;
      case "pick": if (sess) pick(sess, Number(b.dataset.idx)); break;
      case "prev": if (sess) go(sess, sess.st.current - 1); break;
      case "next": if (sess) next(sess); break;
      case "goto": if (sess) go(sess, Number(b.dataset.i)); break;
      case "continue": if (sess) go(sess, Math.max(0, sess.st.items.findIndex((id) => sess.st.answers[id] == null))); break;
      case "retry-wrong": if (sess) retryWrong(sess); break;
      case "restart": restartChapter(false); break;
      case "reset": restartChapter(true); break;
      case "copy": if (sess) copyCode(sess, b); break;
      case "reshuffle": startMixed(mixedSess.st.settings || mix, true); break;
      case "toggle-list": {
        const d = b.dataset.dir;
        openLists.has(d) ? openLists.delete(d) : openLists.add(d);
        render();
        break;
      }
      case "mix-ch": {
        const d = b.dataset.dir;
        mix.chapters = mix.chapters.includes(d) ? mix.chapters.filter((x) => x !== d) : [...mix.chapters, d];
        setMix("chapters", mix.chapters);
        break;
      }
      case "mix-set": setMix(b.dataset.k, b.dataset.v); break;
      case "start-mixed": startMixed(mix, false); break;
      case "discard-mixed":
        store.del(MIXED_KEY);
        mixedSess = null;
        render();
        break;
    }
  });

  document.addEventListener("keydown", (e) => {
    const sess = activeSession();
    if (e.metaKey || e.ctrlKey || e.altKey || !sess || sess.st.view !== "quiz") return;
    const id = sess.st.items[sess.st.current];
    const answered = sess.st.answers[id] != null;
    const key = e.key.toLowerCase();
    const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
    if (key in map && !answered) {
      const order = sess.st.order[id];
      if (map[key] < order.length) { e.preventDefault(); pick(sess, order[map[key]]); }
    } else if (e.key === "ArrowRight") { e.preventDefault(); next(sess); }
    else if (e.key === "ArrowLeft") { if (sess.st.current > 0) { e.preventDefault(); go(sess, sess.st.current - 1); } }
    else if (e.key === "Enter" && answered && !(e.target.closest && e.target.closest("button, a"))) { e.preventDefault(); next(sess); }
  });

  window.addEventListener("hashchange", () => {
    if (PAGE === "hub") { render(); window.scrollTo(0, 0); return; }
    const m = /^#q(\d+)$/.exec(location.hash);
    if (m && chapterSess && Number(m[1]) - 1 !== chapterSess.st.current) go(chapterSess, Number(m[1]) - 1);
  });
  // Refresh from storage when this page is shown again (back/forward cache) or another tab saved progress.
  function reloadFromStorage() {
    if (PAGE === "chapter" && chapterSess) chapterSess.st = loadChapterState(chapterSess.ch) || chapterSess.st;
    if (PAGE === "hub") { const st = loadMixedState(); mixedSess = st ? { mode: "mixed", key: MIXED_KEY, st } : null; }
    render();
  }
  window.addEventListener("pageshow", (e) => { if (e.persisted) reloadFromStorage(); });
  window.addEventListener("storage", (e) => {
    if (PAGE === "hub" && route() === "home" && e.key && e.key.startsWith(PREFIX)) reloadFromStorage();
  });

  if (PAGE === "hub" && location.hash === "#mixed" && !mixedSess) {
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* ignore */ }
  }
  render();
})();
