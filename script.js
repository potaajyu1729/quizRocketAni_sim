"use strict";

const OUTPUT_THRESHOLD = 60;
const SAFETY_THRESHOLD = 75;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const categories = [
  { name: "フロントエンド", short: "FRONT" },
  { name: "バックエンド", short: "BACK" },
  { name: "データベース", short: "DB" },
  { name: "インフラ", short: "INFRA" },
  { name: "API", short: "API" },
  { name: "セキュリティ", short: "SEC" }
];

const profileByCategory = {
  フロントエンド: { role: "INTERFACE CREATOR", copy: "画面の構造・見た目・動きを心地よく組み立てるクルー" },
  バックエンド: { role: "SERVICE BUILDER", copy: "サービスを支える処理と実行環境を組み立てるクルー" },
  データベース: { role: "DATA ARCHITECT", copy: "データの形とつながりを鮮やかに設計するクルー" },
  インフラ: { role: "ORBIT OPERATOR", copy: "アプリがのびのび動ける環境を整えるクルー" },
  API: { role: "CONNECTION DESIGNER", copy: "サービス同士をなめらかにつなぐクルー" },
  セキュリティ: { role: "TRUST ENGINEER", copy: "安心して使えるサービス体験を育てるクルー" }
};

const avatarColors = {
  red: { body: "#ff5e66", glow: "rgba(255,94,102,.24)" },
  blue: { body: "#4f9dff", glow: "rgba(79,157,255,.24)" },
  yellow: { body: "#ffd75e", glow: "rgba(255,215,94,.24)" },
  green: { body: "#51d27b", glow: "rgba(81,210,123,.24)" }
};

const rawQuestions = [
  { category: "フロントエンド", weight: 1, question: '<button type="＿＿＿">送信</button>', choices: ["submit", "click", "send", "form-submit"], answer: 0, explanation: "formを送信するbuttonのtypeにはsubmitを使います。" },
  { category: "フロントエンド", weight: 1, question: '<label ＿＿＿="email">メール</label>\n<input id="email" type="email">', choices: ["for", "target", "name", "control"], answer: 0, explanation: "labelのforとinputのidを同じ値にすると、入力欄を関連付けられます。" },
  { category: "フロントエンド", weight: 1.1, question: '<!-- HTML解析完了後に実行する -->\n<script ＿＿＿ src="app.js"></script>', choices: ["defer", "async", "background", "late"], answer: 0, explanation: "deferはHTML解析と並行して読み込み、解析完了後にスクリプトを実行します。" },
  { category: "フロントエンド", weight: 1, question: ".card {\n  box-sizing: ＿＿＿;\n}", choices: ["border-box", "content-box-only", "outer-box", "fixed-box"], answer: 0, explanation: "border-boxではpaddingとborderを指定幅の内側に含めます。" },
  { category: "フロントエンド", weight: 1, question: ".cards {\n  display: grid;\n  grid-template-columns: repeat(＿＿＿, 1fr); /* 3列 */\n}", choices: ["3", "columns", "grid", "auto"], answer: 0, explanation: "3列を作る場合、repeatの第1引数には3を指定します。" },
  { category: "フロントエンド", weight: 1.1, question: "/* スクロール領域内で上端に留める */\n.header {\n  position: ＿＿＿;\n  top: 0;\n}", choices: ["sticky", "fixed", "float", "lock"], answer: 0, explanation: "stickyはスクロール領域を基準に、指定位置へ留まる配置です。" },
  { category: "フロントエンド", weight: 1.1, question: "const total = prices.＿＿＿((sum, price) => sum + price, 0);", choices: ["reduce", "forEach", "filter", "collect"], answer: 0, explanation: "reduceは配列を順番にまとめ、1つの値へ変換します。" },
  { category: "フロントエンド", weight: 1, question: 'const response = await fetch("/api/users");\nconst data = await response.＿＿＿();', choices: ["json", "parseJSON", "toObject", "bodyJSON"], answer: 0, explanation: "Responseのjson()はレスポンス本文をJSONとして読み取ります。" },
  { category: "フロントエンド", weight: 1, question: "const visible = users.＿＿＿(user => user.active);", choices: ["filter", "select", "where", "choose"], answer: 0, explanation: "filterは条件に合う配列要素だけを集めます。" },
  { category: "バックエンド", weight: 1.1, question: 'Deno.＿＿＿((request) => {\n  return new Response("OK");\n});', choices: ["serve", "listenHTTP", "createServer", "start"], answer: 0, explanation: "DenoのHTTPサーバーはDeno.serveで起動できます。" },
  { category: "バックエンド", weight: 1.1, question: 'const response = await fetch("https://api.example.com");\n// deno run ＿＿＿ app.ts', choices: ["--allow-net", "--allow-http", "--network", "--enable-fetch"], answer: 0, explanation: "ネットワーク接続を使う実行権限は--allow-netです。" },
  { category: "バックエンド", weight: 1.2, question: 'const config = await Deno.＿＿＿("config.json");', choices: ["readTextFile", "readJSON", "loadFile", "openJSON"], answer: 0, explanation: "Deno.readTextFileはファイルをテキストとして読み取ります。" },
  { category: "データベース", weight: 1, question: "CREATE TABLE users (\n  id INTEGER ＿＿＿,\n  email TEXT UNIQUE\n);", choices: ["PRIMARY KEY", "MAIN KEY", "UNIQUE ROW", "IDENTITY KEY"], answer: 0, explanation: "PRIMARY KEYは行を一意に識別する主キーです。" },
  { category: "データベース", weight: 1.1, question: "SELECT user_id, COUNT(*)\nFROM orders\n＿＿＿ user_id;", choices: ["GROUP BY", "ORDER BY", "COLLECT BY", "PARTITION WITH"], answer: 0, explanation: "GROUP BYを使うと、user_idごとに集計できます。" },
  { category: "データベース", weight: 1, question: 'UPDATE users SET name = "A"\n＿＿＿ id = 3;', choices: ["WHERE", "WHEN", "FILTER", "WITH"], answer: 0, explanation: "WHEREで更新対象となる行の条件を指定します。" },
  { category: "API", weight: 1, question: 'fetch("/api/users/42", {\n  method: "＿＿＿"\n});', choices: ["DELETE", "REMOVE", "DROP", "PURGE"], answer: 0, explanation: "DELETEは対象リソースを取り除くHTTPメソッドです。" },
  { category: "API", weight: 1, question: "HTTP/1.1 ＿＿＿ Created\nContent-Type: application/json", choices: ["201", "200", "204", "302"], answer: 0, explanation: "201 Createdは新しいリソースが作成されたことを表します。" },
  { category: "API", weight: 1, question: 'const headers = {\n  "＿＿＿": "application/json"\n};', choices: ["Content-Type", "Accept", "Data-Type", "Body-Type"], answer: 0, explanation: "Content-Typeは送信データの形式を表すHTTPヘッダーです。" },
  { category: "インフラ", weight: 1, question: "# コンテナをバックグラウンドで起動\ndocker compose up -＿＿＿", choices: ["d", "b", "bg", "background"], answer: 0, explanation: "docker compose up -dのdはdetachedモードを表します。" },
  { category: "インフラ", weight: 1.1, question: "# 所有者: 読み書き実行 / ほか: 読み取り実行\nchmod ＿＿＿ deploy.sh", choices: ["755", "644", "400", "111"], answer: 0, explanation: "755は所有者に読み書き実行、ほかの利用者に読み取り実行を設定します。" },
  { category: "インフラ", weight: 1.2, question: "# Composeのサービス名: app\nlocation / {\n  proxy_pass http://＿＿＿:3000;\n}", choices: ["app", "localhost-only", "proxy", "server-name"], answer: 0, explanation: "Composeで定義したサービス名appを使うと、そのコンテナへ接続できます。" },
  { category: "セキュリティ", weight: 1.2, question: "const hash = await bcrypt.＿＿＿(password, 10);", choices: ["hash", "encrypt", "protect", "secure"], answer: 0, explanation: "bcrypt.hash()はパスワードからハッシュ値を生成します。" },
  { category: "セキュリティ", weight: 1.2, question: "// ユーザー入力をテキストとして表示\nelement.＿＿＿ = userInput;", choices: ["textContent", "innerHTML", "outerHTML", "htmlValue"], answer: 0, explanation: "textContentは入力を文字列として扱い、安全な画面表示につながります。" },
  { category: "セキュリティ", weight: 1.2, question: 'const result = await db.query(\n  "SELECT * FROM users WHERE id = ＿＿＿",\n  [userId]\n);', choices: ["$1", "userId", "input", "raw"], answer: 0, explanation: "$1と値の配列を使うと、パラメータ化されたクエリになります。" }
];

