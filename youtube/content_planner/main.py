"""
YouTube 인기 영상 분석 API 서버
필터링 및 가중치 조절 기능 지원
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import youtube_analyzer
from youtube_analyzer import SearchFilters
import transcript
import script_generator
import config

app = FastAPI(
    title="YouTube 콘텐츠 플래너",
    description="인기 영상 분석 및 AI 스크립트 재구성 도구",
    version="2.3.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")


class SearchRequest(BaseModel):
    """검색 요청 모델"""
    keyword: str
    top_n: int = 10
    
    # 콘텐츠 타입 필터
    shorts_only: bool = False
    exclude_shorts: bool = False
    
    # 영상 길이 필터
    duration_filter: str = "any"  # any, short, medium, long
    
    # 업로드 기간 필터
    upload_period: str = "any"  # any, day, week, month, year
    
    # 언어 필터
    language: str = "any"  # any, ko, en, ja, zh
    
    # 가중치 (0-100) - 최신성 중심
    recency_weight: int = 25
    engagement_weight: int = 40
    views_weight: int = 35
    
    # 트렌딩 모드
    trending_mode: bool = False
    
    # 최소 조회수
    min_views: int = 0


@app.get("/")
async def root():
    """메인 페이지"""
    return FileResponse("static/index.html")


@app.get("/api/trending")
async def get_trending_videos(
    top_n: int = Query(default=10, ge=1, le=30)
):
    """
    오늘의 인기 영상 Top N 반환
    초기 화면에 표시할 트렌딩 영상
    """
    if not config.YOUTUBE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="YouTube API 키가 설정되지 않았습니다."
        )
    
    # AI 개발 관련 키워드 리스트
    trending_keywords = [
        "AI 개발",
        "인공지능 개발",
        "ChatGPT 활용",
        "AI 프로그래밍",
        "머신러닝 튜토리얼"
    ]
    
    try:
        all_videos = []
        filters = SearchFilters(
            exclude_shorts=True,  # 쇼츠 제외
            upload_period="week",  # 이번 주 영상
            trending_mode=True,    # 일일 조회수 기준
            recency_weight=30,     # 최신성 가중치 높게
            engagement_weight=40,
            views_weight=30
        )
        
        # 여러 키워드로 검색하여 영상 수집
        for keyword in trending_keywords[:2]:  # API 할당량 절약을 위해 2개만
            try:
                results = youtube_analyzer.analyze_top_videos(keyword, 10, filters)
                all_videos.extend(results)
            except:
                continue
        
        if not all_videos:
            # 대체 키워드 시도
            results = youtube_analyzer.analyze_top_videos("trending", top_n, filters)
            all_videos = results
        
        # 중복 제거 (video_id 기준)
        seen_ids = set()
        unique_videos = []
        for video in all_videos:
            if video["video_id"] not in seen_ids:
                seen_ids.add(video["video_id"])
                unique_videos.append(video)
        
        # 일일 조회수 기준 정렬
        unique_videos.sort(key=lambda x: x.get("views_per_day", 0), reverse=True)
        
        return {
            "success": True,
            "type": "trending",
            "count": min(len(unique_videos), top_n),
            "videos": unique_videos[:top_n]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/search")
async def search_top_videos_get(
    keyword: str = Query(..., min_length=1),
    top_n: int = Query(default=10, ge=1, le=50),
    shorts_only: bool = Query(default=False),
    exclude_shorts: bool = Query(default=False),
    duration_filter: str = Query(default="any"),
    upload_period: str = Query(default="any"),
    language: str = Query(default="any"),
    recency_weight: int = Query(default=25, ge=0, le=100),
    engagement_weight: int = Query(default=40, ge=0, le=100),
    views_weight: int = Query(default=35, ge=0, le=100),
    trending_mode: bool = Query(default=False),
    min_views: int = Query(default=0, ge=0)
):
    """GET 방식 검색 API (최대 50개 지원)"""
    if not config.YOUTUBE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="YouTube API 키가 설정되지 않았습니다."
        )
    
    try:
        filters = SearchFilters(
            shorts_only=shorts_only,
            exclude_shorts=exclude_shorts,
            duration_filter=duration_filter,
            upload_period=upload_period,
            language=language,
            recency_weight=recency_weight,
            engagement_weight=engagement_weight,
            views_weight=views_weight,
            trending_mode=trending_mode,
            min_views=min_views
        )
        
        results = youtube_analyzer.analyze_top_videos(keyword, top_n, filters)
        
        return {
            "success": True,
            "keyword": keyword,
            "count": len(results),
            "total_available": min(50, len(results) + 20),  # 더보기 가능 여부
            "filters": {
                "shorts_only": shorts_only,
                "exclude_shorts": exclude_shorts,
                "duration_filter": duration_filter,
                "upload_period": upload_period,
                "language": language,
                "trending_mode": trending_mode
            },
            "videos": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search")
async def search_top_videos_post(request: SearchRequest):
    """POST 방식 검색 API"""
    if not config.YOUTUBE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="YouTube API 키가 설정되지 않았습니다."
        )
    
    try:
        filters = SearchFilters(
            shorts_only=request.shorts_only,
            exclude_shorts=request.exclude_shorts,
            duration_filter=request.duration_filter,
            upload_period=request.upload_period,
            language=request.language,
            recency_weight=request.recency_weight,
            engagement_weight=request.engagement_weight,
            views_weight=request.views_weight,
            trending_mode=request.trending_mode,
            min_views=request.min_views
        )
        
        results = youtube_analyzer.analyze_top_videos(
            request.keyword, 
            request.top_n, 
            filters
        )
        
        return {
            "success": True,
            "keyword": request.keyword,
            "count": len(results),
            "videos": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "api_key_configured": bool(config.YOUTUBE_API_KEY),
        "version": "2.2.0"
    }


@app.get("/api/transcript/{video_id}")
async def get_video_transcript(
    video_id: str,
    lang: str = Query(default="ko", description="선호 언어 (ko, en, ja, zh)"),
    timestamps: bool = Query(default=False, description="타임스탬프 포함 여부")
):
    """
    YouTube 영상 스크립트/자막 추출
    
    - video_id: YouTube 영상 ID 또는 URL
    - lang: 선호 언어 (기본: 한국어)
    - timestamps: 타임스탬프 포함 여부
    """
    # 언어 우선순위 설정
    lang_priority = {
        "ko": ["ko", "en", "ja"],
        "en": ["en", "ko", "ja"],
        "ja": ["ja", "ko", "en"],
        "zh": ["zh-Hans", "zh-Hant", "ko", "en"]
    }
    languages = lang_priority.get(lang, ["ko", "en"])
    
    result = transcript.get_transcript(
        video_id,
        languages=languages,
        include_timestamps=timestamps
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=404,
            detail=result["error"]
        )
    
    return result


@app.get("/api/transcript/{video_id}/languages")
async def get_available_transcript_languages(video_id: str):
    """해당 영상에서 사용 가능한 자막 언어 목록 조회"""
    result = transcript.get_available_languages(video_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=404,
            detail=result["error"]
        )
    
    return result


# ============================================
# 스크립트 재구성 API (역할 2)
# ============================================

class RewriteRequest(BaseModel):
    """스크립트 재구성 요청 모델"""
    original_script: str
    style: str = "informative"  # informative, entertaining, educational, conversational
    target_length: str = "similar"  # shorter, similar, longer
    additional_instructions: str = ""
    provider: str = "gemini"  # gemini, claude


@app.post("/api/rewrite")
async def rewrite_script_api(request: RewriteRequest):
    """
    AI를 활용한 스크립트 재구성
    
    - original_script: 원본 스크립트
    - style: 스타일 (informative, entertaining, educational, conversational)
    - target_length: 길이 (shorter, similar, longer)
    - provider: LLM 제공자 (gemini, claude)
    """
    if not request.original_script.strip():
        raise HTTPException(
            status_code=400,
            detail="원본 스크립트가 비어있습니다."
        )
    
    result = script_generator.rewrite_script(
        original_script=request.original_script,
        style=request.style,
        target_length=request.target_length,
        additional_instructions=request.additional_instructions,
        provider_name=request.provider
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result["error"]
        )
    
    return result


@app.post("/api/analyze-script")
async def analyze_script_api(request: RewriteRequest):
    """스크립트 분석 (구조, 주제, 톤 파악)"""
    if not request.original_script.strip():
        raise HTTPException(
            status_code=400,
            detail="스크립트가 비어있습니다."
        )
    
    result = script_generator.analyze_script(
        script=request.original_script,
        provider_name=request.provider
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result["error"]
        )
    
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=config.HOST, port=config.PORT)

