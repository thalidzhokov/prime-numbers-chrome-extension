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

function storageEntries(storage) {
  const out = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key == null) {
      continue;
    }
    const value = storage.getItem(key);
    out.push([key, value == null ? '' : value]);
  }
  return out;
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
  appendKeyValueList(root, 'Браузер (navigator)', navEntries);

  appendKeyValueList(
    root,
    'Данные этого расширения (localStorage)',
    storageEntries(localStorage),
  );
  appendKeyValueList(
    root,
    'Данные сессии (sessionStorage)',
    storageEntries(sessionStorage),
  );

  const h3db = document.createElement('h3');
  h3db.textContent = 'Базы на origin расширения (indexedDB)';
  root.appendChild(h3db);
  const ulDb = document.createElement('ul');
  root.appendChild(ulDb);

  if (typeof indexedDB.databases !== 'function') {
    const li = document.createElement('li');
    li.className = 'whoami-empty';
    li.textContent = 'API indexedDB.databases() недоступен в этом контексте';
    ulDb.appendChild(li);
    return;
  }

  const liLoading = document.createElement('li');
  liLoading.className = 'whoami-empty';
  liLoading.textContent = '(загрузка списка баз…)';
  ulDb.appendChild(liLoading);

  indexedDB.databases().then(
    (dbs) => {
      ulDb.innerHTML = '';
      if (!dbs.length) {
        const li = document.createElement('li');
        li.className = 'whoami-empty';
        li.textContent = '(нет зарегистрированных баз для этого origin)';
        ulDb.appendChild(li);
        return;
      }
      for (const info of dbs) {
        const li = document.createElement('li');
        li.className = 'copyable-value';
        const name = info.name == null ? '(без имени)' : info.name;
        const ver = info.version == null ? '?' : String(info.version);
        li.textContent = `${name} v${ver}`;
        ulDb.appendChild(li);
      }
    },
    () => {
      ulDb.innerHTML = '';
      const li = document.createElement('li');
      li.className = 'whoami-empty';
      li.textContent = 'Не удалось получить список баз IndexedDB';
      ulDb.appendChild(li);
    },
  );
}

function initWhoami() {
  renderWhoami();
}
