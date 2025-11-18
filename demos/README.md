# 📁 Demos 폴더

> README.md에 사용될 데모 자료(스크린샷, GIF, 영상)를 저장하는 폴더입니다.

---

## 📂 폴더 구조

```
demos/
├── README.md                    # 이 파일
├── SCREENSHOT_GUIDE.md          # 📸 스크린샷 교체 가이드
│
├── screenshots/                 # 스크린샷 파일 (.png)
│   ├── 01-landing-page.png      # Landing Page (Segment Library)
│   ├── 02-video-adding.png      # Video Adding UI
│   ├── 03-smartplayer.png       # SmartPlayer Interface
│   ├── 04-dashboard.png         # Dashboard & Analytics
│   └── 05-motion-tracking.png   # AI Motion Coaching
│
└── gifs/                        # GIF 애니메이션 (.gif, 선택사항)
    ├── ai-analysis.gif          # AI 분석 과정
    ├── smartplayer-demo.gif     # SmartPlayer 데모
    └── motion-tracking.gif      # 모션 트래킹 데모
```

---

## 🎯 빠른 시작

### 1. 스크린샷 촬영
```bash
# 웹 애플리케이션 실행
cd web-app/server && npm run dev
cd web-app/client && pnpm dev

# Python 프로토타입 실행
cd prototypes/python-squat-counter
python tests/test_squat.py
```

### 2. 파일 저장
- 촬영한 스크린샷을 `demos/screenshots/` 폴더에 저장
- 파일명은 정확히: `01-landing-page.png`, `02-video-adding.png` 등

### 3. README 교체
- README.md에서 placeholder URL을 찾기
- 예: `https://via.placeholder.com/...` → `./demos/screenshots/01-landing-page.png`

자세한 방법은 [SCREENSHOT_GUIDE.md](./SCREENSHOT_GUIDE.md)를 참조하세요.

---

## 📋 체크리스트

- [ ] `screenshots/` 폴더에 5개 PNG 파일 저장
- [ ] README.md에서 5개 placeholder 교체
- [ ] (선택) `gifs/` 폴더에 GIF 파일 추가
- [ ] Git에 커밋 및 푸시
- [ ] GitHub에서 이미지 정상 표시 확인

---

## 💡 팁

### 파일 크기
- 각 PNG: 500KB 이하 권장
- 각 GIF: 5MB 이하 권장

### 해상도
- 스크린샷: 최소 1280x720
- GIF: 1280x720 또는 1920x1080

### 포맷
- 스크린샷: PNG (투명 배경 가능)
- 애니메이션: GIF (압축 필수)

---

**작성일**: 2025-01-18
