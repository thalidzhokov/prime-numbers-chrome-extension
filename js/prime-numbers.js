const PRIME_RANGE_MAX_SPAN = 50000;

function isPrime(number) {
  if (number < 2) {
    return false;
  }
  if (number === 2) {
    return true;
  }
  if (number % 2 === 0) {
    return false;
  }
  const limit = Math.sqrt(number);
  for (let divisor = 3; divisor <= limit; divisor += 2) {
    if (number % divisor === 0) {
      return false;
    }
  }
  return true;
}

function getPrimeNumbers(from, to) {
  const result = [];
  for (let number = from; number <= to; number += 1) {
    if (isPrime(number)) {
      result.push(number);
    }
  }
  return result;
}

function readPrimeRange() {
  const minInput = document.getElementById('min-number');
  const maxInput = document.getElementById('max-number');
  const from = Math.floor(Number(minInput.value));
  const to = Math.floor(Number(maxInput.value));
  return { from, to, minInput, maxInput };
}

function setPrimeMessage(text, visible) {
  const el = document.getElementById('prime-numbers-message');
  el.textContent = text;
  el.hidden = !visible;
}

function renderPrimeNumbers() {
  const primeListElement = document.getElementById('prime-numbers-list');
  const { from, to } = readPrimeRange();

  setPrimeMessage('', false);

  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    setPrimeMessage('Enter valid numbers.', true);
    primeListElement.innerHTML = '';
    return;
  }
  if (from < 1 || to < 1) {
    setPrimeMessage('Bounds must be at least 1.', true);
    primeListElement.innerHTML = '';
    return;
  }
  if (from > to) {
    setPrimeMessage('From cannot be greater than To.', true);
    primeListElement.innerHTML = '';
    return;
  }
  if (to - from > PRIME_RANGE_MAX_SPAN) {
    setPrimeMessage(`Range is too wide (max ${PRIME_RANGE_MAX_SPAN}).`, true);
    primeListElement.innerHTML = '';
    return;
  }

  const primeNumbers = getPrimeNumbers(from, to);
  primeListElement.innerHTML = '';

  for (const primeNumber of primeNumbers) {
    const row = document.createElement('div');
    const span = document.createElement('span');
    span.className = 'copyable-value';
    span.textContent = String(primeNumber);
    row.appendChild(span);
    primeListElement.appendChild(row);
  }
}

function initPrimeNumbers() {
  document.getElementById('get-prime-numbers').addEventListener('click', renderPrimeNumbers);
}
