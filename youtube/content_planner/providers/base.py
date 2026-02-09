"""
LLM Provider 추상화 베이스 클래스
Gemini, Claude 등 다양한 LLM을 쉽게 교체할 수 있도록 설계
"""

from abc import ABC, abstractmethod
from typing import Optional
from dataclasses import dataclass


@dataclass
class LLMResponse:
    """LLM 응답 데이터"""
    text: str
    model: str
    tokens_used: Optional[int] = None
    

class LLMProvider(ABC):
    """
    LLM Provider 추상 클래스
    
    새로운 LLM을 추가하려면:
    1. 이 클래스를 상속
    2. generate() 메서드 구현
    3. get_provider() 함수에 등록
    """
    
    @abstractmethod
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7
    ) -> LLMResponse:
        """
        텍스트 생성
        
        Args:
            prompt: 사용자 프롬프트
            system_prompt: 시스템 프롬프트 (역할 지정)
            max_tokens: 최대 토큰 수
            temperature: 창의성 조절 (0.0~1.0)
            
        Returns:
            LLMResponse: 생성된 텍스트 및 메타데이터
        """
        pass
    
    @abstractmethod
    def get_model_name(self) -> str:
        """현재 사용 중인 모델명 반환"""
        pass


def get_provider(provider_name: str = "gemini") -> LLMProvider:
    """
    Provider 팩토리 함수
    
    Args:
        provider_name: "gemini" 또는 "claude"
        
    Returns:
        LLMProvider 인스턴스
    """
    if provider_name == "gemini":
        from .gemini import GeminiProvider
        return GeminiProvider()
    elif provider_name == "claude":
        from .claude import ClaudeProvider
        return ClaudeProvider()
    else:
        raise ValueError(f"Unknown provider: {provider_name}")
