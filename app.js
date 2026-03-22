/* ───────────── DATA.DB.300 Exam Trainer — App Logic ───────────── */

(function () {
  "use strict";

  // ── Constants ──
  const EXAM_QUESTION_COUNT = 24;
  const POINTS_CORRECT = 2;
  const POINTS_WRONG = -1;
  const POINTS_SKIP = 0;
  const PASS_POINTS = 22;
  const MAX_POINTS = EXAM_QUESTION_COUNT * POINTS_CORRECT; // 48

  // ── DOM references ──
  const menuScreen     = document.getElementById("menu-screen");
  const quizScreen     = document.getElementById("quiz-screen");
  const resultsScreen  = document.getElementById("results-screen");
  const statsBar       = document.getElementById("stats-bar");

  const statsCorrect   = document.getElementById("stats-correct");
  const statsWrong     = document.getElementById("stats-wrong");
  const statsSkipped   = document.getElementById("stats-skipped");
  const statsRemaining = document.getElementById("stats-remaining");
  const statsScore     = document.getElementById("stats-score");

  const qNumber        = document.getElementById("question-number");
  const qCategory      = document.getElementById("question-category");
  const qText          = document.getElementById("question-text");
  const codeBlock      = document.getElementById("code-block");
  const codeContent    = document.getElementById("code-content");
  const optionsContainer = document.getElementById("options-container");
  const explanationBox = document.getElementById("explanation-box");
  const explanationText = document.getElementById("explanation-text");
  const btnNext        = document.getElementById("btn-next");
  const btnSkip        = document.getElementById("btn-skip");
  const btnBackToMenu  = document.getElementById("btn-back-to-menu");
  const btnRetry       = document.getElementById("btn-retry");
  const btnMenu        = document.getElementById("btn-menu");

  // ── State ──
  let currentCategory = null;
  let questions = [];
  let currentIndex = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let answered = false;
  let wrongAnswers = [];
  let skippedQuestions = [];
  let shuffledCorrectIndex = 0;
  let isExamMode = false;

  // ── Category labels ──
  const LABELS = {
    postgresql: "🐘 PostgreSQL",
    cassandra:  "👁️ Cassandra",
    mongodb:    "🍃 MongoDB",
    others:     "🧩 Others"
  };

  // ── Utility: shuffle array (Fisher–Yates) ──
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Screen management ──
  function showScreen(screen) {
    menuScreen.classList.add("hidden");
    quizScreen.classList.add("hidden");
    resultsScreen.classList.add("hidden");
    statsBar.classList.add("hidden");
    screen.classList.remove("hidden");
  }

  function showMenu() {
    showScreen(menuScreen);
  }

  // ── Build questions for a category ──
  function buildQuestions(category) {
    if (category === "all") {
      // Exam simulation: pick 6 from each category (24 total)
      let all = [];
      const cats = Object.keys(QUESTIONS);
      const perCat = Math.floor(EXAM_QUESTION_COUNT / cats.length); // 6
      for (const cat of cats) {
        const catQs = shuffle(QUESTIONS[cat]).slice(0, perCat);
        for (const q of catQs) {
          all.push({ ...q, _category: cat });
        }
      }
      return shuffle(all);
    } else {
      return shuffle(QUESTIONS[category].map(q => ({ ...q, _category: category })));
    }
  }

  // ── Compute score ──
  function getScore() {
    return (correct * POINTS_CORRECT) + (wrong * POINTS_WRONG) + (skipped * POINTS_SKIP);
  }

  // ── Start quiz ──
  function startQuiz(category) {
    currentCategory = category;
    isExamMode = category === "all";
    questions = buildQuestions(category);
    currentIndex = 0;
    correct = 0;
    wrong = 0;
    skipped = 0;
    wrongAnswers = [];
    skippedQuestions = [];
    answered = false;

    showScreen(quizScreen);
    statsBar.classList.remove("hidden");
    updateStats();
    renderQuestion();
  }

  // ── Update stats bar ──
  function updateStats() {
    statsCorrect.textContent   = `✅ ${correct}`;
    statsWrong.textContent     = `❌ ${wrong}`;
    statsSkipped.textContent   = `⏭️ ${skipped}`;
    statsRemaining.textContent = `📋 ${questions.length - currentIndex} remaining`;
    const score = getScore();
    if (isExamMode) {
      statsScore.textContent = `🎯 ${score}/${MAX_POINTS} pts`;
    } else {
      const total = correct + wrong + skipped;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      statsScore.textContent = `🎯 ${score} pts (${pct}%)`;
    }
  }

  // ── Render current question ──
  function renderQuestion() {
    answered = false;
    btnNext.classList.add("hidden");
    btnSkip.classList.remove("hidden");
    explanationBox.classList.add("hidden");

    const q = questions[currentIndex];
    qNumber.textContent = `Q${currentIndex + 1}/${questions.length}`;
    qCategory.textContent = LABELS[q._category] || q._category;
    qText.textContent = q.q;

    // Code block
    if (q.code) {
      codeBlock.classList.remove("hidden");
      codeContent.textContent = q.code;
    } else {
      codeBlock.classList.add("hidden");
      codeContent.textContent = "";
    }

    // Shuffle options and track correct answer's new position
    const indexed = q.options.map((opt, i) => ({ text: opt, origIndex: i }));
    const shuffled = shuffle(indexed);
    shuffledCorrectIndex = shuffled.findIndex(o => o.origIndex === q.answer);

    // Options
    optionsContainer.innerHTML = "";
    const letters = ["A", "B", "C", "D", "E", "F"];
    shuffled.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${escapeHtml(opt.text)}</span>`;
      btn.addEventListener("click", () => handleAnswer(i));
      optionsContainer.appendChild(btn);
    });
  }

  // ── Handle answer selection ──
  function handleAnswer(selected) {
    if (answered) return;
    answered = true;
    btnSkip.classList.add("hidden");

    const q = questions[currentIndex];
    const isCorrect = selected === shuffledCorrectIndex;

    // Read displayed text from the rendered buttons
    const buttons = optionsContainer.querySelectorAll(".option-btn");
    const selectedText = buttons[selected].querySelector("span:last-child").textContent;
    const correctText = buttons[shuffledCorrectIndex].querySelector("span:last-child").textContent;

    if (isCorrect) {
      correct++;
    } else {
      wrong++;
      wrongAnswers.push({
        question: q.q,
        yourAnswer: selectedText,
        correctAnswer: correctText,
        explanation: q.explanation,
        category: q._category
      });
    }

    // Highlight options
    buttons.forEach((btn, i) => {
      btn.classList.add("disabled");
      if (i === shuffledCorrectIndex) btn.classList.add("correct");
      if (i === selected && !isCorrect) btn.classList.add("wrong");
    });

    // Show explanation
    explanationText.textContent = q.explanation;
    explanationBox.classList.remove("hidden");

    // Show next button (or finish)
    btnNext.textContent = currentIndex < questions.length - 1 ? "Next Question →" : "See Results 🏁";
    btnNext.classList.remove("hidden");

    updateStats();
  }

  // ── Handle skip ("I don't know") ──
  function handleSkip() {
    if (answered) return;
    answered = true;
    btnSkip.classList.add("hidden");
    skipped++;

    const q = questions[currentIndex];
    const buttons = optionsContainer.querySelectorAll(".option-btn");
    const correctText = buttons[shuffledCorrectIndex].querySelector("span:last-child").textContent;

    skippedQuestions.push({
      question: q.q,
      correctAnswer: correctText,
      explanation: q.explanation,
      category: q._category
    });

    // Highlight correct answer
    buttons.forEach((btn, i) => {
      btn.classList.add("disabled");
      if (i === shuffledCorrectIndex) btn.classList.add("correct");
    });

    // Show explanation
    explanationText.textContent = q.explanation;
    explanationBox.classList.remove("hidden");

    btnNext.textContent = currentIndex < questions.length - 1 ? "Next Question →" : "See Results 🏁";
    btnNext.classList.remove("hidden");

    updateStats();
  }

  // ── Next question or results ──
  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= questions.length) {
      showResults();
    } else {
      renderQuestion();
    }
  }

  // ── Show results ──
  function showResults() {
    showScreen(resultsScreen);

    const total = correct + wrong + skipped;
    const score = getScore();

    if (isExamMode) {
      const passed = score >= PASS_POINTS;

      document.getElementById("results-title").textContent =
        passed ? "🎉 Quiz Complete!" : "Quiz Complete";

      document.getElementById("results-score").textContent = `${score} / ${MAX_POINTS} pts`;
      document.getElementById("results-score").style.color = passed ? "var(--green)" : "var(--red)";

      const passEl = document.getElementById("results-pass");
      passEl.textContent = passed ? `✅ PASS (≥${PASS_POINTS} pts)` : `❌ FAIL (need ${PASS_POINTS} pts)`;
      passEl.className = `results-pass ${passed ? "pass" : "fail"}`;
    } else {
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const passed = pct >= 50;

      document.getElementById("results-title").textContent =
        passed ? "🎉 Quiz Complete!" : "Quiz Complete";

      document.getElementById("results-score").textContent = `${score} pts (${pct}%)`;
      document.getElementById("results-score").style.color = passed ? "var(--green)" : "var(--red)";

      const passEl = document.getElementById("results-pass");
      passEl.textContent = passed ? "✅ PASS" : "❌ FAIL";
      passEl.className = `results-pass ${passed ? "pass" : "fail"}`;
    }

    // Breakdown
    document.getElementById("results-breakdown").innerHTML = `
      <div class="breakdown-item"><div class="num" style="color:var(--green)">${correct}</div><div class="lbl">Correct (+${correct * POINTS_CORRECT})</div></div>
      <div class="breakdown-item"><div class="num" style="color:var(--red)">${wrong}</div><div class="lbl">Wrong (${wrong * POINTS_WRONG})</div></div>
      <div class="breakdown-item"><div class="num" style="color:var(--orange)">${skipped}</div><div class="lbl">Skipped (0)</div></div>
      <div class="breakdown-item"><div class="num">${total}</div><div class="lbl">Total</div></div>
    `;

    // Review wrong + skipped answers
    const reviewList = document.getElementById("review-list");
    let html = "";

    if (wrongAnswers.length === 0 && skippedQuestions.length === 0) {
      html = "<p style='text-align:center;color:var(--green);'>Perfect score — no mistakes! 🌟</p>";
    } else {
      if (wrongAnswers.length > 0) {
        html += `<h4 style="color:var(--red);margin:1rem 0 .5rem;">❌ Wrong answers (−1 pt each)</h4>`;
        html += wrongAnswers.map(wa => `
          <div class="review-card">
            <div class="review-q">${LABELS[wa.category]} — ${escapeHtml(wa.question)}</div>
            <div class="review-your">Your answer: ${escapeHtml(wa.yourAnswer)}</div>
            <div class="review-correct">Correct answer: ${escapeHtml(wa.correctAnswer)}</div>
            <div class="review-explanation">💡 ${escapeHtml(wa.explanation)}</div>
          </div>
        `).join("");
      }

      if (skippedQuestions.length > 0) {
        html += `<h4 style="color:var(--orange);margin:1rem 0 .5rem;">⏭️ Skipped questions (0 pts each)</h4>`;
        html += skippedQuestions.map(sq => `
          <div class="review-card">
            <div class="review-q">${LABELS[sq.category]} — ${escapeHtml(sq.question)}</div>
            <div class="review-correct">Correct answer: ${escapeHtml(sq.correctAnswer)}</div>
            <div class="review-explanation">💡 ${escapeHtml(sq.explanation)}</div>
          </div>
        `).join("");
      }
    }
    reviewList.innerHTML = html;
  }

  // ── Escape HTML ──
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ── Event listeners ──
  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      const cat = card.dataset.category;
      startQuiz(cat);
    });
  });

  btnNext.addEventListener("click", nextQuestion);
  btnSkip.addEventListener("click", handleSkip);
  btnBackToMenu.addEventListener("click", showMenu);
  btnRetry.addEventListener("click", () => startQuiz(currentCategory));
  btnMenu.addEventListener("click", showMenu);

  // ── Keyboard support ──
  document.addEventListener("keydown", (e) => {
    if (quizScreen.classList.contains("hidden")) return;

    // 1-4 or A-D to select answer
    const keyMap = { "1": 0, "2": 1, "3": 2, "4": 3, "a": 0, "b": 1, "c": 2, "d": 3 };
    const idx = keyMap[e.key.toLowerCase()];
    if (idx !== undefined && !answered) {
      handleAnswer(idx);
      return;
    }

    // S to skip
    if (e.key.toLowerCase() === "s" && !answered) {
      handleSkip();
      return;
    }

    // Enter or right arrow for next
    if ((e.key === "Enter" || e.key === "ArrowRight") && answered) {
      nextQuestion();
    }
  });

})();
