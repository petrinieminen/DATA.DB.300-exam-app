/* ───────────── DATA.DB.300 Exam Trainer — App Logic ───────────── */

(function () {
  "use strict";

  // ── DOM references ──
  const menuScreen     = document.getElementById("menu-screen");
  const quizScreen     = document.getElementById("quiz-screen");
  const resultsScreen  = document.getElementById("results-screen");
  const statsBar       = document.getElementById("stats-bar");

  const statsCorrect   = document.getElementById("stats-correct");
  const statsWrong     = document.getElementById("stats-wrong");
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
  const btnBackToMenu  = document.getElementById("btn-back-to-menu");
  const btnRetry       = document.getElementById("btn-retry");
  const btnMenu        = document.getElementById("btn-menu");

  // ── State ──
  let currentCategory = null;
  let questions = [];
  let currentIndex = 0;
  let correct = 0;
  let wrong = 0;
  let answered = false;
  let wrongAnswers = [];

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
      // Mix all categories, tag each question
      let all = [];
      for (const cat of Object.keys(QUESTIONS)) {
        for (const q of QUESTIONS[cat]) {
          all.push({ ...q, _category: cat });
        }
      }
      return shuffle(all);
    } else {
      return shuffle(QUESTIONS[category].map(q => ({ ...q, _category: category })));
    }
  }

  // ── Start quiz ──
  function startQuiz(category) {
    currentCategory = category;
    questions = buildQuestions(category);
    currentIndex = 0;
    correct = 0;
    wrong = 0;
    wrongAnswers = [];
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
    statsRemaining.textContent = `📋 ${questions.length - currentIndex} remaining`;
    const total = correct + wrong;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    statsScore.textContent = `🎯 ${pct}%`;
  }

  // ── Render current question ──
  function renderQuestion() {
    answered = false;
    btnNext.classList.add("hidden");
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

    // Options
    optionsContainer.innerHTML = "";
    const letters = ["A", "B", "C", "D", "E", "F"];
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${escapeHtml(opt)}</span>`;
      btn.addEventListener("click", () => handleAnswer(i));
      optionsContainer.appendChild(btn);
    });
  }

  // ── Handle answer selection ──
  function handleAnswer(selected) {
    if (answered) return;
    answered = true;

    const q = questions[currentIndex];
    const isCorrect = selected === q.answer;

    if (isCorrect) {
      correct++;
    } else {
      wrong++;
      wrongAnswers.push({
        question: q.q,
        yourAnswer: q.options[selected],
        correctAnswer: q.options[q.answer],
        explanation: q.explanation,
        category: q._category
      });
    }

    // Highlight options
    const buttons = optionsContainer.querySelectorAll(".option-btn");
    buttons.forEach((btn, i) => {
      btn.classList.add("disabled");
      if (i === q.answer) btn.classList.add("correct");
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

    const total = correct + wrong;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = pct >= 50;

    document.getElementById("results-title").textContent =
      passed ? "🎉 Quiz Complete!" : "Quiz Complete";

    document.getElementById("results-score").textContent = `${pct}%`;
    document.getElementById("results-score").style.color = passed ? "var(--green)" : "var(--red)";

    const passEl = document.getElementById("results-pass");
    passEl.textContent = passed ? "✅ PASS (≥50%)" : "❌ FAIL (<50%)";
    passEl.className = `results-pass ${passed ? "pass" : "fail"}`;

    // Breakdown
    document.getElementById("results-breakdown").innerHTML = `
      <div class="breakdown-item"><div class="num" style="color:var(--green)">${correct}</div><div class="lbl">Correct</div></div>
      <div class="breakdown-item"><div class="num" style="color:var(--red)">${wrong}</div><div class="lbl">Wrong</div></div>
      <div class="breakdown-item"><div class="num">${total}</div><div class="lbl">Total</div></div>
    `;

    // Review wrong answers
    const reviewList = document.getElementById("review-list");
    if (wrongAnswers.length === 0) {
      reviewList.innerHTML = "<p style='text-align:center;color:var(--green);'>Perfect score — no mistakes! 🌟</p>";
    } else {
      reviewList.innerHTML = wrongAnswers.map((wa, i) => `
        <div class="review-card">
          <div class="review-q">${LABELS[wa.category]} — ${escapeHtml(wa.question)}</div>
          <div class="review-your">Your answer: ${escapeHtml(wa.yourAnswer)}</div>
          <div class="review-correct">Correct answer: ${escapeHtml(wa.correctAnswer)}</div>
          <div class="review-explanation">💡 ${escapeHtml(wa.explanation)}</div>
        </div>
      `).join("");
    }
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

    // Enter or right arrow for next
    if ((e.key === "Enter" || e.key === "ArrowRight") && answered) {
      nextQuestion();
    }
  });

})();
