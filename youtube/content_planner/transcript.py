"""
YouTube 스크립트/자막 추출 모듈
youtube-transcript-api 1.2.x 버전 사용
"""

from youtube_transcript_api import YouTubeTranscriptApi
import re


def extract_video_id(url_or_id: str) -> str:
    """YouTube URL 또는 Video ID에서 Video ID 추출"""
    if len(url_or_id) == 11 and not url_or_id.startswith('http'):
        return url_or_id
    
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)
    
    return url_or_id


def get_transcript(
    video_id: str,
    languages: list[str] = None,
    include_timestamps: bool = False
) -> dict:
    """
    YouTube 영상의 자막/스크립트 추출
    
    Args:
        video_id: YouTube 영상 ID 또는 URL
        languages: 선호 언어 목록 (예: ['ko', 'en'])
        include_timestamps: 타임스탬프 포함 여부
    
    Returns:
        dict: 스크립트 정보 (text, language, segments)
    """
    video_id = extract_video_id(video_id)
    
    if languages is None:
        languages = ['ko', 'en', 'ja', 'zh-Hans', 'zh-Hant']
    
    try:
        # 간단한 API 호출
        ytt_api = YouTubeTranscriptApi()
        fetched = ytt_api.fetch(video_id, languages=languages)
        
        # 전체 텍스트 생성
        if include_timestamps:
            text_lines = []
            for segment in fetched:
                minutes = int(segment.start // 60)
                seconds = int(segment.start % 60)
                text_lines.append(f"[{minutes:02d}:{seconds:02d}] {segment.text}")
            full_text = '\n'.join(text_lines)
        else:
            full_text = ' '.join([s.text for s in fetched])
        
        return {
            "success": True,
            "video_id": video_id,
            "language": languages[0],  # 첫 번째 언어 사용 가정
            "is_generated": False,
            "text": full_text,
            "segments": None,
            "word_count": len(full_text.split())
        }
        
    except Exception as e:
        error_msg = str(e)
        
        if "Subtitles are disabled" in error_msg:
            error_msg = "이 영상은 자막이 비활성화되어 있습니다."
        elif "No transcript" in error_msg or "Could not retrieve" in error_msg:
            error_msg = "이 영상에는 자막이 없습니다."
        elif "Video unavailable" in error_msg:
            error_msg = "영상을 찾을 수 없습니다."
        
        return {
            "success": False,
            "error": error_msg,
            "video_id": video_id
        }


def get_available_languages(video_id: str) -> dict:
    """해당 영상에서 사용 가능한 자막 언어 목록 조회"""
    video_id = extract_video_id(video_id)
    
    try:
        ytt_api = YouTubeTranscriptApi()
        transcript_list = ytt_api.list(video_id)
        
        manual = []
        generated = []
        
        for transcript in transcript_list:
            info = {
                "code": transcript.language_code,
                "name": transcript.language
            }
            if transcript.is_generated:
                generated.append(info)
            else:
                manual.append(info)
        
        return {
            "success": True,
            "video_id": video_id,
            "manual_captions": manual,
            "auto_generated": generated
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "video_id": video_id
        }
