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

Set `VITE_API_BASE_URL` if the API is not running on `http://localhost:8000`.

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

The frontend is a React app that calls the backend API on `http://localhost:8000`.

## Notes

- The app falls back to a demo detection path if custom YOLO weights are not present.
- The admin complaints list requires a Bearer token from `/auth/login`.
