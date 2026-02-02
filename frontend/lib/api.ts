const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ScrapeResponse {
  title: string;
  content: string;
  source: string;
  char_count: number;
}

export interface StyleConfig {
  tone: string;
  target: string;
  emoji_level: number;
  custom: string;
}

export interface TransformResult {
  channel: string;
  channel_name: string;
  content: string;
  char_count: number;
}

export interface TransformResponse {
  results: TransformResult[];
  calendar: string | null;
}

export interface ChannelInfo {
  key: string;
  name: string;
  description: string;
}

export interface PromptInfo {
  channel: string;
  name: string;
  prompt: string;
}

export async function scrapeUrl(url: string): Promise<ScrapeResponse> {
  const response = await fetch(`${API_BASE_URL}/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'URL 추출 실패');
  }

  return response.json();
}

export async function transformContent(
  content: string,
  channels: string[],
  styleConfig?: StyleConfig,
  customPrompts?: Record<string, string>
): Promise<TransformResponse> {
  const response = await fetch(`${API_BASE_URL}/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      channels,
      style_config: styleConfig,
      custom_prompts: customPrompts,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '변환 실패');
  }

  return response.json();
}

export async function getChannels(): Promise<ChannelInfo[]> {
  const response = await fetch(`${API_BASE_URL}/channels`);

  if (!response.ok) {
    throw new Error('채널 목록 조회 실패');
  }

  return response.json();
}

export async function getChannelPrompt(channel: string): Promise<PromptInfo> {
  const response = await fetch(`${API_BASE_URL}/prompts/${channel}`);

  if (!response.ok) {
    throw new Error('프롬프트 조회 실패');
  }

  return response.json();
}


// ============================================
// YouTube 관련 API
// ============================================

export interface YouTubeVideo {
  video_id: string;
  title: string;
  channel_title: string;
  published_at: string;
  thumbnail: string;
  description: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration: string;
  duration_seconds: number;
  is_shorts: boolean;
  quality_score: number;
  views_per_day: number;
  days_ago: number;
  engagement_rate: number;
  url: string;
}

export interface YouTubeSearchResponse {
  success: boolean;
  keyword: string;
  count: number;
  videos: YouTubeVideo[];
}

export interface YouTubeSearchParams {
  keyword: string;
  top_n?: number;
  shorts_only?: boolean;
  exclude_shorts?: boolean;
  duration_filter?: string;
  upload_period?: string;
  language?: string;
  trending_mode?: boolean;
  min_views?: number;
}

export interface TranscriptResponse {
  success: boolean;
  video_id: string;
  language: string;
  is_generated: boolean;
  text: string;
  word_count: number;
}

export interface RewriteResponse {
  success: boolean;
  rewritten_script: string;
  model_used: string;
  original_length: number;
  rewritten_length: number;
  style: string;
  target_length: string;
}

export async function searchYouTubeVideos(params: YouTubeSearchParams): Promise<YouTubeSearchResponse> {
  const queryParams = new URLSearchParams({
    keyword: params.keyword,
    top_n: String(params.top_n || 10),
    shorts_only: String(params.shorts_only || false),
    exclude_shorts: String(params.exclude_shorts || false),
    duration_filter: params.duration_filter || 'any',
    upload_period: params.upload_period || 'any',
    language: params.language || 'any',
    trending_mode: String(params.trending_mode || false),
    min_views: String(params.min_views || 0),
  });

  const response = await fetch(`${API_BASE_URL}/youtube/search?${queryParams}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'YouTube 검색 실패');
  }

  return response.json();
}

export async function getTrendingVideos(top_n: number = 10): Promise<YouTubeSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/youtube/trending?top_n=${top_n}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '트렌딩 조회 실패');
  }

  return response.json();
}

export async function getTranscript(
  video_id: string,
  lang: string = 'ko',
  timestamps: boolean = false
): Promise<TranscriptResponse> {
  const response = await fetch(
    `${API_BASE_URL}/youtube/transcript/${video_id}?lang=${lang}&timestamps=${timestamps}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '대본 추출 실패');
  }

  return response.json();
}

export async function rewriteScript(
  original_script: string,
  style: string = 'informative',
  target_length: string = 'similar',
  additional_instructions: string = '',
  provider: string = 'gemini'
): Promise<RewriteResponse> {
  const response = await fetch(`${API_BASE_URL}/youtube/rewrite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      original_script,
      style,
      target_length,
      additional_instructions,
      provider,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '스크립트 재구성 실패');
  }

  return response.json();
}
