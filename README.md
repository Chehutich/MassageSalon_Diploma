# 💆 Massage Salon Application

A complete suite for managing a massage salon, including a mobile app for clients and masters, a desktop application for management, and a robust .NET backend with PostgreSQL.

## 🚀 Quick Start (Windows)

The easiest way to get started is to use the automated setup script.

1. **Prerequisites**:
   - [Node.js](https://nodejs.org/) (v20+)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/) 
   - [.NET SDK 10+](https://dotnet.microsoft.com/download) (for backend development)

2. **Run Setup**:
   Double-click `setup-windows.bat` in the root folder. This will:
   - **Dynamic IP**: Detect your local network IP and configure all `.env` files.
   - **Frontend**: Install dependencies and generate the Orval API client.
   - **Desktop**: Install dependencies and generate the Prisma client.
   - **Infrastructure**: Start the Database and Backend automatically via Docker.

## 📁 Project Structure

- `/frontend`: Expo (React Native) mobile application for clients and masters.
- `/desktop`: Electron + Vite + Prisma management application.
- `/backend`: .NET Core Web API for data and business logic.
- `/db-init`: SQL scripts for database initialization and seeding.

## 🛠️ Manual Development Commands

If you prefer to run components manually:

### 📱 Mobile App (Frontend)
```bash
cd frontend
npm install
npm start
```

### 💻 Desktop App
```bash
cd desktop
npm install
npx prisma generate
npm run start
```

### ⚙️ Backend & Database (Infrastructure)
```bash
docker-compose up -d --build
```

## 🌍 Environment Configuration
All services rely on `.env` files. The `setup-windows.bat` creates these automatically from `.env-template`. 

> [!IMPORTANT] 
> The `APP_URL` in `.env` must be your local network IP (e.g., `192.168.1.5`) for physical mobile devices to connect to the backend. The automated setup script detects this for you!
