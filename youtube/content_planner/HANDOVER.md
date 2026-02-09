# YouTube 콘텐츠 플래너 - 통합용 인수인계서

> 🎯 **목적**: 기존 AI 콘텐츠 글 작성 웹과 통합하여 마케팅 플랫폼 구축

---

## 📁 프로젝트 구조

```
youtube/content_planner/
├── main.py              # FastAPI 메인 서버 (엔트리포인트)
├── config.py            # 환경 변수 및 설정
├── youtube_analyzer.py  # YouTube 검색 및 품질 점수 계산
├── transcript.py        # 스크립트 추출 (youtube-transcript-api)
├── script_generator.py  # AI 스크립트 재구성 (현재 미사용)
├── providers/           # LLM 추상화 레이어
│   ├── base.py         # LLMProvider 인터페이스
│   ├── gemini.py       # Gemini 구현
│   └── claude.py       # Claude 스텁
├── static/
│   ├── index.html      # 메인 UI
│   ├── app.js          # 프론트엔드 로직
│   └── styles.css      # 스타일시트
├── requirements.txt    # Python 의존성
└── .env                # API 키 (gitignore 필수)
```

---

## 🔌 API 엔드포인트

### 1. YouTube 검색 API
```http
POST /api/analyze
{
  "keyword": "AI 개발",
  "top_n": 10,
  "language_filter": "ko"
}
```

### 2. 트렌딩 영상 API
```http
GET /api/trending?language={ko|en|ja|zh}
```

### 3. 스크립트 추출 API
```http
GET /api/transcript/{video_id}?include_timestamps=true
```

### 4. AI 스크립트 재구성 (준비됨, 현재 비활성)
```http
POST /api/rewrite
{
  "original_script": "...",
  "style": "informative",
  "provider": "gemini"
}
```

---

## 🔑 필수 환경변수

```bash
YOUTUBE_API_KEY=your_youtube_api_key
GEMINI_API_KEY=your_gemini_api_key    # AI 재구성 시 필요
```

---

## 🧩 통합 방법

### 방법 1: API 통합 (권장)
기존 웹에서 이 서버의 API를 호출

### 방법 2: 코드 병합
```python
from youtube_router import router as youtube_router
app.include_router(youtube_router, prefix="/youtube")
```

### 방법 3: 마이크로서비스
각각 독립 배포 후 API Gateway로 연결

---

## 📦 핵심 모듈

| 파일 | 용도 |
|------|------|
| `youtube_analyzer.py` | 검색 + 품질 점수 계산 |
| `transcript.py` | 자막 추출 |
| `providers/` | LLM 추상화 (Gemini/Claude 교체 가능) |

---

## 🚀 실행 방법

```bash
cd youtube/content_planner
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 📊 품질 점수 알고리즘

```
점수 = 조회수(35%) + 참여율(40%) + 최신성(25%)
```

---

## ⚠️ 배포 주의사항

1. **API 키 보안**: 환경변수로만 관리
2. **CORS**: 프로덕션에서 도메인 제한 필요
3. **Rate Limit**: YouTube API 일일 10,000 유닛

---

*작성일: 2026-02-02*
