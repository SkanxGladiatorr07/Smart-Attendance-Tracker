# AttendAI - Smart Attendance Tracker

AttendAI is an AI-powered attendance tracking system designed for real-time monitoring, analytics, and automated attendance logging.

## Project Architecture

```text
Smart Attendance Tracker/
├── client/          # React + Vite Frontend
│   ├── src/
│   │   ├── api/        # Axios API instances & service functions
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application views
│   │   ├── App.jsx     # Main React component
│   │   └── main.jsx    # React entry point
│   └── vite.config.js
│
├── server/          # Express.js Backend API
│   ├── src/
│   │   ├── config/     # Environment & DB configurations
│   │   ├── controllers/# Business logic & API request handlers
│   │   ├── middlewares/# Express middleware (CORS, errors, auth)
│   │   ├── routes/     # Express routers (/api/health, etc.)
│   │   ├── app.js      # App middleware setup & route binding
│   │   └── server.js   # Server entry point
│   └── package.json
│
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Setup Backend (`server`)

```bash
cd server
npm install
npm run dev
```
The server starts at `http://localhost:5000`.

### 2. Setup Frontend (`client`)

```bash
cd client
npm install
npm run dev
```
The frontend starts at `http://localhost:5173`.

## API Endpoints

- `GET /api/health` - Health check & server diagnostics status endpoint.

## License

MIT
