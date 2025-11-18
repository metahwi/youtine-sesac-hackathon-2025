# YouTine Motion Coaching Prototype

> Python + OpenCV + MediaPipe 기반 실시간 자세 교정 프로토타입

---

## 🎯 개요

이 프로토타입은 웹캠을 통해 사용자의 운동 자세를 실시간으로 분석하고 피드백을 제공합니다.

**핵심 기능**:
- 실시간 포즈 감지 (33개 신체 랜드마크)
- 운동 동작 카운팅
- 자세 정확도 평가
- 음성/시각적 피드백

---

## 🛠️ 기술 스택

- **Python 3.8+**
- **MediaPipe Pose** - Google의 포즈 추정 라이브러리
- **OpenCV (cv2)** - 영상 처리 및 시각화
- **NumPy** - 수치 계산 (각도 계산)

---

## 📁 프로젝트 구조

```
python-squat-counter/
├── src/
│   ├── core/
│   │   └── pose_detector.py      # MediaPipe 포즈 감지 래퍼
│   │
│   ├── exercises/
│   │   ├── base_exercise.py      # 운동 카운터 추상 클래스
│   │   ├── squat_counter.py      # 스쿼트 카운터
│   │   ├── pushup_counter.py     # 푸쉬업 카운터
│   │   ├── lunge_counter.py      # 런지 카운터
│   │   └── ... (13개 운동)
│   │
│   └── utils/
│       └── camera.py             # 웹캠 유틸리티
│
└── tests/
    ├── test_squat.py             # 스쿼트 테스트
    ├── test_pushup.py            # 푸쉬업 테스트
    └── ... (13개 테스트 파일)
```

---

## 🚀 시작하기

### 사전 요구사항

- Python 3.8 이상
- 웹캠 (내장 또는 외장)
- macOS / Windows / Linux

### 설치

```bash
cd prototypes/python-squat-counter

# 가상환경 생성
python -m venv venv

# 가상환경 활성화
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# 의존성 설치
pip install opencv-python mediapipe numpy
```

### 실행

```bash
# 스쿼트 테스트
python tests/test_squat.py

# 푸쉬업 테스트
python tests/test_pushup.py

# 런지 테스트
python tests/test_lunge.py
```

---

## 🎮 사용 방법

### 1. 프로그램 실행

```bash
python tests/test_squat.py
```

### 2. 웹캠 화면 확인

- 전신이 프레임 안에 들어오도록 조정
- 조명이 밝은 곳에서 촬영 (얼굴 인식률 향상)
- 카메라와 1.5-2m 거리 유지

### 3. 운동 시작

- 시작 자세: 똑바로 서기
- 운동 동작 수행 (예: 스쿼트)
- 화면에 실시간 피드백 표시

### 4. 종료

- `q` 키를 눌러 프로그램 종료

---

## 📊 화면 UI 설명

### 왼쪽: 진행 바
- 0-100% 진행률 표시
- 색상: 빨강 → 초록

### 중앙: 포즈 스켈레톤
- 33개 랜드마크 점
- 관절 연결선
- 주요 각도 주석

### 오른쪽: 정보 패널
- **카운터**: 현재 반복 횟수
- **자세**: "Good Form" / "Fix Form"
- **단계**: "Up" / "Down"
- **피드백**: "무릎이 발끝보다 나왔어요" 등

---

## 🏋️ 지원 운동 (13가지)

| 운동 | 테스트 파일 | 주요 관절 |
|-----|-----------|---------|
| Squat | `test_squat.py` | 무릎, 골반 |
| Push-up | `test_pushup.py` | 팔꿈치, 어깨 |
| Lunge | `test_lunge.py` | 무릎, 골반 |
| Plank | `test_plank.py` | 팔꿈치, 골반 |
| Jumping Jacks | `test_jumpingjacks.py` | 어깨, 다리 |
| Bicep Curl | `test_bicepcurl.py` | 팔꿈치 |
| Tricep Dip | `test_tricepdip.py` | 팔꿈치, 어깨 |
| Tricep Stretch | `test_tricepstretch.py` | 팔꿈치 |
| Shoulder Press | `test_shoulderpress.py` | 어깨, 팔꿈치 |
| Lateral Raises | `test_lateralraises.py` | 어깨 |
| Arm Circles | `test_armcircles.py` | 어깨 |
| Chest Stretch | `test_cheststretch.py` | 어깨 |
| Camera Test | `test_camera.py` | - |

---

## 🧩 핵심 컴포넌트

### PoseDetector

**위치**: `src/core/pose_detector.py`

MediaPipe Pose를 래핑한 클래스입니다.

**주요 메서드**:
```python
class PoseDetector:
    def findPose(self, img, draw=True):
        """포즈 감지 및 랜드마크 그리기"""
        pass

    def findPosition(self, img, draw=True):
        """랜드마크 좌표 반환 (33개)"""
        pass

    def findAngle(self, img, p1, p2, p3, draw=True):
        """세 점 사이의 각도 계산"""
        pass
```

**사용 예시**:
```python
from src.core.pose_detector import PoseDetector

detector = PoseDetector()
img = detector.findPose(img)
lmList = detector.findPosition(img)

# 무릎 각도 계산 (골반-무릎-발목)
knee_angle = detector.findAngle(img, 23, 25, 27)
```

