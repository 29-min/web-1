"""
Gemini LLM Provider
Google Gemini API 연동
"""

import os
from typing import Optional
import google.generativeai as genai
from .base import LLMProvider, LLMResponse


class GeminiProvider(LLMProvider):
    """Google Gemini API Provider"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        """
        Gemini Provider 초기화
        
        Args:
            api_key: Gemini API 키 (없으면 환경변수에서 가져옴)
            model: 사용할 모델 (gemini-1.5-flash, gemini-1.5-pro 등)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY가 설정되지 않았습니다.")
        
        genai.configure(api_key=self.api_key)
        self.model_name = model
        self.model = genai.GenerativeModel(model)
    
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7
    ) -> LLMResponse:
        """
        Gemini를 사용하여 텍스트 생성
        """
        try:
            # 시스템 프롬프트가 있으면 프롬프트에 포함
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"
            
            # 생성 설정
            generation_config = genai.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature
            )
            
            # 텍스트 생성
            response = self.model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            return LLMResponse(
                text=response.text,
                model=self.model_name,
                tokens_used=None  # Gemini는 토큰 수를 직접 제공하지 않음
            )
            
        except Exception as e:
            raise Exception(f"Gemini API 오류: {str(e)}")
    
    def get_model_name(self) -> str:
        return self.model_name
