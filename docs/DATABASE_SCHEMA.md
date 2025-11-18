# YouTine 데이터베이스 스키마

## 📊 개요

YouTine은 MongoDB를 데이터베이스로 사용하며, Mongoose ODM을 통해 데이터 모델을 관리합니다.

**데이터베이스 이름**: `fittrack`
**컬렉션 수**: 5개
**총 관계**: Videos ↔ ExerciseSegments ↔ Routines ↔ WorkoutLogs, ScheduledRoutines

---

## 🗂️ 컬렉션 목록

| 컬렉션명 | 역할 | 주요 필드 | 관계 |
|---------|-----|----------|-----|
| `videos` | YouTube 영상 메타데이터 | url, title, thumbnail, status | 1:N → segments |
| `exercisesegments` | AI 추출 운동 구간 | exerciseName, startTime, endTime | N:1 → videos, N:M → routines |
| `routines` | 사용자 생성 루틴 | name, segments | N:M → segments |
| `workoutlogs` | 운동 실행 기록 | date, exerciseName, sets | N:1 → videos/routines |
| `scheduledroutines` | 캘린더 예약 루틴 | scheduledDate, completed | N:1 → routines |

---

## 1. Videos (영상 정보)

**컬렉션명**: `videos`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/models/Video.js`

### 스키마 정의

```javascript
{
  url: {
    type: String,
    required: true,
    unique: true,              // 중복 URL 방지
    trim: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  thumbnail: {
    type: String,              // YouTube 썸네일 URL
    required: true
  },

  duration: {
    type: Number,              // 영상 길이 (초 단위)
    required: false
  },

  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },

  analysisError: {
    type: String,              // AI 분석 실패 시 에러 메시지
    required: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### 인덱스

```javascript
// 자동 생성
{ url: 1 }           // unique 속성으로 자동 생성
{ _id: 1 }           // MongoDB 기본 인덱스

// 추가 권장 인덱스
{ status: 1 }        // 상태별 필터링 (processing 영상 조회)
{ createdAt: -1 }    // 최신 영상 정렬
```

### 상태 전이 다이어그램

```
[User adds URL]
     ↓
 ┌─────────┐
 │ pending │  ← 초기 상태
 └────┬────┘
      │ AI 분석 시작
      ↓
┌────────────┐
│ processing │  ← 자막 추출 + OpenAI 분석 중
└─────┬──────┘
      │
      ├───→ ┌───────────┐
      │     │ completed │  ← 성공 (segments 생성됨)
      │     └───────────┘
      │
      └───→ ┌────────┐
            │ failed │  ← 실패 (analysisError 저장)
            └────────┘
```

### 예시 도큐먼트

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "10분 하체 운동 루틴 | 스쿼트, 런지, 사이드 레그 레이즈",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
  "duration": 600,
  "status": "completed",
  "createdAt": "2025-01-18T10:30:00.000Z"
}
```

---

## 2. ExerciseSegments (운동 구간)

**컬렉션명**: `exercisesegments`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/models/ExerciseSegment.js`

### 스키마 정의

```javascript
{
  sourceVideoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',                        // Video와의 관계
    required: true,
    index: true                          // 빠른 조회를 위한 인덱스
  },

  exerciseName: {
    type: String,
    required: true,
    trim: true,
    index: true                          // 운동명으로 검색
  },

  startTime: {
    type: Number,                        // 시작 시간 (초 단위)
    required: true,
    min: 0
  },

  endTime: {
    type: Number,                        // 종료 시간 (초 단위)
    required: true,
    min: 0
  },

  targetMuscles: [{
    type: String,                        // 예: ['legs', 'glutes', 'core']
    trim: true,
    index: true                          // 근육 그룹별 필터링
  }],

  thumbnailUrl: {
    type: String,                        // 영상 썸네일 캐싱
    required: false
  },

  duration: {
    type: Number,                        // endTime - startTime (자동 계산)
    required: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### 인덱스

```javascript
// Compound 인덱스 (다중 조건 검색 최적화)
{ sourceVideoId: 1, startTime: 1 }       // 영상별 시간순 정렬
{ exerciseName: 1, targetMuscles: 1 }    // 운동 + 근육 필터링
{ targetMuscles: 1 }                     // 근육 그룹 검색
```

### 검증 규칙

```javascript
// Mongoose pre-save 훅
ExerciseSegmentSchema.pre('save', function(next) {
  // endTime이 startTime보다 커야 함
  if (this.endTime <= this.startTime) {
    return next(new Error('endTime must be greater than startTime'));
  }

  // duration 자동 계산
  this.duration = this.endTime - this.startTime;

  next();
});
```

### 예시 도큐먼트

```json
{
  "_id": "507f191e810c19729de860ea",
  "sourceVideoId": "507f1f77bcf86cd799439011",
  "exerciseName": "Squat",
  "startTime": 120,
  "endTime": 180,
  "targetMuscles": ["legs", "glutes", "core"],
  "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
  "duration": 60,
  "createdAt": "2025-01-18T10:32:00.000Z"
}
```

### 표준 운동명 (OpenAI 분석 시 매핑)

```javascript
const STANDARD_EXERCISE_NAMES = [
  // 하체
  'Squat', 'Lunge', 'Leg Press', 'Leg Curl', 'Leg Extension', 'Calf Raise',
  'Romanian Deadlift', 'Glute Bridge', 'Bulgarian Split Squat',

  // 상체
  'Push-up', 'Bench Press', 'Dumbbell Press', 'Shoulder Press',
  'Lateral Raise', 'Bicep Curl', 'Tricep Dip', 'Tricep Extension',

  // 등
  'Pull-up', 'Lat Pulldown', 'Bent Over Row', 'Deadlift',

  // 코어
  'Plank', 'Crunches', 'Russian Twist', 'Leg Raise',

  // 유산소
  'Jumping Jacks', 'Burpees', 'Mountain Climbers', 'High Knees'
];
```

---

## 3. Routines (운동 루틴)

**컬렉션명**: `routines`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/models/Routine.js`

### 스키마 정의

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true,
    required: false
  },

  segments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExerciseSegment'              // 핵심: 세그먼트 조합
  }],

  videos: [{                            // Legacy 필드 (하위 호환성)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### 특징: SmartPlayer 지원

- **segments 배열**: 여러 영상의 구간들을 자유롭게 조합
- **순서 보장**: 배열 순서대로 재생
- **Populate 지원**: 조회 시 세그먼트 정보 자동 로드

### API 조회 예시

```javascript
// Populate를 통한 전체 정보 로드
Routine.findById(routineId)
  .populate({
    path: 'segments',
    populate: {
      path: 'sourceVideoId',
      select: 'url title thumbnail'
    }
  })
  .exec();
```

### 예시 도큐먼트

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "30분 하체 집중 루틴",
  "description": "스쿼트, 런지, 카프 레이즈로 구성된 하체 집중 프로그램",
  "segments": [
    "507f191e810c19729de860ea",        // Squat 구간 (60초)
    "507f191e810c19729de860eb",        // Lunge 구간 (90초)
    "507f191e810c19729de860ec"         // Calf Raise 구간 (45초)
  ],
  "videos": [],                         // Legacy 필드
  "createdAt": "2025-01-18T11:00:00.000Z"
}
```

---

## 4. WorkoutLogs (운동 기록)

**컬렉션명**: `workoutlogs`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/models/WorkoutLog.js`

### 스키마 정의

```javascript
{
  date: {
    type: Date,
    required: true,
    index: true                         // 날짜별 조회 최적화
  },

  routineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine',
    required: false
  },

  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    index: true                         // 영상별 운동 이력
  },

  segmentTimestamp: {
    type: Number,                       // 특정 구간 기록 (초 단위)
    required: false
  },

  exerciseName: {
    type: String,
    required: true,
    trim: true
  },

  sets: [{
    reps: {
      type: Number,
      min: 0
    },
    weight: {
      type: Number,                     // 무게 (kg)
      min: 0,
      required: false
    }
  }],

  notes: {
    type: String,
    trim: true,
    required: false
  }
}
```

### 인덱스

```javascript
{ videoId: 1, date: -1 }                // 영상별 최근 기록 조회
{ date: -1 }                            // 전체 기록 시간순 정렬
{ exerciseName: 1, date: -1 }           // 운동별 진행 기록
```

### 통계 쿼리 예시

```javascript
// 이번 달 총 운동 횟수
WorkoutLog.countDocuments({
  date: {
    $gte: new Date(year, month, 1),
    $lt: new Date(year, month + 1, 1)
  }
});

// 연속 운동 일수 (스트릭)
WorkoutLog.aggregate([
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } } },
  { $sort: { _id: -1 } }
]);

// 자주 하는 운동 TOP 5
WorkoutLog.aggregate([
  { $group: { _id: '$exerciseName', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 5 }
]);
```

### 예시 도큐먼트

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "date": "2025-01-18T09:00:00.000Z",
  "routineId": "507f1f77bcf86cd799439012",
  "videoId": "507f1f77bcf86cd799439011",
  "exerciseName": "Squat",
  "sets": [
    { "reps": 12, "weight": 60 },
    { "reps": 10, "weight": 70 },
    { "reps": 8, "weight": 80 }
  ],
  "notes": "무릎이 약간 아팠음. 다음엔 무게 줄이기"
}
```

---

## 5. ScheduledRoutines (예약 루틴)

**컬렉션명**: `scheduledroutines`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/models/ScheduledRoutine.js`

