// ============================================================
//  QUESTIONS — 누구나 공감할 수 있는 일상적인 질문
// ============================================================
const QUESTIONS = [
  {
    id: 1,
    text: "프로젝트나 일을 할 때, 당신이 더 끌리는 역할은?",
    options: {
      A: "무에서 유를 창출하며 무언가를 직접 만들고 완성하는 사람",
      B: "전체 과정이 차질 없이 정해진 시간과 규칙대로 돌아가게 만드는 사람"
    }
  },
  {
    id: 2,
    text: "문제가 터졌을 때, 당신이 더 자연스럽게 하는 행동은?",
    options: {
      A: "원인을 파악하기 위해 내부(코드·기판·구조)를 깊이 파고든다",
      B: "사람들과 소통하며 상황을 조정하고 최선의 타협점을 찾는다"
    }
  },
  {
    id: 3,
    text: "일하는 공간의 형태, 당신이 더 편한 쪽은?",
    options: {
      A: "화면 속 코드나 보이지 않는 신호·데이터를 다루는 공간",
      B: "손으로 만져지는 기판·기계·모터가 있는 물리적 현장"
    }
  },
  {
    id: 4,
    text: "일할 때 더 큰 만족감을 주는 순간은?",
    options: {
      A: "오차 없이 완벽한 규격과 높은 품질을 유지해낼 때",
      B: "남들이 생각 못 한 새 기능이나 아이디어를 빠르게 시도해볼 때"
    }
  },
  {
    id: 5,
    text: "당신의 '세심함'이 더 잘 발휘되는 분야는?",
    options: {
      A: "0.1mm 오차나 코드 한 줄의 실수도 놓치지 않는 정밀한 집중",
      B: "일정·예산·부품·팀원 협업 흐름을 놓치지 않는 운영 감각"
    }
  }
];

// ============================================================
//  MBTI → 직무 점수 기여
// ============================================================
const MBTI_MAP = {
  E: { tech_sales: 2, manufacturing: 1, quality: 0, embedded: 0, hw_design: -1, mechanical: 0, ai_signal: -1, power_energy: 0 },
  I: { tech_sales: -1, manufacturing: 0, quality: 1, embedded: 1, hw_design: 1, mechanical: 1, ai_signal: 1, power_energy: 1 },
  S: { hw_design: 1, mechanical: 1, manufacturing: 1, quality: 1, embedded: 0, power_energy: 0, ai_signal: -1, tech_sales: 0 },
  N: { ai_signal: 2, embedded: 1, tech_sales: 1, power_energy: 1, hw_design: -1, mechanical: -1, manufacturing: -1, quality: -1 },
  T: { hw_design: 1, ai_signal: 1, embedded: 1, power_energy: 1, mechanical: 0, manufacturing: 0, quality: 0, tech_sales: -1 },
  F: { tech_sales: 2, manufacturing: 1, quality: 1, embedded: 0, hw_design: -1, mechanical: 1, ai_signal: -1, power_energy: -1 },
  J: { manufacturing: 2, quality: 2, power_energy: 1, mechanical: 1, hw_design: 0, embedded: -1, ai_signal: -1, tech_sales: 0 },
  P: { embedded: 1, ai_signal: 1, hw_design: 1, tech_sales: 1, mechanical: 0, manufacturing: -1, quality: -1, power_energy: -1 }
};

