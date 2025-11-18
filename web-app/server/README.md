# YouTine Server (Backend)

> Express.js 기반 백엔드 API 서버

---

## 🛠️ 기술 스택

- **Node.js** + **Express 5.1.0**
- **MongoDB** + **Mongoose 8.19.1**
- **OpenAI API** (GPT-4-mini) - AI 영상 분석
- **YouTube Transcript** - 자막 추출
- **YTDL Core** - YouTube 메타데이터

---

## 📁 프로젝트 구조

```
server/
├── models/              # Mongoose 스키마
│   ├── Video.js        # 영상 정보
│   ├── ExerciseSegment.js  # 운동 구간
│   ├── Routine.js      # 루틴
│   ├── WorkoutLog.js   # 운동 기록
│   └── ScheduledRoutine.js # 스케줄
│
├── routes/             # API 라우트
│   ├── videos.js       # /api/videos
│   ├── segments.js     # /api/segments
│   ├── routines.js     # /api/routines
│   ├── logs.js         # /api/logs
│   ├── schedule.js     # /api/schedule
│   └── dashboard.js    # /api/dashboard
│
├── services/
│   └── aiAnalysis.js   # OpenAI 연동 서비스
│
├── utils/
│   └── logger.js       # 로깅 유틸리티
│
├── server.js           # 개발 서버 (nodemon)
└── server-production.js # 프로덕션 서버
```

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- MongoDB (로컬 또는 Atlas)
- OpenAI API 키

### 설치

```bash
cd web-app/server
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하세요:

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/fittrack
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=3000
NODE_ENV=development
```

**중요**: `.env` 파일은 Git에 커밋하지 마세요! (이미 `.gitignore`에 포함됨)

### 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 프로덕션 서버 실행

```bash
npm start
```

---

## 🗄️ 데이터베이스 설정

### MongoDB 로컬 설치 (macOS)

```bash
# Homebrew로 설치
brew tap mongodb/brew
brew install mongodb-community

# 서비스 시작
brew services start mongodb-community

# 연결 확인
mongosh
```

### MongoDB Atlas (클라우드)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 가입
2. 무료 클러스터 생성
3. 연결 문자열 복사
4. `.env` 파일에 추가:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fittrack?retryWrites=true&w=majority
```

---

## 🤖 AI 분석 서비스

### 작동 원리

1. 사용자가 YouTube URL 추가
2. `youtube-transcript`로 자막 추출
3. OpenAI GPT-4-mini에게 프롬프트 전송
4. 응답을 파싱하여 `ExerciseSegment` 생성

### 코드 위치

`services/aiAnalysis.js`

### 사용 예시

```javascript
const { analyzeVideo } = require('./services/aiAnalysis');

// 영상 분석
const segments = await analyzeVideo(videoId, transcript);
// → [{ exerciseName: 'Squat', startTime: 120, endTime: 180, ... }]
```

### OpenAI 프롬프트

```javascript
{
  model: "gpt-4-mini",
  temperature: 0.3,
  messages: [{
    role: "system",
    content: "You are an expert fitness coach..."
  }, {
    role: "user",
    content: `Analyze this transcript: ${transcript}`
  }]
}
```

---

## 📡 API 엔드포인트

전체 API 문서는 `/docs/API_DOCUMENTATION.md`를 참조하세요.

### 주요 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|-----|
| POST | `/api/videos` | YouTube 영상 추가 (AI 분석 트리거) |
| GET | `/api/videos` | 모든 영상 조회 |
| GET | `/api/segments` | 운동 구간 조회 (필터링 지원) |
| POST | `/api/routines` | 루틴 생성 |
| GET | `/api/routines/:id` | 루틴 상세 (segments populate) |
| POST | `/api/logs` | 운동 기록 생성 |
| GET | `/api/dashboard/stats` | 통계 조회 |

### 테스트 (cURL)

```bash
# 영상 추가
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# 모든 영상 조회
curl http://localhost:3000/api/videos

