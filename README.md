# 🏢 HRMS Lite — Employee Attendance Management System

A lightweight HR Management System for tracking employees and their daily attendance. Built with a React frontend and a Django REST Framework backend backed by PostgreSQL.

---

## 📌 Project Overview

HRMS Lite provides two core modules:

- **Employees** — Add, search, and delete employee records
- **Attendance** — Mark, view, filter, and edit daily attendance (Present / Absent)

The interface features a dark-sidebar layout with real-time stats cards, modal forms with validation, and color-coded status badges.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (custom design system) |
| HTTP Client | Axios |
| Backend | Django 5.1 + Django REST Framework 3.15 |
| Database | PostgreSQL (via `psycopg2-binary`) |
| CORS | `django-cors-headers` |

---

## 🚀 Steps to Run Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL installed and running

### 1. Create the PostgreSQL Database

```sql
-- Run in psql or pgAdmin
CREATE DATABASE hrms_db;
```

### 2. Backend Setup

```powershell
cd employee-attendance\backend

# Install Python dependencies
pip install -r requirements.txt

# Update DB credentials if needed
# Edit hrms/settings.py → DATABASES block

# Apply migrations (creates all tables)
python manage.py migrate

# Start the API server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

### 3. Frontend Setup

```powershell
cd employee-attendance\frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

> Make sure the backend server is running before opening the frontend.

---

## 📡 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/employees/` | List all employees |
| `POST` | `/api/employees/` | Create a new employee |
| `DELETE` | `/api/employees/{id}/` | Delete an employee |
| `GET` | `/api/attendance/` | List all attendance records |
| `GET` | `/api/attendance/?employee={id}&date={date}` | Filter attendance |
| `POST` | `/api/attendance/` | Mark attendance |
| `PUT` | `/api/attendance/{id}/` | Update attendance status |

---

## ⚠️ Assumptions & Limitations

- **Authentication** — There is no login/auth system. The API is open to any origin (`CORS_ALLOW_ALL_ORIGINS = True`). This is suitable for local development only; production deployments should add authentication and restrict CORS.
- **Single attendance per day** — Each employee can only have one attendance record per date (enforced at both DB and API level).
- **No data export** — There is no CSV/Excel export feature in the current version.
- **Date range** — The date picker is capped at today's date; future dates cannot be marked.
- **Secret key** — The `SECRET_KEY` in `settings.py` is a placeholder. Replace it with a strong random key before any production use.
- **Database credentials** — PostgreSQL credentials are stored in plain text in `settings.py`. Use environment variables or a `.env` file for production.
