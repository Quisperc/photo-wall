import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Image } from 'lucide-react';
import Admin from './pages/Admin';
import PhotoGrid from './components/PhotoGrid';
import { fetchPublicPhotos, Photo } from './api/photos';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPublicPhotos();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                照片墙
              </h1>
            </div>
            <Link
              to="/admin"
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <span>管理</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            分享你的精彩瞬间
          </h2>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            上传本地照片或通过链接导入，打造属于你的个性化照片墙
          </p>
        </div>

        <Routes>
          <Route path="/" element={
            <>
              <PhotoGrid photos={photos} isLoading={isLoading} />
              <div className="mt-12 text-center">
                <p className="text-text/60 mb-4">想要添加照片？</p>
                <Link to="/admin" className="btn-primary inline-flex items-center gap-2">
                  <span>前往管理面板</span>
                </Link>
              </div>
            </>
          } />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer className="glass mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-text/60 text-sm">
            Photo Wall © 2024 | 使用 React + Rust 构建
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
