# PlayDub Local Setup Guide

This guide provides complete, step-by-step instructions for installing and running **PlayDub** on your local machine.

You can run PlayDub using either **Method 1: Docker Compose** (Recommended all-in-one container setup) or **Method 2: Native Local Setup** (Laragon / PHP CLI + Python + Node.js).

---

## 📋 System Prerequisites

Before starting, ensure you have the following installed on your PC:

| Dependency | Minimum Version | Notes |
| :--- | :--- | :--- |
| **PHP** | 8.3+ | With `pdo`, `mbstring`, `curl`, `gd` extensions |
| **Composer** | 2.5+ | PHP Dependency Manager |
| **Node.js** | 18+ or 20+ | With `npm` |
| **Python** | 3.10+ or 3.11+ | For AI processing worker service |
| **FFmpeg** | Latest | Required for audio extraction & video remuxing |
| **Redis** | 7.0+ | Required for job queues & processing state |
| **Docker Desktop** | Latest | *(Optional - required only for Docker method)* |

---

## 🐳 Method 1: Docker Setup (Recommended / Fastest)

With Docker Desktop installed, all services (Laravel API, Nginx, PostgreSQL, Redis, and Python Worker) run inside isolated containers with a single command.

### Step 1: Clone Repository & Create Environment File
Open your terminal / PowerShell:
```bash
git clone https://github.com/alimranedx/playdub.git
cd playdub
cp .env.example .env
```

### Step 2: Build & Start Docker Containers
```bash
docker-compose up -d --build
```
*This starts `playdub_backend`, `playdub_nginx`, `playdub_postgres`, `playdub_redis`, and `playdub_python_worker`.*

### Step 3: Initialize Database & App Key
```bash
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate:fresh --seed
docker-compose exec backend php artisan storage:link
```

### Step 4: Access Application
Open your web browser and go to:
👉 **`http://localhost:8000`**

---

## 💻 Method 2: Native Local Setup (Windows / Laragon / macOS / Linux)

If you prefer running services directly on your PC (e.g. using Laragon or PHP CLI), follow these steps:

### 1️⃣ Backend Setup (Laravel API)

1. **Open terminal inside project directory**:
   ```bash
   cd c:\laragon\www\playdub
   ```

2. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Install PHP dependencies**:
   ```bash
   composer install
   ```

4. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

5. **Run Database Migrations & Language Seeders**:
   ```bash
   php artisan migrate:fresh --seed
   ```

6. **Create Public Storage Link**:
   ```bash
   php artisan storage:link
   ```

---

### 2️⃣ Frontend Setup (React + TypeScript + Vite)

1. **Install Node modules**:
   ```bash
   npm install
   ```

2. **Build frontend production assets**:
   ```bash
   npm run build
   ```
   *(Or keep `npm run dev` running in a terminal for live hot-reloading)*

---

### 3️⃣ Python AI Worker Setup

The Python worker handles Speech-to-Text (Whisper), Translation (Hindi → Bangla), and FFmpeg audio/video remuxing.

1. **Navigate to python_service folder**:
   ```bash
   cd python_service
   ```

2. **Create Python virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install Python requirements**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Test run Python worker service**:
   ```bash
   python app/main.py
   ```

---

### 4️⃣ Installing FFmpeg on Windows (Required for Media Processing)

If `ffmpeg` is not recognized on your command line:

1. **Using Windows Package Manager (Winget)**:
   ```powershell
   winget install Gyan.FFmpeg
   ```
2. **Or Manual Installation**:
   - Download FFmpeg zip from [ffmpeg.org](https://ffmpeg.org/download.html).
   - Extract zip to `C:\ffmpeg`.
   - Add `C:\ffmpeg\bin` to your System Environment Variables `PATH`.
   - Verify by running `ffmpeg -version` in PowerShell.

---

## 🚀 Running All Services Natively

To run PlayDub natively, open **4 terminal windows** (or use `composer run dev`):

### Terminal 1: Laravel Web Server
```bash
php artisan serve
```

### Terminal 2: Laravel Queue Worker (Processes Dubbing Jobs)
```bash
php artisan queue:work
```

### Terminal 3: Vite Dev Server (React Hot Reloading)
```bash
npm run dev
```

### Terminal 4: Python AI Worker
```bash
cd python_service
.\venv\Scripts\activate   # Windows
python app/main.py
```

### Or Use All-In-One Dev Command:
```bash
composer run dev
```

---

## 🧪 Testing Everything Works

1. **Run Automated Test Suite**:
   ```bash
   php artisan test
   ```
   *Should report: `8 passed (54 assertions)`*

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
**Fix**: Ensure FFmpeg is installed and `ffmpeg.exe` is in your Windows `PATH`.

### Q: Database Error: `Unknown database 'playdub'`
**Fix**: Ensure `DB_CONNECTION=sqlite` and `database/database.sqlite` exists, or create PostgreSQL DB named `playdub`.

### Q: `Vite manifest not found`
**Fix**: Run `npm run build` once to generate production asset manifest in `public/build/manifest.json`.
