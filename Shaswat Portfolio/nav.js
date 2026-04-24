// Shared navigation injector
(function() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const pages = [
    { href: 'index.html',      label: 'Home' },
    { href: 'about.html',      label: 'About' },
    { href: 'experience.html', label: 'Experience' },
    { href: 'projects.html',   label: 'Research' },
    { href: 'skills.html',     label: 'Skills' },
    { href: 'contact.html',    label: 'Contact' },
  ];

  const links = pages.map(p =>
    `<a href="${p.href}" class="nav-link${currentPage === p.href ? ' active' : ''}">${p.label}</a>`
  ).join('');

  const mobileLinks = pages.map(p =>
    `<a href="${p.href}" class="nav-link block py-2${currentPage === p.href ? ' active' : ''}" onclick="closeMenu()">${p.label}</a>`
  ).join('');

  const html = `
  <nav class="nav-blur fixed top-0 left-0 right-0 z-50">
    <div style="max-width:1200px;margin:0 auto;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;height:64px;">
      <a href="index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
        <div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;font-family:'Space Mono',monospace;color:#7b39fc;background:rgba(123,57,252,0.12);border:1px solid rgba(123,57,252,0.3);">SG</div>
        <span style="font-weight:600;font-size:0.9rem;color:#f1f5f9;">Shaswat Garg</span>
      </a>
      <div class="hidden md:flex" style="gap:2rem;display:flex;">${links}</div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <a href="contact.html" class="glass-btn glass-btn-primary" style="height:36px;padding:0 16px;font-size:0.8rem;" class="hidden md:inline-flex">Contact</a>
        <button id="hamburger" onclick="toggleMenu()" style="padding:8px;border-radius:8px;background:transparent;border:none;color:#94a3b8;cursor:pointer;display:none;" class="hamburger-btn">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </div>
    <div id="nav-mobile" style="padding:0 1.5rem 1rem;">${mobileLinks}</div>
  </nav>`;

  document.getElementById('nav-placeholder').innerHTML = html;

  // Responsive hamburger
  function checkWidth() {
    const hb = document.getElementById('hamburger');
    const desktopNav = document.querySelector('.hidden.md\\:flex');
    if (hb && window.innerWidth < 768) {
      hb.style.display = 'block';
      if (desktopNav) desktopNav.style.display = 'none';
    } else if (hb) {
      hb.style.display = 'none';
      if (desktopNav) desktopNav.style.display = 'flex';
      document.getElementById('nav-mobile').classList.remove('open');
    }
  }
  window.addEventListener('resize', checkWidth);
  checkWidth();
})();

function toggleMenu() {
  document.getElementById('nav-mobile').classList.toggle('open');
}
function closeMenu() {
  document.getElementById('nav-mobile').classList.remove('open');
}

// Shared scroll reveal
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// Shared skill bars
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.getAttribute('data-width') + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  fills.forEach(f => obs.observe(f));
}

// Shared active nav highlight on scroll
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initSkillBars();
  initNavHighlight();
});
