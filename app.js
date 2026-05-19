/* ───────────── DATA.DB.300 Exam Trainer — App Logic ───────────── */

(function () {
  "use strict";

  // ── Constants ──
  const EXAM_QUESTION_COUNT = 24;
  const POINTS_CORRECT = 2;
  const POINTS_WRONG = -1;
  const POINTS_SKIP = 0;
  const PASS_RATIO = 0.5;
  const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

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
  let shuffledOptions = [];
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
      const all = [];
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

  function getMaxPoints() {
    return questions.length * POINTS_CORRECT;
  }

  function getPassPoints() {
    return Math.ceil(getMaxPoints() * PASS_RATIO);
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
      statsScore.textContent = `🎯 ${score}/${getMaxPoints()} pts`;
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
    if (!q) {
      showResults();
      return;
    }

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
    shuffledOptions = shuffle(indexed);
    shuffledCorrectIndex = shuffledOptions.findIndex(o => o.origIndex === q.answer);

    // Options
    optionsContainer.replaceChildren();
    shuffledOptions.forEach((opt, i) => {
      const btn = document.createElement("button");
      const letter = document.createElement("span");
      const text = document.createElement("span");

      btn.className = "option-btn";
      btn.type = "button";
      letter.className = "option-letter";
      letter.textContent = OPTION_LETTERS[i] || String(i + 1);
      text.textContent = opt.text;
      btn.append(letter, text);
      btn.addEventListener("click", () => handleAnswer(i));
      optionsContainer.appendChild(btn);
    });
  }

  // ── Handle answer selection ──
  function handleAnswer(selected) {
    if (answered) return;
    if (selected < 0 || selected >= shuffledOptions.length) return;

    answered = true;
    btnSkip.classList.add("hidden");

    const q = questions[currentIndex];
    const isCorrect = selected === shuffledCorrectIndex;
    const buttons = optionsContainer.querySelectorAll(".option-btn");
    const selectedText = shuffledOptions[selected].text;
    const correctText = shuffledOptions[shuffledCorrectIndex].text;

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
      btn.disabled = true;
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
    const correctText = shuffledOptions[shuffledCorrectIndex].text;

    skippedQuestions.push({
      question: q.q,
      correctAnswer: correctText,
      explanation: q.explanation,
      category: q._category
    });

    // Highlight correct answer
    buttons.forEach((btn, i) => {
      btn.classList.add("disabled");
      btn.disabled = true;
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
    const maxPoints = getMaxPoints();
    const passPoints = getPassPoints();

    if (isExamMode) {
      const passed = score >= passPoints;

      document.getElementById("results-title").textContent =
        passed ? "🎉 Quiz Complete!" : "Quiz Complete";

      document.getElementById("results-score").textContent = `${score} / ${maxPoints} pts`;
      document.getElementById("results-score").style.color = passed ? "var(--green)" : "var(--red)";

      const passEl = document.getElementById("results-pass");
      passEl.textContent = passed ? `✅ PASS (≥${passPoints} pts)` : `❌ FAIL (need ${passPoints} pts)`;
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

    renderBreakdown(total);
    renderReview();
  }

  function renderBreakdown(total) {
    const resultsBreakdown = document.getElementById("results-breakdown");
    resultsBreakdown.replaceChildren(
      createBreakdownItem(correct, `Correct (+${correct * POINTS_CORRECT})`, "var(--green)"),
      createBreakdownItem(wrong, `Wrong (${wrong * POINTS_WRONG})`, "var(--red)"),
      createBreakdownItem(skipped, "Skipped (0)", "var(--orange)"),
      createBreakdownItem(total, "Total")
    );
  }

  function createBreakdownItem(value, label, color) {
    const item = document.createElement("div");
    const number = document.createElement("div");
    const text = document.createElement("div");

    item.className = "breakdown-item";
    number.className = "num";
    if (color) number.style.color = color;
    number.textContent = String(value);
    text.className = "lbl";
    text.textContent = label;
    item.append(number, text);
    return item;
  }

  function renderReview() {
    const reviewList = document.getElementById("review-list");
    reviewList.replaceChildren();

    if (wrongAnswers.length === 0 && skippedQuestions.length === 0) {
      const perfect = document.createElement("p");
      perfect.className = "review-perfect";
      perfect.textContent = "Perfect score - no mistakes!";
      reviewList.appendChild(perfect);
      return;
    }

    if (wrongAnswers.length > 0) {
      reviewList.appendChild(createReviewHeading("Wrong answers (-1 pt each)", "review-heading--wrong"));
      wrongAnswers.forEach(answer => reviewList.appendChild(createReviewCard(answer, true)));
    }

    if (skippedQuestions.length > 0) {
      reviewList.appendChild(createReviewHeading("Skipped questions (0 pts each)", "review-heading--skipped"));
      skippedQuestions.forEach(answer => reviewList.appendChild(createReviewCard(answer, false)));
    }
  }

  function createReviewHeading(text, className) {
    const heading = document.createElement("h4");
    heading.className = `review-heading ${className}`;
    heading.textContent = text;
    return heading;
  }

  function createReviewCard(answer, showYourAnswer) {
    const card = document.createElement("div");
    const question = document.createElement("div");
    const correctAnswer = document.createElement("div");
    const explanation = document.createElement("div");

    card.className = "review-card";
    question.className = "review-q";
    question.textContent = `${LABELS[answer.category]} - ${answer.question}`;
    card.appendChild(question);

    if (showYourAnswer) {
      const yourAnswer = document.createElement("div");
      yourAnswer.className = "review-your";
      yourAnswer.textContent = `Your answer: ${answer.yourAnswer}`;
      card.appendChild(yourAnswer);
    }

    correctAnswer.className = "review-correct";
    correctAnswer.textContent = `Correct answer: ${answer.correctAnswer}`;
    explanation.className = "review-explanation";
    explanation.textContent = `Tip: ${answer.explanation}`;
    card.append(correctAnswer, explanation);
    return card;
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

    // 1-6 or A-F to select answer
    const keyMap = { "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5 };
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
