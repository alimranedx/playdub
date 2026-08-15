<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\JobStatusEnum;
use App\Enums\SourceTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Video\CreateVideoRequest;
use App\Http\Resources\DubbedVideoResource;
use App\Http\Resources\ProcessingJobResource;
use App\Http\Resources\VideoResource;
use App\Jobs\ProcessVideoDubbingJob;
use App\Models\DubbedVideo;
use App\Models\ProcessingJob;
use App\Models\Transcript;
use App\Models\Video;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VideoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $videos = Video::where('user_id', $request->user()->id)
            ->with(['dubbedVideos.processingJobs'])
            ->latest()
            ->get();

        return response()->json([
            'videos' => VideoResource::collection($videos),
        ]);
    }

    public function store(CreateVideoRequest $request): JsonResponse
    {
        $user = $request->user();
        $sourceType = $request->source_type;
        $originalFilePath = null;
        $title = $request->title;

        if ($sourceType === 'upload' && $request->hasFile('video_file')) {
            $file = $request->file('video_file');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $originalFilePath = $file->storeAs('videos/uploads', $filename, 'public');
            if (!$title) {
                $title = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            }
        } elseif ($sourceType === 'url') {
            if (!$title) {
                $title = 'Video URL Source (' . parse_url($request->source_url, PHP_URL_HOST) . ')';
            }
        }

        if (!$title) {
            $title = 'Untitled Video Project';
        }

        $video = Video::create([
            'user_id' => $user->id,
            'title' => $title,
            'source_type' => $sourceType === 'url' ? SourceTypeEnum::URL : SourceTypeEnum::UPLOAD,
            'source_url' => $request->source_url,
            'original_file_path' => $originalFilePath,
            'original_language' => $request->original_language ?? 'auto',
            'status' => JobStatusEnum::PENDING,
        ]);

        // Create initial Dubbed Video record
        $dubbedVideo = DubbedVideo::create([
            'video_id' => $video->id,
            'source_language' => $request->original_language ?? 'auto',
            'target_language' => $request->target_language,
            'status' => JobStatusEnum::PENDING,
        ]);

        // Create Processing Job record
        $processingJob = ProcessingJob::create([
            'video_id' => $video->id,
            'dubbed_video_id' => $dubbedVideo->id,
            'job_type' => 'dubbing',
            'status' => JobStatusEnum::PENDING,
            'progress' => 0,
            'current_step' => 'Project initialized and waiting in queue',
        ]);

        // Dispatch asynchronous queue job
        dispatch(new ProcessVideoDubbingJob($processingJob->id));

        $video->load(['dubbedVideos.processingJobs']);

        return response()->json([
            'message' => 'Video dubbing project created successfully.',
            'video' => new VideoResource($video),
            'dubbed_video' => new DubbedVideoResource($dubbedVideo),
            'job' => new ProcessingJobResource($processingJob),
        ], 201);
    }

    public function show(Request $request, Video $video): JsonResponse
    {
        if ($video->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $video->load(['dubbedVideos.processingJobs']);

        return response()->json([
            'video' => new VideoResource($video),
        ]);
    }

    public function destroy(Request $request, Video $video): JsonResponse
    {
        if ($video->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $video->delete();

        return response()->json([
            'message' => 'Video project deleted successfully.',
        ]);
    }

    public function dub(Request $request, Video $video): JsonResponse
    {
        if ($video->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $request->validate([
            'target_language' => ['required', 'string', 'max:10'],
        ]);

        $dubbedVideo = DubbedVideo::create([
            'video_id' => $video->id,
            'source_language' => $video->original_language,
            'target_language' => $request->target_language,
            'status' => JobStatusEnum::PENDING,
        ]);

        $processingJob = ProcessingJob::create([
            'video_id' => $video->id,
            'dubbed_video_id' => $dubbedVideo->id,
            'job_type' => 'dubbing',
            'status' => JobStatusEnum::PENDING,
            'progress' => 0,
            'current_step' => 'Target language dubbing queued',
        ]);

        dispatch(new ProcessVideoDubbingJob($processingJob->id));

        return response()->json([
            'message' => 'New target language dubbing job started.',
            'dubbed_video' => new DubbedVideoResource($dubbedVideo),
            'job' => new ProcessingJobResource($processingJob),
        ], 201);
    }

    public function dubStatus(Request $request, DubbedVideo $dub): JsonResponse
    {
        if ($dub->video->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $latestJob = $dub->processingJobs()->latest()->first();

        return response()->json([
            'dubbed_video' => new DubbedVideoResource($dub),
            'job' => $latestJob ? new ProcessingJobResource($latestJob) : null,
        ]);
    }

    public function retryDub(Request $request, DubbedVideo $dub): JsonResponse
    {
        if ($dub->video->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $processingJob = ProcessingJob::create([
            'video_id' => $dub->video_id,
            'dubbed_video_id' => $dub->id,
            'job_type' => 'dubbing',
            'status' => JobStatusEnum::PENDING,
            'progress' => 0,
            'current_step' => 'Retrying dubbing job',
        ]);

        $dub->update(['status' => JobStatusEnum::PENDING]);

        dispatch(new ProcessVideoDubbingJob($processingJob->id));

        return response()->json([
            'message' => 'Dubbing job restarted.',
            'job' => new ProcessingJobResource($processingJob),
        ]);
    }

    public function transcript(Request $request, Video $video): JsonResponse
    {
        if ($video->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $targetLang = $request->query('target_language', 'bn');
        $dubbedVideo = $video->dubbedVideos()->where('target_language', $targetLang)->first();

        $transcripts = Transcript::where('video_id', $video->id)
            ->orderBy('sequence')
            ->get();

        $result = $transcripts->map(function ($t) use ($dubbedVideo) {
            $translatedSegment = $dubbedVideo
                ? $t->translatedSegments()->where('dubbed_video_id', $dubbedVideo->id)->first()
                : null;

            return [
                'id' => $t->id,
                'sequence' => $t->sequence,
                'start_time' => (float) $t->start_time,
                'end_time' => (float) $t->end_time,
                'source_text' => $t->text,
                'translated_text' => $translatedSegment ? $translatedSegment->translated_text : $t->text,
            ];
        });

        return response()->json([
            'video_id' => $video->id,
            'original_language' => $video->original_language,
            'target_language' => $targetLang,
            'segments' => $result,
        ]);
    }
}
