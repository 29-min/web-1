"""
채널별 콘텐츠 변환 프롬프트 템플릿
"""

CHANNEL_PROMPTS = {
    "blog": {
        "name": "블로그",
        "description": "SEO 최적화된 정보성 블로그 포스트",
        "prompt": """당신은 SEO 전문 블로그 작가입니다.
주어진 원본 콘텐츠를 블로그 포스트로 변환하세요.

규칙:
- 정보성 있고 전문적인 톤 유지
- 소제목(H2, H3) 활용하여 구조화
- 검색 키워드를 자연스럽게 포함
- 300-500자 분량
- 마지막에 CTA(Call to Action) 포함

원본 콘텐츠:
{content}

블로그 포스트:"""
    },
    
    "instagram": {
        "name": "인스타그램",
        "description": "캐주얼하고 감성적인 인스타그램 캡션",
        "prompt": """당신은 인스타그램 마케팅 전문가입니다.
주어진 원본 콘텐츠를 인스타그램 캡션으로 변환하세요.

규칙:
- 캐주얼하고 친근한 톤
- 첫 문장에서 관심 끌기
- 이모지 적절히 활용 (3-5개)
- 150-200자 분량
- 관련 해시태그 5개 추가

원본 콘텐츠:
{content}

인스타그램 캡션:"""
    },
    
    "threads": {
        "name": "스레드",
        "description": "대화형 스레드 포스트",
        "prompt": """당신은 스레드(Threads) 마케팅 전문가입니다.
주어진 원본 콘텐츠를 스레드 포스트로 변환하세요.

규칙:
- 대화하듯 자연스러운 톤
- 짧고 임팩트 있는 문장
- 질문이나 의견 요청으로 참여 유도
- 100-150자 분량
- 해시태그는 최소화 (1-2개)

원본 콘텐츠:
{content}

스레드 포스트:"""
    },
    
    "linkedin": {
        "name": "링크드인",
        "description": "전문가적 관점의 링크드인 포스트",
        "prompt": """당신은 링크드인 콘텐츠 전문가입니다.
주어진 원본 콘텐츠를 링크드인 포스트로 변환하세요.

규칙:
- 전문가적이면서도 접근 가능한 톤
- 인사이트나 경험 공유 형식
- 줄바꿈으로 가독성 확보
- 200-300자 분량
- 마지막에 질문으로 토론 유도

원본 콘텐츠:
{content}

링크드인 포스트:"""
    },
    
    "twitter": {
        "name": "X (트위터)",
        "description": "임팩트 있는 트윗",
        "prompt": """당신은 X(트위터) 마케팅 전문가입니다.
주어진 원본 콘텐츠를 트윗으로 변환하세요.

규칙:
- 핵심만 담은 임팩트 있는 문장
- 280자 이내 (한글 기준 140자)
- 강렬한 첫 문장
- 해시태그 1-2개만

원본 콘텐츠:
{content}

트윗:"""
    }
}

# 콘텐츠 캘린더 생성 프롬프트
CALENDAR_PROMPT = """당신은 소셜 미디어 마케팅 전문가입니다.
주어진 콘텐츠를 기반으로 일주일 발행 캘린더를 생성하세요.

규칙:
- 각 채널별 최적의 발행 시간 고려 (한국 시간 기준)
- 하루에 1-2개 채널만 배정
- 주말에는 캐주얼한 채널 (인스타, 스레드) 배정
- 평일에는 전문적 채널 (블로그, 링크드인) 배정

변환된 콘텐츠:
{transformed_contents}

반드시 아래 JSON 형식만 출력하세요. 다른 설명 없이 JSON만 출력:
[
  {{"day": "월", "dayEn": "monday", "channel": "채널키", "channelName": "채널명", "time": "HH:MM", "reason": "이유 한 줄"}},
  {{"day": "화", "dayEn": "tuesday", "channel": "채널키", "channelName": "채널명", "time": "HH:MM", "reason": "이유 한 줄"}},
  {{"day": "수", "dayEn": "wednesday", "channel": "채널키", "channelName": "채널명", "time": "HH:MM", "reason": "이유 한 줄"}},
  {{"day": "목", "dayEn": "thursday", "channel": "채널키", "channelName": "채널명", "time": "HH:MM", "reason": "이유 한 줄"}},
  {{"day": "금", "dayEn": "friday", "channel": "채널키", "channelName": "채널명", "time": "HH:MM", "reason": "이유 한 줄"}},
  {{"day": "토", "dayEn": "saturday", "channel": "채널키", "channelName": "채널명", "time": "HH:MM", "reason": "이유 한 줄"}},
  {{"day": "일", "dayEn": "sunday", "channel": "채널키", "channelName": "채널명", "time": "HH:MM", "reason": "이유 한 줄"}}
]

채널키는 다음 중 하나: blog, instagram, threads, linkedin, twitter
변환된 콘텐츠에 없는 채널은 "channel": null, "channelName": "휴식", "reason": "발행 없음"으로 표시"""
