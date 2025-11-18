# YouTine REST API 문서

## 📡 API 개요

**Base URL (개발)**: `http://localhost:3000/api`
**Base URL (프로덕션)**: `https://your-domain.com/api` (배포 후 업데이트)

**인증**: 현재 인증 없음 (향후 JWT 추가 예정)
**Content-Type**: `application/json`
**응답 형식**: JSON

---

## 📑 목차

1. [Videos API](#1-videos-api) - YouTube 영상 관리
2. [Segments API](#2-segments-api) - 운동 구간 관리
3. [Routines API](#3-routines-api) - 루틴 관리
4. [Workout Logs API](#4-workout-logs-api) - 운동 기록
5. [Schedule API](#5-schedule-api) - 캘린더 스케줄
6. [Dashboard API](#6-dashboard-api) - 통계 및 대시보드

---

## 1. Videos API

**Endpoint**: `/api/videos`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/routes/videos.js`

### 1.1. 영상 추가 (AI 분석 트리거)

**URL**: `POST /api/videos`
**설명**: YouTube URL을 추가하고 AI 분석을 자동으로 시작합니다.

**Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "10분 하체 운동 루틴",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
  "duration": 600,
  "status": "processing",
  "createdAt": "2025-01-18T10:30:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 URL 형식
- `409 Conflict`: 이미 존재하는 URL
- `500 Internal Server Error`: 서버 오류

**Note**: 응답 후 백그라운드에서 AI 분석이 진행됩니다. 상태는 `processing` → `completed` 또는 `failed`로 변경됩니다.

---

### 1.2. 모든 영상 조회

**URL**: `GET /api/videos`
**설명**: 등록된 모든 YouTube 영상을 조회합니다.

**Query Parameters**: 없음

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "10분 하체 운동 루틴",
    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    "duration": 600,
    "status": "completed",
    "createdAt": "2025-01-18T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "url": "https://www.youtube.com/watch?v=abc123",
    "title": "상체 근력 운동",
    "thumbnail": "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
    "duration": 450,
    "status": "processing",
    "createdAt": "2025-01-18T11:00:00.000Z"
  }
]
```

---

### 1.3. 특정 영상 조회

**URL**: `GET /api/videos/:id`
**설명**: 특정 영상의 상세 정보를 조회합니다.

**URL Parameters**:
- `id` (required): Video ObjectId

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "10분 하체 운동 루틴",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
  "duration": 600,
  "status": "completed",
  "createdAt": "2025-01-18T10:30:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: 영상을 찾을 수 없음

---

### 1.4. 영상 삭제

**URL**: `DELETE /api/videos/:id`
**설명**: 영상을 삭제합니다. 연관된 세그먼트도 함께 삭제됩니다.

**URL Parameters**:
- `id` (required): Video ObjectId

**Response** (200 OK):
```json
{
  "message": "Video deleted successfully"
}
```

**Error Responses**:
- `404 Not Found`: 영상을 찾을 수 없음

---

### 1.5. 영상의 세그먼트 조회

**URL**: `GET /api/videos/:id/segments`
**설명**: 특정 영상에서 추출된 모든 운동 구간을 조회합니다.

**URL Parameters**:
- `id` (required): Video ObjectId

**Response** (200 OK):
```json
[
  {
    "_id": "507f191e810c19729de860ea",
    "sourceVideoId": "507f1f77bcf86cd799439011",
    "exerciseName": "Squat",
    "startTime": 120,
    "endTime": 180,
    "targetMuscles": ["legs", "glutes", "core"],
    "duration": 60,
    "createdAt": "2025-01-18T10:32:00.000Z"
  },
  {
    "_id": "507f191e810c19729de860eb",
    "sourceVideoId": "507f1f77bcf86cd799439011",
    "exerciseName": "Lunge",
    "startTime": 200,
    "endTime": 290,
    "targetMuscles": ["legs", "glutes"],
    "duration": 90,
    "createdAt": "2025-01-18T10:32:00.000Z"
  }
]
```

---

## 2. Segments API

**Endpoint**: `/api/segments`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/routes/segments.js`

### 2.1. 모든 세그먼트 조회 (필터링 지원)

**URL**: `GET /api/segments`
**설명**: 운동 구간을 조회합니다. 검색 및 필터링을 지원합니다.

**Query Parameters**:
- `search` (optional): 운동명으로 검색 (case-insensitive)
- `muscleGroup` (optional): 근육 그룹으로 필터링 (예: "legs", "chest")
- `videoId` (optional): 특정 영상의 세그먼트만 조회

**Example Requests**:
```bash
# 모든 세그먼트 조회
GET /api/segments

# "squat"이 포함된 운동 검색
GET /api/segments?search=squat

# 하체 운동만 필터링
GET /api/segments?muscleGroup=legs

# 특정 영상의 세그먼트
GET /api/segments?videoId=507f1f77bcf86cd799439011
```

**Response** (200 OK):
```json
[
  {
    "_id": "507f191e810c19729de860ea",
    "sourceVideoId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "10분 하체 운동 루틴",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
    },
    "exerciseName": "Squat",
    "startTime": 120,
    "endTime": 180,
    "targetMuscles": ["legs", "glutes", "core"],
    "duration": 60,
    "createdAt": "2025-01-18T10:32:00.000Z"
  }
]
```

---

### 2.2. 특정 세그먼트 조회

**URL**: `GET /api/segments/:id`
**설명**: 특정 세그먼트의 상세 정보를 조회합니다.

**URL Parameters**:
- `id` (required): ExerciseSegment ObjectId

**Response** (200 OK):
```json
{
  "_id": "507f191e810c19729de860ea",
  "sourceVideoId": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "10분 하체 운동 루틴",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
  },
  "exerciseName": "Squat",
  "startTime": 120,
  "endTime": 180,
  "targetMuscles": ["legs", "glutes", "core"],
  "duration": 60,
  "createdAt": "2025-01-18T10:32:00.000Z"
}
```

---

### 2.3. 세그먼트 수동 생성

**URL**: `POST /api/segments`
**설명**: AI 분석 없이 수동으로 세그먼트를 생성합니다.

**Request Body**:
```json
{
  "sourceVideoId": "507f1f77bcf86cd799439011",
  "exerciseName": "Jump Squat",
  "startTime": 300,
  "endTime": 360,
  "targetMuscles": ["legs", "glutes", "cardio"]
}
```

**Response** (201 Created):
```json
{
  "_id": "507f191e810c19729de860ec",
  "sourceVideoId": "507f1f77bcf86cd799439011",
  "exerciseName": "Jump Squat",
  "startTime": 300,
  "endTime": 360,
  "targetMuscles": ["legs", "glutes", "cardio"],
  "duration": 60,
  "createdAt": "2025-01-18T12:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 데이터 (예: endTime < startTime)
- `404 Not Found`: sourceVideoId가 존재하지 않음

---

### 2.4. 세그먼트 업데이트

**URL**: `PUT /api/segments/:id`
**설명**: 세그먼트 정보를 수정합니다.

**URL Parameters**:
- `id` (required): ExerciseSegment ObjectId

**Request Body** (수정할 필드만 포함):
```json
{
  "exerciseName": "Bulgarian Split Squat",
  "targetMuscles": ["legs", "glutes", "core", "balance"]
}
```

**Response** (200 OK):
```json
{
  "_id": "507f191e810c19729de860ea",
  "sourceVideoId": "507f1f77bcf86cd799439011",
  "exerciseName": "Bulgarian Split Squat",
  "startTime": 120,
  "endTime": 180,
  "targetMuscles": ["legs", "glutes", "core", "balance"],
  "duration": 60,
  "createdAt": "2025-01-18T10:32:00.000Z"
}
```

---

### 2.5. 세그먼트 삭제

**URL**: `DELETE /api/segments/:id`
**설명**: 세그먼트를 삭제합니다.

**URL Parameters**:
- `id` (required): ExerciseSegment ObjectId

**Response** (200 OK):
```json
{
  "message": "Segment deleted successfully"
}
```

---

### 2.6. 근육 그룹 목록 조회

**URL**: `GET /api/segments/meta/muscle-groups`
**설명**: 시스템에 등록된 모든 고유 근육 그룹을 조회합니다.

**Response** (200 OK):
```json
{
  "muscleGroups": [
    "legs",
    "glutes",
    "core",
    "chest",
    "back",
    "shoulders",
    "arms",
    "cardio"
  ]
}
```

---

## 3. Routines API

**Endpoint**: `/api/routines`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/routes/routines.js`

### 3.1. 루틴 생성

**URL**: `POST /api/routines`
**설명**: 새로운 운동 루틴을 생성합니다.

**Request Body**:
```json
{
  "name": "30분 하체 집중 루틴",
  "description": "스쿼트, 런지, 카프 레이즈로 구성된 하체 프로그램",
  "segments": [
    "507f191e810c19729de860ea",
    "507f191e810c19729de860eb",
    "507f191e810c19729de860ec"
  ]
}
```

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "30분 하체 집중 루틴",
  "description": "스쿼트, 런지, 카프 레이즈로 구성된 하체 프로그램",
  "segments": [
    "507f191e810c19729de860ea",
    "507f191e810c19729de860eb",
    "507f191e810c19729de860ec"
  ],
  "videos": [],
  "createdAt": "2025-01-18T11:00:00.000Z"
}
```

---

### 3.2. 모든 루틴 조회

**URL**: `GET /api/routines`
**설명**: 등록된 모든 루틴을 조회합니다 (세그먼트 populate 없이).

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "30분 하체 집중 루틴",
    "description": "스쿼트, 런지, 카프 레이즈",
    "segments": [
      "507f191e810c19729de860ea",
      "507f191e810c19729de860eb"
    ],
    "createdAt": "2025-01-18T11:00:00.000Z"
  }
]
```

---

### 3.3. 특정 루틴 조회 (상세 정보)

**URL**: `GET /api/routines/:id`
**설명**: 루틴의 상세 정보를 조회합니다. 세그먼트와 영상 정보를 포함합니다.

**URL Parameters**:
- `id` (required): Routine ObjectId

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "30분 하체 집중 루틴",
  "description": "스쿼트, 런지, 카프 레이즈로 구성된 하체 프로그램",
  "segments": [
    {
      "_id": "507f191e810c19729de860ea",
      "exerciseName": "Squat",
      "startTime": 120,
      "endTime": 180,
      "duration": 60,
      "targetMuscles": ["legs", "glutes", "core"],
      "sourceVideoId": {
        "_id": "507f1f77bcf86cd799439011",
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "title": "10분 하체 운동 루틴",
        "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
      }
    },
    {
      "_id": "507f191e810c19729de860eb",
      "exerciseName": "Lunge",
      "startTime": 200,
      "endTime": 290,
      "duration": 90,
      "targetMuscles": ["legs", "glutes"],
      "sourceVideoId": {
        "_id": "507f1f77bcf86cd799439011",
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "title": "10분 하체 운동 루틴",
        "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
      }
    }
  ],
  "createdAt": "2025-01-18T11:00:00.000Z"
}
```

**Note**: SmartPlayer는 이 응답 데이터로 끊김 없는 재생을 구현합니다.

---

### 3.4. 루틴 업데이트

**URL**: `PUT /api/routines/:id`
**설명**: 루틴 정보를 수정합니다 (이름, 설명, 세그먼트 순서 변경).

**URL Parameters**:
- `id` (required): Routine ObjectId

**Request Body**:
```json
{
  "name": "40분 하체 + 코어 루틴",
  "description": "하체 운동에 코어 운동 추가",
  "segments": [
    "507f191e810c19729de860ea",
    "507f191e810c19729de860ec",
    "507f191e810c19729de860eb"
  ]
}
```

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "40분 하체 + 코어 루틴",
  "description": "하체 운동에 코어 운동 추가",
  "segments": [
    "507f191e810c19729de860ea",
    "507f191e810c19729de860ec",
    "507f191e810c19729de860eb"
  ],
  "createdAt": "2025-01-18T11:00:00.000Z"
}
```

---

### 3.5. 루틴 삭제

**URL**: `DELETE /api/routines/:id`
**설명**: 루틴을 삭제합니다.

**URL Parameters**:
- `id` (required): Routine ObjectId

**Response** (200 OK):
```json
{
  "message": "Routine deleted successfully"
}
```

---

## 4. Workout Logs API

**Endpoint**: `/api/logs`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/routes/logs.js`

### 4.1. 운동 기록 생성

**URL**: `POST /api/logs`
**설명**: 운동 실행 기록을 생성합니다.

**Request Body**:
```json
{
  "date": "2025-01-18T09:00:00.000Z",
  "videoId": "507f1f77bcf86cd799439011",
  "routineId": "507f1f77bcf86cd799439012",
  "exerciseName": "Squat",
  "sets": [
    { "reps": 12, "weight": 60 },
    { "reps": 10, "weight": 70 },
    { "reps": 8, "weight": 80 }
  ],
  "notes": "무릎이 약간 불편했음"
}
```

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "date": "2025-01-18T09:00:00.000Z",
  "videoId": "507f1f77bcf86cd799439011",
  "routineId": "507f1f77bcf86cd799439012",
  "exerciseName": "Squat",
  "sets": [
    { "reps": 12, "weight": 60 },
    { "reps": 10, "weight": 70 },
    { "reps": 8, "weight": 80 }
  ],
  "notes": "무릎이 약간 불편했음"
}
```

---

### 4.2. 모든 운동 기록 조회

**URL**: `GET /api/logs`
**설명**: 운동 기록을 조회합니다. 필터링을 지원합니다.

**Query Parameters**:
- `videoId` (optional): 특정 영상의 기록만 조회
- `exerciseName` (optional): 특정 운동의 기록만 조회
- `startDate` (optional): 시작 날짜
- `endDate` (optional): 종료 날짜

**Example Requests**:
```bash
# 모든 기록 조회
GET /api/logs

# 특정 운동 기록
GET /api/logs?exerciseName=Squat

# 날짜 범위 조회
GET /api/logs?startDate=2025-01-01&endDate=2025-01-31
```

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "date": "2025-01-18T09:00:00.000Z",
    "videoId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "10분 하체 운동 루틴"
    },
    "exerciseName": "Squat",
    "sets": [
      { "reps": 12, "weight": 60 }
    ],
    "notes": "무릎이 약간 불편했음"
  }
]
```

---

### 4.3. 특정 운동 기록 조회

**URL**: `GET /api/logs/:id`
**설명**: 특정 운동 기록의 상세 정보를 조회합니다.

**URL Parameters**:
- `id` (required): WorkoutLog ObjectId

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "date": "2025-01-18T09:00:00.000Z",
  "videoId": "507f1f77bcf86cd799439011",
  "routineId": "507f1f77bcf86cd799439012",
  "exerciseName": "Squat",
  "sets": [
    { "reps": 12, "weight": 60 },
    { "reps": 10, "weight": 70 },
    { "reps": 8, "weight": 80 }
  ],
  "notes": "무릎이 약간 불편했음"
}
```

---

### 4.4. 운동 기록 업데이트

**URL**: `PUT /api/logs/:id`
**설명**: 운동 기록을 수정합니다.

**URL Parameters**:
- `id` (required): WorkoutLog ObjectId

**Request Body**:
```json
{
  "sets": [
    { "reps": 15, "weight": 60 },
    { "reps": 12, "weight": 70 },
    { "reps": 10, "weight": 80 }
  ],
  "notes": "오늘은 컨디션 좋았음"
}
```

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "date": "2025-01-18T09:00:00.000Z",
  "videoId": "507f1f77bcf86cd799439011",
  "exerciseName": "Squat",
  "sets": [
    { "reps": 15, "weight": 60 },
    { "reps": 12, "weight": 70 },
    { "reps": 10, "weight": 80 }
  ],
  "notes": "오늘은 컨디션 좋았음"
}
```

