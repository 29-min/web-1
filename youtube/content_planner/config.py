import os
from dotenv import load_dotenv

load_dotenv()

# YouTube Data API 키
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# LLM API 키 (역할 2: 스크립트 작성자)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "")  # 향후 사용

# 서버 설정
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# 검색 설정
MAX_RESULTS = 50  # YouTube API 기본 검색 결과 수
TOP_N = 10  # 최종 추출할 영상 수

