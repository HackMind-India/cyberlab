const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
const resultsFile = path.join(__dirname, "results.json");

if (!fs.existsSync(resultsFile)) fs.writeFileSync(resultsFile, "[]");

const questions = [
  {id:1,subject:"History",q:"Who founded the Maurya Empire?",options:["Ashoka","Chandragupta Maurya","Bindusara","Harsha"],answer:1,explanation:"Chandragupta Maurya founded the Maurya Empire around 322 BCE with the guidance of Chanakya."},
  {id:2,subject:"Geography",q:"Which river is known as the Sorrow of Bihar?",options:["Ganga","Kosi","Yamuna","Godavari"],answer:1,explanation:"The Kosi River is traditionally called the Sorrow of Bihar because of its frequent floods and course changes."},
  {id:3,subject:"Polity",q:"How many Fundamental Rights are currently guaranteed by the Constitution of India?",options:["5","6","7","8"],answer:1,explanation:"There are six Fundamental Rights in the Indian Constitution after the Right to Property was removed from the list in 1978."},
  {id:4,subject:"Economy",q:"Which institution issues currency notes in India?",options:["SBI","RBI","SEBI","NITI Aayog"],answer:1,explanation:"The Reserve Bank of India issues most Indian currency notes. The one-rupee note is issued by the Government of India."},
  {id:5,subject:"Environment",q:"The Ramsar Convention is related to the conservation of what?",options:["Deserts","Wetlands","Mountains","Forests"],answer:1,explanation:"The Ramsar Convention is an international treaty for the conservation and wise use of wetlands."},
  {id:6,subject:"Science",q:"What is the SI unit of electric current?",options:["Volt","Ohm","Ampere","Watt"],answer:2,explanation:"The ampere (A) is the SI base unit of electric current."},
  {id:7,subject:"Current Affairs",q:"Which body conducts the Civil Services Examination in India?",options:["UPSC","SSC","NTA","IBPS"],answer:0,explanation:"The Union Public Service Commission (UPSC) conducts the Civil Services Examination."},
  {id:8,subject:"CSAT",q:"If 20% of a number is 50, what is the number?",options:["200","250","300","350"],answer:1,explanation:"20% = 0.20. Therefore, number = 50 ÷ 0.20 = 250."},
  {id:9,subject:"Art & Culture",q:"Bharatanatyam originated mainly in which Indian state?",options:["Kerala","Tamil Nadu","Odisha","Assam"],answer:1,explanation:"Bharatanatyam is a classical Indian dance form traditionally associated with Tamil Nadu."},
  {id:10,subject:"Polity",q:"Who is the constitutional head of the Union of India?",options:["Prime Minister","President","Chief Justice","Home Minister"],answer:1,explanation:"The President of India is the constitutional head of the Union, while the Council of Ministers headed by the Prime Minister exercises executive power."}
];

function readResults() {
  try { return JSON.parse(fs.readFileSync(resultsFile, "utf8")); }
  catch { return []; }
}
function writeResults(data) {
  fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
}

app.get("/api/questions", (req,res)=>res.json(questions));

app.post("/api/result", (req,res)=>{
  const {name, answers} = req.body || {};
  if (!name || !Array.isArray(answers)) return res.status(400).json({error:"Name and answers are required"});
  let correct = 0;
  const review = questions.map((item,i)=>{
    const selected = Number.isInteger(answers[i]) ? answers[i] : -1;
    const isCorrect = selected === item.answer;
    if (isCorrect) correct++;
    return {question:item.q,subject:item.subject,options:item.options,selected,correct:item.answer,explanation:item.explanation,isCorrect};
  });
  const total = questions.length;
  const score = correct;
  const accuracy = Math.round((correct/total)*100);
  const result = {name:String(name).trim().slice(0,60),score,total,accuracy,correct,wrong:total-correct,date:new Date().toISOString(),review};
  const data = readResults();
  data.push(result);
  writeResults(data);
  res.json(result);
});