const questionBank = rawQuestions.map((item, index) => {
  const shift = (index * 3 + 1) % item.choices.length;
  return {
    ...item,
    choices: [...item.choices.slice(shift), ...item.choices.slice(0, shift)],
    answer: (item.answer - shift + item.choices.length) % item.choices.length
  };
});

const elements = {
  app: document.querySelector("#app"),
  stage: document.querySelector("#flight-stage"),
  rocket: document.querySelector("#rocket"),
  boardingCrew: document.querySelector("#boarding-crew"),
  crewCharacters: [...document.querySelectorAll(".crew-character")],
  explosion: document.querySelector("#explosion"),
  debris: document.querySelector("#debris"),
  celebration: document.querySelector("#celebration"),
  confetti: document.querySelector("#confetti"),
  flightEvent: document.querySelector("#flight-event"),
  eventLabel: document.querySelector("#event-label"),
  eventAltitude: document.querySelector("#event-altitude"),
  altitudeLive: document.querySelector("#altitude-live"),
  panelAltitude: document.querySelector("#panel-altitude"),
  telemetryProgress: document.querySelector("#telemetry-progress"),
  missionStatus: document.querySelector("#mission-status"),
  trajectoryLabel: document.querySelector("#trajectory-label"),
  engineLabel: document.querySelector("#engine-label"),
  outputLive: document.querySelector("#output-live"),
  safetyLive: document.querySelector("#safety-live"),
  briefingPanel: document.querySelector("#briefing-panel"),
  quizPanel: document.querySelector("#quiz-panel"),
  readyPanel: document.querySelector("#ready-panel"),
  flightPanel: document.querySelector("#flight-panel"),
  resultPanel: document.querySelector("#result-panel"),
  startButton: document.querySelector("#start-button"),
  launchButton: document.querySelector("#launch-button"),
  retryButton: document.querySelector("#retry-button"),
  questionCurrent: document.querySelector("#question-current"),
  questionCategory: document.querySelector("#question-category"),
  questionLabel: document.querySelector("#question-label"),
  difficultyChip: document.querySelector("#difficulty-chip"),
  questionText: document.querySelector("#question-text"),
  answers: document.querySelector("#answers"),
  feedback: document.querySelector("#feedback"),
  feedbackTitle: document.querySelector("#feedback-title"),
  feedbackText: document.querySelector("#feedback-text"),
  nextButton: document.querySelector("#next-button"),
  nextLabel: document.querySelector("#next-label"),
  quizProgressBar: document.querySelector("#quiz-progress-bar"),
  readyOutput: document.querySelector("#ready-output"),
  readySafety: document.querySelector("#ready-safety"),
  readyHint: document.querySelector("#ready-hint"),
  readyMessage: document.querySelector("#ready-message"),
  balanceList: document.querySelector("#balance-list"),
  flightTitle: document.querySelector("#flight-title"),
  flightDescription: document.querySelector("#flight-description"),
  resultIcon: document.querySelector("#result-icon"),
  resultKicker: document.querySelector("#result-kicker"),
  resultTitle: document.querySelector("#result-title"),
  resultMessage: document.querySelector("#result-message"),
  resultPower: document.querySelector("#result-power"),
  resultStability: document.querySelector("#result-stability"),
  resultAltitude: document.querySelector("#result-altitude"),
  profileButton: document.querySelector("#profile-button"),
  cardPanel: document.querySelector("#card-panel"),
  profileCard: document.querySelector("#profile-card"),
  profileName: document.querySelector("#profile-name"),
  avatarOptions: [...document.querySelectorAll(".avatar-option")],
  saveCardButton: document.querySelector("#save-card-button"),
  saveCardLabel: document.querySelector("#save-card-label"),
  cardBackButton: document.querySelector("#card-back-button")
};

