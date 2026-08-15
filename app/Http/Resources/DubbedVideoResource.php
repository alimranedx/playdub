<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DubbedVideoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $latestJob = $this->processingJobs()->latest()->first();

        return [
            'id' => $this->id,
            'video_id' => $this->video_id,
            'source_language' => $this->source_language,
            'target_language' => $this->target_language,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'audio_path' => $this->audio_path,
            'video_path' => $this->video_path,
            'stream_path' => $this->stream_path,
            'duration' => $this->duration,
            'latest_job' => $latestJob ? new ProcessingJobResource($latestJob) : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
