"use strict";

const OUTPUT_THRESHOLD = 60;
const SAFETY_THRESHOLD = 75;
const ANSWER_TIME_MS = 10_000;
const REVIEW_TIME_MS = 5_000;
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

const avatarLabels = {
  red: "赤",
  blue: "青",
  yellow: "黄",
  green: "緑"
};

const rawQuestions = [
  { category: "フロントエンド", weight: 1, instruction: "「EngiFar」をページで最も重要な見出しとして表示します。空欄に入るHTMLタグ名を選んでください。", question: "<＿＿＿>EngiFar</＿＿＿>", choices: ["h1", "p", "span", "div"], answer: 0, explanation: "h1はページの中心となる見出しを表すHTMLタグです。" },
  { category: "フロントエンド", weight: 1, instruction: "「プロフィール」から /profile ページへ移動できるリンクを作ります。URLを指定する属性を選んでください。", question: '<a ＿＿＿="/profile">プロフィール</a>', choices: ["href", "src", "action", "to"], answer: 0, explanation: "aタグのhref属性に移動先のURLを指定します。" },
  { category: "フロントエンド", weight: 1, instruction: "タイトルの文字色を緑色にします。CSSで文字色を指定するプロパティを選んでください。", question: ".title {\n  ＿＿＿: #c9f765;\n}", choices: ["color", "background-color", "font-color", "text-color"], answer: 0, explanation: "colorプロパティは文字の色を指定します。" },
  { category: "フロントエンド", weight: 1.1, instruction: "ボタンをクリックしたときにstart関数が動くようにします。空欄に入るイベント名を選んでください。", question: 'button.addEventListener("＿＿＿", start);', choices: ["click", "press", "tap", "onClick"], answer: 0, explanation: "clickイベントはボタンなどがクリックされたときに発生します。" },

  { category: "バックエンド", weight: 1, instruction: "DenoでWebサーバーを起動して「Hello」と返します。サーバーを開始するメソッド名を選んでください。", question: 'Deno.＿＿＿(() => new Response("Hello"));', choices: ["serve", "start", "listenWeb", "runServer"], answer: 0, explanation: "Deno.serve()を使うとHTTPリクエストを受け取るサーバーを起動できます。" },
  { category: "バックエンド", weight: 1, instruction: "非同期のfetchUser関数が完了するまで待ち、結果をuserへ入れます。空欄に入るキーワードを選んでください。", question: "const user = ＿＿＿ fetchUser();", choices: ["await", "wait", "async", "then"], answer: 0, explanation: "awaitはPromiseの完了を待って、その結果を受け取ります。" },
  { category: "バックエンド", weight: 1.1, instruction: "JavaScriptのオブジェクトをAPIで送れるJSON文字列へ変換します。使うメソッド名を選んでください。", question: "const body = JSON.＿＿＿({ ok: true });", choices: ["stringify", "parse", "encode", "toJSON"], answer: 0, explanation: "JSON.stringify()はオブジェクトをJSON形式の文字列へ変換します。" },
  { category: "バックエンド", weight: 1.2, instruction: "config.txtの内容を文字列として読み込みます。Denoのファイル読み込みメソッドを選んでください。", question: 'const text = await Deno.＿＿＿("config.txt");', choices: ["readTextFile", "readFileText", "openText", "load"], answer: 0, explanation: "Deno.readTextFile()はファイルの内容を文字列として読み取ります。" },

  { category: "データベース", weight: 1, instruction: "usersテーブルにあるすべての列を取得します。空欄に入るSQLの命令を選んでください。", question: "＿＿＿ * FROM users;", choices: ["SELECT", "GET", "READ", "FIND"], answer: 0, explanation: "SELECTはデータベースからデータを取得するSQLの命令です。" },
  { category: "データベース", weight: 1, instruction: "usersテーブルからidが3の行だけを取得します。条件を指定するキーワードを選んでください。", question: "SELECT * FROM users\n＿＿＿ id = 3;", choices: ["WHERE", "WHEN", "IF", "FILTER"], answer: 0, explanation: "WHEREを使うと取得する行の条件を指定できます。" },
  { category: "データベース", weight: 1.1, instruction: "usersテーブルへ名前がAoiのデータを1件追加します。空欄に入るSQLの命令を選んでください。", question: '＿＿＿ INTO users (name)\nVALUES ("Aoi");', choices: ["INSERT", "ADD", "CREATE", "PUSH"], answer: 0, explanation: "INSERT INTOはテーブルへ新しい行を追加するSQLの命令です。" },
  { category: "データベース", weight: 1.2, instruction: "ordersテーブルをuser_idごとにまとめ、ユーザー別の注文数を数えます。空欄を選んでください。", question: "SELECT user_id, COUNT(*)\nFROM orders\n＿＿＿ user_id;", choices: ["GROUP BY", "ORDER BY", "COLLECT BY", "PARTITION WITH"], answer: 0, explanation: "GROUP BYは同じuser_idの行をグループにまとめて集計します。" },

  { category: "API", weight: 1, instruction: "APIからユーザー一覧を取得します。データ取得に使うHTTPメソッドを選んでください。", question: 'fetch("/api/users", {\n  method: "＿＿＿"\n});', choices: ["GET", "POST", "PUT", "DELETE"], answer: 0, explanation: "GETはサーバーからデータを取得するときに使うHTTPメソッドです。" },
  { category: "API", weight: 1, instruction: "APIへ新しいユーザー情報を送って登録します。新規作成に使うHTTPメソッドを選んでください。", question: 'fetch("/api/users", {\n  method: "＿＿＿",\n  body: JSON.stringify(user)\n});', choices: ["POST", "GET", "HEAD", "TRACE"], answer: 0, explanation: "POSTはサーバーへデータを送り、新しいデータを作るときに使います。" },
  { category: "API", weight: 1, instruction: "APIの処理が正常に完了したことを表す、基本的なHTTPステータスを選んでください。", question: "HTTP/1.1 ＿＿＿ OK", choices: ["200", "404", "500", "301"], answer: 0, explanation: "200 OKはリクエストが正常に処理されたことを表します。" },
  { category: "API", weight: 1.1, instruction: "fetchで受け取ったレスポンス本文をJSONとして読み取ります。空欄に入るメソッド名を選んでください。", question: 'const response = await fetch("/api/users");\nconst data = await response.＿＿＿();', choices: ["json", "parseJSON", "toObject", "bodyJSON"], answer: 0, explanation: "Responseのjson()はレスポンス本文をJSONとして読み取ります。" },

  { category: "インフラ", weight: 1, instruction: "Gitで現在の変更状況を確認します。空欄に入るコマンドを選んでください。", question: "git ＿＿＿", choices: ["status", "check", "state", "show-all"], answer: 0, explanation: "git statusは変更されたファイルや現在のブランチ状態を表示します。" },
  { category: "インフラ", weight: 1, instruction: "package.jsonに書かれた依存パッケージをインストールします。空欄に入るnpmコマンドを選んでください。", question: "npm ＿＿＿", choices: ["install", "download", "setup", "packages"], answer: 0, explanation: "npm installはpackage.jsonを読み、必要なパッケージをインストールします。" },
  { category: "インフラ", weight: 1.1, instruction: "package.jsonのscriptsに登録されたdevコマンドを実行します。空欄を選んでください。", question: "npm run ＿＿＿", choices: ["dev", "install", "package", "node"], answer: 0, explanation: "npm run devはscriptsに登録されたdevコマンドを実行します。" },
  { category: "インフラ", weight: 1.2, instruction: "Docker Composeのコンテナをバックグラウンドで起動します。空欄に入るオプションを選んでください。", question: "docker compose up ＿＿＿", choices: ["-d", "-b", "--hide", "--later"], answer: 0, explanation: "-dを付けるとコンテナをバックグラウンドで起動できます。" },

  { category: "セキュリティ", weight: 1, instruction: "入力したパスワードの文字が画面上で隠れて表示される入力欄を作ります。typeの値を選んでください。", question: '<input type="＿＿＿" name="password">', choices: ["password", "secret", "hidden-text", "secure"], answer: 0, explanation: "type=\"password\"にすると入力文字が伏せて表示されます。" },
  { category: "セキュリティ", weight: 1, instruction: "ユーザー入力をHTMLとして解釈せず、文字列のまま画面へ表示します。使うプロパティを選んでください。", question: "message.＿＿＿ = userInput;", choices: ["textContent", "innerHTML", "outerHTML", "htmlValue"], answer: 0, explanation: "textContentは内容を文字列として扱い、安心できる画面表示につながります。" },
  { category: "セキュリティ", weight: 1.1, instruction: "保存前のパスワードからbcryptのハッシュ値を作ります。空欄に入るメソッド名を選んでください。", question: "const hash = await bcrypt.＿＿＿(password, 10);", choices: ["hash", "encrypt", "protect", "secure"], answer: 0, explanation: "bcrypt.hash()はパスワードから保存用のハッシュ値を生成します。" },
  { category: "セキュリティ", weight: 1.2, instruction: "userIdをSQL文字列へ直接つなげず、パラメータとして渡します。空欄に入るプレースホルダーを選んでください。", question: 'const result = await db.query(\n  "SELECT * FROM users WHERE id = ＿＿＿",\n  [userId]\n);', choices: ["$1", "userId", "input", "raw"], answer: 0, explanation: "$1と値の配列を使うと、入力値をパラメータとして安全に渡せます。" }
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
  questionInstruction: document.querySelector("#question-instruction"),
  difficultyChip: document.querySelector("#difficulty-chip"),
  questionText: document.querySelector("#question-text"),
  quizTimer: document.querySelector("#quiz-timer"),
  quizTimerLabel: document.querySelector("#quiz-timer-label"),
  quizTimerValue: document.querySelector("#quiz-timer-value"),
  answers: document.querySelector("#answers"),
  feedback: document.querySelector("#feedback"),
  feedbackTitle: document.querySelector("#feedback-title"),
  feedbackText: document.querySelector("#feedback-text"),
  nextButton: document.querySelector("#next-button"),
  nextLabel: document.querySelector("#next-label"),
  quizProgressBar: document.querySelector("#quiz-progress-bar"),
  readyPlayerAvatar: document.querySelector("#ready-player-avatar"),
  readyPlayerName: document.querySelector("#ready-player-name"),
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
  playerAvatarPreview: document.querySelector("#player-avatar-preview"),
  selectedColorLabel: document.querySelector("#selected-color-label"),
  avatarOptions: [...document.querySelectorAll(".avatar-option")],
  saveCardButton: document.querySelector("#save-card-button"),
  saveCardLabel: document.querySelector("#save-card-label"),
  cardBackButton: document.querySelector("#card-back-button"),
  cardCrewAvatar: document.querySelector("#card-crew-avatar"),
  cardCrewName: document.querySelector("#card-crew-name"),
  cardCrewRole: document.querySelector("#card-crew-role")
};

