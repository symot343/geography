let quizData = [];
let current = 0;
let mode = 'flag-to-name';
let timeLimit = 30;
let choiceCount = 5;
let timer;
let timeLeft = 0;
let score = 0;

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const modal = document.getElementById('score-modal');
const finalScoreText = document.getElementById('final-score');
const closeBtn = document.getElementById('close-modal');

fetch('countries.json')
  .then(res => res.json())
  .then(data => {
    quizData = data.filter(entry => entry.name && entry.flag);
    console.log("読み込んだ国データ数:", quizData.length);
  });

document.getElementById('start-btn').onclick = () => {
  if (quizData.length === 0) {
    alert("データの読み込み中です。少し待ってから再試行してください。");
    return;
  }

  mode = document.getElementById('mode-select').value;
  timeLimit = parseInt(document.getElementById('time-select').value);
  choiceCount = Math.min(Math.max(parseInt(document.getElementById('choice-count').value), 5), 8);

  startScreen.style.display = 'none';
  quizScreen.style.display = 'block';
  startQuiz();
};

closeBtn.onclick = () => {
  modal.style.display = 'none';
  location.reload();
};

function startQuiz() {
  current = 0;
  score = 0;
  timeLeft = timeLimit;
  document.getElementById('next').style.display = 'none';
  loadQuiz();
  startTimer();
}

function loadQuiz() {
  const question = quizData[current];
  if (!question || !question.name || !question.flag) {
    console.error("無効な問題データ：", question);
    return;
  }

  const questionDiv = document.getElementById('question-container');
  const optionsDiv = document.getElementById('options');
  const result = document.getElementById('result');

  optionsDiv.innerHTML = '';
  result.textContent = '';

  let options = shuffle(quizData).filter(opt => opt.name && opt.flag).slice(0, choiceCount);
  if (!options.some(opt => opt.name === question.name)) {
    options[Math.floor(Math.random() * options.length)] = question;
  }

  if (mode === 'flag-to-name') {
    questionDiv.innerHTML = `<img id="flag" src="${question.flag}" alt="国旗" />`;
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt.name;
      btn.onclick = () => checkAnswer(opt.name === question.name);
      optionsDiv.appendChild(btn);
    });
  } else {
    questionDiv.textContent = question.name;
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.innerHTML = `<img src="${opt.flag}" width="100" alt="${opt.name}" />`;
      btn.onclick = () => checkAnswer(opt.name === question.name);
      optionsDiv.appendChild(btn);
    });
  }
}

function checkAnswer(isCorrect) {
  if (isCorrect) score++;

  document.getElementById('result').textContent = isCorrect ? '✅ 正解！' : '❌ 不正解…';
  document.querySelectorAll('#options button').forEach(btn => btn.disabled = true);
  document.getElementById('next').style.display = 'inline-block';
}

document.getElementById('next').onclick = () => {
  current = (current + 1) % quizData.length;
  document.getElementById('next').style.display = 'none';
  loadQuiz();
};

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
      document.getElementById('next').style.display = 'none';
      showScoreModal();
    }
  }, 1000);
}

function showScoreModal() {
  finalScoreText.textContent = `あなたのスコアは ${score} 点でした！`;
  modal.style.display = 'block';
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
