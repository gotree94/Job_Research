// ============================================================
//  STATE
// ============================================================
let userData = {};
let currentQuestion = 0;
let answers = [];
let isTransitioning = false;
let resultId = null;
let lastResult = null;

// ============================================================
//  SCREEN MANAGEMENT
// ============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ============================================================
//  START
// ============================================================
function startQuiz() {
  const name = document.getElementById('input-name').value.trim();
  const gender = document.getElementById('input-gender').value;
  const age = document.getElementById('input-age').value.trim();
  const mbti_ei = document.querySelector('.mbti-ei').value;
  const mbti_sn = document.querySelector('.mbti-sn').value;
  const mbti_tf = document.querySelector('.mbti-tf').value;
  const mbti_jp = document.querySelector('.mbti-jp').value;

  if (!name) { shakeElement(document.getElementById('input-name')); return; }
  if (!age || isNaN(Number(age)) || Number(age) < 1) { shakeElement(document.getElementById('input-age')); return; }

  const mbti = mbti_ei + mbti_sn + mbti_tf + mbti_jp;
  userData = { name, gender, age: Number(age), mbti };
  currentQuestion = 0;
  answers = [];
  resultId = null;
  lastResult = null;
  document.getElementById('pdf-hint').style.display = 'none';

  showScreen('screen-question');
  showQuestion(0);
}

function shakeElement(el) {
  el.style.borderColor = '#ff4757';
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => { el.style.borderColor = ''; }, 600);
  el.focus();
}

(function() {
  const style = document.createElement('style');
  style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-4px)}}';
  document.head.appendChild(style);
})();

// ============================================================
//  QUESTION
// ============================================================
function showQuestion(index) {
  if (index >= QUESTIONS.length) {
    showLoading();
    return;
  }

  const q = QUESTIONS[index];
  document.getElementById('q-number').textContent = 'Q' + q.id;
  document.getElementById('question-text').textContent = q.text;
  document.getElementById('option-a').textContent = q.options.A;
  document.getElementById('option-b').textContent = q.options.B;
  document.getElementById('question-counter').textContent = (index + 1) + ' / ' + QUESTIONS.length;
  document.getElementById('progress-fill').style.width = ((index / QUESTIONS.length) * 100) + '%';

  const card = document.getElementById('question-card');
  card.classList.remove('slide-out');
  void card.offsetWidth;
  card.classList.add('slide-in');
}

function selectAnswer(choice) {
  if (isTransitioning) return;
  isTransitioning = true;

  answers.push(choice);

  const card = document.getElementById('question-card');
  card.classList.remove('slide-in');
  card.classList.add('slide-out');

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < QUESTIONS.length) {
      showQuestion(currentQuestion);
      isTransitioning = false;
    } else {
      showLoading();
    }
  }, 380);
}

// ============================================================
//  LOADING (분석 애니메이션)
// ============================================================
const LOADING_TEXTS = [
  'MBTI 유형 분석 중...',
  '답변 패턴 매핑 중...',
  '직무 적합도 계산 중...',
  '최적의 분야 탐색 중...',
  '분석 완료!'
];
let loadingTimer = null;

function showLoading() {
  showScreen('screen-loading');
  const el = document.getElementById('loading-text');
  let i = 0;
  el.textContent = LOADING_TEXTS[0];

  if (loadingTimer) clearInterval(loadingTimer);
  loadingTimer = setInterval(() => {
    i = Math.min(i + 1, LOADING_TEXTS.length - 1);
    el.textContent = LOADING_TEXTS[i];
    if (i >= LOADING_TEXTS.length - 1) {
      clearInterval(loadingTimer);
      loadingTimer = null;
      setTimeout(showResult, 400);
    }
  }, 500);
}

// ============================================================
//  RESULT — 개인정보 마스킹 + 분석 결과
// ============================================================
function maskName(name) {
  if (!name) return '';
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

function maskAge(age) {
  const s = String(age);
  if (s.length <= 1) return s;
  return s[0] + '*'.repeat(s.length - 1);
}

function calculateResult() {
  const mbti = userData.mbti;
  const scores = {};

  Object.keys(RESULTS).forEach(k => { scores[k] = 0; });

  for (const letter of mbti) {
    const map = MBTI_MAP[letter];
    if (!map) continue;
    for (const [key, val] of Object.entries(map)) {
      if (scores[key] !== undefined) scores[key] += val;
    }
  }

  for (let i = 0; i < answers.length; i++) {
    const qIdx = i + 1;
    const choice = answers[i];
    const qMap = ANSWER_MAP[qIdx];
    if (!qMap || !qMap[choice]) continue;
    for (const [key, val] of Object.entries(qMap[choice])) {
      if (scores[key] !== undefined) scores[key] += val;
    }
  }

  let bestKey = Object.keys(scores)[0];
  let bestVal = scores[bestKey];
  for (const [key, val] of Object.entries(scores)) {
    if (val > bestVal) { bestVal = val; bestKey = key; }
  }

  const result = JSON.parse(JSON.stringify(RESULTS[bestKey]));
  result.advice = ADVICE_POOL[Math.floor(Math.random() * ADVICE_POOL.length)];
  result.key = bestKey;
  return result;
}

// ──────────────────────────────────────────────
//  Auto-save result to server on show
// ──────────────────────────────────────────────
function saveResultToServer(result) {
  const payload = {
    name: userData.name,
    gender: userData.gender,
    age: userData.age,
    mbti: userData.mbti,
    answers: answers,
    resultKey: result.key
  };

  fetch('/api/result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(data => {
    if (data.id) resultId = data.id;
  })
  .catch(err => console.warn('Auto-save failed (server may be offline):', err));
}