---

### BaseExercise

**위치**: `src/exercises/base_exercise.py`

모든 운동 카운터의 추상 클래스입니다.

**속성**:
```python
class BaseExercise(ABC):
    count: int          # 반복 횟수
    direction: int      # 움직임 방향 (0: 아래, 1: 위)
    form: int           # 자세 정확도 (0: 나쁨, 1: 좋음)
    feedback: str       # 피드백 메시지
```

**추상 메서드**:
```python
@abstractmethod
def update_feedback_and_count(self, angles, **kwargs):
    """자세 분석 및 카운터 업데이트"""
    pass

@abstractmethod
def get_required_angles(self, detector, img):
    """필요한 관절 각도 계산"""
    pass
```

---

### SquatCounter (예시)

**위치**: `src/exercises/squat_counter.py`

스쿼트 동작을 감지하고 카운팅합니다.

**감지 로직**:
```python
def update_feedback_and_count(self, angles, **kwargs):
    knee_angle = angles['knee']
    hip_angle = angles['hip']

    # 자세 검증
    if knee_angle > 160 and hip_angle > 160:
        self.form = 1  # 올바른 자세
    else:
        self.form = 0  # 잘못된 자세

    # 카운팅
    if knee_angle <= 90:  # 스쿼트 하단
        if self.direction == 1:
            self.count += 0.5
            self.direction = 0
    elif knee_angle >= 160:  # 스쿼트 상단
        if self.direction == 0:
            self.count += 0.5
            self.direction = 1
```

---

## 🔧 macOS 최적화

### GPU 비활성화

macOS에서 OpenGL 컨텍스트 이슈를 방지하기 위해 GPU를 비활성화합니다:

```python
import os
os.environ['MEDIAPIPE_DISABLE_GPU'] = '1'
```

이 설정은 모든 테스트 파일에 포함되어 있습니다.

---

## 🎯 정확도 향상 팁

### 카메라 설정
- **거리**: 1.5-2m
- **각도**: 정면 또는 측면 (운동에 따라 다름)
- **조명**: 밝은 자연광 또는 백색 조명

### 복장
- **권장**: 몸에 딱 맞는 옷 (레깅스, 반팔)
- **비권장**: 헐렁한 옷 (랜드마크 감지 어려움)

### 배경
- **권장**: 단색 배경 (흰색, 회색)
- **비권장**: 복잡한 배경 (사람이 있는 포스터 등)

---

## 🐛 문제 해결

### 웹캠이 작동하지 않아요

```python
# camera.py 수정
cap = cv2.VideoCapture(0)  # 0을 1, 2로 변경해보세요

# 또는 외장 웹캠 사용
cap = cv2.VideoCapture(1)
```

### 포즈 감지가 안 돼요

1. 조명 확인 (밝은 곳으로 이동)
2. 카메라 각도 조정 (정면으로)
3. 전신이 프레임 안에 들어오는지 확인
4. GPU 비활성화 확인 (`MEDIAPIPE_DISABLE_GPU=1`)

### 프레임이 느려요 (FPS 낮음)

```python
# 해상도 낮추기
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

# 또는 MediaPipe 설정 변경
mp_pose.Pose(
    min_detection_confidence=0.5,  # 기본값: 0.5
    min_tracking_confidence=0.5    # 기본값: 0.5
)
```

---

## 🔮 향후 계획

### 웹 앱 통합

**Option 1: WebRTC**
```python
# Python WebSocket 서버
from aiortc import RTCPeerConnection, VideoStreamTrack

class PoseTrackingTrack(VideoStreamTrack):
    async def recv(self):
        frame = await self.track.recv()
        # MediaPipe 처리
        return processed_frame
```

**Option 2: Flask API**
```python
from flask import Flask, request, jsonify

@app.route('/analyze', methods=['POST'])
def analyze_frame():
    image = request.files['frame']
    # MediaPipe 처리
    return jsonify(feedback)
```

### 추가 기능

- [ ] 운동 기록 저장 (JSON/DB)
- [ ] 자세 정확도 점수 (0-100점)
- [ ] 음성 피드백 (TTS)
- [ ] 운동 추천 (AI 기반)

---

## 📚 참고 자료

### MediaPipe
- [공식 문서](https://google.github.io/mediapipe/solutions/pose.html)
- [랜드마크 인덱스](https://google.github.io/mediapipe/solutions/pose.html#pose-landmark-model-blazepose-ghum-3d)
- [예제 코드](https://github.com/google/mediapipe/tree/master/mediapipe/python/solutions)

### OpenCV
- [공식 문서](https://docs.opencv.org/4.x/)
- [Python 튜토리얼](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)

### 운동 자세 가이드
- [NASM 공식 가이드](https://www.nasm.org/exercise-library)
- [YouTube: 올바른 스쿼트 자세](https://www.youtube.com/results?search_query=proper+squat+form)

---

## 🙏 크레딧

- **MediaPipe**: Google AI Edge
- **OpenCV**: OpenCV.org
- **참고 프로젝트**: [Murtaza's Workshop](https://www.youtube.com/watch?v=01sAkU_NvOY)

---

**작성일**: 2025-01-18
**작성자**: 잭과 콩이담