### 스키마 정의

```javascript
{
  routineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine',
    required: true
  },

  scheduledDate: {
    type: Date,
    required: true,
    index: true                         // 날짜별 스케줄 조회
  },

  completed: {
    type: Boolean,
    default: false,
    index: true                         // 완료 여부 필터링
  },

  completedAt: {
    type: Date,
    required: false
  },

  notes: {
    type: String,
    trim: true,
    required: false
  }
}
```

### 인덱스

```javascript
{ scheduledDate: 1, completed: 1 }      // 날짜별 미완료 루틴 조회
{ routineId: 1 }                        // 루틴별 스케줄 조회
```

### 캘린더 쿼리 예시

```javascript
// 특정 월의 모든 스케줄 조회
ScheduledRoutine.find({
  scheduledDate: {
    $gte: new Date(year, month, 1),
    $lt: new Date(year, month + 1, 1)
  }
})
.populate('routineId')
.sort({ scheduledDate: 1 });
```

### 예시 도큐먼트

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "routineId": "507f1f77bcf86cd799439012",
  "scheduledDate": "2025-01-20T10:00:00.000Z",
  "completed": false,
  "notes": "아침 운동 - 하체 집중"
}
```

---

## 🔗 관계도

### ER Diagram (텍스트 버전)

```
┌─────────────────┐
│     Videos      │
│  (유튜브 영상)    │
├─────────────────┤
│ _id (PK)        │
│ url (UNIQUE)    │
│ title           │
│ thumbnail       │
│ status          │
└────────┬────────┘
         │ 1
         │
         │ N (sourceVideoId)
         ▼
