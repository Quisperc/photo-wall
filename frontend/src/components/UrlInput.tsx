import React, { useState } from 'react';
import { Link, Plus } from 'lucide-react';
import { addPhotoFromUrl } from '../api/photos';

interface UrlInputProps {
  onAddSuccess: () => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onAddSuccess }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('请输入图片URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('请输入有效的URL地址');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addPhotoFromUrl(url);
      setUrl('');
      onAddSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
          <Link className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-semibold">通过 URL 添加</h3>
          <p className="text-sm text-text/60">从网络链接导入图片</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              添加中...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              添加图片
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default UrlInput;
