"""
Content Repurposer - FastAPI Backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from repurposer import ContentRepurposer, TransformedContent
from scraper import BlogScraper
from prompts import CHANNEL_PROMPTS
from style_analyzer import StyleAnalyzer

load_dotenv()

app = FastAPI(
    title="Content Repurposer API",
    description="콘텐츠를 여러 소셜 미디어 채널에 맞게 변환하는 API",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 연동용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포 시 프론트엔드 도메인으로 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response 모델
class ScrapeRequest(BaseModel):
    url: str


class ScrapeResponse(BaseModel):
    title: str
    content: str
    source: str
    char_count: int


class StyleConfig(BaseModel):
    tone: str = "캐주얼"
    target: str = "일반 대중"
    emoji_level: int = 1
    custom: str = ""


class TransformRequest(BaseModel):
    content: str
    channels: list[str] = ["blog", "instagram", "threads"]
    style_config: Optional[StyleConfig] = None
    custom_prompts: Optional[dict[str, str]] = None  # 채널별 커스텀 프롬프트


class TransformResult(BaseModel):
    channel: str
    channel_name: str
    content: str
    char_count: int


class TransformResponse(BaseModel):
    results: list[TransformResult]
    calendar: Optional[str] = None


class ChannelInfo(BaseModel):
    key: str
    name: str
    description: str


class AnalyzeStyleRequest(BaseModel):
    url: str


class StyleAnalysisResponse(BaseModel):
    tone: str
    vocabulary: str
    sentence_style: str
    structure: str
    generated_prompt: str


# API 엔드포인트
@app.get("/")
async def root():
    return {"message": "Content Repurposer API", "version": "1.0.0"}


@app.post("/analyze-style", response_model=StyleAnalysisResponse)
async def analyze_blog_style(request: AnalyzeStyleRequest):
    """블로그 스타일 분석 및 프롬프트 생성"""
    try:
        # 1. Scrape blog content
        scraper = BlogScraper()
        scraped = scraper.scrape(request.url)
        
        # 2. Analyze style
        analyzer = StyleAnalyzer()
        result = analyzer.analyze_style(scraped.content)
        
        return StyleAnalysisResponse(
            tone=result.get("tone", "분석 실패"),
            vocabulary=result.get("vocabulary", "분석 실패"),
            sentence_style=result.get("sentence_style", "분석 실패"),
            structure=result.get("structure", "분석 실패"),
            generated_prompt=result.get("generated_prompt", "프롬프트 생성 실패")
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


from fastapi.responses import StreamingResponse
import asyncio
import json as json_module

@app.post("/analyze-style-stream")
async def analyze_blog_style_stream(request: AnalyzeStyleRequest):
    """블로그 스타일 분석 (스트리밍 버전)"""
    
    async def generate():
        try:
            # Step 1: Scraping
            yield f"data: {json_module.dumps({'step': 'scraping', 'message': '블로그 콘텐츠 추출 중...'})}\n\n"
            scraper = BlogScraper()
            scraped = scraper.scrape(request.url)
            yield f"data: {json_module.dumps({'step': 'scraped', 'message': f'콘텐츠 추출 완료! ({len(scraped.content)}자)'})}\n\n"
            
            # Step 2: Analyzing
            yield f"data: {json_module.dumps({'step': 'analyzing', 'message': 'AI가 글 스타일을 분석하고 있습니다...'})}\n\n"
            analyzer = StyleAnalyzer()
            result = analyzer.analyze_style(scraped.content)
            
            # Step 3: Send results one by one
            yield f"data: {json_module.dumps({'step': 'tone', 'field': 'tone', 'value': result.get('tone', '')})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json_module.dumps({'step': 'vocabulary', 'field': 'vocabulary', 'value': result.get('vocabulary', '')})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json_module.dumps({'step': 'sentence_style', 'field': 'sentence_style', 'value': result.get('sentence_style', '')})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json_module.dumps({'step': 'structure', 'field': 'structure', 'value': result.get('structure', '')})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json_module.dumps({'step': 'prompt', 'field': 'generated_prompt', 'value': result.get('generated_prompt', '')})}\n\n"
            
            yield f"data: {json_module.dumps({'step': 'done', 'message': '분석 완료!'})}\n\n"
            
        except Exception as e:
            yield f"data: {json_module.dumps({'step': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@app.get("/channels", response_model=list[ChannelInfo])
async def get_channels():
    """사용 가능한 채널 목록"""
    return [
        ChannelInfo(
            key=key,
            name=config["name"],
            description=config["description"]
        )
        for key, config in CHANNEL_PROMPTS.items()
    ]


@app.get("/prompts/{channel}")
async def get_channel_prompt(channel: str):
    """특정 채널의 기본 프롬프트 가져오기"""
    if channel not in CHANNEL_PROMPTS:
        raise HTTPException(status_code=404, detail=f"채널을 찾을 수 없습니다: {channel}")
    return {
        "channel": channel,
        "name": CHANNEL_PROMPTS[channel]["name"],
        "prompt": CHANNEL_PROMPTS[channel]["prompt"]
    }


@app.post("/scrape", response_model=ScrapeResponse)
async def scrape_url(request: ScrapeRequest):
    """URL에서 콘텐츠 추출"""
    try:
        scraper = BlogScraper()
        result = scraper.scrape(request.url)
        return ScrapeResponse(
            title=result.title,
            content=result.content,
            source=result.source,
            char_count=len(result.content)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/transform", response_model=TransformResponse)
async def transform_content(request: TransformRequest):
    """콘텐츠 변환"""
    try:
        repurposer = ContentRepurposer()

        # 스타일 설정
        style_config = None
        if request.style_config:
            style_config = {
                "tone": request.style_config.tone,
                "target": request.style_config.target,
                "emoji_level": request.style_config.emoji_level,
                "custom": request.style_config.custom
            }

        # 변환 실행 (커스텀 프롬프트 지원)
        results = []
        for channel in request.channels:
            custom_prompt = None
            if request.custom_prompts and channel in request.custom_prompts:
                custom_prompt = request.custom_prompts[channel]

            result = repurposer.transform_single_with_style(
                request.content,
                channel=channel,
                style_config=style_config,
                custom_prompt=custom_prompt
            )
            results.append(result)

        # 캘린더 생성
        calendar = repurposer.generate_calendar(results)

        return TransformResponse(
            results=[
                TransformResult(
                    channel=r.channel,
                    channel_name=r.channel_name,
                    content=r.content,
                    char_count=len(r.content)
                )
                for r in results
            ],
            calendar=calendar
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)