// ============================================================
//  질문 답변 → 직무 점수 기여 (Q index 1-based)
// ============================================================
const ANSWER_MAP = {
  1: {
    A: { embedded: 1, hw_design: 1, mechanical: 1, ai_signal: 1, power_energy: 1, manufacturing: -1, quality: -1, tech_sales: -1 },
    B: { manufacturing: 2, quality: 2, tech_sales: 1, power_energy: 1, embedded: -1, hw_design: -1, mechanical: -1, ai_signal: -1 }
  },
  2: {
    A: { embedded: 1, hw_design: 1, mechanical: 1, ai_signal: 1, quality: 1, manufacturing: -1, tech_sales: -2, power_energy: 0 },
    B: { tech_sales: 2, manufacturing: 2, power_energy: 1, quality: 0, embedded: -1, hw_design: -1, mechanical: -1, ai_signal: -1 }
  },
  3: {
    A: { embedded: 2, ai_signal: 2, tech_sales: 0, hw_design: -1, mechanical: -2, manufacturing: -1, quality: 0, power_energy: -1 },
    B: { hw_design: 2, mechanical: 2, manufacturing: 1, power_energy: 1, quality: 1, embedded: -1, ai_signal: -2, tech_sales: 0 }
  },
  4: {
    A: { quality: 2, manufacturing: 1, power_energy: 1, hw_design: 1, mechanical: 1, ai_signal: -1, embedded: -1, tech_sales: -1 },
    B: { ai_signal: 2, embedded: 2, tech_sales: 2, hw_design: 1, mechanical: 0, manufacturing: -1, quality: -2, power_energy: 0 }
  },
  5: {
    A: { hw_design: 2, embedded: 1, ai_signal: 1, mechanical: 1, quality: 1, manufacturing: -1, power_energy: 0, tech_sales: -1 },
    B: { manufacturing: 2, tech_sales: 2, power_energy: 1, quality: 0, hw_design: -1, embedded: -1, mechanical: -1, ai_signal: -1 }
  }
};

