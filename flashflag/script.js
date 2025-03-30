let countriesData = [];
let flashSequence = [];
let currentIndex = 0;
let lastFlag = null;
let answerIsYes = false;
let flashCount = 5;

async function loadCountries() {
  const res = await fetch('countries.json');
  countriesData = await res.json();
}

function getRandomCountry() {
  const index = Math.floor(Math.random() * countriesData.length);
  return countriesData[index];
}

function showFlag(flagUrl) {
  const container = document.getElementById('flash-container');
  container.style.backgroundImage = `url(${flagUrl})`;
}

function clearFlag() {
  document.getElementById('flash-container').style.backgroundImage = '';
}

function startFlash() {
  document.getElementById('question-area').style.display = 'none';
  flashSequence = [];
  currentIndex = 0;

  const flashLoop = setInterval(() => {
    if (currentIndex >= flashCount) {
      clearInterval(flashLoop);
      clearFlag();
      setTimeout(showFinalFlag, 2000);
      return;
    }
    const country = getRandomCountry();
    flashSequence.push(country);
    showFlag(country.flag);
    setTimeout(clearFlag, 500); // フラッシュ表示時間 0.5秒
    currentIndex++;
  }, 600); // 0.5秒表示 + 0.1秒間隔
}

function showFinalFlag() {
  answerIsYes = Math.random() < 0.5;
  if (answerIsYes) {
    lastFlag = flashSequence[Math.floor(Math.random() * flashSequence.length)];
  } else {
    let newCountry;
    do {
      newCountry = getRandomCountry();
    } while (flashSequence.some(c => c.common_name === newCountry.common_name));
    lastFlag = newCountry;
  }

  document.getElementById('question-area').style.display = 'block';

  const flagDiv = document.getElementById('final-flag');
  flagDiv.innerHTML = `<img src="${lastFlag.flag}" alt="国旗" />`;

  const nameDiv = document.getElementById('country-name');
  nameDiv.textContent = lastFlag.common_name;
}

function handleAnswer(isYes) {
  const isCorrect = isYes === answerIsYes;
  showResult(isCorrect);
  setTimeout(() => {
    startFlash();
  }, isCorrect ? 500 : 2000);
}

function showResult(isCorrect) {
  const mark = document.createElement('div');
  mark.textContent = isCorrect ? '○' : '×';
  mark.style.position = 'fixed';
  mark.style.top = '50%';
  mark.style.left = '50%';
  mark.style.transform = 'translate(-50%, -50%)';
  mark.style.fontSize = '6rem';
  mark.style.color = isCorrect ? 'green' : 'red';
  mark.style.fontWeight = 'bold';
  mark.style.zIndex = '9999';
  document.body.appendChild(mark);
  setTimeout(() => mark.remove(), isCorrect ? 500 : 2000);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadCountries();

  // 初期選択（5回）
  const defaultBtn = document.querySelector('.mode-button[data-count="5"]');
  defaultBtn.classList.add('selected');
  flashCount = 5;

  // モードボタンの選択制御
  document.querySelectorAll('.mode-button').forEach(button => {
    button.addEventListener('click', () => {
      flashCount = parseInt(button.dataset.count);
      document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
    });
  });

  // スタートボタン（初期から表示）
  document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('mode-select').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    startFlash();
  });

  // ○×ボタン
  document.getElementById('yes-button').addEventListener('click', () => handleAnswer(true));
  document.getElementById('no-button').addEventListener('click', () => handleAnswer(false));
});