---

### 4.5. 운동 기록 삭제

**URL**: `DELETE /api/logs/:id`
**설명**: 운동 기록을 삭제합니다.

**URL Parameters**:
- `id` (required): WorkoutLog ObjectId

**Response** (200 OK):
```json
{
  "message": "Workout log deleted successfully"
}
```

---

### 4.6. 특정 운동의 진행 기록 조회

**URL**: `GET /api/logs/exercise/:name/history`
**설명**: 특정 운동의 과거 기록을 시간순으로 조회합니다 (진행 상황 추적용).

**URL Parameters**:
- `name` (required): 운동명 (예: "Squat")

**Query Parameters**:
- `limit` (optional): 조회할 기록 수 (기본값: 10)

**Example Request**:
```bash
GET /api/logs/exercise/Squat/history?limit=5
```

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "date": "2025-01-18T09:00:00.000Z",
    "exerciseName": "Squat",
    "sets": [
      { "reps": 12, "weight": 60 }
    ],
    "totalReps": 12,
    "maxWeight": 60
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "date": "2025-01-15T09:00:00.000Z",
    "exerciseName": "Squat",
    "sets": [
      { "reps": 10, "weight": 55 }
    ],
    "totalReps": 10,
    "maxWeight": 55
  }
]
```

---

## 5. Schedule API

**Endpoint**: `/api/schedule`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/routes/schedule.js`