const panelNames = ["briefing", "quiz", "ready", "flight", "result", "card"];
let animationFrame = 0;
let resultTimer = 0;
let boardingTimer = 0;
let saveLabelTimer = 0;
let crewProgressTimers = [];
let currentState = "idle";
let missionParameters = { power: 0, stability: 0 };
let latestMetrics = {
  power: 0,
  safety: 0,
  categoryScores: Object.fromEntries(categories.map(({ name }) => [name, 0]))
};
let latestOutcome = { success: false, altitude: 0, travel: 0 };
let selectedAvatar = "green";

const quizState = {
  current: 0,
  answered: false,
  correctCount: 0,
  weightedEarned: 0,
  categoryStats: {}
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function formatAltitude(value) {
  return Math.max(0, Math.round(value)).toLocaleString("ja-JP");
}

function setState(state) {
  currentState = state;
  elements.app.dataset.state = state;
}

function setPhase(phase) {
  elements.app.dataset.phase = phase;
}

function showPanel(panelName) {
  panelNames.forEach((name) => {
    elements[`${name}Panel`].hidden = name !== panelName;
  });
}

function setAltitude(value) {
  const formatted = formatAltitude(value);
  elements.altitudeLive.textContent = formatted;
  elements.panelAltitude.textContent = formatted;
}

function resetQuizData() {
  quizState.current = 0;
  quizState.answered = false;
  quizState.correctCount = 0;
  quizState.weightedEarned = 0;
  quizState.categoryStats = {};

  categories.forEach(({ name }) => {
    quizState.categoryStats[name] = { possible: 0, earned: 0, total: 0, correct: 0 };
  });

  questionBank.forEach((question) => {
    const stats = quizState.categoryStats[question.category];
    stats.possible += question.weight;
    stats.total += 1;
  });
}

function difficultyLabel(weight) {
  if (weight >= 1.2) return "BOOST QUESTION";
  if (weight > 1) return "ADVANCED";
  return "STANDARD";
}

function categoryShortName(category) {
  return categories.find((item) => item.name === category)?.short ?? "WEB";
}

function renderQuestion() {
  const question = questionBank[quizState.current];
  const number = String(quizState.current + 1).padStart(2, "0");
  quizState.answered = false;

  elements.questionCurrent.textContent = number;
  elements.questionCategory.textContent = question.category;
  elements.questionLabel.textContent = `QUESTION ${number}`;
  elements.difficultyChip.textContent = difficultyLabel(question.weight);
  elements.difficultyChip.classList.toggle("is-boost", question.weight >= 1.2);
  elements.questionText.textContent = question.question;
  elements.quizProgressBar.style.width = `${(quizState.current / questionBank.length) * 100}%`;
  elements.answers.replaceChildren();
  elements.feedback.hidden = true;
  elements.nextButton.disabled = true;
  elements.nextLabel.textContent = quizState.current === questionBank.length - 1
    ? "フライトデータを見る"
    : "次の問題へ";

  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "quiz-answer";
    button.type = "button";
    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.textContent = String.fromCharCode(65 + index);
    const text = document.createElement("span");
    text.className = "answer-copy";
    text.textContent = choice;
    button.append(letter, text);
    button.addEventListener("click", () => selectAnswer(index));
    elements.answers.append(button);
  });

  elements.missionStatus.textContent = `QUIZ ${number}/24`;
  elements.trajectoryLabel.textContent = categoryShortName(question.category);
}

