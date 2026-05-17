# 照片墙应用技术架构文档

## 1. 架构设计

```
┌─────────────────────────────────────────────────────┐
│                    前端 (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  PhotoGrid  │  │  UploadForm │  │  AdminPanel │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└────────────────────────┬──────────────────────────────┘
                        │ HTTP API (JSON)
                        ▼
┌─────────────────────────────────────────────────────┐
│                  后端 (Rust + Axum)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Routes    │  │  Handlers  │  │   Services  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└────────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              数据层 (SQLite + Local FS)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Photos    │  │   Uploads  │  │   Config    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 2. 技术栈

- **前端框架**：React 18 + TypeScript + Vite
- **样式方案**：Tailwind CSS
- **后端框架**：Rust + Axum
- **数据库**：SQLite（轻量级，适合MVP）
- **文件存储**：本地文件系统（uploads/目录）
- **API格式**：RESTful JSON API

## 3. 路由定义

### 3.1 前端路由
| 路由 | 页面 | 权限 |
|------|------|------|
| `/` | 照片墙首页（公开） | 所有人 |
| `/admin` | 管理面板 | 仅管理员 |

### 3.2 后端API路由
| 方法 | 路由 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/photos` | 获取公开照片列表 | 公开 |
| POST | `/api/photos/upload` | 上传本地图片 | 管理员 |
| POST | `/api/photos/url` | 通过URL添加图片 | 管理员 |
| DELETE | `/api/photos/:id` | 删除照片 | 管理员 |
| PATCH | `/api/photos/:id/visibility` | 切换公开状态 | 管理员 |
| GET | `/uploads/:filename` | 获取上传的图片文件 | 公开 |

## 4. API 定义

### 4.1 GET /api/photos
**响应**：
```typescript
{
  photos: Array<{
    id: number;
    filename: string;
    url: string;
    isPublic: boolean;
    createdAt: string;
  }>;
}
```

### 4.2 POST /api/photos/upload
**请求**：multipart/form-data
```
- file: 图片文件
```

**响应**：
```typescript
{
  id: number;
  filename: string;
  url: string;
}
```

### 4.3 POST /api/photos/url
**请求**：
```typescript
{
  url: string;  // 图片URL
}
```

**响应**：
```typescript
{
  id: number;
  url: string;
  sourceUrl: string;
}
```

### 4.4 DELETE /api/photos/:id
**响应**：
```typescript
{
  success: boolean;
  message: string;
}
```

### 4.5 PATCH /api/photos/:id/visibility
**请求**：
```typescript
{
  isPublic: boolean;
}
```

**响应**：
```typescript
{
  id: number;
  isPublic: boolean;
}
```

## 5. 数据模型

### 5.1 Photo 表
```sql
CREATE TABLE photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    source_url TEXT,           -- 外部URL（本地文件为NULL）
    storage_path TEXT NOT NULL, -- 存储路径
    is_public BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photos_is_public ON photos(is_public);
CREATE INDEX idx_photos_created_at ON photos(created_at);
```

## 6. 项目结构

```
photo-wall/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── PhotoGrid.tsx
│   │   │   ├── PhotoCard.tsx
│   │   │   ├── UploadForm.tsx
│   │   │   ├── UrlInput.tsx
│   │   │   └── Lightbox.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── Admin.tsx
│   │   ├── api/
│   │   │   └── photos.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
├── backend/                  # Rust后端
│   ├── src/
│   │   ├── main.rs
│   │   ├── routes/
│   │   │   └── photos.rs
│   │   ├── handlers/
│   │   │   └── photo_handlers.rs
│   │   ├── models/
│   │   │   └── photo.rs
│   │   └── db.rs
│   ├── Cargo.toml
│   └── uploads/              # 图片存储目录
├── SPEC.md
└── README.md
```

## 7. MVP 功能清单

### 7.1 核心功能
- ✅ 照片墙首页展示公开照片
- ✅ 本地文件上传
- ✅ URL链接导入
- ✅ 照片灯箱查看
- ✅ 管理员面板（简单权限控制）
- ✅ 照片公开/私密切换
- ✅ 照片删除

### 7.2 非MVP功能（后续迭代）
- ❌ 用户登录注册
- ❌ 照片分类/标签
- ❌ 评论功能
- ❌ 社交分享

## 8. 性能优化

- 图片懒加载（Intersection Observer）
- 响应式图片尺寸
- SQLite索引优化查询
- 简单的JWT认证（可选）