app.get("/api/rank",(req,res)=>{
  const data = readResults();
  const map = {};
  for (const r of data) {
    const key = r.name.toLowerCase();
    if (!map[key]) map[key] = {name:r.name,score:0,tests:0,correct:0,total:0};
    map[key].score += r.score;
    map[key].tests++;
    map[key].correct += r.correct;
    map[key].total += r.total;
  }
  const ranks = Object.values(map).map(x=>({...x,accuracy:x.total?Math.round(x.correct/x.total*100):0}))
    .sort((a,b)=>b.score-a.score || b.accuracy-a.accuracy || b.tests-a.tests)
    .map((x,i)=>({...x,rank:i+1}));
  res.json(ranks);
});

app.get("/result",(req,res)=>res.send(resultPage()));
app.get("/rank",(req,res)=>res.send(rankPage()));
app.get("/",(req,res)=>res.send(homePage()));

function shell(title, body, script="") {
return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | LoyalLearn</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f5f8ff;color:#14213d}.nav{background:#fff;border-bottom:1px solid #e5eaf4;position:sticky;top:0;z-index:5}.navin{max-width:1100px;margin:auto;padding:16px 20px;display:flex;align-items:center;justify-content:space-between}.brand{font-size:24px;font-weight:900;color:#175cff}.brand span{color:#111}.links a{margin-left:18px;text-decoration:none;color:#34415d;font-weight:700}.wrap{max-width:1000px;margin:35px auto;padding:0 18px}.card{background:#fff;border:1px solid #e4e9f3;border-radius:22px;padding:25px;box-shadow:0 10px 30px #1d3b7a0d}.hero{padding:45px 30px;text-align:center}.hero h1{font-size:clamp(34px,7vw,62px);margin:8px 0}.muted{color:#69758c}.btn{display:inline-block;border:0;border-radius:12px;padding:13px 20px;background:#175cff;color:#fff;text-decoration:none;font-weight:800;cursor:pointer}.btn.alt{background:#edf2ff;color:#175cff}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.stat{padding:20px;border-radius:17px;background:#f4f7ff}.stat b{font-size:28px;display:block}.q{margin:20px 0}.opt{display:block;padding:14px;margin:9px 0;border:1px solid #dce3f0;border-radius:12px;cursor:pointer}.opt:hover{background:#f5f8ff}.result{border-left:5px solid #175cff;padding:15px 18px;margin:14px 0;background:#f8faff;border-radius:10px}.correct{border-color:#1c9b55}.wrong{border-color:#e14d5a}.rankrow{display:grid;grid-template-columns:60px 1fr 100px 100px;gap:10px;align-items:center;padding:15px 10px;border-bottom:1px solid #edf0f6}.podium{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}.pod{padding:25px;text-align:center;border-radius:18px;background:#eef3ff}.small{font-size:13px}.hidden{display:none}@media(max-width:600px){.links a{margin-left:8px;font-size:13px}.hero{padding:30px 18px}.rankrow{grid-template-columns:45px 1fr 70px 70px;font-size:13px}}
</style></head><body><nav class="nav"><div class="navin"><div class="brand">Loyal<span>Learn</span></div><div class="links"><a href="/">Home</a><a href="/rank">Rank Dashboard</a></div></div></nav>${body}${script}</body></html>`;
}
function homePage(){return shell("Home",`<main class="wrap"><section class="card hero"><div class="muted">LEARN • PRACTICE • ACHIEVE</div><h1>UPSC Practice Portal</h1><p class="muted">Topic-wise practice, instant solutions and a public rank dashboard.</p><p><a class="btn" href="/result">Start Test</a> <a class="btn alt" href="/rank">View Rank</a></p></section><div class="grid" style="margin-top:18px"><div class="card stat"><b>10</b><span class="muted">Demo Questions</span></div><div class="card stat"><b>9+</b><span class="muted">Subjects</span></div><div class="card stat"><b>100%</b><span class="muted">Solution Review</span></div></div></main>`)}
function resultPage(){return shell("Test",`<main class="wrap"><section id="setup" class="card"><h2>Start Your Test</h2><p class="muted">Enter your name. No password required.</p><input id="name" placeholder="Your name" style="width:100%;padding:14px;border:1px solid #dce3f0;border-radius:12px;font-size:16px"><br><br><button class="btn" onclick="start()">Start Test</button></section><section id="quiz" class="card hidden"></section><section id="final" class="card hidden"></section></main>`, `<script>
let qs=[],answers=[],pos=0,name="";
async function start(){name=document.getElementById("name").value.trim();if(!name)return alert("Please enter your name");qs=await fetch("/api/questions").then(r=>r.json());answers=Array(qs.length).fill(-1);pos=0;document.getElementById("setup").classList.add("hidden");document.getElementById("quiz").classList.remove("hidden");render();}
function render(){let q=qs[pos],html="<div class='small muted'>Question "+(pos+1)+" of "+qs.length+" • "+q.subject+"</div><h2>"+q.q+"</h2>";q.options.forEach((o,i)=>{html+="<label class='opt'><input type='radio' name='o' value='"+i+"' "+(answers[pos]===i?"checked":"")+"> "+o+"</label>"});html+="<br><button class='btn' onclick='next()'>"+(pos===qs.length-1?"Submit Test":"Next")+"</button>";document.getElementById("quiz").innerHTML=html;}
function next(){let x=document.querySelector("input[name=o]:checked");if(x)answers[pos]=Number(x.value);if(pos<qs.length-1){pos++;render()}else submit();}
async function submit(){document.getElementById("quiz").classList.add("hidden");let r=await fetch("/api/result",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,answers})}).then(x=>x.json());let html="<h2>Test Complete 🎉</h2><div class='grid'><div class='stat'><b>"+r.score+"/"+r.total+"</b>Score</div><div class='stat'><b>"+r.accuracy+"%</b>Accuracy</div><div class='stat'><b>"+r.correct+"</b>Correct</div><div class='stat'><b>"+r.wrong+"</b>Wrong</div></div><h2>Question Review</h2>";r.review.forEach((v,i)=>{html+="<div class='result "+(v.isCorrect?"correct":"wrong")+"'><b>Q"+(i+1)+". "+v.question+"</b><p>Your answer: "+(v.selected<0?"Not answered":v.options[v.selected])+"</p><p>Correct answer: <b>"+v.options[v.correct]+"</b></p><p class='muted'>Solution: "+v.explanation+"</p></div>"});html+="<a class='btn' href='/result'>Retake Test</a> <a class='btn alt' href='/rank'>Rank Dashboard</a>";let f=document.getElementById("final");f.innerHTML=html;f.classList.remove("hidden");}
</script>`)}
function rankPage(){return shell("Rank Dashboard",`<main class="wrap"><section class="card"><h1>🏆 Public Rank Dashboard</h1><p class="muted">Everyone can see the leaderboard. Scores are grouped by name.</p><div id="podium" class="podium"></div><div id="table">Loading...</div></section></main>`,`<script>
async function load(){let d=await fetch("/api/rank").then(r=>r.json());let p=document.getElementById("podium");p.innerHTML=d.slice(0,3).map((x,i)=>"<div class='pod'><b>"+["🥇","🥈","🥉"][i]+"</b><h2>"+x.name+"</h2><div>"+x.score+" points</div><div class='small'>"+x.accuracy+"% accuracy</div></div>").join("");let t=document.getElementById("table");t.innerHTML=d.length?"<div class='rankrow'><b>Rank</b><b>Name</b><b>Score</b><b>Accuracy</b></div>"+d.map(x=>"<div class='rankrow'><b>#"+x.rank+"</b><span>"+x.name+"</span><span>"+x.score+"</span><span>"+x.accuracy+"%</span></div>").join(""):"<p class='muted'>No results yet. Take the first test!</p>";}load();
</script>`)}

app.listen(PORT,HOST,()=>console.log("LoyalLearn running on http://"+HOST+":"+PORT));
