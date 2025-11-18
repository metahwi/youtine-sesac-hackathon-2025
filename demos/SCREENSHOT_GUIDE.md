# 📸 스크린샷 교체 가이드

> README.md의 placeholder 이미지를 실제 스크린샷으로 교체하는 방법입니다.

---

## 📁 파일 저장 위치

```
demos/
├── screenshots/           # 📸 스크린샷 파일 (.png)
│   ├── 01-landing-page.png
│   ├── 02-video-adding.png
│   ├── 03-smartplayer.png
│   ├── 04-dashboard.png
│   └── 05-motion-tracking.png
│
└── gifs/                  # 🎬 GIF 애니메이션 (.gif)
    ├── ai-analysis.gif
    ├── smartplayer-demo.gif
    └── motion-tracking.gif
```

---

## 🎯 촬영해야 할 스크린샷 (5개)

### 1️⃣ Landing Page (Segment Library)

**촬영 방법**:
```bash
# 1. 프론트엔드 실행
cd web-app/client
pnpm dev

# 2. 브라우저에서 http://localhost:5173 접속
# 3. "Segments" 탭 클릭
# 4. 세그먼트 카드들이 표시된 화면 캡처
```

**저장 이름**: `demos/screenshots/01-landing-page.png`

**README 교체 위치**:
```markdown
<!-- 현재 (Line 32) -->
<img src="https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=YouTine+Landing+Page" .../>

<!-- 교체 후 -->
<img src="./demos/screenshots/01-landing-page.png" .../>
```

---

### 2️⃣ Video Adding UI

**촬영 방법**:
```bash
# 1. "Videos" 탭 클릭
# 2. YouTube URL 입력 폼이 보이는 화면
# 3. (선택) URL 입력 후 "Processing..." 상태 표시 화면
```

**저장 이름**: `demos/screenshots/02-video-adding.png`

**README 교체 위치**:
```markdown
<!-- 현재 (Line 42) -->
<img src="https://via.placeholder.com/600x400/50C878/FFFFFF?text=Video+Adding+UI" .../>

<!-- 교체 후 -->
<img src="./demos/screenshots/02-video-adding.png" .../>
```

---

### 3️⃣ SmartPlayer Interface

**촬영 방법**:
```bash
# 1. 루틴 생성 (최소 2개 세그먼트)
# 2. "Play Routine" 버튼 클릭
# 3. SmartPlayer 모달이 열린 화면
# 4. 진행 바와 세그먼트 리스트가 보이는 순간 캡처
```

**저장 이름**: `demos/screenshots/03-smartplayer.png`

**README 교체 위치**:
```markdown
<!-- 현재 (Line 54) -->
<img src="https://via.placeholder.com/600x400/FF6B6B/FFFFFF?text=SmartPlayer+Interface" .../>

<!-- 교체 후 -->
<img src="./demos/screenshots/03-smartplayer.png" .../>
```

---

### 4️⃣ Dashboard & Analytics

**촬영 방법**:
```bash
# 1. "Dashboard" 탭 클릭
# 2. 통계 카드, 차트, 캘린더가 모두 보이는 화면
# 3. (데이터가 없다면) 테스트 데이터 추가 필요
```

**저장 이름**: `demos/screenshots/04-dashboard.png`

**README 교체 위치**:
```markdown
<!-- 현재 (Line 64) -->
<img src="https://via.placeholder.com/600x400/9B59B6/FFFFFF?text=Dashboard+View" .../>

<!-- 교체 후 -->
<img src="./demos/screenshots/04-dashboard.png" .../>
```

---

### 5️⃣ AI Motion Tracking (Python)

**촬영 방법**:
```bash
# 1. Python 프로토타입 실행
cd prototypes/python-squat-counter
python tests/test_squat.py

# 2. 웹캠 화면에 포즈 스켈레톤이 표시된 순간
# 3. 스쿼트 동작 중 관절 각도가 표시된 화면 캡처
# 4. macOS: Cmd+Shift+4로 영역 선택
```

**저장 이름**: `demos/screenshots/05-motion-tracking.png`

**README 교체 위치**:
```markdown
<!-- 현재 (Line 76) -->
<img src="https://via.placeholder.com/1200x400/E67E22/FFFFFF?text=OpenCV+Motion+Tracking" .../>

<!-- 교체 후 -->
<img src="./demos/screenshots/05-motion-tracking.png" .../>
```

---

## 🎬 GIF 애니메이션 (선택사항)

### AI Analysis Process

