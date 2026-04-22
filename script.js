class PhotoWall {
  constructor({ container, imageUrls = [] }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("PhotoWall: container 必须是一个有效的 DOM 元素");
    }
    this.container = container;
    this.imageUrls = imageUrls;
  }

  setImages(imageUrls = []) {
    this.imageUrls = Array.isArray(imageUrls)
      ? imageUrls.filter((url) => this.isSafeImageUrl(url))
      : [];
    this.render();
  }

  isSafeImageUrl(url) {
    if (typeof url !== "string" || !url.trim()) {
      return false;
    }

    if (url.startsWith("data:image/")) {
      return true;
    }

    try {
      const parsed = new URL(url, window.location.href);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  render() {
    if (!this.imageUrls.length) {
      const empty = document.createElement("div");
      empty.className = "photo-wall__empty";
      empty.textContent = "暂无可展示图片";
      this.container.replaceChildren(empty);
      return;
    }

    const gallery = document.createElement("section");
    gallery.className = "photo-wall";

    this.imageUrls.forEach((url, index) => {
      const item = document.createElement("figure");
      item.className = "photo-wall__item";

      const img = document.createElement("img");
      img.className = "photo-wall__image";
      img.loading = "lazy";
      img.src = url;
      img.alt = `照片 ${index + 1}`;

      item.appendChild(img);
      gallery.appendChild(item);
    });

    this.container.replaceChildren(gallery);
  }
}

async function loadPhotoWallConfig(configUrl) {
  const response = await fetch(configUrl);
  if (!response.ok) {
    throw new Error(`配置文件加载失败: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function bootstrap() {
  const root = document.getElementById("photo-wall-root");
  if (!root) {
    console.warn("PhotoWall: 未找到 #photo-wall-root 容器");
    return;
  }
  const photoWall = new PhotoWall({ container: root });

  try {
    const config = await loadPhotoWallConfig("./photo-wall.config.json");
    photoWall.setImages(config.imageUrls);
  } catch (error) {
    photoWall.setImages([]);
    console.error(error);
  }
}

export { PhotoWall, loadPhotoWallConfig, bootstrap };
