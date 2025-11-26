/* WIRED CHAOS — Codex Layer */
const canvas = document.getElementById("wc-grid");
const ctx = canvas.getContext("2d");
function resize(){
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
}
addEventListener("resize", resize, { passive:true });
resize();

let tick = 0;
function grid(){
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 1 * devicePixelRatio;
  ctx.strokeStyle = "rgba(0,255,255,0.18)";
  const step = 40 * devicePixelRatio;
  for (let x=0; x<=w; x+=step){
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
  }
  for (let y=0; y<=h; y+=step){
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
  }
  // Glitch scan
  ctx.fillStyle = "rgba(255,49,49,0.07)";
  const y = (Math.sin(tick*0.03)+1)/2 * h;
  ctx.fillRect(0,y, w, 3*devicePixelRatio);
  tick++;
  requestAnimationFrame(grid);
}
grid();

// Content injection
const shell = document.getElementById("codex-content");
shell.innerHTML = `
  <h2>Frequency Layer: 33.3</h2>
  <p>Entry authenticated via <strong>XRP</strong> key.</p>

  <div class="codex-section">
    <h3>Live Signals</h3>
    <ul>
      <li>RSS → FreshRSS → Chaos Reactor (active)</li>
      <li>Prompt Drill Queue (armed)</li>
      <li>Esoteric Lattice (visible)</li>
    </ul>
  </div>

  <div class="codex-section">
    <h3>WIRED CHAOS META</h3>
    <p>Situational leadership, EI tuning, and strength-based prompts are in effect.
       Submit artifacts to extend the lattice.</p>
  </div>
`;

// Relock button clears state
document.getElementById("lock")?.addEventListener("click", ()=>{
  localStorage.removeItem("wc_esoteric_unlocked");
  document.cookie = "wc_unlock=; Path=/; Max-Age=0; SameSite=Lax; Secure";
  location.href = "/";
});
