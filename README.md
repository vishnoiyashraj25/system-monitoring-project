# 🖥️ System Monitoring Project

This project consists of:
- ✅ A lightweight system daemon (`utility.py`) that reports machine health  
- 🌐 A backend API to collect and serve data  
- 📊 A frontend dashboard to visualize machine state  

## 🚀 Features
- Periodic system checks (disk encryption, OS, antivirus)  
- Reports only when state changes  
- Minimal CPU usage  
- CSV export  
- Issue filter and OS dropdown  

## 🏗️ Tech Stack
- **Frontend**: React  
- **Backend**: Express (Node.js)  
- **Daemon**: Python  
- **Database**: JSON file (or in-memory)  

## 📦 Setup Instructions

```bash
# Clone the repository
git clone https://github.com/vishnoiyashraj25/system-monitoring-project.git
cd system-monitoring-project

# Start Backend
cd backend-server
npm install
node index.js

# Start Frontend
cd admin-dashboard
cd frontend-admin
npm install
npm start

# Run Python Daemon
cd client-utility
pip install -r requirements.txt
python utility.py
