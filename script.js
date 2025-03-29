const quizData = [
    {
      flag: 'flags/japan.png',
      options: ['日本', '韓国', '中国', 'タイ'],
      answer: '日本',
    },
    {
      flag: 'flags/france.png',
      options: ['イタリア', 'オランダ', 'フランス', 'ドイツ'],
      answer: 'フランス',
    }
  ];
  
  let current = 0;
  
  function loadQuiz() {
    const question = quizData[current];
    document.getElementById('flag').src = question.flag;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    question.options.forEach(option => {
      const btn = document.createElement('button');
      btn.textContent = option;
      btn.onclick = () => {
        document.getElementById('result').textContent =
          option === question.answer ? '正解！' : '不正解…';
      };
      optionsDiv.appendChild(btn);
    });
    document.getElementById('result').textContent = '';
  }
  
  document.getElementById('next').onclick = () => {
    current = (current + 1) % quizData.length;
    loadQuiz();
  };
  
  loadQuiz();
  