const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = 3000;
const RESULTS_DIR = path.join(__dirname, 'results');
const RESULTS_FILE = path.join(RESULTS_DIR, 'results.json');

// ensure results directory
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });
if (!fs.existsSync(RESULTS_FILE)) fs.writeFileSync(RESULTS_FILE, '[]', 'utf8');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));

// ── helpers ──

function loadResults() {
  try { return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8')); }
  catch { return []; }
}
function saveResults(r) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(r, null, 2), 'utf8');
}

function maskName(n) {
  if (!n || n.length <= 1) return n || '';
  if (n.length === 2) return n[0] + '*';
  return n[0] + '*'.repeat(n.length - 2) + n[n.length - 1];
}
function maskAge(a) {
  const s = String(a);
  return s.length <= 1 ? s : s[0] + '*'.repeat(s.length - 1);
}

const RESULT_MAP = {
  embedded: {
    title: '임베디드 SW 개발자', type: '디지털 오케스트레이터',
    summary: '코드로 하드웨어에 생명을 불어넣는 당신',
    description: '논리적인 사고와 즉각적인 피드백을 선호합니다. 마이크로컨트롤러(MCU)에 펌웨어를 올리고 센서와 모터를 제어하는 임베디드 시스템 분야에서 탁월한 능력을 발휘합니다. 소프트웨어와 하드웨어의 경계를 자유롭게 넘나들며, 실제로 움직이는 결과물을 만드는 즐거움을 누릴 수 있습니다.',
    jobs: [
      '펌웨어 엔지니어 — MCU에 C/C++ 코드를 올려 기기를 제어합니다',
      '임베디드 리눅스 개발자 — 리눅스 BSP·디바이스 드라이버를 개발합니다',
      'IoT 디바이스 개발자 — 센서·통신 모듈을 결합한 스마트 기기 SW를 개발합니다',
      '로보틱스 제어 엔지니어 — 로봇의 실시간 움직임을 제어하는 SW를 개발합니다'
    ],
    advice: '지금이 시작하기 가장 좋은 순간입니다! 작은 키트부터 천천히 경험을 쌓아보세요.'
  },
  hw_design: {
    title: 'HW 회로 설계 엔지니어', type: '정밀 회로 탐험가',
    summary: '미세한 전류의 흐름이 읽히는 당신',
    description: '극도로 정밀하고 물리적인 세계에 끌립니다. 반도체 내부 미세 회로부터 PCB 기판 위의 부품 배치까지, 눈에 보이지 않는 전기의 흐름을 설계하는 분야에서 재능을 발휘합니다. 이론과 실제가 만나는 지점에서 오차 없는 완벽함을 추구하는 진정한 하드웨어 장인입니다.',
    jobs: [
      '디지털 회로 설계자 — FPGA/ASIC 기반 디지털 회로를 설계·검증합니다',
      'PCB 아트웍 디자이너 — 고속·고밀도 PCB의 배치와 배선을 설계합니다',
      '전력전자 회로 설계자 — 전력 변환 및 구동 회로를 설계합니다',
      'RF 회로 설계자 — 무선 통신용 고주파 회로를 설계합니다'
    ],
    advice: '정밀함이 당신의 무기입니다. 처음부터 완벽하려 하기보다 하나씩 기준을 높여가며 성장해보세요.'
  },
  mechanical: {
    title: '기구·구조 설계 엔지니어', type: '입체 구조 마에스트로',
    summary: '보이지 않는 형태를 만드는 당신',
    description: '물리적인 형상과 구조에 대한 탁월한 이해도를 가지고 있습니다. 전자 제품의 외관·내부 구조·방열·방수방진까지, 제품의 물리적 완성도를 결정짓는 기구 설계 분야에서 능력을 발휘합니다. 3D CAD로 상상력을 현실로 만드는 과정에서 큰 성취감을 느낍니다.',
    jobs: [
      '기구 설계 엔지니어 — 3D CAD로 제품 외형과 내부 구조를 설계합니다',
      '방열 설계 엔지니어 — 전자 부품의 열을 관리하는 구조를 설계합니다',
      '금형·사출 설계자 — 양산을 위한 금형·사출 구조를 설계합니다',
      '제품 디자인 엔지니어 — 인간공학과 미학을 고려한 제품 디자인을 개발합니다'
    ],
    advice: '손으로 만지는 결과물에서 큰 보람을 느낄 수 있습니다. 다양한 메이커 페어에 참여해보세요.'
  },
  manufacturing: {
    title: '생산·공정 관리자', type: '공장의 지휘관',
    summary: '전체 흐름을 꿰뚫는 당신',
    description: '큰 그림을 보며 전체 시스템을 효율적으로 운영하는 능력이 뛰어납니다. 개발자가 설계한 제품이 실제로 양산되기까지 전 과정을 관리·최적화하는 생산·공정 분야에 잘 맞습니다. 원자재 수급→라인 가동→출하까지 전 과정을 차질 없이 이끌어갑니다.',
    jobs: [
      '생산 관리자(SCM) — 부품 수급과 생산 일정을 총괄합니다',
      '공정 기술 엔지니어 — 생산 라인 공정을 설계·최적화합니다',
      '양산 기술 엔지니어 — 시제품을 양산화하는 공정을 개발합니다',
      '설비 엔지니어 — 생산 설비 유지보수 및 자동화를 담당합니다'
    ],
    advice: '당신의 체계적인 운영 능력은 전기·전자 산업에서 가장 소중한 자산입니다.'
  },
  quality: {
    title: '품질·신뢰성 전문가', type: '완벽을 추구하는 감사관',
    summary: '티끌 하나 용납하지 않는 당신',
    description: '규칙과 기준을 철저히 준수하며 완벽한 결과물을 추구합니다. 전자 제품이 시장에 출시되기 전, 모든 안전 기준과 품질 요구사항을 충족하는지 검증하는 품질 보증 분야에서 꼼꼼함이 진가를 발휘합니다. 당신의 검증을 통과한 제품만이 소비자에게 안전하게 도착합니다.',
    jobs: [
      '품질 보증(QA) 엔지니어 — 제품이 규격과 기준을 충족하는지 검증합니다',
      '신뢰성 평가 엔지니어 — 제품의 수명과 내구성을 테스트·분석합니다',
      '인증 엔지니어 — CE·FCC·KC 등 국제 인증을 획득합니다',
      '품질 관리(QC) 엔지니어 — 생산 공정의 품질을 관리하고 불량을 분석합니다'
    ],
    advice: '당신의 꼼꼼함이 제품의 완성도를 결정합니다. 품질은 타협할 수 없는 가치입니다.'
  },
  tech_sales: {
    title: '기술영업·FAE', type: '기술과 사람을 잇는 다리',
    summary: '소통으로 기술에 가치를 더하는 당신',
    description: '기술적 이해력과 뛰어난 소통 능력을 동시에 갖추었습니다. 복잡한 기술 사양을 고객이 이해할 수 있는 언어로 풀어내고, 고객의 니즈를 개발팀에 정확히 전달하는 기술영업 분야에서 재능이 가장 빛납니다. 기술과 비즈니스의 경계에서 핵심적인 역할을 수행합니다.',
    jobs: [
      '기술영업 엔지니어 — 고객사에 기술 솔루션을 제안하고 판매를 지원합니다',
      'FAE — 고객 기술 문제를 현장에서 지원·해결합니다',
      '제품 기획자(PM) — 시장 분석 기반 신제품 기획과 로드맵을 수립합니다',
      '기술지원 엔지니어 — 고객사의 기술 문의 대응 및 교육을 진행합니다'
    ],
    advice: '기술과 사람을 잇는 당신의 능력은 어디서나 필요합니다. 네트워킹을 통해 인사이트를 넓혀보세요.'
  },
  ai_signal: {
    title: 'AI·신호처리 전문가', type: '데이터 마법사',
    summary: '보이지 않는 패턴을 읽는 당신',
    description: '추상적인 개념과 패턴 분석에 뛰어난 재능이 있습니다. 센서 신호에서 의미 있는 정보를 추출하거나 머신러닝 알고리즘으로 지능형 시스템을 만드는 AI·신호처리 분야에서 분석적 사고력을 발휘합니다. 데이터 속에 숨겨진 비밀을 발견하는 즐거움을 누릴 수 있습니다.',
    jobs: [
      '영상·신호처리 엔지니어 — 카메라·레이더·라이다 신호 처리 알고리즘을 개발합니다',
      'AI 머신러닝 엔지니어 — 온디바이스 AI 모델을 최적화·경량화합니다',
      'DSP 엔지니어 — DSP를 활용한 실시간 신호처리 시스템을 개발합니다',
      '센서 퓨전 엔지니어 — 여러 센서 데이터를 융합해 정확한 정보를 추출합니다'
    ],
    advice: '데이터 속에 숨겨진 패턴을 찾는 즐거움을 느껴보세요. Kaggle 같은 플랫폼에서 시작할 수 있습니다.'
  },
  power_energy: {
    title: '전력·에너지 시스템 엔지니어', type: '에너지 거버너',
    summary: '거대한 시스템을 움직이는 당신',
    description: '거시적인 관점에서 큰 시스템을 바라보는 능력이 있습니다. 도시 전체 전력망부터 신재생 에너지 시스템, 전기차 충전 인프라까지 대규모 에너지 시스템을 설계·관리하는 분야에서 통찰력을 발휘합니다. 현대 문명의 근간을 이루는 핵심 인프라를 책임지는 보람을 느낄 수 있습니다.',
    jobs: [
      '전력 시스템 엔지니어 — 발전소→가정까지 전력망을 설계·운영합니다',
      '신재생 에너지 엔지니어 — 태양광·풍력 등 신재생 에너지 시스템을 설계합니다',
      '전력전자 엔지니어 — 인버터·컨버터 등 전력 변환 장치를 개발합니다',
      '스마트그리드 엔지니어 — 지능형 전력망 관제 시스템을 구축합니다'
    ],
    advice: '거대한 시스템을 다루는 통찰력이 필요합니다. 에너지 분야는 미래가 가장 밝은 분야 중 하나입니다.'
  }
};