function showResult() {
  showScreen('screen-result');

  const maskedName = maskName(userData.name);
  const maskedAge = maskAge(userData.age);
  document.getElementById('user-badge').innerHTML =
    '<span>' + maskedName + '</span>' +
    '<span class="sep">|</span>' +
    '<span>' + userData.gender + '</span>' +
    '<span class="sep">|</span>' +
    '<span>' + maskedAge + '세</span>' +
    '<span class="sep">|</span>' +
    '<span class="mbti-tag">' + userData.mbti + '</span>';

  const result = calculateResult();
  lastResult = result;

  let mapHtml = '';
  for (const item of INDUSTRY_MAP) {
    const hl = item.key === result.key ? ' highlight' : '';
    mapHtml += '<div class="im-item' + hl + '">' + item.name + '</div>';
  }

  document.getElementById('result-card').innerHTML =
    '<div class="result-title">' + result.title + '</div>' +
    '<div class="result-type">' + result.type + '</div>' +

    '<div class="rc-section">' +
      '<h3>📌 한 줄 요약</h3>' +
      '<p>' + result.summary + '</p>' +
    '</div>' +

    '<div class="rc-section">' +
      '<h3>🔍 상세 분석</h3>' +
      '<p>' + result.description + '</p>' +
    '</div>' +

    '<div class="rc-section">' +
      '<h3>💼 추천 직무</h3>' +
      '<ul class="job-list">' +
        result.jobs.map(j =>
          '<li><div class="job-title">' + j.title + '</div><div class="job-desc">' + j.desc + '</div></li>'
        ).join('') +
      '</ul>' +
    '</div>' +

    '<div class="rc-section">' +
      '<h3>🏭 전기·전자 산업 직무 연결 지도</h3>' +
      '<p style="font-size:0.8em;color:rgba(255,255,255,0.35);margin-bottom:10px">' +
        '개발(HW·SW·기구)부터 생산·품질·영업까지 — 당신의 자리는 여기입니다' +
      '</p>' +
      '<div class="industry-map">' + mapHtml + '</div>' +
    '</div>' +

    '<div class="rc-section">' +
      '<h3>🚀 당신을 위한 조언</h3>' +
      '<p>' + result.advice + '</p>' +
    '</div>';

  // auto-save to server
  saveResultToServer(result);
}

// ============================================================
//  PDF GENERATION — server-side via /api/result/:id/pdf
// ============================================================
function downloadPdf() {
  if (!resultId) {
    alert('결과가 아직 서버에 저장되지 않았습니다.\n잠시 후 다시 시도해주세요.');
    return;
  }

  const btn = document.querySelector('.btn-download');
  btn.disabled = true;
  btn.textContent = '⏳ 생성 중...';

  // Show generating overlay
  showScreen('screen-pdfgen');

  fetch('/api/result/' + resultId + '/pdf')
    .then(function(res) {
      if (!res.ok) return res.json().then(function(e) { throw new Error(e.error || 'PDF 생성 실패'); });
      return res.blob();
    })
    .then(function(blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'Circuit_Explorer_' + maskName(userData.name) + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 5000);

      // Return to result screen
      showScreen('screen-result');
      btn.disabled = false;
      btn.textContent = '📄 PDF 저장 완료! ✓';
      document.getElementById('pdf-hint').style.display = 'block';

      setTimeout(function() {
        btn.textContent = '📄 PDF 저장';
      }, 2000);
    })
    .catch(function(err) {
      console.error('PDF download failed:', err);
      showScreen('screen-result');
      btn.disabled = false;
      btn.textContent = '📄 PDF 저장';
      alert('PDF 생성에 실패했습니다: ' + err.message);
    });
}

// ============================================================
//  RESET
// ============================================================
function resetQuiz() {
  if (loadingTimer) { clearInterval(loadingTimer); loadingTimer = null; }
  currentQuestion = 0;
  answers = [];
  userData = {};
  resultId = null;
  lastResult = null;
  document.getElementById('input-name').value = '';
  document.getElementById('input-age').value = '';
  document.getElementById('pdf-hint').style.display = 'none';
  showScreen('screen-start');
}

// ============================================================
//  KEYBOARD SUPPORT
// ============================================================
document.addEventListener('keydown', function(e) {
  const qScreen = document.getElementById('screen-question');
  if (!qScreen.classList.contains('active')) return;
  if (e.key === '1' || e.key === 'ㄱ') selectAnswer('A');
  else if (e.key === '2' || e.key === 'ㄴ') selectAnswer('B');
  else if (e.key === 'Enter') {
    const startBtn = document.getElementById('btn-start');
    if (startBtn && document.getElementById('screen-start').classList.contains('active')) {
      startQuiz();
    }
  }
});

document.getElementById('input-age').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') startQuiz();
});
