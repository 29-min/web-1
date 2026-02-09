/**
 * YouTube 인기 영상 분석기 v2.1 - 프론트엔드 스크립트
 * 초기 화면 트렌딩 영상 + 더보기 기능 + 필터링
 */

// DOM 요소
const keywordInput = document.getElementById('keyword-input');
const searchBtn = document.getElementById('search-btn');
const btnText = searchBtn.querySelector('.btn-text');
const btnLoader = searchBtn.querySelector('.btn-loader');
const resultsSection = document.getElementById('results-section');
const resultsTitle = document.getElementById('results-title');
const videoList = document.getElementById('video-list');
const resultKeyword = document.getElementById('result-keyword');
const errorSection = document.getElementById('error-section');
const errorMessage = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const filterToggle = document.getElementById('filter-toggle');
const filterArrow = document.getElementById('filter-arrow');
const filterPanel = document.getElementById('filter-panel');
const activeFiltersDiv = document.getElementById('active-filters');

// 더보기 버튼
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const loadMoreText = loadMoreBtn.querySelector('.load-more-text');
const loadMoreLoader = loadMoreBtn.querySelector('.load-more-loader');

// 슬라이더 요소
const viewsWeightSlider = document.getElementById('views-weight');
const engagementWeightSlider = document.getElementById('engagement-weight');
const recencyWeightSlider = document.getElementById('recency-weight');
const viewsWeightValue = document.getElementById('views-weight-value');
const engagementWeightValue = document.getElementById('engagement-weight-value');
const recencyWeightValue = document.getElementById('recency-weight-value');

// 상태 변수
let currentKeyword = '';
let currentVideoCount = 10;
let isTrendingMode = false;
let allVideos = [];

/**
 * 필터 패널 토글
 */
filterToggle.addEventListener('click', () => {
    filterPanel.classList.toggle('hidden');
    filterArrow.classList.toggle('open');
});

/**
 * 슬라이더 값 업데이트
 */
function updateSliderValues() {
    viewsWeightValue.textContent = `${viewsWeightSlider.value}%`;
    engagementWeightValue.textContent = `${engagementWeightSlider.value}%`;
    recencyWeightValue.textContent = `${recencyWeightSlider.value}%`;
}

viewsWeightSlider.addEventListener('input', updateSliderValues);
engagementWeightSlider.addEventListener('input', updateSliderValues);
recencyWeightSlider.addEventListener('input', updateSliderValues);

/**
 * 현재 필터 상태 가져오기
 */
function getFilters() {
    const shortsFilter = document.querySelector('input[name="shorts-filter"]:checked').value;
    const durationFilter = document.querySelector('input[name="duration-filter"]:checked').value;
    const uploadPeriod = document.querySelector('input[name="upload-period"]:checked').value;
    const languageFilter = document.querySelector('input[name="language-filter"]:checked').value;
    const trendingMode = document.getElementById('trending-mode').checked;
    const minViews = parseInt(document.getElementById('min-views').value) || 0;

    return {
        shorts_only: shortsFilter === 'shorts-only',
        exclude_shorts: shortsFilter === 'exclude-shorts',
        duration_filter: durationFilter,
        upload_period: uploadPeriod,
        language: languageFilter,
        views_weight: parseInt(viewsWeightSlider.value),
        engagement_weight: parseInt(engagementWeightSlider.value),
        recency_weight: parseInt(recencyWeightSlider.value),
        trending_mode: trendingMode,
        min_views: minViews
    };
}

/**
 * 활성 필터 태그 표시
 */
function showActiveFilters(filters) {
    const tags = [];

    if (filters.shorts_only) tags.push('📱 쇼츠만');
    if (filters.exclude_shorts) tags.push('🚫 쇼츠 제외');
    if (filters.duration_filter !== 'any') {
        const labels = { short: '짧은 영상', medium: '중간 길이', long: '긴 영상' };
        tags.push(`⏱️ ${labels[filters.duration_filter]}`);
    }
    if (filters.upload_period !== 'any') {
        const labels = { day: '오늘', week: '이번 주', month: '이번 달', year: '올해' };
        tags.push(`📅 ${labels[filters.upload_period]}`);
    }
    if (filters.language !== 'any') {
        const labels = { ko: '한국어', en: '영어', ja: '일본어', zh: '중국어' };
        tags.push(`🌐 ${labels[filters.language]}`);
    }
    if (filters.trending_mode) tags.push('🔥 트렌딩 모드');
    if (filters.min_views > 0) tags.push(`👁️ ${formatNumber(filters.min_views)}회 이상`);

    if (tags.length > 0) {
        activeFiltersDiv.innerHTML = tags.map(tag =>
            `<span class="filter-tag">${tag}</span>`
        ).join('');
        activeFiltersDiv.classList.remove('hidden');
    } else {
        activeFiltersDiv.classList.add('hidden');
    }
}

