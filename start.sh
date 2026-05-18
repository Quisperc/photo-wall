#!/bin/bash

# 照片墙启动脚本

echo "🚀 启动照片墙应用..."
echo ""

# 启动后端服务
echo "📦 启动后端服务 (Rust + Axum)..."
cd backend
RUST_LOG=info ./target/release/photo-wall-backend &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端开发服务器
echo "⚛️ 启动前端服务 (React + Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✨ 服务已启动!"
echo "📍 后端 API: http://localhost:8080"
echo "🌐 前端界面: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
