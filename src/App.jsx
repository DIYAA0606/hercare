import { useState, useEffect, useRef } from "react";
import logoLight from "./assets/logo-light.svg";
import logoDark from "./assets/logo-dark.svg";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend, Cell
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


// import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
const API =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://hercare-euou.onrender.com";

/* ─────────────────────────── GLOBAL STYLES ─────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --rose:        #C9768A;
      --rose-light:  #E8B4C0;
      --rose-pale:   #F5E6E9;
      --rose-deep:   #9E4F63;
      --cream:       #FAF7F4;
      --cream-dark:  #F0EAE3;
      --sage:        #8FAF96;
      --sage-light:  #C8DECE;
      --sage-pale:   #EBF3EC;
      --sand:        #D4BFA8;
      --text:        #2C1F27;
      --text-mid:    #6B5260;
      --text-soft:   #A08898;
      --white:       #FFFFFF;
      --border:      rgba(201,118,138,0.15);
      --shadow-sm:   0 2px 12px rgba(44,31,39,0.06);
      --shadow-md:   0 8px 32px rgba(44,31,39,0.10);
      --shadow-lg:   0 20px 60px rgba(44,31,39,0.13);
      --radius-sm:   10px;
      --radius-md:   18px;
      --radius-lg:   28px;
      --font-display: 'Cormorant Garamond', Georgia, serif;
      --font-body:    'Jost', sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--font-body);
      background: var(--cream);
      color: var(--text);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    ::selection { background: var(--rose-pale); color: var(--rose-deep); }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--cream-dark); }
    ::-webkit-scrollbar-thumb { background: var(--rose-light); border-radius: 10px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .animate-fade-up  { animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }
    .animate-fade-in  { animation: fadeIn 0.4s ease both; }
    .animate-slide-r  { animation: slideRight 0.4s ease both; }

    /* ── LAYOUT ── */
    .app-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
    .topbar {
      height: 64px;
      background: var(--white);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 200;
      backdrop-filter: blur(12px);
    }
    .body-area {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      width: 230px;
      flex-shrink: 0;
      background: var(--white);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 28px 14px;
      overflow-y: auto;
      gap: 4px;
    }
    .page-area {
      flex: 1;
      overflow-y: auto;
      padding: 40px 44px;
      background: var(--cream);
    }

    /* ── LOGO ── */
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      cursor: pointer;
      user-select: none;
    }
    .logo-mark {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(158,79,99,0.3);
    }
    .logo-text {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.3px;
      color: var(--text);
    }
      
    .logo-text span { color: var(--rose); }
    body.dark .logo-text {
  color: #ffffff !important;
}

body.dark .logo-text span {
  color: var(--rose-light) !important;
}
body.dark .display,
body.dark .page-title {
  color: #ffffff;
}
  body.dark .display,
body.dark .page-title {
  color: #ffffff;
}

    /* ── NAV ITEMS ── */
    body.dark .nav-item {
  color: var(--text-mid);
}

