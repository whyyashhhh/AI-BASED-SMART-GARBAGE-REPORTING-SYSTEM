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

## Deploy Frontend on Vercel

1. Build locally (optional check):

```bash
npm run build
```

2. Install Vercel CLI:

```bash
npm i -g vercel
```

3. Deploy from `frontend/` folder:

```bash
vercel
```

4. Add your backend API URL in Vercel Project Settings -> Environment Variables:

- Name: `VITE_API_BASE_URL`
- Value: `https://your-backend.onrender.com`

5. Redeploy after setting env vars:

```bash
vercel --prod
```

Note:
The frontend already reads the backend URL from this variable in `src/services/api.js`:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```
