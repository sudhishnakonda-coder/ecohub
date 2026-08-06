# 🌱 EcoHub - AI Sustainable Farm Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-brightgreen.svg)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-emerald.svg)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://deepmind.google/technologies/gemini/)
[![Vite](https://img.shields.io/badge/Build-Vite-purple.svg)](https://vitejs.dev/)

**EcoHub** (FarmFlow) is a full-stack, AI-powered agricultural SaaS platform designed to empower farmers with smart decision-making tools, sustainable farming practices, machinery rental, cold storage access, and real-time advisory services.

---

## 🚀 Key Features

- 🧠 **AI Agronomist & Advisory Assistant**: Intelligent recommendations powered by Google Gemini AI for crop diagnostics, pest management, soil health, and personalized farming advice.
- 📅 **Smart Crop Calendar**: Interactive schedule for planting, irrigation, fertilization, pest control, and harvest timelines.
- ❄️ **Cold Storage Locator & Booking**: Map-based storage finder powered by Leaflet to locate nearby facilities, check real-time capacity, and reserve slots to minimize post-harvest loss.
- 🚜 **Farm Machinery Marketplace**: Peer-to-peer equipment rental portal to search, compare, and book tractors, harvesters, and specialized farm tools.
- 📊 **Sustainability & Eco-Impact Dashboard**: Real-time analytics tracking carbon reduction, water conservation efficiency, eco-scores, and sustainable practices via interactive Recharts.
- 🌤️ **Live Weather & Microclimate Forecasts**: Hyper-local weather data integration for timely agricultural action.
- 🔔 **Real-Time Notifications**: Smart alert system for critical weather events, task reminders, and booking updates.
- 🔐 **Secure Authentication**: User management with JWT auth and customizable farmer profiles.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Mapping**: Leaflet & React-Leaflet
- **Data Visualization**: Recharts
- **Form Handling**: React Hook Form, Axios, React Router v6

### **Backend**
- **Server**: Node.js & Express.js
- **Authentication**: JSON Web Tokens (JWT), BcryptJS
- **Validation**: Zod

### **Database & AI Services**
- **Database**: Supabase (PostgreSQL) / SQLite
- **AI Integration**: Google Gemini AI (`@google/generative-ai`)
- **APIs**: OpenWeatherMap API

---

## 📂 Project Structure

```
farmflow/
├── client/                  # Frontend Vite + React Application
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, Footer, Modals)
│   │   ├── context/         # Auth and App State Context
│   │   ├── pages/           # Page views (Dashboard, AI Advisor, ColdStorage, Marketplace, etc.)
│   │   ├── services/        # API service modules
│   │   └── App.jsx          # App routing and layout configuration
│   ├── index.html
│   └── tailwind.config.js
│
├── server/                  # Backend Node + Express Application
│   ├── config/              # Supabase & DB configurations
│   ├── controllers/         # Business logic and request handlers
│   ├── database/            # Database scripts and schemas
│   ├── middleware/          # Auth & validation middleware
│   ├── routes/              # Express API endpoints
│   ├── services/            # Gemini AI & Weather external services
│   └── server.js            # Server entry point
│
├── api/                     # Serverless / Vercel API entry points
├── vercel.json              # Vercel deployment configuration
└── package.json             # Root monorepo scripts & dependencies
```

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/sudhishnakonda-coder/ecohub.git
cd ecohub
```

### 2. Install Dependencies
Run the postinstall script from the root directory to install dependencies for both `client` and `server`:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `server` directory based on `server/.env.example`:

```env
PORT=5000
JWT_SECRET=your_custom_jwt_secret
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_google_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

### 4. Seed the Database (Optional)
```bash
npm run seed
```

### 5. Run the Application

Start both the backend server and client concurrently:

#### Backend Server:
```bash
npm run server:dev
```

#### Frontend Client:
```bash
npm run client
```

Access the frontend at `http://localhost:5173` and backend at `http://localhost:5000`.

---

## 🌐 API Routes Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new farmer account |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT |
| `POST` | `/api/advisor/ask` | Send query to Gemini AI Crop Advisor |
| `GET` | `/api/storage` | Fetch nearby cold storage facilities |
| `POST` | `/api/storage/book` | Reserve cold storage slot |
| `GET` | `/api/machinery` | List available machinery for rent |
| `GET` | `/api/calendar` | Retrieve crop calendar schedules |
| `GET` | `/api/sustainability` | Get eco-impact & sustainability metrics |
| `GET` | `/api/weather` | Fetch real-time weather & forecasts |

---

## 🌐 Deployment

The application is optimized for zero-config deployment on **Vercel**.

1. Connect your repository to Vercel.
2. Set Environment Variables in Vercel settings (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.).
3. Deploy! The `vercel.json` handles API routing and static asset building automatically.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
