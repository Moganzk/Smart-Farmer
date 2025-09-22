# Smart-Farmer
🌱 AI-Driven Crop Disease Detection & Advisory System

📌 Overview

This project is a mobile-first system that helps Kenyan farmers detect crop diseases using AI APIs. It supports offline + online modes, ensures accessibility in rural areas, and now includes farmer collaboration features and admin analytics for smarter agricultural decision-making.

The app empowers:

👩🏾‍🌾 Farmers: Diagnose crop diseases, get treatment advice, store history offline, and chat with fellow farmers in groups.

👨🏽‍💻 Admins: Manage crop disease/advisory content, analyze farmer activity, and manage users & groups.



---

⚙️ Tech Stack

Frontend (Mobile App)

React Native (Expo) → Cross-platform mobile app

SQLite → Offline farmer data + disease history


Backend (API + Admin)

Node.js (Express) OR Python (FastAPI) → REST API

PostgreSQL → Core database (diseases, users, groups, messages, analytics)

Role separation: Farmers vs. Admins


External AI APIs

Google Vision API (Gemini) → Image-based disease analysis

Groq API → Knowledge/advisory responses



---

🗂️ Workspace Structure
backend folder
    -separated roles
frontend folder
    -separated roles
docs folder
flowchart images folder
database folder
.env file
README.md file
Roadmap.md file
folder structure.md file

---

🛠️ Roles & Responsibilities

👩🏾‍🌾 Farmer Role

Capture leaf photo → send to Gemini API.

Get disease detection + Groq advisory.

Store results offline in SQLite.

Join/create farmer groups.

Chat with other farmers.

Search for farmer groups by crop/disease.


👨🏽‍💻 Admin Role

Manage disease/advisory database (PostgreSQL).

Manage farmer + admin accounts.

Moderate farmer groups and chats.

Analyze farmer app usage:

of active users.

Most common diseases detected.

Regional adoption rates.


Generate reports from PostgreSQL queries.



---

📅 Development Roadmap

Phase 1: Setup project skeleton (frontend + backend + DB models).

Phase 2: Farmer features (capture → detect → advice + history).

Phase 3: Admin features (DB management + analytics dashboard).

Phase 4: Farmer collaboration (chat + groups).

Phase 5: Offline/online polish, testing, final docs.



---

🔑 Notes

Only SQLite (offline) + PostgreSQL (backend).

No hosting required — project runs locally.

Gemini API for images, Groq API for knowledge.

Every folder has its own README.md.

Admin analytics powered by PostgreSQL queries, not fancy dashboards.
