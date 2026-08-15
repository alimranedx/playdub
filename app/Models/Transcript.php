<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transcript extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_id',
        'speaker_id',
        'start_time',
        'end_time',
        'text',
        'sequence',
    ];

    protected $casts = [
        'start_time' => 'float',
        'end_time' => 'float',
        'sequence' => 'integer',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }

    public function speaker(): BelongsTo
    {
        return $this->belongsTo(Speaker::class);
    }

    public function translatedSegments(): HasMany
    {
        return $this->hasMany(TranslatedSegment::class);
    }
}
