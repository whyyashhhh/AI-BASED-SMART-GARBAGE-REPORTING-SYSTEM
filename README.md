# Smart Garbage Complaint System

Backend-first full-stack demo with FastAPI, YOLOv8-based image analysis, NLP complaint processing, SQLite storage, and a React admin/user dashboard.

## Project Structure

- `backend/` - FastAPI app, AI services, SQLite models
- `frontend/` - React UI
- `models/` - YOLOv8 weights go here
- `database/` - SQLite database files

## Backend

1. Create a virtual environment.
2. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Optional AI extras (YOLOv8 + spaCy):

```bash
pip install -r backend/requirements-ai.txt
```

3. Run the API:

```bash
uvicorn app.main:app --reload --app-dir backend
```

4. Optional spaCy model:

```bash
python -m spacy download en_core_web_sm
```

5. Optional YOLO weights:

- Place a custom-trained `garbage_yolov8.pt` file in `models/`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_BASE_URL` for a separate frontend/backend deployment.
If you do not set it, local dev uses `http://localhost:8000` and production falls back to the current site origin.

## API Endpoints

- `POST /analyze-image` - upload an image and receive detections, severity, and stored complaint data
- `POST /analyze-text` - analyze complaint text for urgency and keywords
- `POST /complaints` - create a text-only complaint record
- `GET /complaints` - list complaints for admins
- `PATCH /complaints/{id}/resolve` - mark a complaint resolved
- `POST /auth/login` - generate an admin token

## Default Admin Login

- Username: `admin`
- Password: `admin123`

Change these before deploying.

## Frontend

The frontend is a React app that calls the backend API through `VITE_API_BASE_URL` when set.

## Notes

- The app falls back to a demo detection path if custom YOLO weights are not present.
- The admin complaints list requires a Bearer token from `/auth/login`.

## Render Backend Deploy

Use repository-root-safe commands on Render:

- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend`

If you see `Exited with status 127`, it usually means the start command was not found in the deploy environment. The `python -m uvicorn ...` command above avoids that issue.
