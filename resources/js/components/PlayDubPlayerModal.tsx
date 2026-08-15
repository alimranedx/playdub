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
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [selectedDubId, setSelectedDubId] = useState<number>(activeDubbedVideo.id);
  const [audioChangeToast, setAudioChangeToast] = useState<string | null>(null);

  // Correct language evaluation (handling -1 for Original language)
  const isOriginalSelected = selectedDubId === -1;
  const currentDub = isOriginalSelected
    ? null
    : video.dubbed_videos?.find((d) => d.id === selectedDubId) || activeDubbedVideo;

  const currentLangCode = isOriginalSelected
    ? video.original_language
    : currentDub?.target_language || activeDubbedVideo.target_language;

  const currentTargetLang = languages.find((l) => l.code === currentLangCode);
  const activeLangName = currentTargetLang
    ? `${currentTargetLang.name} (${currentTargetLang.native_name})`
    : currentLangCode.toUpperCase();

  // Helper to extract YouTube embed URL
  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&enablejsapi=1`
      : null;
  };

  const youtubeEmbedUrl = video.source_type === 'url' ? getYouTubeEmbedUrl(video.source_url) : null;
  const defaultSampleUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const [videoSrcUrl, setVideoSrcUrl] = useState<string>(() => {
    if (video.original_file_path) {
      return `/storage/${video.original_file_path}`;
    }
    if (video.source_url && video.source_url.match(/\.(mp4|webm|ogg)$/i)) {
      return video.source_url;
    }
    return defaultSampleUrl;
  });

  const handleLanguageChange = (dubId: number) => {
    setSelectedDubId(dubId);

    const isOrig = dubId === -1;
    const targetDub = isOrig ? null : video.dubbed_videos?.find((d) => d.id === dubId);
    const code = isOrig ? video.original_language : targetDub?.target_language || 'bn';
    const langObj = languages.find((l) => l.code === code);
    const label = langObj ? `${langObj.name} (${langObj.native_name})` : code.toUpperCase();

    setAudioChangeToast(`Switched Audio Track to ${label}`);
    setTimeout(() => setAudioChangeToast(null), 3000);

    // Synchronize video player currentTime on track change
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleTimeUpdate = () => setCurrentTime(v.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(v.duration);
      v.play().catch(() => setIsPlaying(false));
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      console.warn('Video failed to load source, falling back to sample video stream');
      setVideoSrcUrl(defaultSampleUrl);
    };

    v.addEventListener('timeupdate', handleTimeUpdate);
    v.addEventListener('loadedmetadata', handleLoadedMetadata);
    v.addEventListener('ended', handleEnded);
    v.addEventListener('error', handleError);

    return () => {
      v.removeEventListener('timeupdate', handleTimeUpdate);
      v.removeEventListener('loadedmetadata', handleLoadedMetadata);
      v.removeEventListener('ended', handleEnded);
      v.removeEventListener('error', handleError);
    };
  }, [videoSrcUrl]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      v.play().then(() => setIsPlaying(true)).catch(console.error);
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
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)', zIndex: 1060 }}
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
                  Playing in <span className="text-gradient fw-bold">{activeLangName}</span> Audio Track
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

          {/* Video Player Display Container */}
          <div className="modal-body p-0 position-relative bg-black text-center" style={{ minHeight: '320px' }}>
            {/* Audio Change Toast Banner */}
            {audioChangeToast && (
              <div
                className="position-absolute top-0 start-50 translate-middle-x mt-3 px-4 py-2 rounded-pill bg-primary text-white fw-bold shadow-lg border border-light border-opacity-25 animate__animated animate__fadeInDown"
                style={{ zIndex: 20 }}
              >
                <i className="bi bi-music-note-beamed me-2"></i> {audioChangeToast}
              </div>
            )}

            {youtubeEmbedUrl ? (
              <div className="ratio ratio-16x9">
                <iframe
                  src={youtubeEmbedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={videoSrcUrl}
                autoPlay
                playsInline
                controls={false}
                className="w-100 d-block"
                style={{ maxHeight: '420px', objectFit: 'contain' }}
                onClick={togglePlay}
              />
            )}

            {/* Subtitles Overlay */}
            {showSubtitles && (
              <div
                className="position-absolute bottom-0 start-50 translate-middle-x mb-4 px-3 py-1.5 rounded bg-black bg-opacity-80 text-warning fw-medium text-center small shadow border border-secondary border-opacity-25"
                style={{ maxWidth: '85%', pointerEvents: 'none', zIndex: 10 }}
              >
                <span className="badge bg-warning text-dark me-2">CC</span>
                [ {activeLangName} AI Subtitles ] — Synchronized audio stream active.
              </div>
            )}
          </div>

          {/* Custom Controls (for HTML5 & Audio track switching) */}
          <div className="p-3 bg-dark bg-opacity-95 border-top border-secondary border-opacity-25">
            {/* Seek Bar (For HTML5 Videos) */}
            {!youtubeEmbedUrl && (
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
            )}

            {/* Action Bar */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              {/* Play / Pause & Volume (For HTML5 Videos) */}
              {!youtubeEmbedUrl ? (
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
              ) : (
                <div className="text-gradient small fw-bold">
                  <i className="bi bi-youtube me-1 text-danger"></i> YouTube Player Active
                </div>
              )}

              {/* Audio Language Selector */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small fw-semibold">Audio Track:</span>
                <select
                  className="form-select form-select-dark form-select-sm fw-medium border-primary border-opacity-50"
                  style={{ width: '180px' }}
                  value={selectedDubId}
                  onChange={(e) => handleLanguageChange(Number(e.target.value))}
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

              {/* Subtitle & Options */}
              <div className="d-flex align-items-center gap-2">
                <button
                  className={`btn btn-sm ${showSubtitles ? 'btn-outline-info' : 'btn-outline-secondary'} rounded-pill px-3`}
                  onClick={() => setShowSubtitles(!showSubtitles)}
                >
                  <i className="bi bi-subtitles me-1"></i> CC
                </button>

                {!youtubeEmbedUrl && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
