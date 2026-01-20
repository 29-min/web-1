"""
Content Repurposer - 콘텐츠를 여러 채널용으로 변환하는 엔진
"""
import os
from typing import Optional, Union
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel

from prompts import CHANNEL_PROMPTS, CALENDAR_PROMPT
from scraper import BlogScraper, ScrapedContent

load_dotenv()


class TransformedContent(BaseModel):
    """변환된 콘텐츠 결과"""
    channel: str
    channel_name: str
    content: str


class ContentRepurposer:
    """콘텐츠를 여러 채널용으로 변환하는 클래스"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY가 필요합니다. .env 파일에 설정하세요.")
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=self.api_key,
            temperature=0.7
        )
        self.scraper = BlogScraper()
        self._last_scraped: Optional[ScrapedContent] = None
    
    def load_from_url(self, url: str) -> ScrapedContent:
        """URL에서 콘텐츠 로드"""
        self._last_scraped = self.scraper.scrape(url)
        return self._last_scraped
    
    def _get_content(self, content: Union[str, None] = None) -> str:
        """텍스트 또는 마지막 스크랩 콘텐츠 반환"""
        if content:
            return content
        if self._last_scraped:
            return self._last_scraped.content
        raise ValueError("콘텐츠를 입력하거나 먼저 URL을 로드하세요.")
    
    def transform_single(self, content: Optional[str] = None, channel: str = "blog") -> TransformedContent:
        """단일 채널로 콘텐츠 변환 (텍스트 또는 로드된 URL 사용)"""
        if channel not in CHANNEL_PROMPTS:
            raise ValueError(f"지원하지 않는 채널: {channel}. 가능한 채널: {list(CHANNEL_PROMPTS.keys())}")
        
        text = self._get_content(content)
        channel_config = CHANNEL_PROMPTS[channel]
        
        # LCEL 방식: prompt | llm | output_parser
        prompt = ChatPromptTemplate.from_template(channel_config["prompt"])
        chain = prompt | self.llm | StrOutputParser()
        
        result = chain.invoke({"content": text})
        
        return TransformedContent(
            channel=channel,
            channel_name=channel_config["name"],
            content=result
        )
    
    def transform_multi(self, content: Optional[str] = None, channels: list[str] = None) -> list[TransformedContent]:
        """여러 채널로 콘텐츠 변환 (텍스트 또는 로드된 URL 사용)"""
        if channels is None:
            channels = list(CHANNEL_PROMPTS.keys())
        
        # 콘텐츠 미리 확인
        text = self._get_content(content)
        
        results = []
        for channel in channels:
            result = self.transform_single(text, channel)
            results.append(result)
        
        return results
    
    def transform_single_with_style(self, content: Optional[str] = None, channel: str = "blog", style_config: dict = None, custom_prompt: str = None) -> TransformedContent:
        """스타일 설정을 적용하여 단일 채널로 변환"""
        if channel not in CHANNEL_PROMPTS:
            raise ValueError(f"지원하지 않는 채널: {channel}. 가능한 채널: {list(CHANNEL_PROMPTS.keys())}")

        text = self._get_content(content)
        channel_config = CHANNEL_PROMPTS[channel]

        # 스타일 지시사항 생성
        style_instruction = self._build_style_instruction(style_config) if style_config else ""

        # 프롬프트 결정: 커스텀 프롬프트 우선, 없으면 기본 프롬프트
        base_prompt = custom_prompt if custom_prompt else channel_config["prompt"]

        # 프롬프트에 스타일 추가
        if style_instruction:
            styled_prompt = base_prompt.replace(
                "원본 콘텐츠:",
                f"{style_instruction}\n\n원본 콘텐츠:"
            )
        else:
            styled_prompt = base_prompt

        prompt = ChatPromptTemplate.from_template(styled_prompt)
        chain = prompt | self.llm | StrOutputParser()

        result = chain.invoke({"content": text})

        return TransformedContent(
            channel=channel,
            channel_name=channel_config["name"],
            content=result
        )
    
    def transform_multi_with_style(self, content: Optional[str] = None, channels: list[str] = None, style_config: dict = None) -> list[TransformedContent]:
        """스타일 설정을 적용하여 여러 채널로 변환"""
        if channels is None:
            channels = list(CHANNEL_PROMPTS.keys())
        
        text = self._get_content(content)
        
        results = []
        for channel in channels:
            result = self.transform_single_with_style(text, channel, style_config)
            results.append(result)
        
        return results
    
    def _build_style_instruction(self, style_config: dict) -> str:
        """스타일 설정을 프롬프트 지시사항으로 변환"""
        instructions = []
        
        # 톤 설정
        tone = style_config.get("tone", "")
        if tone:
            tone_map = {
                "전문적": "전문적이고 신뢰감 있는 톤으로 작성하세요.",
                "캐주얼": "편하고 캐주얼한 톤으로 작성하세요.",
                "친근한": "친근하고 따뜻한 톤으로 작성하세요.",
                "유머러스": "유머를 섞어 재미있게 작성하세요.",
                "격식체": "격식체(~습니다, ~입니다)로 작성하세요."
            }
            if tone in tone_map:
                instructions.append(tone_map[tone])
        
        # 타겟 독자
        target = style_config.get("target", "")
        if target and target != "일반 대중":
            instructions.append(f"타겟 독자는 '{target}'입니다. 이들에게 맞는 용어와 설명 수준을 사용하세요.")
        
        # 이모지 사용량
        emoji_level = style_config.get("emoji_level", 1)
        emoji_instructions = {
            0: "이모지를 사용하지 마세요.",
            1: "이모지를 적당히 사용하세요 (2-3개).",
            2: "이모지를 많이 사용하세요 (5-7개).",
            3: "이모지를 매우 적극적으로 사용하세요 (10개 이상)."
        }
        instructions.append(emoji_instructions.get(emoji_level, ""))
        
        # 추가 지시사항
        custom = style_config.get("custom", "")
        if custom:
            instructions.append(f"추가 요청사항: {custom}")
        
        if instructions:
            return "**스타일 가이드:**\n" + "\n".join(f"- {inst}" for inst in instructions if inst)
        return ""
    
    def generate_calendar(self, transformed_contents: list[TransformedContent]) -> str:
        """발행 캘린더 생성"""
        contents_text = "\n\n".join([
            f"[{tc.channel_name}]\n{tc.content}" 
            for tc in transformed_contents
        ])
        
        # LCEL 방식
        prompt = ChatPromptTemplate.from_template(CALENDAR_PROMPT)
        chain = prompt | self.llm | StrOutputParser()
        
        result = chain.invoke({"transformed_contents": contents_text})
        
        return result
    
    @staticmethod
    def list_channels() -> dict:
        """사용 가능한 채널 목록 반환"""
        return {
            channel: config["description"] 
            for channel, config in CHANNEL_PROMPTS.items()
        }


def main():
    """테스트용 메인 함수"""
    import sys
    
    print("=== Content Repurposer ===\n")
    
    # 입력 받기
    if len(sys.argv) > 1:
        user_input = sys.argv[1]
    else:
        user_input = input("블로그 URL 또는 텍스트를 입력하세요: ").strip()
    
    if not user_input:
        print("❌ 입력이 없습니다.")
        return
    
    try:
        repurposer = ContentRepurposer()
        
        # URL인지 텍스트인지 판단
        if user_input.startswith("http"):
            print(f"\n🔗 URL에서 콘텐츠 추출 중...")
            scraped = repurposer.load_from_url(user_input)
            print(f"✅ 플랫폼: {scraped.source}")
            print(f"✅ 제목: {scraped.title}")
            print(f"✅ 추출된 글자 수: {len(scraped.content)}자\n")
            content = None  # 로드된 콘텐츠 사용
        else:
            content = user_input
        
        print("=== 콘텐츠 변환 중... ===\n")
        
        # 3개 채널로 변환
        results = repurposer.transform_multi(
            content, 
            channels=["blog", "instagram", "threads"]
        )
        
        for result in results:
            print(f"📌 [{result.channel_name}]")
            print(result.content)
            print("\n" + "="*50 + "\n")
        
        print("=== 발행 캘린더 생성 중... ===\n")
        calendar = repurposer.generate_calendar(results)
        print(calendar)
        
    except ValueError as e:
        print(f"❌ 오류: {e}")
        print("💡 .env 파일에 GEMINI_API_KEY를 설정하세요.")


if __name__ == "__main__":
    main()