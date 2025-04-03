let countriesData = [];
let availableCountries = [];
let allBalls = [];
let correctCount = 0;
let vortexInterval;
let selectedDifficulty = 'easy';
let currentCorrectCapital = null;
let gameStarted = false;

const difficultyToInterval = {
  easy: 6000,
  medium: 4000,
  hard: 2000
};

window.addEventListener('DOMContentLoaded', () => {
  fetch('countries.json')
    .then(res => res.json())
    .then(data => {
      countriesData = data;
      availableCountries = countriesData.filter(
        c => c.capital && c.capital_ja
      );
    });
});

document.querySelectorAll('.level-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.level-button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedDifficulty = btn.dataset.level;
  });
});

document.getElementById('start-button').addEventListener('click', () => {
  gameStarted = true;
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('vortex').classList.remove('hidden');
  correctCount = 0;

  const options = generateInitialBallOptions(7);
  dropBalls(options, true);

  setTimeout(() => {
    startNewQuestion();
    startAnimationLoop();
  }, 200);
});

function startNewQuestion() {
  clearInterval(vortexInterval);

  const validBalls = allBalls.filter(ball =>
    availableCountries.some(c => c.capital === ball.value)
  );
  if (validBalls.length === 0) return;

  const chosenBall = validBalls[Math.floor(Math.random() * validBalls.length)];
  const correctCapital = chosenBall.value;
  const correctCountry = availableCountries.find(c => c.capital === correctCapital);
  if (!correctCountry) return;

  currentCorrectCapital = correctCapital;

  document.getElementById('flag').src = correctCountry.flag;
  document.getElementById('country-name').textContent = correctCountry.japanese_common_name;
  document.getElementById('score').textContent = `正解数：${correctCount}`;
  document.querySelector('.card').classList.remove('correct-bg', 'wrong-bg');

  const interval = difficultyToInterval[selectedDifficulty] || 3000;
  vortexInterval = setInterval(() => {
    const randomCity = getRandomCapitals(correctCapital, 1)[0];
    createBall(randomCity.capital, randomCity.capital_ja);
    checkGameOver();
  }, interval);
}

function generateInitialBallOptions(count) {
  const options = [];
  const usedCapitals = new Set();

  while (options.length < count) {
    const random = availableCountries[Math.floor(Math.random() * availableCountries.length)];
    if (!usedCapitals.has(random.capital)) {
      options.push(random);
      usedCapitals.add(random.capital);
    }
  }

  return options;
}

function dropBalls(optionCountries, isInitial = false) {
  const container = document.getElementById('ball-container');
  if (isInitial) {
    container.innerHTML = '';
    allBalls = [];
  }
  optionCountries.forEach(c => {
    createBall(c.capital, c.capital_ja);
  });
}

function createBall(capital, capitalJa) {
  if (allBalls.some(b => b.value === capital)) return;

  const ball = document.createElement('div');
  ball.classList.add('ball');
  ball.innerHTML = `${capital}<br>${capitalJa}`;

  const size = Math.min(140, Math.max(80, capital.length * 12));
  ball.style.width = `${size}px`;
  ball.style.height = `${size}px`;

  let x = Math.random() * (window.innerWidth - size);
  let y = Math.random() * (window.innerHeight - size);

  const vx = (Math.random() - 0.5) * 2 + (Math.random() > 0.5 ? 1 : -1);
  const vy = (Math.random() - 0.5) * 2 + (Math.random() > 0.5 ? 1 : -1);

  const color = getRandomColor();
  ball.style.backgroundColor = color;
  ball.style.color = getContrastColor(color);
  ball.style.left = `${x}px`;
  ball.style.top = `${y}px`;

  document.getElementById('ball-container').appendChild(ball);

  const ballObj = { element: ball, x, y, vx, vy, size, value: capital };
  allBalls.push(ballObj);

  setupBallClick(ballObj);
}

function setupBallClick(ball) {
  ball.element.addEventListener('click', () => {
    const card = document.querySelector('.card');

    const isCorrect = ball.value === currentCorrectCapital;
    if (isCorrect) {
      correctCount++;
      card.classList.add('correct-bg');
      ball.element.remove();
      allBalls = allBalls.filter(b => b !== ball);
      setTimeout(() => {
        if (allBalls.length === 0) {
          clearInterval(vortexInterval);
          showResultModal('CLEAR!');
        } else {
          startNewQuestion();
        }
      }, 800);
    } else {
      card.classList.add('wrong-bg');
      setTimeout(() => {
        card.classList.remove('wrong-bg');
      }, 500);
    }

    document.getElementById('score').textContent = `正解数：${correctCount}`;
  });
}

function checkGameOver() {
  if (!gameStarted) return;
  if (allBalls.length > 30) {
    clearInterval(vortexInterval);
    showResultModal('GAME OVER');
  }
}

function showResultModal(titleText) {
  const modal = document.getElementById('result-modal');
  const levelText = {
    easy: '初級',
    medium: '中級',
    hard: '上級'
  };

  document.querySelector('#result-modal h2').textContent = titleText;
  document.getElementById('played-level').textContent = `プレイした級：${levelText[selectedDifficulty] || '？'}`;
  document.getElementById('final-score').textContent = `正解数：${correctCount}`;
  const totalAttempts = correctCount + allBalls.length;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
  document.getElementById('final-accuracy').textContent = `正解率：${accuracy}%`;
  modal.classList.remove('hidden');
}

function goToStartScreen() {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('result-modal').classList.add('hidden');
  document.getElementById('start-screen').classList.remove('hidden');
  location.reload();
}

function startAnimationLoop() {
  function update() {
    const triangleRects = getTriangleRects();
    allBalls.forEach(ball => {
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x <= 0 || ball.x >= window.innerWidth - ball.size) ball.vx *= -1;
      if (ball.y <= 0 || ball.y >= window.innerHeight - ball.size) ball.vy *= -1;

      const ballRect = {
        left: ball.x,
        right: ball.x + ball.size,
        top: ball.y,
        bottom: ball.y + ball.size
      };

      triangleRects.forEach(tri => {
        const intersect = !(
          ballRect.right < tri.left ||
          ballRect.left > tri.right ||
          ballRect.bottom < tri.top ||
          ballRect.top > tri.bottom
        );
        if (intersect) {
          ball.vx *= -1;
          ball.vy *= -1;
        }
      });

      ball.element.style.left = `${ball.x}px`;
      ball.element.style.top = `${ball.y}px`;
    });

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function getTriangleRects() {
  return Array.from(document.querySelectorAll('.corner')).map(corner =>
    corner.getBoundingClientRect()
  );
}

function getRandomCapitals(excludeCapital, count) {
  const filtered = availableCountries.filter(c => c.capital !== excludeCapital);
  return shuffle(filtered).slice(0, count);
}

function shuffle(array) {
  return array.slice().sort(() => Math.random() - 0.5);
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgb(${r},${g},${b})`;
}

function getContrastColor(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return 'white';
  const [r, g, b] = result.map(Number);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? 'black' : 'white';
}
