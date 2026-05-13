"""
HerBalance – Women's Hormonal Health Backend
Flask + SQLite  |  Run: python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sqlite3
import hashlib
import uuid
import json
import re
from datetime import datetime, timedelta
from functools import wraps
import jwt
import bcrypt
import requests as req

SECRET_KEY = "this_is_a_super_long_secret_key_123456789"
app = Flask(__name__)
CORS(app)

DB_NAME = "/tmp/herbalance.db"

# ─────────────────────────────── DATABASE ────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        age INTEGER,
        conditions TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS symptoms (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        date TEXT,
        symptom TEXT,
        intensity INTEGER,
        notes TEXT,
        body_location TEXT,
        time_of_day TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS cycles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        last_period_date TEXT,
        cycle_length INTEGER DEFAULT 28,
        period_duration INTEGER DEFAULT 5,
        flow TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS lab_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        test_date TEXT,
        hemoglobin REAL,
        tsh REAL,
        t3 REAL,
        t4 REAL,
        ferritin REAL,
        vitamin_d REAL,
        testosterone REAL,
        lh REAL,
        fsh REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

init_db()

# ─────────────────────────────── AUTH HELPERS ─────────────────────────────────

def hash_password(pw):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def check_password(pw, hashed):
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth:
            return jsonify({"error": "Authorization header missing"}), 401
        token = auth.replace("Bearer ", "").strip()
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
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
        with get_db() as conn:
            conn.execute(
                "INSERT INTO users (id, name, email, password, age, conditions) VALUES (?,?,?,?,?,?)",
                (uid, name, email, hash_password(pw), age, cond)
            )
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already registered"}), 409

    token = generate_token(uid)
    user  = {"id": uid, "name": name, "email": email, "age": age, "conditions": cond}
    return jsonify({"token": token, "user": user}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data  = request.json or {}
    email = data.get("email", "").strip().lower()
    pw    = data.get("password", "")

    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email=?", (email,)
        ).fetchone()

    if not row or not check_password(pw, row["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(row["id"])
    user  = {"id": row["id"], "name": row["name"], "email": row["email"],
             "age": row["age"], "conditions": row["conditions"]}
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
        email = user_info.get("email")
        name  = user_info.get("name", "User")
        if not email:
            return jsonify({"error": "Email not found"}), 401
    except Exception as e:
        print("Google error:", e)
        return jsonify({"error": "Google verification failed"}), 401

    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if row:
            user_id = row["id"]
        else:
            user_id = str(uuid.uuid4())
            conn.execute(
                "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
                (user_id, name, email, "google_auth")
            )

    token = generate_token(user_id)
    return jsonify({"token": token, "user": {"id": user_id, "name": name, "email": email}})

# ─────────────────────────────── DASHBOARD ────────────────────────────────────

@app.route("/api/dashboard", methods=["GET"])
@require_auth
def dashboard(user_id):
    with get_db() as conn:
        sym_count  = conn.execute("SELECT COUNT(*) FROM symptoms WHERE user_id=?", (user_id,)).fetchone()[0]
        report_cnt = conn.execute("SELECT COUNT(*) FROM lab_reports WHERE user_id=?", (user_id,)).fetchone()[0]
        cycles     = conn.execute(
            "SELECT cycle_length FROM cycles WHERE user_id=? ORDER BY created_at DESC LIMIT 5", (user_id,)
        ).fetchall()
        avg_cycle  = int(sum(c["cycle_length"] for c in cycles) / len(cycles)) if cycles else 28
        recent_sym = conn.execute(
            "SELECT date, symptom, intensity FROM symptoms WHERE user_id=? ORDER BY date DESC LIMIT 5",
            (user_id,)
        ).fetchall()
        last_report = conn.execute(
            "SELECT * FROM lab_reports WHERE user_id=? ORDER BY test_date DESC LIMIT 1", (user_id,)
        ).fetchone()

    flags = _compute_flags(dict(last_report) if last_report else {}, [dict(c) for c in cycles])

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
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM symptoms WHERE user_id=? ORDER BY date DESC LIMIT 30",
                (user_id,)
            ).fetchall()
        return jsonify({"symptoms": [dict(r) for r in rows]})

    data          = request.json or {}
    date          = data.get("date", datetime.today().date().isoformat())
    symptom       = data.get("symptoms", "")
    intensity     = int(data.get("intensity") or 3)
    notes         = data.get("notes", "")
    body_location = data.get("body_location")
    time_of_day   = data.get("time_of_day")

    if not symptom:
        return jsonify({"error": "Symptoms are required"}), 400

    sid = str(uuid.uuid4())
    with get_db() as conn:
        conn.execute(
            """INSERT INTO symptoms
               (id, user_id, date, symptom, intensity, notes, body_location, time_of_day)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (sid, user_id, date, symptom, intensity, notes, body_location, time_of_day)
        )
    return jsonify({"message": "Symptoms logged"}), 201

# ─────────────────────────────── CYCLE ────────────────────────────────────────

