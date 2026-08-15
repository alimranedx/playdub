<?php

namespace App\Enums;

enum JobStatusEnum: string
{
    case PENDING = 'pending';
    case QUEUED = 'queued';
    case DOWNLOADING = 'downloading';
    case EXTRACTING_AUDIO = 'extracting_audio';
    case TRANSCRIBING = 'transcribing';
    case DETECTING_SPEAKERS = 'detecting_speakers';
    case TRANSLATING = 'translating';
    case GENERATING_VOICE = 'generating_voice';
    case SYNCHRONIZING = 'synchronizing';
    case ENCODING = 'encoding';
    case GENERATING_STREAM = 'generating_stream';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';
}
