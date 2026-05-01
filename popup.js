const MIN_NUMBER = 1;
const MAX_NUMBER = 1013;

function isPrime(number) {
  if (number < 2) {
    return false;
  }

  const limit = Math.sqrt(number);
  for (let divisor = 2; divisor <= limit; divisor += 1) {
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

function renderPrimeNumbers() {
  const primeListElement = document.getElementById("prime-numbers-list");
  const primeNumbers = getPrimeNumbers(MIN_NUMBER, MAX_NUMBER);

  primeListElement.innerHTML = "";

  for (const primeNumber of primeNumbers) {
    const listItem = document.createElement("div");
    listItem.innerHTML = `<span>${String(primeNumber)}</span>`;
    primeListElement.appendChild(listItem);
  }
}

renderPrimeNumbers();