function selectAnswer(selectedIndex) {
  if (quizState.answered) return;
  quizState.answered = true;

  const question = questionBank[quizState.current];
  const isCorrect = selectedIndex === question.answer;
  const stats = quizState.categoryStats[question.category];
  const buttons = [...elements.answers.querySelectorAll(".quiz-answer")];

  if (isCorrect) {
    quizState.correctCount += 1;
    quizState.weightedEarned += question.weight;
    stats.correct += 1;
    stats.earned += question.weight;
  }

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.answer) button.classList.add("is-answer-key");
    if (index === selectedIndex) button.classList.add(isCorrect ? "is-selected-key" : "is-selected");
  });

  elements.feedbackTitle.textContent = isCorrect
    ? "正解！ エネルギーチャージ"
    : "ここでアップデート！";
  elements.feedback.classList.toggle("is-update", !isCorrect);
  elements.feedbackText.textContent = question.explanation;
  elements.feedback.hidden = false;
  elements.nextButton.disabled = false;
  elements.quizProgressBar.style.width = `${((quizState.current + 1) / questionBank.length) * 100}%`;
}

function calculateQuizMetrics() {
  const totalWeight = questionBank.reduce((sum, question) => sum + question.weight, 0);
  const power = Math.round((quizState.weightedEarned / totalWeight) * 100);
  const categoryScores = {};
  let categoryRateTotal = 0;

  categories.forEach(({ name }) => {
    const stats = quizState.categoryStats[name];
    const categoryRate = stats.possible > 0
      ? (stats.earned / stats.possible) * 100
      : 0;
    categoryRateTotal += categoryRate;
    categoryScores[name] = Math.round(categoryRate);
  });

  const safety = Math.round(categoryRateTotal / categories.length);

  return { power, safety, categoryScores };
}

function renderBalanceList(categoryScores) {
  elements.balanceList.replaceChildren();

  categories.forEach(({ name, short }) => {
    const score = categoryScores[name];
    const item = document.createElement("div");
    item.className = "balance-item";
    item.innerHTML = `
      <span><b>${short}</b><small>${name}</small></span>
      <i><em style="width:${score}%"></em></i>
      <strong>${score}%</strong>
    `;
    elements.balanceList.append(item);
  });
}

function showReadyPanel() {
  const metrics = calculateQuizMetrics();
  latestMetrics = {
    ...metrics,
    categoryScores: { ...metrics.categoryScores }
  };
  missionParameters = { power: metrics.power, stability: metrics.safety };
  elements.readyOutput.textContent = metrics.power;
  elements.readySafety.textContent = metrics.safety;
  elements.outputLive.textContent = metrics.power;
  elements.safetyLive.textContent = metrics.safety;
  renderBalanceList(metrics.categoryScores);

  const orbitReady = metrics.power >= OUTPUT_THRESHOLD && metrics.safety >= SAFETY_THRESHOLD;
  elements.readyHint.classList.toggle("is-ready", orbitReady);
  elements.readyMessage.textContent = orbitReady
    ? "軌道到達コースが開きました"
    : "カラフルなスパークコースが開きました";

  setState("ready");
  setPhase("ready");
  showPanel("ready");
  elements.missionStatus.textContent = "DATA READY";
  elements.trajectoryLabel.textContent = "CALCULATED";
  elements.engineLabel.textContent = "READY";
  elements.launchButton.focus({ preventScroll: true });
}

function startQuiz() {
  resetQuizData();
  resetEffects();
  missionParameters = { power: 0, stability: 0 };
  elements.outputLive.textContent = "--";
  elements.safetyLive.textContent = "--";
  setState("quiz");
  setPhase("quiz");
  showPanel("quiz");
  elements.engineLabel.textContent = "CHARGING";
  renderQuestion();
}

function clearCrewProgressTimers() {
  crewProgressTimers.forEach((timer) => window.clearTimeout(timer));
  crewProgressTimers = [];
}

function stopBoardingSequence() {
  window.clearTimeout(boardingTimer);
  boardingTimer = 0;
  clearCrewProgressTimers();
  elements.boardingCrew.classList.remove("is-boarding");
}

function prepareCrewBoarding() {
  const stageRect = elements.stage.getBoundingClientRect();
  const rocketRect = elements.rocket.getBoundingClientRect();
  const stageWidth = stageRect.width;
  const startOffsets = [-0.32, -0.18, 0.18, 0.32];
  const delayStep = prefersReducedMotion.matches ? 0.065 : 0.55;

  elements.crewCharacters.forEach((character, index) => {
    const characterRect = character.getBoundingClientRect();
    const startX = stageWidth * startOffsets[index];
    const targetWindowY = rocketRect.top - stageRect.top + rocketRect.height * 0.32;
    const characterCenterY = stageRect.height - stageRect.height * 0.06 - characterRect.height * 0.5;
    const boardY = targetWindowY - characterCenterY;
    const lean = startX < 0 ? 6 : -6;

    character.style.setProperty("--crew-start-x", `${startX.toFixed(1)}px`);
    character.style.setProperty("--crew-mid-x", `${(startX * 0.46).toFixed(1)}px`);
    character.style.setProperty("--crew-board-y", `${boardY.toFixed(1)}px`);
    character.style.setProperty("--crew-delay", `${(index * delayStep).toFixed(3)}s`);
    character.style.setProperty("--crew-lean", `${lean}deg`);
    character.style.setProperty("--crew-lean-back", `${lean * -1}deg`);
  });

  elements.boardingCrew.classList.remove("is-boarding");
  void elements.boardingCrew.offsetWidth;
  elements.boardingCrew.classList.add("is-boarding");

  elements.crewCharacters.forEach((character, index) => {
    const progressDelay = prefersReducedMotion.matches
      ? 15 + index * 65
      : 900 + index * 550;
    const timer = window.setTimeout(() => {
      if (currentState !== "boarding") return;
      elements.trajectoryLabel.textContent = `CREW ${index + 1}/4`;
      elements.telemetryProgress.style.width = `${(index + 1) * 25}%`;
    }, progressDelay);
    crewProgressTimers.push(timer);
  });
}

