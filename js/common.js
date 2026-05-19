const SECTION_IDS = ['prime-numbers', 'password-generator', 'fingerprint'];
const PASSWORD_SECTION_ID = 'password-generator';

let slideTransitionReady = false;
let slideArmToken = 0;

function randomUint32() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0];
}

function randomIntBelow(max) {
  if (max <= 0) {
    return 0;
  }
  const limit = 0x100000000 - (0x100000000 % max);
  let x;
  do {
    x = randomUint32();
  } while (x >= limit);
  return x % max;
}

function escapeHtml(text) {
  const s = text == null ? '' : String(text);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getSectionIndexFromHash() {
  const raw = (typeof location !== 'undefined' && location.hash) || '';
  let id = raw.replace(/^#/, '');
  id = id.split('?')[0];
  const idx = SECTION_IDS.indexOf(id);
  return idx >= 0 ? idx : 0;
}

function setActiveNav(index) {
  const links = document.querySelectorAll('nav .navigation a');
  links.forEach((a, i) => {
    if (i === index) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

function syncUrlToSection(slug) {
  if (typeof location === 'undefined') {
    return;
  }
  const want = `#${slug}`;
  if (location.hash === want) {
    return;
  }
  const u = new URL(location.href);
  u.hash = slug;
  if (typeof history !== 'undefined' && history.replaceState) {
    history.replaceState(null, '', u.href);
    return;
  }
  location.hash = slug;
}

function syncSlideMetrics() {
  const viewport = document.querySelector('.sections');
  const track = document.querySelector('.sections-track');
  let w = viewport.clientWidth || viewport.offsetWidth;
  if (w <= 0) {
    w = 320;
  }
  const sections = track.querySelectorAll(':scope > section');
  sections.forEach((section) => {
    section.style.flex = `0 0 ${w}px`;
    section.style.width = `${w}px`;
    section.style.minWidth = `${w}px`;
    section.style.maxWidth = `${w}px`;
  });
  return w;
}

function showSection(index) {
  const track = document.querySelector('.sections-track');
  const i = Math.max(0, Math.min(SECTION_IDS.length - 1, index));
  const w = syncSlideMetrics();

  if (!slideTransitionReady) {
    track.classList.add('sections-track--no-transition');
  }
  track.style.transform = `translateX(-${i * w}px)`;
  setActiveNav(i);
  const id = SECTION_IDS[i];
  syncUrlToSection(id);
  if (id === PASSWORD_SECTION_ID && typeof scheduleRenderPasswordsOnTab === 'function') {
    scheduleRenderPasswordsOnTab();
  }

  if (!slideTransitionReady) {
    const token = (slideArmToken += 1);
    track.getBoundingClientRect();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (token !== slideArmToken) {
          return;
        }
        track.classList.remove('sections-track--no-transition');
        slideTransitionReady = true;
      });
    });
  }
}

function initNavigation() {
  const links = document.querySelectorAll('nav .navigation a');
  links.forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rawIndex = anchor.getAttribute('data-section-index');
      let index = rawIndex == null || rawIndex === '' ? -1 : Number(rawIndex);
      if (!Number.isFinite(index) || index < 0) {
        const href = anchor.getAttribute('href') || '';
        const fragment = href.replace(/^#/, '');
        index = SECTION_IDS.indexOf(fragment);
      }
      if (index >= 0 && index < SECTION_IDS.length) {
        showSection(index);
      }
    });
  });
  window.addEventListener('hashchange', () => {
    showSection(getSectionIndexFromHash());
  });
  window.addEventListener('resize', () => {
    showSection(getSectionIndexFromHash());
  });
  requestAnimationFrame(() => {
    showSection(getSectionIndexFromHash());
  });
}

function initCopyOnClick() {
  const root = document.querySelector('.container');
  if (!root) {
    return;
  }
  root.addEventListener('click', (event) => {
    const el = event.target.closest('.copyable-value');
    if (!el || !root.contains(el)) {
      return;
    }
    const text = el.textContent.trim();
    if (!text) {
      return;
    }
    navigator.clipboard.writeText(text);
  });
}
