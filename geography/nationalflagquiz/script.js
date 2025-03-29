const quizData = [
    {
      flag: 'https://flagcdn.com/w320/jp.png',
      options: ['日本', '中国', '韓国', 'ベトナム'],
      answer: '日本',
    },
    {
      flag: 'https://flagcdn.com/w320/fr.png',
      options: ['フランス', 'イタリア', 'イギリス', 'ドイツ'],
      answer: 'フランス',
    },
    {
      flag: 'https://flagcdn.com/w320/us.png',
      options: ['アメリカ', 'カナダ', 'オーストラリア', 'メキシコ'],
      answer: 'アメリカ',
    },
    {
      flag: 'https://flagcdn.com/w320/kr.png',
      options: ['韓国', '中国', '北朝鮮', '日本'],
      answer: '韓国',
    },
    {
      flag: 'https://flagcdn.com/w320/de.png',
      options: ['オーストリア', 'ドイツ', 'スイス', 'ベルギー'],
      answer: 'ドイツ',
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
          option === question.answer ? '✅ 正解！' : '❌ 不正解…';
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
  