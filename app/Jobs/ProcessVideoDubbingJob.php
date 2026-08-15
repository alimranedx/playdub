<?php

namespace App\Jobs;

use App\Enums\JobStatusEnum;
use App\Models\DubbedVideo;
use App\Models\ProcessingJob;
use App\Models\Transcript;
use App\Models\TranslatedSegment;
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

        if (!app()->environment('testing')) {
            sleep(1);
        }

        foreach ($steps as $stepData) {
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
                sleep(2);
            }
        }

        // Generate Transcript and Translated Segment Records (e.g., Hindi -> Bangla or En -> Target)
        $sourceLang = $video->original_language === 'auto' ? 'hi' : $video->original_language;
        $targetLang = $dubbedVideo->target_language;

        $demoSegments = $this->getDemoSegmentsForLanguagePair($sourceLang, $targetLang);

        // Delete previous transcripts & translated segments for clean generation
        Transcript::where('video_id', $video->id)->delete();

        foreach ($demoSegments as $index => $item) {
            $transcript = Transcript::create([
                'video_id' => $video->id,
                'start_time' => $item['start_time'],
                'end_time' => $item['end_time'],
                'text' => $item['source_text'],
                'sequence' => $index + 1,
            ]);

            TranslatedSegment::create([
                'dubbed_video_id' => $dubbedVideo->id,
                'transcript_id' => $transcript->id,
                'translated_text' => $item['translated_text'],
                'start_time' => $item['start_time'],
                'end_time' => $item['end_time'],
                'sequence' => $index + 1,
            ]);
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

        Log::info("Dubbing Job #{$jobRecord->id} completed with transcripts for DubbedVideo #{$dubbedVideo->id}");
    }

    private function getDemoSegmentsForLanguagePair(string $sourceLang, string $targetLang): array
    {
        if ($sourceLang === 'hi' && $targetLang === 'bn') {
            return [
                [
                    'start_time' => 0.0,
                    'end_time' => 3.5,
                    'source_text' => 'नमस्ते, प्लेडब में आपका स्वागत है।',
                    'translated_text' => 'নমস্কার, প্লেডাবে আপনাকে স্বাগতম।',
                ],
                [
                    'start_time' => 3.6,
                    'end_time' => 7.8,
                    'source_text' => 'यह वीडियो हिंदी से बांग्ला में अनुवादित किया गया है।',
                    'translated_text' => 'এই ভিডিওটি হিন্দি থেকে বাংলায় অনূদিত হয়েছে।',
                ],
                [
                    'start_time' => 7.9,
                    'end_time' => 12.0,
                    'source_text' => 'एआई बहुभाषी वीडियो डबिंग प्लेटफॉर्म।',
                    'translated_text' => 'এআই বহুভাষিক ভিডিও ডাবিং প্ল্যাটফর্ম।',
                ],
                [
                    'start_time' => 12.1,
                    'end_time' => 16.5,
                    'source_text' => 'आप किसी भी भाषा में वीडियो देख सकते हैं।',
                    'translated_text' => 'আপনি যেকোনো ভাষায় ভিডিও দেখতে পারেন।',
                ],
            ];
        }

        if ($targetLang === 'bn') {
            return [
                [
                    'start_time' => 0.0,
                    'end_time' => 3.5,
                    'source_text' => 'Welcome to PlayDub AI Video Dubbing Platform.',
                    'translated_text' => 'প্লেডাব এআই ভিডিও ডাবিং প্ল্যাটফর্মে আপনাকে স্বাগতম।',
                ],
                [
                    'start_time' => 3.6,
                    'end_time' => 7.8,
                    'source_text' => 'Translating audio content directly into Bangla.',
                    'translated_text' => 'ভিডিওর অডিও কনটেন্ট সরাসরি বাংলায় অনূদিত হচ্ছে।',
                ],
                [
                    'start_time' => 7.9,
                    'end_time' => 12.0,
                    'source_text' => 'AI speech-to-text, translation, and voice synthesis.',
                    'translated_text' => 'এআই স্পিচ-টু-টেক্সট, অনুবাদ এবং ভয়েস সিন্থেসিস প্রযুক্তি।',
                ],
                [
                    'start_time' => 12.1,
                    'end_time' => 16.5,
                    'source_text' => 'Enjoy your video with native Bangla audio and subtitles.',
                    'translated_text' => 'বাংলা অডিও এবং সাবটাইটেল সহ ভিডিওটি উপভোগ করুন।',
                ],
            ];
        }

        return [
            [
                'start_time' => 0.0,
                'end_time' => 3.5,
                'source_text' => 'Original Video Audio Stream',
                'translated_text' => "Translated Audio Stream ({$targetLang})",
            ],
            [
                'start_time' => 3.6,
                'end_time' => 8.0,
                'source_text' => 'Multilingual speech processing active',
                'translated_text' => "Processed target language content ({$targetLang})",
            ],
        ];
    }
}
