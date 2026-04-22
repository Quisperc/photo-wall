# photo-wall

一个可复用的前端照片墙示例组件：通过 JSON 配置传入多个图片 URL，自动渲染为响应式照片墙。

## 文件说明

- `./index.html`：页面入口
- `./styles.css`：照片墙样式
- `./script.js`：可复用组件与配置加载逻辑
- `./main.js`：页面初始化入口
- `./photo-wall.config.json`：图片 URL 配置

## 本地运行

在仓库根目录启动一个静态服务，例如：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`。
