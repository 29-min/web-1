# 📋 Content Studio - 프로젝트 인수인계 문서

> **작성일**: 2026년 1월 28일  
> **프로젝트명**: Content Repurposer (Content Studio)  
> **목적**: 새로운 에이전트/개발자가 빠르게 프로젝트를 이해하고 작업할 수 있도록 작성된 인수인계 문서

---

## 🎯 프로젝트 개요

### 무엇을 하는 프로젝트인가?
**Content Studio**는 하나의 블로그 콘텐츠를 여러 소셜 미디어 채널(인스타그램, 스레드, 링크드인, X(트위터), 블로그)에 맞게 **자동 변환**하는 풀스택 웹 애플리케이션입니다.

### 핵심 기능
| 기능 | 설명 |
|------|------|
| **멀티 채널 변환** | 원본 콘텐츠를 5개 SNS 채널에 최적화된 형식으로 변환 |
| **URL 스크래핑** | 네이버 블로그, 티스토리, Medium, Velog, Brunch에서 자동 콘텐츠 추출 |
| **스타일 커스터마이징** | 톤앤매너, 타겟 독자, 이모지 사용량 조절 |
| **프롬프트 추출기** | 블로그 스타일 분석 후 동일 스타일 작성용 프롬프트 생성 |
| **발행 캘린더** | 일주일 발행 스케줄 자동 생성 |

---

## 🏗️ 기술 스택

### 백엔드 (`/backend`)
- **Framework**: FastAPI (Python)
- **AI/LLM**: LangChain + Google Gemini (`gemini-2.5-flash`)
- **웹 스크래핑**: BeautifulSoup4
- **배포**: Railway (Nixpacks)

### 프론트엔드 (`/frontend`)
- **Framework**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태관리**: Zustand
- **아이콘**: Lucide Icons
- **배포**: Vercel

---

## 📁 프로젝트 디렉토리 구조

```
bloggenerater/
├── 📂 backend/                    # Python 백엔드 서버
│   ├── main.py                   # FastAPI 앱 진입점 & API 라우터
│   ├── repurposer.py             # 콘텐츠 변환 엔진 (LangChain 체인)
│   ├── scraper.py                # 웹 스크래핑 (플랫폼별 파싱)
│   ├── prompts.py                # 채널별 프롬프트 템플릿
│   ├── style_analyzer.py         # 블로그 스타일 분석기
│   ├── requirements.txt          # Python 의존성
│   ├── Procfile                  # Heroku/Railway 시작 명령
│   └── runtime.txt               # Python 버전 명시
│
├── 📂 frontend/                   # Next.js 프론트엔드
│   ├── 📂 app/                   # App Router 페이지들
│   │   ├── page.tsx              # 메인 랜딩 페이지
│   │   ├── layout.tsx            # 전역 레이아웃
│   │   ├── globals.css           # 전역 스타일
│   │   ├── 📂 repurpose/         # 콘텐츠 변환기 페이지
│   │   ├── 📂 extract-prompt/    # 프롬프트 추출기 페이지
│   │   └── 📂 card-generator/    # 카드 이미지 생성기 페이지
│   │
│   ├── 📂 components/            # React 컴포넌트
│   │   ├── InputSection.tsx      # 콘텐츠 입력 섹션
│   │   ├── SettingsSection.tsx   # 스타일 설정 섹션
│   │   ├── ResultSection.tsx     # 변환 결과 표시 섹션
│   │   ├── WeeklyCalendar.tsx    # 발행 캘린더 컴포넌트
│   │   └── Navbar.tsx            # 네비게이션 바
│   │
│   ├── 📂 lib/                   # 유틸리티
│   │   ├── api.ts                # 백엔드 API 클라이언트
│   │   └── constants.ts          # 상수 정의
│   │
│   ├── 📂 store/                 # Zustand 상태 관리
│   ├── package.json              # npm 의존성
│   └── tailwind.config.js        # Tailwind 설정
│
├── .env                          # 환경 변수 (GEMINI_API_KEY)
├── nixpacks.toml                 # Railway 빌드 설정
├── railway.json                  # Railway 배포 설정
├── README.md                     # 일반 문서
└── DEPLOY.md                     # 배포 가이드
```

---

## 🔄 데이터 흐름 (아키텍처)

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   프론트엔드     │  HTTP   │    백엔드        │   API   │   Google        │
│   (Next.js)     │ ──────> │   (FastAPI)     │ ──────> │   Gemini AI     │
│   :3000         │         │   :8000         │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │
        │                           ├── scraper.py (URL 파싱)
        │                           ├── repurposer.py (LLM 체인)
        │                           ├── style_analyzer.py (스타일 분석)
        │                           └── prompts.py (프롬프트 템플릿)
        │
        └── lib/api.ts (API 클라이언트)
