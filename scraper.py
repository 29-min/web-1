"""
블로그/웹페이지에서 콘텐츠 추출하는 모듈
"""
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from typing import Optional
from dataclasses import dataclass


@dataclass
class ScrapedContent:
    """추출된 콘텐츠"""
    url: str
    title: str
    content: str
    source: str  # 블로그 플랫폼 (naver, tistory, etc.)


class BlogScraper:
    """블로그 콘텐츠 스크래퍼"""
    
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    # 플랫폼별 본문 선택자
    PLATFORM_SELECTORS = {
        "naver": [
            ".se-main-container",  # 스마트에디터 3.0
            ".post-view",
            "#postViewArea",
            ".sect_dsc",
        ],
        "tistory": [
            ".entry-content",
            ".article-view",
            "#article-view",
            ".post-content",
        ],
        "velog": [
            ".atom-one",
            "div[class*='sc-']",  # styled-components
        ],
        "brunch": [
            ".wrap_body",
            ".article_view",
        ],
        "medium": [
            "article",
            ".postArticle-content",
        ],
        "default": [
            "article",
            "main",
            ".post-content",
            ".entry-content",
            ".article-content",
            ".content",
        ]
    }
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(self.HEADERS)
    
    def _detect_platform(self, url: str) -> str:
        """URL에서 블로그 플랫폼 감지"""
        domain = urlparse(url).netloc.lower()
        
        if "blog.naver" in domain or "m.blog.naver" in domain:
            return "naver"
        elif "tistory" in domain:
            return "tistory"
        elif "velog.io" in domain:
            return "velog"
        elif "brunch.co.kr" in domain:
            return "brunch"
        elif "medium.com" in domain:
            return "medium"
        else:
            return "default"
    
    def _get_naver_blog_content(self, url: str) -> Optional[str]:
        """네이버 블로그 iframe 처리"""
        try:
            response = self.session.get(url)
            soup = BeautifulSoup(response.text, "html.parser")
            
            # iframe URL 추출
            iframe = soup.find("iframe", id="mainFrame")
            if iframe and iframe.get("src"):
                iframe_url = "https://blog.naver.com" + iframe["src"]
                response = self.session.get(iframe_url)
                return response.text
            
            return response.text
        except Exception:
            return None
    
    def _extract_content(self, html: str, platform: str) -> tuple[str, str]:
        """HTML에서 제목과 본문 추출"""
        soup = BeautifulSoup(html, "html.parser")
        
        # 불필요한 요소 제거
        for tag in soup.find_all(["script", "style", "nav", "header", "footer", "aside", "iframe"]):
            tag.decompose()
        
        # 제목 추출
        title = ""
        title_tag = soup.find("h1") or soup.find("title")
        if title_tag:
            title = title_tag.get_text(strip=True)
        
        # 본문 추출 - 플랫폼별 선택자 시도
        selectors = self.PLATFORM_SELECTORS.get(platform, self.PLATFORM_SELECTORS["default"])
        content = ""
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                content = element.get_text(separator="\n", strip=True)
                if len(content) > 100:  # 충분한 콘텐츠가 있으면 사용
                    break
        
        # 선택자로 못 찾으면 body에서 추출
        if not content or len(content) < 100:
            body = soup.find("body")
            if body:
                content = body.get_text(separator="\n", strip=True)
        
        # 텍스트 정리
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        content = "\n".join(lines)
        
        return title, content
    
    def scrape(self, url: str) -> ScrapedContent:
        """URL에서 콘텐츠 추출"""
        platform = self._detect_platform(url)
        
        try:
            # 네이버 블로그는 특별 처리
            if platform == "naver":
                html = self._get_naver_blog_content(url)
            else:
                response = self.session.get(url, timeout=10)
                response.raise_for_status()
                html = response.text
            
            if not html:
                raise ValueError("페이지를 불러올 수 없습니다.")
            
            title, content = self._extract_content(html, platform)
            
            if not content or len(content) < 50:
                raise ValueError("콘텐츠를 추출할 수 없습니다. 페이지 구조를 확인하세요.")
            
            return ScrapedContent(
                url=url,
                title=title,
                content=content[:5000],  # 최대 5000자로 제한
                source=platform
            )
            
        except requests.RequestException as e:
            raise ValueError(f"페이지 요청 실패: {e}")


def main():
    """테스트"""
    scraper = BlogScraper()
    
    # 테스트 URL (실제 테스트시 변경)
    test_url = input("블로그 URL을 입력하세요: ").strip()
    
    try:
        result = scraper.scrape(test_url)
        print(f"\n📌 플랫폼: {result.source}")
        print(f"📌 제목: {result.title}")
        print(f"\n📌 본문 (처음 500자):")
        print(result.content[:500])
        print(f"\n... (총 {len(result.content)}자)")
    except ValueError as e:
        print(f"❌ 오류: {e}")


if __name__ == "__main__":
    main()