function createEffectPieces() {
  const debrisColors = ["#ff8a4c", "#ffdd75", "#ff5e66", "#cbd8df", "#7de8ed"];
  const confettiColors = ["#c9f765", "#7de8ed", "#ff8a4c", "#f3f8f5", "#ff6d83"];

  for (let index = 0; index < 18; index += 1) {
    const piece = document.createElement("i");
    piece.style.setProperty("--angle", `${index * 20 + (index % 3) * 5}deg`);
    piece.style.setProperty("--distance", `${46 + (index % 5) * 12}px`);
    piece.style.setProperty("--delay", `${(index % 4) * 0.018}s`);
    piece.style.setProperty("--piece-color", debrisColors[index % debrisColors.length]);
    elements.debris.append(piece);
  }

  for (let index = 0; index < 34; index += 1) {
    const piece = document.createElement("i");
    const x = 4 + ((index * 29) % 92);
    const fall = 70 + ((index * 17) % 30);
    const sway = -42 + ((index * 23) % 84);
    piece.style.setProperty("--x", `${x}%`);
    piece.style.setProperty("--fall", `${fall}%`);
    piece.style.setProperty("--sway", `${sway}px`);
    piece.style.setProperty("--rotate", `${220 + (index % 5) * 110}deg`);
    piece.style.setProperty("--duration", `${1.15 + (index % 6) * 0.13}s`);
    piece.style.setProperty("--delay", `${(index % 10) * 0.055}s`);
    piece.style.setProperty("--confetti-color", confettiColors[index % confettiColors.length]);
    elements.confetti.append(piece);
  }
}

function resetEffects() {
  stopBoardingSequence();
  elements.explosion.classList.remove("is-active");
  elements.celebration.classList.remove("is-active");
  elements.celebration.setAttribute("aria-hidden", "true");
  elements.flightEvent.classList.remove("is-visible");
  elements.flightEvent.setAttribute("aria-hidden", "true");
  elements.stage.style.setProperty("--rocket-bottom", "6%");
  elements.stage.style.setProperty("--rocket-drift", "0px");
  elements.stage.style.setProperty("--rocket-tilt", "0deg");
  elements.stage.style.setProperty("--scene-travel", "0px");
  elements.stage.style.setProperty("--explosion-bottom", "45%");
  elements.stage.style.setProperty("--path-height", "0px");
  elements.stage.style.setProperty("--path-angle", "0deg");
  elements.rocket.style.opacity = "1";
  elements.telemetryProgress.style.width = "0%";
}

function calculateOutcome(power, safety) {
  const success = power >= OUTPUT_THRESHOLD && safety >= SAFETY_THRESHOLD;

  if (success) {
    return {
      success,
      altitude: Math.round(4200 + power * 38 + safety * 18),
      travel: 1
    };
  }

  const lowestParameter = Math.min(power, safety);
  const average = (power + safety) / 2;
  const travel = clamp(0.25 + average * 0.0032 + lowestParameter * 0.0015, 0.25, 0.7);
  const potentialAltitude = 1200 + power * 62 + safety * 24;

  return {
    success,
    altitude: Math.round(potentialAltitude * travel),
    travel
  };
}

function updateFlightVisual(travel, altitude, safety, elapsed, routeProgress) {
  const bottom = 6 + travel * 104;
  const diagonalStrength = clamp((SAFETY_THRESHOLD - safety) / 50, 0, 1);
  const stageWidth = elements.stage.clientWidth;
  const stageHeight = elements.stage.clientHeight;
  const diagonalDrift = stageWidth * 0.3 * diagonalStrength * Math.pow(routeProgress, 1.2);
  const flightWobble = Math.sin(elapsed / 130) * (1 + diagonalStrength * 7) * Math.sin(Math.PI * routeProgress);
  const drift = diagonalDrift + flightWobble;
  const tilt = diagonalStrength * 18 * Math.pow(routeProgress, 0.7)
    + Math.sin(elapsed / 105) * diagonalStrength * 3;
  const verticalDistance = travel * stageHeight * 1.04;
  const pathHeight = Math.hypot(verticalDistance, diagonalDrift);
  const pathAngle = verticalDistance > 0
    ? Math.atan2(diagonalDrift, verticalDistance) * (180 / Math.PI)
    : 0;

  elements.stage.style.setProperty("--rocket-bottom", `${bottom}%`);
  elements.stage.style.setProperty("--rocket-drift", `${drift.toFixed(2)}px`);
  elements.stage.style.setProperty("--rocket-tilt", `${tilt.toFixed(2)}deg`);
  elements.stage.style.setProperty("--scene-travel", `${Math.min(130, travel * 130).toFixed(1)}px`);
  elements.stage.style.setProperty("--path-height", `${pathHeight.toFixed(1)}px`);
  elements.stage.style.setProperty("--path-angle", `${pathAngle.toFixed(2)}deg`);
  elements.telemetryProgress.style.width = `${Math.min(100, travel * 100)}%`;
  setAltitude(altitude);

  if (travel > 0.82) {
    elements.rocket.style.opacity = String(clamp(1 - (travel - 0.82) / 0.18, 0, 1));
  }
}