┌─────────────────────┐
│ ExerciseSegments    │◄──────────────┐
│  (AI 추출 운동 구간)  │               │
├─────────────────────┤               │
│ _id (PK)            │               │ N
│ sourceVideoId (FK)  │               │
│ exerciseName        │       ┌───────┴──────┐
│ startTime           │       │   Routines   │
│ endTime             │       │ (사용자 루틴)  │
│ targetMuscles[]     │       ├──────────────┤
└──────┬──────────────┘       │ _id (PK)     │
       │ N                    │ name         │
       │                      │ segments[]   │◄───┐
       │                      └──────┬───────┘    │ 1
       │                             │ 1          │
       │                             │            │
       │                             │ N          │
       ▼                             ▼            │
┌─────────────────┐         ┌─────────────────────┤
│  WorkoutLogs    │         │ ScheduledRoutines   │
│  (운동 기록)     │         │  (예약된 루틴)       │
├─────────────────┤         ├─────────────────────┤
│ _id (PK)        │         │ _id (PK)            │
│ videoId (FK)    │         │ routineId (FK)      │───┘
│ routineId (FK)  │         │ scheduledDate       │
│ exerciseName    │         │ completed           │
│ date            │         └─────────────────────┘
│ sets[]          │
└─────────────────┘
```

---

## 🗃️ 데이터 크기 추정

### 평균 도큐먼트 크기

| 컬렉션 | 평균 크기 | 예상 개수 (6개월) | 총 크기 |
|--------|----------|-----------------|---------|
| Videos | 300 bytes | 100개 | 30 KB |
| ExerciseSegments | 250 bytes | 500개 | 125 KB |
| Routines | 200 bytes | 50개 | 10 KB |
| WorkoutLogs | 400 bytes | 500개 | 200 KB |
| ScheduledRoutines | 150 bytes | 200개 | 30 KB |
| **합계** | - | - | **~395 KB** |

→ MongoDB Free Tier (512 MB)로 충분

---

## 🔍 인덱스 전략 요약

### 단일 필드 인덱스
```javascript
videos.url               // UNIQUE 제약
videos.status            // 상태별 필터링
exercisesegments.exerciseName  // 운동명 검색
workoutlogs.date         // 날짜별 조회
scheduledroutines.scheduledDate // 캘린더 조회
```

### Compound 인덱스 (성능 최적화)
```javascript
exercisesegments: { sourceVideoId: 1, startTime: 1 }
workoutlogs: { videoId: 1, date: -1 }
scheduledroutines: { scheduledDate: 1, completed: 1 }
```

### 인덱스 생성 명령어

```javascript
// MongoDB Shell에서 실행
use fittrack;

