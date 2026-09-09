from flask import Flask, request, render_template_string
import subprocess

app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cyber Lab</title>
<style>
body{
    margin:0;
    background:#050807;
    color:#00ff66;
    font-family:monospace;
}
header{
    padding:18px;
    text-align:center;
    border-bottom:1px solid #00ff66;
}
.box{padding:20px}
textarea{
    width:100%;
    height:180px;
    background:#020403;
    color:#00ff66;
    border:1px solid #00ff66;
    padding:12px;
    box-sizing:border-box;
}
button{
    margin-top:12px;
    padding:12px 25px;
    background:#00ff66;
    border:0;
    font-weight:bold;
}
pre{
    background:#020403;
    border:1px solid #174;
    padding:15px;
    min-height:100px;
    white-space:pre-wrap;
}
</style>
</head>
<body>

<header>
<h2>⚡ CYBER LAB</h2>
<div>Local Security Practice Environment</div>
</header>

<div class="box">
<textarea id="code">print("Hello Cyber Lab")</textarea>
<button onclick="runCode()">▶ RUN PYTHON</button>
<pre id="output">Output यहाँ दिखाई देगा...</pre>
</div>

<script>
async function runCode(){
    let code=document.getElementById("code").value;

    let r=await fetch("/run",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({code:code})
    });

    let data=await r.json();
    document.getElementById("output").textContent=data.output;
}
</script>

</body>
</html>
"""

@app.route("/")
def home():
    return render_template_string(HTML)

@app.route("/run", methods=["POST"])
def run():
    code = request.json.get("code","")

    try:
        result = subprocess.run(
            ["python", "-c", code],
            capture_output=True,
            text=True,
            timeout=3
        )

        output = result.stdout + result.stderr
    except Exception as e:
        output = str(e)

    return {"output": output}

app.run(host="127.0.0.1", port=5000)
