# PlayDub — AI Multilingual Video Dubbing Platform

PlayDub is an AI-powered multilingual video dubbing platform built to seamlessly translate, transcribe, and synthesize voice tracks for videos across multiple target languages.

> **One video. Many languages. One player.**

---

## 📖 Local Setup Instructions

For a complete step-by-step local installation guide (Docker & Native PC setup), see [SETUP.md](SETUP.md).

### Quick Start (Native PC / Laragon)

```bash
# 1. Clone & install PHP dependencies
git clone https://github.com/alimranedx/playdub.git
cd playdub
composer install
cp .env.example .env
php artisan key:generate

# 2. Set up database & storage
php artisan migrate:fresh --seed
php artisan storage:link

# 3. Install Node dependencies & build frontend
npm install
npm run build

# 4. Set up Python service (optional virtualenv)
cd python_service
pip install -r requirements.txt
cd ..

# 5. Start all local services concurrently
composer run dev
```

Open your browser at 👉 **`http://localhost:8000`**

---

## 🚀 Key Features & Vision

- **Generic Multilingual Pipeline**: Designed around a generic `source_language` and `target_language` architecture (e.g. Hindi → Bangla, English → Bangla, Tamil → Bangla, English → Hindi, etc.).
- **URL & Video Upload Ingestion**: Paste video links or upload raw video files.
- **Asynchronous Queue Processing**: Long-running video and AI processing operations run asynchronously via Redis queues and dedicated Python workers.
- **Interactive Translation Transcript**: View side-by-side Hindi source text and translated Bangla subtitles synchronized with video playback.
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
                   (Users, Users, Dubs)  |                | (Jobs)
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

## 📄 License

PlayDub is open-sourced software licensed under the [MIT License](LICENSE).
