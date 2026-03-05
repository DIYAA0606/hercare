# 🌸 HerBalance – Setup Guide

## What you get
| File | Purpose |
|------|---------|
| `womens_health_app.jsx` | Full React frontend (paste into Claude.ai artifacts OR a Vite/CRA project) |
| `app.py` | Flask backend with SQLite |
| `requirements.txt` | Python dependencies |

---

## ⚙️ Backend Setup (YOU need to do this)

### Step 1 – Install Python dependencies
```bash
pip install flask flask-cors
# OR
pip install -r requirements.txt
```

### Step 2 – Run the server
```bash
python app.py
```
You should see:
```
✅ Database initialised.
🌸 HerBalance backend running on http://localhost:5000
```

### Step 3 – Run the frontend
Option A – **Claude Artifact**: paste `womens_health_app.jsx` into a new artifact.

Option B – **Vite project**:
```bash
npm create vite@latest herbalance -- --template react
cd herbalance
npm install
# Replace src/App.jsx with womens_health_app.jsx contents
npm run dev
```

---

## 🗄️ Database
SQLite file `herbalance.db` is created automatically in the same folder as `app.py`.

Tables created:
- `users` – accounts, age, known conditions
- `symptoms` – logged symptom entries with intensity
- `cycles` – menstrual cycle tracking
- `lab_reports` – blood test values (Hb, TSH, T3, T4, Ferritin, Vitamin D, Testosterone, LH, FSH)

---

## 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup` | Create account |
| POST | `/api/login` | Sign in, get token |
| GET | `/api/dashboard` | Stats + recent data + health flags |
| GET/POST | `/api/symptoms` | List / log symptoms |
| GET/POST | `/api/cycle` | List / log cycle data |
| GET/POST | `/api/reports` | List / add lab reports |
| GET | `/api/health-flags` | Rule-based health analysis |

All protected routes require: `Authorization: Bearer <token>` header.

---

## 🔒 Security Notes (for production)
- Replace in-memory token store with proper JWT (use `PyJWT`)
- Use environment variables for secrets
- Add HTTPS
- Add rate limiting
