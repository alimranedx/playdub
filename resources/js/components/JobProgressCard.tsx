import React, { useState } from 'react';
import { DubbedVideo, Video, Language, JobStatus } from '../types';
import api from '../services/api';

interface JobProgressCardProps {
  video: Video;
  dubbedVideo: DubbedVideo;
  languages: Language[];
  onWatch: (video: Video, dub: DubbedVideo) => void;
  onRetrySuccess?: () => void;
}

export const JobProgressCard: React.FC<JobProgressCardProps> = ({
  video,
  dubbedVideo,
  languages,
  onWatch,
  onRetrySuccess,
}) => {
  const [retrying, setRetrying] = useState(false);

  const job = dubbedVideo.latest_job;
  const status: JobStatus = job?.status || dubbedVideo.status || 'pending';
  const progress: number = job?.progress ?? (status === 'completed' ? 100 : 0);
  const currentStep = job?.current_step || 'Initializing processing pipeline...';

  const sourceLangName = languages.find((l) => l.code === dubbedVideo.source_language)?.name || dubbedVideo.source_language;
  const targetLangName = languages.find((l) => l.code === dubbedVideo.target_language)?.name || dubbedVideo.target_language;

  // Step definitions matching Section 8 pipeline
  const pipelineSteps = [
    { key: 'downloading', label: 'Downloading & Ingesting Video', threshold: 15 },
    { key: 'extracting_audio', label: 'Extracting Audio Track', threshold: 30 },
    { key: 'transcribing', label: 'Speech-to-Text Transcription', threshold: 48 },
    { key: 'detecting_speakers', label: 'Speaker & Voice Diarization', threshold: 60 },
    { key: 'translating', label: 'Translating to Target Language', threshold: 75 },
    { key: 'generating_voice', label: 'Synthesizing Target Voice (TTS)', threshold: 90 },
    { key: 'synchronizing', label: 'Audio/Video Sync & Muxing', threshold: 100 },
  ];

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await api.post(`/dubs/${dubbedVideo.id}/retry`);
      if (onRetrySuccess) {
        onRetrySuccess();
      }
    } catch (err) {
      console.error('Failed to retry dubbing:', err);
    } finally {
      setRetrying(false);
    }
  };

  const getStepIcon = (threshold: number) => {
    if (status === 'completed' || progress >= threshold) {
      return <i className="bi bi-check-circle-fill text-success fs-5"></i>;
    }
    if (status === 'failed') {
      if (progress < threshold && progress >= threshold - 15) {
        return <i className="bi bi-x-circle-fill text-danger fs-5"></i>;
      }
      return <i className="bi bi-dash-circle text-secondary fs-5"></i>;
    }
    if (progress > threshold - 16 && progress < threshold) {
      return (
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      );
    }
    return <i className="bi bi-circle text-secondary fs-5"></i>;
  };

  return (
    <div className="glass-card p-4 mb-4">
      {/* Top Header Row */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary px-3 py-1 rounded-pill mb-2">
            <i className="bi bi-translate me-1"></i> {sourceLangName} &rarr; {targetLangName}
          </span>
          <h5 className="text-white brand-font fw-bold mb-0">{video.title}</h5>
        </div>

        {/* Status Badge */}
        <div>
          {status === 'completed' ? (
            <span className="badge bg-success bg-opacity-20 text-success border border-success px-3 py-2 rounded-pill fw-semibold">
              <i className="bi bi-check-all me-1 fs-6"></i> Dubbing Complete
            </span>
          ) : status === 'failed' ? (
            <span className="badge bg-danger bg-opacity-20 text-danger border border-danger px-3 py-2 rounded-pill fw-semibold">
              <i className="bi bi-exclamation-octagon-fill me-1 fs-6"></i> Processing Failed
            </span>
          ) : (
            <span className="badge bg-primary bg-opacity-20 text-info border border-info px-3 py-2 rounded-pill fw-semibold pulse-indicator">
              <i className="bi bi-arrow-repeat me-1 spin-icon"></i> Processing ({progress}%)
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center small text-secondary mb-2">
          <span className="fw-medium text-light">{currentStep}</span>
          <span className="fw-bold text-gradient fs-6">{progress}%</span>
        </div>
        <div className="progress bg-dark bg-opacity-50" style={{ height: '12px', borderRadius: '6px' }}>
          <div
            className={`progress-bar ${
              status === 'completed'
                ? 'bg-success'
                : status === 'failed'
                ? 'bg-danger'
                : 'bg-gradient-playdub progress-bar-striped progress-bar-animated'
            }`}
            role="progressbar"
            style={{ width: `${progress}%`, transition: 'width 0.6s ease' }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      {/* Step Breakdown Timeline Checklist */}
      <div className="border border-secondary border-opacity-25 rounded-3 p-3 bg-dark bg-opacity-40 mb-3">
        <h6 className="text-uppercase text-secondary fs-7 fw-bold mb-3">
          <i className="bi bi-list-task me-1"></i> Dubbing Step Timeline
        </h6>
        <div className="row g-2">
          {pipelineSteps.map((step) => {
            const isFinished = status === 'completed' || progress >= step.threshold;
            const isCurrent = !isFinished && progress > step.threshold - 16;
            return (
              <div key={step.key} className="col-12 col-md-6">
                <div className={`d-flex align-items-center gap-2 p-2 rounded-2 ${isCurrent ? 'bg-primary bg-opacity-10 border border-primary border-opacity-25' : ''}`}>
                  {getStepIcon(step.threshold)}
                  <span className={`small ${isFinished ? 'text-light fw-medium' : isCurrent ? 'text-info fw-bold' : 'text-secondary'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Failure Alert Box */}
      {status === 'failed' && (
        <div className="alert alert-danger bg-danger bg-opacity-10 border border-danger border-opacity-25 text-light rounded-3 p-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <div className="fw-semibold text-danger mb-1">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> Dubbing encountered an issue
            </div>
            <div className="small text-secondary">
              {job?.error_message || 'The AI processing worker encountered a temporary error. Please retry.'}
            </div>
          </div>
          <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleRetry} disabled={retrying}>
            {retrying ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span> Retrying...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-counterclockwise me-1"></i> Retry Dubbing
              </>
            )}
          </button>
        </div>
      )}

      {/* Completion View */}
      {status === 'completed' && (
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top border-secondary border-opacity-25">
          <div className="text-success small fw-medium">
            <i className="bi bi-film me-1"></i> Dubbed video is ready for playback!
          </div>
          <button
            className="btn btn-playdub btn-sm rounded-pill px-4 shadow"
            onClick={() => onWatch(video, dubbedVideo)}
          >
            <i className="bi bi-play-fill me-1 fs-5 align-middle"></i> Watch Dubbed Video
          </button>
        </div>
      )}
    </div>
  );
};
