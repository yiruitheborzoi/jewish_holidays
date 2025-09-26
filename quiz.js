/*
  quiz.js

  Provides the quiz functionality on the dedicated quiz page. A list of
  multiple‑choice questions is presented sequentially. When the user
  answers correctly, a pleasant chime is played. At the end of the
  quiz, the total score is displayed. The nav toggle is also wired up
  for mobile responsiveness.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const header = document.querySelector('.header');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      header.classList.toggle('nav-open');
    });
  }

  // Audio element for correct answers
  const correctSound = document.getElementById('correct-sound');

  // Quiz questions array
  const questions = [
    {
      question: 'Which holiday celebrates the rededication of the Second Temple in Jerusalem?',
      options: ['Hanukkah', 'Purim', 'Shavuot', 'Passover'],
      answer: 'Hanukkah'
    },
    {
      question: 'Which holiday is known as the Day of Atonement?',
      options: ['Sukkot', 'Yom Kippur', 'Rosh Hashanah', 'Purim'],
      answer: 'Yom Kippur'
    },
    {
      question: 'Which holiday commemorates the liberation of the Israelites from slavery in Egypt?',
      options: ['Passover', 'Shavuot', "Tisha B'Av", 'Tu BiShvat'],
      answer: 'Passover'
    },
    {
      question: 'Which holiday celebrates the giving of the Torah at Mount Sinai?',
      options: ['Hanukkah', 'Shavuot', 'Purim', 'Rosh Hashanah'],
      answer: 'Shavuot'
    },
    {
      question: 'Which holiday is known as the New Year for Trees?',
      options: ['Tu BiShvat', 'Simchat Torah', 'Sukkot', 'Shemini Atzeret'],
      answer: 'Tu BiShvat'
    },
    {
      question: 'Which holiday commemorates the sheltering of the Israelites in the wilderness?',
      options: ['Sukkot', 'Passover', 'Purim', "Tisha B'Av"],
      answer: 'Sukkot'
    },
    {
      question: 'Which holiday marks the Jewish New Year?',
      options: ['Shavuot', 'Rosh Hashanah', 'Purim', 'Hanukkah'],
      answer: 'Rosh Hashanah'
    },
    {
      question: 'Which holiday is a day of mourning for the destruction of the Temples?',
      options: ["Tisha B'Av", 'Purim', 'Yom Kippur', 'Shemini Atzeret'],
      answer: "Tisha B'Av"
    },
    {
      question: 'Which holiday ends with the joyous celebration of finishing the Torah and starting anew?',
      options: ['Simchat Torah', 'Shavuot', 'Hanukkah', 'Purim'],
      answer: 'Simchat Torah'
    },
    {
      question: 'Which festival involves dwelling in a temporary hut called a sukkah?',
      options: ['Purim', 'Sukkot', 'Passover', 'Tu BiShvat'],
      answer: 'Sukkot'
    }
  ];

  let currentIndex = 0;
  let score = 0;
  const container = document.getElementById('quiz-container');

  function renderQuestion() {
    container.innerHTML = '';
    if (currentIndex >= questions.length) {
      const scoreEl = document.createElement('div');
      scoreEl.className = 'quiz-score';
      scoreEl.textContent = `Quiz complete! Your score is ${score} out of ${questions.length}.`;
      container.appendChild(scoreEl);
      return;
    }
    const q = questions[currentIndex];
    const questionEl = document.createElement('div');
    questionEl.className = 'quiz-question';
    questionEl.textContent = q.question;
    container.appendChild(questionEl);
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quiz-options';
    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        const feedback = document.createElement('div');
        feedback.className = 'quiz-feedback';
        if (opt === q.answer) {
          feedback.textContent = 'Correct!';
          score++;
          // Play chime sound on correct answer
          if (correctSound) {
            correctSound.currentTime = 0;
            correctSound.play().catch(() => {/* ignore playback errors */});
          }
        } else {
          feedback.textContent = `Incorrect. The correct answer is ${q.answer}.`;
        }
        container.appendChild(feedback);
        currentIndex++;
        setTimeout(renderQuestion, 1500);
      });
      optionsDiv.appendChild(btn);
    });
    container.appendChild(optionsDiv);
  }

  // Start the quiz
  renderQuestion();
});