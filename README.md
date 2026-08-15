# PlayDub — AI Multilingual Video Dubbing Platform

PlayDub is an AI-powered multilingual video dubbing platform built to seamlessly translate, transcribe, and synthesize voice tracks for videos across multiple target languages.

> **One video. Many languages. One player.**

---

## 🚀 Key Features & Vision

- **Generic Multilingual Pipeline**: Designed around a generic `source_language` and `target_language` architecture (e.g. English → Bangla, Hindi → Bangla, Tamil → Bangla, English → Hindi, etc.).
- **URL & Video Upload Ingestion**: Paste video links or upload raw video files.
- **Asynchronous Queue Processing**: Long-running video and AI processing operations run asynchronously via Redis queues and dedicated Python workers.
- **Modern Bootstrap 5 UI**: Built with React 19, TypeScript, Vite, and Bootstrap 5 featuring a dark glassmorphic UI design system.
- **Decoupled Python Worker**: Separate Python worker service for FFmpeg audio/video processing, Whisper speech-to-text, translation, and TTS voice synthesis.
- **Sanctum Authentication**: Token-based REST API authentication and user state management.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **UI Framework**: Bootstrap 5 + Bootstrap Icons + Custom CSS Design System
- **HTTP Client**: Axios with Bearer token interceptors
- **Routing**: React Router v7

### Backend API
- **Framework**: Laravel 13 (PHP 8.3+)
- **Authentication**: Laravel Sanctum
- **Queue System**: Laravel Queue + Redis
- **Database**: PostgreSQL / SQLite

### AI Processing Worker
- **Language**: Python 3.11
- **Media Engine**: FFmpeg (Audio extraction, segmentation, remuxing)
- **AI Abstractions**: Decoupled provider interfaces for STT (Whisper), Translation (Google/DeepL), and TTS (Voice Synthesis).

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx

---

## 📐 System Architecture

```text
                                +-----------------------------------+
                                |          React Frontend           |
                                | (TypeScript + Vite + Bootstrap 5) |
                                +-----------------+-----------------+
                                                  |
                                                  | REST API / JSON
                                                  v
                                +-----------------+-----------------+
                                |          Laravel API              |
                                |     (Auth, Projects, DB)          |
                                +--------+----------------+---------+
                                         |                |
                       PostgreSQL DB     |                | Redis Queue
                   (Users, Videos, Dubs) |                | (Jobs)
                                         v                v
                                +--------+---+   +--------+---------+
                                | PostgreSQL |   |      Redis       |
                                +------------+   +--------+---------+
                                                          |
                                                          | Processing Job Payload
                                                          v
                                                 +--------+---------+
                                                 |  Python Worker   |
                                                 | (FFmpeg, Whisper,|
                                                 |  Translation,TTS)|
                                                 +------------------+
```

---

## 🗄️ Database Relational Design

The database includes the following relational entities:

- **`users`**: User account credentials and profile metadata.
- **`languages`**: Generic language lookup table (`code`, `name`, `native_name`, `is_active`).
- **`videos`**: Uploaded / ingested original video records (`source_type`, `source_url`, `original_language`, `duration`, `status`).
- **`speakers`**: Speaker diarization records for multi-speaker dubbing.
- **`dubbed_videos`**: Dubbed version instances tied to original videos (`source_language`, `target_language`, `audio_path`, `video_path`).
- **`transcripts`**: Timestamped source language speech segments (`start_time`, `end_time`, `text`, `sequence`).
- **`translated_segments`**: Target language text segments and synthesized audio paths.
- **`processing_jobs`**: Job tracking state machine with step-by-step progress monitors.

---

## 📡 API Endpoints (V1)

### Public Endpoints
- `POST /api/v1/register`: Create a new user account.
- `POST /api/v1/login`: Authenticate and receive a Sanctum API token.
- `GET /api/v1/languages`: Fetch active supported languages list.

### Protected Endpoints (Requires `Bearer Token`)
- `GET /api/v1/user`: Get current authenticated user profile.
- `POST /api/v1/logout`: Revoke API token.

---

## 💻 Local Setup & Installation

### Option A: Docker Compose (Recommended)

1. **Clone repository**:
   ```bash
   git clone https://github.com/alimranedx/playdub.git
   cd playdub
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Build & launch containers**:
   ```bash
   docker-compose up -d --build
   ```

4. **Run migrations & seeders**:
   ```bash
   docker-compose exec backend php artisan key:generate
   docker-compose exec backend php artisan migrate:fresh --seed
   ```

5. **Access application**:
   - Frontend & API: `http://localhost:8000`

---

### Option B: Local Native Setup

1. **Install PHP dependencies**:
   ```bash
   composer install
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment & database**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   php artisan migrate:fresh --seed
   ```

4. **Compile frontend assets**:
   ```bash
   npm run build
   ```

5. **Start server**:
   ```bash
   php artisan serve
   ```

---

## 🧪 Testing

Run PHPUnit feature and unit tests:
```bash
php artisan test
```

Build production Vite bundle:
```bash
npm run build
```

---

## 🗺️ Development Roadmap

- [x] **Phase 1**: Project Foundation (Laravel 13 + React + TypeScript + Vite + Bootstrap 5 + Database Schema + Sanctum Auth)
- [ ] **Phase 2**: Video Management (Upload, Storage, Metadata Extraction, Preview & Deletion)
- [ ] **Phase 3**: Python Worker Infrastructure (FFmpeg Integration, Audio Extraction, Whisper STT)
- [ ] **Phase 4**: Translation Pipeline (English → Bangla & generic translation storage)
- [ ] **Phase 5**: TTS Voice Synthesis & Remuxing
- [ ] **Phase 6**: Dedicated PlayDub Player & Real-time Progress Monitor
- [ ] **Phase 7**: Multilingual Expansion (Hindi, Tamil, Turkish, Spanish, Arabic)
- [ ] **Phase 8**: URL Video Source Acquisition Layer
- [ ] **Phase 9**: Chunk-Based Processing Engine
- [ ] **Phase 10**: HLS Adaptive Streaming Pipeline
- [ ] **Phase 11**: Speaker Diarization & Multi-Speaker Dubbing
- [ ] **Phase 12**: Advanced AI Features (Voice preservation, lip sync, emotion transfer)

---

## 📄 License

PlayDub is open-sourced software licensed under the [MIT License](LICENSE).
