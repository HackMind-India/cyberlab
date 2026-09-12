const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA = path.join(__dirname, "batches.json");
const DB = path.join(__dirname, "results.json");

app.use(express.json({ limit: "1mb" }));

function readJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error("JSON error:", e.message);
    return fallback;
  }
}

function cleanName(name) {
  return String(name || "Student")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40) || "Student";
}

function getData() {
  return readJSON(DATA, {
    site: {
      name: "LoyalLearn",
      tagline: "Learn • Practice • Achieve"
    },
    batches: []
  });
}

function getResults() {
  return readJSON(DB, []);
}

if (!fs.existsSync(DB)) {
  fs.writeFileSync(DB, "[]");
}

/* ---------------- API ---------------- */

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "LoyalLearn"
  });
});

app.get("/api/data", (req, res) => {
  try {
    res.json(getData());
  } catch (e) {
    res.status(500).json({
      error: "Unable to load batches"
    });
  }
});

app.get("/api/rank", (req, res) => {
  try {
    const results = getResults();

    const grouped = {};

    results.forEach(r => {
      const name = cleanName(r.name);

      if (!grouped[name]) {
        grouped[name] = {
          name,
          tests: 0,
          bestScore: 0,
          totalCorrect: 0
        };
      }

      grouped[name].tests++;
      grouped[name].bestScore = Math.max(
        grouped[name].bestScore,
        Number(r.score || 0)
      );
      grouped[name].totalCorrect += Number(r.correct || 0);
    });

    const rank = Object.values(grouped)
      .sort((a, b) => {
        if (b.bestScore !== a.bestScore) {
          return b.bestScore - a.bestScore;
        }
        return b.totalCorrect - a.totalCorrect;
      })
      .map((x, i) => ({
        ...x,
        rank: i + 1
      }));

    res.json(rank);
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
});

app.post("/api/result", (req, res) => {
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

    fs.writeFileSync(DB, JSON.stringify(results, null, 2));

    res.json({
      ok: true,
      result
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      error: "Unable to save result"
    });
  }
});

/* ---------------- WEBSITE ---------------- */

