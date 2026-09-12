const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "batches.json");
const DB_FILE = path.join(__dirname, "results.json");

app.use(express.json({ limit: "1mb" }));

function readJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) {
      return fallback;
    }

    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    console.error("JSON error:", err.message);
    return fallback;
  }
}

function getData() {
  const data = readJSON(DATA_FILE, {
    site: {
      name: "LoyalLearn",
      tagline: "Learn • Practice • Achieve"
    },
    batches: []
  });

  if (!Array.isArray(data.batches)) {
    data.batches = [];
  }

  return data;
}

function getResults() {
  return readJSON(DB_FILE, []);
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, "[]");
}

function cleanName(name) {
  return String(name || "Student")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40) || "Student";
}

/* API */

app.get("/health", function(req, res) {
  res.json({
    ok: true,
    service: "LoyalLearn"
  });
});

app.get("/api/data", function(req, res) {
  res.json(getData());
});

app.get("/api/rank", function(req, res) {
  try {
    const results = getResults();
    const grouped = {};

    results.forEach(function(item) {
      const name = cleanName(item.name);

      if (!grouped[name]) {
        grouped[name] = {
          name: name,
          tests: 0,
          bestScore: 0,
          totalCorrect: 0
        };
      }

      grouped[name].tests += 1;
      grouped[name].bestScore = Math.max(
        grouped[name].bestScore,
        Number(item.score || 0)
      );
      grouped[name].totalCorrect += Number(
        item.correct || 0
      );
    });

    const ranking = Object.values(grouped)
      .sort(function(a, b) {
        if (b.bestScore !== a.bestScore) {
          return b.bestScore - a.bestScore;
        }

        return b.totalCorrect - a.totalCorrect;
      })
      .map(function(item, index) {
        return {
          rank: index + 1,
          name: item.name,
          tests: item.tests,
          bestScore: item.bestScore,
          totalCorrect: item.totalCorrect
        };
      });

    res.json(ranking);
  } catch (err) {
    console.error("Rank error:", err.message);
    res.json([]);
  }
});

app.post("/api/result", function(req, res) {
  try {
    const body = req.body || {};

    const result = {
      name: cleanName(body.name),
      batch: String(body.batch || "UPSC"),
      score: Number(body.score || 0),
      correct: Number(body.correct || 0),
      wrong: Number(body.wrong || 0),
      total: Number(body.total || 0),
      accuracy: Number(body.accuracy || 0),
      time: Number(body.time || 0),
      date: new Date().toISOString()
    };

    const results = getResults();

    results.push(result);

    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(results, null, 2)
    );

    res.json({
      ok: true
    });
  } catch (err) {
    console.error("Result error:", err.message);

    res.status(500).json({
      ok: false
    });
  }
});

/* WEBSITE */

