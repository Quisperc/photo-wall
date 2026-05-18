import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Image, Trash2, Eye, EyeOff } from 'lucide-react';
import { Photo, fetchAllPhotos, deletePhoto, updatePhotoVisibility } from '../api/photos';
import PhotoGrid from '../components/PhotoGrid';

const Admin: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllPhotos();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这张照片吗？')) return;
    
    try {
      await deletePhoto(id);
      setPhotos(photos.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete photo:', error);
      alert('删除失败');
    }
  };

  const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
    try {
      await updatePhotoVisibility(id, !currentVisibility);
      setPhotos(photos.map(p => 
        p.id === id ? { ...p, is_public: !currentVisibility } : p
      ));
    } catch (error) {
      console.error('Failed to update visibility:', error);
      alert('更新失败');
    }
  };

  const UploadForm = React.lazy(() => import('../components/UploadForm'));
  const UrlInput = React.lazy(() => import('../components/UrlInput'));

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-heading font-bold">管理面板</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="btn-primary flex items-center gap-2"
            >
              <span>{showUploadForm ? '收起' : '上传照片'}</span>
            </button>
          </div>

          {showUploadForm && (
            <React.Suspense fallback={<div className="text-center py-8">加载中...</div>}>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <UploadForm onUploadSuccess={() => {
                  loadPhotos();
                  setShowUploadForm(false);
                }} />
                <UrlInput onAddSuccess={() => {
                  loadPhotos();
                  setShowUploadForm(false);
                }} />
              </div>
            </React.Suspense>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-heading font-semibold mb-4">
            所有照片 ({photos.length})
          </h2>
        </div>

        <PhotoGrid photos={photos} isLoading={isLoading} />

        {!isLoading && photos.length > 0 && (
          <div className="mt-12 glass-card p-6">
            <h3 className="text-lg font-heading font-semibold mb-4">照片管理</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium text-text/60">预览</th>
                    <th className="text-left py-3 px-4 font-medium text-text/60">文件名</th>
                    <th className="text-left py-3 px-4 font-medium text-text/60">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-text/60">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {photos.map((photo) => (
                    <tr key={photo.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <img
                          src={photo.url}
                          alt={photo.filename}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{photo.filename}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            photo.is_public
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {photo.is_public ? (
                            <>
                              <Eye className="w-3 h-3" /> 公开
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> 私密
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleVisibility(photo.id, photo.is_public)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title={photo.is_public ? '设为私密' : '设为公开'}
                          >
                            {photo.is_public ? (
                              <EyeOff className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(photo.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
