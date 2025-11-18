# YouTine 데모 영상/GIF 촬영 가이드

> 해커톤 제출 및 프로젝트 홍보를 위한 데모 자료 제작 가이드입니다.

---

## 🎯 목표

1. **README에 삽입할 GIF**: 각 핵심 기능을 보여주는 짧은 GIF (10-15초)
2. **YouTube 데모 영상**: 전체 시연 영상 (2-3분)
3. **스크린샷**: 주요 화면 캡처

---

## 📹 추천 도구

### macOS
- **QuickTime Player** (무료) - 화면 녹화
  - `파일` → `새로운 화면 기록`
  - 단축키: `Cmd + Shift + 5`
- **ScreenToGif** (무료) - GIF 변환
  - 다운로드: https://www.screentogif.com

### Windows
- **OBS Studio** (무료) - 화면 녹화
  - 다운로드: https://obsproject.com
- **ScreenToGif** (무료) - GIF 변환

### 온라인 도구
- **Ezgif** (https://ezgif.com) - 동영상 → GIF 변환
- **CloudConvert** (https://cloudconvert.com) - 파일 변환

---

## 🎬 시나리오 1: AI 루틴 플래너 (30초)

### 목적
사용자가 YouTube URL을 입력하면 AI가 자동으로 운동 구간을 추출하는 과정을 시연

### 단계별 촬영 가이드

1. **시작 화면** (2초)
   - "Videos" 탭 화면
   - 빈 라이브러리 또는 기존 영상 2-3개

2. **YouTube URL 입력** (5초)
   - URL 입력 필드에 유튜브 링크 붙여넣기
   - 예시: `https://www.youtube.com/watch?v=...`
   - "Add Video" 버튼 클릭

3. **AI 분석 중** (3초)
   - 영상 카드에 "Processing..." 상태 표시
   - 로딩 스피너 보이기

4. **분석 완료** (5초)
   - 상태가 "Completed"로 변경
   - "View Segments" 버튼 클릭

5. **세그먼트 확인** (10초)
   - "Segments" 탭으로 자동 이동
   - AI가 추출한 운동 구간들이 카드 형태로 표시
   - 스쿼트, 런지 등 운동명과 시간 표시
   - 마우스 호버로 세부 정보 확인

6. **종료** (5초)
   - 여러 세그먼트 카드를 스크롤하며 보여주기

### 촬영 팁
- 네트워크 속도가 느릴 경우 이미 분석된 영상으로 재촬영
- 긴 분석 시간은 편집으로 빠르게 처리 (타임랩스 효과)

---

## 🎬 시나리오 2: 루틴 생성 및 SmartPlayer (40초)

### 목적
여러 영상의 구간들을 조합하여 맞춤형 루틴을 만들고 끊김 없이 재생하는 과정

### 단계별 촬영 가이드

1. **세그먼트 선택** (10초)
   - "Segments" 탭에서 운동 구간 선택
   - "Squat" 세그먼트의 "Add to Routine" 버튼 클릭
   - "Lunge" 세그먼트도 추가
   - "Calf Raise" 세그먼트도 추가

2. **루틴 생성** (8초)
   - 사이드바에 "New Routine" 버튼 클릭
   - 루틴 이름 입력: "30분 하체 집중 루틴"
   - 설명 입력 (선택사항)
   - "Create" 버튼 클릭

3. **루틴 편집** (7초)
   - 생성된 루틴 클릭
   - 드래그 앤 드롭으로 세그먼트 순서 변경
   - 불필요한 세그먼트 제거 (X 버튼)

4. **SmartPlayer 재생** (15초)
   - "Play Routine" 버튼 클릭
   - SmartPlayer 모달 열림
   - 첫 번째 세그먼트 자동 재생 시작
   - 진행 바 표시 (개별 세그먼트 + 전체 루틴)
   - 세그먼트 자동 전환 (Squat → Lunge)
   - 끊김 없는 재생 강조

### 촬영 팁
- 재생 시간을 단축하려면 짧은 세그먼트(10-15초)로 테스트
- 화면 하단의 진행 바와 세그먼트 카운터를 명확히 보여주기

---

## 🎬 시나리오 3: 대시보드 및 통계 (20초)

### 목적
운동 기록 관리 및 통계 시각화 기능 시연

### 단계별 촬영 가이드

1. **대시보드 접근** (3초)
   - "Dashboard" 탭 클릭

2. **통계 카드** (7초)
   - "Workouts This Month" 카드 (15회)
   - "Current Streak" 카드 (5일 연속)
   - "Total Sets" 카드 (120세트)
   - "Total Reps" 카드 (1,440회)

3. **자주 하는 운동 차트** (5초)
   - TOP 5 운동 막대 차트 보여주기
   - 마우스 호버로 세부 정보 표시

4. **캘린더 뷰** (5초)
   - 월별 캘린더 스크롤
   - 운동한 날짜에 표시된 점/색상 강조
   - 특정 날짜 클릭하여 상세 기록 확인

### 촬영 팁
- 테스트 데이터가 부족할 경우 MongoDB에 샘플 데이터 삽입
- 차트 애니메이션이 완료될 때까지 대기

---

## 🎬 시나리오 4: Python 모션 코칭 프로토타입 (30초)

### 목적
실시간 자세 교정 기능 시연 (OpenCV + MediaPipe)

### 단계별 촬영 가이드

1. **프로그램 실행** (5초)
   - 터미널에서 `python tests/test_squat.py` 실행
   - 웹캠 화면 표시

2. **포즈 감지** (10초)
   - 화면에 본인 모습 표시
   - MediaPipe가 33개 랜드마크를 실시간으로 감지
   - 신체 스켈레톤 오버레이 표시
   - 주요 관절(무릎, 골반, 발목) 각도 주석

3. **스쿼트 동작** (10초)
   - 스쿼트 1회 수행
   - 자세가 올바를 때: "Good Form" 표시
   - 자세가 틀릴 때: "Fix Form" 경고 + "무릎이 발끝보다 나왔어요" 피드백
   - 카운터가 1 증가하는 모습

4. **진행 바 및 피드백** (5초)
   - 화면 왼쪽 진행 바 (0-100%)
   - "Up", "Down" 상태 전환 보여주기
   - 최종 카운트 표시

### 촬영 팁
- 조명이 밝은 곳에서 촬영 (얼굴 인식률 향상)
- 카메라와 1.5-2m 거리 유지
- 전신이 프레임 안에 들어오도록 각도 조정
- 의도적으로 잘못된 자세를 취하여 피드백 발생 시연

---

## 📸 스크린샷 촬영 가이드

### 필수 스크린샷 (5장)

1. **메인 화면 - Segment Library**
   - URL: `http://localhost:5173`
   - 세그먼트 카드들이 그리드로 표시된 화면
   - 검색 바 및 필터 드롭다운 포함

2. **SmartPlayer 화면**
   - 루틴 재생 중 모달 화면
   - YouTube 영상 + 진행 바 + 세그먼트 리스트

3. **대시보드 화면**
   - 통계 카드 4개
   - TOP 5 운동 차트
   - 캘린더 뷰

4. **루틴 편집 화면**
   - 드래그 앤 드롭 인터페이스
   - 세그먼트 리스트

5. **Python 프로토타입 화면**
   - 실시간 포즈 트래킹 화면
   - 스켈레톤 오버레이 + 각도 주석

### 스크린샷 촬영 방법

**macOS**:
```bash
# 전체 화면
Cmd + Shift + 3

# 선택 영역
Cmd + Shift + 4

# 특정 창
Cmd + Shift + 4 + Space
```

**Windows**:
```
# Snipping Tool 사용
Win + Shift + S
```

---

## 🎥 전체 데모 영상 시나리오 (2-3분)

### 구성

1. **인트로** (10초)
   - YouTine 로고 화면
   - 자막: "AI 기반 융합 헬스케어 서비스 YouTine"

2. **문제 제기** (20초)
   - 자막: "유튜브 운동, 이런 불편함 느껴보셨나요?"
   - 화면: 여러 탭에 흩어진 유튜브 영상 링크
   - 자막: "매번 영상 찾기 번거롭고..."
   - 화면: 잘못된 자세로 운동하는 모습 (스톡 이미지)
   - 자막: "자세가 정확한지 확인할 수 없고..."
   - 자막: "혼자 운동하면 지루해서 포기하게 됩니다"

3. **솔루션 소개** (10초)
   - 자막: "YouTine이 해결합니다"
   - 화면: YouTine 메인 화면

4. **기능 1: AI 루틴 플래너** (30초)
   - 시나리오 1 실행

5. **기능 2: SmartPlayer** (40초)
   - 시나리오 2 실행

6. **기능 3: 통계 & 대시보드** (20초)
   - 시나리오 3 실행

7. **기능 4: AI 모션 코칭** (30초)
   - 시나리오 4 실행

8. **엔딩** (20초)
   - 자막: "YouTine과 함께 스마트한 홈트레이닝을 시작하세요"
   - GitHub URL 표시
   - 팀명 & 팀원 표시

### 편집 팁
- **배경 음악**: 밝고 활기찬 BGM (저작권 무료)
- **자막**: 한국어 + 영어 (국제 심사위원 대비)
- **전환 효과**: 간결하고 빠르게 (Fade, Cut)
- **속도 조절**: 느린 부분은 2x 속도로 편집

---

## 🎨 GIF 제작 가이드

### GIF로 만들 장면

1. **AI 분석 과정** (10초)
   - URL 입력 → Processing → Completed

2. **세그먼트 추가** (10초)
   - "Add to Routine" 버튼 클릭 애니메이션

3. **SmartPlayer 자동 전환** (15초)
   - 세그먼트 1 → 세그먼트 2 자동 전환

4. **포즈 트래킹** (10초)
   - 스쿼트 동작 + 카운터 증가

### GIF 최적화

```bash
# ScreenToGif 설정
- Frame Rate: 15 FPS (부드럽게)
- 해상도: 1280x720 (README용)
- 압축: Medium (파일 크기 3-5MB 이하)

# Ezgif 온라인 최적화
1. Upload video
2. Convert to GIF
3. Optimize GIF (Compression level: 50)
4. Download
```

### README에 삽입

```markdown
## 🎯 주요 기능

### 1. AI 루틴 플래너

![AI Analysis Demo](./demos/ai-analysis.gif)

### 2. SmartPlayer

![SmartPlayer Demo](./demos/smartplayer.gif)
```

---

## 📁 파일 구조 제안

```
youtine-sesac-hackathon-2025/
├── demos/                      # 데모 자료 폴더 (Git LFS 권장)
│   ├── ai-analysis.gif         # AI 분석 GIF
│   ├── smartplayer.gif         # SmartPlayer GIF
│   ├── dashboard.gif           # 대시보드 GIF
│   ├── motion-coaching.gif     # 포즈 트래킹 GIF
│   ├── screenshots/
│   │   ├── 01-segment-library.png
│   │   ├── 02-smartplayer.png
│   │   ├── 03-dashboard.png
│   │   ├── 04-routine-editor.png
│   │   └── 05-motion-tracking.png
│   └── full-demo.mp4           # 전체 데모 영상 (YouTube 업로드용)
└── README.md
```

---

## ✅ 체크리스트

데모 자료 제작 전 확인 사항:

- [ ] MongoDB 실행 중
- [ ] OpenAI API 키 설정됨
- [ ] 서버 실행 중 (`npm run dev`)
- [ ] 프론트엔드 실행 중 (`pnpm dev`)
- [ ] 테스트 데이터 준비 (영상 2-3개, 루틴 1-2개)
- [ ] Python 환경 설정 완료 (cv2, mediapipe 설치)
- [ ] 웹캠 테스트 완료
- [ ] 녹화 도구 설치 완료

---

## 🚀 제출 전 최종 확인

1. **README.md 업데이트**
   - GIF 링크 삽입
   - YouTube 데모 영상 URL 추가

2. **GitHub 업로드**
   ```bash
   # 대용량 파일은 Git LFS 사용
   git lfs install
   git lfs track "demos/*.gif"
   git lfs track "demos/*.mp4"
   git add .gitattributes
   git add demos/
   git commit -m "Add demo materials"
   git push
   ```

3. **YouTube 업로드**
   - 제목: "YouTine - AI 기반 융합 헬스케어 서비스 (2025 새싹 해커톤)"
   - 설명: 프로젝트 개요 + GitHub 링크
   - 태그: #해커톤 #AI #헬스케어 #운동

---

## 💡 추가 아이디어

### 비포/애프터 비교
- **Before**: 여러 앱을 오가며 운동하는 불편한 모습
- **After**: YouTine으로 한 번에 해결하는 모습

### 사용자 인터뷰 (선택사항)
- 실제 팀원이 사용하는 모습 촬영
- "이전에는 이렇게 불편했는데, YouTine을 쓰니까..." 인터뷰

---

**작성일**: 2025-01-18
**작성자**: 잭과 콩이담