/**
 * 숫자 포맷팅
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

/**
 * 날짜 포맷팅
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
}

/**
 * 영상 길이 포맷팅
 */
function formatDuration(seconds) {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        const remainMins = mins % 60;
        return `${hrs}:${remainMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 비디오 카드 HTML 생성
 */
function createVideoCard(video, rank, isTrendingMode) {
    const isTop3 = rank <= 3;
    const isShorts = video.is_shorts;

    return `
        <article class="video-card ${isShorts ? 'is-shorts' : ''}">
            <div class="video-rank ${isTop3 ? 'top-3' : ''}">
                ${rank}
            </div>
            <div class="video-thumbnail">
                ${isShorts ? '<span class="shorts-badge">SHORTS</span>' : ''}
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
            </div>
            <div class="video-content">
                <a href="${video.url}" target="_blank" class="video-title" title="${video.title}">
                    ${video.title}
                </a>
                <div class="video-channel">${video.channel_title}</div>
                <div class="video-stats">
                    <span class="stat-item">
                        <span class="stat-icon">👁️</span>
                        ${formatNumber(video.view_count)}
                    </span>
                    <span class="stat-item">
                        <span class="stat-icon">👍</span>
                        ${formatNumber(video.like_count)}
                    </span>
                    <span class="stat-item">
                        <span class="stat-icon">💬</span>
                        ${formatNumber(video.comment_count)}
                    </span>
                    <span class="stat-item">
                        <span class="stat-icon">📅</span>
                        ${formatDate(video.published_at)}
                    </span>
                    ${video.duration_seconds ? `
                    <span class="stat-item">
                        <span class="stat-icon">⏱️</span>
                        ${formatDuration(video.duration_seconds)}
                    </span>
                    ` : ''}
                </div>
            </div>
            <div class="video-score">
                <span class="score-label">${isTrendingMode ? '일일 조회수' : '품질 점수'}</span>
                <span class="score-value">${isTrendingMode ? formatNumber(video.views_per_day) : video.quality_score}</span>
                ${!isTrendingMode && video.engagement_rate ? `
                <span class="trending-score">참여율 ${video.engagement_rate}%</span>
                ` : ''}
                <button class="transcript-btn" onclick="openTranscriptModal('${video.video_id}', '${video.title.replace(/'/g, "\\'")}')">
                    📝 스크립트
                </button>
            </div>
        </article>
    `;
}

/**
 * 로딩 상태 토글
 */
function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    btnText.textContent = isLoading ? '분석 중...' : '분석하기';
    btnLoader.classList.toggle('hidden', !isLoading);
}

/**
 * 초기 로딩 상태 표시
 */
function showInitialLoading(show) {
    loadingState.classList.toggle('hidden', !show);
    emptyState.classList.add('hidden');
}

/**
 * 에러 표시
 */
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    emptyState.classList.add('hidden');
    loadingState.classList.add('hidden');
}

/**
 * 결과 표시
 */
function showResults(title, subtitle, videos, isTrendingMode, showLoadMore = false) {
    if (videos.length === 0) {
        showError('검색 결과가 없습니다. 다른 키워드나 필터 설정으로 시도해보세요.');
        return;
    }

    resultsTitle.textContent = title;
    resultKeyword.textContent = subtitle;
    videoList.innerHTML = videos.map((video, index) =>
        createVideoCard(video, index + 1, isTrendingMode)
    ).join('');

    // 더보기 버튼 표시 여부
    if (showLoadMore && videos.length >= 10 && videos.length < 30) {
        loadMoreContainer.classList.remove('hidden');
        loadMoreText.textContent = `더보기 (${videos.length}/30)`;
    } else {
        loadMoreContainer.classList.add('hidden');
    }

    errorSection.classList.add('hidden');
    emptyState.classList.add('hidden');
    loadingState.classList.add('hidden');
    resultsSection.classList.remove('hidden');
}

/**
 * 초기 트렌딩 영상 로드
 */
async function loadTrendingVideos() {
    showInitialLoading(true);

    try {
        const response = await fetch('/api/trending?top_n=10');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || '트렌딩 영상을 불러오는데 실패했습니다.');
        }

        allVideos = data.videos;
        showResults(
            '🔥 오늘의 인기 영상',
            '급상승 트렌딩',
            data.videos,
            true,
            false
        );
    } catch (error) {
        // 트렌딩 실패 시 빈 상태 표시
        showInitialLoading(false);
        emptyState.classList.remove('hidden');
        console.error('Trending load error:', error);
    }
}

/**
 * 영상 검색 API 호출
 */
async function searchVideos(keyword, topN = 10, append = false) {
    if (!append) {
        setLoading(true);
        errorSection.classList.add('hidden');
    } else {
        loadMoreBtn.disabled = true;
        loadMoreText.textContent = '로딩 중...';
        loadMoreLoader.classList.remove('hidden');
    }

    const filters = getFilters();
    if (!append) {
        showActiveFilters(filters);
    }

    try {
        const params = new URLSearchParams({
            keyword: keyword,
            top_n: topN,
            ...filters
        });

        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || '검색 중 오류가 발생했습니다.');
        }

        currentKeyword = keyword;
        currentVideoCount = data.videos.length;
        allVideos = data.videos;
        isTrendingMode = filters.trending_mode;

        showResults(
            `🏆 Top ${data.videos.length} 영상`,
            `"${keyword}" 검색 결과`,
            data.videos,
            filters.trending_mode,
            data.videos.length < 30
        );
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
        loadMoreBtn.disabled = false;
        loadMoreLoader.classList.add('hidden');
    }
}

/**
 * 더보기 클릭 핸들러
 */
loadMoreBtn.addEventListener('click', async () => {
    if (currentKeyword) {
        const newCount = Math.min(currentVideoCount + 10, 30);
        await searchVideos(currentKeyword, newCount);
    }
});

/**
 * 검색 실행
 */
function handleSearch() {
    const keyword = keywordInput.value.trim();

    if (!keyword) {
        keywordInput.focus();
        return;
    }

    currentVideoCount = 10;
    searchVideos(keyword, 10);
}

// 이벤트 리스너
searchBtn.addEventListener('click', handleSearch);

keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// 초기화
keywordInput.focus();
updateSliderValues();

// 페이지 로드 시 트렌딩 영상 자동 로드
document.addEventListener('DOMContentLoaded', () => {
    loadTrendingVideos();
});

// ============================================
// 스크립트 모달 관련 함수
// ============================================

let currentTranscriptVideoId = '';
let currentTranscriptTitle = '';

/**
 * 스크립트 모달 열기
 */
function openTranscriptModal(videoId, title) {
    currentTranscriptVideoId = videoId;
    currentTranscriptTitle = title;

    const modal = document.getElementById('transcript-modal');
    const titleEl = document.getElementById('transcript-video-title');
    const loadingEl = document.getElementById('transcript-loading');
    const contentEl = document.getElementById('transcript-content');
    const errorEl = document.getElementById('transcript-error');

    // 초기화
    titleEl.textContent = title;
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    document.getElementById('include-timestamps').checked = false;

    // 모달 표시
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // 스크립트 로드
    fetchTranscript(videoId, false);
}

/**
 * 스크립트 모달 닫기
 */
function closeTranscriptModal() {
    const modal = document.getElementById('transcript-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

/**
 * 스크립트 다시 로드 (타임스탬프 옵션 변경 시)
 */
function reloadTranscript() {
    const timestamps = document.getElementById('include-timestamps').checked;
    const loadingEl = document.getElementById('transcript-loading');
    const contentEl = document.getElementById('transcript-content');

    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');

    fetchTranscript(currentTranscriptVideoId, timestamps);
}

/**
 * 스크립트 API 호출
 */
async function fetchTranscript(videoId, includeTimestamps) {
    const loadingEl = document.getElementById('transcript-loading');
    const contentEl = document.getElementById('transcript-content');
    const errorEl = document.getElementById('transcript-error');
    const textEl = document.getElementById('transcript-text');
    const langEl = document.getElementById('transcript-language');
    const wordCountEl = document.getElementById('transcript-word-count');

    try {
        const response = await fetch(
            `/api/transcript/${videoId}?timestamps=${includeTimestamps}`
        );

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || '스크립트를 불러올 수 없습니다.');
        }

        const data = await response.json();

        // 언어 표시
        const langNames = {
            'ko': '한국어',
            'en': '영어',
            'ja': '일본어',
            'zh-Hans': '중국어(간체)',
            'zh-Hant': '중국어(번체)'
        };
        const langName = langNames[data.language] || data.language;
        langEl.textContent = `🌐 ${langName}${data.is_generated ? ' (자동 생성)' : ''}`;
        wordCountEl.textContent = `📊 ${data.word_count.toLocaleString()}단어`;

        // 텍스트 표시
        textEl.value = data.text;

        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
        errorEl.classList.add('hidden');

    } catch (error) {
        loadingEl.classList.add('hidden');
        contentEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
        document.getElementById('transcript-error-message').textContent = error.message;
    }
}

/**
 * 스크립트 클립보드 복사
 */
function copyTranscript() {
    const textEl = document.getElementById('transcript-text');
    const copyBtn = document.getElementById('copy-transcript-btn');

    navigator.clipboard.writeText(textEl.value).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ 복사됨!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        alert('복사 실패: ' + err);
    });
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTranscriptModal();
    }
});

// ============================================
// AI 스크립트 재구성 기능 (역할 2)
// ============================================

let currentTranscriptText = '';

/**
 * 재구성 패널 열기
 */
function openRewritePanel() {
    const panel = document.getElementById('rewrite-panel');
    const transcriptText = document.getElementById('transcript-text').value;

    if (!transcriptText.trim()) {
        alert('먼저 스크립트를 로드해주세요.');
        return;
    }

    currentTranscriptText = transcriptText;
    panel.classList.remove('hidden');

    // 결과 초기화
    document.getElementById('rewrite-result').classList.add('hidden');
    document.getElementById('rewrite-loading').classList.add('hidden');
}

/**
 * 재구성 패널 닫기
 */
function closeRewritePanel() {
    document.getElementById('rewrite-panel').classList.add('hidden');
}

/**
 * AI 스크립트 재구성 실행
 */
async function generateRewrite() {
    const style = document.getElementById('rewrite-style').value;
    const length = document.getElementById('rewrite-length').value;
    const instructions = document.getElementById('rewrite-instructions').value;

    const loadingEl = document.getElementById('rewrite-loading');
    const resultEl = document.getElementById('rewrite-result');
    const generateBtn = document.getElementById('generate-btn');

    // 로딩 상태
    loadingEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ 생성 중...';

    try {
        const response = await fetch('/api/rewrite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                original_script: currentTranscriptText,
                style: style,
                target_length: length,
                additional_instructions: instructions,
                provider: 'gemini'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || '재구성 실패');
        }

        const data = await response.json();

        // 결과 표시
        document.getElementById('rewrite-text').value = data.rewritten_script;
        document.getElementById('rewrite-info').textContent =
            `${data.model_used} | 원본 ${data.original_length.toLocaleString()}자 → ${data.rewritten_length.toLocaleString()}자`;

        loadingEl.classList.add('hidden');
        resultEl.classList.remove('hidden');

    } catch (error) {
        alert('재구성 오류: ' + error.message);
        loadingEl.classList.add('hidden');
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = '🚀 재구성 시작';
    }
}

/**
 * 재구성된 스크립트 복사
 */
function copyRewrite() {
    const textEl = document.getElementById('rewrite-text');
    const copyBtns = document.querySelectorAll('.rewrite-result .copy-btn');

    navigator.clipboard.writeText(textEl.value).then(() => {
        copyBtns.forEach(btn => {
            const originalText = btn.textContent;
            btn.textContent = '✅ 복사됨!';
            btn.classList.add('copied');

            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        });
    }).catch(err => {
        alert('복사 실패: ' + err);
    });
}
