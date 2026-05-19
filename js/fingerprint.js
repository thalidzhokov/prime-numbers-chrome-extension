let fpAgentPromise = null;

const CANVAS_IMAGE_KEYS = ['geometry', 'text'];

function getFingerprintJS() {
  return FingerprintJS.default || FingerprintJS;
}

function loadFingerprintAgent() {
  if (!fpAgentPromise) {
    fpAgentPromise = getFingerprintJS().load({ monitoring: false });
  }
  return fpAgentPromise;
}

function fingerprintJsonReplacer(_key, value) {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function formatFingerprintPayload(result) {
  const payload = {
    visitorId: result.visitorId,
    version: result.version,
    confidence: result.confidence,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    components: result.components,
  };
  return JSON.stringify(payload, fingerprintJsonReplacer, 2);
}

function isCanvasDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image/');
}

function normalizeCanvasImageEntries(raw, baseLabel) {
  if (raw == null) {
    return [];
  }
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((value, index) => ({
    label: list.length > 1 ? `${baseLabel} ${index + 1}` : baseLabel,
    value,
  }));
}

function collectCanvasImages(canvas) {
  const items = [];
  for (const key of CANVAS_IMAGE_KEYS) {
    items.push(...normalizeCanvasImageEntries(canvas[key], key));
  }
  return items;
}

function appendCanvasImageEntry(block, label, value) {
  if (isCanvasDataUrl(value)) {
    const figure = document.createElement('figure');
    figure.className = 'fingerprint-canvas-figure';

    const caption = document.createElement('figcaption');
    caption.textContent = label;
    figure.appendChild(caption);

    const img = document.createElement('img');
    img.className = 'fingerprint-canvas-img';
    img.src = value;
    img.alt = `Canvas ${label}`;
    figure.appendChild(img);

    block.appendChild(figure);
    return;
  }

  if (typeof value === 'string' && value.length > 0) {
    const note = document.createElement('p');
    note.className = 'fingerprint-canvas-note';
    note.textContent = `${label}: ${value}`;
    block.appendChild(note);
  }
}

function renderFingerprintCanvasImages(root, result) {
  const canvas = result.components?.canvas?.value;
  if (!canvas) {
    return;
  }

  const entries = collectCanvasImages(canvas);
  if (!entries.length) {
    return;
  }

  const block = document.createElement('div');
  block.className = 'fingerprint-canvas-images';
  for (const { label, value } of entries) {
    appendCanvasImageEntry(block, label, value);
  }

  if (block.childElementCount > 0) {
    root.appendChild(block);
  }
}

function renderFingerprintLoading(root) {
  root.innerHTML = '';
  const el = document.createElement('p');
  el.className = 'fingerprint-loading';
  el.textContent = 'Вычисление отпечатка…';
  root.appendChild(el);
}

function renderFingerprintError(root, message) {
  root.innerHTML = '';
  const el = document.createElement('p');
  el.className = 'fingerprint-error';
  el.textContent = message;
  root.appendChild(el);
}

function getFingerprintByteSize(text) {
  return new TextEncoder().encode(text).length;
}

function formatFingerprintSizeLabel(byteSize) {
  const kb = byteSize / 1024;
  if (byteSize === 0) {
    return '0 КБ';
  }
  if (kb < 1) {
    return `${kb.toFixed(2)} КБ`;
  }
  if (kb < 100) {
    return `${kb.toFixed(1)} КБ`;
  }
  return `${Math.round(kb)} КБ`;
}

function renderFingerprintResult(root, result) {
  const text = formatFingerprintPayload(result);
  const sizeLabel = formatFingerprintSizeLabel(getFingerprintByteSize(text));
  root.innerHTML = '';

  const block = document.createElement('div');
  block.className = 'fingerprint-payload-block';

  const pre = document.createElement('pre');
  pre.className = 'fingerprint-payload fingerprint-payload--collapsed copyable-value';
  pre.textContent = text;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'fingerprint-payload-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', `Развернуть, ${sizeLabel}`);

  const toggleInner = document.createElement('span');
  toggleInner.className = 'fingerprint-payload-toggle-inner';

  const icon = document.createElement('span');
  icon.className = 'fingerprint-payload-toggle-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '⊕';

  const size = document.createElement('span');
  size.className = 'fingerprint-payload-toggle-size';
  size.textContent = sizeLabel;

  toggleInner.appendChild(icon);
  toggleInner.appendChild(size);
  toggle.appendChild(toggleInner);

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const expanded = pre.classList.toggle('fingerprint-payload--expanded');
    pre.classList.toggle('fingerprint-payload--collapsed', !expanded);
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    toggle.setAttribute('aria-label', expanded ? `Свернуть, ${sizeLabel}` : `Развернуть, ${sizeLabel}`);
    icon.textContent = expanded ? '⊖' : '⊕';
  });

  block.appendChild(pre);
  block.appendChild(toggle);
  root.appendChild(block);

  renderFingerprintCanvasImages(root, result);
}

function renderFingerprint() {
  const root = document.getElementById('fingerprint-results');
  if (!root) {
    return;
  }

  renderFingerprintLoading(root);

  loadFingerprintAgent()
    .then((agent) => agent.get())
    .then((result) => {
      renderFingerprintResult(root, result);
    })
    .catch(() => {
      renderFingerprintError(root, 'Не удалось получить отпечаток.');
    });
}

renderFingerprint();