**촬영 방법**:
```bash
# QuickTime Player 또는 ScreenToGif 사용
# 1. URL 입력
# 2. "Processing..." 표시
# 3. "Completed" 상태
# 4. Segments 화면 전환
# 총 10-15초
```

**저장 이름**: `demos/gifs/ai-analysis.gif`

**README 삽입 위치**: Line 119-122 (AI 루틴 플래너 섹션)

---

### SmartPlayer Demo

**촬영 방법**:
```bash
# 1. 루틴 재생 시작
# 2. 첫 번째 세그먼트 재생
# 3. 자동으로 두 번째 세그먼트 전환
# 총 15-20초
```

**저장 이름**: `demos/gifs/smartplayer-demo.gif`

**README 삽입 위치**: Line 54-56 (SmartPlayer 이미지 대신)

---

### Motion Tracking Demo

**촬영 방법**:
```bash
# 1. Python 스쿼트 테스트 실행
# 2. 스쿼트 1-2회 동작
# 3. 카운터 증가 및 피드백 표시
# 총 10-15초
```

**저장 이름**: `demos/gifs/motion-tracking.gif`

**README 삽입 위치**: Line 140-143 (모션 코칭 섹션)

---

## 🔄 README.md 교체 작업 순서

### Step 1: 스크린샷 촬영
```bash
# 모든 스크린샷을 demos/screenshots/ 폴더에 저장
# 파일명은 위에 명시된 대로 정확히 입력
```

### Step 2: README.md 열기
```bash
# VS Code나 원하는 에디터로 열기
code README.md
```

### Step 3: 찾기 & 바꾸기 (5번 반복)

**1번째 교체** (Landing Page):
- 찾기: `https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=YouTine+Landing+Page`
- 바꾸기: `./demos/screenshots/01-landing-page.png`

**2번째 교체** (Video Adding):
- 찾기: `https://via.placeholder.com/600x400/50C878/FFFFFF?text=Video+Adding+UI`
- 바꾸기: `./demos/screenshots/02-video-adding.png`

**3번째 교체** (SmartPlayer):
- 찾기: `https://via.placeholder.com/600x400/FF6B6B/FFFFFF?text=SmartPlayer+Interface`
- 바꾸기: `./demos/screenshots/03-smartplayer.png`

**4번째 교체** (Dashboard):
- 찾기: `https://via.placeholder.com/600x400/9B59B6/FFFFFF?text=Dashboard+View`
- 바꾸기: `./demos/screenshots/04-dashboard.png`

**5번째 교체** (Motion Tracking):
- 찾기: `https://via.placeholder.com/1200x400/E67E22/FFFFFF?text=OpenCV+Motion+Tracking`
- 바꾸기: `./demos/screenshots/05-motion-tracking.png`

### Step 4: 저장 및 확인
```bash
# README.md 저장
# 브라우저에서 미리보기 확인 (VS Code의 경우 Cmd+Shift+V)
```

### Step 5: Git 커밋
```bash
git add demos/screenshots/*.png
git add README.md
git commit -m "Add actual screenshots to README"
git push origin main
```

---

## 💡 촬영 팁

### 스크린샷 품질
- **해상도**: 최소 1280x720 (Retina는 2560x1440)
- **형식**: PNG (투명 배경 가능)
- **파일 크기**: 각 이미지 500KB 이하 권장

### 캡처 도구
- **macOS**: `Cmd + Shift + 4` (영역 선택)
- **Windows**: `Win + Shift + S` (Snipping Tool)
- **추천 도구**:
  - [Cleanshot X](https://cleanshot.com) (macOS, 유료)
  - [ShareX](https://getsharex.com) (Windows, 무료)

### 편집 팁
- 개인정보 블러 처리 (필요시)
- 브라우저 주소창 제거
- 불필요한 여백 크롭
- 그림자 효과 추가 (선택사항)

---

## 🚨 주의사항

1. **파일명은 정확히**: 대소문자, 하이픈 등 정확히 일치해야 함
2. **경로는 상대 경로**: `./demos/screenshots/...` (절대 경로 사용 금지)
3. **Git에 커밋**: 이미지 파일도 반드시 Git에 추가
4. **파일 크기 확인**: 각 이미지 500KB 이하 (GitHub 제한)

---

## ✅ 완료 체크리스트

- [ ] `demos/screenshots/` 폴더 생성 확인
- [ ] 5개 스크린샷 촬영 완료
- [ ] 파일명 정확히 저장
- [ ] README.md에서 5곳 교체
- [ ] 로컬에서 미리보기 확인
- [ ] Git에 커밋 및 푸시
- [ ] GitHub에서 이미지 정상 표시 확인

---

**작성일**: 2025-01-18
