/* WIRED CHAOS — Emergent Gate Logic */
const LS_KEY = "wc_esoteric_unlocked";
const COOKIE = "wc_unlock=xrp; Path=/; Max-Age=2592000; SameSite=Lax; Secure";

const canvas = document.getElementById("wc-ripples");
const ctx = canvas.getContext("2d", { alpha: true });

function size() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
}
addEventListener("resize", size, { passive: true });
size();

let t = 0;
function draw() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  // Neon ripple field
  for (let i=0;i<18;i++){
    const r = (Math.sin(t*0.004 + i)*0.5+0.5) * Math.max(w,h) * 0.7;
    ctx.beginPath();
    ctx.arc(w/2, h/2, r, 0, Math.PI*2);
    const g = ctx.createRadialGradient(w/2,h/2, r*0.65, w/2,h/2, r);
    g.addColorStop(0, "rgba(0,255,255,0.04)");
    g.addColorStop(1, "rgba(255,49,49,0.06)");
    ctx.strokeStyle = i % 3 ? "rgba(0,255,255,0.22)" : "rgba(255,49,49,0.18)";
    ctx.lineWidth = 1 * devicePixelRatio;
    ctx.fillStyle = g;
    ctx.fill(); ctx.stroke();
  }
  t++;
  requestAnimationFrame(draw);
}
draw();

// Gate logic
const form = document.getElementById("gate-form");
const answerInput = document.getElementById("answer");
const feedback = document.getElementById("feedback");

function norm(v){ return (v||"").trim().toLowerCase().replace(/[^a-z0-9]/g,""); }
function unlocked(){ return localStorage.getItem(LS_KEY) === "1"; }
function grant(){
  localStorage.setItem(LS_KEY, "1");
  document.cookie = COOKIE;
  location.href = "/esoteric.html";
}

if (unlocked()){
  // If already unlocked, skip gate.
  location.replace("/esoteric.html");
}

form?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const val = norm(answerInput.value);
  // Accept 'xrp' and 'ripple'
  if (val === "xrp" || val === "ripple"){
    feedback.textContent = "Access granted.";
    grant();
  } else {
    feedback.textContent = "Access denied. Try again.";
    feedback.style.color = "#FF3131";
    answerInput.focus();
  }
});
