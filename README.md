# 🗳️ Online Voting System (OVS)

A secure, real-time online voting platform designed for transparency and integrity. This system allows authenticated users to cast votes securely, with live results broadcasted to a central dashboard.

## 🌟 Key Features
- **Secure Authentication:** JWT-based login and registration.
- **Voter Anonymity:** Architectural separation of voter identity and ballot data.
- **Real-time Results:** Live tallying using WebSockets.
- **Double-Voting Prevention:** Server-side checks to ensure one vote per user.

## 🛠️ Tech Stack
- **Frontend:** React.js (Vite)
- **Backend:** FastAPI (Python)
- **Database:** SQLAlchemy (ORM) + SQLite
- **Auth:** JWT (JSON Web Tokens)

---

## 👥 Team & Roles
| Role | Responsibility | Primary Tech |
| :--- | :--- | :--- |
| **Frontend Lead** | UI/UX, Ballot Forms, Live Charts | React.js, Tailwind CSS |
| **Backend Lead** | DB Schema, API Routes, CRUD Logic | FastAPI, SQLAlchemy |
| **Security Lead** | JWT Auth, Input Validation, Encryption | Pydantic, Passlib |

---

## 📂 Project Structure
```text
OVS/
├── frontend/             # React application (Vite)
└── backend/              # FastAPI server
    ├── routers/          # API endpoint logic
    ├── models.py         # SQLAlchemy database tables
    ├── schemas.py        # Pydantic data validation
    ├── crud.py           # Database operations
    └── database.py       # Engine & Session setup

🚀 Getting Started
1. Backend Setup
Bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

2. Frontend Setup
Bash
cd frontend
npm install
npm run dev

📜 Development Workflow
Pull latest changes from main.

Create a feature branch: git checkout -b feature/your-task.

Commit often with clear messages.

Push and open a Pull Request for team review.
