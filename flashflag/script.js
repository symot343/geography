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

  // フラッシュループ（表示0.5秒 + 間隔0.1秒 = 600ms間隔）
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
    setTimeout(clearFlag, 500); // ← 表示時間0.5秒
    currentIndex++;
  }, 600);

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

  // 回数ボタンを選んだらスタートボタンを表示
  document.querySelectorAll('.mode-button').forEach(button => {
    button.addEventListener('click', () => {
      flashCount = parseInt(button.dataset.count);
      document.getElementById('start-button').style.display = 'inline-block';
    });
  });

  // スタートボタン
  document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('mode-select').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    startFlash();
  });

  // ○×ボタン
  document.getElementById('yes-button').addEventListener('click', () => handleAnswer(true));
  document.getElementById('no-button').addEventListener('click', () => handleAnswer(false));
});
