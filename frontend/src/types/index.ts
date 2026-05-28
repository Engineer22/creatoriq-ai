// CreatorIQ AI - TypeScript Types

export type Platform = 'youtube' | 'tiktok' | 'instagram';
export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VideoAnalysis {
  id: string;
  video_id: string;
  hook_score: number | null;
  retention_score: number | null;
  emotion_score: number | null;
  viral_score: number | null;
  storytelling_score: number | null;
  cta_score: number | null;
  pacing_score: number | null;
  overall_score: number | null;
  hook_analysis: string | null;
  retention_analysis: string | null;
  emotion_analysis: string | null;
  viral_analysis: string | null;
  storytelling_analysis: string | null;
  cta_analysis: string | null;
  pacing_analysis: string | null;
  executive_summary: string | null;
  key_strengths: string[] | null;
  improvement_areas: string[] | null;
  action_plan: ActionPlanItem[] | null;
  target_audience: TargetAudience | null;
  emotional_triggers: string[] | null;
  curiosity_gaps: string[] | null;
  storytelling_structure: StorytellingStructure | null;
  viral_elements: string[] | null;
  improved_hook: string | null;
  improved_cta: string | null;
  improved_script: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionPlanItem {
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  timeframe: 'immediate' | 'short-term' | 'long-term';
}

export interface TargetAudience {
  primary_demographic: string;
  interests: string[];
  pain_points: string[];
  platform_behavior: string;
  psychographic_profile: string;
}

export interface StorytellingStructure {
  framework: string;
  opening: string;
  middle: string;
  ending: string;
  narrative_arc: string;
}

export interface Video {
  id: string;
  platform: Platform;
  original_url: string;
  video_id: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  creator_name: string | null;
  creator_handle: string | null;
  creator_followers: number | null;
  published_at: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  engagement_rate: number | null;
  transcript: string | null;
  status: VideoStatus;
  tags: string[] | null;
  hashtags: string[] | null;
  top_comments: Comment[] | null;
  analysis: VideoAnalysis | null;
  created_at: string;
  analyzed_at: string | null;
}

export interface Comment {
  text: string;
  author: string;
  likes: number;
  published_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: ChatSource[];
  created_at: string;
}

export interface ChatSource {
  video_id: string;
  title: string;
  platform: string;
  relevance: number;
}

export interface ChatSession {
  id: string;
  title: string;
  context_video_ids: string[] | null;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  overview: {
    total_videos: number;
    analyzed_videos: number;
    pending_analysis: number;
    credits_used: number;
    credits_limit: number;
    credits_remaining: number;
  };
  platforms: Record<string, number>;
  average_scores: {
    overall: number;
    hook: number;
    viral: number;
    retention: number;
    emotion: number;
  };
  recent_videos: VideoSummary[];
  top_videos: VideoSummary[];
}

export interface VideoSummary {
  id: string;
  title: string | null;
  platform: Platform;
  thumbnail_url: string | null;
  status: VideoStatus;
  created_at?: string;
  overall_score?: number | null;
  viral_score?: number | null;
  hook_score?: number | null;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export interface ScoreLabel {
  label: string;
  color: string;
  bg: string;
}

export function getScoreLabel(score: number | null): ScoreLabel {
  if (score === null) return { label: 'N/A', color: 'text-muted-foreground', bg: 'bg-muted' };
  if (score >= 80) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
  if (score >= 65) return { label: 'Good', color: 'text-cyan-400', bg: 'bg-cyan-400/10' };
  if (score >= 45) return { label: 'Average', color: 'text-amber-400', bg: 'bg-amber-400/10' };
  return { label: 'Needs Work', color: 'text-rose-400', bg: 'bg-rose-400/10' };
}

export function getScoreColor(score: number | null): string {
  if (score === null) return '#64748b';
  if (score >= 80) return '#10b981';
  if (score >= 65) return '#06b6d4';
  if (score >= 45) return '#f59e0b';
  return '#f43f5e';
}

export function formatNumber(n: number | null | undefined): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function platformColor(platform: Platform): string {
  switch (platform) {
    case 'youtube': return '#ff0000';
    case 'tiktok': return '#00f2ea';
    case 'instagram': return '#e1306c';
    default: return '#6366f1';
  }
}

export function platformIcon(platform: Platform): string {
  switch (platform) {
    case 'youtube': return '▶';
    case 'tiktok': return '♪';
    case 'instagram': return '◎';
    default: return '●';
  }
}