const INDUSTRY_ITEMS = [
  { name: 'SW 개발',          key: 'embedded' },
  { name: 'HW 설계',          key: 'hw_design' },
  { name: '기구 설계',        key: 'mechanical' },
  { name: '생산·공정',        key: 'manufacturing' },
  { name: '품질·인증',        key: 'quality' },
  { name: '기술영업·FAE',     key: 'tech_sales' },
  { name: 'AI·신호처리',      key: 'ai_signal' },
  { name: '전력·에너지',      key: 'power_energy' },
  { name: '제품 기획',        key: '' },
  { name: '구매·SCM',         key: '' },
  { name: '기술 교육',        key: '' },
  { name: '특허·표준',        key: '' }
];

// ── Korean font registration ──
const KOR_FONTS = [
  'C:\\Windows\\Fonts\\malgun.ttf',
  'C:\\Windows\\Fonts\\NanumGothic.ttf',
  'C:\\Windows\\Fonts\\gulim.ttc'
];
let korFontPath = null;
for (const f of KOR_FONTS) {
  if (fs.existsSync(f)) { korFontPath = f; break; }
}

// ── PDF generation ──
const A4_W = 595.28;
const A4_H = 841.89;

function buildPdf(doc, entry, profile) {
  const M = 44;
  const CX = A4_W / 2;
  const clr = { primary: '#0077cc', text: '#222', muted: '#888', line: '#ddd' };

  const boldFont = korFontPath ? 'KorBold' : 'Helvetica-Bold';
  const normFont = korFontPath ? 'KorNorm' : 'Helvetica';

  if (korFontPath) {
    try { doc.registerFont('KorBold', korFontPath); doc.registerFont('KorNorm', korFontPath); }
    catch (e) { console.error('Font registration failed:', e.message); }
  }

  function centerText(txt, y, size, col) {
    doc.font(boldFont).fontSize(size).fillColor(col || clr.primary);
    doc.text(txt, CX, y, { align: 'center' });
  }
  function line(y) {
    doc.moveTo(M, y).lineTo(A4_W - M, y).strokeColor(clr.line).stroke();
  }
  function sectionHdr(txt, y) {
    doc.font(boldFont).fontSize(15).fillColor('#000');
    doc.text(txt, M, y);
    return y + 24;
  }
  function bodyText(txt, y, indent) {
    doc.font(normFont).fontSize(10).fillColor(clr.text);
    doc.text(txt, M + (indent || 0), y, { width: A4_W - M * 2 - (indent || 0), align: 'justify' });
  }

  // ── Header ──
  centerText('Circuit Explorer', 50, 22);
  doc.font(normFont).fontSize(12).fillColor(clr.muted);
  doc.text('전기·전자 성향 분석 리포트', CX, 76, { align: 'center' });
  line(96);

  // ── User info ──
  let y = 114;
  doc.fontSize(10).fillColor(clr.text);
  const info = [
    ['이름', maskName(entry.name)],
    ['성별', entry.gender],
    ['나이', maskAge(entry.age) + '세'],
    ['MBTI', entry.mbti],
    ['분석일', new Date(entry.timestamp).toLocaleDateString('ko-KR')]
  ];
  for (const [k, v] of info) {
    doc.font(boldFont).text(k + ': ', M, y, { continued: true });
    doc.font(normFont).text(v);
    y += 18;
  }

  line(y + 4);
  y += 24;

  // ── Analysis result header ──
  y = sectionHdr('■ 분석 결과', y);

  doc.fontSize(13).fillColor(clr.primary);
  doc.font(boldFont).text('추천 분야', M + 4, y, { continued: true });
  doc.font(normFont).text('  ' + profile.title);
  y += 22;

  doc.fontSize(10).fillColor(clr.text);
  doc.font(boldFont).text('성향 유형', M + 4, y, { continued: true });
  doc.font(normFont).text('  ' + (profile.type || ''));
  y += 18;

  doc.font(boldFont).text('한 줄 요약', M + 4, y, { continued: true });
  doc.font(normFont).text('  ' + (profile.summary || ''));
  y += 24;

  // ── Detailed description ──
  y = sectionHdr('■ 상세 분석', y);

  // Check if we need a new page for description
  if (y > A4_H - 160) { doc.addPage(); y = M + 10; }
  doc.font(normFont).fontSize(10).fillColor(clr.text);
  doc.text(profile.description || '', M, y, { width: A4_W - M * 2, align: 'justify' });
  y = doc.y + 14;

  // ── Recommended jobs ──
  if (y > A4_H - 200) { doc.addPage(); y = M + 10; }
  y = sectionHdr('■ 추천 직무', y);

  doc.fontSize(9).fillColor(clr.muted);
  doc.text('전기·전자 산업에서 당신의 성향과 잘 맞는 직무들입니다.', M, y);
  y = doc.y + 10;

  if (profile.jobs) {
    for (const j of profile.jobs) {
      if (y > A4_H - 50) { doc.addPage(); y = M + 10; }
      doc.roundedRect(M, y, A4_W - M * 2, 24, 4).fillOpacity(0.04).fillColor('#0077cc').fill().fillOpacity(1);
      doc.fillColor('#0077cc').font(boldFont).fontSize(10);
      doc.text(j.split('—')[0].trim(), M + 6, y + 4);
      if (j.indexOf('—') > 0) {
        doc.fillColor(clr.muted).font(normFont).fontSize(8);
        doc.text(j.split('—')[1].trim(), M + 6, y + 14);
      }
      y += 28;
    }
  }
  y += 6;

  // ── Industry map ──
  if (y > A4_H - 180) { doc.addPage(); y = M + 10; }
  y = sectionHdr('■ 전기·전자 산업 직무 연결 지도', y);

  doc.fontSize(9).fillColor(clr.muted);
  doc.text('개발(HW·SW·기구)부터 생산·품질·영업까지 — 당신의 자리는 여기입니다', M, y);
  y = doc.y + 12;

  // Draw 4x3 grid
  const gridCols = 3;
  const gridRows = 4;
  const cellW = (A4_W - M * 2) / gridCols;
  const cellH = 22;
  const gap = 4;

  for (let i = 0; i < INDUSTRY_ITEMS.length; i++) {
    const row = Math.floor(i / gridCols);
    const col = i % gridCols;
    const cx = M + col * cellW;
    const cy = y + row * (cellH + gap);

    const isHighlight = INDUSTRY_ITEMS[i].key === entry.resultKey;

    if (isHighlight) {
      doc.roundedRect(cx, cy, cellW - gap, cellH, 4).fillOpacity(0.1).fillColor('#0077cc').fill().fillOpacity(1);
    }
    doc.fillColor(isHighlight ? '#0077cc' : '#666');
    doc.font(isHighlight ? boldFont : normFont).fontSize(9);
    doc.text(INDUSTRY_ITEMS[i].name, cx + 4, cy + 5, { width: cellW - gap - 8, align: 'center' });
  }

  y += gridRows * (cellH + gap) + 16;

  // ── Advice ──
  if (y > A4_H - 80) { doc.addPage(); y = M + 10; }
  y = sectionHdr('■ 당신을 위한 조언', y);

  doc.fillColor(clr.text).font(normFont).fontSize(10);
  doc.text(profile.advice || '지금이 바로 시작하기 좋은 순간입니다!', M, y, { width: A4_W - M * 2 });

  y = doc.y + 20;

  // ── Footer ──
  if (y < A4_H - 60) y = A4_H - 60;
  line(y);
  y += 10;
  doc.font(normFont).fontSize(8).fillColor(clr.muted);
  doc.text('본 리포트는 MBTI와 5가지 성향 질문을 기반으로 생성되었습니다.', CX, y, { align: 'center' });
  doc.text('Circuit Explorer  |  ' + new Date().toISOString().slice(0, 10), CX, y + 12, { align: 'center' });
}