const panelNames = ["briefing", "quiz", "ready", "flight", "result", "card"];
let animationFrame = 0;
let resultTimer = 0;
let boardingTimer = 0;
let saveLabelTimer = 0;
let quizPhaseTimer = 0;
let quizTickTimer = 0;
let quizPhaseDeadline = 0;
let quizPhaseDuration = 0;
let quizPhaseMode = "idle";
let quizCycleId = 0;
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
  selectedAnswer: null,
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
  clearQuizCountdown();
  quizState.current = 0;
  quizState.answered = false;
  quizState.selectedAnswer = null;
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

function syncPlayerIdentity() {
  const displayName = elements.profileName.value.trim() || "CREW MEMBER";
  const avatarLabel = avatarLabels[selectedAvatar] ?? avatarLabels.green;
  const avatarPath = `./assets/crew-${selectedAvatar}.svg`;

  elements.playerAvatarPreview.src = avatarPath;
  elements.playerAvatarPreview.alt = `選択中の${avatarLabel}のクルー`;
  elements.selectedColorLabel.textContent = avatarLabel;
  elements.readyPlayerAvatar.src = avatarPath;
  elements.readyPlayerAvatar.alt = `選択した${avatarLabel}のクルー`;
  elements.readyPlayerName.textContent = displayName;
  elements.profileButton.querySelector("img").src = avatarPath;
  elements.cardCrewAvatar.src = avatarPath;
  elements.cardCrewAvatar.alt = `${avatarLabel}のクルー`;
  elements.cardCrewName.textContent = displayName;
  elements.crewCharacters.forEach((character) => {
    character.classList.toggle("is-player", character.dataset.avatar === selectedAvatar);
  });
}

