export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Language {
  id: number;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}

export type SourceType = 'upload' | 'url';

export type JobStatus =
  | 'pending'
  | 'queued'
  | 'downloading'
  | 'extracting_audio'
  | 'transcribing'
  | 'detecting_speakers'
  | 'translating'
  | 'generating_voice'
  | 'synchronizing'
  | 'encoding'
  | 'generating_stream'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface Video {
  id: number;
  user_id: number;
  title: string;
  source_type: SourceType;
  source_url?: string;
  original_file_path?: string;
  original_language: string;
  duration?: number;
  file_size?: number;
  status: JobStatus;
  created_at: string;
}

export interface DubbedVideo {
  id: number;
  video_id: number;
  source_language: string;
  target_language: string;
  status: JobStatus;
  audio_path?: string;
  video_path?: string;
  stream_path?: string;
  duration?: number;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
