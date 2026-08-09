#!/bin/bash

# Santali Pro Max - One-Click Deployment Script
echo "🚀 Starting Santali Pro Max Deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build the application
echo "🏗️ Building the frontend..."
npm run build

# 3. Check environment
if [ ! -f ".env" ]; then
    echo "⚠️ .env file not found. Please ensure GEMINI_API_KEY is set in your environment."
fi

# 4. Start the server
echo "⚡ Starting server..."
npm run dev
