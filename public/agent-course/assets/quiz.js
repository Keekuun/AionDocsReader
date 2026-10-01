/* 可复用测验组件：data-quiz 容器 + JSON 题目。
   用法见 lessons/0001。每题选项等长，即时反馈，答对解锁下一题。 */
(function () {
  'use strict';

  function shuffle(arr) {
    // Fisher-Yates：选项乱序，避免正确答案固定在同一个位置
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function renderQuiz(container) {
    var questions = JSON.parse(container.getAttribute('data-quiz'));
    var answered = 0;

    questions.forEach(function (q, qi) {
      var box = document.createElement('div');
      box.className = 'quiz-q';

      var p = document.createElement('p');
      p.textContent = (qi + 1) + '. ' + q.q;
      box.appendChild(p);

      var fb = document.createElement('div');
      fb.className = 'quiz-fb';

      shuffle(q.options.slice()).forEach(function (opt) {
        var btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.textContent = opt.t;
        btn.addEventListener('click', function () {
          if (box.dataset.done) return;
          if (opt.ok) {
            box.dataset.done = '1';
            btn.classList.add('correct');
            fb.textContent = '✓ ' + q.why;
            fb.className = 'quiz-fb ok';
            box.querySelectorAll('.quiz-opt').forEach(function (b) { b.disabled = true; });
            answered += 1;
            if (answered === questions.length) {
              var done = container.querySelector('.quiz-done');
              if (done) done.hidden = false;
            }
          } else {
            btn.classList.add('wrong');
            fb.textContent = '✗ 再想想。' + (q.hint || '');
            fb.className = 'quiz-fb no';
            setTimeout(function () { btn.classList.remove('wrong'); }, 900);
          }
        });
        box.appendChild(btn);
      });

      box.appendChild(fb);
      container.appendChild(box);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-quiz]').forEach(renderQuiz);
  });
})();
