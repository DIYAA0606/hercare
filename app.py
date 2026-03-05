"""
HerBalance – Women's Hormonal Health Backend
Flask + SQLite  |  Run: python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3, hashlib, uuid, json, os, re
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
CORS(app, origins="*")

DB = "herbalance.db"

# ─────────────────────────────── DATABASE ────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            password    TEXT NOT NULL,
            age         INTEGER,
            conditions  TEXT,
            created_at  TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS symptoms (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     TEXT NOT NULL,
            date        TEXT NOT NULL,
            symptoms    TEXT NOT NULL,
            intensity   INTEGER CHECK(intensity BETWEEN 1 AND 5),
            notes       TEXT,
            created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS cycles (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id             TEXT NOT NULL,
            last_period_date    TEXT NOT NULL,
            cycle_length        INTEGER DEFAULT 28,
            period_duration     INTEGER DEFAULT 5,
            flow                TEXT CHECK(flow IN ('light','moderate','heavy')),
            notes               TEXT,
            created_at          TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS lab_reports (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         TEXT NOT NULL,
            test_date       TEXT NOT NULL,
            hemoglobin      REAL,
            tsh             REAL,
            t3              REAL,
            t4              REAL,
            ferritin        REAL,
            vitamin_d       REAL,
            testosterone    REAL,
            lh              REAL,
            fsh             REAL,
            created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_sym_user ON symptoms(user_id);
        CREATE INDEX IF NOT EXISTS idx_cyc_user ON cycles(user_id);
        CREATE INDEX IF NOT EXISTS idx_lab_user ON lab_reports(user_id);
        """)
    print("✅ Database initialised.")

# ─────────────────────────────── AUTH HELPERS ─────────────────────────────────

TOKENS = {}  # simple in-memory token store (replace with JWT in production)

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def generate_token(user_id):
    token = str(uuid.uuid4())
    TOKENS[token] = user_id
    return token

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        token = auth.replace("Bearer ", "").strip()
        user_id = TOKENS.get(token)
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        return f(user_id, *args, **kwargs)
    return decorated

# ─────────────────────────────── AUTH ROUTES ──────────────────────────────────

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json or {}
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
                "INSERT INTO users (id,name,email,password,age,conditions) VALUES (?,?,?,?,?,?)",
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
            "SELECT * FROM users WHERE email=? AND password=?",
            (email, hash_password(pw))
        ).fetchone()

    if not row:
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(row["id"])
    user  = {"id": row["id"], "name": row["name"], "email": row["email"], "age": row["age"], "conditions": row["conditions"]}
    return jsonify({"token": token, "user": user})

# ─────────────────────────────── DASHBOARD ────────────────────────────────────

