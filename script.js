// ===== EDIT with your own info =====
const CONTACT = {
  githubUser: "your-github-username",
  email: "basitolaide693@icloud.com",
};
// =====================================

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("githubLink").href = `https://github.com/${CONTACT.githubUser}`;
document.getElementById("emailLink").href = `mailto:${CONTACT.email}`;

/* ---------- Boot sequence ---------- */
(function boot() {
  const boot = document.getElementById("boot");
  const linesEl = document.getElementById("bootLines");
  if (sessionStorage.getItem("bootSeen")) {
    boot.classList.add("hidden");
    return;
  }
  const lines = [
    "> initializing session...",
    "> user: basit",
    "> role: cybersecurity :: full-stack",
    "> loading modules [networking] [security] [dev]",
    "> access granted <span class='ok'>[OK]</span>"
  ];
  const skipBtn = document.createElement("button");
  skipBtn.className = "skip-boot mono";
  skipBtn.textContent = "skip →";
  skipBtn.onclick = finish;
  document.querySelector(".boot-box").appendChild(skipBtn);

  let i = 0;
  function typeLine() {
    if (i >= lines.length) {
      setTimeout(finish, 500);
      return;
    }
    const div = document.createElement("div");
    div.className = "boot-line";
    linesEl.insertBefore(div, skipBtn);
    const text = lines[i];
    let c = 0;
    const plain = text.replace(/<[^>]+>/g, "");
    const interval = setInterval(() => {
      c++;
      div.textContent = plain.slice(0, c);
      if (c >= plain.length) {
        clearInterval(interval);
        if (text.includes("<span")) div.innerHTML = text;
        i++;
        setTimeout(typeLine, 160);
      }
    }, 18);
  }
  function finish() {
    sessionStorage.setItem("bootSeen", "1");
    boot.classList.add("hidden");
  }
  setTimeout(typeLine, 300);
  // hard fallback so it never blocks the site
  setTimeout(finish, 6000);
})();

/* ---------- Network canvas ---------- */
(function netCanvas() {
  const canvas = document.getElementById("netCanvas");
  const ctx = canvas.getContext("2d");
  let w, h, particles;
  const COUNT = window.innerWidth < 700 ? 34 : 64;
  const LINK_DIST = 140;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function init() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));
  }
  const mouse = { x: null, y: null };
  canvas.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });

  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      if (mouse.x !== null) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 120) { p.x += dx / d * 0.6; p.y += dy / d * 0.6; }
      }
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(124,92,255,${0.18 * (1 - d / LINK_DIST)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,229,199,0.85)";
      ctx.fill();
    }
    requestAnimationFrame(step);
  }
  window.addEventListener("resize", () => { resize(); init(); });
  resize(); init(); step();
})();

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* ---------- Active nav link ---------- */
const navLinks = document.querySelectorAll("nav.floating a[href^='#']");
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${entry.target.id}`));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("section[id]").forEach(s => navObserver.observe(s));

/* ---------- Live GitHub stats ---------- */
(async function ghStats() {
  if (CONTACT.githubUser === "your-github-username") return;
  try {
    const res = await fetch(`https://api.github.com/users/${CONTACT.githubUser}`);
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById("ghRepos").textContent = data.public_repos ?? "—";
    document.getElementById("ghFollowers").textContent = data.followers ?? "—";
  } catch (e) { /* fail silently, placeholders stay */ }
})();

/* ---------- Projects ---------- */
async function loadProjects() {
  const grid = document.getElementById("projGrid");
  try {
    const res = await fetch("projects.json", { cache: "no-store" });
    const projects = await res.json();
    if (!projects.length) {
      grid.innerHTML = `<div class="proj-empty">No projects yet — push your first one from the admin panel.</div>`;
      return;
    }
    grid.innerHTML = projects.map((p, i) => `
      <a class="card ${i === 0 ? 'wide' : ''}" href="${p.link || '#'}" target="${p.link ? '_blank' : '_self'}" rel="noopener">
        <div class="ptop">
          <h3>${escapeHtml(p.title)}</h3>
          ${p.link ? '<span class="plink">VIEW →</span>' : ''}
        </div>
        <p>${escapeHtml(p.description)}</p>
        <div class="tag-row">${(p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
      </a>
    `).join("");
  } catch (e) {
    grid.innerHTML = `<div class="proj-empty">Couldn't load projects.json — keep it in the same folder as index.html.</div>`;
  }
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}
loadProjects();