function clearQuizCountdown() {
  window.clearTimeout(quizPhaseTimer);
  window.clearInterval(quizTickTimer);
  quizPhaseTimer = 0;
  quizTickTimer = 0;
  quizPhaseDeadline = 0;
  quizPhaseDuration = 0;
  quizPhaseMode = "idle";
  quizCycleId += 1;
}

function updateQuizCountdown() {
  if (quizPhaseMode === "idle") return;

  const remaining = Math.max(0, quizPhaseDeadline - performance.now());
  const seconds = Math.ceil(remaining / 1000);
  const progress = quizPhaseDuration > 0
    ? clamp((remaining / quizPhaseDuration) * 100, 0, 100)
    : 0;
  const isReview = quizPhaseMode === "review";

  elements.quizTimer.dataset.mode = quizPhaseMode;
  elements.quizTimer.style.setProperty("--timer-progress", `${progress}%`);
  elements.quizTimerLabel.textContent = isReview ? "答え合わせ" : "回答";
  if (elements.quizTimerValue.textContent !== String(seconds)) {
    elements.quizTimerValue.textContent = String(seconds);
    elements.quizTimer.setAttribute(
      "aria-label",
      `${isReview ? "答え合わせ" : "回答"} 残り${seconds}秒`
    );
  }

  if (isReview) {
    elements.nextLabel.textContent = `${seconds}秒間、答え合わせ中`;
    elements.nextButton.querySelector("b").textContent = "→";
    return;
  }

  elements.nextLabel.textContent = Number.isInteger(quizState.selectedAnswer)
    ? `残り${seconds}秒・回答は変更できます`
    : `${seconds}秒間、回答を選べます`;
  elements.nextButton.querySelector("b").textContent = "●";
}

