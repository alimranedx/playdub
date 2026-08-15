<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcessingJobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'video_id' => $this->video_id,
            'dubbed_video_id' => $this->dubbed_video_id,
            'job_type' => $this->job_type,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'progress' => $this->progress,
            'current_step' => $this->current_step,
            'error_message' => $this->error_message,
            'started_at' => $this->started_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
