let countriesData = [];
let selectedDifficulty = 'easy';

fetch('countries.json')
  .then(response => response.json())
  .then(data => {
    countriesData = data;
    setupStartButton();
  })
  .catch(error => {
    console.error('Error loading countries.json:', error);
  });

function setupStartButton() {
  const startBtn = document.getElementById('start-button');
  const difficultyButtons = document.querySelectorAll('.difficulty');

  difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      difficultyButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  startBtn.addEventListener('click', () => {
    selectedDifficulty = document.querySelector('.difficulty.selected').dataset.level;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'grid';
    document.getElementById('turn-counter').style.display = 'block';
    document.getElementById('result-modal').classList.add('hidden');
    init();
  });

  document.getElementById('retry-button').addEventListener('click', () => {
    document.getElementById('result-modal').classList.add('hidden');
    init();
  });

  document.getElementById('home-button').addEventListener('click', () => {
    document.getElementById('result-modal').classList.add('hidden');
    document.getElementById('game-board').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('turn-counter').style.display = 'none';
  });
}

function init() {
  const board = document.getElementById('game-board');
  board.innerHTML = '';

  const selectedCountries = shuffle([...countriesData]).slice(0, 7);
  const pairedCards = [...selectedCountries, ...selectedCountries];
  const joker = shuffle(countriesData.filter(c => !selectedCountries.includes(c)))[0];
  const cardData = shuffle([...pairedCards, joker]);

  let flippedCards = [];
  let matchedCards = [];
  let turnCount = 0;
  const turnDisplay = document.getElementById('turn-counter');
  turnDisplay.textContent = 'ターン数: 0';

  const cardElements = [];

  cardData.forEach(country => {
    const card = document.createElement('div');
    card.className = 'card';

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-front';
    const flag = document.createElement('img');
    flag.src = `https://flagcdn.com/w320/${country.alpha2_code.toLowerCase()}.png`;
    flag.alt = `${country.japanese_common_name} の国旗`;
    const name = document.createElement('div');
    name.textContent = country.japanese_common_name;
    front.appendChild(flag);
    front.appendChild(name);

    const back = document.createElement('div');
    back.className = 'card-back';
    back.textContent = '？';

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    board.appendChild(card);

    card.dataset.id = country.japanese_common_name;
    cardElements.push(card);

    card.addEventListener('click', () => {
      if (card.classList.contains('flipped') || flippedCards.length >= 2) return;

      card.classList.add('flipped');
      flippedCards.push(card);

      if (flippedCards.length === 2) {
        const [card1, card2] = flippedCards;
        const id1 = card1.dataset.id;
        const id2 = card2.dataset.id;

        turnCount++;
        turnDisplay.textContent = `ターン数: ${turnCount}`;

        const isMatch = id1 === id2;

        if (isMatch) {
          matchedCards.push(id1);
          flippedCards = [];

          if (matchedCards.length === 7) {
            setTimeout(() => {
              showResultModal(turnCount);
            }, 300);
          }
        } else {
          setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
          }, 1000);
        }

        // 難易度による邪魔（カード入れ替え）
        let swapTimes = 0;
        if (selectedDifficulty === 'medium') swapTimes = 1;
        if (selectedDifficulty === 'hard') swapTimes = 3;

        for (let i = 0; i < swapTimes; i++) {
          setTimeout(() => swapWithAnimation(cardElements), 1200 + i * 1100); // ← 1.1秒インターバル付き
        }
      }
    });
  });
}


function showResultModal(turns) {
    const levelMap = {
      easy: '初級',
      medium: '中級',
      hard: '上級'
    };
    const levelName = levelMap[selectedDifficulty] || '不明';
    document.getElementById('result-text').textContent = `難易度：${levelName}\nターン数：${turns}`;
    document.getElementById('result-modal').classList.remove('hidden');
  }

function swapWithAnimation(cards) {
  const idx1 = Math.floor(Math.random() * cards.length);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * cards.length);
  } while (idx1 === idx2);

  const card1 = cards[idx1];
  const card2 = cards[idx2];

  const rect1 = card1.getBoundingClientRect();
  const rect2 = card2.getBoundingClientRect();

  const dx = rect2.left - rect1.left;
  const dy = rect2.top - rect1.top;

  const dx2 = rect1.left - rect2.left;
  const dy2 = rect1.top - rect2.top;

  card1.style.transition = 'transform 0.8s ease';
  card2.style.transition = 'transform 0.8s ease';

  card1.style.zIndex = '10';
  card2.style.zIndex = '10';

  card1.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
  card2.style.transform = `translate(${dx2}px, ${dy2}px) scale(1.1)`;

  setTimeout(() => {
    card1.style.transition = '';
    card2.style.transition = '';
    card1.style.transform = '';
    card2.style.transform = '';
    card1.style.zIndex = '';
    card2.style.zIndex = '';

    const parent = card1.parentElement;
    const next1 = card1.nextSibling;
    const next2 = card2.nextSibling;

    if (next1 === card2) {
      parent.insertBefore(card2, card1);
    } else if (next2 === card1) {
      parent.insertBefore(card1, card2);
    } else {
      parent.insertBefore(card1, next2);
      parent.insertBefore(card2, next1);
    }
  }, 800); // ← 0.8秒後に入れ替え
}

function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
