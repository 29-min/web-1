"""
Style Analyzer Module
Analyzes blog content to extract writing style and generate custom prompts.
"""

import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import re

load_dotenv()


class StyleAnalyzer:
    """Analyzes writing style from blog content and generates prompts."""

    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def analyze_style(self, content: str) -> dict:
        """
        Analyze the writing style of the given content.
        
        Args:
            content: Blog post content to analyze
            
        Returns:
            dict with style analysis and generated prompt
        """
        analysis_prompt = f"""당신은 전문 콘텐츠 분석가입니다. 아래 블로그 글을 **심층 분석**하여 글쓰기 스타일을 추출해주세요.

분석할 글:
---
{content[:8000]}
---

**특히 다음 두 가지에 집중하여 분석해주세요:**

## 1. 구조 (structure) - 가장 중요!
- 글의 전체적인 흐름과 구성 (도입-본문-결론? 스토리텔링? 정보 나열?)
- 소제목/헤딩 사용 패턴
- 단락 구분 방식
- 도입부에서 독자를 끌어들이는 방식
- 마무리/CTA(Call to Action) 패턴
- 예시, 인용, 리스트 등의 활용 방식

## 2. 어휘 스타일 (vocabulary) - 매우 중요!
- 자주 사용하는 특징적인 단어/표현
- 전문용어 vs 일상어 비율
- 감탄사, 의성어/의태어 사용
- 이모지 활용 패턴
- 호칭 방식 (반말/존댓말, ~요/~습니다)
- 특유의 말투나 시그니처 표현

## 3. 톤앤매너 (tone)
- 전체적인 분위기 (친근한, 전문적인, 유머러스한 등)

## 4. 문장 스타일 (sentence_style)
- 문장 길이와 리듬
- 질문형 문장 활용
- 강조 방식

---

**생성할 프롬프트 요구사항:**
위 분석을 바탕으로, AI가 이 스타일을 **완벽하게 재현**할 수 있는 상세한 프롬프트를 작성해주세요.
프롬프트는 {{{{topic}}}} 자리에 주제를 넣으면 동일한 스타일로 글을 쓸 수 있어야 합니다.

**특히 구조와 어휘 스타일을 구체적으로 지시**하는 프롬프트를 만들어주세요.

반드시 다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{{
  "tone": "3-5문장으로 핵심 톤앤매너 설명",
  "vocabulary": "3-5문장으로 어휘 스타일 설명 (대표적 예시 2-3개 포함)",
  "sentence_style": "3-5문장으로 문장 스타일 설명",
  "structure": "3-5문장으로 글 구조 패턴 설명",
  "generated_prompt": "이 필드만 매우 상세하게 작성! 구조, 어휘, 톤을 구체적으로 지시하는 긴 프롬프트를 작성해주세요. 최소 500자 이상으로 상세하게."
}}

**중요: 각 분석 필드는 3-5문장으로! generated_prompt만 길고 상세하게!**"""

        try:
            response = self.model.generate_content(analysis_prompt)
            response_text = response.text.strip()
            
            # Extract JSON from response (handle markdown code blocks)
            if "```json" in response_text:
                json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(1)
            elif "```" in response_text:
                json_match = re.search(r'```\s*(.*?)\s*```', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(1)
            
            result = json.loads(response_text)
            return result
            
        except json.JSONDecodeError as e:
            # Fallback if JSON parsing fails
            return {
                "tone": "분석 실패",
                "vocabulary": "분석 실패",
                "sentence_style": "분석 실패", 
                "structure": "분석 실패",
                "generated_prompt": f"분석 중 오류가 발생했습니다. 원본 응답: {response_text[:500]}"
            }
        except Exception as e:
            return {
                "tone": "오류",
                "vocabulary": "오류",
                "sentence_style": "오류",
                "structure": "오류",
                "generated_prompt": f"분석 중 오류가 발생했습니다: {str(e)}"
            }
