# Content Repurposer 🔄

하나의 콘텐츠를 여러 소셜 미디어 채널에 맞게 자동 변환하는 풀스택 웹 애플리케이션입니다.

## 주요 기능

- **멀티 채널 변환**: 블로그, 인스타그램, 스레드, 링크드인, X(트위터)
- **URL 스크래핑**: 네이버 블로그, 티스토리, Medium 등 자동 추출
- **스타일 커스터마이징**: 톤, 타겟 독자, 이모지 사용량 조절
- **프롬프트 수정**: 채널별 변환 프롬프트 직접 수정 가능
- **발행 캘린더**: 일주일 발행 스케줄 자동 생성
- **모던 UI/UX**: Next.js + Tailwind CSS 기반 반응형 디자인

## 기술 스택

### 백엔드
- **FastAPI**: REST API 서버
- **LangChain**: LLM 체인 구성
- **Google Gemini**: 콘텐츠 변환 AI 모델
- **BeautifulSoup4**: 웹 스크래핑

### 프론트엔드
- **Next.js 14**: React 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Lucide Icons**: 아이콘 세트

## 설치 및 실행

### 1. 환경 설정

```bash
# 프로젝트 클론 또는 다운로드
cd 블로그\ 인스타변환기

# Python 의존성 설치
pip install -r Requirements.txt

# 환경 변수 설정
# .env 파일에 GEMINI_API_KEY 입력
```

### 2. Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/) 접속
2. "Get API Key" 클릭
3. 새 API 키 생성
4. `.env` 파일에 다음과 같이 입력:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### 3. 백엔드 실행

```bash
cd backend
python main.py
```

또는

```bash
uvicorn main:app --reload --port 8000
```

백엔드 API가 `http://localhost:8000` 에서 실행됩니다.

### 4. 프론트엔드 실행

새 터미널을 열고:

```bash
cd frontend
npm install  # 최초 1회만
npm run dev
```

프론트엔드가 `http://localhost:3000` 에서 실행됩니다.

## 사용 방법

1. **콘텐츠 입력**
   - URL 입력: 블로그 URL을 입력하고 "추출" 버튼 클릭
   - 텍스트 직접 입력: 원본 콘텐츠를 직접 입력

2. **채널 선택**
   - 변환하고 싶은 소셜 미디어 채널 선택

3. **스타일 설정**
   - 톤/어조: 전문적, 캐주얼, 친근한, 유머러스, 격식체
   - 타겟 독자: 일반 대중, 전문가, 초보자, MZ세대, 비즈니스
   - 이모지 사용량: 0~3단계
   - 추가 지시사항: 특정 요구사항 입력

4. **프롬프트 수정 (선택)**
   - "프롬프트 수정" 활성화
   - 각 채널별 기본 프롬프트 확인 및 수정
   - 초기화 버튼으로 기본값 복원

5. **변환 시작**
   - "변환 시작" 버튼 클릭
   - 진행률 확인 후 결과 확인

6. **결과 활용**
   - 탭에서 각 채널별 변환 결과 확인
   - 복사 버튼으로 클립보드에 복사
   - 발행 캘린더 참고하여 스케줄 계획

## API 엔드포인트

### GET /
서버 상태 확인

### GET /channels
사용 가능한 채널 목록 조회

### GET /prompts/{channel}
특정 채널의 기본 프롬프트 조회

### POST /scrape
URL에서 콘텐츠 추출
```json
{
  "url": "https://blog.example.com/post/123"
}
```

### POST /transform
콘텐츠 변환
```json
{
  "content": "원본 콘텐츠...",
  "channels": ["blog", "instagram", "threads"],
  "style_config": {
    "tone": "캐주얼",
    "target": "일반 대중",
    "emoji_level": 1,
    "custom": "질문으로 끝내줘"
  },
  "custom_prompts": {
    "instagram": "커스텀 프롬프트..."
  }
}
```

### GET /health
헬스 체크

## 지원 채널

| 채널 | 키 | 설명 |
|------|-----|------|
| 📝 블로그 | `blog` | SEO 최적화된 정보성 포스트 (300-500자) |
| 📸 인스타그램 | `instagram` | 캐주얼하고 감성적인 캡션 (150-200자) |
| 🧵 스레드 | `threads` | 대화형 짧은 포스트 (100-150자) |
| 💼 링크드인 | `linkedin` | 전문가적 인사이트 공유 (200-300자) |
| 🐦 X (트위터) | `twitter` | 임팩트 있는 짧은 트윗 (140자 이내) |

## 프로젝트 구조

```
블로그 인스타변환기/
├── backend/
│   ├── main.py              # FastAPI 서버
│   ├── repurposer.py        # 콘텐츠 변환 엔진
│   ├── scraper.py           # 웹 스크래핑
│   └── prompts.py           # 채널별 프롬프트 템플릿
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # 메인 페이지
│   │   └── layout.tsx       # 레이아웃
│   ├── components/
│   │   └── WeeklyCalendar.tsx  # 캘린더 컴포넌트
│   ├── lib/
│   │   └── api.ts           # API 클라이언트
│   └── package.json
├── Requirements.txt
├── .env
└── README.md
```

## 개발 가이드

### 백엔드 개발

```bash
# 가상환경 생성
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate

# 의존성 설치
pip install -r Requirements.txt

# 개발 서버 실행 (자동 리로드)
uvicorn main:app --reload
```

### 프론트엔드 개발

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 환경 변수

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 트러블슈팅

### "ModuleNotFoundError" 발생 시
```bash
# backend 폴더에서 실행
cd backend
python main.py
```

### CORS 에러 발생 시
- 백엔드의 `main.py`에서 CORS 설정 확인
- 프론트엔드 URL이 허용 목록에 포함되어 있는지 확인

### API 키 관련 에러
- `.env` 파일이 `backend/` 폴더에 있는지 확인
- API 키가 유효한지 [Google AI Studio](https://aistudio.google.com/)에서 확인

## 라이선스

MIT

## 기여

이슈와 PR을 환영합니다!
