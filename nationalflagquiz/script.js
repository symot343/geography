let quizData = [];
let questionOrder = [];
let current = 0;
let nameFormat = 'en';
let mode = 'flag-to-name';
let timeLimit = 30;
let choiceCount = 5;
let timeLeft = 0;
let score = 0;
let timer;

fetch('countries.json')
  .then(res => res.json())
  .then(data => {
    quizData = data.filter(entry => entry.flag);
    console.log("読み込んだ国数:", quizData.length);
  });

document.getElementById('start-btn').onclick = () => {
  if (quizData.length === 0) {
    alert("データの読み込み中です。少し待ってから再試行してください。");
    return;
  }

  // 値の取得
  nameFormat = document.getElementById('name-format').value;
  mode = document.getElementById('mode-select').value;

  // 時間と選択肢数はボタンで選択された値を使用
  timeLimit = parseInt(document.querySelector('.time-btn.selected').dataset.time);
  choiceCount = parseInt(document.querySelector('.choice-btn.selected').dataset.choice);

  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';

  startQuiz();
};

// 選択ボタンの選択切替（制限時間・選択肢数）
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    timeLimit = parseInt(btn.dataset.time);
  };
});

document.querySelectorAll('.choice-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    choiceCount = parseInt(btn.dataset.choice);
  };
});

function startQuiz() {
  current = 0;
  score = 0;
  timeLeft = timeLimit;
  questionOrder = shuffle([...quizData]);
  startTimer();
  loadQuiz();
}

function loadQuiz() {
  const question = questionOrder[current];
  const questionDiv = document.getElementById('question-container');
  const optionsDiv = document.getElementById('options');
  const result = document.getElementById('result');

  optionsDiv.innerHTML = '';
  result.textContent = '';

  let options = shuffle([...quizData])
    .filter(opt => getDisplayName(opt) && opt.flag)
    .slice(0, choiceCount);

  if (!options.some(opt => opt === question)) {
    options[Math.floor(Math.random() * options.length)] = question;
  }

  if (mode === 'flag-to-name') {
    questionDiv.innerHTML = `<img id="flag" src="${question.flag}" alt="国旗" />`;
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = getDisplayName(opt);
      btn.onclick = () => checkAnswer(opt === question, question);
      optionsDiv.appendChild(btn);
    });
  } else {
    questionDiv.textContent = getDisplayName(question);
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.innerHTML = `<img src="${opt.flag}" width="100" alt="${getDisplayName(opt)}" />`;
      btn.onclick = () => checkAnswer(opt === question, question);
      optionsDiv.appendChild(btn);
    });
  }
}

function checkAnswer(isCorrect, question) {
  const result = document.getElementById('result');
  result.textContent = isCorrect ? '◯' : '×';
  result.className = isCorrect ? 'correct' : 'incorrect';

  document.querySelectorAll('#options button').forEach(btn => btn.disabled = true);

  if (!isCorrect) {
    const correct = document.createElement('p');
    correct.textContent = `正解：${getDisplayName(question)}`;
    document.getElementById('options').appendChild(correct);
  } else {
    score++;
  }

  setTimeout(() => {
    result.textContent = '';
    result.className = '';
    nextQuiz();
  }, isCorrect ? 500 : 2000);
}

function nextQuiz() {
  current++;
  if (current >= questionOrder.length) {
    showScoreModal();
  } else {
    loadQuiz();
  }
}

function startTimer() {
  const timerDiv = document.getElementById('timer');
  timerDiv.textContent = `残り時間: ${timeLeft}秒`;

  timer = setInterval(() => {
    timeLeft--;
    timerDiv.textContent = `残り時間: ${timeLeft}秒`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      timerDiv.textContent = '⏰ 時間切れ！';
      document.getElementById('options').innerHTML = '';
      document.getElementById('result').textContent = '';
      showScoreModal();
    }
  }, 1000);
}

function showScoreModal() {
  document.getElementById('final-score').textContent = `あなたのスコアは ${score} 点でした！`;
  document.getElementById('score-modal').style.display = 'block';
}

document.getElementById('close-modal').onclick = () => {
  location.reload();
};

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function getDisplayName(entry) {
  if (nameFormat === 'en') return entry.common_name;
  if (nameFormat === 'jp-common') return entry.japanese_common_name;
  if (nameFormat === 'jp-official') return entry.japanese_official_name;
  return entry.common_name;
}
