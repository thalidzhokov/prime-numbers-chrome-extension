function appendKeyValueList(root, title, entries) {
  const h3 = document.createElement('h3');
  h3.textContent = title;
  root.appendChild(h3);
  const ul = document.createElement('ul');
  if (!entries.length) {
    const li = document.createElement('li');
    li.className = 'whoami-empty';
    li.textContent = '(пусто — нет пар ключ/значение)';
    ul.appendChild(li);
  } else {
    for (const [k, v] of entries) {
      const li = document.createElement('li');
      li.className = 'copyable-value';
      li.innerHTML = `${escapeHtml(k)}: ${escapeHtml(v)}`;
      ul.appendChild(li);
    }
  }
  root.appendChild(ul);
}

function renderWhoami() {
  const root = document.getElementById('whoami-results');
  if (!root) {
    return;
  }
  root.innerHTML = '';

  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const navKeys = [
    'userAgent',
    'language',
    'languages',
    'platform',
    'hardwareConcurrency',
    'cookieEnabled',
    'onLine',
    'appName',
    'product',
    'vendor',
  ];
  const navEntries = [];
  for (const key of navKeys) {
    if (!(key in nav)) {
      continue;
    }
    let val = nav[key];
    if (Array.isArray(val)) {
      val = val.join(', ');
    }
    navEntries.push([key, String(val)]);
  }
  appendKeyValueList(root, 'Navigator', navEntries);
}

function initWhoami() {
  renderWhoami();
}
