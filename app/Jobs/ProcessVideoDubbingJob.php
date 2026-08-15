<?php

namespace App\Jobs;

use App\Enums\JobStatusEnum;
use App\Models\DubbedVideo;
use App\Models\ProcessingJob;
use App\Models\Video;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessVideoDubbingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $processingJobId;

    public function __construct(int $processingJobId)
    {
        $this->processingJobId = $processingJobId;
    }

    public function handle(): void
    {
        $jobRecord = ProcessingJob::find($this->processingJobId);
        if (!$jobRecord) {
            return;
        }

        $video = Video::find($jobRecord->video_id);
        $dubbedVideo = DubbedVideo::find($jobRecord->dubbed_video_id);

        if (!$video || !$dubbedVideo) {
            return;
        }

        $steps = [
            ['status' => JobStatusEnum::DOWNLOADING, 'progress' => 15, 'step' => 'Downloading video stream...'],
            ['status' => JobStatusEnum::EXTRACTING_AUDIO, 'progress' => 30, 'step' => 'Extracting high quality audio track...'],
            ['status' => JobStatusEnum::TRANSCRIBING, 'progress' => 48, 'step' => 'Transcribing speech to text...'],
            ['status' => JobStatusEnum::DETECTING_SPEAKERS, 'progress' => 60, 'step' => 'Detecting speakers and audio profiles...'],
            ['status' => JobStatusEnum::TRANSLATING, 'progress' => 75, 'step' => 'Translating text to target language...'],
            ['status' => JobStatusEnum::GENERATING_VOICE, 'progress' => 90, 'step' => 'Synthesizing target voice (TTS)...'],
            ['status' => JobStatusEnum::SYNCHRONIZING, 'progress' => 98, 'step' => 'Synchronizing audio and video remux...'],
        ];

        $jobRecord->update([
            'status' => JobStatusEnum::QUEUED,
            'started_at' => now(),
            'progress' => 5,
            'current_step' => 'Job queued in Redis processing queue',
        ]);

        sleep(1);

        foreach ($steps as $stepData) {
            // Check if job was cancelled
            $jobRecord->refresh();
            if ($jobRecord->status === JobStatusEnum::CANCELLED) {
                return;
            }

            $jobRecord->update([
                'status' => $stepData['status'],
                'progress' => $stepData['progress'],
                'current_step' => $stepData['step'],
            ]);

            $dubbedVideo->update(['status' => $stepData['status']]);
            $video->update(['status' => $stepData['status']]);

            if (!app()->environment('testing')) {
                sleep(2); // Simulate processing step delay
            }
        }

        // Mark as completed
        $jobRecord->update([
            'status' => JobStatusEnum::COMPLETED,
            'progress' => 100,
            'current_step' => 'Dubbing completed successfully',
            'completed_at' => now(),
        ]);

        $dubbedVideo->update([
            'status' => JobStatusEnum::COMPLETED,
            'video_path' => $video->original_file_path ?: $video->source_url,
        ]);

        $video->update([
            'status' => JobStatusEnum::COMPLETED,
        ]);

        Log::info("Dubbing Job #{$jobRecord->id} completed for DubbedVideo #{$dubbedVideo->id}");
    }
}
