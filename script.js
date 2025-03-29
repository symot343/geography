const quizzes = [
    { title: '国旗クイズ', path: 'nationalflagquiz/' },
    { title: '数学クイズ', path: 'math-quiz/' },
    { title: '日本地図クイズ', path: 'map-quiz/' }
  ];
  
  const quizList = document.getElementById('quiz-list');
  
  quizzes.forEach(quiz => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `<a href="${quiz.path}">${quiz.title}</a>`;
    quizList.appendChild(card);
  });
  