@app.route("/api/cycle", methods=["GET", "POST"])
@require_auth
def cycle(user_id):
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM cycles WHERE user_id=? ORDER BY last_period_date DESC LIMIT 12",
                (user_id,)
            ).fetchall()
        return jsonify({"cycles": [dict(r) for r in rows]})

    data  = request.json or {}
    lpd   = data.get("last_period_date")
    cl    = int(data.get("cycle_length", 28))
    pd    = int(data.get("period_duration", 5))
    flow  = data.get("flow", "moderate")
    notes = data.get("notes", "")

    if not lpd:
        return jsonify({"error": "Last period date is required"}), 400

    with get_db() as conn:
        conn.execute(
            "INSERT INTO cycles (user_id, last_period_date, cycle_length, period_duration, flow, notes) VALUES (?,?,?,?,?,?)",
            (user_id, lpd, cl, pd, flow, notes)
        )
    return jsonify({"message": "Cycle logged"}), 201

# ─────────────────────────────── LAB REPORTS ──────────────────────────────────

LAB_FIELDS = ["hemoglobin", "tsh", "t3", "t4", "ferritin", "vitamin_d", "testosterone", "lh", "fsh"]

@app.route("/api/reports", methods=["GET", "POST"])
@require_auth
def reports(user_id):
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM lab_reports WHERE user_id=? ORDER BY test_date DESC LIMIT 10",
                (user_id,)
            ).fetchall()
        return jsonify({"reports": [dict(r) for r in rows]})

    data     = request.json or {}
    td       = data.get("test_date", datetime.today().date().isoformat())
    vals     = {f: data.get(f) for f in LAB_FIELDS}
    present  = [f for f in LAB_FIELDS if vals[f] is not None]
    cols     = ", ".join(["user_id", "test_date"] + present)
    phold    = ", ".join(["?"] * (2 + len(present)))
    row_vals = [user_id, td] + [vals[f] for f in present]

    with get_db() as conn:
        conn.execute(f"INSERT INTO lab_reports ({cols}) VALUES ({phold})", row_vals)
    return jsonify({"message": "Report saved"}), 201

# ─────────────────────────────── HEALTH FLAGS ─────────────────────────────────

def _compute_flags(report: dict, cycles: list) -> list:
    flags = []

    hb  = report.get("hemoglobin")
    fer = report.get("ferritin")
    if hb and float(hb) < 12:
        flags.append({
            "level":     "warning",
            "condition": "Possible Anemia",
            "reason":    f"Hemoglobin ({hb} g/dL) is below the normal range of 12–16 g/dL." + (f" Ferritin also low ({fer} ng/mL)." if fer and float(fer) < 12 else ""),
            "action":    "Consult your doctor. Increase iron-rich foods (spinach, lentils). Consider iron supplements if advised.",
        })

    tsh = report.get("tsh")
    if tsh:
        tsh_val = float(tsh)
        if tsh_val > 4.0:
            flags.append({
                "level":     "warning",
                "condition": "Possible Hypothyroidism",
                "reason":    f"TSH ({tsh} mIU/L) is above normal range (0.4–4.0).",
                "action":    "Schedule a consultation with an endocrinologist.",
            })
        elif tsh_val < 0.4:
            flags.append({
                "level":     "warning",
                "condition": "Possible Hyperthyroidism",
                "reason":    f"TSH ({tsh} mIU/L) is below normal range (0.4–4.0).",
                "action":    "Consult an endocrinologist. Monitor heart rate and weight.",
            })

    vit_d = report.get("vitamin_d")
    if vit_d and float(vit_d) < 30:
        flags.append({
            "level":     "info",
            "condition": "Vitamin D Deficiency",
            "reason":    f"Vitamin D ({vit_d} ng/mL) is below optimal range (30–100).",
            "action":    "Increase sun exposure. Consider Vitamin D3 supplementation.",
        })

    testo  = report.get("testosterone")
    lh_val = report.get("lh")
    if testo and float(testo) > 70 and lh_val and float(lh_val) > 10:
        flags.append({
            "level":     "warning",
            "condition": "Possible PCOS Indicator",
            "reason":    f"Elevated Testosterone ({testo} ng/dL) with high LH ({lh_val} mIU/mL).",
            "action":    "Consult a gynecologist. Ultrasound and further hormonal panels recommended.",
        })

    if len(cycles) >= 3:
        lengths = [c["cycle_length"] for c in cycles]
        spread  = max(lengths) - min(lengths)
        if spread > 7:
            flags.append({
                "level":     "info",
                "condition": "Irregular Cycle Pattern",
                "reason":    f"Your cycle lengths vary by {spread} days over the last {len(cycles)} cycles.",
                "action":    "Log consistently and share data with your gynecologist.",
            })

    return flags


@app.route("/api/health-flags", methods=["GET"])
@require_auth
def health_flags(user_id):
    with get_db() as conn:
        last_report = conn.execute(
            "SELECT * FROM lab_reports WHERE user_id=? ORDER BY test_date DESC LIMIT 1", (user_id,)
        ).fetchone()
        cycles = conn.execute(
            "SELECT cycle_length FROM cycles WHERE user_id=? ORDER BY created_at DESC LIMIT 6", (user_id,)
        ).fetchall()

    flags = _compute_flags(dict(last_report) if last_report else {}, [dict(c) for c in cycles])
    return jsonify({"flags": flags})

# ─────────────────────────────── MAIN ─────────────────────────────────────────

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))