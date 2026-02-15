# Hyperspace 🚀

AI Scout is a precision agriculture platform that uses AI and drone imagery to help farmers monitor field health. It combines YOLOv8 object detection and NDVI analysis to find diseases and predict yields in real-time.

---

## ✨ Key Features

- **AI Analysis Command Center**: Upload drone imagery for real-time AI processing.
- **Interactive GIS Maps**: Visualize multispectral and health layers via a simulated GIS engine.
- **Disease Detection**: Automated anomaly detection using YOLOv8 models.
- **Health Indicators**: Real-time NDVI (Normalized Difference Vegetation Index) calculations.
- **Multilingual Support**: Fully localized interface in English and Hindi.
- **Team Management**: Role-based access control for farm staff.
- **Fleet Connectivity**: Integrated drone hardware status and management.

---

## ⚡ Quick Start (Recommended)

The easiest way to run everything is using **Docker Compose**.

### Launch the Stack

Run this command in the root folder:

```bash
docker compose up --build
```

---

## 🛠️ Manual Setup

If you prefer to run services manually without Docker:

### 1. Backend

1. Go to `backend/`.
2. Install: `npm install`.
3. Configure `.env` (use `.env.example` as a template).
4. Run: `npm run dev`.

### 2. ML Service

1. Go to `ml_service/`.
2. Setup venv: `python -m venv venv` and activate it.
3. Install: `pip install -r requirements.txt`.
4. Run: `python main.py`.
   _(Note: Use Docker if your Python version is > 3.12 to avoid build issues)_

### 3. Frontend

1. Go to `frontend/`.
2. Install: `npm install`.
3. Run: `npm run dev`.

---

## 🎨 Running Frontend Alone (Standalone)

If you only want the UI with mock data:

1. Go to `frontend/`.
2. Run: `npm run standalone`.

---

## 🚁 Drone Connectivity

To connect a drone:

1. Go to **Settings** > **Integrations** in the dashboard.
2. Click **Connect** on the DJI or Satellite Hub option.
3. Access the **Launch Analysis** command center in the Navbar to begin uploading flight imagery.

---

## 🏗️ Technology Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS.
- **Backend**: Node.js, Express, MongoDB.
- **ML Service**: Python 3.9, FastAPI, YOLOv8.

---

Built for the future of farming 🚜 by Team HackSquad with ❤️.
