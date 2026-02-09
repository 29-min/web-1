"""
Claude LLM Provider
Anthropic Claude API 연동 (향후 구현용 스텁)
"""

import os
from typing import Optional
from .base import LLMProvider, LLMResponse


class ClaudeProvider(LLMProvider):
    """
    Anthropic Claude API Provider
    
    향후 Claude API 사용 시 이 클래스를 구현하세요.
    """
    
    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-sonnet-20240229"):
        """
        Claude Provider 초기화
        
        Args:
            api_key: Claude API 키 (없으면 환경변수에서 가져옴)
            model: 사용할 모델
        """
        self.api_key = api_key or os.getenv("CLAUDE_API_KEY")
        if not self.api_key:
            raise ValueError("CLAUDE_API_KEY가 설정되지 않았습니다.")
        
        self.model_name = model
        
        # TODO: anthropic 라이브러리 설치 후 구현
        # pip install anthropic
        # import anthropic
        # self.client = anthropic.Anthropic(api_key=self.api_key)
    
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7
    ) -> LLMResponse:
        """
        Claude를 사용하여 텍스트 생성
        
        TODO: 구현 필요
        """
        # 향후 구현 예시:
        # message = self.client.messages.create(
        #     model=self.model_name,
        #     max_tokens=max_tokens,
        #     temperature=temperature,
        #     system=system_prompt or "",
        #     messages=[{"role": "user", "content": prompt}]
        # )
        # return LLMResponse(
        #     text=message.content[0].text,
        #     model=self.model_name,
        #     tokens_used=message.usage.output_tokens
        # )
        
        raise NotImplementedError(
            "Claude Provider는 아직 구현되지 않았습니다. "
            "CLAUDE_API_KEY 설정 후 이 파일을 구현하세요."
        )
    
    def get_model_name(self) -> str:
        return self.model_name