// ============================================================
//  8개 결과 프로필
// ============================================================
const RESULTS = {
  embedded: {
    title: "임베디드 SW 개발자",
    type: "디지털 오케스트레이터",
    summary: "코드로 하드웨어에 생명을 불어넣는 당신",
    description: "논리적인 사고와 즉각적인 피드백을 선호합니다. 마이크로컨트롤러(MCU)에 펌웨어를 올리고 센서와 모터를 제어하는 임베디드 시스템 분야에서 탁월한 능력을 발휘합니다. 소프트웨어와 하드웨어의 경계를 자유롭게 넘나들며, 실제로 움직이는 결과물을 만드는 즐거움을 누릴 수 있습니다.",
    jobs: [
      { title: "펌웨어 엔지니어", desc: "MCU에 C/C++ 코드를 올려 기기를 제어합니다" },
      { title: "임베디드 리눅스 개발자", desc: "리눅스 BSP·디바이스 드라이버를 개발합니다" },
      { title: "IoT 디바이스 개발자", desc: "센서·통신 모듈을 결합한 스마트 기기 SW를 개발합니다" },
      { title: "로보틱스 제어 엔지니어", desc: "로봇의 실시간 움직임을 제어하는 SW를 개발합니다" }
    ],
    highlight: "embedded"
  },
  hw_design: {
    title: "HW 회로 설계 엔지니어",
    type: "정밀 회로 탐험가",
    summary: "미세한 전류의 흐름이 읽히는 당신",
    description: "극도로 정밀하고 물리적인 세계에 끌립니다. 반도체 내부 미세 회로부터 PCB 기판 위의 부품 배치까지, 눈에 보이지 않는 전기의 흐름을 설계하는 분야에서 재능을 발휘합니다. 이론과 실제가 만나는 지점에서 오차 없는 완벽함을 추구하는 진정한 하드웨어 장인입니다.",
    jobs: [
      { title: "디지털 회로 설계자", desc: "FPGA/ASIC 기반 디지털 회로를 설계·검증합니다" },
      { title: "PCB 아트웍 디자이너", desc: "고속·고밀도 PCB의 배치와 배선을 설계합니다" },
      { title: "전력전자 회로 설계자", desc: "전력 변환 및 구동 회로를 설계합니다" },
      { title: "RF 회로 설계자", desc: "무선 통신용 고주파 회로를 설계합니다" }
    ],
    highlight: "hw_design"
  },
  mechanical: {
    title: "기구·구조 설계 엔지니어",
    type: "입체 구조 마에스트로",
    summary: "보이지 않는 형태를 만드는 당신",
    description: "물리적인 형상과 구조에 대한 탁월한 이해도를 가지고 있습니다. 전자 제품의 외관·내부 구조·방열·방수방진까지, 제품의 물리적 완성도를 결정짓는 기구 설계 분야에서 능력을 발휘합니다. 3D CAD로 상상력을 현실로 만드는 과정에서 큰 성취감을 느낍니다.",
    jobs: [
      { title: "기구 설계 엔지니어", desc: "3D CAD로 제품 외형과 내부 구조를 설계합니다" },
      { title: "방열 설계 엔지니어", desc: "전자 부품의 열을 관리하는 구조를 설계합니다" },
      { title: "금형·사출 설계자", desc: "양산을 위한 금형·사출 구조를 설계합니다" },
      { title: "제품 디자인 엔지니어", desc: "인간공학과 미학을 고려한 제품 디자인을 개발합니다" }
    ],
    highlight: "mechanical"
  },
  manufacturing: {
    title: "생산·공정 관리자",
    type: "공장의 지휘관",
    summary: "전체 흐름을 꿰뚫는 당신",
    description: "큰 그림을 보며 전체 시스템을 효율적으로 운영하는 능력이 뛰어납니다. 개발자가 설계한 제품이 실제로 양산되기까지 전 과정을 관리·최적화하는 생산·공정 분야에 잘 맞습니다. 원자재 수급→라인 가동→출하까지 전 과정을 차질 없이 이끌어갑니다.",
    jobs: [
      { title: "생산 관리자(SCM)", desc: "부품 수급과 생산 일정을 총괄합니다" },
      { title: "공정 기술 엔지니어", desc: "생산 라인 공정을 설계·최적화합니다" },
      { title: "양산 기술 엔지니어", desc: "시제품을 양산화하는 공정을 개발합니다" },
      { title: "설비 엔지니어", desc: "생산 설비 유지보수 및 자동화를 담당합니다" }
    ],
    highlight: "manufacturing"
  },
  quality: {
    title: "품질·신뢰성 전문가",
    type: "완벽을 추구하는 감사관",
    summary: "티끌 하나 용납하지 않는 당신",
    description: "규칙과 기준을 철저히 준수하며 완벽한 결과물을 추구합니다. 전자 제품이 시장에 출시되기 전, 모든 안전 기준과 품질 요구사항을 충족하는지 검증하는 품질 보증 분야에서 꼼꼼함이 진가를 발휘합니다. 당신의 검증을 통과한 제품만이 소비자에게 안전하게 도착합니다.",
    jobs: [
      { title: "품질 보증(QA) 엔지니어", desc: "제품이 규격과 기준을 충족하는지 검증합니다" },
      { title: "신뢰성 평가 엔지니어", desc: "제품의 수명과 내구성을 테스트·분석합니다" },
      { title: "인증 엔지니어", desc: "CE·FCC·KC 등 국제 인증을 획득합니다" },
      { title: "품질 관리(QC) 엔지니어", desc: "생산 공정의 품질을 관리하고 불량을 분석합니다" }
    ],
    highlight: "quality"
  },
  tech_sales: {
    title: "기술영업·FAE",
    type: "기술과 사람을 잇는 다리",
    summary: "소통으로 기술에 가치를 더하는 당신",
    description: "기술적 이해력과 뛰어난 소통 능력을 동시에 갖추었습니다. 복잡한 기술 사양을 고객이 이해할 수 있는 언어로 풀어내고, 고객의 니즈를 개발팀에 정확히 전달하는 기술영업 분야에서 재능이 가장 빛납니다. 기술과 비즈니스의 경계에서 핵심적인 역할을 수행합니다.",
    jobs: [
      { title: "기술영업 엔지니어", desc: "고객사에 기술 솔루션을 제안하고 판매를 지원합니다" },
      { title: "FAE", desc: "고객 기술 문제를 현장에서 지원·해결합니다" },
      { title: "제품 기획자(PM)", desc: "시장 분석 기반 신제품 기획과 로드맵을 수립합니다" },
      { title: "기술지원 엔지니어", desc: "고객사의 기술 문의 대응 및 교육을 진행합니다" }
    ],
    highlight: "tech_sales"
  },
  ai_signal: {
    title: "AI·신호처리 전문가",
    type: "데이터 마법사",
    summary: "보이지 않는 패턴을 읽는 당신",
    description: "추상적인 개념과 패턴 분석에 뛰어난 재능이 있습니다. 센서 신호에서 의미 있는 정보를 추출하거나 머신러닝 알고리즘으로 지능형 시스템을 만드는 AI·신호처리 분야에서 분석적 사고력을 발휘합니다. 데이터 속에 숨겨진 비밀을 발견하는 즐거움을 누릴 수 있습니다.",
    jobs: [
      { title: "영상·신호처리 엔지니어", desc: "카메라·레이더·라이다 신호 처리 알고리즘을 개발합니다" },
      { title: "AI 머신러닝 엔지니어", desc: "온디바이스 AI 모델을 최적화·경량화합니다" },
      { title: "DSP 엔지니어", desc: "DSP를 활용한 실시간 신호처리 시스템을 개발합니다" },
      { title: "센서 퓨전 엔지니어", desc: "여러 센서 데이터를 융합해 정확한 정보를 추출합니다" }
    ],
    highlight: "ai_signal"
  },
  power_energy: {
    title: "전력·에너지 시스템 엔지니어",
    type: "에너지 거버너",
    summary: "거대한 시스템을 움직이는 당신",
    description: "거시적인 관점에서 큰 시스템을 바라보는 능력이 있습니다. 도시 전체 전력망부터 신재생 에너지 시스템, 전기차 충전 인프라까지 대규모 에너지 시스템을 설계·관리하는 분야에서 통찰력을 발휘합니다. 현대 문명의 근간을 이루는 핵심 인프라를 책임지는 보람을 느낄 수 있습니다.",
    jobs: [
      { title: "전력 시스템 엔지니어", desc: "발전소→가정까지 전력망을 설계·운영합니다" },
      { title: "신재생 에너지 엔지니어", desc: "태양광·풍력 등 신재생 에너지 시스템을 설계합니다" },
      { title: "전력전자 엔지니어", desc: "인버터·컨버터 등 전력 변환 장치를 개발합니다" },
      { title: "스마트그리드 엔지니어", desc: "지능형 전력망 관제 시스템을 구축합니다" }
    ],
    highlight: "power_energy"
  }
};

