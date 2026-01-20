# Content Repurposer - Backend

FastAPI 기반 백엔드 서버

## 설치 및 실행

```bash
# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env에 GEMINI_API_KEY 입력

# 개발 서버 실행
uvicorn main:app --reload

# 또는
python main.py
```

서버: http://localhost:8000
API 문서: http://localhost:8000/docs

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | API 정보 |
| GET | `/channels` | 채널 목록 |
| POST | `/scrape` | URL에서 콘텐츠 추출 |
| POST | `/transform` | 콘텐츠 변환 |
| GET | `/health` | 헬스 체크 |

## 배포 (Railway)

1. Railway 프로젝트 생성
2. GitHub 연결 또는 코드 업로드
3. 환경변수에 `GEMINI_API_KEY` 추가
4. 자동 배포