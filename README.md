# 照片墙应用 (Photo Wall)

一个现代化的照片墙应用，支持本地文件上传和 URL 导入。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Rust + Axum
- **数据库**: SQLite
- **样式**: 深色玻璃拟态设计 (Glassmorphism)

## 功能特性

- ✅ 照片墙首页展示公开照片
- ✅ 本地文件上传
- ✅ URL 链接导入图片
- ✅ 照片灯箱查看大图
- ✅ 管理员面板
- ✅ 照片公开/私密切换
- ✅ 响应式设计

## 快速开始

### 1. 安装依赖

前端依赖：
```bash
cd frontend
npm install
```

### 2. 启动后端服务

```bash
cd backend
cargo run --release
```

后端将在 http://localhost:8080 启动

### 3. 启动前端开发服务器

```bash
cd frontend
npm run dev
```

前端将在 http://localhost:3000 启动

### 4. 使用应用

- 访问 http://localhost:3000 查看公开照片墙
- 点击右上角"管理"进入管理面板
- 在管理面板可以：
  - 上传本地照片
  - 通过 URL 添加照片
  - 管理照片的公开/私密状态
  - 删除照片

## 项目结构

```
photo-wall/
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/       # UI 组件
│   │   ├── pages/            # 页面组件
│   │   ├── api/              # API 调用
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Rust 后端
│   ├── src/
│   │   ├── main.rs           # 主程序
│   │   ├── handlers/         # 请求处理器
│   │   ├── models/           # 数据模型
│   │   └── db.rs             # 数据库操作
│   ├── Cargo.toml
│   └── uploads/              # 图片存储目录
└── start.sh                  # 启动脚本
```

## API 端点

| 方法   | 路径                        | 描述           | 权限 |
|--------|-----------------------------|----------------|------|
| GET    | `/api/photos`              | 获取公开照片列表 | 公开 |
| GET    | `/api/photos/all`          | 获取所有照片    | 管理员 |
| POST   | `/api/photos/upload`       | 上传本地图片    | 管理员 |
| POST   | `/api/photos/url`          | 通过 URL 添加   | 管理员 |
| DELETE | `/api/photos/:id`          | 删除照片       | 管理员 |
| PATCH  | `/api/photos/:id/visibility` | 切换公开状态   | 管理员 |

## 环境变量

后端支持以下环境变量：

- `PORT`: 服务器端口 (默认: 8080)
- `DATABASE_URL`: 数据库路径 (默认: photo_wall.db)
- `UPLOADS_DIR`: 图片存储目录 (默认: uploads)

## 设计风格

- **主题**: 深色玻璃拟态 (Dark Glassmorphism)
- **主色**: `#6366f1` (靛蓝色)
- **次色**: `#8b5cf6` (紫罗兰)
- **强调色**: `#f472b6` (粉红色)
- **背景**: `#0f0f23` (深蓝黑)

## 许可证

MIT License
