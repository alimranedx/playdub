<?php

namespace App\Models;

use App\Enums\JobStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DubbedVideo extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_id',
        'source_language',
        'target_language',
        'status',
        'audio_path',
        'video_path',
        'stream_path',
        'duration',
    ];

    protected $casts = [
        'status' => JobStatusEnum::class,
        'duration' => 'integer',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }

    public function translatedSegments(): HasMany
    {
        return $this->hasMany(TranslatedSegment::class);
    }

    public function processingJobs(): HasMany
    {
        return $this->hasMany(ProcessingJob::class);
    }
}