const HTML = String.raw`
<!DOCTYPE html>
<html lang="hi">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<title>LoyalLearn</title>

<style>

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  background: #eef6ff;
  color: #172033;
  line-height: 1.5;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.nav {
  background: #061b3a;
  color: white;
  min-height: 66px;
  padding: 10px 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 25px;
  font-weight: 900;
}

.logo span {
  color: #ffd43b;
}

.navlinks {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navlinks button {
  background: none;
  border: 0;
  color: white;
  font-weight: 700;
}

.lang {
  background: white !important;
  color: #061b3a !important;
  padding: 8px 12px;
  border-radius: 8px;
}

.container {
  width: 92%;
  max-width: 1180px;
  margin: auto;
}

.hero {
  background: linear-gradient(
    135deg,
    #061b3a,
    #1261a0
  );
  color: white;
  padding: 70px 0;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 40px;
  align-items: center;
}

.hero h1 {
  font-size: 52px;
  line-height: 1.1;
  margin: 15px 0;
}

.hero h1 span {
  color: #ffd43b;
  display: block;
}

.hero p {
  font-size: 18px;
}

.buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 25px;
}

.btn {
  border: 0;
  padding: 13px 20px;
  border-radius: 10px;
  font-weight: 800;
}

.primary {
  background: #ffd43b;
  color: #061b3a;
}

.secondary {
  background: white;
  color: #061b3a;
}

.hero-art {
  height: 310px;
  border-radius: 25px;
  background: linear-gradient(
    145deg,
    #214f83,
    #031a38
  );
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,.3);
}

.mountain {
  width: 0;
  height: 0;
  border-left: 190px solid transparent;
  border-right: 190px solid transparent;
  border-bottom: 260px solid #f5f8fc;
}

.section {
  padding: 50px 0;
}

.section h2 {
  font-size: 32px;
  margin-bottom: 25px;
}

.stats {
  padding: 35px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 18px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 25px rgba(20,50,90,.09);
}

.stat {
  text-align: center;
}

.stat b {
  display: block;
  font-size: 30px;
  color: #1261a0;
}

.batch-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 20px;
}

.batch-card h3 {
  margin-bottom: 10px;
}

.batch-card p {
  color: #667085;
  margin-bottom: 18px;
}

.test-box {
  max-width: 850px;
  margin: auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.timer {
  background: #061b3a;
  color: #ffd43b;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 900;
}

.question {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

.option {
  width: 100%;
  display: block;
  text-align: left;
  background: white;
  border: 2px solid #d8e0ea;
  padding: 15px;
  border-radius: 10px;
  margin: 10px 0;
}

.option.selected {
  background: #e8f2ff;
  border-color: #1261a0;
}

.controls {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 25px;
}

.result {
  text-align: center;
  max-width: 850px;
  margin: auto;
}

.score {
  font-size: 65px;
  font-weight: 900;
  color: #1261a0;
  margin: 20px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 15px;
  margin: 25px 0;
}

.review-item {
  background: white;
  padding: 20px;
  border-radius: 14px;
  margin: 15px 0;
  box-shadow: 0 5px 18px rgba(0,0,0,.07);
}

.review-item p {
  margin-top: 10px;
}

.podium {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 12px;
  max-width: 650px;
  margin: 30px auto;
}

.pod {
  width: 30%;
  text-align: center;
  padding: 20px 10px;
  border-radius: 15px 15px 0 0;
}

.first {
  min-height: 180px;
  background: #fff2c9;
}

.second {
  min-height: 140px;
  background: #edf0f4;
}

.third {
  min-height: 110px;
  background: #fff0e6;
}

.rank-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.rank-table th,
.rank-table td {
  padding: 14px;
  border-bottom: 1px solid #edf0f5;
  text-align: left;
}

.rank-table th {
  background: #061b3a;
  color: white;
}

.footer {
  background: #061b3a;
  color: white;
  padding: 35px;
  text-align: center;
  margin-top: 50px;
}

.error {
  max-width: 700px;
  margin: 50px auto;
  padding: 30px;
  text-align: center;
}

@media(max-width:760px) {

  .nav {
    padding: 10px 14px;
  }

  .navlinks {
    gap: 8px;
    font-size: 12px;
  }

  .lang {
    display: none;
  }

  .hero {
    padding: 45px 0;
  }

  .hero-grid {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 38px;
  }

  .hero-art {
    height: 250px;
  }

  .stats-grid {
    grid-template-columns: repeat(2,1fr);
  }

  .batch-grid {
    grid-template-columns: 1fr;
  }

  .result-grid {
    grid-template-columns: 1fr;
  }

}

</style>

</head>

<body>

<nav class="nav">

<div class="logo">
Loyal<span>Learn</span>
</div>

<div class="navlinks">

<button onclick="home()">Home</button>

<button onclick="startPage()">Start Test</button>

<button onclick="rankPage()">
Rank Dashboard
</button>

<button onclick="aboutPage()">About</button>

<button
  class="lang"
  onclick="toggleLang()"
  id="langBtn"
>
हिंदी
</button>

</div>

</nav>

<div id="app"></div>

<footer class="footer">
<b>LoyalLearn</b><br>
Learn • Practice • Achieve
</footer>

<script>

let D = {};

let currentBatch = null;

let currentQuestions = [];

let currentIndex = 0;

let answers = [];

let studentName = "";

let seconds = 0;

let timer = null;

let language = "both";

function esc(value) {

  return String(value == null ? "" : value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

async function boot() {

  try {

    const response = await fetch("/api/data");

    if (!response.ok) {
      throw new Error("Data loading failed");
    }

    D = await response.json();

    home();

  } catch (error) {

    console.error(error);

    document.getElementById("app").innerHTML =
      '<div class="container">' +
      '<div class="card error">' +
      '<h2>Website Loading Error</h2>' +
      '<p>Please refresh the page.</p>' +
      '</div>' +
      '</div>';

  }

}

function formatTime(value) {

  const minutes =
    Math.floor(value / 60)
    .toString()
    .padStart(2,"0");

  const secondsPart =
    (value % 60)
    .toString()
    .padStart(2,"0");

  return minutes + ":" + secondsPart;
}

`; const PART2 = String.raw`
function home() {

  var batches = Array.isArray(D.batches)
    ? D.batches
    : [];

  var html = "";

  html += '<section class="hero">';
  html += '<div class="container hero-grid">';

  html += '<div>';
  html += '<p>Your Dream • Our Mission</p>';

  html += '<h1>';
  html += 'UPSC तैयारी';
  html += '<span>अब और भी आसान!</span>';
  html += '</h1>';

  html += '<p>';
  html += 'अभ्यास करो, अपनी तैयारी जांचो और हर टेस्ट के साथ ';
  html += 'अपने लक्ष्य के करीब पहुंचो।';
  html += '</p>';

  html += '<div class="buttons">';

  html += '<button class="btn primary" onclick="startPage()">';
  html += '🚀 Start Test';
  html += '</button>';

  html += '<button class="btn secondary" onclick="rankPage()">';
  html += '🏆 Rank Dashboard';
  html += '</button>';

  html += '</div>';
  html += '</div>';

  html += '<div class="hero-art">';
  html += '<div class="mountain"></div>';
  html += '</div>';

  html += '</div>';
  html += '</section>';

  html += '<section class="stats">';
  html += '<div class="container">';
  html += '<div class="stats-grid">';

  html += '<div class="card stat">';
  html += '<b>' + batches.length + '</b>';
  html += '<span>Active Batches</span>';
  html += '</div>';

  html += '<div class="card stat">';
  html += '<b>1000+</b>';
  html += '<span>Practice Questions</span>';
  html += '</div>';

  html += '<div class="card stat">';
  html += '<b>24×7</b>';
  html += '<span>Practice</span>';
  html += '</div>';

  html += '<div class="card stat">';
  html += '<b>FREE</b>';
  html += '<span>For Students</span>';
  html += '</div>';

  html += '</div>';
  html += '</div>';
  html += '</section>';

  html += '<section class="section">';
  html += '<div class="container">';
  html += '<h2>📚 Available Batches</h2>';
  html += '<div class="batch-grid">';

  if (batches.length === 0) {

    html += '<div class="card">';
    html += '<h3>No Batch Found</h3>';
    html += '<p>batches.json में अभी कोई batch उपलब्ध नहीं है।</p>';
    html += '</div>';

  } else {

    batches.forEach(function(batch, index) {

      html += '<div class="card batch-card">';

      html += '<h3>';
      html += esc(
        batch.name ||
        batch.title ||
        "UPSC Practice Batch"
      );
      html += '</h3>';

      html += '<p>';
      html += esc(
        batch.description ||
        "UPSC level practice questions और detailed solutions."
      );
      html += '</p>';

      html += '<button class="btn primary" ';
      html += 'onclick="selectBatch(' + index + ')">';
      html += 'Start Batch';
      html += '</button>';

      html += '</div>';

    });
  }

  html += '</div>';
  html += '</div>';
  html += '</section>';

  document.getElementById("app").innerHTML = html;
}

function startPage() {

  var batches = Array.isArray(D.batches)
    ? D.batches
    : [];

  var html = "";

  html += '<section class="section">';
  html += '<div class="container">';
  html += '<div class="card test-box">';

  html += '<h2>🚀 Start UPSC Test</h2>';

  html += '<p style="margin:15px 0;color:#667085">';
  html += 'अपना नाम डालें और batch चुनकर test शुरू करें।';
  html += '</p>';

  html += '<input id="studentName" ';
  html += 'placeholder="अपना नाम लिखें" ';
  html += 'style="width:100%;padding:14px;border:1px solid #ccd5df;';
  html += 'border-radius:10px;font-size:16px;margin:15px 0;">';

  html += '<h3 style="margin:15px 0">Language</h3>';

  html += '<select id="languageSelect" ';
  html += 'style="width:100%;padding:14px;border:1px solid #ccd5df;';
  html += 'border-radius:10px;font-size:16px;">';

  html += '<option value="both">हिंदी + English</option>';
  html += '<option value="en">English</option>';
  html += '<option value="hi">हिंदी</option>';

  html += '</select>';

  html += '<h3 style="margin:25px 0 15px">Select Batch</h3>';

  html += '<div class="batch-grid">';

  batches.forEach(function(batch, index) {

    html += '<button class="card" ';
    html += 'onclick="begin(' + index + ')" ';
    html += 'style="text-align:left;border:2px solid #d8e0ea">';

    html += '<h3>';
    html += esc(
      batch.name ||
      batch.title ||
      "Batch"
    );
    html += '</h3>';

    html += '<p>';
    html += esc(
      batch.description ||
      "UPSC Practice Test"
    );
    html += '</p>';

    html += '</button>';

  });

  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</section>';

  document.getElementById("app").innerHTML = html;
}

function selectBatch(index) {

  startPage();

  setTimeout(function() {

    begin(index);

  }, 100);
}

function normalizeQuestions(batch) {

  if (!batch) {
    return [];
  }

  var questions =
    batch.questions ||
    batch.question ||
    batch.data ||
    [];

  if (!Array.isArray(questions)) {
    return [];
  }

  return questions.map(function(item) {

    var options =
      item.options ||
      item.choices ||
      [
        item.option1,
        item.option2,
        item.option3,
        item.option4
      ].filter(Boolean);

    return {
      question:
        item.question ||
        item.q ||
        item.text ||
        "Question",

      question_hi:
        item.question_hi ||
        item.hindi ||
        item.hi ||
        "",

      question_en:
        item.question_en ||
        item.english ||
        item.en ||
        "",

      options:
        Array.isArray(options)
        ? options
        : [],

      answer:
        item.answer !== undefined
        ? item.answer
        : item.correct !== undefined
        ? item.correct
        : item.correctAnswer !== undefined
        ? item.correctAnswer
        : item.correct_option !== undefined
        ? item.correct_option
        : 0,

      explanation:
        item.explanation ||
        item.solution ||
        item.explain ||
        "",

      explanation_hi:
        item.explanation_hi ||
        item.solution_hi ||
        "",

      explanation_en:
        item.explanation_en ||
        item.solution_en ||
        ""
    };

  });
}

function begin(index) {

  studentName =
    document.getElementById("studentName") &&
    document.getElementById("studentName").value
      ? document.getElementById("studentName").value.trim()
      : "Student";

  language =
    document.getElementById("languageSelect")
      ? document.getElementById("languageSelect").value
      : "both";

  currentBatch = D.batches[index];

  currentQuestions =
    normalizeQuestions(currentBatch);

  if (currentQuestions.length === 0) {

    document.getElementById("app").innerHTML =
      '<div class="container">' +
      '<div class="card error">' +
      '<h2>Questions नहीं मिले</h2>' +
      '<p>batches.json में questions check करें।</p>' +
      '</div>' +
      '</div>';

    return;
  }

  currentIndex = 0;

  answers =
    new Array(currentQuestions.length).fill(null);

  seconds = 0;

  clearInterval(timer);

  timer = setInterval(function() {

    seconds++;

    var timerElement =
      document.getElementById("timer");

    if (timerElement) {
      timerElement.textContent =
        formatTime(seconds);
    }

  }, 1000);

  renderQ();
}

function getQuestionText(question) {

  if (language === "hi") {

    return esc(
      question.question_hi ||
      question.question ||
      question.question_en
    );

  }

  if (language === "en") {

    return esc(
      question.question_en ||
      question.question ||
      question.question_hi
    );

  }

  var hi =
    question.question_hi ||
    question.question ||
    "";

  var en =
    question.question_en ||
    "";

  if (hi && en && hi !== en) {

    return (
      '<div>' +
      esc(hi) +
      '</div>' +

      '<div style="margin-top:12px;color:#667085">' +
      esc(en) +
      '</div>'
    );

  }

  return esc(hi || en);
}

boot();
`;

const FINAL_HTML = HTML + PART2;

app.get("/", function(req, res) {
  res.type("html").send(FINAL_HTML);
});

app.listen(PORT, "0.0.0.0", function() {
  console.log(
    "LoyalLearn running on port " + PORT
  );
});