```

---

## 📡 API 엔드포인트 정리

| Method | Endpoint | 설명 | 요청 예시 |
|--------|----------|------|----------|
| `GET` | `/` | 서버 상태 확인 | - |
| `GET` | `/health` | 헬스 체크 | - |
| `GET` | `/channels` | 사용 가능한 채널 목록 | - |
| `GET` | `/prompts/{channel}` | 채널별 기본 프롬프트 | `channel`: blog, instagram, threads, linkedin, twitter |
| `POST` | `/scrape` | URL에서 콘텐츠 추출 | `{"url": "https://..."}` |
| `POST` | `/transform` | 콘텐츠 변환 | 아래 상세 참조 |
| `POST` | `/analyze-style` | 스타일 분석 | `{"url": "https://..."}` |
| `POST` | `/analyze-style-stream` | 스타일 분석 (SSE 스트리밍) | `{"url": "https://..."}` |

### `/transform` 요청 본문
```json
{
  "content": "원본 콘텐츠 텍스트...",
  "channels": ["blog", "instagram", "threads"],
  "style_config": {
    "tone": "캐주얼",           // 전문적, 캐주얼, 친근한, 유머러스, 격식체
    "target": "일반 대중",      // 일반 대중, 전문가, 초보자, MZ세대, 비즈니스
    "emoji_level": 1,          // 0~3
    "custom": "질문으로 끝내줘"
  },
  "custom_prompts": {
    "instagram": "커스텀 프롬프트..."  // 선택적
  }
}
```

---

## 🔑 파일별 핵심 로직 설명

### 백엔드

#### `main.py` - FastAPI 서버
- CORS 설정 (현재 `*` 허용)
- Pydantic 모델로 Request/Response 스키마 정의
- 모든 엔드포인트 라우팅

#### `repurposer.py` - 콘텐츠 변환 엔진
- `ContentRepurposer` 클래스: 핵심 변환 로직
- **LangChain LCEL 패턴** 사용: `prompt | llm | StrOutputParser()`
- `transform_single_with_style()`: 스타일 설정 적용하여 변환
- `generate_calendar()`: 발행 캘린더 JSON 생성

#### `scraper.py` - 웹 스크래핑
- `BlogScraper` 클래스
- 플랫폼별 선택자(CSS Selector) 정의
- 네이버 블로그 iframe 특별 처리
- 지원 플랫폼: 네이버, 티스토리, Velog, Brunch, Medium

#### `prompts.py` - 프롬프트 템플릿
- `CHANNEL_PROMPTS`: 채널별 변환 프롬프트 딕셔너리
- `CALENDAR_PROMPT`: 발행 캘린더 생성 프롬프트
- 새 채널 추가 시 여기에 프롬프트만 추가하면 됨

#### `style_analyzer.py` - 스타일 분석기
- `StyleAnalyzer` 클래스
- 블로그 톤앤매너 분석 후 프롬프트 생성
- JSON 형식 응답 파싱 처리

### 프론트엔드

#### `app/page.tsx` - 메인 페이지
- 랜딩 페이지 (기능 카드 2개: 변환기, 프롬프트 추출기)
- 그라데이션, 글래스모피즘 디자인

#### `lib/api.ts` - API 클라이언트
- 모든 백엔드 API 호출 함수 정의
- `NEXT_PUBLIC_API_URL` 환경변수로 백엔드 URL 설정

#### `components/` - UI 컴포넌트
- `InputSection.tsx`: URL 입력 + 콘텐츠 직접 입력
- `SettingsSection.tsx`: 스타일 설정 UI (톤, 타겟, 이모지 등)
- `ResultSection.tsx`: 변환 결과 탭 표시 + 복사 기능
- `WeeklyCalendar.tsx`: 발행 스케줄 시각화

---

## 🚀 로컬 개발 환경 설정

### 1. 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
# 또는
GOOGLE_API_KEY=your_google_api_key_here
```

### 2. 백엔드 실행
```bash
cd backend
pip install -r requirements.txt
python main.py
# 또는: uvicorn main:app --reload --port 8000
```
→ `http://localhost:8000` 에서 실행

### 3. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```
→ `http://localhost:3000` 에서 실행

---

## ☁️ 배포 구조

| 서비스 | 배포 플랫폼 | 구성 파일 |
|--------|------------|----------|
| Backend | **Railway** | `railway.json`, `nixpacks.toml` |
| Frontend | **Vercel** | `next.config.js` |

### Railway 배포 (백엔드)
- `railway.json`: 빌드/스타트 명령 정의
- `nixpacks.toml`: Python 환경 설정
- **환경 변수**: `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY` 설정 필요

### Vercel 배포 (프론트엔드)
- Root Directory: `frontend`
- **환경 변수**: `NEXT_PUBLIC_API_URL` = Railway 백엔드 URL

---

## ⚠️ 주의사항 및 알려진 이슈

1. **API 키**: `GEMINI_API_KEY`와 `GOOGLE_API_KEY` 둘 다 지원됨 (`repurposer.py` 참조)
2. **CORS**: 현재 `*` 허용, 프로덕션에서는 특정 도메인으로 제한 권장
3. **네이버 블로그**: iframe 처리 로직 있음, 모바일 URL도 지원
4. **콘텐츠 제한**: 스크래핑 결과 5000자로 제한됨 (`scraper.py`)

---

## 🔧 확장 가이드

### 새 SNS 채널 추가하기
1. `backend/prompts.py`의 `CHANNEL_PROMPTS`에 새 채널 추가
2. 프론트엔드 채널 선택 UI 업데이트 (자동 조회되므로 대부분 자동)

### 새 스크래핑 플랫폼 추가하기
1. `backend/scraper.py`의 `PLATFORM_SELECTORS`에 CSS 선택자 추가
2. `_detect_platform()` 메서드에 도메인 패턴 추가

### 스타일 옵션 추가하기
1. `backend/repurposer.py`의 `_build_style_instruction()` 수정
2. `frontend/components/SettingsSection.tsx`에 UI 추가

---

## 📞 문의

프로젝트 관련 문의사항이 있으면 이슈를 남겨주세요.

---

*마지막 업데이트: 2026년 1월 28일*
