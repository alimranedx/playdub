<?php

namespace App\Models;

use App\Enums\JobStatusEnum;
use App\Enums\SourceTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'source_type',
        'source_url',
        'original_file_path',
        'original_language',
        'duration',
        'file_size',
        'status',
    ];

    protected $casts = [
        'source_type' => SourceTypeEnum::class,
        'status' => JobStatusEnum::class,
        'duration' => 'integer',
        'file_size' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dubbedVideos(): HasMany
    {
        return $this->hasMany(DubbedVideo::class);
    }

    public function transcripts(): HasMany
    {
        return $this->hasMany(Transcript::class);
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(Speaker::class);
    }

    public function processingJobs(): HasMany
    {
        return $this->hasMany(ProcessingJob::class);
    }
}
