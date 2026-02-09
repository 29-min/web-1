"""
YouTube 인기 영상 분석기
조회수와 콘텐츠 품질을 기반으로 Top 10 영상을 추출합니다.
필터링 및 가중치 조절 기능 지원
"""

from datetime import datetime, timezone
from typing import Optional
from dataclasses import dataclass
import re
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import config


@dataclass
class SearchFilters:
    """검색 필터 옵션"""
    # 콘텐츠 타입 필터
    shorts_only: bool = False          # 쇼츠만 보기
    exclude_shorts: bool = False       # 쇼츠 제외
    
    # 영상 길이 필터
    duration_filter: str = "any"       # any, short(<4min), medium(4-20min), long(>20min)
    
    # 업로드 기간 필터
    upload_period: str = "any"         # any, day, week, month, year
    
    # 언어 필터
    language: str = "any"              # any, ko(한국어), en(영어), ja(일본어), zh(중국어)
    
    # 가중치 조절 (0-100)
    recency_weight: int = 25           # 최신성 가중치 (기본 25%)
    engagement_weight: int = 40        # 참여율 가중치 (좋아요+댓글, 기본 40%)
    views_weight: int = 35             # 조회수 가중치 (기본 35%)
    
    # 트렌딩 모드 (일일 조회수 기준)
    trending_mode: bool = False        # 조회수/일수 로 순위
    
    # 최소 조회수
    min_views: int = 0


def create_youtube_client():
    """YouTube API 클라이언트 생성"""
    if not config.YOUTUBE_API_KEY:
        raise ValueError("YOUTUBE_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.")
    return build("youtube", "v3", developerKey=config.YOUTUBE_API_KEY)


def parse_duration_to_seconds(duration: str) -> int:
    """ISO 8601 기간을 초로 변환 (예: PT1H2M3S -> 3723)"""
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


def is_shorts(duration_seconds: int, title: str = "") -> bool:
    """쇼츠 영상인지 판단 (60초 이하 또는 #shorts 태그)"""
    # 제목에 쇼츠 관련 태그가 있으면 쇼츠로 판단
    title_lower = title.lower()
    if "#shorts" in title_lower or "#쇼츠" in title or "shorts" in title_lower:
        return True
    # 60초 이하 영상은 쇼츠
    if duration_seconds <= 60:
        return True
    return False


def get_upload_date_filter(period: str) -> Optional[str]:
    """업로드 기간에 따른 RFC 3339 날짜 반환"""
    if period == "any":
        return None
    
    now = datetime.now(timezone.utc)
    if period == "day":
        delta = 1
    elif period == "week":
        delta = 7
    elif period == "month":
        delta = 30
    elif period == "year":
        delta = 365
    else:
        return None
    
    from datetime import timedelta
    past = now - timedelta(days=delta)
    return past.strftime("%Y-%m-%dT%H:%M:%SZ")


def search_videos(keyword: str, filters: SearchFilters, max_results: int = 50) -> list[dict]:
    """
    키워드로 YouTube 영상 검색 (필터 적용)
    """
    youtube = create_youtube_client()
    
    try:
        # 언어 코드 매핑
        language_mapping = {
            "any": None,
            "ko": ("KR", "ko"),  # (지역코드, 언어코드)
            "en": ("US", "en"),
            "ja": ("JP", "ja"),
            "zh": ("CN", "zh-Hans")
        }
        
        # 언어 설정
        region_code = "KR"
        relevance_lang = "ko"
        if filters.language in language_mapping and language_mapping[filters.language]:
            region_code, relevance_lang = language_mapping[filters.language]
        
        # 검색 파라미터 구성
        search_params = {
            "q": keyword,
            "part": "id,snippet",
            "type": "video",
            "order": "viewCount",
            "maxResults": min(max_results, 50),
            "regionCode": region_code,
            "relevanceLanguage": relevance_lang
        }
        
        # 영상 길이 필터
        if filters.duration_filter == "short":
            search_params["videoDuration"] = "short"  # < 4분
        elif filters.duration_filter == "medium":
            search_params["videoDuration"] = "medium"  # 4-20분
        elif filters.duration_filter == "long":
            search_params["videoDuration"] = "long"  # > 20분
        
        # 업로드 기간 필터
        published_after = get_upload_date_filter(filters.upload_period)
        if published_after:
            search_params["publishedAfter"] = published_after
        
        search_response = youtube.search().list(**search_params).execute()
        
        videos = []
        for item in search_response.get("items", []):
            videos.append({
                "video_id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
                "channel_title": item["snippet"]["channelTitle"],
                "published_at": item["snippet"]["publishedAt"],
                "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
                "description": item["snippet"]["description"][:200]
            })
        
        return videos
    
    except HttpError as e:
        raise Exception(f"YouTube API 오류: {e}")


