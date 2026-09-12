const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "batches.json");
const RESULTS_FILE = path.join(__dirname, "results.json");

app.use(express.json({ limit: "2mb" }));

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error("JSON read error:", file, e.message);
    return fallback;
  }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
if (!fs.existsSync(RESULTS_FILE)) writeJson(RESULTS_FILE, []);

function cleanName(v) {
  return String(v || "Student").trim().replace(/\s+/g, " ").slice(0, 40) || "Student";
}
function getData() {
  const raw = readJson(DATA_FILE, {});
  if (Array.isArray(raw)) return { batches: raw };
  return raw && typeof raw === "object" ? raw : { batches: [] };
}

app.get("/health", (req, res) => res.json({ ok: true, app: "LoyalLearn" }));

app.get("/api/data", (req, res) => {
  const d = getData();
  res.json(d);
});

app.get("/api/rank", (req, res) => {
  const results = readJson(RESULTS_FILE, []);
  const groups = {};
  for (const r of results) {
    const name = cleanName(r.name);
    if (!groups[name]) groups[name] = { name, totalTests: 0, bestScore: 0, accuracy: 0, attempts: [] };
    groups[name].totalTests++;
    groups[name].bestScore = Math.max(groups[name].bestScore, Number(r.score) || 0);
    groups[name].attempts.push(r);
  }
  const rows = Object.values(groups).map(x => {
    const best = x.attempts.reduce((a,b) => (Number(b.score)||0) > (Number(a.score)||0) ? b : a, x.attempts[0]);
    return {
      name: x.name,
      totalTests: x.totalTests,
      bestScore: x.bestScore,
      accuracy: Number(best && best.accuracy) || 0
    };
  }).sort((a,b) => b.bestScore - a.bestScore || b.accuracy - a.accuracy || b.totalTests - a.totalTests);
  res.json(rows);
});

app.post("/api/result", (req, res) => {
  const body = req.body || {};
  const result = {
    name: cleanName(body.name),
    batch: String(body.batch || "UPSC Practice").slice(0, 100),
    score: Number(body.score) || 0,
    total: Number(body.total) || 0,
    correct: Number(body.correct) || 0,
    wrong: Number(body.wrong) || 0,
    accuracy: Number(body.accuracy) || 0,
    time: Number(body.time) || 0,
    date: new Date().toISOString()
  };
  const results = readJson(RESULTS_FILE, []);
  results.push(result);
  writeJson(RESULTS_FILE, results.slice(-5000));
  res.json({ ok: true, result });
});

