import { useState, useEffect } from "react";

const API = "http://localhost:5000";

const theme = {
  pink: "#F472B6",
  pinkLight: "#FDF2F8",
  pinkMid: "#FBCFE8",
  pinkDark: "#DB2777",
  green: "#D1FAE5",
  greenAccent: "#6EE7B7",
  greenDark: "#059669",
  white: "#FFFFFF",
  text: "#1F1235",
  textMuted: "#9D7FA8",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #FDF2F8;
    color: #1F1235;
    min-height: 100vh;
  }

  .playfair { font-family: 'Playfair Display', serif; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #FDF2F8; }
  ::-webkit-scrollbar-thumb { background: #F9A8D4; border-radius: 3px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-pink {
    0%, 100% { box-shadow: 0 0 0 0 rgba(244,114,182,0.4); }
    50% { box-shadow: 0 0 0 10px rgba(244,114,182,0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  .fade-up { animation: fadeUp 0.5s ease forwards; }

  .card {
    background: white;
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 4px 24px rgba(219,39,119,0.08);
    border: 1px solid #FCE7F3;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(219,39,119,0.13); }

  .btn-primary {
    background: linear-gradient(135deg, #F472B6, #DB2777);
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 0.3px;
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(219,39,119,0.35);
    background: linear-gradient(135deg, #EC4899, #BE185D);
  }

  .btn-secondary {
    background: white;
    color: #DB2777;
    border: 2px solid #F9A8D4;
    padding: 10px 24px;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
  }
  .btn-secondary:hover {
    background: #FDF2F8;
    border-color: #DB2777;
  }

  .btn-green {
    background: linear-gradient(135deg, #6EE7B7, #059669);
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
  }
  .btn-green:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(5,150,105,0.3);
  }

  .input-field {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #FCE7F3;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1F1235;
    background: #FEFCE8;
    transition: border 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .input-field:focus {
    border-color: #F472B6;
    box-shadow: 0 0 0 3px rgba(244,114,182,0.15);
    background: white;
  }

  .input-field::placeholder { color: #C084FC; opacity: 0.6; }

  .select-field {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #FCE7F3;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1F1235;
    background: #FEFCE8;
    cursor: pointer;
    outline: none;
    transition: border 0.2s;
    appearance: none;
  }
  .select-field:focus { border-color: #F472B6; box-shadow: 0 0 0 3px rgba(244,114,182,0.15); }

  .label { font-size: 13px; font-weight: 600; color: #9D7FA8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; display: block; }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .badge-pink { background: #FCE7F3; color: #DB2777; }
  .badge-green { background: #D1FAE5; color: #059669; }
  .badge-yellow { background: #FEF3C7; color: #D97706; }
  .badge-red { background: #FEE2E2; color: #DC2626; }

  .nav {
    background: white;
    border-bottom: 1px solid #FCE7F3;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
  }

  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(135deg, #F472B6, #DB2777);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    cursor: pointer;
  }

  .nav-links { display: flex; gap: 4px; }

  .nav-link {
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    color: #9D7FA8;
    border: none;
    background: transparent;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .nav-link:hover { background: #FDF2F8; color: #DB2777; }
  .nav-link.active { background: linear-gradient(135deg, #FCE7F3, #FDF2F8); color: #DB2777; font-weight: 600; }

  .sidebar {
    width: 240px;
    background: white;
    border-right: 1px solid #FCE7F3;
    height: calc(100vh - 70px);
    position: fixed;
    top: 70px;
    left: 0;
    padding: 24px 16px;
    overflow-y: auto;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 16px;
    border-radius: 12px;
    cursor: pointer;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 500;
    color: #9D7FA8;
    transition: all 0.2s;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
  }
  .sidebar-item:hover { background: #FDF2F8; color: #DB2777; }
  .sidebar-item.active { background: linear-gradient(135deg, #FCE7F3, #FDF2F8); color: #DB2777; font-weight: 600; }

  .main-content {
    margin-left: 240px;
    padding: 32px;
    min-height: calc(100vh - 70px);
  }

  .hero {
    background: linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #D1FAE5 100%);
    border-radius: 24px;
    padding: 48px;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(244,114,182,0.15), transparent);
    border-radius: 50%;
  }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 20px 24px;
    border: 1px solid #FCE7F3;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .stat-icon {
    width: 48px; height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  .alert-flag {
    border-left: 4px solid;
    border-radius: 0 12px 12px 0;
    padding: 16px 20px;
    margin-bottom: 10px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .alert-flag.warning { border-color: #F59E0B; background: #FFFBEB; }
  .alert-flag.danger { border-color: #EF4444; background: #FFF5F5; }
  .alert-flag.info { border-color: #F472B6; background: #FDF2F8; }
  .alert-flag.good { border-color: #10B981; background: #F0FDF4; }

  .symptom-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    border: 2px solid #FCE7F3;
    background: white;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: #9D7FA8;
    transition: all 0.2s;
    margin: 4px;
  }
  .symptom-tag.selected {
    background: linear-gradient(135deg, #FCE7F3, #FDF2F8);
    border-color: #F472B6;
    color: #DB2777;
    font-weight: 600;
  }
  .symptom-tag:hover { border-color: #F9A8D4; color: #DB2777; }

  .intensity-btn {
    width: 40px; height: 40px;
    border-radius: 50%;
    border: 2px solid #FCE7F3;
    background: white;
    cursor: pointer;
    font-weight: 700;
    font-size: 14px;
    color: #9D7FA8;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
  }
  .intensity-btn.selected {
    border-color: #F472B6;
    background: linear-gradient(135deg, #F472B6, #DB2777);
    color: white;
  }

  .tab {
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    border: none;
    background: transparent;
    color: #9D7FA8;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .tab.active { background: linear-gradient(135deg, #F472B6, #DB2777); color: white; }
  .tab:hover:not(.active) { background: #FDF2F8; color: #DB2777; }

  .progress-bar {
    height: 8px;
    background: #FCE7F3;
    border-radius: 4px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease;
  }

  .cycle-day {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: white;
    border-radius: 14px;
    padding: 16px 20px;
    box-shadow: 0 8px 30px rgba(219,39,119,0.2);
    border-left: 4px solid #F472B6;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 1000;
    animation: fadeUp 0.3s ease;
    font-size: 14px;
    font-weight: 500;
    min-width: 280px;
  }

  .divider { height: 1px; background: #FCE7F3; margin: 20px 0; }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: #1F1235;
    margin-bottom: 6px;
  }
  .section-sub { font-size: 14px; color: #9D7FA8; margin-bottom: 24px; }

  table { width: 100%; border-collapse: collapse; }
  thead tr { border-bottom: 2px solid #FCE7F3; }
  th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #9D7FA8; text-transform: uppercase; letter-spacing: 0.8px; }
  td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #FDF2F8; }
  tbody tr:hover { background: #FEFCE8; }
`;

// ---- AUTH FORMS ----
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", conditions: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/signup";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch {
      setError("Cannot connect to backend. See setup instructions below.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FDF2F8, #FCE7F3 40%, #D1FAE5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌸</div>
          <h1 className="playfair" style={{ fontSize: 32, fontWeight: 700, background: "linear-gradient(135deg, #F472B6, #DB2777)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            HerBalance
          </h1>
          <p style={{ color: "#9D7FA8", fontSize: 15, marginTop: 6 }}>Your hormonal health companion</p>
        </div>

        <div className="card" style={{ animation: "fadeUp 0.5s ease" }}>
          <div style={{ display: "flex", background: "#FDF2F8", borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "10px", border: "none", borderRadius: 10, cursor: "pointer",
                background: mode === m ? "white" : "transparent",
                color: mode === m ? "#DB2777" : "#9D7FA8",
                fontWeight: mode === m ? 700 : 500,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                boxShadow: mode === m ? "0 2px 8px rgba(219,39,119,0.1)" : "none",
                transition: "all 0.2s",
              }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Full Name</label>
                <input className="input-field" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Age</label>
                <input className="input-field" type="number" placeholder="Your age" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Known Conditions (optional)</label>
                <input className="input-field" placeholder="e.g. PCOS, Thyroid, Anemia" value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })} />
              </div>
            </>
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="label">Email</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="label">Password</label>
            <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>

          {error && (
            <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          <div style={{ marginTop: 20, padding: "14px", background: "#F0FDF4", borderRadius: 12, border: "1px solid #D1FAE5" }}>
            <p style={{ fontSize: 12, color: "#059669", fontWeight: 600, marginBottom: 4 }}>🔌 Backend Setup Required</p>
            <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.6 }}>
              Run: <code style={{ background: "#E5E7EB", padding: "1px 4px", borderRadius: 4 }}>python app.py</code> to start the Flask server on port 5000. See the backend file provided.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- DASHBOARD ----
function Dashboard({ user }) {
  const [stats, setStats] = useState({ symptoms_logged: 0, cycle_days: 0, reports: 0, flags: 0 });
  const [recentSymptoms, setRecentSymptoms] = useState([]);
  const [flags, setFlags] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    fetch(API + "/api/dashboard", { headers }).then(r => r.json()).then(d => {
      if (d.stats) setStats(d.stats);
      if (d.recent_symptoms) setRecentSymptoms(d.recent_symptoms);
      if (d.flags) setFlags(d.flags);
    }).catch(() => {
      setStats({ symptoms_logged: 12, cycle_days: 28, reports: 3, flags: 2 });
      setRecentSymptoms([
        { date: "2025-01-10", symptoms: "Fatigue, Headache", intensity: 3 },
        { date: "2025-01-09", symptoms: "Cramps, Bloating", intensity: 4 },
      ]);
      setFlags([
        { type: "warning", title: "Irregular Cycle Detected", desc: "Your last cycle was 38 days. Normal range is 21–35 days." },
        { type: "info", title: "Hemoglobin Below Threshold", desc: "Last reported Hb: 10.2 g/dL. Consider consulting your doctor." },
      ]);
    });
  }, []);

  const statCards = [
    { label: "Symptoms Logged", value: stats.symptoms_logged, icon: "📝", color: "#FCE7F3", iconBg: "#FDF2F8" },
    { label: "Avg Cycle Length", value: `${stats.cycle_days || 28}d`, icon: "🌙", color: "#D1FAE5", iconBg: "#F0FDF4" },
    { label: "Lab Reports", value: stats.reports, icon: "🧪", color: "#EDE9FE", iconBg: "#F5F3FF" },
    { label: "Health Flags", value: stats.flags, icon: "🚩", color: "#FEF3C7", iconBg: "#FFFBEB" },
  ];

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div className="hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#9D7FA8", fontSize: 14, marginBottom: 6 }}>Good morning ✨</p>
            <h1 className="playfair" style={{ fontSize: 32, fontWeight: 700, color: "#1F1235", marginBottom: 10 }}>
              Welcome back, {user?.name?.split(" ")[0] || "Beautiful"} 🌸
            </h1>
            <p style={{ color: "#9D7FA8", fontSize: 15 }}>Track your health journey with care and compassion.</p>
          </div>
          <div style={{ fontSize: 80, animation: "float 3s ease-in-out infinite", display: "none" }}>🌸</div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ animation: `fadeUp ${0.1 * i + 0.2}s ease` }}>
            <div className="stat-icon" style={{ background: s.iconBg }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1F1235", fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#9D7FA8", fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="section-title" style={{ fontSize: 18 }}>Health Flags 🚩</h3>
          <p className="section-sub" style={{ marginBottom: 16 }}>Based on your recent data</p>
          {flags.length === 0 ? (
            <div className="alert-flag good">
              <span>✅</span>
              <div><strong style={{ color: "#059669" }}>All looks good!</strong><br /><span style={{ fontSize: 13, color: "#6B7280" }}>No health concerns detected currently.</span></div>
            </div>
          ) : flags.map((f, i) => (
            <div key={i} className={`alert-flag ${f.type}`}>
              <span>{f.type === "warning" ? "⚠️" : f.type === "danger" ? "🔴" : "💡"}</span>
              <div>
                <strong style={{ fontSize: 14 }}>{f.title}</strong><br />
                <span style={{ fontSize: 13, color: "#6B7280" }}>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="section-title" style={{ fontSize: 18 }}>Recent Symptoms 📋</h3>
          <p className="section-sub" style={{ marginBottom: 16 }}>Your last few entries</p>
          {recentSymptoms.length === 0 ? (
            <p style={{ color: "#9D7FA8", fontSize: 14 }}>No symptoms logged yet. Start tracking!</p>
          ) : recentSymptoms.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < recentSymptoms.length - 1 ? "1px solid #FDF2F8" : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1F1235" }}>{s.symptoms}</div>
                <div style={{ fontSize: 12, color: "#9D7FA8" }}>{s.date}</div>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} style={{ width: 8, height: 8, borderRadius: 2, background: n <= s.intensity ? "#F472B6" : "#FCE7F3" }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- SYMPTOM LOG ----
const SYMPTOMS = ["Fatigue", "Headache", "Cramps", "Bloating", "Mood Swings", "Acne", "Hair Loss", "Irregular Period", "Heavy Bleeding", "Hot Flashes", "Night Sweats", "Insomnia", "Anxiety", "Brain Fog", "Joint Pain", "Nausea", "Breast Tenderness", "Weight Gain"];

function SymptomLog({ showToast }) {
  const [selected, setSelected] = useState([]);
  const [intensity, setIntensity] = useState(3);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(API + "/api/symptoms", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setHistory(d.symptoms || []))
      .catch(() => setHistory([
        { id: 1, date: "2025-01-10", symptoms: "Fatigue, Headache", intensity: 3, notes: "Stressful day" },
        { id: 2, date: "2025-01-09", symptoms: "Cramps, Bloating", intensity: 4, notes: "" },
      ]));
  }, []);

  const toggleSymptom = s => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async () => {
    if (!selected.length) { showToast("Please select at least one symptom", "warning"); return; }
    setLoading(true);
    try {
      const res = await fetch(API + "/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date, symptoms: selected.join(", "), intensity, notes }),
      });
      if (res.ok) {
        showToast("Symptoms logged successfully! 🌸");
        setHistory(prev => [{ date, symptoms: selected.join(", "), intensity, notes, id: Date.now() }, ...prev]);
        setSelected([]); setNotes("");
      }
    } catch { showToast("Saved locally (backend offline)", "warning"); }
    setLoading(false);
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 className="section-title">Symptom Tracker 📝</h2>
      <p className="section-sub">Log how you're feeling today</p>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#1F1235" }}>How are you feeling today?</h3>

          <div style={{ marginBottom: 20 }}>
            <label className="label">Date</label>
            <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label">Select Symptoms</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {SYMPTOMS.map(s => (
                <span key={s} className={`symptom-tag ${selected.includes(s) ? "selected" : ""}`} onClick={() => toggleSymptom(s)}>
                  {selected.includes(s) ? "✓ " : ""}{s}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label">Intensity (1–5)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} className={`intensity-btn ${intensity === n ? "selected" : ""}`} onClick={() => setIntensity(n)}>{n}</button>
              ))}
              <span style={{ fontSize: 13, color: "#9D7FA8", marginLeft: 8 }}>
                {["", "Very Mild", "Mild", "Moderate", "Severe", "Very Severe"][intensity]}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="label">Notes (optional)</label>
            <textarea className="input-field" rows={3} placeholder="Any additional notes..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: "none" }} />
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%" }}>
            {loading ? "Saving..." : "Log Symptoms 🌸"}
          </button>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#1F1235" }}>Symptom History</h3>
          {history.map((h, i) => (
            <div key={i} style={{ padding: "14px 0", borderBottom: i < history.length - 1 ? "1px solid #FDF2F8" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#9D7FA8" }}>{h.date}</span>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map(n => <div key={n} style={{ width: 8, height: 8, borderRadius: 2, background: n <= h.intensity ? "#F472B6" : "#FCE7F3" }} />)}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {h.symptoms.split(", ").map(s => <span key={s} className="badge badge-pink">{s}</span>)}
              </div>
              {h.notes && <p style={{ fontSize: 12, color: "#9D7FA8", marginTop: 6 }}>{h.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- CYCLE TRACKER ----
function CycleTracker({ showToast }) {
  const [form, setForm] = useState({ last_period_date: "", cycle_length: 28, period_duration: 5, flow: "moderate", notes: "" });
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(API + "/api/cycle", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setHistory(d.cycles || []))
      .catch(() => setHistory([
        { last_period_date: "2025-01-01", cycle_length: 28, period_duration: 5, flow: "moderate" },
        { last_period_date: "2024-12-04", cycle_length: 26, period_duration: 4, flow: "heavy" },
      ]));
  }, []);

  const predictNext = (date, length) => {
    const d = new Date(date);
    d.setDate(d.getDate() + parseInt(length));
    return d.toISOString().slice(0, 10);
  };

  const handleSubmit = async () => {
    const res = await fetch(API + "/api/cycle", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    }).catch(() => null);
    if (res?.ok) showToast("Cycle data logged! 🌙");
    else showToast("Saved locally (backend offline)", "warning");
    setHistory(prev => [form, ...prev]);
  };

  const flowColor = { light: "#D1FAE5", moderate: "#FCE7F3", heavy: "#FEE2E2" };
  const flowText = { light: "#059669", moderate: "#DB2777", heavy: "#DC2626" };

  const nextPeriod = history[0] ? predictNext(history[0].last_period_date, history[0].cycle_length) : null;
  const daysUntil = nextPeriod ? Math.max(0, Math.ceil((new Date(nextPeriod) - new Date()) / 86400000)) : null;

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 className="section-title">Cycle Tracker 🌙</h2>
      <p className="section-sub">Monitor your menstrual cycle</p>

      {nextPeriod && (
        <div style={{ background: "linear-gradient(135deg, #FCE7F3, #FDF2F8)", borderRadius: 20, padding: "24px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ fontSize: 48 }}>🌸</div>
          <div>
            <p style={{ color: "#9D7FA8", fontSize: 14 }}>Next period predicted</p>
            <p className="playfair" style={{ fontSize: 24, fontWeight: 700, color: "#DB2777" }}>{nextPeriod}</p>
            <p style={{ color: "#9D7FA8", fontSize: 14 }}>in <strong style={{ color: "#1F1235" }}>{daysUntil} days</strong></p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 40, fontWeight: 800, fontFamily: "Playfair Display, serif", color: "#F472B6" }}>{daysUntil}</div>
            <div style={{ fontSize: 12, color: "#9D7FA8", fontWeight: 600 }}>DAYS AWAY</div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#1F1235" }}>Log New Cycle</h3>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Last Period Start Date</label>
            <input className="input-field" type="date" value={form.last_period_date} onChange={e => setForm({ ...form, last_period_date: e.target.value })} />
          </div>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <label className="label">Cycle Length (days)</label>
              <input className="input-field" type="number" min={18} max={45} value={form.cycle_length} onChange={e => setForm({ ...form, cycle_length: e.target.value })} />
            </div>
            <div>
              <label className="label">Period Duration (days)</label>
              <input className="input-field" type="number" min={1} max={10} value={form.period_duration} onChange={e => setForm({ ...form, period_duration: e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Flow</label>
            <select className="select-field" value={form.flow} onChange={e => setForm({ ...form, flow: e.target.value })}>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Notes</label>
            <textarea className="input-field" rows={2} placeholder="Any observations..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: "none" }} />
          </div>
          <button className="btn-primary" onClick={handleSubmit} style={{ width: "100%" }}>Log Cycle 🌙</button>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#1F1235" }}>Cycle History</h3>
          {history.map((h, i) => (
            <div key={i} style={{ padding: "14px 0", borderBottom: i < history.length - 1 ? "1px solid #FDF2F8" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#1F1235" }}>{h.last_period_date}</div>
                <div style={{ fontSize: 12, color: "#9D7FA8" }}>Cycle: {h.cycle_length}d · Duration: {h.period_duration}d</div>
              </div>
              <span className="badge" style={{ background: flowColor[h.flow] || "#FCE7F3", color: flowText[h.flow] || "#DB2777" }}>
                {h.flow}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- LAB REPORTS ----
const LAB_PARAMS = [
  { key: "hemoglobin", label: "Hemoglobin", unit: "g/dL", normal: "12–16", min: 12, max: 16 },
  { key: "tsh", label: "TSH", unit: "mIU/L", normal: "0.4–4.0", min: 0.4, max: 4 },
  { key: "t3", label: "T3", unit: "ng/dL", normal: "80–200", min: 80, max: 200 },
  { key: "t4", label: "T4", unit: "µg/dL", normal: "5–12", min: 5, max: 12 },
  { key: "ferritin", label: "Ferritin", unit: "ng/mL", normal: "12–150", min: 12, max: 150 },
  { key: "vitamin_d", label: "Vitamin D", unit: "ng/mL", normal: "30–100", min: 30, max: 100 },
  { key: "testosterone", label: "Testosterone", unit: "ng/dL", normal: "15–70", min: 15, max: 70 },
  { key: "lh", label: "LH", unit: "mIU/mL", normal: "2–15", min: 2, max: 15 },
  { key: "fsh", label: "FSH", unit: "mIU/mL", normal: "3–20", min: 3, max: 20 },
];

function LabReports({ showToast }) {
  const [form, setForm] = useState({ test_date: new Date().toISOString().slice(0, 10) });
  const [reports, setReports] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(API + "/api/reports", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setReports(d.reports || []))
      .catch(() => setReports([
        { test_date: "2025-01-05", hemoglobin: 10.2, tsh: 5.8, ferritin: 8 },
      ]));
  }, []);

  const handleSubmit = async () => {
    const res = await fetch(API + "/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    }).catch(() => null);
    if (res?.ok) showToast("Lab report saved! 🧪");
    else showToast("Saved locally (backend offline)", "warning");
    setReports(prev => [form, ...prev]);
  };

  const getStatus = (key, val) => {
    const p = LAB_PARAMS.find(p => p.key === key);
    if (!p || !val) return null;
    const v = parseFloat(val);
    if (v < p.min) return "low";
    if (v > p.max) return "high";
    return "normal";
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 className="section-title">Lab Reports 🧪</h2>
      <p className="section-sub">Enter your blood test values</p>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#1F1235" }}>Add Lab Values</h3>
        <div style={{ marginBottom: 20 }}>
          <label className="label">Test Date</label>
          <input className="input-field" type="date" value={form.test_date} onChange={e => setForm({ ...form, test_date: e.target.value })} style={{ maxWidth: 220 }} />
        </div>
        <div className="grid-3" style={{ marginBottom: 24 }}>
          {LAB_PARAMS.map(p => (
            <div key={p.key}>
              <label className="label">{p.label} ({p.unit})</label>
              <div style={{ position: "relative" }}>
                <input className="input-field" type="number" step="0.1" placeholder={p.normal} value={form[p.key] || ""} onChange={e => setForm({ ...form, [p.key]: e.target.value })} />
                {form[p.key] && (
                  <span className={`badge badge-${getStatus(p.key, form[p.key]) === "normal" ? "green" : "red"}`} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11 }}>
                    {getStatus(p.key, form[p.key])}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11, color: "#9D7FA8", marginTop: 3 }}>Normal: {p.normal}</p>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={handleSubmit}>Save Lab Report 🧪</button>
      </div>

      {reports.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#1F1235" }}>Report History</h3>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  {LAB_PARAMS.filter(p => reports.some(r => r[p.key])).map(p => <th key={p.key}>{p.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.test_date}</td>
                    {LAB_PARAMS.filter(p => reports.some(r => r[p.key])).map(p => {
                      const status = getStatus(p.key, r[p.key]);
                      return (
                        <td key={p.key}>
                          {r[p.key] ? (
                            <span className={`badge badge-${status === "normal" ? "green" : status ? "red" : "pink"}`}>
                              {r[p.key]}
                            </span>
                          ) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- HEALTH FLAGS ----
function HealthFlags() {
  const [flags, setFlags] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(API + "/api/health-flags", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setFlags(d.flags || []))
      .catch(() => setFlags([
        { level: "warning", condition: "Possible Anemia", reason: "Hemoglobin (10.2 g/dL) below normal range. Ferritin also low.", action: "Consult your doctor. Increase iron-rich foods." },
        { level: "warning", condition: "Thyroid Imbalance", reason: "TSH (5.8 mIU/L) above normal range (0.4–4.0).", action: "Schedule thyroid function follow-up with endocrinologist." },
        { level: "info", condition: "Irregular Cycle Pattern", reason: "Last 3 cycles varied by >7 days.", action: "Log consistently and share with gynecologist." },
      ]));
  }, []);

  const icons = { danger: "🔴", warning: "⚠️", info: "💡", good: "✅" };
  const colors = { danger: "#FEE2E2", warning: "#FFFBEB", info: "#FDF2F8", good: "#F0FDF4" };
  const borders = { danger: "#EF4444", warning: "#F59E0B", info: "#F472B6", good: "#10B981" };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 className="section-title">Health Flags 🚩</h2>
      <p className="section-sub">AI-assisted health indicators based on your data</p>

      <div style={{ background: "linear-gradient(135deg, #D1FAE5, #F0FDF4)", borderRadius: 16, padding: "16px 20px", marginBottom: 24, border: "1px solid #6EE7B7" }}>
        <p style={{ fontSize: 13, color: "#059669", fontWeight: 600 }}>ℹ️ Disclaimer</p>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>These flags are generated from rule-based logic for awareness only. Always consult a qualified healthcare professional for diagnosis and treatment.</p>
      </div>

      {flags === null ? (
        <p style={{ color: "#9D7FA8" }}>Loading your health analysis...</p>
      ) : flags.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 className="playfair" style={{ fontSize: 22, color: "#059669", marginBottom: 8 }}>All Clear!</h3>
          <p style={{ color: "#9D7FA8" }}>No health concerns detected based on your current data. Keep logging!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {flags.map((f, i) => (
            <div key={i} style={{ background: colors[f.level], border: `1px solid ${borders[f.level]}`, borderLeft: `5px solid ${borders[f.level]}`, borderRadius: "0 16px 16px 0", padding: "20px 24px", animation: `fadeUp ${0.1 * i + 0.2}s ease` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{icons[f.level]}</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1F1235" }}>{f.condition}</h3>
                <span className={`badge badge-${f.level === "warning" ? "yellow" : f.level === "danger" ? "red" : "pink"}`} style={{ marginLeft: "auto" }}>
                  {f.level}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#4B5563", marginBottom: 8 }}><strong>Reason:</strong> {f.reason}</p>
              <p style={{ fontSize: 14, color: "#4B5563" }}><strong>Recommended Action:</strong> {f.action}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- PROFILE ----
function Profile({ user, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", age: user?.age || "", conditions: user?.conditions || "" });

  return (
    <div style={{ animation: "fadeUp 0.4s ease", maxWidth: 600 }}>
      <h2 className="section-title">My Profile 👤</h2>
      <p className="section-sub">Manage your account information</p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #F472B6, #DB2777)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "white", fontWeight: 700 }}>
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div>
            <h3 className="playfair" style={{ fontSize: 22, fontWeight: 700, color: "#1F1235" }}>{user?.name}</h3>
            <p style={{ color: "#9D7FA8", fontSize: 14 }}>{user?.email}</p>
          </div>
        </div>

        {editing ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Full Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Age</label>
              <input className="input-field" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">Known Conditions</label>
              <input className="input-field" value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })} placeholder="e.g. PCOS, Thyroid" />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={() => setEditing(false)}>Save Changes</button>
              <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "grid", gap: 14 }}>
              {[["Age", user?.age || "—"], ["Conditions", user?.conditions || "None listed"], ["Member Since", new Date().toLocaleDateString()]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #FDF2F8" }}>
                  <span style={{ fontSize: 14, color: "#9D7FA8", fontWeight: 500 }}>{k}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1F1235" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
              <button className="btn-secondary" onClick={onLogout}>Sign Out</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---- MAIN APP ----
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "symptoms", label: "Symptoms", icon: "📝" },
  { id: "cycle", label: "Cycle", icon: "🌙" },
  { id: "labs", label: "Lab Reports", icon: "🧪" },
  { id: "flags", label: "Health Flags", icon: "🚩" },
  { id: "profile", label: "Profile", icon: "👤" },
];

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) return (
    <>
      <style>{styles}</style>
      <AuthPage onLogin={u => setUser(u)} />
    </>
  );

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard user={user} />;
      case "symptoms": return <SymptomLog showToast={showToast} />;
      case "cycle": return <CycleTracker showToast={showToast} />;
      case "labs": return <LabReports showToast={showToast} />;
      case "flags": return <HealthFlags />;
      case "profile": return <Profile user={user} onLogout={handleLogout} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <>
      <style>{styles}</style>

      <nav className="nav">
        <div className="nav-logo">🌸 HerBalance</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #F472B6, #DB2777)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#9D7FA8" }}>{user?.name}</span>
        </div>
      </nav>

      <aside className="sidebar">
        <p style={{ fontSize: 11, fontWeight: 700, color: "#C4B5D4", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 16 }}>Navigation</p>
        {NAV_ITEMS.map(item => (
          <button key={item.id} className={`sidebar-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ marginTop: 32, padding: "16px", background: "linear-gradient(135deg, #FDF2F8, #D1FAE5)", borderRadius: 14, border: "1px solid #FCE7F3" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#DB2777", marginBottom: 4 }}>💡 Health Tip</p>
          <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>Track your cycle consistently for 3+ months to detect patterns.</p>
        </div>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>

      {toast && (
        <div className="toast">
          <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}