function startQuizCountdown(mode, duration, onComplete) {
  clearQuizCountdown();
  const cycleId = quizCycleId;
  quizPhaseMode = mode;
  quizPhaseDuration = duration;
  quizPhaseDeadline = performance.now() + duration;
  updateQuizCountdown();

  quizTickTimer = window.setInterval(updateQuizCountdown, 100);
  quizPhaseTimer = window.setTimeout(() => {
    if (cycleId !== quizCycleId) return;
    window.clearInterval(quizTickTimer);
    quizTickTimer = 0;
    quizPhaseTimer = 0;
    onComplete();
  }, duration);
}

function renderQuestion() {
  clearQuizCountdown();
  const question = questionBank[quizState.current];
  const number = String(quizState.current + 1).padStart(2, "0");
  quizState.answered = false;
  quizState.selectedAnswer = null;

  elements.questionCurrent.textContent = number;
  elements.questionCategory.textContent = question.category;
  elements.questionLabel.textContent = `QUESTION ${number}`;
  elements.questionInstruction.textContent = question.instruction;
  elements.difficultyChip.textContent = difficultyLabel(question.weight);
  elements.difficultyChip.classList.toggle("is-boost", question.weight >= 1.2);
  elements.questionText.textContent = question.question;
  elements.quizProgressBar.style.width = `${(quizState.current / questionBank.length) * 100}%`;
  elements.answers.replaceChildren();
  elements.quizPanel.dataset.mode = "answer";
  elements.feedback.classList.remove("is-update");
  elements.feedback.classList.add("is-answering");
  elements.feedbackTitle.textContent = "回答タイム";
  elements.feedbackText.textContent = "10秒間は何度でも選び直せます。";
  elements.feedback.hidden = false;
  elements.nextButton.disabled = true;
  elements.nextButton.classList.add("is-countdown");

  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "quiz-answer";
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
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
  startQuizCountdown("answer", ANSWER_TIME_MS, revealAnswer);
}