function canvasRoundedRectPath(context, x, y, width, height, radius) {
  const curve = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + curve, y);
  context.lineTo(x + width - curve, y);
  context.quadraticCurveTo(x + width, y, x + width, y + curve);
  context.lineTo(x + width, y + height - curve);
  context.quadraticCurveTo(x + width, y + height, x + width - curve, y + height);
  context.lineTo(x + curve, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - curve);
  context.lineTo(x, y + curve);
  context.quadraticCurveTo(x, y, x + curve, y);
  context.closePath();
}

function drawCrewAvatar(context, x, y, size, avatarName) {
  const palette = avatarColors[avatarName] ?? avatarColors.green;
  const scale = size / 100;
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);

  context.fillStyle = palette.glow;
  context.beginPath();
  context.ellipse(50, 105, 31, 7, 0, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#92f0ed";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(50, 20);
  context.lineTo(50, 7);
  context.stroke();
  context.fillStyle = "#92f0ed";
  context.beginPath();
  context.arc(50, 5, 5, 0, Math.PI * 2);
  context.fill();

  canvasRoundedRectPath(context, 17, 18, 66, 81, 32);
  context.fillStyle = palette.body;
  context.fill();
  context.strokeStyle = "rgba(255,255,255,.18)";
  context.lineWidth = 2;
  context.stroke();

  canvasRoundedRectPath(context, 28, 43, 44, 28, 14);
  context.fillStyle = "#effaf5";
  context.fill();

  context.fillStyle = "#203945";
  [42, 58].forEach((eyeX) => {
    context.beginPath();
    context.arc(eyeX, 57, 4.3, 0, Math.PI * 2);
    context.fill();
  });
  context.restore();
}

function fitCanvasText(context, text, maxWidth, startSize, minSize, weight = 700) {
  let size = startSize;
  while (size > minSize) {
    context.font = `${weight} ${size}px "Yu Gothic UI", "Noto Sans JP", sans-serif`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function getStrongestCategory() {
  return categories.reduce((best, { name }) => {
    const score = latestMetrics.categoryScores[name] ?? 0;
    return score > best.score ? { name, score } : best;
  }, { name: categories[0].name, score: -1 }).name;
}

function drawProfileCard() {
  const canvas = elements.profileCard;
  const context = canvas.getContext("2d");
  const displayName = elements.profileName.value.trim() || "CREW MEMBER";
  const strongestCategory = getStrongestCategory();
  const profile = profileByCategory[strongestCategory];
  const accent = avatarColors[selectedAvatar]?.body ?? avatarColors.green.body;
  const values = categories.map(({ name }) => latestMetrics.categoryScores[name] ?? 0);

  context.clearRect(0, 0, canvas.width, canvas.height);
  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, "#07111f");
  background.addColorStop(0.58, "#10263a");
  background.addColorStop(1, "#07111f");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = accent;
  context.fillRect(0, 0, 24, canvas.height);
  context.fillRect(24, 0, canvas.width - 24, 12);
  context.strokeStyle = "rgba(125,232,237,.24)";
  context.lineWidth = 2;
  context.strokeRect(44, 34, canvas.width - 78, canvas.height - 68);

  context.fillStyle = "#7de8ed";
  context.font = "700 24px ui-monospace, monospace";
  context.letterSpacing = "3px";
  context.fillText("EngiFar / CREW PROFILE", 80, 78);
  context.letterSpacing = "0px";

  context.fillStyle = "#f3f8f5";
  const nameSize = fitCanvasText(context, displayName, 510, 66, 34);
  context.font = `700 ${nameSize}px "Yu Gothic UI", "Noto Sans JP", sans-serif`;
  context.fillText(displayName, 80, 166);

  context.fillStyle = accent;
  context.font = "700 25px ui-monospace, monospace";
  context.fillText(`${strongestCategory} / ${profile.role}`, 82, 214);

  drawCrewAvatar(context, 78, 260, 188, selectedAvatar);

  const cardMetrics = [
    ["OUTPUT", `${latestMetrics.power}%`],
    ["SAFETY", `${latestMetrics.safety}%`],
    ["ALTITUDE", `${formatAltitude(latestOutcome.altitude)} km`]
  ];
  cardMetrics.forEach(([label, value], index) => {
    const metricY = 274 + index * 91;
    canvasRoundedRectPath(context, 300, metricY, 285, 73, 12);
    context.fillStyle = "rgba(125,232,237,.055)";
    context.fill();
    context.strokeStyle = "rgba(125,232,237,.18)";
    context.lineWidth = 1.5;
    context.stroke();
    context.fillStyle = "#8ca3af";
    context.font = "700 15px ui-monospace, monospace";
    context.fillText(label, 320, metricY + 29);
    context.fillStyle = "#f3f8f5";
    context.font = "700 29px ui-monospace, monospace";
    context.textAlign = "right";
    context.fillText(value, 560, metricY + 49);
    context.textAlign = "left";
  });

  context.strokeStyle = "rgba(125,232,237,.18)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(630, 122);
  context.lineTo(630, 640);
  context.stroke();

  const centerX = 915;
  const centerY = 393;
  const radius = 164;
  const radarPoint = (value, index, size = radius) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / categories.length;
    return [
      centerX + Math.cos(angle) * size * value / 100,
      centerY + Math.sin(angle) * size * value / 100
    ];
  };

  context.fillStyle = "#8ca3af";
  context.font = "700 16px ui-monospace, monospace";
  context.textAlign = "center";
  context.fillText("SIX FIELD BALANCE", centerX, 166);

  [1, 0.66, 0.33].forEach((scale) => {
    context.beginPath();
    categories.forEach((_, index) => {
      const [pointX, pointY] = radarPoint(100, index, radius * scale);
      if (index === 0) context.moveTo(pointX, pointY);
      else context.lineTo(pointX, pointY);
    });
    context.closePath();
    context.strokeStyle = "rgba(125,232,237,.2)";
    context.lineWidth = 2;
    context.stroke();
  });

  categories.forEach((_, index) => {
    const [pointX, pointY] = radarPoint(100, index);
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(pointX, pointY);
    context.strokeStyle = "rgba(125,232,237,.14)";
    context.stroke();
  });

  context.beginPath();
  values.forEach((value, index) => {
    const [pointX, pointY] = radarPoint(value, index);
    if (index === 0) context.moveTo(pointX, pointY);
    else context.lineTo(pointX, pointY);
  });
  context.closePath();
  context.fillStyle = `${accent}55`;
  context.fill();
  context.strokeStyle = accent;
  context.lineWidth = 5;
  context.stroke();

  context.font = "700 15px ui-monospace, monospace";
  categories.forEach(({ short }, index) => {
    const [pointX, pointY] = radarPoint(100, index, radius + 42);
    context.fillStyle = "#d8e8e8";
    context.fillText(`${short} ${values[index]}%`, pointX, pointY + 5);
  });

  context.textAlign = "left";
  context.fillStyle = "#f3f8f5";
  context.font = "700 22px \"Yu Gothic UI\", \"Noto Sans JP\", sans-serif";
  context.fillText(profile.copy, 80, 620);
  context.fillStyle = "#8ca3af";
  context.font = "600 16px ui-monospace, monospace";
  context.fillText("WEB QUIZ FLIGHT SYSTEM / PERSONAL CARD", 80, 699);
}

