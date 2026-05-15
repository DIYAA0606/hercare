"""
HerBalance – Women's Hormonal Health Backend
Flask + PostgreSQL | Deployed on Render

CHANGES FROM ORIGINAL:
  - Replaced SQLite with PostgreSQL (psycopg2)
  - SECRET_KEY now read from environment variable
  - DATABASE_URL read from environment variable (set by Render automatically)
  - All queries rewritten for psycopg2 cursor style
  - Placeholder syntax changed from ? (SQLite) to %s (PostgreSQL)
  - AUTOINCREMENT changed to SERIAL (PostgreSQL syntax)
  - psycopg2.extras.RealDictCursor used so row["column"] still works everywhere
  - psycopg2.errors.UniqueViolation used instead of sqlite3.IntegrityError
  - Dynamic INSERT for lab_reports rebuilt for psycopg2 placeholder style
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from datetime import datetime, timedelta
from functools import wraps
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
import requests as req
import psycopg2
import psycopg2.extras
import psycopg2.errors

# ─────────────────────────────── CONFIG ──────────────────────────────────────
#
# WHY: SECRET_KEY must NEVER be hardcoded in source code.
#      Anyone who reads your GitHub repo can forge JWT tokens and log in as any user.
#      Set this in Render → your service → Environment → SECRET_KEY
#
# HOW to generate a good secret key (run once in your terminal):
#      python -c "import secrets; print(secrets.token_hex(32))"
#
SECRET_KEY   = os.environ.get("SECRET_KEY", "change-this-in-production")

#
# WHY: DATABASE_URL is automatically injected by Render when you link
#      a PostgreSQL database to your service. You do NOT need to set this manually.
#      It looks like: postgresql://user:password@host:port/dbname
#
DATABASE_URL = os.environ.get("DATABASE_URL")

app = Flask(__name__)
CORS(app)

# ─────────────────────────────── DATABASE ────────────────────────────────────
#
# WHY psycopg2 instead of sqlite3:
#   - SQLite stored a file at /tmp/herbalance.db on Render
#   - Render's /tmp is WIPED on every restart, redeploy, or sleep/wake cycle
#   - PostgreSQL is a real server that persists data permanently
#
# HOW get_db() works:
#   - Opens a new connection to PostgreSQL using DATABASE_URL
#   - Returns that connection
#   - Each route opens a connection, uses it, then closes it
#   - This is safe for Render's free tier (no connection pooling needed yet)
#
def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    return conn


def init_db():
    """
    Creates all tables if they don't exist yet.
    Called once when the app starts.
    Safe to run multiple times — IF NOT EXISTS prevents errors.

    KEY DIFFERENCES from SQLite version:
      - "INTEGER PRIMARY KEY AUTOINCREMENT" → "SERIAL PRIMARY KEY" (PostgreSQL syntax)
      - Placeholder for values is %s in psycopg2, not ? like in SQLite
    """
    conn = psycopg2.connect(DATABASE_URL)
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY,
        name        TEXT,
        email       TEXT UNIQUE,
        password    TEXT,
        age         INTEGER,
        conditions  TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS symptoms (
        id            TEXT PRIMARY KEY,
        user_id       TEXT,
        date          TEXT,
        symptom       TEXT,
        intensity     INTEGER,
        notes         TEXT,
        body_location TEXT,
        time_of_day   TEXT
    )
    """)

    # NOTE: SERIAL = auto-incrementing integer in PostgreSQL (replaces AUTOINCREMENT)
    c.execute("""
    CREATE TABLE IF NOT EXISTS cycles (
        id                 SERIAL PRIMARY KEY,
        user_id            TEXT,
        last_period_date   TEXT,
        cycle_length       INTEGER DEFAULT 28,
        period_duration    INTEGER DEFAULT 5,
        flow               TEXT,
        notes              TEXT,
        created_at         TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS lab_reports (
        id           SERIAL PRIMARY KEY,
        user_id      TEXT,
        test_date    TEXT,
        hemoglobin   REAL,
        tsh          REAL,
        t3           REAL,
        t4           REAL,
        ferritin     REAL,
        vitamin_d    REAL,
        testosterone REAL,
        lh           REAL,
        fsh          REAL,
        created_at   TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()
    print("Database initialised.")


init_db()


# ─────────────────────────────── AUTH HELPERS ─────────────────────────────────

def hash_password(pw):
    return generate_password_hash(pw)

def check_pw(pw, hashed):
    return check_password_hash(hashed, pw)

def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def require_auth(f):
    """
    Decorator that checks the Authorization: Bearer <token> header.
    If valid, calls the route function with user_id as first argument.
    If invalid or missing, returns 401.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth:
            return jsonify({"error": "Authorization header missing"}), 401
        token = auth.replace("Bearer ", "").strip()
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            data    = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data["user_id"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(user_id, *args, **kwargs)
    return decorated


# ─────────────────────────────── AUTH ROUTES ──────────────────────────────────

@app.route("/api/signup", methods=["POST"])
def signup():
    data  = request.json or {}
    name  = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    pw    = data.get("password", "")
    age   = data.get("age")
    cond  = data.get("conditions", "")

    if not name or not email or not pw:
        return jsonify({"error": "Name, email, and password are required"}), 400
    if len(pw) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    uid = str(uuid.uuid4())

    try:
        # HOW: Open connection, get cursor with RealDictCursor so rows behave like dicts
        conn = get_db()
        c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # NOTE: psycopg2 uses %s for ALL placeholders, not ? like SQLite
        c.execute(
            "INSERT INTO users (id, name, email, password, age, conditions) VALUES (%s,%s,%s,%s,%s,%s)",
            (uid, name, email, hash_password(pw), age, cond)
        )
        conn.commit()   # ← IMPORTANT: psycopg2 does NOT auto-commit; you must call this
        conn.close()

    except psycopg2.errors.UniqueViolation:
        # This is the psycopg2 equivalent of sqlite3.IntegrityError for UNIQUE constraint
        return jsonify({"error": "Email already registered"}), 409

    token = generate_token(uid)
    user  = {"id": uid, "name": name, "email": email, "age": age, "conditions": cond}
    return jsonify({"token": token, "user": user}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data  = request.json or {}
    email = data.get("email", "").strip().lower()
    pw    = data.get("password", "")

    conn = get_db()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    c.execute("SELECT * FROM users WHERE email=%s", (email,))
    row = c.fetchone()
    conn.close()

    # row is now a dict (or None), so row["password"] works just like before
    if not row or not check_pw(pw, row["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(row["id"])
    user  = {
        "id":         row["id"],
        "name":       row["name"],
        "email":      row["email"],
        "age":        row["age"],
        "conditions": row["conditions"]
    }
    return jsonify({"token": token, "user": user})


@app.route("/api/google-login", methods=["POST"])
def google_login():
    google_token = request.json.get("token")
    if not google_token:
        return jsonify({"error": "No token provided"}), 401

    try:
        response = req.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_token}"}
        )
        if response.status_code != 200:
            return jsonify({"error": "Invalid Google token"}), 401
        user_info = response.json()
        email     = user_info.get("email")
        name      = user_info.get("name", "User")
        if not email:
            return jsonify({"error": "Email not found"}), 401
    except Exception as e:
        print("Google error:", e)
        return jsonify({"error": "Google verification failed"}), 401

    conn = get_db()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    c.execute("SELECT * FROM users WHERE email=%s", (email,))
    row = c.fetchone()

    if row:
        user_id = row["id"]
    else:
        user_id = str(uuid.uuid4())
        c.execute(
            "INSERT INTO users (id, name, email, password) VALUES (%s, %s, %s, %s)",
            (user_id, name, email, "google_auth")
        )

    conn.commit()
    conn.close()

    token = generate_token(user_id)
    return jsonify({"token": token, "user": {"id": user_id, "name": name, "email": email}})


# ─────────────────────────────── DASHBOARD ────────────────────────────────────

@app.route("/api/dashboard", methods=["GET"])
@require_auth
def dashboard(user_id):
    conn = get_db()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # COUNT queries return a single tuple, not a dict, so we use a plain cursor for those
    # Actually RealDictCursor returns {"count": N} for COUNT(*), so we access by key
    c.execute("SELECT COUNT(*) AS cnt FROM symptoms WHERE user_id=%s",   (user_id,))
    sym_count  = c.fetchone()["cnt"]

    c.execute("SELECT COUNT(*) AS cnt FROM lab_reports WHERE user_id=%s", (user_id,))
    report_cnt = c.fetchone()["cnt"]

    c.execute(
        "SELECT cycle_length FROM cycles WHERE user_id=%s ORDER BY created_at DESC LIMIT 5",
        (user_id,)
    )
    cycles    = c.fetchall()   # list of dicts: [{"cycle_length": 28}, ...]
    avg_cycle = int(sum(row["cycle_length"] for row in cycles) / len(cycles)) if cycles else 28

    c.execute(
        "SELECT date, symptom, intensity FROM symptoms WHERE user_id=%s ORDER BY date DESC LIMIT 5",
        (user_id,)
    )
    recent_sym = c.fetchall()

    c.execute(
        "SELECT * FROM lab_reports WHERE user_id=%s ORDER BY test_date DESC LIMIT 1",
        (user_id,)
    )
    last_report = c.fetchone()

    conn.close()

    flags = _compute_flags(
        dict(last_report) if last_report else {},
        [dict(r) for r in cycles]
    )

    return jsonify({
        "stats": {
            "symptoms_logged": sym_count,
            "cycle_days":      avg_cycle,
            "reports":         report_cnt,
            "flags":           len(flags),
        },
        "recent_symptoms": [dict(r) for r in recent_sym],
        "flags": flags[:3],
    })


# ─────────────────────────────── SYMPTOMS ─────────────────────────────────────

@app.route("/api/symptoms", methods=["GET", "POST"])
@require_auth
def symptoms(user_id):

    if request.method == "GET":
        conn = get_db()
        c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        c.execute(
            "SELECT * FROM symptoms WHERE user_id=%s ORDER BY date DESC LIMIT 30",
            (user_id,)
        )
        rows = c.fetchall()
        conn.close()
        return jsonify({"symptoms": [dict(r) for r in rows]})

    # POST
    data          = request.json or {}
    date          = data.get("date", datetime.today().date().isoformat())
    symptom       = data.get("symptoms", "")
    intensity     = int(data.get("intensity") or 3)
    notes         = data.get("notes", "")
    body_location = data.get("body_location")
    time_of_day   = data.get("time_of_day")

    if not symptom:
        return jsonify({"error": "Symptoms are required"}), 400

    sid  = str(uuid.uuid4())
    conn = get_db()
    c    = conn.cursor()
    c.execute(
        """INSERT INTO symptoms
           (id, user_id, date, symptom, intensity, notes, body_location, time_of_day)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (sid, user_id, date, symptom, intensity, notes, body_location, time_of_day)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Symptoms logged"}), 201


# ─────────────────────────────── CYCLE ────────────────────────────────────────

@app.route("/api/cycle", methods=["GET", "POST"])
@require_auth
def cycle(user_id):

    if request.method == "GET":
        conn = get_db()
        c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        c.execute(
            "SELECT * FROM cycles WHERE user_id=%s ORDER BY last_period_date DESC LIMIT 12",
            (user_id,)
        )
        rows = c.fetchall()
        conn.close()
        return jsonify({"cycles": [dict(r) for r in rows]})

    # POST
    data  = request.json or {}
    lpd   = data.get("last_period_date")
    cl    = int(data.get("cycle_length", 28))
    pd    = int(data.get("period_duration", 5))
    flow  = data.get("flow", "moderate")
    notes = data.get("notes", "")

    if not lpd:
        return jsonify({"error": "Last period date is required"}), 400

    conn = get_db()
    c    = conn.cursor()
    c.execute(
        "INSERT INTO cycles (user_id, last_period_date, cycle_length, period_duration, flow, notes) VALUES (%s,%s,%s,%s,%s,%s)",
        (user_id, lpd, cl, pd, flow, notes)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Cycle logged"}), 201


# ─────────────────────────────── LAB REPORTS ──────────────────────────────────

LAB_FIELDS = ["hemoglobin", "tsh", "t3", "t4", "ferritin", "vitamin_d", "testosterone", "lh", "fsh"]

@app.route("/api/reports", methods=["GET", "POST"])
@require_auth
def reports(user_id):

    if request.method == "GET":
        conn = get_db()
        c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        c.execute(
            "SELECT * FROM lab_reports WHERE user_id=%s ORDER BY test_date DESC LIMIT 10",
            (user_id,)
        )
        rows = c.fetchall()
        conn.close()
        return jsonify({"reports": [dict(r) for r in rows]})

    # POST — dynamic INSERT: only include fields the user actually submitted
    data    = request.json or {}
    td      = data.get("test_date", datetime.today().date().isoformat())
    vals    = {f: data.get(f) for f in LAB_FIELDS}
    present = [f for f in LAB_FIELDS if vals[f] is not None]

    cols     = ", ".join(["user_id", "test_date"] + present)
    # NOTE: psycopg2 uses %s not ?, so we build the placeholders differently
    phold    = ", ".join(["%s"] * (2 + len(present)))
    row_vals = [user_id, td] + [vals[f] for f in present]

    conn = get_db()
    c    = conn.cursor()
    c.execute(f"INSERT INTO lab_reports ({cols}) VALUES ({phold})", row_vals)
    conn.commit()
    conn.close()
    return jsonify({"message": "Report saved"}), 201


# ─────────────────────────────── HEALTH FLAGS ─────────────────────────────────

def _compute_flags(report: dict, cycles: list) -> list:
    flags = []

    # ── Hemoglobin ─────────────────────────────────────────────
    hb  = report.get("hemoglobin")
    fer = report.get("ferritin")

    if hb is not None:
        try:
            hb_val = float(hb)

            if hb_val < 12:
                ferritin_note = ""

                if fer is not None:
                    try:
                        if float(fer) < 12:
                            ferritin_note = f" Ferritin also low ({fer} ng/mL)."
                    except:
                        pass

                flags.append({
                    "level": "warning",
                    "condition": "Possible Anemia",
                    "reason": f"Hemoglobin ({hb_val} g/dL) is below normal range.{ferritin_note}",
                    "action": "Increase iron-rich foods and consult a doctor."
                })

        except:
            pass

    # ── Thyroid ────────────────────────────────────────────────
    tsh = report.get("tsh")

    if tsh is not None:
        try:
            tsh_val = float(tsh)

            if tsh_val > 4:
                flags.append({
                    "level": "warning",
                    "condition": "Possible Thyroid Imbalance",
                    "reason": f"TSH ({tsh_val}) is above normal range.",
                    "action": "Consult an endocrinologist."
                })

            elif tsh_val < 0.4:
                flags.append({
                    "level": "warning",
                    "condition": "Possible Hyperthyroidism",
                    "reason": f"TSH ({tsh_val}) is below normal range.",
                    "action": "Consult an endocrinologist."
                })

        except:
            pass

    # ── Vitamin D ──────────────────────────────────────────────
    vit_d = report.get("vitamin_d")

    if vit_d is not None:
        try:
            vit_d_val = float(vit_d)

            if vit_d_val < 30:
                flags.append({
                    "level": "info",
                    "condition": "Low Vitamin D",
                    "reason": f"Vitamin D ({vit_d_val} ng/mL) is below optimal range.",
                    "action": "Increase sunlight exposure and consider supplements."
                })

        except:
            pass

    # ── PCOS Pattern ───────────────────────────────────────────
    testosterone = report.get("testosterone")
    lh = report.get("lh")

    if testosterone is not None and lh is not None:
        try:
            if float(testosterone) > 70 and float(lh) > 10:
                flags.append({
                    "level": "warning",
                    "condition": "Possible PCOS Pattern",
                    "reason": f"High testosterone ({testosterone}) and LH ({lh}) detected.",
                    "action": "Consult a gynecologist for further evaluation."
                })

        except:
            pass

    # ── Cycle Analysis ─────────────────────────────────────────
    if len(cycles) >= 3:
        try:
            lengths = [
                float(c["cycle_length"])
                for c in cycles
                if c.get("cycle_length") is not None
            ]

            if len(lengths) >= 3:

                spread = max(lengths) - min(lengths)
                avg = sum(lengths) / len(lengths)

                if spread > 7:
                    flags.append({
                        "level": "info",
                        "condition": "Irregular Cycle Pattern",
                        "reason": f"Cycle lengths vary by {int(spread)} days.",
                        "action": "Track cycles consistently and consult a gynecologist if needed."
                    })

                if avg < 21:
                    flags.append({
                        "level": "info",
                        "condition": "Short Cycle Pattern",
                        "reason": f"Average cycle length is {round(avg,1)} days.",
                        "action": "Monitor changes and consult a doctor if persistent."
                    })

        except:
            pass

    return flags

@app.route("/api/health-flags", methods=["GET"])
@require_auth
def health_flags(user_id):
    conn = get_db()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    c.execute(
        "SELECT * FROM lab_reports WHERE user_id=%s ORDER BY test_date DESC LIMIT 1",
        (user_id,)
    )
    last_report = c.fetchone()

    c.execute(
        "SELECT cycle_length FROM cycles WHERE user_id=%s ORDER BY created_at DESC LIMIT 6",
        (user_id,)
    )
    cycles = c.fetchall()
    conn.close()

    flags = _compute_flags(
        dict(last_report) if last_report else {},
        [dict(c) for c in cycles]
    )
    return jsonify({"flags": flags})

@app.route("/")
def home():
    return {
        "status": "Backend running successfully"
    }
# ─────────────────────────────── MAIN ─────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))