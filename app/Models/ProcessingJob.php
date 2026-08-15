<?php

namespace App\Models;

use App\Enums\JobStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcessingJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_id',
        'dubbed_video_id',
        'job_type',
        'status',
        'progress',
        'current_step',
        'error_message',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'status' => JobStatusEnum::class,
        'progress' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }

    public function dubbedVideo(): BelongsTo
    {
        return $this->belongsTo(DubbedVideo::class);
    }
}
