"""
스크립트 생성기 모듈
참고 스크립트를 기반으로 새로운 대본을 재구성
"""

from typing import Optional
from providers import get_provider, LLMResponse


# 스크립트 재구성 프롬프트 템플릿
SYSTEM_PROMPT = """당신은 전문 유튜브 콘텐츠 작가입니다.
주어진 참고 스크립트를 분석하고, 같은 주제와 구조를 유지하면서 완전히 새로운 대본을 작성합니다.

작성 원칙:
1. 원본의 핵심 메시지와 구조는 유지
2. 표현과 문장은 완전히 새롭게 작성
3. 자연스러운 구어체 사용
4. 시청자의 관심을 끄는 도입부
5. 명확한 전환과 결론
"""

REWRITE_PROMPT_TEMPLATE = """## 참고 스크립트:
{original_script}

## 요청 사항:
{style_instructions}

## 작업:
위 참고 스크립트를 분석하고, 같은 주제로 완전히 새로운 유튜브 대본을 작성해주세요.
대본 형식으로 작성하되, 자연스러운 말투를 사용해주세요.
"""


def rewrite_script(
    original_script: str,
    style: str = "informative",
    target_length: str = "similar",
    additional_instructions: str = "",
    provider_name: str = "gemini"
) -> dict:
    """
    스크립트 재구성
    
    Args:
        original_script: 원본 스크립트
        style: 스타일 ("informative", "entertaining", "educational", "conversational")
        target_length: 길이 ("shorter", "similar", "longer")
        additional_instructions: 추가 지시사항
        provider_name: LLM 제공자 ("gemini" 또는 "claude")
        
    Returns:
        dict: 재구성된 스크립트 및 메타데이터
    """
    # 스타일 지시사항 생성
    style_map = {
        "informative": "정보 전달 위주의 명확하고 객관적인 스타일로 작성해주세요.",
        "entertaining": "재미있고 흥미로운 스타일로, 유머와 예시를 많이 사용해주세요.",
        "educational": "교육적인 스타일로, 단계별 설명과 핵심 개념 강조를 해주세요.",
        "conversational": "대화하듯 친근한 스타일로, 시청자에게 직접 말하는 것처럼 작성해주세요."
    }
    
    length_map = {
        "shorter": "원본보다 30% 정도 짧게 요약해서 작성해주세요.",
        "similar": "원본과 비슷한 길이로 작성해주세요.",
        "longer": "원본보다 30% 정도 더 자세하게 확장해서 작성해주세요."
    }
    
    style_instructions = f"""
- 스타일: {style_map.get(style, style_map["informative"])}
- 길이: {length_map.get(target_length, length_map["similar"])}
"""
    
    if additional_instructions:
        style_instructions += f"- 추가 요청: {additional_instructions}\n"
    
    # 프롬프트 생성
    prompt = REWRITE_PROMPT_TEMPLATE.format(
        original_script=original_script,
        style_instructions=style_instructions
    )
    
    try:
        # LLM Provider 가져오기
        provider = get_provider(provider_name)
        
        # 텍스트 생성
        response = provider.generate(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT,
            temperature=0.7
        )
        
        return {
            "success": True,
            "rewritten_script": response.text,
            "model_used": response.model,
            "original_length": len(original_script),
            "rewritten_length": len(response.text),
            "style": style,
            "target_length": target_length
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def analyze_script(
    script: str,
    provider_name: str = "gemini"
) -> dict:
    """
    스크립트 분석 (구조, 주제, 톤 파악)
    """
    analysis_prompt = f"""다음 스크립트를 분석해주세요:

{script}

다음 항목을 JSON 형식으로 분석해주세요:
1. 주제 (topic): 메인 주제
2. 구조 (structure): 도입-본론-결론 구성
3. 톤 (tone): 전반적인 어조
4. 핵심_포인트 (key_points): 주요 내용 3-5개
5. 예상_길이 (estimated_duration): 예상 읽기 시간 (분)
"""
    
    try:
        provider = get_provider(provider_name)
        response = provider.generate(
            prompt=analysis_prompt,
            temperature=0.3  # 분석은 일관성 있게
        )
        
        return {
            "success": True,
            "analysis": response.text,
            "model_used": response.model
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
