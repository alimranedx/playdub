# PlayDub Local Setup Guide

This guide provides complete, step-by-step instructions for installing and running **PlayDub** on your local machine.

---

## ⚡ Option A: 1-Command Docker Setup (Recommended / Single-Command Execution)

With Docker Desktop installed, **one single command** builds, initializes, and starts all containers (Laravel API, PostgreSQL Database, Redis Queue, Nginx Web Server, and Python AI Worker). Database migrations, key generation, and language seeders execute automatically!

### Single Command Launch:
Open terminal in your project folder:
```bash
docker-compose up -d --build
```
*(Or run `composer run docker`)*

That's it! 
- All 5 services start in the background.
- Database tables and initial languages (Bangla, Hindi, English, Tamil, Turkish, Spanish, Arabic) seed automatically.
- Open your web browser at 👉 **`http://localhost:8000`**

### Stop Containers:
```bash
docker-compose down
```

---

## 💻 Option B: Native Local Setup (Laragon / Windows / macOS / Linux)

If you prefer running services natively on your local machine:

### 1️⃣ Setup Environment & Dependencies
```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
```

### 2️⃣ Install Node Dependencies & Build Frontend
```bash
npm install
npm run build
```

### 3️⃣ Setup Python Worker
```bash
cd python_service
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\activate

# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 4️⃣ Start All Local Services Concurrently
Run this single command to start the web server, queue listener, and frontend dev server concurrently:
```bash
composer run dev
```

Open your browser at 👉 **`http://localhost:8000`**

---

## 📋 System Requirements Table

| Dependency | Minimum Version | Notes |
| :--- | :--- | :--- |
| **Docker Desktop** | Latest | Required for Option A (1-Command Docker) |
| **PHP** | 8.3+ | Required for Option B (Native) |
| **Composer** | 2.5+ | Required for Option B |
| **Node.js** | 18+ or 20+ | Required for Option B |
| **Python** | 3.10+ | Required for Option B |
| **FFmpeg** | Latest | Required for Option B |
| **Redis** | 7.0+ | Required for Option B |

---

## 🧪 Verification & Testing

1. **Run Automated Test Suite**:
   ```bash
   php artisan test
   ```
   *Report: `8 passed (54 assertions)`*

2. **Test User Flow in Browser**:
   - Navigate to `http://localhost:8000`.
   - Click **Get Started** and create an account.
   - Select **Translate To: Bangla (বাংলা)**.
   - Paste a YouTube URL or upload a video file.
   - Click **Start Dubbing**.
   - Watch the live progress bar and timeline step breakdown on your Dashboard!
   - Click **Watch Dubbed Video** to play the video and view the Hindi → Bangla interactive transcript drawer!

---

## ❓ Troubleshooting & FAQs

### Q: `Call to undefined function imagecreatefrompng()`
**Fix**: Enable `extension=gd` in your `php.ini` file.

### Q: `FFmpeg command not found`
**Fix**: Install FFmpeg via `winget install Gyan.FFmpeg` or download from [ffmpeg.org](https://ffmpeg.org).

### Q: `Vite manifest not found`
**Fix**: Run `npm run build` once to generate production asset manifest in `public/build/manifest.json`.