# 세그먼트 검색
curl "http://localhost:3000/api/segments?search=squat"
```

---

## 🗃️ 데이터베이스 스키마

자세한 스키마는 `/docs/DATABASE_SCHEMA.md`를 참조하세요.

### 주요 컬렉션

1. **videos**: YouTube 영상 메타데이터
2. **exercisesegments**: AI 추출 운동 구간
3. **routines**: 사용자 생성 루틴
4. **workoutlogs**: 운동 실행 기록
5. **scheduledroutines**: 캘린더 스케줄

### 관계도

```
Videos (1) ─→ (N) ExerciseSegments
ExerciseSegments (N) ←→ (M) Routines
Routines (1) ─→ (N) ScheduledRoutines
Videos (1) ─→ (N) WorkoutLogs
```

---

## 🔒 보안

### API 키 관리

- `.env` 파일로 환경 변수 관리
- `.gitignore`에 `.env` 추가 (완료)
- 프론트엔드에 API 키 노출 금지

### CORS 설정

```javascript
// server.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com'
    : 'http://localhost:5173',
  credentials: true
}));
```

### MongoDB Injection 방지

Mongoose는 자동으로 타입 캐스팅을 통해 기본적인 보호를 제공합니다.

---

## 🐛 디버깅

### Logger 사용

```javascript
const logger = require('./utils/logger');

logger.info('Server started on port 3000');
logger.error('Failed to connect to MongoDB', error);
logger.debug('Request body', req.body);
```

### MongoDB 쿼리 디버깅

```javascript
// Mongoose 쿼리 로그 활성화
mongoose.set('debug', true);
```

---

## 🧪 테스트 (향후)

```bash
# Jest + Supertest 설치
npm install --save-dev jest supertest

# 테스트 실행
npm test
```

### 테스트 예시

```javascript
// tests/videos.test.js
const request = require('supertest');
const app = require('../server');

describe('POST /api/videos', () => {
  it('should create a new video', async () => {
    const res = await request(app)
      .post('/api/videos')
      .send({ url: 'https://www.youtube.com/watch?v=test' })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.status).toBe('processing');
  });
});
```

---

## 📊 성능 최적화

### MongoDB 인덱스

```javascript
// 인덱스 자동 생성 (개발 환경)
mongoose.set('autoIndex', true);

// 프로덕션에서는 수동 생성 권장
ExerciseSegmentSchema.index({ sourceVideoId: 1, startTime: 1 });
ExerciseSegmentSchema.index({ targetMuscles: 1 });
```

### API 응답 캐싱 (향후)

```javascript
// Redis 캐싱 예시
const redis = require('redis');
const client = redis.createClient();

app.get('/api/routines/:id', async (req, res) => {
  const cached = await client.get(`routine:${req.params.id}`);
  if (cached) return res.json(JSON.parse(cached));

  const routine = await Routine.findById(req.params.id).populate('segments');
  await client.setex(`routine:${req.params.id}`, 3600, JSON.stringify(routine));
  res.json(routine);
});
```

---

## 🚢 배포

### Railway (추천)

1. [Railway](https://railway.app) 가입
2. GitHub 레포지토리 연결
3. 환경 변수 설정:
   - `MONGODB_URI`
   - `OPENAI_API_KEY`
   - `PORT` (자동 설정됨)
4. 자동 배포

### Render

1. [Render](https://render.com) 가입
2. "New Web Service" 생성
3. 환경 변수 설정
4. Build Command: `npm install`
5. Start Command: `npm start`

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 빌드
docker build -t youtine-server .

# 실행
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://... \
  -e OPENAI_API_KEY=sk-... \
  youtine-server
```

---

## 🔄 API 버전 관리 (향후)

```javascript
// v1 API
app.use('/api/v1', require('./routes/v1'));

// v2 API (breaking changes)
app.use('/api/v2', require('./routes/v2'));
```

---

## 📝 에러 핸들링

### 글로벌 에러 핸들러

```javascript
// server.js
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### 커스텀 에러 클래스

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

// 사용
if (!video.url) {
  throw new ValidationError('URL is required');
}
```

---

## 📚 참고 자료

- [Express.js 공식 문서](https://expressjs.com)
- [Mongoose 공식 문서](https://mongoosejs.com)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [MongoDB 베스트 프랙티스](https://docs.mongodb.com/manual/administration/production-notes/)

---

**작성일**: 2025-01-18