function openProfileCard() {
  window.clearTimeout(saveLabelTimer);
  elements.saveCardLabel.textContent = "PNGで保存";
  setState("card");
  setPhase("card");
  showPanel("card");
  elements.missionStatus.textContent = "PROFILE READY";
  elements.trajectoryLabel.textContent = "PERSONAL CARD";
  elements.engineLabel.textContent = "CREATED";
  drawProfileCard();
  elements.profileName.focus({ preventScroll: true });
}

function returnToResult() {
  setState(latestOutcome.success ? "success" : "challenge");
  setPhase("result");
  showPanel("result");
  elements.missionStatus.textContent = latestOutcome.success ? "SUCCESS" : "SPARK!";
  elements.trajectoryLabel.textContent = latestOutcome.success ? "ORBIT" : "RECORDED";
  elements.engineLabel.textContent = "COMPLETE";
  elements.profileButton.focus({ preventScroll: true });
}

function saveProfileCard() {
  drawProfileCard();
  const displayName = elements.profileName.value.trim() || "CREW MEMBER";
  const safeName = displayName
    .replace(/[<>:\"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, "-")
    .slice(0, 40) || "crew-member";

  elements.profileCard.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    link.download = `engifar-card-${safeName}.png`;
    link.href = objectUrl;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    elements.saveCardLabel.textContent = "保存しました ✓";
    window.clearTimeout(saveLabelTimer);
    saveLabelTimer = window.setTimeout(() => {
      elements.saveCardLabel.textContent = "PNGで保存";
    }, 1800);
  }, "image/png");
}

function populateResult(snapshot, outcome) {
  latestOutcome = { ...outcome };
  elements.resultPower.textContent = snapshot.power;
  elements.resultStability.textContent = snapshot.stability;
  elements.resultAltitude.textContent = formatAltitude(outcome.altitude);
  elements.resultPanel.classList.toggle("is-challenge", !outcome.success);

  if (outcome.success) {
    elements.resultIcon.textContent = "✓";
    elements.resultKicker.textContent = "EngiFar COMPLETE";
    elements.resultTitle.textContent = "軌道到達！";
    elements.resultMessage.textContent = "Webの知識がロケットの推進力になりました。";
  } else {
    elements.resultIcon.textContent = "★";
    elements.resultKicker.textContent = "FLIGHT COMPLETE";
    elements.resultTitle.textContent = "ナイスフライト！";
    elements.resultMessage.textContent = "カラフルなスパークとともに、今回のフライトデータを記録しました。";
  }
}

function finishSuccess(snapshot, outcome) {
  setState("success");
  elements.missionStatus.textContent = "SUCCESS";
  elements.trajectoryLabel.textContent = "ORBIT";
  elements.engineLabel.textContent = "CUTOFF";
  elements.eventLabel.textContent = "ORBIT ALTITUDE";
  elements.eventAltitude.textContent = formatAltitude(outcome.altitude);
  elements.celebration.classList.add("is-active");
  elements.celebration.setAttribute("aria-hidden", "false");

  resultTimer = window.setTimeout(() => {
    populateResult(snapshot, outcome);
    setPhase("result");
    showPanel("result");
  }, prefersReducedMotion.matches ? 80 : 700);
}

function finishChallenge(snapshot, outcome, finalTravel) {
  setState("challenge");
  elements.missionStatus.textContent = "SPARK!";
  elements.trajectoryLabel.textContent = "RECORDED";
  elements.engineLabel.textContent = "COMPLETE";
  elements.stage.style.setProperty("--explosion-bottom", `${6 + finalTravel * 104 + 6}%`);
  elements.eventLabel.textContent = "SPARK ALTITUDE";
  elements.eventAltitude.textContent = formatAltitude(outcome.altitude);
  elements.explosion.classList.add("is-active");

  window.setTimeout(() => {
    if (currentState !== "challenge") return;
    elements.flightEvent.classList.add("is-visible");
    elements.flightEvent.setAttribute("aria-hidden", "false");
  }, prefersReducedMotion.matches ? 20 : 260);

  resultTimer = window.setTimeout(() => {
    populateResult(snapshot, outcome);
    setPhase("result");
    showPanel("result");
  }, prefersReducedMotion.matches ? 90 : 850);
}

