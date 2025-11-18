# YouTine 🏋️‍♀️

> **혼자 운동하는 갓생러들을 위한 AI 기반 융합 헬스케어 서비스**

[![2025 새싹 해커톤](https://img.shields.io/badge/2025-새싹%20해커톤-brightgreen)]()
[![React](https://img.shields.io/badge/React-19.1.0-blue)]()
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4--mini-orange)]()
[![OpenCV](https://img.shields.io/badge/OpenCV-Motion%20Tracking-red)]()

**팀명**: 잭과 콩이담
**팀원**: 강이담, 이재휘

---

## 📺 데모 영상

> 🎬 *데모 영상은 준비 중입니다. [DEMO_GUIDE.md](./DEMO_GUIDE.md)를 참고하여 촬영 가이드를 확인하세요.*

---

## 🎯 프로젝트 소개

**YouTine**은 유튜브로 운동하는 모든 사람이 겪는 **'탐색의 번거로움'**, **'자세의 부정확성'**, **'동기부여 부족'** 이라는 3대 문제를 한 번에 해결하는 AI 기반 융합 헬스케어 서비스입니다.

### 💡 핵심 가치

"유튜브 영상을 보며 운동하는 것은 좋지만, 매번 영상을 찾아 헤매고, 자세가 정확한지 확인할 수 없으며, 혼자 운동하다 보면 지루해서 중간에 포기하게 됩니다."

→ **YouTine은 AI 기술로 이 모든 문제를 해결합니다.**

---

## 🚀 3대 핵심 기능

### 1️⃣ AI 루틴 플래너 (What to do)

**"30분 하체, 유산소"** 같은 간단한 요청만으로 AI가 자동으로 최적의 운동 루틴을 생성합니다.

- 📹 **유튜브 영상 자동 분석**: 사용자가 추가한 유튜브 영상의 자막을 OpenAI GPT-4-mini로 분석
- ✂️ **스마트 구간 분할**: 긴 영상을 운동 동작 단위로 자동 분할 (예: 스쿼트 구간만 추출)
- 🎯 **맞춤형 루틴 조합**: 목표, 시간, 숙련도에 맞는 운동 영상을 자동으로 조합
- 🔄 **끊김 없는 재생**: 여러 영상의 구간들을 하나의 루틴으로 연속 재생

**기술 구현**: OpenAI API, YouTube Transcript API, MongoDB 기반 세그먼트 관리

### 2️⃣ AI 모션 코칭 (How to do)

**실시간 자세 교정**으로 부상을 방지하고 운동 효과를 극대화합니다.

- 📷 **실시간 포즈 트래킹**: MediaPipe + OpenCV로 33개 신체 랜드마크 감지
- ⚠️ **즉각적인 피드백**: "허리가 굽었어요", "무릎이 발끝보다 나왔어요" 등 음성/시각 알림
- 📊 **자세 정확도 점수**: 운동 종료 후 자세 정확도 리포트 제공
- 🎯 **13가지 운동 지원**: 스쿼트, 푸쉬업, 런지, 플랭크, 점핑잭 등

**기술 구현**: Python + MediaPipe Pose + OpenCV (프로토타입 완성)

### 3️⃣ AI 보이스 파트너 (Motivation)

**1:1 트레이너처럼** 숫자를 세어주고 응원하며 강력한 동기를 부여합니다.

- 🗣️ **다양한 AI 보이스**: '최애 아이돌', '열정 트레이너', '화난 할머니' 등 선택 가능
- 🔢 **자동 카운팅**: 운동 동작에 맞춰 "하나, 둘" 숫자를 세어줌
- 💪 **동기부여 멘트**: "하나만 더!", "거의 다 왔습니다!" 등 실시간 응원
- 🎮 **게임화 요소**: 스트릭, 챌린지, 리포트로 지속적인 운동 습관 형성

**기술 구현**: TTS(Text-to-Speech) API 연동 예정

---

## 📊 문제 정의 & 배경

### 실제 사용자 불편 사례

**설문조사 결과** (홈트 이용자 100명 대상)

- 78% - **동기부여 부족** 문제 호소
- 65% - **루틴 구성의 어려움** 경험
- 52% - **부정확한 자세로 인한 부상 우려**

### 우리 팀의 경험

- **초급자 사례 (강이담)**: 수많은 영상 중 자신에게 맞는 영상을 찾고 조합하는 데 많은 시간 소모. 메모장이나 카카오톡에 링크를 저장하지만 가용성 부족.
- **숙련자 사례 (이재휘)**: 5년 차 헬스 유저도 매번 같은 루틴에 지루함을 느낌. 혼자 운동할 때 'Gym Bro(운동 파트너)'가 없어 동기부여 급감.

→ **YouTine은 이러한 실제 문제를 해결하기 위해 탄생했습니다.**

---

## 🛠️ 기술 스택

### Frontend
- **React 19.1.0** + Vite 6.3.5
- **Tailwind CSS 4.1.7** - 모던 UI 스타일링
- **React Router DOM 7.6.1** - 페이지 라우팅
- **React Player** - 유튜브 영상 재생
- **Framer Motion** - 부드러운 애니메이션
- **Recharts** - 운동 통계 시각화
- **i18n** - 한국어/영어 지원

### Backend
- **Node.js** + Express 5.1.0
- **MongoDB** + Mongoose 8.19.1
- **OpenAI API** (GPT-4-mini) - 운동 영상 자막 분석
- **YouTube Transcript API** - 자막 추출
- **YTDL Core** - 유튜브 메타데이터 수집

### AI/ML
- **OpenAI GPT-4-mini** - 자연어 처리 및 운동 구간 분석
- **MediaPipe Pose** - 실시간 포즈 추정 (33개 랜드마크)
- **OpenCV (cv2)** - 영상 처리 및 시각화
- **NumPy** - 각도 계산 및 수치 처리

### Development Tools
- **pnpm** - 빠른 패키지 관리
- **Vitest** - 유닛 테스트
- **ESLint** + Prettier - 코드 품질 관리

---

## 📁 프로젝트 구조

```
youtine-sesac-hackathon-2025/
├── web-app/                    # 메인 웹 애플리케이션
│   ├── client/                 # React 프론트엔드
│   │   ├── src/
│   │   │   ├── components/     # UI 컴포넌트 (19개)
│   │   │   ├── services/       # API 클라이언트
│   │   │   ├── i18n/           # 다국어 지원
│   │   │   └── ...
│   │   └── package.json
│   └── server/                 # Express 백엔드
│       ├── models/             # MongoDB 스키마 (5개)
│       ├── routes/             # API 라우트 (6개)
│       ├── services/           # AI 분석 서비스
│       └── server.js
├── prototypes/                 # AI 모션 코칭 프로토타입
│   └── python-squat-counter/   # OpenCV 기반 포즈 트래킹
│       ├── src/
│       │   ├── core/           # MediaPipe 포즈 감지
│       │   ├── exercises/      # 운동별 카운터
│       │   └── utils/
│       └── tests/              # 13가지 운동 테스트
└── docs/                       # 프로젝트 문서
    ├── ARCHITECTURE.md         # 시스템 아키텍처
    ├── DATABASE_SCHEMA.md      # DB 스키마 상세
    └── API_DOCUMENTATION.md    # API 문서
```

---

## ⚙️ 설치 및 실행 방법

### 사전 요구사항

- **Node.js** 18.x 이상
- **MongoDB** (로컬 또는 MongoDB Atlas)
- **Python 3.8+** (모션 코칭 프로토타입용)
- **OpenAI API Key** (필수)
- **pnpm** (권장)

### 1️⃣ 레포지토리 클론

```bash
git clone https://github.com/your-username/youtine-sesac-hackathon-2025.git
cd youtine-sesac-hackathon-2025
```

### 2️⃣ 백엔드 설정

```bash
cd web-app/server
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 MongoDB URI와 OpenAI API 키 입력

# 서버 실행
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 3️⃣ 프론트엔드 설정

```bash
cd web-app/client
pnpm install

# 개발 서버 실행
pnpm dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

### 4️⃣ Python 모션 코칭 프로토타입 (선택사항)

```bash
cd prototypes/python-squat-counter

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install opencv-python mediapipe numpy

# 스쿼트 테스트 실행
python tests/test_squat.py
```

### 환경 변수 설정

`web-app/server/.env` 파일 예시:

```bash
MONGODB_URI=mongodb://localhost:27017/fittrack
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=3000
NODE_ENV=development
```

---

## 🎮 사용 방법

### 1. 유튜브 영상 추가

1. "Videos" 탭으로 이동
2. 유튜브 URL 입력 (예: `https://www.youtube.com/watch?v=...`)
3. AI가 자동으로 영상을 분석하여 운동 구간을 추출

### 2. 운동 루틴 생성

1. "Segments" 탭에서 추출된 운동 구간 확인
2. 원하는 구간을 선택하여 루틴에 추가
3. 드래그 앤 드롭으로 순서 변경

### 3. 운동 시작

1. 생성한 루틴 선택
2. "Play Routine" 버튼 클릭
3. SmartPlayer가 모든 구간을 끊김 없이 연속 재생

### 4. 운동 기록 확인

1. "Dashboard" 탭에서 통계 확인
2. 월별 캘린더에서 운동 이력 조회
3. 운동 일지 작성 및 관리

---

## 🎯 주요 화면

### Segment Library (운동 구간 라이브러리)
- AI가 분석한 운동 구간들을 카드 형태로 표시
- 근육 그룹별 필터링 (하체, 상체, 코어 등)
- 검색 기능으로 원하는 운동 빠르게 찾기

### Smart Player (스마트 플레이어)
- 여러 영상의 구간들을 하나의 루틴으로 재생
- 현재 구간 진행률 및 전체 루틴 진행률 표시
- 자동 전환으로 끊김 없는 운동 경험

### Dashboard (대시보드)
- 이번 달 운동 횟수, 현재 스트릭
- 총 세트 수, 총 반복 횟수
- 자주 하는 운동 TOP 5
- 월별 캘린더 뷰

### Motion Coaching Prototype (프로토타입)
- 실시간 포즈 스켈레톤 오버레이
- 관절 각도 주석
- 반복 횟수 카운터
- 자세 피드백 ("Fix Form", "Up", "Down")

---

## 📈 기대 효과

### 사회적 효과
- ✅ 고가의 오프라인 PT 비용 부담 감소
- ✅ 실시간 자세 교정으로 부상 위험 감소 → 국민 건강 증진 및 의료비 절감
- ✅ 게임화(Gamification) 요소로 지속적인 운동 습관 형성

### 경제적 효과
- ✅ 디지털 헬스케어 시장의 질적 성장 견인
- ✅ 유튜브 크리에이터와 상생하는 새로운 콘텐츠 유통 모델

### 기술적 확장 가능성
- ✅ **AR 스마트 글래스 연동**: 향후 AR 글래스 상용화 시, 몰입형 운동 경험 제공
- ✅ **웨어러블 디바이스 연동**: 스마트워치와 연동하여 심박수, 칼로리 소모 등 실시간 측정
- ✅ **소셜 기능 확장**: 친구와 함께하는 챌린지, 리더보드, 운동 기록 공유

---

## 🏆 2025 새싹 해커톤 관련 정보

### MVP(Minimum Viable Product) 구현 현황

- ✅ **웹 애플리케이션**: 완전히 작동하는 풀스택 앱 (React + Express + MongoDB)
- ✅ **AI 루틴 플래너**: OpenAI API를 활용한 영상 분석 및 구간 추출 (완료)
- ✅ **AI 모션 코칭**: Python + OpenCV + MediaPipe 프로토타입 (완료)
- 🔄 **AI 보이스 파트너**: TTS 연동 예정 (구현 중)

### 예선 평가 포인트

- **개발 현황 확인**: 실제 작동하는 코드와 프로토타입 제공
- **기술 혁신성**: AI(LLM + CV)를 활용한 차별화된 솔루션
- **확장 가능성**: 모듈화된 구조로 기능 추가 용이
- **문서화**: 상세한 README, 아키텍처 문서, API 문서 포함

### 본선 시연 계획

1. **웹 앱 시연**: 유튜브 영상 추가 → AI 분석 → 루틴 생성 → 재생
2. **모션 코칭 시연**: Python 프로토타입으로 실시간 자세 교정 시연
3. **통계 대시보드**: 운동 기록 및 분석 기능 시연

---

## 📚 추가 문서

- [아키텍처 문서](./docs/ARCHITECTURE.md) - 시스템 구조 및 데이터 흐름
- [데이터베이스 스키마](./docs/DATABASE_SCHEMA.md) - MongoDB 컬렉션 상세 설명
- [API 문서](./docs/API_DOCUMENTATION.md) - REST API 엔드포인트 가이드
- [데모 가이드](./DEMO_GUIDE.md) - 데모 영상 촬영 가이드

---

## 🔮 향후 계획

- [ ] AI 보이스 파트너 완성 (TTS 연동)
- [ ] Python 모션 코칭을 웹 앱에 통합 (WebRTC 또는 WebSocket)
- [ ] 소셜 기능 추가 (친구 초대, 챌린지, 리더보드)
- [ ] 모바일 앱 개발 (React Native)
- [ ] 웨어러블 디바이스 연동 (심박수, 칼로리)
- [ ] AR 스마트 글래스 프로토타입

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

---

## 👥 팀 소개

**잭과 콩이담**

- **강이담**: 기획 및 프론트엔드 개발
- **이재휘**: 백엔드 및 AI 개발

---

## 📞 문의

프로젝트에 대한 문의사항이나 피드백은 GitHub Issues를 통해 남겨주세요.

---

**Made with 💪 by 잭과 콩이담 for 2025 새싹 해커톤**
