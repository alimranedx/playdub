<?php

namespace App\Console\Commands;

use App\Jobs\ProcessVideoDubbingJob;
use App\Models\ProcessingJob;
use Illuminate\Console\Command;

class ProcessPendingJobs extends Command
{
    protected $signature = 'playdub:process-pending';
    protected $description = 'Process all pending or stalled AI video dubbing jobs';

    public function handle(): void
    {
        $pendingJobs = ProcessingJob::where('progress', '<', 100)
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'failed')
            ->where('status', '!=', 'cancelled')
            ->get();

        if ($pendingJobs->isEmpty()) {
            $this->info('No pending dubbing jobs found.');
            return;
        }

        $this->info("Found {$pendingJobs->count()} pending dubbing job(s). Processing...");

        foreach ($pendingJobs as $job) {
            $this->info("Processing Job #{$job->id} (Video #{$job->video_id})...");
            (new ProcessVideoDubbingJob($job->id))->handle();
        }

        $this->info('All pending dubbing jobs completed successfully.');
    }
}
