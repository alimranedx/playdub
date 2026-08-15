<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'source_type' => $this->source_type instanceof \BackedEnum ? $this->source_type->value : $this->source_type,
            'source_url' => $this->source_url,
            'original_file_path' => $this->original_file_path,
            'original_language' => $this->original_language,
            'duration' => $this->duration,
            'file_size' => $this->file_size,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'dubbed_videos' => DubbedVideoResource::collection($this->whenLoaded('dubbedVideos')),
        ];
    }
}