const HTML = `
<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>LoyalLearn</title>

<style>
*{
  box-sizing:border-box;
  margin:0;
  padding:0;
}

body{
  font-family:Arial,Helvetica,sans-serif;
  background:#eef6ff;
  color:#172033;
}

nav{
  background:#071a38;
  color:white;
  min-height:64px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:10px 5%;
  position:sticky;
  top:0;
  z-index:20;
}

.logo{
  font-size:24px;
  font-weight:900;
}

.logo span{
  color:#ffd43b;
}

.navlinks{
  display:flex;
  gap:20px;
  align-items:center;
  flex-wrap:wrap;
}

.navlinks button{
  background:none;
  border:0;
  color:white;
  cursor:pointer;
  font-size:15px;
}

.lang{
  background:white!important;
  color:#071a38!important;
  padding:8px 12px;
  border-radius:8px;
}

#app{
  min-height:calc(100vh - 64px);
}

.container{
  width:92%;
  max-width:1150px;
  margin:auto;
}

.hero{
  min-height:460px;
  padding:70px 0;
  display:flex;
  align-items:center;
  background:
    linear-gradient(135deg,#071a38,#124e8c);
  color:white;
}

.hero-grid{
  display:grid;
  grid-template-columns:1.2fr 1fr;
  gap:30px;
  align-items:center;
}

.hero h1{
  font-size:55px;
  line-height:1.05;
  margin-bottom:18px;
}

.hero h1 span{
  color:#ffd43b;
}

.hero h2{
  font-size:26px;
  margin-bottom:15px;
}

.hero p{
  font-size:18px;
  line-height:1.6;
  opacity:.92;
}

.buttons{
  display:flex;
  gap:12px;
  margin-top:25px;
  flex-wrap:wrap;
}

.btn{
  border:0;
  border-radius:10px;
  padding:13px 20px;
  cursor:pointer;
  font-weight:bold;
  font-size:16px;
}

.primary{
  background:#ffd43b;
  color:#071a38;
}

.secondary{
  background:white;
  color:#071a38;
}

.hero-art{
  min-height:290px;
  border-radius:25px;
  background:
    radial-gradient(circle at 50% 25%,#ffd43b 0 8%,transparent 9%),
    linear-gradient(145deg,#173f72,#0a2449);
  display:flex;
  align-items:end;
  justify-content:center;
  overflow:hidden;
  box-shadow:0 20px 50px rgba(0,0,0,.3);
}

.mountain{
  width:0;
  height:0;
  border-left:190px solid transparent;
  border-right:190px solid transparent;
  border-bottom:250px solid #f4f7fb;
  filter:drop-shadow(0 5px 0 #b9cbe0);
}

.stats{
  padding:40px 0;
}

.stats-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:18px;
}

.card{
  background:white;
  padding:24px;
  border-radius:16px;
  box-shadow:0 8px 25px rgba(20,50,90,.09);
}

.stat{
  text-align:center;
}

.stat b{
  display:block;
  font-size:30px;
  color:#124e8c;
  margin-bottom:5px;
}

.section{
  padding:50px 0;
}

.section h2{
  font-size:32px;
  margin-bottom:25px;
}

.batch-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:20px;
}

.batch-card h3{
  margin-bottom:10px;
}

.batch-card p{
  color:#667085;
  margin-bottom:18px;
  line-height:1.5;
}

.testbox{
  max-width:850px;
  margin:40px auto;
}

.topbar{
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:center;
  margin-bottom:20px;
  flex-wrap:wrap;
}

.timer{
  background:#071a38;
  color:#ffd43b;
  padding:10px 16px;
  border-radius:10px;
  font-weight:bold;
  font-size:18px;
}

.question{
  font-size:23px;
  line-height:1.5;
  margin-bottom:20px;
}

.option{
  display:block;
  width:100%;
  text-align:left;
  border:2px solid #d8e0ea;
  background:white;
  padding:15px;
  border-radius:10px;
  margin:10px 0;
  cursor:pointer;
  font-size:16px;
}

.option:hover{
  border-color:#124e8c;
}

.option.selected{
  border-color:#124e8c;
  background:#e8f2ff;
}

.option.correct{
  border-color:#159447;
  background:#e5f8ed;
}

.option.wrong{
  border-color:#d92d20;
  background:#fff0ee;
}

.controls{
  display:flex;
  justify-content:space-between;
  margin-top:25px;
  gap:10px;
}

.result{
  text-align:center;
  max-width:800px;
  margin:50px auto;
}

.score{
  font-size:65px;
  font-weight:900;
  color:#124e8c;
  margin:20px;
}

.result-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:15px;
  margin:25px 0;
}

.review{
  text-align:left;
  margin-top:30px;
}

.review-item{
  background:white;
  padding:20px;
  border-radius:14px;
  margin:15px 0;
  box-shadow:0 5px 18px rgba(0,0,0,.07);
}

.review-item h4{
  margin-bottom:12px;
}

.rank-table{
  width:100%;
  border-collapse:collapse;
  background:white;
  border-radius:14px;
  overflow:hidden;
}

.rank-table th,
.rank-table td{
  padding:15px;
  border-bottom:1px solid #e8edf3;
  text-align:left;
}

.rank-table th{
  background:#071a38;
  color:white;
}

.podium{
  display:flex;
  justify-content:center;
  align-items:end;
  gap:12px;
  margin:35px auto;
  max-width:650px;
}

.podium div{
  width:30%;
  text-align:center;
  background:white;
  padding:20px 10px;
  border-radius:15px 15px 0 0;
  box-shadow:0 5px 20px rgba(0,0,0,.1);
}

.podium .first{
  min-height:180px;
}

.podium .second{
  min-height:140px;
}

.podium .third{
  min-height:110px;
}

.error{
  max-width:800px;
  margin:50px auto;
  padding:25px;
  background:#fff0ee;
  border:1px solid #ffb4ab;
  border-radius:15px;
}

footer{
  background:#071a38;
  color:white;
  text-align:center;
  padding:30px 15px;
  margin-top:40px;
}

@media(max-width:800px){
  .hero-grid{
    grid-template-columns:1fr;
  }

  .hero h1{
    font-size:40px;
  }

  .stats-grid{
    grid-template-columns:repeat(2,1fr);
  }

  .batch-grid{
    grid-template-columns:1fr;
  }

  .result-grid{
    grid-template-columns:1fr;
  }

  .navlinks{
    gap:10px;
  }

  nav{
    align-items:flex-start;
  }
}

@media(max-width:500px){
  .hero{
    padding:45px 0;
  }

  .hero h1{
    font-size:34px;
  }

  .stats-grid{
    grid-template-columns:1fr;
  }

  .navlinks button{
    font-size:13px;
  }

  .question{
    font-size:19px;
  }
}
</style>
</head>

<body>

<nav>
  <div class="logo">Loyal<span>Learn</span></div>

  <div class="navlinks">
    <button onclick="home()">Home</button>
    <button onclick="startPage()">Start Test</button>
    <button onclick="rankPage()">Rank Dashboard</button>
    <button onclick="aboutPage()">About</button>
    <button class="lang" onclick="toggleLang()" id="langBtn">हिंदी</button>
  </div>
</nav>

<div id="app"></div>

<footer>
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

function esc(v){
  return String(v ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function showError(message){
  document.getElementById("app").innerHTML =
    '<div class="container"><div class="error">' +
    '<h2>Website Loading Error</h2>' +
    '<p>' + esc(message) + '</p>' +
    '<br><button class="btn primary" onclick="location.reload()">Reload</button>' +
    '</div></div>';
}

async function boot(){
  try{
    const r = await fetch("/api/data");

    if(!r.ok){
      throw new Error("Server data load failed");
    }

    D = await r.json();

    if(!D || typeof D !== "object"){
      throw new Error("Invalid batches.json");
    }

    home();
  }catch(e){
    console.error(e);
    showError(e.message);
  }
}

function home(){

  const batches = Array.isArray(D.batches) ? D.batches : [];

  document.getElementById("app").innerHTML = `

  <section class="hero">
    <div class="container hero-grid">

      <div>
        <h2>Your Dream / Our Mission</h2>

        <h1>
          UPSC तैयारी
          <span>अब और भी आसान!</span>
        </h1>

        <p>
          अभ्यास करो, अपनी तैयारी जांचो और हर टेस्ट के साथ
          अपने लक्ष्य के करीब पहुंचो।
        </p>

        <div class="buttons">
          <button class="btn primary" onclick="startPage()">
            🚀 Start Test
          </button>

          <button class="btn secondary" onclick="rankPage()">
            🏆 Rank Dashboard
          </button>
        </div>
      </div>

      <div class="hero-art">
        <div class="mountain"></div>
      </div>

    </div>
  </section>

  <section class="stats">
    <div class="container">

      <div class="stats-grid">

        <div class="card stat">
          <b>${batches.length}</b>
          <span>Active Batches</span>
        </div>

        <div class="card stat">
          <b>1000+</b>
          <span>Practice Questions</span>
        </div>

        <div class="card stat">
          <b>24×7</b>
          <span>Practice</span>
        </div>

        <div class="card stat">
          <b>FREE</b>
          <span>For Students</span>
        </div>

      </div>

    </div>
  </section>

  <section class="section">
    <div class="container">

      <h2>📚 Available Batches</h2>

      <div class="batch-grid">

        ${
          batches.length
          ? batches.map((b,i)=>`

            <div class="card batch-card">

              <h3>${esc(b.name || b.title || "UPSC Practice Batch")}</h3>

              <p>
                ${esc(
                  b.description ||
                  "UPSC level practice questions और detailed solutions."
                )}
              </p>

              <button
                class="btn primary"
                onclick="selectBatch(${i})">
                Start Batch
              </button>

            </div>

          `).join("")
          :
          `<div class="card">
            <h3>No Batch Found</h3>
            <p>
              batches.json में अभी कोई batch/question उपलब्ध नहीं है।
            </p>
          </div>`
        }

      </div>

    </div>
  </section>
  `;
}

function startPage(){

  const batches = Array.isArray(D.batches) ? D.batches : [];

  document.getElementById("app").innerHTML = `

  <section class="section">

    <div class="container">

      <div class="card testbox">

        <h2>🚀 Start UPSC Test</h2>

        <p style="margin:15px 0;color:#667085">
          अपना नाम डालें और batch चुनकर test शुरू करें।
        </p>

        <input
          id="studentName"
          placeholder="अपना नाम लिखें"
          style="
            width:100%;
            padding:14px;
            border:1px solid #ccd5df;
            border-radius:10px;
            font-size:16px;
            margin:15px 0;
          "
        >

        <h3 style="margin:15px 0">Language</h3>

        <select
          id="languageSelect"
          style="
            width:100%;
            padding:14px;
            border:1px solid #ccd5df;
            border-radius:10px;
            font-size:16px;
          "
        >
          <option value="both">हिंदी + English</option>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>

        <h3 style="margin:25px 0 15px">
          Select Batch
        </h3>

        <div class="batch-grid">

          ${
            batches.map((b,i)=>`

              <button
                class="card"
                onclick="begin(${i})"
                style="
                  text-align:left;
                  border:2px solid #d8e0ea;
                  cursor:pointer;
                "
              >
                <h3>${esc(b.name || b.title || "Batch")}</h3>

                <p>
                  ${esc(
                    b.description ||
                    "UPSC Practice Test"
                  )}
                </p>
              </button>

            `).join("")
          }

        </div>

      </div>

    </div>

  </section>
  `;
}

function selectBatch(i){
  startPage();

  setTimeout(()=>{
    begin(i);
  },100);
}

function normalizeQuestions(batch){

  let q =
    batch.questions ||
    batch.question ||
    batch.data ||
    [];

  if(!Array.isArray(q)){
    return [];
  }

  return q.map(x=>{

    const options =
      x.options ||
      x.choices ||
      [
        x.option1,
        x.option2,
        x.option3,
        x.option4
      ].filter(Boolean);

    return {
      question:
        x.question ||
        x.q ||
        x.text ||
        "Question",

      question_hi:
        x.question_hi ||
        x.hindi ||
        x.hi ||
        "",

      question_en:
        x.question_en ||
        x.english ||
        x.en ||
        "",

      options: Array.isArray(options) ? options : [],

      answer:
        x.answer ??
        x.correct ??
        x.correctAnswer ??
        x.correct_option ??
        0,

      explanation:
        x.explanation ||
        x.solution ||
        x.explain ||
        "",

      explanation_hi:
        x.explanation_hi ||
        x.solution_hi ||
        "",

      explanation_en:
        x.explanation_en ||
        x.solution_en ||
        ""
    };

  });
}

function begin(index){

  studentName =
    document.getElementById("studentName")?.value.trim() ||
    "Student";

  language =
    document.getElementById("languageSelect")?.value ||
    "both";

  currentBatch = D.batches[index];

  currentQuestions = normalizeQuestions(currentBatch);

  if(!currentQuestions.length){

    showError(
      "इस batch में questions नहीं मिले। batches.json check करें।"
    );

    return;
  }

  currentIndex = 0;
  answers = new Array(currentQuestions.length).fill(null);
  seconds = 0;

  clearInterval(timer);

  timer = setInterval(()=>{
    seconds++;
    const t = document.getElementById("timer");

    if(t){
      t.textContent = formatTime(seconds);
    }
  },1000);

  renderQ();
}

function formatTime(s){

  const m = Math.floor(s/60)
    .toString()
    .padStart(2,"0");

  const sec = (s%60)
    .toString()
    .padStart(2,"0");

  return m + ":" + sec;
}

function getQuestionText(q){

  if(language === "hi"){
    return q.question_hi || q.question || q.question_en;
  }

  if(language === "en"){
    return q.question_en || q.question || q.question_hi;
  }

  const hi = q.question_hi || q.question;
  const en = q.question_en || "";

  if(hi && en && hi !== en){
    return `<div>${esc(hi)}</div>
            <div style="margin-top:12px;color:#667085">
              ${esc(en)}
            </div>`;
  }

  return esc(hi || en);
}

function renderQ(){

  const q = currentQuestions[currentIndex];

  const selected = answers[currentIndex];

  document.getElementById("app").innerHTML = `

  <section class="section">

    <div class="container">

      <div class="testbox">

        <div class="topbar">

          <b>
            Question ${currentIndex + 1}
            / ${currentQuestions.length}
          </b>

          <div class="timer" id="timer">
            ${formatTime(seconds)}
          </div>

        </div>

        <div class="card">

          <div class="question">
            ${getQuestionText(q)}
          </div>

          <div>

            ${
              q.options.map((op,i)=>`

                <button
                  class="option ${selected === i ? "selected" : ""}"
                  onclick="pick(${i})"
                >
                  <b>${String.fromCharCode(65+i)}.</b>
                  ${esc(op)}
                </button>

              `).join("")
            }

          </div>

          <div class="controls">

            <button
              class="btn secondary"
              onclick="prevQ()"
              ${currentIndex===0 ? "disabled" : ""}
            >
              ← Previous
            </button>

            ${
              currentIndex === currentQuestions.length - 1

              ? `<button
                   class="btn primary"
                   onclick="finish()">
                   Submit Test ✓
                 </button>`

              : `<button
                   class="btn primary"
                   onclick="nextQ()">
                   Next →
                 </button>`
            }

          </div>

        </div>

      </div>

    </div>

  </section>
  `;
}

function pick(i){

  answers[currentIndex] = i;

  renderQ();
}

function prevQ(){

  if(currentIndex > 0){
    currentIndex--;
    renderQ();
  }
}

function nextQ(){

  if(currentIndex < currentQuestions.length - 1){
    currentIndex++;
    renderQ();
  }
}

async function finish(){

  clearInterval(timer);

  let correct = 0;

  currentQuestions.forEach((q,i)=>{

    if(isCorrect(q,answers[i])){
      correct++;
    }

  });

  const total = currentQuestions.length;

  const wrong = total - correct;

  const score = correct;

  const accuracy =
    total
    ? Math.round((correct/total)*100)
    : 0;

  try{

    await fetch("/api/result",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        name:studentName,
        batch:
          currentBatch.name ||
          currentBatch.title ||
          "UPSC",
        score,
        correct,
        wrong,
        total,
        accuracy,
        time:seconds
      })
    });

  }catch(e){
    console.error(e);
  }

  resultPage(
    correct,
    wrong,
    total,
    accuracy
  );
}

function isCorrect(q,userAnswer){

  if(userAnswer === null || userAnswer === undefined){
    return false;
  }

  let a = q.answer;

  if(typeof a === "string"){

    const s = a.trim().toUpperCase();

    if(/^[A-D]$/.test(s)){
      a = s.charCodeAt(0) - 65;
    }else if(!isNaN(Number(s))){
      a = Number(s);
    }

  }

  return Number(a) === Number(userAnswer);
}

function resultPage(
  correct,
  wrong,
  total,
  accuracy
){

  document.getElementById("app").innerHTML = `

  <section class="section">

    <div class="container">

      <div class="card result">

        <h1>🎉 Test Completed!</h1>

        <p style="margin-top:10px">
          Great job, ${esc(studentName)}!
        </p>

        <div class="score">
          ${correct}/${total}
        </div>

        <div class="result-grid">

          <div class="card">
            <b style="color:#159447;font-size:25px">
              ${correct}
            </b>
            <br>Correct
          </div>

          <div class="card">
            <b style="color:#d92d20;font-size:25px">
              ${wrong}
            </b>
            <br>Wrong
          </div>

          <div class="card">
            <b style="color:#124e8c;font-size:25px">
              ${accuracy}%
            </b>
            <br>Accuracy
          </div>

        </div>

        <p>
          Time Taken:
          <b>${formatTime(seconds)}</b>
        </p>

        <div class="buttons" style="justify-content:center">

          <button
            class="btn primary"
            onclick="showReview()">
            📖 Detailed Review
          </button>

          <button
            class="btn secondary"
            onclick="startPage()">
            🔄 Retake Test
          </button>

          <button
            class="btn secondary"
            onclick="rankPage()">
            🏆 Rank Dashboard
          </button>

        </div>

      </div>

    </div>

  </section>
  `;
}

function showReview(){

  let html = `

  <section class="section">

    <div class="container">

      <div class="review">

        <h2>📖 Detailed Solution</h2>

  `;

  currentQuestions.forEach((q,i)=>{

    const user = answers[i];

    const ok = isCorrect(q,user);

    let answerText =
      user === null
      ? "Not Attempted"
      : q.options[user];

    let correctText =
      q.options[q.answer];

    let explanation =
      q.explanation;

    if(language === "hi"){
      explanation =
        q.explanation_hi ||
        q.explanation ||
        q.explanation_en;
    }

    if(language === "en"){
      explanation =
        q.explanation_en ||
        q.explanation ||
        q.explanation_hi;
    }

    if(language === "both"){
      explanation =
        q.explanation_hi ||
        q.explanation ||
        q.explanation_en;
    }

    html += `

      <div class="review-item">

        <h4>
          Q${i+1}.
          ${getQuestionText(q)}
        </h4>

        <p>
          <b>Your Answer:</b>
          <span style="color:${ok ? "#159447" : "#d92d20"}">
            ${esc(answerText || "Not Attempted")}
          </span>
        </p>

        <p style="margin-top:8px">
          <b>Correct Answer:</b>
          <span style="color:#159447">
            ${esc(correctText || "")}
          </span>
        </p>

        ${
          explanation
          ?
          `<p style="margin-top:12px;line-height:1.6">
             <b>Explanation:</b><br>
             ${esc(explanation)}
           </p>`
          :
          ""
        }

      </div>

    `;

  });

  html += `

        <button
          class="btn primary"
          onclick="resultPage(
            ${answers.filter((a,i)=>isCorrect(currentQuestions[i],a)).length},
            ${answers.filter((a,i)=>!isCorrect(currentQuestions[i],a)).length},
            ${currentQuestions.length},
            ${Math.round(
              answers.filter((a,i)=>isCorrect(currentQuestions[i],a)).length /
              currentQuestions.length * 100
            )}
          )">
          ← Back to Result
        </button>

      </div>

    </div>

  </section>
  `;

  document.getElementById("app").innerHTML = html;
}

async function rankPage(){

  document.getElementById("app").innerHTML = `

  <section class="section">

    <div class="container">

      <h2>🏆 Public Rank Dashboard</h2>

      <p style="color:#667085;margin-bottom:20px">
        सभी students की best performance यहाँ दिखाई जाएगी।
      </p>

      <div id="rankContent">
        <div class="card">
          Loading ranking...
        </div>
      </div>

    </div>

  </section>
  `;

  try{

    const r = await fetch("/api/rank");

    const data = await r.json();

    renderRank(data);

  }catch(e){

    document.getElementById("rankContent").innerHTML = `
      <div class="error">
        Ranking load नहीं हो सकी।
      </div>
    `;

  }
}

function renderRank(data){

  const box =
    document.getElementById("rankContent");

  if(!data.length){

    box.innerHTML = `
      <div class="card">
        अभी कोई test result नहीं है।
      </div>
    `;

    return;
  }

  const top = data.slice(0,3);

  let podium = "";

  if(top[1]){
    podium += `
      <div class="second">
        🥈<br>
        <b>${esc(top[1].name)}</b><br>
        ${top[1].bestScore}
      </div>
    `;
  }

  if(top[0]){
    podium += `
      <div class="first">
        🥇<br>
        <b>${esc(top[0].name)}</b><br>
        ${top[0].bestScore}
      </div>
    `;
  }

  if(top[2]){
    podium += `
      <div class="third">
        🥉<br>
        <b>${esc(top[2].name)}</b><br>
        ${top[2].bestScore}
      </div>
    `;
  }

  box.innerHTML = `

    <div class="podium">
      ${podium}
    </div>

    <div style="overflow-x:auto">

      <table class="rank-table">

        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Best Score</th>
            <th>Tests</th>
          </tr>
        </thead>

        <tbody>

          ${
            data.map(x=>`

              <tr>
                <td><b>#${x.rank}</b></td>
                <td>${esc(x.name)}</td>
                <td>${x.bestScore}</td>
                <td>${x.tests}</td>
              </tr>

            `).join("")
          }

        </tbody>

      </table>

    </div>
  `;
}

function aboutPage(){

  document.getElementById("app").innerHTML = `

  <section class="section">

    <div class="container">

      <div class="card">

        <h2>About LoyalLearn</h2>

        <p style="line-height:1.8">
          LoyalLearn एक modern practice platform है,
          जहाँ students UPSC और competitive exams की
          तैयारी practice tests, performance tracking और
          detailed solutions के साथ कर सकते हैं।
        </p>

        <br>

        <h3>Learn • Practice • Achieve</h3>

      </div>

    </div>

  </section>

  `;

}

function toggleLang(){

  if(language === "both"){
    language = "hi";
  }else if(language === "hi"){
    language = "en";
  }else{
    language = "both";
  }

  const btn =
    document.getElementById("langBtn");

  if(btn){
    btn.textContent =
      language === "both"
      ? "हिंदी"
      : language === "hi"
      ? "English"
      : "हिंदी + English";
  }

  if(currentQuestions.length){
    renderQ();
  }
}

boot();

</script>

</body>
</html>
`;

app.get("/", (req, res) => {
  res.type("html").send(HTML);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`LoyalLearn running on port ${PORT}`);
});