function selectAnswer(selectedIndex) {
  if (quizState.answered) return;

  quizState.selectedAnswer = quizState.selectedAnswer === selectedIndex
    ? null
    : selectedIndex;

  const buttons = [...elements.answers.querySelectorAll(".quiz-answer")];
  buttons.forEach((button, index) => {
    const isSelected = index === quizState.selectedAnswer;
    button.classList.toggle("is-choice", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  elements.feedbackTitle.textContent = Number.isInteger(quizState.selectedAnswer)
    ? "回答をセット！"
    : "回答タイム";
  elements.feedbackText.textContent = "タイマーが0になるまで自由に変更できます。";
  updateQuizCountdown();
}

function revealAnswer() {
  if (quizState.answered || currentState !== "quiz") return;
  quizState.answered = true;
  clearQuizCountdown();

  const question = questionBank[quizState.current];
  const selectedIndex = quizState.selectedAnswer;
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
    button.classList.remove("is-choice");
    if (index === question.answer) button.classList.add("is-answer-key");
    if (index === selectedIndex) {
      button.classList.add(isCorrect ? "is-selected-key" : "is-selected");
      button.setAttribute("aria-pressed", "true");
    }
  });

  elements.feedbackTitle.textContent = isCorrect
    ? "正解！ エネルギーチャージ"
    : "答えをチェック！";
  elements.feedback.classList.remove("is-answering");
  elements.feedback.classList.toggle("is-update", !isCorrect);
  elements.feedbackText.textContent = question.explanation;
  elements.feedback.hidden = false;
  elements.quizPanel.dataset.mode = "review";
  elements.nextButton.disabled = true;
  elements.quizProgressBar.style.width = `${((quizState.current + 1) / questionBank.length) * 100}%`;
  startQuizCountdown("review", REVIEW_TIME_MS, advanceQuiz);
}

function advanceQuiz() {
  if (currentState !== "quiz" || !quizState.answered) return;
  clearQuizCountdown();

  if (quizState.current === questionBank.length - 1) {
    showReadyPanel();
    return;
  }

  quizState.current += 1;
  renderQuestion();
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

function showReadyPanel() {
  clearQuizCountdown();
  const metrics = calculateQuizMetrics();
  latestMetrics = {
    ...metrics,
    categoryScores: { ...metrics.categoryScores }
  };
  missionParameters = { power: metrics.power, stability: metrics.safety };
  syncPlayerIdentity();

  setState("ready");
  setPhase("ready");
  showPanel("ready");
  elements.missionStatus.textContent = "READY";
  elements.trajectoryLabel.textContent = "DATA LOCKED";
  elements.engineLabel.textContent = "READY";
  elements.launchButton.focus({ preventScroll: true });
}

function startQuiz() {
  clearQuizCountdown();
  if (!elements.profileName.value.trim()) elements.profileName.value = "CREW MEMBER";
  syncPlayerIdentity();
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
  const playerCharacter = elements.crewCharacters.find((character) => character.dataset.avatar === selectedAvatar);
  const boardingOrder = [
    ...elements.crewCharacters.filter((character) => character !== playerCharacter),
    playerCharacter
  ].filter(Boolean);

  elements.crewCharacters.forEach((character, index) => {
    const boardingIndex = boardingOrder.indexOf(character);
    const characterRect = character.getBoundingClientRect();
    const startX = stageWidth * startOffsets[index];
    const targetWindowY = rocketRect.top - stageRect.top + rocketRect.height * 0.32;
    const characterCenterY = stageRect.height - stageRect.height * 0.06 - characterRect.height * 0.5;
    const boardY = targetWindowY - characterCenterY;
    const lean = startX < 0 ? 6 : -6;

    character.style.setProperty("--crew-start-x", `${startX.toFixed(1)}px`);
    character.style.setProperty("--crew-mid-x", `${(startX * 0.46).toFixed(1)}px`);
    character.style.setProperty("--crew-board-y", `${boardY.toFixed(1)}px`);
    character.style.setProperty("--crew-delay", `${(boardingIndex * delayStep).toFixed(3)}s`);
    character.style.setProperty("--crew-lean", `${lean}deg`);
    character.style.setProperty("--crew-lean-back", `${lean * -1}deg`);
  });

  elements.boardingCrew.classList.remove("is-boarding");
  void elements.boardingCrew.offsetWidth;
  elements.boardingCrew.classList.add("is-boarding");

  boardingOrder.forEach((character, index) => {
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

  elements.cardCrewAvatar.src = `./assets/crew-${selectedAvatar}.svg`;
  elements.cardCrewAvatar.alt = `${avatarLabels[selectedAvatar] ?? avatarLabels.green}のクルー`;
  elements.cardCrewName.textContent = displayName;
  elements.cardCrewRole.textContent = profile.role;

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
  elements.saveCardButton.focus({ preventScroll: true });
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
  elements.outputLive.textContent = snapshot.power;
  elements.safetyLive.textContent = snapshot.stability;
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
  clearQuizCountdown();
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
elements.launchButton.addEventListener("click", launch);
elements.retryButton.addEventListener("click", resetMission);
elements.profileButton.addEventListener("click", openProfileCard);
elements.cardBackButton.addEventListener("click", returnToResult);
elements.saveCardButton.addEventListener("click", saveProfileCard);
elements.profileName.addEventListener("input", syncPlayerIdentity);
elements.profileName.addEventListener("focus", () => {
  elements.briefingPanel.classList.add("is-name-editing");
});
elements.profileName.addEventListener("blur", () => {
  elements.briefingPanel.classList.remove("is-name-editing");
});
elements.profileName.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.isComposing) return;
  event.preventDefault();
  elements.profileName.blur();
  startQuiz();
});
elements.avatarOptions.forEach((option) => {
  option.addEventListener("click", () => {
    selectedAvatar = option.dataset.avatar;
    elements.avatarOptions.forEach((item) => {
      const isSelected = item === option;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
    syncPlayerIdentity();
  });
});

createEffectPieces();
resetQuizData();
setAltitude(0);
syncPlayerIdentity();