def get_video_statistics(video_ids: list[str]) -> dict:
    """영상 통계 정보 조회 (조회수, 좋아요, 댓글 수, 재생시간)"""
    youtube = create_youtube_client()
    
    try:
        stats_response = youtube.videos().list(
            part="statistics,contentDetails",
            id=",".join(video_ids)
        ).execute()
        
        stats = {}
        for item in stats_response.get("items", []):
            video_id = item["id"]
            statistics = item.get("statistics", {})
            duration_str = item.get("contentDetails", {}).get("duration", "PT0S")
            duration_seconds = parse_duration_to_seconds(duration_str)
            
            stats[video_id] = {
                "view_count": int(statistics.get("viewCount", 0)),
                "like_count": int(statistics.get("likeCount", 0)),
                "comment_count": int(statistics.get("commentCount", 0)),
                "duration": duration_str,
                "duration_seconds": duration_seconds,
                "is_shorts": is_shorts(duration_seconds)
            }
        
        return stats
    
    except HttpError as e:
        raise Exception(f"YouTube API 오류: {e}")


def calculate_quality_score(
    view_count: int,
    like_count: int,
    comment_count: int,
    published_at: str,
    max_views: int,
    filters: SearchFilters
) -> dict:
    """
    영상 품질 점수 계산 (가중치 조절 가능)
    """
    # 가중치 정규화 (합이 100이 되도록)
    total_weight = filters.views_weight + filters.engagement_weight + filters.recency_weight
    if total_weight == 0:
        total_weight = 100
    
    view_w = filters.views_weight / total_weight
    engagement_w = filters.engagement_weight / total_weight
    recency_w = filters.recency_weight / total_weight
    
    # 조회수 정규화 (0~1)
    view_score = (view_count / max_views) if max_views > 0 else 0
    
    # 좋아요 비율 (0~1)
    like_ratio = (like_count / view_count) if view_count > 0 else 0
    like_score = min(like_ratio / 0.05, 1)
    
    # 댓글 참여율 (0~1)
    comment_ratio = (comment_count / view_count) if view_count > 0 else 0
    comment_score = min(comment_ratio / 0.01, 1)
    
    # 참여율 점수 (좋아요 + 댓글 평균)
    engagement_score = (like_score * 0.6 + comment_score * 0.4)
    
    # 최신성 점수
    try:
        pub_date = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        days_ago = (datetime.now(timezone.utc) - pub_date).days
        recency_score = max(0, 1 - (days_ago / 365))
    except:
        recency_score = 0.5
        days_ago = 180
    
    # 최종 점수 계산
    final_score = (
        view_score * view_w +
        engagement_score * engagement_w +
        recency_score * recency_w
    ) * 100
    
    # 트렌딩 점수 (조회수/일수)
    views_per_day = view_count / max(days_ago, 1)
    
    return {
        "quality_score": round(final_score, 2),
        "views_per_day": round(views_per_day, 0),
        "days_ago": days_ago,
        "engagement_rate": round((like_ratio + comment_ratio) * 100, 2)
    }


def analyze_top_videos(
    keyword: str, 
    top_n: int = 10,
    filters: Optional[SearchFilters] = None
) -> list[dict]:
    """
    키워드로 검색하여 품질 점수 기준 Top N 영상 추출
    """
    if filters is None:
        filters = SearchFilters()
    
    # 1. 영상 검색
    videos = search_videos(keyword, filters, max_results=config.MAX_RESULTS)
    
    if not videos:
        return []
    
    # 2. 통계 정보 조회
    video_ids = [v["video_id"] for v in videos]
    stats = get_video_statistics(video_ids)
    
    # 3. 필터 적용 (쇼츠 필터)
    filtered_videos = []
    for video in videos:
        vid = video["video_id"]
        if vid not in stats:
            continue
        
        video_stats = stats[vid]
        
        # 쇼츠 필터 (제목 기반 재확인)
        video_is_shorts = is_shorts(video_stats["duration_seconds"], video["title"])
        if filters.shorts_only and not video_is_shorts:
            continue
        if filters.exclude_shorts and video_is_shorts:
            continue
        
        # 최소 조회수 필터
        if video_stats["view_count"] < filters.min_views:
            continue
        
        filtered_videos.append((video, video_stats))
    
    if not filtered_videos:
        return []
    
    # 4. 최대 조회수 계산 (정규화용)
    max_views = max(s["view_count"] for _, s in filtered_videos)
    
    # 5. 품질 점수 계산 및 결합
    results = []
    for video, video_stats in filtered_videos:
        vid = video["video_id"]
        
        scores = calculate_quality_score(
            view_count=video_stats["view_count"],
            like_count=video_stats["like_count"],
            comment_count=video_stats["comment_count"],
            published_at=video["published_at"],
            max_views=max_views,
            filters=filters
        )
        
        results.append({
            **video,
            **video_stats,
            **scores,
            "url": f"https://www.youtube.com/watch?v={vid}"
        })
    
    # 6. 정렬 (트렌딩 모드 or 품질 점수)
    if filters.trending_mode:
        results.sort(key=lambda x: x["views_per_day"], reverse=True)
    else:
        results.sort(key=lambda x: x["quality_score"], reverse=True)
    
    return results[:top_n]
