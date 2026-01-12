#!/bin/bash

# SehatKu AI - HTTP Server Startup Script
# Script ini menjalankan aplikasi dengan HTTP server untuk menghindari CORS issues

echo "🚀 Starting SehatKu AI..."
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 detected"
    echo "📡 Starting HTTP server on http://localhost:8000"
    echo ""
    echo "🌐 Open your browser and navigate to:"
    echo "   http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    cd "$(dirname "$0")/public"
    python3 -m http.server 8000
    
elif command -v python &> /dev/null; then
    echo "✅ Python detected"
    echo "📡 Starting HTTP server on http://localhost:8000"
    echo ""
    echo "🌐 Open your browser and navigate to:"
    echo "   http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    cd "$(dirname "$0")/public"
    python -m SimpleHTTPServer 8000
    
else
    echo "❌ Python not found!"
    echo ""
    echo "Please install Python or use one of these alternatives:"
    echo ""
    echo "1. VS Code Live Server extension"
    echo "2. npx http-server public"
    echo "3. php -S localhost:8000 -t public"
    echo ""
fi
