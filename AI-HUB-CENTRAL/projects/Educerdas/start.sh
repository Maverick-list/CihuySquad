#!/bin/bash

# EduCerdas AI - Start Script
# Run both frontend and backend servers

echo "🎓 EduCerdas AI - Starting Application..."
echo ""

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📁 Project Directory: $PROJECT_DIR"
echo ""

# Start Frontend Server (Port 8001)
echo "🌐 Starting Frontend Server..."
cd "$PROJECT_DIR" || exit
python3 -m http.server 8001 > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend running on http://localhost:8001 (PID: $FRONTEND_PID)"

# Wait a moment
sleep 2

# Start Backend Server (Port 3000)
echo ""
echo "⚙️  Starting Backend Server..."
npm install > /dev/null 2>&1
npm start > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend running on http://localhost:3000 (PID: $BACKEND_PID)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 EduCerdas AI is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Open your browser and go to: http://localhost:8001"
echo ""
echo "🔧 To stop the servers, press Ctrl+C or run:"
echo "   kill $FRONTEND_PID $BACKEND_PID"
echo ""
echo "📊 Server Logs:"
echo "   Frontend: frontend.log"
echo "   Backend:  backend.log"
echo ""

# Keep the script running
wait
