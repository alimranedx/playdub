import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { Video, DubbedVideo, Language } from '../types';
import api from '../services/api';
import { JobProgressCard } from '../components/JobProgressCard';
import { PlayDubPlayerModal } from '../components/PlayDubPlayerModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTargetLang, setAddingTargetLang] = useState<number | null>(null);
  const [selectedTargetLang, setSelectedTargetLang] = useState('bn');
  const [dubbingSubmitting, setDubbingSubmitting] = useState(false);

  // Active Player state
  const [playerData, setPlayerData] = useState<{ video: Video; dub: DubbedVideo } | null>(null);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [videosRes, langsRes] = await Promise.all([
        api.get('/videos'),
        api.get('/languages'),
      ]);
      setVideos(videosRes.data.videos || []);
      setLanguages(langsRes.data.languages || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Polling interval: Poll every 3 seconds while active jobs exist
  useEffect(() => {
    const hasActiveJobs = videos.some((video) =>
      video.dubbed_videos?.some((dub) => {
        const status = dub.latest_job?.status || dub.status;
        return status !== 'completed' && status !== 'failed' && status !== 'cancelled';
      })
    );

    if (hasActiveJobs) {
      const interval = setInterval(() => {
        fetchDashboardData(true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [videos, fetchDashboardData]);

  const handleAddDub = async (videoId: number) => {
    setDubbingSubmitting(true);
    try {
      await api.post(`/videos/${videoId}/dub`, {
        target_language: selectedTargetLang,
      });
      setAddingTargetLang(null);
      fetchDashboardData(true);
    } catch (err) {
      console.error('Failed to add dubbed language:', err);
    } finally {
      setDubbingSubmitting(false);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!window.confirm('Are you sure you want to delete this video project?')) return;
    try {
      await api.delete(`/videos/${videoId}`);
      fetchDashboardData(true);
    } catch (err) {
      console.error('Failed to delete video project:', err);
    }
  };

  // Metrics calculation
  const totalProjects = videos.length;
  const totalDubs = videos.reduce((acc, v) => acc + (v.dubbed_videos?.length || 0), 0);
  const activeJobs = videos.reduce((acc, v) => {
    const active = v.dubbed_videos?.filter((d) => {
      const s = d.latest_job?.status || d.status;
      return s !== 'completed' && s !== 'failed' && s !== 'cancelled';
    }).length || 0;
    return acc + active;
  }, 0);
  const completedDubs = videos.reduce((acc, v) => {
    const completed = v.dubbed_videos?.filter((d) => (d.latest_job?.status || d.status) === 'completed').length || 0;
    return acc + completed;
  }, 0);

  return (
    <AppLayout>
      {/* Header Row */}
      <div className="mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h1 className="brand-font text-white fw-bold display-6 mb-1">
            Welcome back, <span className="text-gradient">{user?.name}</span>!
          </h1>
          <p className="text-secondary mb-0">Monitor live AI video dubbing projects and translations</p>
        </div>
        <div>
          <Link to="/" className="btn btn-playdub d-inline-flex align-items-center gap-2 shadow">
            <i className="bi bi-plus-circle-fill"></i> New Dubbing Project
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-5">
        <div className="col-sm-6 col-lg-3">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small text-uppercase fw-semibold">Total Projects</span>
              <span className="badge bg-primary bg-opacity-25 text-primary p-2 rounded-circle">
                <i className="bi bi-film fs-5"></i>
              </span>
            </div>
            <h2 className="brand-font text-white fw-bold mb-0">{totalProjects}</h2>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small text-uppercase fw-semibold">Active Jobs</span>
              <span className="badge bg-warning bg-opacity-25 text-warning p-2 rounded-circle">
                <i className="bi bi-cpu fs-5"></i>
              </span>
            </div>
            <h2 className="brand-font text-white fw-bold mb-0 d-flex align-items-center gap-2">
              {activeJobs}
              {activeJobs > 0 && (
                <span className="spinner-border spinner-border-sm text-warning" role="status"></span>
              )}
            </h2>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small text-uppercase fw-semibold">Completed Dubs</span>
              <span className="badge bg-success bg-opacity-25 text-success p-2 rounded-circle">
                <i className="bi bi-check-circle-fill fs-5"></i>
              </span>
            </div>
            <h2 className="brand-font text-white fw-bold mb-0">{completedDubs}</h2>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small text-uppercase fw-semibold">Target Languages</span>
              <span className="badge bg-info bg-opacity-25 text-info p-2 rounded-circle">
                <i className="bi bi-translate fs-5"></i>
              </span>
            </div>
            <h2 className="brand-font text-white fw-bold mb-0">{totalDubs}</h2>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Loading video projects..." />
      ) : videos.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-4 p-md-5 text-center">
          <div className="py-4">
            <i className="bi bi-film display-3 text-secondary mb-3 d-block"></i>
            <h4 className="text-white brand-font fw-bold mb-2">No Active Video Projects</h4>
            <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '480px' }}>
              Paste a video URL or upload a video file on the home page to launch your first AI multilingual dubbing pipeline.
            </p>
            <Link to="/" className="btn btn-playdub px-4 py-2">
              <i className="bi bi-rocket-takeoff me-2"></i> Start Dubbing Project
            </Link>
          </div>
        </div>
      ) : (
        /* Video Projects List */
        <div className="space-y-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="brand-font text-white fw-bold mb-0">Your Video Projects</h4>
            <span className="text-secondary small">
              <i className="bi bi-arrow-repeat me-1 spin-icon"></i> Live Polling Active
            </span>
          </div>

          {videos.map((video) => (
            <div key={video.id} className="mb-4">
              <div className="glass-card p-4">
                {/* Project Header Info */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-gradient-playdub text-white px-2 py-1 rounded-2 small">
                        <i className={`bi bi-${video.source_type === 'url' ? 'link-45deg' : 'file-earmark-play'} me-1`}></i>
                        {video.source_type.toUpperCase()}
                      </span>
                      <span className="text-secondary small">&bull; Created {new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-white brand-font fw-bold mb-0">{video.title}</h4>
                    {video.source_url && (
                      <a href={video.source_url} target="_blank" rel="noreferrer" className="text-gradient small text-decoration-none text-truncate d-inline-block" style={{ maxWidth: '400px' }}>
                        <i className="bi bi-box-arrow-up-right me-1"></i> {video.source_url}
                      </a>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-light btn-sm rounded-pill px-3"
                      onClick={() => setAddingTargetLang(addingTargetLang === video.id ? null : video.id)}
                    >
                      <i className="bi bi-plus-lg me-1"></i> Add Target Language
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm rounded-pill px-3"
                      onClick={() => handleDeleteVideo(video.id)}
                      title="Delete Video Project"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>

                {/* Add New Target Language Inline Form */}
                {addingTargetLang === video.id && (
                  <div className="p-3 mb-4 rounded-3 border border-primary border-opacity-40 bg-dark bg-opacity-75">
                    <h6 className="text-light fw-semibold mb-2">Translate this video to an additional language:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      <select
                        className="form-select form-select-dark form-select-sm"
                        style={{ maxWidth: '280px' }}
                        value={selectedTargetLang}
                        onChange={(e) => setSelectedTargetLang(e.target.value)}
                      >
                        {languages.map((lang) => (
                          <option key={lang.id} value={lang.code}>
                            {lang.name} ({lang.native_name})
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-playdub btn-sm px-3"
                        onClick={() => handleAddDub(video.id)}
                        disabled={dubbingSubmitting}
                      >
                        {dubbingSubmitting ? 'Starting...' : 'Start Translation'}
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm px-3"
                        onClick={() => setAddingTargetLang(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Dubbed Versions & Progress Cards */}
                {video.dubbed_videos && video.dubbed_videos.length > 0 ? (
                  <div className="mt-3">
                    {video.dubbed_videos.map((dub) => (
                      <JobProgressCard
                        key={dub.id}
                        video={video}
                        dubbedVideo={dub}
                        languages={languages}
                        onWatch={(v, d) => setPlayerData({ video: v, dub: d })}
                        onRetrySuccess={() => fetchDashboardData(true)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-secondary small py-2">No target language dubs requested yet.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Video Player Modal */}
      {playerData && (
        <PlayDubPlayerModal
          video={playerData.video}
          activeDubbedVideo={playerData.dub}
          languages={languages}
          onClose={() => setPlayerData(null)}
        />
      )}
    </AppLayout>
  );
};