db.videos.createIndex({ status: 1 });
db.exercisesegments.createIndex({ sourceVideoId: 1, startTime: 1 });
db.exercisesegments.createIndex({ targetMuscles: 1 });
db.workoutlogs.createIndex({ videoId: 1, date: -1 });
db.scheduledroutines.createIndex({ scheduledDate: 1, completed: 1 });
```

---

## 🛠️ 마이그레이션 스크립트 (향후 변경 시)

### 예시: segments 필드 추가 (Legacy videos → segments)

```javascript
// migrations/add_segments_to_routines.js
const Routine = require('../models/Routine');

async function migrate() {
  const routines = await Routine.find({ segments: { $exists: false } });

  for (const routine of routines) {
    // videos 필드에서 segments로 데이터 이관 로직
    routine.segments = [];
    await routine.save();
  }

  console.log(`Migrated ${routines.length} routines`);
}

migrate();
```

---

## 📊 데이터 백업 전략

### MongoDB Atlas (클라우드)
- 자동 백업: 매일 1회
- Point-in-Time Recovery: 최대 7일

### 로컬 MongoDB
```bash
# 전체 데이터베이스 백업
mongodump --db fittrack --out ./backups/fittrack-$(date +%Y%m%d)

# 복원
mongorestore --db fittrack ./backups/fittrack-20250118
```

---

## 🔐 보안 고려사항

### 1. 입력 검증
- Mongoose Schema Validation으로 기본 검증
- Express-validator로 추가 검증

### 2. MongoDB Injection 방지
```javascript
// ❌ 취약한 코드
Video.find({ url: req.query.url });

// ✅ 안전한 코드
Video.find({ url: String(req.query.url) });
// Mongoose는 기본적으로 타입 캐스팅으로 보호
```

### 3. 데이터 암호화
- MongoDB Atlas: 전송 중 암호화 (TLS)
- 민감한 필드 (미래에 추가될 경우): `mongoose-encryption` 사용

---

## 📚 참고 자료

- [Mongoose 공식 문서](https://mongoosejs.com/docs/guide.html)
- [MongoDB 인덱스 전략](https://docs.mongodb.com/manual/indexes/)
- [MongoDB 스키마 디자인 패턴](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)

---

**작성일**: 2025-01-18
**작성자**: 잭과 콩이담
