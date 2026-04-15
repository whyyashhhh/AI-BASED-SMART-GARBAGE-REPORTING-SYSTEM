# Frontend

Run the React client after the backend is available at `http://localhost:8000`.

Start backend first from workspace root:

```bash
py -m pip install -r backend/requirements.txt
py -m uvicorn app.main:app --reload --app-dir backend
```

```bash
npm install
npm run dev
```

You can override the backend URL with `VITE_API_BASE_URL`.
