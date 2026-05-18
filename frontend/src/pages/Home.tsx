import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from 'lucide-react';

const Home: React.FC = () => {
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
      </main>
    </div>
  );
};

export default Home;