body.dark .nav-item.active {
  color: var(--rose-light);
  background: rgba(255,255,255,0.05);
}
    .nav-section-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1.4px;
      text-transform: uppercase;
      color: var(--text-soft);
      padding: 0 12px;
      margin: 12px 0 6px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 13.5px;
      font-weight: 400;
      color: var(--text-mid);
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      font-family: var(--font-body);
      transition: background 0.18s, color 0.18s;
      letter-spacing: 0.2px;
    }
    .nav-item:hover { background: var(--rose-pale); color: var(--rose-deep); }
    .nav-item.active {
      background: linear-gradient(135deg, var(--rose-pale), #fdf0f3);
      color: var(--rose-deep);
      font-weight: 500;
    }
    .nav-item .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      opacity: 0.7;
    }
    .nav-item.active .nav-icon { opacity: 1; }

    /* ── CARDS ── */
    .card {
      background: var(--white);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      transition: box-shadow 0.25s, transform 0.25s;
    }
    .card:hover { box-shadow: var(--shadow-md); }
    .card-body { padding: 28px; }
    .card-sm .card-body { padding: 20px 22px; }

    .card-elevated {
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border: 1px solid rgba(255,255,255,0.8);
    }

    /* ── TYPOGRAPHY ── */
    .display { font-family: var(--font-display); font-weight: 400; line-height: 1.2; }
    .display-lg { font-size: 42px; }
    .display-md { font-size: 28px; }
    .display-sm { font-size: 21px; }

    .page-title {
      font-family: var(--font-display);
      font-size: 30px;
      font-weight: 400;
      color: var(--text);
      letter-spacing: -0.2px;
      margin-bottom: 4px;
    }
    .page-sub {
      font-size: 13.5px;
      color: var(--text-soft);
      font-weight: 300;
      margin-bottom: 32px;
      letter-spacing: 0.2px;
    }
    .section-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      color: var(--text-soft);
      margin-bottom: 8px;
    }

    /* ── INPUTS ── */
    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: var(--text-soft);
      margin-bottom: 7px;
    }
    .input {
      width: 100%;
      padding: 11px 15px;
      border: 1.5px solid var(--cream-dark);
      border-radius: var(--radius-sm);
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--text);
      background: var(--cream);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    .input:focus {
      border-color: var(--rose-light);
      background: var(--white);
      box-shadow: 0 0 0 3px rgba(201,118,138,0.1);
    }
    .input::placeholder { color: var(--text-soft); font-weight: 300; }
    textarea.input { resize: none; line-height: 1.6; }
    select.input { cursor: pointer; appearance: none; }

    /* ── BUTTONS ── */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 11px 26px;
      border-radius: 50px;
      font-family: var(--font-body);
      font-size: 13.5px;
      font-weight: 500;
      letter-spacing: 0.4px;
      cursor: pointer;
      border: none;
      transition: all 0.22s;
      white-space: nowrap;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-primary {
      background: linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%);
      color: var(--white);
      box-shadow: 0 4px 14px rgba(158,79,99,0.28);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px rgba(158,79,99,0.35);
    }
    .btn-secondary {
      background: var(--cream-dark);
      color: var(--text-mid);
    }
    .btn-secondary:hover { background: var(--rose-pale); color: var(--rose-deep); }

    .btn-ghost {
      background: transparent;
      color: var(--text-mid);
      padding: 11px 18px;
    }
    .btn-ghost:hover { background: var(--rose-pale); color: var(--rose-deep); }

    .btn-sage {
      background: linear-gradient(135deg, var(--sage) 0%, #6b9474 100%);
      color: var(--white);
      box-shadow: 0 4px 14px rgba(107,148,116,0.25);
    }
    .btn-sage:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(107,148,116,0.32); }

    .btn-full { width: 100%; }

    /* ── BADGES ── */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
    .badge-rose    { background: var(--rose-pale);  color: var(--rose-deep); }
    .badge-sage    { background: var(--sage-pale);  color: #4a7a54; }
    .badge-sand    { background: #F5EFE6;            color: #8B6E4E; }
    .badge-warn    { background: #FEF3E2;            color: #9A6520; }
    .badge-danger  { background: #FDE8E8;            color: #8B2020; }

    /* ── STAT CARDS ── */
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card {
      background: var(--white);
      border-radius: var(--radius-md);
      padding: 22px 24px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .stat-icon-wrap {
      width: 42px; height: 42px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .stat-value {
      font-family: var(--font-display);
      font-size: 32px;
      font-weight: 400;
      color: var(--text);
      line-height: 1;
    }
    .stat-label { font-size: 12px; color: var(--text-soft); font-weight: 400; letter-spacing: 0.3px; }

    /* ── ALERT FLAGS ── */
    .flag-card {
      border-radius: var(--radius-md);
      padding: 20px 22px;
      margin-bottom: 12px;
      border-left: 3px solid;
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .flag-warn   { background: #FEFBF3; border-color: #D4954A; }
    .flag-danger { background: #FDF5F5; border-color: #C05555; }
    .flag-info   { background: var(--rose-pale); border-color: var(--rose); }
    .flag-good   { background: var(--sage-pale); border-color: var(--sage); }

    /* ── SYMPTOM TAGS ── */
    .tag-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .sym-tag {
      padding: 7px 15px;
      border-radius: 30px;
      border: 1.5px solid var(--cream-dark);
      background: var(--cream);
      font-size: 13px;
      font-weight: 400;
      color: var(--text-mid);
      cursor: pointer;
      transition: all 0.18s;
      font-family: var(--font-body);
      letter-spacing: 0.2px;
    }
    .sym-tag:hover { border-color: var(--rose-light); color: var(--rose-deep); background: var(--rose-pale); }
    .sym-tag.on {
      background: linear-gradient(135deg, var(--rose-pale), #faeef1);
      border-color: var(--rose);
      color: var(--rose-deep);
      font-weight: 500;
    }

    /* ── INTENSITY ── */
    .intensity-row { display: flex; gap: 8px; align-items: center; }
    .int-btn {
      width: 38px; height: 38px;
      border-radius: 50%;
      border: 1.5px solid var(--cream-dark);
      background: var(--cream);
      font-size: 13px;
      font-weight: 500;
      color: var(--text-mid);
      cursor: pointer;
      transition: all 0.18s;
      font-family: var(--font-body);
      display: flex; align-items: center; justify-content: center;
    }
    .int-btn:hover { border-color: var(--rose-light); color: var(--rose-deep); }
    .int-btn.on {
      background: linear-gradient(135deg, var(--rose), var(--rose-deep));
      border-color: transparent;
      color: white;
      box-shadow: 0 4px 10px rgba(158,79,99,0.3);
    }

    /* ── TABLE ── */
    .table-wrap { overflow-x: auto; border-radius: var(--radius-md); }
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 1.5px solid var(--cream-dark); }
    th {
      padding: 12px 18px;
      text-align: left;
      font-size: 10.5px;
      font-weight: 600;
      color: var(--text-soft);
      text-transform: uppercase;
      letter-spacing: 1.1px;
    }
    td { padding: 14px 18px; font-size: 13.5px; border-bottom: 1px solid var(--cream); }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: var(--cream); }

    /* ── TABS ── */
    .tab-bar {
      display: flex;
      background: var(--cream-dark);
      border-radius: 12px;
      padding: 4px;
      gap: 2px;
    }
    .tab-btn {
      flex: 1;
      padding: 9px 16px;
      border: none;
      border-radius: 9px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 400;
      cursor: pointer;
      background: transparent;
      color: var(--text-soft);
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: var(--white);
      color: var(--rose-deep);
      font-weight: 500;
      box-shadow: var(--shadow-sm);
    }

    /* ── DIVIDER ── */
    .divider { height: 1px; background: var(--cream-dark); margin: 20px 0; }

    /* ── TOAST ── */
    .toast {
      position: fixed;
      bottom: 28px; right: 28px;
      background: var(--white);
      border-radius: var(--radius-md);
      padding: 16px 22px;
      box-shadow: var(--shadow-lg);
      border-left: 3px solid var(--rose);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 9999;
      animation: toastIn 0.3s cubic-bezier(.22,.68,0,1.2) both;
      font-size: 13.5px;
      font-weight: 400;
      color: var(--text);
      min-width: 270px;
      max-width: 340px;
    }
    .toast.warn { border-color: #D4954A; }

    /* ── GRID UTILS ── */
    .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
    .gap16 { gap: 16px; }
    .mb8  { margin-bottom: 8px; }
    .mb12 { margin-bottom: 12px; }
    .mb16 { margin-bottom: 16px; }
    .mb20 { margin-bottom: 20px; }
    .mb24 { margin-bottom: 24px; }
    .mb28 { margin-bottom: 28px; }
    .mb32 { margin-bottom: 32px; }
    .mt8  { margin-top: 8px; }
    .mt12 { margin-top: 12px; }
    .mt16 { margin-top: 16px; }
    .mt20 { margin-top: 20px; }
    .flex  { display: flex; }
    .flex-center { display: flex; align-items: center; }
    .flex-between { display: flex; align-items: center; justify-content: space-between; }
    .flex-col { display: flex; flex-direction: column; }
    .gap8  { gap: 8px; }
    .gap10 { gap: 10px; }
    .gap12 { gap: 12px; }
    .gap16 { gap: 16px; }
    .gap20 { gap: 20px; }

    /* ── AUTH PAGE ── */
    .auth-shell {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
    .auth-left {
      background: linear-gradient(160deg, #2C1F27 0%, #4A2535 40%, #7A3D50 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 52px 56px;
      position: relative;
      overflow: hidden;
    }
    .auth-left::before {
      content: '';
      position: absolute;
      top: -100px; right: -100px;
      width: 500px; height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(201,118,138,0.18) 0%, transparent 70%);
      pointer-events: none;
    }
    .auth-left::after {
      content: '';
      position: absolute;
      bottom: -80px; left: -80px;
      width: 380px; height: 380px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(143,175,150,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .auth-right {
      background: var(--cream);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 52px 56px;
    }
    .auth-form-wrap {
      width: 100%;
      max-width: 400px;
    }
    .auth-quote {
      font-family: var(--font-display);
      font-size: 38px;
      font-weight: 300;
      color: rgba(255,255,255,0.92);
      line-height: 1.3;
      letter-spacing: -0.3px;
      margin-top: 40px;
    }
    .auth-quote em { color: var(--rose-light); font-style: italic; }
    .auth-tagline {
      font-size: 13px;
      color: rgba(255,255,255,0.45);
      font-weight: 300;
      letter-spacing: 0.4px;
      margin-top: 16px;
      line-height: 1.7;
    }
    .auth-dots {
      display: flex;
      gap: 6px;
    }
    .auth-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
    }
    .auth-dot.on { background: var(--rose-light); }

    /* ── PROFILE AVATAR ── */
    .avatar {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--rose-light), var(--rose-deep));
      display: flex; align-items: center; justify-content: center;
      color: white;
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .avatar-lg {
      width: 72px; height: 72px;
      font-size: 28px;
    }

    /* ── HERO BANNER ── */
    .hero-banner {
      background: linear-gradient(135deg, #2C1F27 0%, #5A3040 100%);
      border-radius: var(--radius-lg);
      padding: 40px 44px;
      margin-bottom: 28px;
      position: relative;
      overflow: hidden;
      color: white;
    }
    .hero-banner::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 320px; height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(201,118,138,0.2) 0%, transparent 70%);
    }
    .hero-banner::after {
      content: '';
      position: absolute;
      bottom: -40px; left: 30%;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(143,175,150,0.15) 0%, transparent 70%);
    }

    /* ── NOTICE BOX ── */
    .notice {
      border-radius: var(--radius-sm);
      padding: 14px 18px;
      font-size: 13px;
      line-height: 1.6;
    }
    .notice-sage { background: var(--sage-pale); border: 1px solid var(--sage-light); color: #3d6647; }
    .notice-rose { background: var(--rose-pale); border: 1px solid var(--rose-light); color: var(--rose-deep); }

    /* ── CYCLE PREDICT CARD ── */
    .cycle-predict {
      background: linear-gradient(135deg, var(--rose-pale) 0%, #f8ece0 100%);
      border-radius: var(--radius-lg);
      padding: 28px 32px;
      border: 1px solid var(--rose-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    /* ── FLOW DOTS ── */
    .flow-dot {
      width: 9px; height: 9px;
      border-radius: 50%;
    }
      body.dark {
  --cream:       #1E1A1D;
  --cream-dark:  #2A2428;

  --text:        #FFFFFF;        /* 🔥 pure white */
  --text-mid:    #E0D0D6;
  --text-soft:   #BFAAB2;

  --white:       #2A2428;
  --border:      rgba(255,255,255,0.08);

  /* 💅 better pink shades */
  --rose:        #E89AB0;        /* lighter pink */
  --rose-light:  #F2B8C6;
  --rose-pale:   #3A2A30;

  --sage-pale:   #2A3A30;
}
  body.dark .btn {
  color: var(--text);
}
  body.dark .input {
  color: var(--text);
  background: var(--cream-dark);
}
  body.dark {
  color: var(--text);
}

body.dark * {
  color: var(--text);
}
  /* 🔥 INPUT FIX */
body.dark input,
body.dark select,
body.dark textarea {
  background: #2A2428;   /* darker background */
  color: #ffffff;        /* white text */
  border: 1px solid rgba(255,255,255,0.15);
}

/* placeholder text */
body.dark input::placeholder,
body.dark textarea::placeholder {
  color: #BFAAB2;
}
  body.dark label,
body.dark .label {
  color: #EADDE1;
}
  body.dark .section-title {
  color: #EADDE1;
}
  .card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
}

body.dark .card {
  background: #2A2428;
  border: 1px solid rgba(255,255,255,0.08);
}

.chart-card {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.05);

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  min-height: 300px; /* 🔥 IMPORTANT */
}

body.dark .chart-card {
  background: #2A2428;
  border: 1px solid rgba(255,255,255,0.08);
}

body.dark .chart-card {
  background: #2A2428;
  border: 1px solid rgba(255,255,255,0.08);
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.chart-header p {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.chart-container {
  margin-top: 12px;
}
  .dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
  .heatmap-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.heatmap-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.heat-cell {
  width: 20px;
  height: 20px;
  border-radius: 6px;
}
  .dashboard-container {
  padding: 20px;
  width: 100%;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  align-items: stretch;
}

/* mobile */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
  .heatmap-grid {
  margin-top: 12px;
  overflow-x: auto;
}

.heatmap-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.label {
  width: 120px;
  font-size: 13px;
  color: #666;
}

body.dark .label {
  color: #ccc;
}
  .chart-header {
  margin-bottom: 10px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
}

.chart-header p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #888;
}
  .report-section {
  margin-bottom: 30px;
}

.report-section h2 {
  margin-bottom: 10px;
  font-size: 18px;
}

.stats-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.report-header {
  text-align: center;
  margin-bottom: 20px;
}
  `}</style>
);

/* ─────────────────────────────── SVG ICONS ───────────────────────────────── */
const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const icons = {
    home: <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.5" fill="none"/><path d="M9 21V12h6v9" stroke={color} strokeWidth="1.5" fill="none"/></>,
    clipboard: <><rect x="9" y="2" width="6" height="4" rx="1" stroke={color} strokeWidth="1.5" fill="none"/><rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="1.5" fill="none"/><path d="M7 12h10M7 16h6" stroke={color} strokeWidth="1.5"/></>,
    moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth="1.5" fill="none"/>,
    flask: <><path d="M9 2h6M10 2v6l-4 10a1 1 0 00.93 1.37h10.14A1 1 0 0018 18L14 8V2" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/></>,
    flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={color} strokeWidth="1.5" fill="none"/><line x1="4" y1="22" x2="4" y2="15" stroke={color} strokeWidth="1.5"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.5" fill="none"/><circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.5" fill="none"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
    check: <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="1.5" fill="none"/><line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth="2"/></>,
    info: <><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none"/><line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth="1.5"/><line x1="12" y1="16" x2="12.01" y2="16" stroke={color} strokeWidth="2"/></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth="1.5" fill="none"/>,
    chevron: <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    sun:     <><circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" fill="none"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      {icons[name]}
    </svg>
  );
};

/* ──────────────────────────── LOGO COMPONENT ─────────────────────────────── */
const Logo = ({ darkMode }) => (
  <div className="logo">
    <img
      src={darkMode ? logoDark : logoLight}
      alt="Her Care"
      style={{
        height: 36,
        transition: "all 0.3s ease"
      }}
    />
  </div>
);

/* ─────────────────────────── AUTH PAGE ───────────────────────────────────── */
function AuthPage({ onLogin,darkMode }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", conditions: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const googleLogin = useGoogleLogin({
  flow: "implicit",
  onSuccess: async (tokenResponse) => {
    try {
      const res = await fetch(API + "/api/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: tokenResponse.access_token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Google login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);

    } catch {
      setError("Google login failed");
    }
  },
  onError: () => setError("Google login failed"),
});
  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/signup";
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch {
      setError("Cannot reach backend. Start the Flask server first.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <GlobalStyles />
      <div className="auth-shell">
        {/* Left panel */}
        <div className="auth-left">
          <Logo darkMode={darkMode} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p className="auth-quote">
              Your body tells<br />a story. Let's <em>listen</em><br />together.
            </p>
            <p className="auth-tagline">
              Track your cycle, symptoms, and lab values<br />in one calm, private space.
            </p>
          </div>
          <div className="auth-dots" style={{ position: "relative", zIndex: 1 }}>
            <div className="auth-dot on" />
            <div className="auth-dot" />
            <div className="auth-dot" />
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-right">
          <div className="auth-form-wrap animate-fade-up">
            <div className="mb28">
              <p className="display display-md" style={{ color: "var(--text)", marginBottom: 6 }}>
                {mode === "login" ? "Welcome back" : "Create your account"}
              </p>
              <p style={{ fontSize: 13.5, color: "var(--text-soft)", fontWeight: 300 }}>
                {mode === "login" ? "Sign in to continue your health journey." : "Join HerCare and begin tracking today."}
              </p>
            </div>
            <div style={{ marginTop: 20 }}>

</div>
            {/* Toggle */}
            <div className="tab-bar mb24">
              <button className={`tab-btn ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Sign In</button>
              <button className={`tab-btn ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>Create Account</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mode === "signup" && (
                <>
                  <div>
                    <label className="field-label">Full Name</label>
                    <input className="input" placeholder="Your name" value={form.name} onChange={set("name")} />
                  </div>
                  <div>
                    <label className="field-label">Age</label>
                    <input className="input" type="number" placeholder="e.g. 24" value={form.age} onChange={set("age")} />
                  </div>
                  <div>
                    <label className="field-label">Known Conditions (optional)</label>
                    <input className="input" placeholder="e.g. PCOS, Thyroid, Anemia" value={form.conditions} onChange={set("conditions")} />
                  </div>
                </>
              )}
              <div>
                <label className="field-label">Email Address</label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
              </div>
              <div>
                <label className="field-label">Password</label>
                <input className="input" type="password" placeholder="At least 6 characters" value={form.password} onChange={set("password")}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
</div>

            {error && (
              <div className="notice notice-rose mt16">
                {error}
              </div>
            )}

            <button className="btn btn-primary btn-full" style={{ marginTop: 24 }} onClick={handleSubmit} disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
            <p style={{ textAlign: "center", marginTop: 16 }}>
  — or continue with —
            </p>
            

<div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
  <button
    onClick={() => googleLogin()}
    style={{
      width: 48,
      height: 48,
      borderRadius: "50%",
      border: "1px solid var(--border)",
      background: "var(--white)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    }}
  >
    <img
      src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
      alt="Google"
      style={{ width: 22, height: 22 }}
    />
  </button>
</div>

            <div className="notice notice-sage mt20">
              <strong style={{ display: "block", marginBottom: 4 }}>Backend required</strong>
              Run <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>python app.py</code> in your terminal to start the Flask server.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────── CHART COMPONENTS ──────────────────────────────────── */

function HemoglobinChart({ data }) {
  const filtered = (data || []).filter(d => d.value != null);
  const chartData = filtered.length > 0
    ? filtered.map(d => ({ date: (d.date || "").slice(0, 7), value: parseFloat(d.value) }))
    : [];
  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-body" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>Hemoglobin Trend</div>
        <div style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 14 }}>Normal range: 12.0 — 15.5 g/dL</div>
        <div style={{ flex: 1, minHeight: 200 }}>
          {filtered.length === 0 ? (
  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-soft)", fontSize: 13 }}>
    No lab reports logged yet.
  </div>
) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,136,152,0.15)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#A08898" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A08898" }} axisLine={false} tickLine={false} domain={["auto","auto"]} />
              <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, background: "var(--white)" }} />
              <ReferenceLine y={12}   stroke="#8FAF96" strokeDasharray="4 4" strokeWidth={1.5} />
              <ReferenceLine y={15.5} stroke="#8FAF96" strokeDasharray="4 4" strokeWidth={1.5} />
              <Line type="monotone" dataKey="value" stroke="#C9768A" strokeWidth={2.5} dot={{ r: 4, fill: "#C9768A", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
)}
        </div>
      </div>
    </div>
  );
}

function CycleLengthChart({ data }) {
  const filtered = (data || []).filter(d => d.cycle_length);
  const chartData = filtered.length > 0
    ? filtered.slice(0, 6).reverse().map(d => ({ date: (d.date || "").slice(0, 7), length: d.cycle_length }))
    : [{ date: "Nov 25", length: 26 }, { date: "Dec 25", length: 31 }, { date: "Jan 26", length: 29 }, { date: "Feb 26", length: 29 }, { date: "Mar 26", length: 30 }, { date: "Mar 26", length: 28 }];
  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-body" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>Cycle Length</div>
        <div style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 14 }}>Last 6 cycles</div>
        <div style={{ flex: 1, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,136,152,0.15)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#A08898" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A08898" }} axisLine={false} tickLine={false} domain={[0,"auto"]} />
              <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, background: "var(--white)" }} />
              <ReferenceLine y={28} stroke="#C9768A" strokeDasharray="4 4" strokeWidth={1.5} />
              <Bar dataKey="length" fill="#9B59B6" radius={[5,5,0,0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SymptomHeatmap({ data }) {
const WEEKS = Array.from({ length: 8 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (7 * (7 - i)));
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
});
  const ROWS  = ["Fatigue","Cramps","Mood Swings","Headache","Bloating","Back Pain","Breast Tenderness","Insomnia"];
  const grid  = {};
  ROWS.forEach(s => { grid[s] = {}; WEEKS.forEach(w => { grid[s][w] = 0; }); });
  if (data && data.length > 0) {
    data.forEach(entry => {
      const sym = entry.symptoms || entry.symptom || "";
      const idx = Math.min(Math.floor((Date.now() - new Date(entry.date)) / (7*86400000)), WEEKS.length - 1);
      const wk  = WEEKS[Math.max(0, idx)];
      sym.split(", ").forEach(s => { if (grid[s] && wk) grid[s][wk] = (grid[s][wk]||0) + (entry.intensity||1); });
    });
  } 
  const getColor = v => {
    if (!v) return "rgba(201,118,138,0.08)";
    return `rgba(201,118,138,${Math.min(0.2 + (v/5)*0.75, 1)})`;
  };
  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-body" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>Symptom Heatmap</div>
        <div style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 14 }}>Last 8 weeks · Intensity by week</div>
        <div style={{ flex: 1, overflowX: "auto" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: 4, width: "100%" }}>
            <thead>
              <tr>
                <th style={{ width: 130, textAlign: "right", paddingRight: 8, fontSize: 10, color: "var(--text-soft)", fontWeight: 500 }}></th>
                {WEEKS.map(w => <th key={w} style={{ fontSize: 10, color: "var(--text-soft)", fontWeight: 500, textAlign: "center", padding: "2px 3px" }}>{w}</th>)}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(sym => (
                <tr key={sym}>
                  <td style={{ fontSize: 12, color: "var(--text-mid)", textAlign: "right", paddingRight: 8, whiteSpace: "nowrap" }}>{sym}</td>
                  {WEEKS.map(w => (
                    <td key={w} style={{ textAlign: "center", padding: 2 }}>
                      <span style={{ display: "inline-block", width: 26, height: 26, borderRadius: 6, background: getColor(grid[sym][w]), transition: "transform 0.15s", cursor: "default" }} title={`${sym}: ${grid[sym][w]||0}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SymptomCycleChart({ data }) {
  const topSymptoms = ["Fatigue","Cramps","Mood Swings","Headache","Bloating"];
  const colors = ["#C9768A","#9B59B6","#3498DB","#E67E22","#27AE60"];
  const phases = ["Menstrual", "Follicular", "Ovulation", "Luteal"];
const chartData = phases.map(phase => {
  const row = { phase };
  topSymptoms.forEach(s => { row[s] = 0; });
  return row;
});
if (!data || data.length === 0) {
  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-body" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>Symptoms by Cycle Phase</div>
        <div style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 14 }}>Top symptoms grouped by phase</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-soft)", fontSize: 13 }}>
          Log symptoms and cycle data to see phase analysis.
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-body" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>Symptoms by Cycle Phase</div>
        <div style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 14 }}>Top symptoms grouped by phase</div>
        <div style={{ flex: 1, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,136,152,0.15)" vertical={false} />
              <XAxis dataKey="phase" tick={{ fontSize: 11, fill: "#A08898" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A08898" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, background: "var(--white)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {topSymptoms.map((s, i) => <Bar key={s} dataKey={s} stackId="a" fill={colors[i]} maxBarSize={60} radius={i === topSymptoms.length - 1 ? [4,4,0,0] : [0,0,0,0]} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── DASHBOARD ──────────────────────────────────── */
function Dashboard({ user }) {
  const [stats, setStats] = useState({ symptoms_logged: 0, cycle_days: 28, reports: 0, flags: 0 });
  const [insights, setInsights] = useState([]);
  const [recent, setRecent]   = useState([]);
  const [flags, setFlags]     = useState([]);
  const [reports, setReports] = useState([]);
  const [cycles, setCycles]   = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const token = localStorage.getItem("token");
 
const exportPDF = async () => {
  const element = document.getElementById("report-area");

  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2, // better quality
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

  pdf.save("HerBalance_Report.pdf");
};

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    fetch(API + "/api/dashboard", { headers: h })
      .then(async r => { if (r.status === 401) { localStorage.clear(); window.location.reload(); } return r.json(); })
      .then(d => { if (d.stats) setStats(d.stats); if (d.recent_symptoms) setRecent(d.recent_symptoms); if (d.flags) setFlags(d.flags); })
      .catch(() => {
        setStats({ symptoms_logged: 12, cycle_days: 28, reports: 3, flags: 2 });
        setRecent([{ date: "2025-01-10", symptoms: "Fatigue, Headache", intensity: 3 }, { date: "2025-01-09", symptoms: "Cramps, Bloating", intensity: 4 }]);
        setFlags([{ type: "warning", title: "Irregular Cycle Detected", desc: "Your last cycle was 38 days. Normal is 21–35 days." }, { type: "info", title: "Hemoglobin Below Threshold", desc: "Last reported Hb: 10.2 g/dL. Consider consulting your doctor." }]);
      });
    fetch(API + "/api/reports",  { headers: h }).then(r => r.json()).then(d => setReports(d.reports   || [])).catch(() => {});
    fetch(API + "/api/cycle",    { headers: h }).then(r => r.json()).then(d => setCycles(d.cycles     || [])).catch(() => {});
    fetch(API + "/api/symptoms", { headers: h }).then(r => r.json()).then(d => setSymptoms(d.symptoms || [])).catch(() => {});
  }, []);

  const hemoglobinData = reports.map(r => ({ date: r.test_date, value: r.hemoglobin }));
  const cycleData      = cycles.map(c  => ({ date: c.last_period_date, cycle_length: c.cycle_length }));
  useEffect(() => {
    if (!token) return;

    fetch(API + "/api/reports", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setReports(data.reports || []))
      .catch(() => setReports([]));
  }, [token]);
  const statData = [
    { label: "Symptoms Logged",  value: stats.symptoms_logged,    bg: "#FBF0F3", icon: "clipboard", iconColor: "var(--rose)" },
    { label: "Avg Cycle Length", value: `${stats.cycle_days}d`,   bg: "#EFF6F1", icon: "moon",      iconColor: "var(--sage)" },
    { label: "Lab Reports",      value: stats.reports,            bg: "#F5F0EB", icon: "flask",     iconColor: "var(--sand)" },
    { label: "Health Flags",     value: stats.flags,              bg: "#FBF0F3", icon: "flag",      iconColor: "var(--rose)" },
  ];

  return (
    <div className="animate-fade-up">
      <div className="hero-banner">
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 8 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="display display-lg" style={{ color: "white", marginBottom: 6 }}>Hello, {user?.name?.split(" ")[0] || "there"}.</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 300, maxWidth: 420 }}>Your health, tracked with care. Here's a summary of what we know so far.</p>
        </div>
      </div>

      <div className="stat-grid">
        {statData.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: s.bg }}><Icon name={s.icon} size={17} color={s.iconColor} /></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div id="report-area">

  {/* 🧾 HEADER */}
  <div className="report-header">
    <h1>HerBalance Health Report</h1>
    <p>Date: {new Date().toLocaleDateString()}</p>
  </div>

  {/* 📊 STATS */}
  <div className="report-section">
    <h2>Summary</h2>
    <div className="stats-row">
      <p>Symptoms Logged: {stats.symptoms_logged}</p>
      <p>Avg Cycle Length: {stats.cycle_days} days</p>
      <p>Reports: {stats.reports}</p>
    </div>
  </div>

  {/* 📈 CHARTS */}
  <div className="report-section">
    <h2>Health Trends</h2>

    <HemoglobinChart data={hemoglobinData} />
    <CycleLengthChart data={cycleData} />
    <SymptomHeatmap data={symptoms} />
    <SymptomCycleChart data={symptoms} />
  </div>

  {/* 🧠 INSIGHTS */}
  <div className="report-section">
    <h2>Insights</h2>

    {flags.length === 0 ? (
  <p style={{ color: "var(--text-soft)", fontSize: 13 }}>No health flags detected.</p>
) : flags.map((f, i) => (
  <div key={i} style={{ marginBottom: 8, fontSize: 13, padding: "10px 14px", background: "var(--rose-pale)", borderRadius: 8 }}>
    <strong>{f.condition}:</strong> {f.reason}
  </div>
))}
  </div>

</div>
<button className="btn btn-primary" onClick={exportPDF}>
  Download Report
</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18, minHeight: 300 }}>
        <HemoglobinChart data={hemoglobinData} />
        <CycleLengthChart data={cycleData} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24, minHeight: 320 }}>
        <SymptomHeatmap data={symptoms} />
        <SymptomCycleChart data={symptoms} />
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-body">
            <p className="section-label">Health Flags</p>
            <p className="display display-sm mb20" style={{ fontWeight: 400 }}>What to watch</p>
            {flags.length === 0 ? (
              <div className="flag-card flag-good"><Icon name="check" size={17} color="var(--sage)" /><div><p style={{ fontSize: 14, fontWeight: 500, color: "#3d6647", marginBottom: 3 }}>No concerns detected</p><p style={{ fontSize: 13, color: "var(--text-soft)" }}>Keep logging for better insights.</p></div></div>
            ) : flags.map((f, i) => (
              <div key={i} className={`flag-card ${f.type === "warning" ? "flag-warn" : f.type === "danger" ? "flag-danger" : "flag-info"}`}>
                <Icon name={f.type === "info" ? "info" : "alert"} size={16} color={f.type === "warning" ? "#D4954A" : f.type === "danger" ? "#C05555" : "var(--rose)"} />
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 3 }}>{f.title}</p>
                  <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="section-label">Recent Activity</p>
            <p className="display display-sm mb20" style={{ fontWeight: 400 }}>Symptom log</p>
            {recent.length === 0 ? <p style={{ fontSize: 13.5, color: "var(--text-soft)" }}>No symptoms logged yet.</p>
              : recent.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: i < recent.length - 1 ? "1px solid var(--cream)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 3 }}>{r.symptoms || r.symptom}</div>
                    <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{r.date}</div>
                  </div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[1,2,3,4,5].map(n => <div key={n} style={{ width: 7, height: 7, borderRadius: 2, background: n <= r.intensity ? "var(--rose)" : "var(--cream-dark)" }} />)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── SYMPTOM LOG ─────────────────────────────────── */
const SYMPTOMS = [
  "Fatigue", "Headache", "Cramps", "Bloating", "Mood Swings",
  "Acne", "Hair Loss", "Irregular Period", "Heavy Bleeding", "Hot Flashes",
  "Night Sweats", "Insomnia", "Anxiety", "Brain Fog", "Joint Pain",
  "Nausea", "Breast Tenderness", "Weight Gain",
];

function SymptomLog({ showToast }) {
  const [bodyLocation, setBodyLocation] = useState("");
const [timeOfDay, setTimeOfDay] = useState("");
  const [selected, setSelected] = useState([]);
  const [intensity, setIntensity] = useState(3);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(API + "/api/symptoms", { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        
  if (r.status === 401) {
    localStorage.clear();
    window.location.reload();
    return;
  }
  return r.json();
})
      .then(d => setHistory(d.symptoms || []))
      .catch(() => setHistory([
        { id: 1, date: "2025-01-10", symptoms: "Fatigue, Headache", intensity: 3, notes: "Stressful week" },
        { id: 2, date: "2025-01-09", symptoms: "Cramps, Bloating", intensity: 4, notes: "" },
      ]));
  }, []);

  const toggle = s => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleSubmit = async () => {
    if (!selected.length) { showToast("Select at least one symptom.", "warn"); return; }
    setLoading(true);
    try {
      const res = await fetch(API + "/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
  date,
  symptoms: selected.join(", "),
  intensity,
  notes,
  body_location: bodyLocation,
  time_of_day: timeOfDay
})
      });
      if (res.ok) {
        showToast("Symptoms saved.");
        setHistory(p => [{ date, symptoms: selected.join(", "), intensity, notes, id: Date.now() }, ...p]);
        setSelected([]); setNotes("");
      }
    } catch { showToast("Saved in demo mode (backend offline).", "warn"); }
    setLoading(false);
  };

  const labels = ["", "Very mild", "Mild", "Moderate", "Severe", "Very severe"];

  return (
    <div className="animate-fade-up">
      <p className="page-title">Symptom Tracker</p>
      <p className="page-sub">Log how you are feeling today, honestly and without judgment.</p>

      <div className="g2">
        <div className="card">
          <div className="card-body">
            <p className="section-label mb12">Today's entry</p>

            <div className="mb16">
              <label className="field-label">Date</label>
              <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div className="mb20">
              <label className="field-label">Symptoms</label>
              <div className="tag-grid">
                {SYMPTOMS.map(s => (
                  <button key={s} className={`sym-tag ${selected.includes(s) ? "on" : ""}`} onClick={() => toggle(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb20">
              <label className="field-label">Intensity — {labels[intensity]}</label>
              <div className="intensity-row">
                {[1,2,3,4,5].map(n => (
                  <button key={n} className={`int-btn ${intensity === n ? "on" : ""}`} onClick={() => setIntensity(n)}>{n}</button>
                ))}
              </div>
            </div>

            <div className="mb24">
              <label className="field-label">Notes</label>
              <textarea className="input" rows={3} placeholder="Any additional context..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
<select onChange={(e) => setBodyLocation(e.target.value)}>
  <option value="">Select Body Location</option>
  <option value="Head">Head</option>
  <option value="Abdomen">Abdomen</option>
  <option value="Back">Back</option>
</select>

<select onChange={(e) => setTimeOfDay(e.target.value)}>
  <option value="">Time of Day</option>
  <option value="Morning">Morning</option>
  <option value="Afternoon">Afternoon</option>
  <option value="Evening">Evening</option>
</select>
            <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <p className="section-label mb12">History</p>
            <p className="display display-sm mb20" style={{ fontWeight: 400 }}>Past entries</p>
            {history.length === 0 && <p style={{ fontSize: 13.5, color: "var(--text-soft)" }}>No entries yet.</p>}
            {history.map((h, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: i < history.length - 1 ? "1px solid var(--cream)" : "none" }}>
                <div className="flex-between mb8">
                  <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{h.date}</span>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} style={{ width: 7, height: 7, borderRadius: 2, background: n <= h.intensity ? "var(--rose)" : "var(--cream-dark)" }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(h.symptoms || "").split(", ").map(s => <span key={s} className="badge badge-rose">{s}</span>)}
                </div>
                {h.notes && <p style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 6, fontStyle: "italic" }}>{h.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── CYCLE TRACKER ──────────────────────────────── */
function CycleTracker({ showToast }) {
  const [form, setForm] = useState({ last_period_date: "", cycle_length: 28, period_duration: 5, flow: "moderate", notes: "" });
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(API + "/api/cycle", { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
  if (r.status === 401) {
    localStorage.clear();
    window.location.reload();
    return;
  }
  return r.json();
})
      .then(d => setHistory(d.cycles || []))
      .catch(() => setHistory([
        { last_period_date: "2025-01-01", cycle_length: 28, period_duration: 5, flow: "moderate" },
        { last_period_date: "2024-12-04", cycle_length: 26, period_duration: 4, flow: "heavy" },
      ]));
  }, []);

  const predictNext = (date, len) => {
  if (!date) return null;  // 🛑 FIX 1

  const d = new Date(date);

  if (isNaN(d)) return null;  // 🛑 FIX 2

  d.setDate(d.getDate() + parseInt(len || 0));
  return d.toISOString().slice(0, 10);
};

  const handleSubmit = async () => {
  if (!form.last_period_date) {
    showToast("Please select a date first", "warn");
    return;
  }

  const res = await fetch(API + "/api/cycle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(form),
  }).catch(() => null);

  if (res?.ok) showToast("Cycle logged.");
  else showToast("Demo mode — backend offline.", "warn");

  setHistory(p => [form, ...p]);
};

  const nextPeriod = history.length > 0 
  ? predictNext(history[0].last_period_date, history[0].cycle_length) 
  : null;
  const daysUntil = nextPeriod ? Math.max(0, Math.ceil((new Date(nextPeriod) - new Date()) / 86400000)) : null;
  const flowMap = { light: { bg: "var(--sage-pale)", color: "#4a7a54" }, moderate: { bg: "var(--rose-pale)", color: "var(--rose-deep)" }, heavy: { bg: "#FDE8E8", color: "#8B2020" } };

  return (
    <div className="animate-fade-up">
      <p className="page-title">Cycle Tracker</p>
      <p className="page-sub">Monitor your menstrual cycle, predict upcoming dates, and spot patterns.</p>

      {nextPeriod && (
        <div className="cycle-predict">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--text-soft)", marginBottom: 8 }}>
              Next Period Predicted
            </p>
            <p className="display display-md" style={{ color: "var(--rose-deep)", marginBottom: 4 }}>{nextPeriod}</p>
            <p style={{ fontSize: 13.5, color: "var(--text-soft)" }}>
              Based on your last logged cycle of {history[0]?.cycle_length} days
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="display" style={{ fontSize: 56, color: "var(--rose)", lineHeight: 1 }}>{daysUntil}</div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--text-soft)", marginTop: 4 }}>days away</div>
          </div>
        </div>
      )}

      <div className="g2">
        <div className="card">
          <div className="card-body">
            <p className="section-label mb12">Log a cycle</p>

            <div className="mb16">
              <label className="field-label">Last Period Start Date</label>
              <input className="input" type="date" value={form.last_period_date} onChange={e => setForm(f => ({ ...f, last_period_date: e.target.value }))} />
            </div>

            <div className="g2 mb16" style={{ gap: 12 }}>
              <div>
                <label className="field-label">Cycle Length (days)</label>
                <input className="input" type="number" min={18} max={45} value={form.cycle_length} onChange={e => setForm(f => ({ ...f, cycle_length: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Duration (days)</label>
                <input className="input" type="number" min={1} max={10} value={form.period_duration} onChange={e => setForm(f => ({ ...f, period_duration: e.target.value }))} />
              </div>
            </div>

            <div className="mb16">
              <label className="field-label">Flow</label>
              <select className="input" value={form.flow} onChange={e => setForm(f => ({ ...f, flow: e.target.value }))}>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>

            <div className="mb24">
              <label className="field-label">Notes</label>
              <textarea className="input" rows={2} placeholder="Observations, feelings..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            <button className="btn btn-primary btn-full" onClick={handleSubmit}>Save Cycle</button>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <p className="section-label mb12">Cycle history</p>
            <p className="display display-sm mb20" style={{ fontWeight: 400 }}>Past cycles</p>
            {history.map((h, i) => (
              <div key={i} className="flex-between" style={{ padding: "13px 0", borderBottom: i < history.length - 1 ? "1px solid var(--cream)" : "none" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{h.last_period_date}</p>
                  <p style={{ fontSize: 12, color: "var(--text-soft)" }}>
                    {h.cycle_length} day cycle &bull; {h.period_duration} day period
                  </p>
                </div>
                <span className="badge" style={{ background: flowMap[h.flow]?.bg || "var(--rose-pale)", color: flowMap[h.flow]?.color || "var(--rose-deep)" }}>
                  {h.flow}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── LAB REPORTS ─────────────────────────────────── */
const LAB = [
  { key: "hemoglobin",   label: "Hemoglobin",   unit: "g/dL",   min: 12,  max: 16  },
  { key: "tsh",          label: "TSH",           unit: "mIU/L",  min: 0.4, max: 4   },
  { key: "t3",           label: "T3",            unit: "ng/dL",  min: 80,  max: 200 },
  { key: "t4",           label: "T4",            unit: "µg/dL",  min: 5,   max: 12  },
  { key: "ferritin",     label: "Ferritin",      unit: "ng/mL",  min: 12,  max: 150 },
  { key: "vitamin_d",    label: "Vitamin D",     unit: "ng/mL",  min: 30,  max: 100 },
  { key: "testosterone", label: "Testosterone",  unit: "ng/dL",  min: 15,  max: 70  },
  { key: "lh",           label: "LH",            unit: "mIU/mL", min: 2,   max: 15  },
  { key: "fsh",          label: "FSH",           unit: "mIU/mL", min: 3,   max: 20  },
];

function LabReports({ showToast }) {
  const [form, setForm] = useState({ test_date: new Date().toISOString().slice(0, 10) });
  const [reports, setReports] = useState([]);
  const token = localStorage.getItem("token");

  const status = (key, val) => {
    const p = LAB.find(l => l.key === key);
    if (!p || !val) return null;
    const v = parseFloat(val);
    if (v < p.min) return "low";
    if (v > p.max) return "high";
    return "normal";
  };

  const handleSubmit = async () => {
    const res = await fetch(API + "/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    }).catch(() => null);
    if (res?.ok) showToast("Lab report saved.");
    else showToast("Demo mode — backend offline.", "warn");
    setReports(p => [form, ...p]);
  };

  return (
    <div className="animate-fade-up">
      <p className="page-title">Lab Reports</p>
      <p className="page-sub">Enter values from your blood tests. We'll flag anything outside normal range.</p>

      <div className="card mb24">
        <div className="card-body">
          <p className="section-label mb12">Add results</p>

          <div className="mb20">
            <label className="field-label">Test Date</label>
            <input className="input" type="date" value={form.test_date} onChange={e => setForm(f => ({ ...f, test_date: e.target.value }))} style={{ maxWidth: 220 }} />
          </div>

          <div className="g3 mb24">
            {LAB.map(p => {
              const s = status(p.key, form[p.key]);
              return (
                <div key={p.key}>
                  <label className="field-label">{p.label} <span style={{ opacity: 0.6, textTransform: "none", letterSpacing: 0 }}>({p.unit})</span></label>
                  <input
                    className="input"
                    type="number" step="0.1"
                    placeholder={`${p.min}–${p.max}`}
                    value={form[p.key] || ""}
                    onChange={e => setForm(f => ({ ...f, [p.key]: e.target.value }))}
                    style={s === "low" || s === "high" ? { borderColor: "var(--rose-light)" } : s === "normal" ? { borderColor: "var(--sage-light)" } : {}}
                  />
                  {form[p.key] && (
                    <p style={{ fontSize: 11, marginTop: 4, color: s === "normal" ? "#4a7a54" : "var(--rose-deep)" }}>
                      {s === "normal" ? "Within normal range" : `${s === "low" ? "Below" : "Above"} normal`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button className="btn btn-primary" onClick={handleSubmit}>Save Report</button>
        </div>
      </div>

      {reports.length > 0 && (
        <div className="card">
          <div className="card-body">
            <p className="section-label mb16">Report history</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    {LAB.filter(p => reports.some(r => r[p.key])).map(p => <th key={p.key}>{p.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{r.test_date}</td>
                      {LAB.filter(p => reports.some(r => r[p.key])).map(p => {
                        const s = status(p.key, r[p.key]);
                        return (
                          <td key={p.key}>
                            {r[p.key] != null ? (
                              <span className={`badge ${s === "normal" ? "badge-sage" : s ? "badge-danger" : "badge-sand"}`}>
                                {r[p.key]}
                              </span>
                            ) : <span style={{ color: "var(--text-soft)" }}>—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── HEALTH FLAGS ────────────────────────────────── */
function HealthFlags() {
  const [flags, setFlags] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(API + "/api/health-flags", { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
  if (r.status === 401) {
    localStorage.clear();
    window.location.reload();
    return;
  }
  return r.json();
})
      .then(d => setFlags(d.flags || []))
      .catch(() => setFlags([]));
  }, []);

  const levelStyle = {
    danger:  { bg: "#FDF5F5", border: "#C05555", label: "badge-danger", iconName: "alert", iconColor: "#C05555" },
    warning: { bg: "#FEFBF3", border: "#D4954A", label: "badge-warn",   iconName: "alert", iconColor: "#D4954A" },
    info:    { bg: "var(--rose-pale)", border: "var(--rose)", label: "badge-rose", iconName: "info", iconColor: "var(--rose)" },
    good:    { bg: "var(--sage-pale)", border: "var(--sage)", label: "badge-sage", iconName: "check", iconColor: "var(--sage)" },
  };

  return (
    <div className="animate-fade-up">
      <p className="page-title">Health Flags</p>
      <p className="page-sub">Rule-based indicators derived from your logged data. Always consult a professional.</p>

      <div className="notice notice-sage mb28">
        These flags are generated from predefined health logic and are intended for awareness only — not diagnosis. Please consult a qualified healthcare professional for any medical concern.
      </div>

      {flags === null ? (
        <p style={{ color: "var(--text-soft)" }}>Analysing your data...</p>
      ) : flags.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: "60px 40px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--sage-pale)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Icon name="check" size={24} color="var(--sage)" />
            </div>
            <p className="display display-md" style={{ color: "#3d6647", marginBottom: 8 }}>All clear</p>
            <p style={{ fontSize: 14, color: "var(--text-soft)" }}>No health concerns detected from your current data. Keep logging regularly.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {flags.map((f, i) => {
            const s = levelStyle[f.level] || levelStyle.info;
            return (
              <div key={i} className="card animate-fade-up" style={{ animationDelay: `${i * 0.1}s`, borderLeft: `4px solid ${s.border}` }}>
                <div className="card-body">
                  <div className="flex-between mb12">
                    <div className="flex-center gap10">
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name={s.iconName} size={17} color={s.iconColor} />
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 500 }}>{f.condition}</p>
                    </div>
                    <span className={`badge ${s.label}`}>{f.level}</span>
                  </div>
                  <div className="divider" style={{ margin: "0 0 14px" }} />
                  <p style={{ fontSize: 13.5, color: "var(--text-mid)", marginBottom: 8, lineHeight: 1.6 }}>
                    <strong style={{ color: "var(--text)" }}>Why:</strong> {f.reason}
                  </p>
                  <p style={{ fontSize: 13.5, color: "var(--text-mid)", lineHeight: 1.6 }}>
                    <strong style={{ color: "var(--text)" }}>What to do:</strong> {f.action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────── PROFILE ───────────────────────────────────── */
function Profile({ user, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", age: user?.age || "", conditions: user?.conditions || "" });

  return (
    <div className="animate-fade-up" style={{ maxWidth: 560 }}>
      <p className="page-title">Profile</p>
      <p className="page-sub">Your account and personal health information.</p>

      <div className="card">
        <div className="card-body">
          <div className="flex-center gap16 mb24">
            <div className="avatar avatar-lg">{(user?.name || "U")[0].toUpperCase()}</div>
            <div>
              <p className="display display-sm" style={{ fontWeight: 400, marginBottom: 3 }}>{user?.name}</p>
              <p style={{ fontSize: 13, color: "var(--text-soft)" }}>{user?.email}</p>
            </div>
          </div>

          <div className="divider" />

          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
              <div>
                <label className="field-label">Full Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Age</label>
                <input className="input" type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Known Conditions</label>
                <input className="input" value={form.conditions} onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))} placeholder="e.g. PCOS, Thyroid" />
              </div>
              <div className="flex gap10 mt8">
                <button className="btn btn-primary" onClick={() => setEditing(false)}>Save Changes</button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              {[["Age", user?.age || "Not set"], ["Known Conditions", user?.conditions || "None listed"], ["Member Since", new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })]].map(([k, v]) => (
                <div key={k} className="flex-between" style={{ padding: "13px 0", borderBottom: "1px solid var(--cream)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-soft)" }}>{k}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div className="flex gap10 mt20">
                <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
                <button className="btn btn-secondary" onClick={onLogout}>
                  <Icon name="logout" size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── SHELL / APP ─────────────────────────────────── */

const NAV = [
  { id: "dashboard", label: "Overview",      icon: "home" },
  { id: "symptoms",  label: "Symptoms",      icon: "clipboard" },
  { id: "cycle",     label: "Cycle",         icon: "moon" },
  { id: "labs",      label: "Lab Reports",   icon: "flask" },
  { id: "flags",     label: "Health Flags",  icon: "flag" },
  { id: "profile",   label: "Profile",       icon: "user" },
];

export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
const [bodyLocation, setBodyLocation] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };
  


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };
  const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"
  );
  useEffect(() => {
  document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);
  
  useEffect(() => {
  if (darkMode) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}, [darkMode]);

  if (!user) return <AuthPage onLogin={u => setUser(u)} darkMode={darkMode} />;

  const pages = {
    dashboard: <Dashboard user={user} />,
    symptoms:  <SymptomLog showToast={showToast} />,
    cycle:     <CycleTracker showToast={showToast} />,
    labs:      <LabReports showToast={showToast} />,
    flags:     <HealthFlags />,
    profile:   <Profile user={user} onLogout={handleLogout} />,
  };

  return (
    <>
      <GlobalStyles />
      <div className="app-shell">
        {/* Topbar */}
        <header className="topbar">
          <Logo darkMode={darkMode} />
          <div className="flex-center gap12">
            <button onClick={() => setDarkMode(d => !d)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--cream-dark)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Icon name={darkMode ? "sun" : "moon"} size={15} color="var(--text-mid)" />
            </button>
            <span style={{ fontSize: 13, color: "var(--text-soft)" }}>{user?.name}</span>
            <div className="avatar">{(user?.name || "U")[0].toUpperCase()}</div>
          </div>
        </header>


        <div className="body-area">
          {/* Sidebar */}
          <aside className="sidebar">
            <p className="nav-section-label">Menu</p>
            {NAV.map(n => (
              <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
                  <Icon name={n.icon} size={18} color="currentColor" />
                </svg>
                {n.label}
              </button>
            ))}

            <div style={{ marginTop: "auto", paddingTop: 28 }}>
              <div style={{ background: "linear-gradient(135deg, var(--rose-pale), var(--sage-pale))", borderRadius: "18px", padding: "16px", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-deep)", marginBottom: 5 }}>Tip</p>
                <p style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.6 }}>Log your cycle for 3+ months to unlock pattern insights.</p>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="page-area">
            {pages[page] || pages.dashboard}
          </main>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type === "warn" ? "warn" : ""}`}>
          <Icon name={toast.type === "warn" ? "alert" : "check"} size={16} color={toast.type === "warn" ? "#D4954A" : "var(--sage)"} />
          {toast.msg}
        </div>
      )}
    </>
  );
}