function startFlight(snapshot, outcome) {
  if (currentState !== "boarding") return;

  const duration = prefersReducedMotion.matches
    ? 350
    : outcome.success
      ? 4300
      : 2350 + outcome.travel * 1500;

  window.clearTimeout(boardingTimer);
  boardingTimer = 0;
  clearCrewProgressTimers();
  elements.boardingCrew.classList.remove("is-boarding");
  setState("launching");
  elements.missionStatus.textContent = "LIFTOFF";
  const followsVerticalCourse = snapshot.stability >= SAFETY_THRESHOLD;
  elements.trajectoryLabel.textContent = followsVerticalCourse ? "VERTICAL" : "DIAGONAL";
  elements.engineLabel.textContent = "BURNING";
  elements.flightTitle.textContent = followsVerticalCourse ? "垂直上昇中" : "斜め上昇中";
  elements.flightDescription.innerHTML = followsVerticalCourse
    ? "軌道到達コースを飛行中です。<br>フライトデータはロックされています。"
    : "ダイナミックな斜め軌道を飛行中です。<br>安全性75%以上で垂直コースが開きます。";
  elements.telemetryProgress.style.width = "0%";

  const startedAt = performance.now();

  function animate(now) {
    const elapsed = now - startedAt;
    const timeProgress = clamp(elapsed / duration, 0, 1);
    const eased = outcome.success ? easeInOutCubic(timeProgress) : easeOutCubic(timeProgress);
    const travel = outcome.success ? eased : outcome.travel * eased;
    const currentAltitude = outcome.altitude * eased;

    updateFlightVisual(travel, currentAltitude, snapshot.stability, elapsed, eased);

    if (timeProgress < 1) {
      animationFrame = window.requestAnimationFrame(animate);
      return;
    }

    setAltitude(outcome.altitude);
    if (outcome.success) finishSuccess(snapshot, outcome);
    else finishChallenge(snapshot, outcome, travel);
  }

  animationFrame = window.requestAnimationFrame(animate);
}

function launch() {
  if (currentState !== "ready") return;

  const snapshot = { ...missionParameters };
  const outcome = calculateOutcome(snapshot.power, snapshot.stability);
  const boardingDuration = prefersReducedMotion.matches ? 320 : 2850;

  window.clearTimeout(resultTimer);
  window.cancelAnimationFrame(animationFrame);
  resetEffects();
  setState("boarding");
  setPhase("flight");
  showPanel("flight");
  elements.launchButton.disabled = true;
  elements.missionStatus.textContent = "BOARDING";
  elements.trajectoryLabel.textContent = "CREW 0/4";
  elements.engineLabel.textContent = "READY";
  elements.flightTitle.textContent = "クルー搭乗中";
  elements.flightDescription.innerHTML = "赤・青・黄・緑のクルーが順番に乗り込みます。<br>まもなく打ち上げです。";
  elements.rocket.style.opacity = "1";
  elements.telemetryProgress.style.width = "0%";
  setAltitude(0);
  prepareCrewBoarding();

  boardingTimer = window.setTimeout(() => {
    startFlight(snapshot, outcome);
  }, boardingDuration);
}

function resetMission() {
  window.cancelAnimationFrame(animationFrame);
  window.clearTimeout(resultTimer);
  window.clearTimeout(saveLabelTimer);
  stopBoardingSequence();
  resetQuizData();
  resetEffects();
  missionParameters = { power: 0, stability: 0 };
  setState("idle");
  setPhase("briefing");
  showPanel("briefing");
  elements.launchButton.disabled = false;
  elements.outputLive.textContent = "--";
  elements.safetyLive.textContent = "--";
  elements.missionStatus.textContent = "STANDBY";
  elements.trajectoryLabel.textContent = "LOCKED";
  elements.engineLabel.textContent = "IDLE";
  elements.saveCardLabel.textContent = "PNGで保存";
  setAltitude(0);
  elements.startButton.focus({ preventScroll: true });
}

elements.startButton.addEventListener("click", startQuiz);
elements.nextButton.addEventListener("click", () => {
  if (!quizState.answered) return;
  if (quizState.current === questionBank.length - 1) {
    showReadyPanel();
    return;
  }
  quizState.current += 1;
  renderQuestion();
});
elements.launchButton.addEventListener("click", launch);
elements.retryButton.addEventListener("click", resetMission);
elements.profileButton.addEventListener("click", openProfileCard);
elements.cardBackButton.addEventListener("click", returnToResult);
elements.saveCardButton.addEventListener("click", saveProfileCard);
elements.profileName.addEventListener("input", drawProfileCard);
elements.avatarOptions.forEach((option) => {
  option.addEventListener("click", () => {
    selectedAvatar = option.dataset.avatar;
    elements.avatarOptions.forEach((item) => {
      const isSelected = item === option;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
    elements.profileButton.querySelector("img").src = `./assets/crew-${selectedAvatar}.svg`;
    drawProfileCard();
  });
});

createEffectPieces();
resetQuizData();
setAltitude(0);