// ============================================================
//  산업 직무 연결 지도 (보드게임 전체 직군 맵)
// ============================================================
const INDUSTRY_MAP = [
  { name: "SW 개발", key: "embedded" },
  { name: "HW 설계", key: "hw_design" },
  { name: "기구 설계", key: "mechanical" },
  { name: "생산·공정", key: "manufacturing" },
  { name: "품질·인증", key: "quality" },
  { name: "기술영업·FAE", key: "tech_sales" },
  { name: "AI·신호처리", key: "ai_signal" },
  { name: "전력·에너지", key: "power_energy" },
  { name: "제품 기획", key: "" },
  { name: "구매·SCM", key: "" },
  { name: "기술 교육", key: "" },
  { name: "특허·표준", key: "" }
];

// ============================================================
//  조언 메시지 풀
// ============================================================
const ADVICE_POOL = [
  "지금이 시작하기 가장 좋은 순간입니다! 작은 키트부터 천천히 경험을 쌓아보세요.",
  "수학·이론보다 '일단 만들어보는' 경험이 더 효과적입니다. 아두이노 키트로 시작해보세요.",
  "온라인 커뮤니티와 스터디 그룹에 참여하면 동기부여를 얻을 수 있습니다.",
  "혼자 깊이 파고드는 스타일이라면, 좋은 교재 하나를 잡고 차근차근 따라가보세요.",
  "실무와 가까운 프로젝트 기반 학습이 효과적입니다. 작은 프로젝트부터 완성해보세요.",
  "당신의 강점은 꼼꼼함과 체계성입니다. 하나씩 기준을 높여가며 성장해보세요.",
  "창의적인 아이디어를 현실로 만드는 과정에서 큰 재미를 느낄 수 있습니다. 메이커 페어·해커톤에 참여해보세요.",
  "사람들과의 네트워킹이 큰 도움이 됩니다. 업계 세미나·컨퍼런스에 참석해보세요.",
  "전기·전자는 혼자가 아니라 함께 성장하는 분야입니다. 스터디 모임을 찾아보세요.",
  "처음부터 완벽할 필요 없습니다. 실패에서 배우는 것이 가장 빠른 성장의 지름길입니다."
];