### 5.1. 루틴 스케줄 생성

**URL**: `POST /api/schedule`
**설명**: 특정 날짜에 루틴을 예약합니다.

**Request Body**:
```json
{
  "routineId": "507f1f77bcf86cd799439012",
  "scheduledDate": "2025-01-20T10:00:00.000Z",
  "notes": "아침 운동 - 하체 집중"
}
```

**Response** (201 Created):
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

### 5.2. 스케줄 조회

**URL**: `GET /api/schedule`
**설명**: 스케줄을 조회합니다. 필터링을 지원합니다.

**Query Parameters**:
- `completed` (optional): `true` | `false` - 완료 여부 필터
- `startDate` (optional): 시작 날짜
- `endDate` (optional): 종료 날짜

**Example Requests**:
```bash
# 모든 스케줄
GET /api/schedule

# 미완료 스케줄만
GET /api/schedule?completed=false

# 특정 기간
GET /api/schedule?startDate=2025-01-01&endDate=2025-01-31
```

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "routineId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "30분 하체 집중 루틴"
    },
    "scheduledDate": "2025-01-20T10:00:00.000Z",
    "completed": false,
    "notes": "아침 운동 - 하체 집중"
  }
]
```

---

### 5.3. 월별 캘린더 조회

**URL**: `GET /api/schedule/calendar/:year/:month`
**설명**: 특정 월의 모든 스케줄을 조회합니다 (캘린더 UI용).

**URL Parameters**:
- `year` (required): 연도 (예: 2025)
- `month` (required): 월 (1-12)

**Example Request**:
```bash
GET /api/schedule/calendar/2025/1
```

**Response** (200 OK):
```json
{
  "year": 2025,
  "month": 1,
  "schedules": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "routineId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "30분 하체 집중 루틴"
      },
      "scheduledDate": "2025-01-20T10:00:00.000Z",
      "completed": false
    }
  ]
}
```

---

### 5.4. 특정 스케줄 조회

**URL**: `GET /api/schedule/:id`
**설명**: 특정 스케줄의 상세 정보를 조회합니다.

**URL Parameters**:
- `id` (required): ScheduledRoutine ObjectId

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "routineId": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "30분 하체 집중 루틴",
    "segments": [...]
  },
  "scheduledDate": "2025-01-20T10:00:00.000Z",
  "completed": false,
  "notes": "아침 운동 - 하체 집중"
}
```

