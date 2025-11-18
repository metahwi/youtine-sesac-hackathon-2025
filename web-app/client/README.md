# YouTine Client (Frontend)

> React 19 기반 프론트엔드 애플리케이션

---

## 🛠️ 기술 스택

- **React 19.1.0** - 최신 React (RSC 지원)
- **Vite 6.3.5** - 고속 빌드 도구
- **Tailwind CSS 4.1.7** - 유틸리티 기반 스타일링
- **React Router DOM 7.6.1** - 클라이언트 라우팅
- **Axios 1.12.2** - HTTP 클라이언트
- **Framer Motion 12.15.0** - 애니메이션
- **Recharts 2.15.3** - 차트 라이브러리

---

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── App.jsx         # 메인 앱 (라우팅)
│   ├── SmartPlayer.jsx # 핵심: 다중 세그먼트 재생
│   ├── SegmentLibrary.jsx
│   ├── VideoLibrary.jsx
│   ├── RoutineList.jsx
│   ├── DashboardPage.jsx
│   └── ui/             # 재사용 UI 컴포넌트
│
├── services/
│   └── api.js          # API 클라이언트
│
├── contexts/
│   └── LanguageContext.jsx  # i18n 상태 관리
│
├── i18n/
│   └── translations.js # 한국어/영어 번역
│
└── utils/
    └── logger.js       # 로깅 유틸리티
```

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- pnpm (권장) 또는 npm

### 설치

```bash
cd web-app/client
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

서버가 `http://localhost:5173`에서 실행됩니다.

### 빌드

```bash
pnpm build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

---

## 🔧 환경 설정

### API Proxy

개발 환경에서는 Vite가 `/api` 요청을 `http://localhost:3000`으로 프록시합니다.

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### 프로덕션 환경

프로덕션에서는 `VITE_API_URL` 환경 변수로 API URL을 설정할 수 있습니다:

```bash
VITE_API_URL=https://your-api.com pnpm build
```

---

## 🧪 테스트

```bash
# 테스트 실행
pnpm test

# 커버리지 확인
pnpm test:coverage

# UI 모드로 실행
pnpm test:ui
```

---

## 🎨 스타일링

### Tailwind CSS

이 프로젝트는 Tailwind CSS 4.x를 사용합니다:

```javascript
// 예시
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold">제목</h2>
</div>
```

### 커스텀 테마

`tailwind.config.js`에서 커스텀 색상 및 폰트를 설정할 수 있습니다.

---

## 🌐 다국어 지원 (i18n)

### 사용 방법

```javascript
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => setLanguage('ko')}>한국어</button>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

### 번역 추가

`src/i18n/translations.js`에서 번역을 추가하세요:

```javascript
export const translations = {
  en: {
    welcome: 'Welcome to YouTine'
  },
  ko: {
    welcome: 'YouTine에 오신 것을 환영합니다'
  }
};
```

---

## 📦 주요 컴포넌트

### SmartPlayer

여러 YouTube 영상의 특정 구간들을 끊김 없이 연속 재생하는 핵심 컴포넌트입니다.

**위치**: `src/components/SmartPlayer.jsx`

**사용 예시**:
```javascript
<SmartPlayer
  segments={[
    { sourceVideoId: { url: 'https://...' }, startTime: 120, endTime: 180 },
    { sourceVideoId: { url: 'https://...' }, startTime: 200, endTime: 250 }
  ]}
  onClose={() => setShowPlayer(false)}
/>
```

### SegmentLibrary

AI가 추출한 운동 구간들을 카드 형태로 표시하고, 검색 및 필터링을 지원합니다.

**위치**: `src/components/SegmentLibrary.jsx`

---

## 🔌 API 통신

### API 클라이언트

`src/services/api.js`에서 Axios 인스턴스를 제공합니다:

```javascript
import api from '../services/api';

// GET 요청
const videos = await api.get('/videos');

// POST 요청
const newVideo = await api.post('/videos', { url: 'https://...' });

// DELETE 요청
await api.delete(`/videos/${id}`);
```

---

## 📊 상태 관리

현재는 React Hooks (useState, useContext)를 사용합니다.

향후 확장 시 Redux Toolkit 또는 Zustand 도입을 고려할 수 있습니다.

---

## 🐛 디버깅

### Logger 사용

```javascript
import logger from '../utils/logger';

logger.info('User clicked button');
logger.error('Failed to fetch data', error);
logger.debug('API response', data);
```

### React DevTools

Chrome 확장 프로그램 설치:
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

---

## 📝 코딩 컨벤션

### 파일명
- 컴포넌트: PascalCase (예: `SmartPlayer.jsx`)
- 유틸리티: camelCase (예: `logger.js`)

### 컴포넌트 구조
```javascript
// 1. Imports
import React from 'react';

// 2. 컴포넌트
function MyComponent({ prop1, prop2 }) {
  // 3. Hooks
  const [state, setState] = useState();

  // 4. 이벤트 핸들러
  const handleClick = () => {
    // ...
  };

  // 5. JSX
  return (
    <div>
      {/* ... */}
    </div>
  );
}

// 6. Export
export default MyComponent;
```

---

## 🚢 배포

### Vercel (추천)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 환경 변수 설정
Vercel 대시보드에서 `VITE_API_URL` 환경 변수를 설정하세요.

---

## 📚 참고 자료

- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [Tailwind CSS 공식 문서](https://tailwindcss.com)
- [Vitest 공식 문서](https://vitest.dev)

---

**작성일**: 2025-01-18
