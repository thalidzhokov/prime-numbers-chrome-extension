const PASSWORD_ROWS = 13;
const PASSWORD_SPECIAL = '!#$%&()*+,-./:;<=>?@[]^{|}~';

let passwordRegenScheduled = false;

function buildCharset() {
  let pool = 'abcdefghijklmnopqrstuvwxyz';
  if (document.getElementById('password-uppercase').checked) {
    pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  if (document.getElementById('password-digits').checked) {
    pool += '0123456789';
  }
  if (document.getElementById('password-special').checked) {
    pool += PASSWORD_SPECIAL;
  }
  return pool;
}

function randomCharFrom(pool) {
  return pool[randomIntBelow(pool.length)];
}

function generatePassword(length, charset) {
  const chars = [];
  for (let i = 0; i < length; i += 1) {
    chars.push(randomCharFrom(charset));
  }
  return chars.join('');
}

function setPasswordMessage(text, visible) {
  const el = document.getElementById('password-generator-message');
  el.textContent = text;
  el.hidden = !visible;
}

function scheduleRenderPasswordsOnTab() {
  if (passwordRegenScheduled) {
    return;
  }
  passwordRegenScheduled = true;
  queueMicrotask(() => {
    passwordRegenScheduled = false;
    renderPasswords();
  });
}

function renderPasswords() {
  const container = document.getElementById('password-generator-results');
  const length = Number(document.getElementById('password-length').value);
  setPasswordMessage('', false);

  if (!Number.isFinite(length) || length < 8) {
    setPasswordMessage('Некорректная длина.', true);
    container.innerHTML = '';
    return;
  }

  const charset = buildCharset();
  const rows = [];
  for (let i = 0; i < PASSWORD_ROWS; i += 1) {
    rows.push(generatePassword(length, charset));
  }

  container.innerHTML = '';
  for (const pwd of rows) {
    const row = document.createElement('div');
    const span = document.createElement('span');
    span.textContent = pwd;
    row.appendChild(span);
    container.appendChild(row);
  }
}

function syncPasswordLengthRangeVisual() {
  const el = document.getElementById('password-length');
  const min = Number(el.min);
  const max = Number(el.max);
  const v = Number(el.value);
  const span = max - min;
  const t = span === 0 ? 0 : (v - min) / span;
  el.style.setProperty('--range-progress', String(t));
}

function initPasswordGenerator() {
  document.getElementById('generate-password').addEventListener('click', () => {
    renderPasswords();
  });
  const passwordLengthInput = document.getElementById('password-length');
  passwordLengthInput.addEventListener('input', syncPasswordLengthRangeVisual);
  syncPasswordLengthRangeVisual();
  bindCopyOnClick(document.getElementById('password-generator-results'));
}