---

### 5.5. 스케줄 업데이트

**URL**: `PUT /api/schedule/:id`
**설명**: 스케줄을 수정합니다 (완료 표시, 날짜 변경 등).

**URL Parameters**:
- `id` (required): ScheduledRoutine ObjectId

**Request Body**:
```json
{
  "completed": true,
  "completedAt": "2025-01-20T11:30:00.000Z",
  "notes": "완료! 컨디션 좋았음"
}
```

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "routineId": "507f1f77bcf86cd799439012",
  "scheduledDate": "2025-01-20T10:00:00.000Z",
  "completed": true,
  "completedAt": "2025-01-20T11:30:00.000Z",
  "notes": "완료! 컨디션 좋았음"
}
```

---

### 5.6. 스케줄 삭제

**URL**: `DELETE /api/schedule/:id`
**설명**: 스케줄을 삭제합니다.

**URL Parameters**:
- `id` (required): ScheduledRoutine ObjectId

**Response** (200 OK):
```json
{
  "message": "Schedule deleted successfully"
}
```

---

## 6. Dashboard API

**Endpoint**: `/api/dashboard`
**파일 위치**: `/Users/jae/youtine-sesac-hackathon-2025/web-app/server/routes/dashboard.js`

### 6.1. 통계 조회

**URL**: `GET /api/dashboard/stats`
**설명**: 대시보드에 표시할 전체 통계를 조회합니다.

**Response** (200 OK):
```json
{
  "workoutsThisMonth": 15,
  "currentStreak": 5,
  "totalSets": 120,
  "totalReps": 1440,
  "topExercises": [
    {
      "_id": "Squat",
      "count": 30,
      "totalSets": 45
    },
    {
      "_id": "Push-up",
      "count": 25,
      "totalSets": 38
    },
    {
      "_id": "Lunge",
      "count": 20,
      "totalSets": 30
    }
  ]
}
```

**Note**:
- `workoutsThisMonth`: 이번 달 운동 기록 수
- `currentStreak`: 연속 운동 일수
- `totalSets`: 총 세트 수
- `totalReps`: 총 반복 횟수
- `topExercises`: 자주 하는 운동 TOP 5

---

### 6.2. 캘린더 데이터 조회

**URL**: `GET /api/dashboard/calendar`
**설명**: 캘린더 뷰를 위한 월별 운동 데이터를 조회합니다.

**Query Parameters**:
- `year` (required): 연도 (예: 2025)
- `month` (required): 월 (1-12)

**Example Request**:
```bash
GET /api/dashboard/calendar?year=2025&month=1
```

**Response** (200 OK):
```json
{
  "year": 2025,
  "month": 1,
  "workoutDays": [
    {
      "date": "2025-01-18",
      "count": 5,
      "exercises": ["Squat", "Push-up", "Lunge"]
    },
    {
      "date": "2025-01-19",
      "count": 3,
      "exercises": ["Bench Press", "Shoulder Press"]
    }
  ]
}
```

---

### 6.3. 운동 진행 상황 조회

**URL**: `GET /api/dashboard/progress`
**설명**: 특정 운동의 시간에 따른 진행 상황을 조회합니다 (차트용).

**Query Parameters**:
- `exerciseName` (required): 운동명
- `limit` (optional): 조회할 기록 수 (기본값: 30)

**Example Request**:
```bash
GET /api/dashboard/progress?exerciseName=Squat&limit=10
```

**Response** (200 OK):
```json
{
  "exerciseName": "Squat",
  "progress": [
    {
      "date": "2025-01-18",
      "totalReps": 36,
      "totalSets": 3,
      "maxWeight": 80,
      "avgWeight": 70
    },
    {
      "date": "2025-01-15",
      "totalReps": 30,
      "totalSets": 3,
      "maxWeight": 75,
      "avgWeight": 65
    }
  ]
}
```

---

## 🔧 공통 Error Responses

모든 API 엔드포인트는 다음 형식의 에러를 반환합니다:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "message": "endTime must be greater than startTime"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "Video with id 507f1f77bcf86cd799439011 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Failed to connect to MongoDB"
}
```

---

## 🧪 테스트 예시 (cURL)

### 영상 추가
```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### 세그먼트 검색
```bash
curl "http://localhost:3000/api/segments?search=squat&muscleGroup=legs"
```

### 루틴 생성
```bash
curl -X POST http://localhost:3000/api/routines \
  -H "Content-Type: application/json" \
  -d '{"name":"하체 루틴","segments":["507f191e810c19729de860ea"]}'
```

### 운동 기록 생성
```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-01-18T09:00:00Z","videoId":"507f1f77bcf86cd799439011","exerciseName":"Squat","sets":[{"reps":12,"weight":60}]}'
```

---

## 📚 참고 자료

- [Express.js 공식 문서](https://expressjs.com)
- [Mongoose Populate 가이드](https://mongoosejs.com/docs/populate.html)
- [RESTful API 디자인 가이드](https://restfulapi.net)

---

**작성일**: 2025-01-18
**작성자**: 잭과 콩이담
