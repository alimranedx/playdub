import React, { useState, useEffect } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { Language } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('bn');
  const [loadingLangs, setLoadingLangs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await api.get('/languages');
        setLanguages(response.data.languages || []);
      } catch (err) {
        console.error('Failed to load languages:', err);
      } finally {
        setLoadingLangs(false);
      }
    };
    fetchLanguages();
  }, []);

  const handleStartDubbing = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      navigate('/login');
      return;
    }

    if (!videoUrl && !selectedFile) {
      setError('Please provide a video URL or upload a video file to proceed.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('source_type', selectedFile ? 'upload' : 'url');
      if (selectedFile) {
        formData.append('video_file', selectedFile);
      } else {
        formData.append('source_url', videoUrl);
      }
      formData.append('original_language', sourceLang);
      formData.append('target_language', targetLang);

      await api.post('/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Redirect to dashboard to view live job progress
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to create dubbing project:', err);
      setError(err.response?.data?.message || 'Failed to start dubbing project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="row justify-content-center text-center my-4 py-3">
        <div className="col-lg-10 col-xl-8">
          <span className="badge badge-playdub mb-3 px-3 py-2 fs-6 rounded-pill">
            <i className="bi bi-magic me-1"></i> Powered by Generic Multilingual AI Pipeline
          </span>
          <h1 className="display-4 fw-extrabold text-white mb-3 brand-font">
            Translate & Dub Videos in <span className="text-gradient">Any Language</span>
          </h1>
          <p className="lead text-secondary mb-5">
            One video. Many languages. Seamless AI Speech-to-Text, Translation, and Voice Synthesis.
          </p>

          {/* User Experience Input Card */}
          <div className="glass-card p-4 p-md-5 text-start shadow-lg">
            {error && (
              <div className="alert alert-danger border-0 rounded-3 small mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleStartDubbing}>
              {/* URL Input */}
              <div className="mb-4">
                <label className="form-label text-light fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-link-45deg text-gradient fs-5"></i> Paste a Supported Video URL
                </label>
                <input
                  type="url"
                  className="form-control form-control-dark form-control-lg"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1 border-secondary" />
                <span className="px-3 text-secondary text-uppercase fw-bold small">OR</span>
                <hr className="flex-grow-1 border-secondary" />
              </div>

              {/* Upload Dropzone */}
              <div className="mb-4">
                <label className="form-label text-light fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-cloud-arrow-up-fill text-gradient fs-5"></i> Upload Video File
                </label>
                <div
                  className="border border-dashed border-secondary rounded-4 p-4 text-center cursor-pointer bg-dark bg-opacity-50"
                  style={{ borderStyle: 'dashed' }}
                  onClick={() => document.getElementById('fileUploadInput')?.click()}
                >
                  <i className="bi bi-file-earmark-play-fill display-5 text-primary mb-2"></i>
                  <p className="mb-1 text-light fw-medium">
                    {selectedFile ? selectedFile.name : 'Click or Drag & Drop Video File'}
                  </p>
                  <p className="text-secondary small mb-0">MP4, MOV, AVI or MKV up to 500MB</p>
                  <input
                    id="fileUploadInput"
                    type="file"
                    className="d-none"
                    accept="video/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Language Selection Row */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label text-light fw-semibold">Original Language</label>
                  <select
                    className="form-select form-select-dark"
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="auto">✨ Auto Detect</option>
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.code}>
                        {lang.name} ({lang.native_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-light fw-semibold">Translate & Dub To</label>
                  <select
                    className="form-select form-select-dark"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    disabled={loadingLangs || submitting}
                  >
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.code}>
                        {lang.name} ({lang.native_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Button */}
              <div className="d-grid">
                <button type="submit" className="btn btn-playdub btn-lg py-3 fw-bold fs-5" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting Video Project...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cpu-fill me-2"></i> Start Dubbing
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Supported Languages Pills */}
          <div className="mt-5">
            <p className="text-secondary small text-uppercase fw-bold mb-3">Supported Target Languages</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {languages.map((lang) => (
                <span key={lang.code} className="badge bg-secondary bg-opacity-25 text-light border border-secondary px-3 py-2 rounded-pill">
                  {lang.name} &bull; {lang.native_name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
