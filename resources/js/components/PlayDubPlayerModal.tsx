import React, { useState, useRef, useEffect } from 'react';
import { DubbedVideo, Video, Language } from '../types';

interface PlayDubPlayerModalProps {
  video: Video;
  activeDubbedVideo: DubbedVideo;
  languages: Language[];
  onClose: () => void;
}

export const PlayDubPlayerModal: React.FC<PlayDubPlayerModalProps> = ({
  video,
  activeDubbedVideo,
  languages,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [selectedDubId, setSelectedDubId] = useState<number>(activeDubbedVideo.id);

  // Derive video source URL
  const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const videoSrcUrl = video.original_file_path
    ? `/storage/${video.original_file_path}`
    : video.source_url && video.source_url.match(/\.(mp4|webm|ogg)$/i)
    ? video.source_url
    : sampleVideoUrl;

  const currentDub = video.dubbed_videos?.find((d) => d.id === selectedDubId) || activeDubbedVideo;
  const currentTargetLang = languages.find((l) => l.code === currentDub.target_language);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleTimeUpdate = () => setCurrentTime(v.currentTime);
    const handleLoadedMetadata = () => setDuration(v.duration);
    const handleEnded = () => setIsPlaying(false);

    v.addEventListener('timeupdate', handleTimeUpdate);
    v.addEventListener('loadedmetadata', handleLoadedMetadata);
    v.addEventListener('ended', handleEnded);

    return () => {
      v.removeEventListener('timeupdate', handleTimeUpdate);
      v.removeEventListener('loadedmetadata', handleLoadedMetadata);
      v.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      v.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '0:00';
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)' }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content glass-card border-secondary text-light overflow-hidden shadow-lg">
          {/* Header */}
          <div className="modal-header border-secondary border-opacity-25 px-4 py-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-gradient-playdub p-2 rounded-3 text-white">
                <i className="bi bi-play-circle-fill fs-5"></i>
              </span>
              <div>
                <h5 className="modal-title brand-font fw-bold text-white mb-0">{video.title}</h5>
                <span className="text-secondary small">
                  Playing in <span className="text-gradient fw-bold">{currentTargetLang?.name || currentDub.target_language}</span> Dubbed Audio
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          {/* Video Player Container */}
          <div className="modal-body p-0 position-relative bg-black">
            <video
              ref={videoRef}
              src={videoSrcUrl}
              className="w-100 d-block"
              style={{ maxHeight: '420px', objectFit: 'contain' }}
              onClick={togglePlay}
            />

            {/* Subtitles Overlay */}
            {showSubtitles && (
              <div
                className="position-absolute bottom-0 start-50 translate-middle-x mb-4 px-3 py-1 rounded bg-black bg-opacity-75 text-warning fw-medium text-center small"
                style={{ maxWidth: '85%', pointerEvents: 'none' }}
              >
                [ {currentTargetLang?.name || 'Dubbed'} Subtitles Active ] — Audio synced seamlessly with PlayDub AI.
              </div>
            )}
          </div>

          {/* Player Custom Controls */}
          <div className="p-3 bg-dark bg-opacity-90 border-top border-secondary border-opacity-25">
            {/* Seek Bar */}
            <div className="d-flex align-items-center gap-3 mb-2">
              <span className="small text-secondary fw-mono" style={{ minWidth: '40px' }}>
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                className="form-range flex-grow-1"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
              />
              <span className="small text-secondary fw-mono" style={{ minWidth: '40px' }}>
                {formatTime(duration)}
              </span>
            </div>

            {/* Control Bar Actions */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              {/* Play / Pause & Volume */}
              <div className="d-flex align-items-center gap-3">
                <button
                  className="btn btn-gradient-playdub p-2 rounded-circle text-white border-0 shadow-sm"
                  onClick={togglePlay}
                  style={{ width: '42px', height: '42px' }}
                >
                  <i className={`bi bi-${isPlaying ? 'pause-fill' : 'play-fill'} fs-4`}></i>
                </button>

                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-link text-light p-0 border-0" onClick={toggleMute}>
                    <i className={`bi bi-volume-${isMuted || volume === 0 ? 'mute' : 'up'}-fill fs-5`}></i>
                  </button>
                  <input
                    type="range"
                    className="form-range"
                    style={{ width: '80px' }}
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                  />
                </div>
              </div>

              {/* Audio Language Switcher dropdown */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-semibold">Audio Track:</span>
                <select
                  className="form-select form-select-dark form-select-sm"
                  style={{ width: '160px' }}
                  value={selectedDubId}
                  onChange={(e) => setSelectedDubId(Number(e.target.value))}
                >
                  <option value={-1}>Original — {video.original_language.toUpperCase()}</option>
                  {video.dubbed_videos?.map((dub) => {
                    const lName = languages.find((l) => l.code === dub.target_language)?.name || dub.target_language;
                    return (
                      <option key={dub.id} value={dub.id}>
                        {lName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Subtitle, Speed & Fullscreen */}
              <div className="d-flex align-items-center gap-2">
                <button
                  className={`btn btn-sm ${showSubtitles ? 'btn-outline-info' : 'btn-outline-secondary'} rounded-pill px-3`}
                  onClick={() => setShowSubtitles(!showSubtitles)}
                >
                  <i className="bi bi-subtitles me-1"></i> CC
                </button>

                {/* Speed Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-3"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    {playbackSpeed}x
                  </button>
                  <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                      <li key={s}>
                        <button
                          className={`dropdown-item ${playbackSpeed === s ? 'active' : ''}`}
                          onClick={() => handleSpeedChange(s)}
                        >
                          {s}x
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="btn btn-outline-secondary btn-sm rounded-circle p-2" onClick={toggleFullscreen}>
                  <i className="bi bi-arrows-fullscreen"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
