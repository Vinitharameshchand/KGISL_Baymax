// ── Navbar scroll
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 24));

// ── Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');
hamburger.addEventListener('click', () => navMobile.classList.toggle('open'));
navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMobile.classList.remove('open')));

// ── Scroll-triggered fade in
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = `${(Array.from(e.target.parentNode.children).indexOf(e.target) % 5) * 70}ms`;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.prob-card, .feat-card, .tech-card, .impact-card, .arch-item, .tl-item, .sol-list li, .stat-item'
).forEach(el => {
  el.classList.add('fade');
  io.observe(el);
});

// ── Adherence bar animation
const adhFill = document.getElementById('adhFill');
if (adhFill) {
  const bar = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      adhFill.style.width = '85%';
      bar.disconnect();
    }
  }, { threshold: 0.5 });
  bar.observe(adhFill);
}

// ── Active nav link highlight
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.style.color = (a.getAttribute('href') === `#${cur}`) ? 'var(--blue)' : '';
  });
}, { passive: true });

// ── Update footer year
const fp = document.querySelector('.footer-bottom p');
if (fp) fp.innerHTML = fp.innerHTML.replace('2025', new Date().getFullYear());
