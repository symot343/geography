const quizzes = [
    { title: '国旗クイズ', path: 'nationalflagquiz/' },
    { title: '神経衰弱', path: 'concentration/' },
    { title: 'ケッペンの気候区分クイズ', path: 'keppenquiz/' },
    { title: 'フラッシュフラッグ', path: 'flashflag/' }
  ];
  
  const quizList = document.getElementById('quiz-list');
  
  quizzes.forEach(quiz => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `<a href="${quiz.path}">${quiz.title}</a>`;
    quizList.appendChild(card);
  });
  