@app.route("/api/dashboard", methods=["GET"])
@require_auth
def dashboard(user_id):
    with get_db() as conn:
        sym_count  = conn.execute("SELECT COUNT(*) FROM symptoms WHERE user_id=?", (user_id,)).fetchone()[0]
        report_cnt = conn.execute("SELECT COUNT(*) FROM lab_reports WHERE user_id=?", (user_id,)).fetchone()[0]
        cycles     = conn.execute("SELECT cycle_length FROM cycles WHERE user_id=? ORDER BY created_at DESC LIMIT 5", (user_id,)).fetchall()
        avg_cycle  = int(sum(c["cycle_length"] for c in cycles) / len(cycles)) if cycles else 28
        recent_sym = conn.execute(
            "SELECT date, symptoms, intensity FROM symptoms WHERE user_id=? ORDER BY date DESC LIMIT 5",
            (user_id,)
        ).fetchall()
        last_report = conn.execute(
            "SELECT * FROM lab_reports WHERE user_id=? ORDER BY test_date DESC LIMIT 1", (user_id,)
        ).fetchone()

    flags = _compute_flags(dict(last_report) if last_report else {}, cycles)

    return jsonify({
        "stats": {
            "symptoms_logged": sym_count,
            "cycle_days": avg_cycle,
            "reports": report_cnt,
            "flags": len(flags),
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
                "SELECT * FROM symptoms WHERE user_id=? ORDER BY date DESC LIMIT 30", (user_id,)
            ).fetchall()
        return jsonify({"symptoms": [dict(r) for r in rows]})

    data      = request.json or {}
    date      = data.get("date", datetime.today().date().isoformat())
    sym_text  = data.get("symptoms", "")
    intensity = int(data.get("intensity", 3))
    notes     = data.get("notes", "")

    if not sym_text:
        return jsonify({"error": "Symptoms are required"}), 400

    with get_db() as conn:
        conn.execute(
            "INSERT INTO symptoms (user_id,date,symptoms,intensity,notes) VALUES (?,?,?,?,?)",
            (user_id, date, sym_text, intensity, notes)
        )
    return jsonify({"message": "Symptoms logged"}), 201

# ─────────────────────────────── CYCLE ────────────────────────────────────────

@app.route("/api/cycle", methods=["GET", "POST"])
@require_auth
def cycle(user_id):
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM cycles WHERE user_id=? ORDER BY last_period_date DESC LIMIT 12", (user_id,)
            ).fetchall()
        return jsonify({"cycles": [dict(r) for r in rows]})

    data = request.json or {}
    lpd  = data.get("last_period_date")
    cl   = int(data.get("cycle_length", 28))
    pd   = int(data.get("period_duration", 5))
    flow = data.get("flow", "moderate")
    notes = data.get("notes", "")

    if not lpd:
        return jsonify({"error": "Last period date is required"}), 400

    with get_db() as conn:
        conn.execute(
            "INSERT INTO cycles (user_id,last_period_date,cycle_length,period_duration,flow,notes) VALUES (?,?,?,?,?,?)",
            (user_id, lpd, cl, pd, flow, notes)
        )
    return jsonify({"message": "Cycle logged"}), 201

# ─────────────────────────────── LAB REPORTS ──────────────────────────────────

LAB_FIELDS = ["hemoglobin","tsh","t3","t4","ferritin","vitamin_d","testosterone","lh","fsh"]

@app.route("/api/reports", methods=["GET", "POST"])
@require_auth
def reports(user_id):
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM lab_reports WHERE user_id=? ORDER BY test_date DESC LIMIT 10", (user_id,)
            ).fetchall()
        return jsonify({"reports": [dict(r) for r in rows]})

    data = request.json or {}
    td   = data.get("test_date", datetime.today().date().isoformat())
    vals = {f: data.get(f) for f in LAB_FIELDS}

    cols  = ", ".join(["user_id", "test_date"] + [f for f in LAB_FIELDS if vals[f] is not None])
    phold = ", ".join(["?"] * (2 + sum(1 for f in LAB_FIELDS if vals[f] is not None)))
    row_vals = [user_id, td] + [vals[f] for f in LAB_FIELDS if vals[f] is not None]

    with get_db() as conn:
        conn.execute(f"INSERT INTO lab_reports ({cols}) VALUES ({phold})", row_vals)
    return jsonify({"message": "Report saved"}), 201

# ─────────────────────────────── HEALTH FLAGS ─────────────────────────────────

NORMAL_RANGES = {
    "hemoglobin":   (12.0, 16.0),
    "tsh":          (0.4,  4.0),
    "t3":           (80,   200),
    "t4":           (5.0,  12.0),
    "ferritin":     (12,   150),
    "vitamin_d":    (30,   100),
    "testosterone": (15,   70),
    "lh":           (2,    15),
    "fsh":          (3,    20),
}

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
                "reason":    f"TSH ({tsh} mIU/L) is above normal range (0.4–4.0). This may indicate an underactive thyroid.",
                "action":    "Schedule a consultation with an endocrinologist. Additional thyroid tests (T3, T4) may be needed.",
            })
        elif tsh_val < 0.4:
            flags.append({
                "level":     "warning",
                "condition": "Possible Hyperthyroidism",
                "reason":    f"TSH ({tsh} mIU/L) is below normal range (0.4–4.0). This may indicate an overactive thyroid.",
                "action":    "Consult an endocrinologist. Avoid excess iodine. Monitor heart rate and weight.",
            })

    vit_d = report.get("vitamin_d")
    if vit_d and float(vit_d) < 30:
        flags.append({
            "level":     "info",
            "condition": "Vitamin D Deficiency",
            "reason":    f"Vitamin D ({vit_d} ng/mL) is below optimal range (30–100).",
            "action":    "Increase sun exposure. Consider Vitamin D3 supplementation after consulting your doctor.",
        })

    testo = report.get("testosterone")
    lh_val = report.get("lh")
    if testo and float(testo) > 70 and lh_val and float(lh_val) > 10:
        flags.append({
            "level":     "warning",
            "condition": "Possible PCOS Indicator",
            "reason":    f"Elevated Testosterone ({testo} ng/dL) with high LH ({lh_val} mIU/mL) may indicate PCOS.",
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
                "action":    "Log consistently and share data with your gynecologist. Stress and diet can affect cycles.",
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
    init_db()
    print("🌸 HerBalance backend running on http://localhost:5000")
    app.run(debug=True, port=5000)
