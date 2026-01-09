// ------- Helpers -------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

// ------- Mobile nav -------
const navToggle = $("#navToggle");
const navList = $("#navList");
if (navToggle && navList) {
  navToggle.addEventListener("click", () => {
    const open = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close when click a link
  $$(".nav__link", navList).forEach(a => {
    a.addEventListener("click", () => {
      navList.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    const inside = navList.contains(e.target) || navToggle.contains(e.target);
    if (!inside && navList.classList.contains("open")) {
      navList.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// ------- Theme toggle (saved to localStorage) -------
const themeToggle = $("#themeToggle");
const root = document.documentElement;

function setTheme(theme){
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const icon = themeToggle?.querySelector(".icon");
  if (icon) icon.textContent = theme === "light" ? "☀" : "☾";
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
else setTheme("dark");

themeToggle?.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});

// ------- Typing effect -------
const typingEl = $("#typing");
const roles = [
  "PHP / Laravel Developer",
  "Backend Engineer",
  "REST API Integrator",
  "AWS EC2 Deployer"
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop(){
  if (!typingEl) return;

  const current = roles[roleIndex];
  const speed = deleting ? 34 : 58;

  if (!deleting) {
    charIndex++;
    typingEl.textContent = current.slice(0, charIndex);
    if (charIndex >= current.length) {
      deleting = true;
      setTimeout(typeLoop, 900);
      return;
    }
  } else {
    charIndex--;
    typingEl.textContent = current.slice(0, charIndex);
    if (charIndex <= 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(typeLoop, speed);
}
typeLoop();

// ------- Reveal on scroll (IntersectionObserver) -------
const reveals = $$(".reveal");
reveals.forEach(el => {
  const d = el.getAttribute("data-delay");
  if (d) el.style.setProperty("--d", `${d}ms`);
});

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.12 });

reveals.forEach(el => io.observe(el));

// ------- Active nav link while scrolling -------
const sections = ["about","experience","skills","education","profiles","contact"]
  .map(id => document.getElementById(id))
  .filter(Boolean);

const navLinks = $$(".nav__link");

function setActiveLink(id){
  navLinks.forEach(a => {
    const href = a.getAttribute("href") || "";
    a.classList.toggle("active", href === `#${id}`);
  });
}

function onScroll(){
  const y = window.scrollY + 110;

  // Scroll progress bar
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const p = docH > 0 ? (window.scrollY / docH) * 100 : 0;
  const bar = $("#scrollBar");
  if (bar) bar.style.width = `${clamp(p, 0, 100)}%`;

  // Active section
  let currentId = sections[0]?.id || "";
  for (const sec of sections) {
    const top = sec.offsetTop;
    if (y >= top) currentId = sec.id;
  }
  if (currentId) setActiveLink(currentId);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ------- Counters (animate once when visible) -------
const counters = $$("[data-counter]");
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const target = Number(el.getAttribute("data-counter")) || 0;
    const start = 0;
    const duration = 900;
    const startTime = performance.now();

    function tick(now){
      const t = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(start + (target - start) * eased);
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    }

    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.4 });

counters.forEach(el => counterIO.observe(el));

// ------- Contact form: opens email client (mailto) -------
const contactForm = $("#contactForm");
contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
  const body = encodeURIComponent(
`Name: ${name}
Email: ${email}

Message:
${message}`
  );

  // Your email from resume
  const to = "tawheedyahya0@gmail.com";
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

  const hint = $("#formHint");
  if (hint) hint.textContent = "Opening your email app…";
});

// ------- Footer year -------
const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());