// ── API ──

// POST /api/result  — save result data
app.post('/api/result', (req, res) => {
  const { name, gender, age, mbti, answers, resultKey } = req.body;
  if (!name || !mbti || !resultKey) return res.status(400).json({ error: 'Missing fields' });

  const id = crypto.randomUUID();
  const entry = {
    id, name, gender, age: Number(age), mbti, answers, resultKey,
    timestamp: new Date().toISOString(),
    hasPdf: false
  };

  const results = loadResults();
  results.push(entry);
  saveResults(results);
  res.json({ id, success: true });
});

// GET /api/results  — list all (admin, masked)
app.get('/api/results', (req, res) => {
  const results = loadResults();
  const safe = results.map(r => ({
    ...r,
    nameMasked: maskName(r.name),
    ageMasked: maskAge(r.age),
    profile: RESULT_MAP[r.resultKey] || null
  }));
  res.json(safe);
});

// GET /api/result/:id  — single result
app.get('/api/result/:id', (req, res) => {
  const results = loadResults();
  const entry = results.find(r => r.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json(entry);
});

// GET /api/result/:id/pdf  — download PDF (generate + save to disk, or serve cached)
app.get('/api/result/:id/pdf', (req, res) => {
  const pdfPath = path.join(RESULTS_DIR, req.params.id + '.pdf');

  // Serve cached PDF if exists
  if (fs.existsSync(pdfPath)) {
    return res.download(pdfPath, 'Circuit_Explorer_' + req.params.id.slice(0, 8) + '.pdf');
  }

  // Load data
  const results = loadResults();
  const entry = results.find(r => r.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Result not found' });

  const profile = RESULT_MAP[entry.resultKey];
  if (!profile) return res.status(500).json({ error: 'Unknown result type' });

  // Generate PDF into buffer
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 44, bufferPages: false });
    const chunks = [];

    doc.on('data', c => chunks.push(c));
    doc.on('end', () => {
      const pdfBuf = Buffer.concat(chunks);

      // Save to disk
      fs.writeFileSync(pdfPath, pdfBuf);

      // Update hasPdf flag
      const r2 = loadResults();
      const idx = r2.findIndex(r => r.id === req.params.id);
      if (idx !== -1) { r2[idx].hasPdf = true; saveResults(r2); }

      // Send response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition',
        'attachment; filename="Circuit_Explorer_' + entry.id.slice(0, 8) + '.pdf"');
      res.send(pdfBuf);
    });

    buildPdf(doc, entry, profile);
    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'PDF generation failed: ' + err.message });
  }
});

// DELETE /api/result/:id  — admin delete
app.delete('/api/result/:id', (req, res) => {
  let results = loadResults();
  const idx = results.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const pdfPath = path.join(RESULTS_DIR, req.params.id + '.pdf');
  if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

  results.splice(idx, 1);
  saveResults(results);
  res.json({ success: true });
});

// GET /admin  — admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ── start ──
app.listen(PORT, () => {
  console.log('⚡ Circuit Explorer running at http://localhost:' + PORT);
  console.log('🔧 Admin panel at http://localhost:' + PORT + '/admin');
  if (korFontPath) {
    console.log('✓ Korean font loaded: ' + path.basename(korFontPath));
  } else {
    console.warn('⚠ No Korean font found — PDF may not render Korean text');
  }
});