const HTML = String.raw`<!doctype html>
<html lang="hi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>LoyalLearn — UPSC Practice Portal</title>
<style>
:root{
  --navy:#06234b;--navy2:#0a356d;--blue:#1473e6;--cyan:#1c9fe8;
  --yellow:#ffc928;--bg:#eef7ff;--text:#14243a;--muted:#64748b;
  --card:#fff;--line:#d9e5f2;--green:#19b985;--red:#ed5b67;
}
*{box-sizing:border-box}html,body{margin:0;padding:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--text);background:var(--bg)}
button,input,select{font:inherit}button{cursor:pointer}
.top{height:62px;background:linear-gradient(90deg,#031d42,#062d5d);color:#fff;display:flex;align-items:center;padding:0 34px;gap:24px;position:sticky;top:0;z-index:20;box-shadow:0 2px 12px #00142a55}
.logo{display:flex;align-items:center;gap:9px;font-weight:800;font-size:22px;min-width:250px}
.logoMark{width:38px;height:38px;border-radius:9px;background:linear-gradient(145deg,#39a7ff,#eaf7ff);display:grid;place-items:center;color:#0b3c7a;font-size:22px;box-shadow:inset 0 0 0 2px #fff7}
.nav{display:flex;gap:30px;align-items:center;justify-content:center;flex:1}
.nav button{border:0;background:none;color:#fff;font-weight:700;font-size:14px;padding:20px 0;opacity:.92}.nav button.active{border-bottom:3px solid #fff}
.lang{display:flex;border:1px solid #ffffff44;border-radius:22px;overflow:hidden}.lang button{border:0;background:transparent;color:#fff;padding:8px 13px;font-weight:700}.lang button.active{background:#ffffff1b}
.hero{min-height:355px;background:
radial-gradient(circle at 72% 20%,#3b83bd55,transparent 25%),
linear-gradient(105deg,#062451 0%,#0b3e73 55%,#07264c 100%);
color:#fff;position:relative;overflow:hidden}
.hero:after{content:"";position:absolute;inset:0;background:
linear-gradient(160deg,transparent 58%,#031b36aa 59%,transparent 60%),
linear-gradient(18deg,transparent 62%,#ffffff12 63%,transparent 64%);pointer-events:none}
.heroIn{max-width:1250px;margin:auto;min-height:355px;padding:48px 38px;display:grid;grid-template-columns:1fr 1.15fr;align-items:center;position:relative;z-index:2}
.kicker{display:inline-block;border:1px solid #ffd43b;border-radius:18px;padding:7px 13px;font-size:12px;font-weight:800;margin-bottom:12px;background:#061c3eaa}
.hero h1{font-size:42px;line-height:1.02;margin:0 0 10px;font-weight:900}.hero h1 span{color:var(--yellow);display:block}.hero p{font-size:15px;max-width:540px;color:#e8f2ff;margin:8px 0 20px}
.heroStats{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}.pill{background:#0b417866;border:1px solid #ffffff22;border-radius:14px;padding:9px 12px;font-size:12px}
.heroBtns{display:flex;gap:12px}.btn{border:0;border-radius:10px;padding:12px 22px;font-weight:800;transition:.15s}.btn:hover{transform:translateY(-1px)}.primary{background:var(--yellow);color:#13243c}.outline{background:transparent;color:#fff;border:1px solid #fff}.blue{background:var(--blue);color:#fff}.light{background:#fff;color:#17345b}
.heroArt{height:290px;position:relative}.sun{position:absolute;width:260px;height:180px;border-radius:50%;background:radial-gradient(circle,#ffdca0aa,transparent 68%);top:25px;right:80px}
.mountain{position:absolute;left:25px;right:0;bottom:0;height:225px;background:linear-gradient(145deg,#173e63,#071d39);clip-path:polygon(0 100%,22% 52%,34% 68%,55% 15%,70% 60%,85% 35%,100% 100%)}
.climber{position:absolute;right:180px;top:28px;font-size:82px;filter:drop-shadow(0 5px 4px #0008);transform:rotate(-4deg)}
.flag{position:absolute;right:130px;top:12px;font-size:55px}.emblem{position:absolute;right:15px;top:45px;font-size:70px;filter:grayscale(1) brightness(3);opacity:.9}
.section{max-width:1250px;margin:auto;padding:34px 30px}.stats{background:#edf7ff;padding:20px 0}.statsGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.stat{background:#fff;border-radius:14px;padding:18px;text-align:center;box-shadow:0 7px 20px #0c3d7012}.stat b{display:block;font-size:25px;color:#17629c}.stat span{font-size:12px;color:#475569}
.section h2{font-size:25px;margin:8px 0 20px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{background:#fff;border:1px solid var(--line);border-radius:15px;padding:20px;box-shadow:0 7px 22px #0c3d7010}.batch h3{margin:0 0 8px}.batch p{color:var(--muted);font-size:13px;min-height:38px}.batch .btn{margin-top:8px}
.footer{background:#031d42;color:#fff;padding:24px 35px;margin-top:20px}.footerIn{max-width:1250px;margin:auto;display:flex;justify-content:space-between;gap:20px;align-items:center}.footer small{color:#c8d8ed}
.formCard{max-width:900px;margin:25px auto}.formRow{display:grid;grid-template-columns:1fr 1fr;gap:15px}.input{width:100%;padding:13px 14px;border:1px solid var(--line);border-radius:10px;outline:none}.input:focus{border-color:#4194ec;box-shadow:0 0 0 3px #4194ec22}.label{font-size:13px;font-weight:800;margin-bottom:7px;display:block}
.testHead{background:#06234b;color:#fff;border-radius:15px 15px 0 0;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}.timer{font-weight:900}.progress{height:7px;background:#dce9f7;border-radius:8px;overflow:hidden}.progress i{display:block;height:100%;background:linear-gradient(90deg,#18a7eb,#245de9)}
.qbox{padding:24px}.qno{font-size:13px;color:#17629c;font-weight:800}.question{font-size:19px;font-weight:800;line-height:1.55;margin:10px 0 20px}.en{color:#64748b;font-weight:600;font-size:15px;margin-top:8px}.options{display:grid;gap:11px}.option{border:1px solid var(--line);background:#fff;border-radius:10px;padding:13px;text-align:left}.option.selected{border-color:#2d83e8;background:#edf6ff}.option.correct{border-color:#16b77e;background:#e9fbf4}.option.wrong{border-color:#ef626c;background:#fff0f1}.testFoot{display:flex;justify-content:space-between;padding:18px 24px;border-top:1px solid var(--line)}
.resultTop{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.metric{background:#fff;border-radius:12px;padding:15px;text-align:center;border:1px solid var(--line)}.metric b{display:block;font-size:24px}.review{margin-top:22px}.reviewItem{border:1px solid var(--line);border-radius:12px;padding:16px;margin:12px 0;background:#fff}.tag{display:inline-block;border-radius:15px;padding:4px 9px;font-size:11px;font-weight:800}.ok{background:#d9faec;color:#08734e}.bad{background:#ffe0e3;color:#9f2431}.solution{background:#f1f7ff;padding:12px;border-radius:9px;margin-top:10px;font-size:13px;line-height:1.6}
.podium{display:grid;grid-template-columns:1fr 1.15fr 1fr;align-items:end;gap:12px;margin:20px 0}.pod{border-radius:14px;padding:22px 10px;text-align:center}.p1{background:#fff1b8;min-height:160px}.p2{background:#e6eef8;min-height:125px}.p3{background:#ffe8dc;min-height:110px}.rankTable{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden}.rankTable th,.rankTable td{padding:12px;border-bottom:1px solid var(--line);text-align:left;font-size:13px}
@media(max-width:800px){
 .top{height:58px;padding:0 12px;gap:8px}.logo{min-width:auto;font-size:17px}.logoMark{width:32px;height:32px}.nav{gap:12px}.nav button{font-size:10px;padding:19px 0}.lang{display:none}
 .heroIn{grid-template-columns:1fr;padding:30px 22px;min-height:470px}.hero h1{font-size:36px}.heroArt{height:155px}.climber{font-size:55px;right:100px}.flag{font-size:38px;right:60px}.emblem{font-size:48px;right:0}.mountain{height:125px}
 .statsGrid{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr 1fr}.section{padding:25px 18px}.formRow{grid-template-columns:1fr}.resultTop{grid-template-columns:repeat(2,1fr)}.podium{grid-template-columns:1fr 1.1fr 1fr}.rankTable{font-size:11px}.rankTable th,.rankTable td{padding:8px}
}
@media(max-width:520px){.nav button:nth-child(4){display:none}.grid{grid-template-columns:1fr}.heroBtns{flex-wrap:wrap}.heroStats{display:none}.footerIn{flex-direction:column;text-align:center}.question{font-size:17px}}
</style>
</head>
<body>
<header class="top">
  <div class="logo"><div class="logoMark">📖</div><div>LoyalLearn<small style="display:block;font-size:8px;font-weight:600;opacity:.8">Learn • Practice • Achieve</small></div></div>
  <nav class="nav">
    <button id="navHome" onclick="home()">Home</button>
    <button id="navStart" onclick="startPage()">Start Test</button>
    <button id="navRank" onclick="rankPage()">Rank Dashboard</button>
    <button onclick="aboutPage()">About</button>
  </nav>
  <div class="lang"><button class="active" onclick="setLang('hi')">हिंदी</button><button onclick="setLang('en')">English</button></div>
</header>
<main id="app"></main>
<footer class="footer"><div class="footerIn"><div><b style="font-size:18px">📖 LoyalLearn</b><br><small>Learn • Practice • Achieve</small></div><small>Topic-wise Questions &nbsp; • &nbsp; Instant Solutions &nbsp; • &nbsp; Live Leaderboard &nbsp; • &nbsp; Bilingual Support</small><small>UPSC is not just an exam,<br>it's a dream!</small></div></footer>

<script>
let D={batches:[]}, currentBatch=null, currentQuestions=[], currentIndex=0, answers=[], studentName="Student", seconds=0, timer=null, language="both", lastResult=null;

function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function fmt(s){s=Math.max(0,Number(s)||0);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");}
function normalizeBatch(b){
  const qs=Array.isArray(b?.questions)?b.questions:[];
  return qs.map(q=>({
    question:q.question||q.text||q.q||"",
    question_hi:q.question_hi||q.hindi||q.hi||q.questionHindi||"",
    question_en:q.question_en||q.english||q.en||q.questionEnglish||q.q||"",
    options:Array.isArray(q.options)?q.options:
      (Array.isArray(q.choices)?q.choices:
      (Array.isArray(q.o)?q.o:
      [q.option1,q.option2,q.option3,q.option4].filter(x=>x!==undefined))),
    answer:q.answer??q.correct??q.correctAnswer??q.correct_option??q.a??0,
    explanation:q.explanation||q.solution||q.e||"",
    explanation_hi:q.explanation_hi||q.solution_hi||q.explanationHindi||q.eh||"",
    explanation_en:q.explanation_en||q.solution_en||q.explanationEnglish||q.e||""
  }));
}
function qText(q){
  const hi=q.question_hi||q.question, en=q.question_en;
  if(language==="hi") return esc(hi||en);
  if(language==="en") return esc(en||hi);
  return '<div>'+esc(hi||en)+'</div>'+(en&&hi&&en!==hi?'<div class="en">'+esc(en)+'</div>':"");
}
function answerIndex(a, options){
  if(typeof a==="number") return a;
  const s=String(a??"").trim();
  const n=parseInt(s,10);
  if(!Number.isNaN(n) && n>=0 && n<options.length) return n;
  const letter=s.toUpperCase();
  const letters=["A","B","C","D","E","F"];
  if(letters.includes(letter)) return letters.indexOf(letter);
  const idx=options.findIndex(x=>String(x).trim()===s);
  return idx>=0?idx:0;
}
function setActive(id){document.querySelectorAll(".nav button").forEach(x=>x.classList.remove("active"));const e=document.getElementById(id);if(e)e.classList.add("active");}
async function boot(){
  try{
    const r=await fetch("/api/data"); if(!r.ok) throw Error("Data loading failed");
    D=await r.json(); if(Array.isArray(D)) D={batches:D}; if(!D||!Array.isArray(D.batches)) D={batches:[]};
    home();
  }catch(e){document.getElementById("app").innerHTML='<section class="section"><div class="card"><h2>Website loading error</h2><p>'+esc(e.message)+'</p></div></section>';}
}
function home(){
  setActive("navHome");
  const batches=D.batches||[];
  document.getElementById("app").innerHTML=
  '<section class="hero"><div class="heroIn"><div>'+
  '<span class="kicker">🏛️ UPSC PRACTICE PORTAL</span>'+
  '<h1>Your Dream<br><span>Our Mission</span></h1>'+
  '<p>Practice • Improve • Crack UPSC</p>'+
  '<p>Topic-wise practice, instant solutions and a public rank dashboard.</p>'+
  '<div class="heroStats"><span class="pill">🎓 10 Demo Questions</span><span class="pill">📚 9+ Subjects</span><span class="pill">🌐 Bilingual Hindi & English</span><span class="pill">🛡️ 100% Solution Review</span></div>'+
  '<div class="heroBtns"><button class="btn primary" onclick="startPage()">▶ Start Test</button><button class="btn outline" onclick="rankPage()">🏆 View Rank</button></div>'+
  '</div><div class="heroArt"><div class="sun"></div><div class="climber">🧗</div><div class="flag">⚑</div><div class="emblem">☸</div><div class="mountain"></div></div></div></section>'+
  '<section class="stats"><div class="section"><div class="statsGrid"><div class="stat"><b>'+batches.length+'</b><span>Active Batches</span></div><div class="stat"><b>1000+</b><span>Practice Questions</span></div><div class="stat"><b>24×7</b><span>Practice</span></div><div class="stat"><b>FREE</b><span>For Students</span></div></div></div></section>'+
  '<section class="section"><h2>📚 Available Batches</h2><div class="grid">'+
  (batches.length?batches.map((b,i)=>'<div class="card batch"><h3>'+esc(b.name||b.title||"UPSC Batch")+'</h3><p>'+esc(b.description||"Topic-wise bilingual practice")+'</p><button class="btn primary" onclick="begin('+i+')">Start Batch</button></div>').join(""):'<div class="card"><h3>No batch found</h3><p>Add questions to batches.json.</p></div>')+
  '</div></section>';
}
function startPage(){
  setActive("navStart");
  const batches=D.batches||[];
  document.getElementById("app").innerHTML='<section class="section"><div class="card formCard"><h2>🎯 Start Test</h2><p style="color:#64748b">Enter your name to begin the test</p><div class="formRow"><div><label class="label">👤 Your Name</label><input id="studentName" class="input" placeholder="Enter your name"></div><div><label class="label">Select Language / भाषा चुनें</label><select id="languageSelect" class="input"><option value="both">Bilingual — हिंदी + English</option><option value="en">English</option><option value="hi">हिंदी</option></select></div></div><h3 style="margin-top:25px">Select Batch</h3><div class="grid">'+batches.map((b,i)=>'<button class="card batch" style="text-align:left" onclick="begin('+i+')"><h3>'+esc(b.name||b.title||"UPSC Batch")+'</h3><p>'+esc(b.description||"Practice test")+'</p></button>').join("")+'</div></div></section>';
}
function begin(i){
  const nameEl=document.getElementById("studentName"); if(nameEl) studentName=cleanClient(nameEl.value);
  const langEl=document.getElementById("languageSelect"); if(langEl) language=langEl.value;
  currentBatch=D.batches[i]; currentQuestions=normalizeBatch(currentBatch);
  if(!currentQuestions.length){alert("इस batch में questions नहीं मिले।");return;}
  currentIndex=0;answers=new Array(currentQuestions.length).fill(null);seconds=0;clearInterval(timer);
  timer=setInterval(()=>{seconds++;const e=document.getElementById("timer");if(e)e.textContent=fmt(seconds);},1000);
  renderQ();
}
function cleanClient(v){return String(v||"Student").trim().replace(/\s+/g," ").slice(0,40)||"Student";}
function renderQ(){
  const q=currentQuestions[currentIndex], total=currentQuestions.length, selected=answers[currentIndex], pct=Math.round(((currentIndex+1)/total)*100);
  const optionHtml=q.options.length?q.options.map((o,j)=>'<button type="button" class="option '+(selected===j?'selected':'')+'" onclick="pick('+j+')"><b>'+String.fromCharCode(65+j)+'.</b> '+esc(o)+'</button>').join(""):'<div class="card" style="padding:12px;color:#b42318">Options not found in this question.</div>';
  document.getElementById("app").innerHTML='<section class="section"><div class="card" style="padding:0;overflow:hidden"><div class="testHead"><b>🟢 Test in Progress</b><b>⏱️ <span id="timer">'+fmt(seconds)+'</span></b></div><div style="padding:14px 22px"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800"><span>Question '+(currentIndex+1)+' of '+total+'</span><span>'+pct+'%</span></div><div class="progress"><i style="width:'+pct+'%"></i></div></div><div class="qbox"><div class="qno">Q'+(currentIndex+1)+'.</div><div class="question">'+qText(q)+'</div><div class="options">'+optionHtml+'</div></div><div class="testFoot"><button class="btn light" onclick="prevQ()">← Previous</button><button class="btn blue" onclick="'+(currentIndex===total-1?'finish()':'nextQ()')+'">'+(currentIndex===total-1?'Submit Test':'Next →')+'</button></div></div></section>';
  speakQuestion(q);
}
function speakText(text){try{if(!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text||''));u.lang=language==='hi'?'hi-IN':'en-IN';u.rate=.95;window.speechSynthesis.speak(u);}catch(e){}}
function speakQuestion(q){const hi=q.question_hi||q.question, en=q.question_en||q.question; if(language==='both'&&hi&&en&&hi!==en)speakText(hi+' . '+en);else speakText(language==='hi'?hi:en);}

function pick(i){answers[currentIndex]=i;renderQ();const q=currentQuestions[currentIndex];speakText(q.options[i]||"");}
function prevQ(){if(currentIndex>0){currentIndex--;renderQ();}}
function nextQ(){if(currentIndex<currentQuestions.length-1){currentIndex++;renderQ();}}
async function finish(){
  clearInterval(timer);
  let correct=0; currentQuestions.forEach((q,i)=>{if(answers[i]===answerIndex(q.answer,q.options))correct++;});
  const total=currentQuestions.length, wrong=total-correct, accuracy=total?Math.round(correct*100/total):0;
  lastResult={name:studentName,batch:currentBatch.name||currentBatch.title||"UPSC Practice",score:correct,total,correct,wrong,accuracy,time:seconds,answers:answers.slice(),questions:currentQuestions};
  try{await fetch("/api/result",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(lastResult)});}catch(e){}
  resultPage();
}
function resultPage(){
  const r=lastResult;if(!r){home();return;}
  document.getElementById("app").innerHTML='<section class="section"><h2>🏆 Test Completed!</h2><p style="color:#64748b">Here is your performance summary</p><div class="resultTop"><div class="metric"><b>'+r.total+'</b><span>Total Questions</span></div><div class="metric"><b style="color:#13a978">'+r.correct+'</b><span>Correct</span></div><div class="metric"><b style="color:#df4b57">'+r.wrong+'</b><span>Wrong</span></div><div class="metric"><b style="color:#225fd1">'+r.accuracy+'%</b><span>Accuracy</span></div><div class="metric"><b>'+fmt(r.time)+'</b><span>Time Taken</span></div></div><div class="review"><h3>Question Review</h3>'+
  r.questions.map((q,i)=>{const ci=answerIndex(q.answer,q.options),ua=r.answers[i];return '<div class="reviewItem"><span class="tag '+(ua===ci?'ok':'bad')+'">'+(ua===ci?'Correct':'Wrong')+'</span><h4>Q'+(i+1)+'. '+qText(q)+'</h4><p><b>Your Answer:</b> '+esc(ua==null?"Not Answered":(q.options[ua]??"Not Answered"))+'</p><p><b>Correct Answer:</b> '+esc(q.options[ci]??"")+'</p><div class="solution"><b>Solution:</b><br>'+esc(language==="hi"?(q.explanation_hi||q.explanation_en||q.explanation):(language==="en"?(q.explanation_en||q.explanation_hi||q.explanation):(q.explanation_hi||q.explanation_en||q.explanation)))+'</div></div>';}).join("")+
  '</div><div class="heroBtns"><button class="btn light" onclick="home()">← Back to Home</button><button class="btn blue" onclick="startPage()">Retake Test ⟳</button></div></section>';
}
async function rankPage(){
  setActive("navRank");
  let rows=[];try{const r=await fetch("/api/rank");rows=await r.json();}catch(e){}
  const top=[rows[1],rows[0],rows[2]].filter(Boolean);
  document.getElementById("app").innerHTML='<section class="section"><h2>🏆 Rank Dashboard</h2><p style="color:#64748b">See how you rank among all learners</p><div class="podium">'+
  (top[0]?'<div class="pod p2"><div style="font-size:30px">🥈</div><b>'+esc(top[0].name)+'</b><br><small>Score: '+top[0].bestScore+' | Accuracy: '+top[0].accuracy+'%</small></div>':'<div></div>')+
  (top[1]?'<div class="pod p1"><div style="font-size:38px">👑</div><b>'+esc(top[1].name)+'</b><br><small>Score: '+top[1].bestScore+' | Accuracy: '+top[1].accuracy+'%</small></div>':'<div></div>')+
  (top[2]?'<div class="pod p3"><div style="font-size:30px">🥉</div><b>'+esc(top[2].name)+'</b><br><small>Score: '+top[2].bestScore+' | Accuracy: '+top[2].accuracy+'%</small></div>':'<div></div>')+
  '</div><div class="card"><table class="rankTable"><thead><tr><th>Rank</th><th>Name</th><th>Total Tests</th><th>Best Score</th><th>Accuracy</th></tr></thead><tbody>'+
  (rows.length?rows.map((x,i)=>'<tr><td>#'+(i+1)+'</td><td><b>'+esc(x.name)+'</b></td><td>'+x.totalTests+'</td><td>'+x.bestScore+'</td><td>'+x.accuracy+'%</td></tr>').join(""):'<tr><td colspan="5">No results yet — take the first test!</td></tr>')+
  '</tbody></table></div></section>';
}
function aboutPage(){
  document.getElementById("app").innerHTML='<section class="section"><div class="card formCard"><h2>📖 About LoyalLearn</h2><p>LoyalLearn is a UPSC practice portal for topic-wise practice, bilingual learning, instant solutions and a public leaderboard.</p><p><b>Learn • Practice • Achieve</b></p></div></section>';
}
function setLang(x){language=x;document.querySelectorAll(".lang button").forEach(b=>b.classList.remove("active"));document.querySelectorAll(".lang button").forEach(b=>{if((x==="hi"&&b.textContent.includes("हिंदी"))||(x==="en"&&b.textContent.includes("English")))b.classList.add("active");});}
boot();
</script>
</body>
</html>`;

app.get("/", (req,res)=>res.type("html").send(HTML));
app.listen(PORT,"0.0.0.0",()=>console.log("LoyalLearn running on port "+PORT));
