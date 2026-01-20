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
