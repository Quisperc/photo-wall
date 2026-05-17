const API_BASE = '';

export interface Photo {
  id: number;
  filename: string;
  url: string;
  source_url: string | null;
  is_public: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

export const fetchPublicPhotos = async (): Promise<Photo[]> => {
  const response = await fetch(`${API_BASE}/api/photos`);
  const data: ApiResponse<Photo[]> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to fetch photos');
  }
  return data.data;
};

export const fetchAllPhotos = async (): Promise<Photo[]> => {
  const response = await fetch(`${API_BASE}/api/photos/all`);
  const data: ApiResponse<Photo[]> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to fetch photos');
  }
  return data.data;
};

export const uploadPhoto = async (file: File): Promise<Photo> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/photos/upload`, {
    method: 'POST',
    body: formData,
  });

  const data: ApiResponse<Photo> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to upload photo');
  }
  return data.data;
};

export const addPhotoFromUrl = async (url: string): Promise<Photo> => {
  const response = await fetch(`${API_BASE}/api/photos/url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const data: ApiResponse<Photo> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to add photo from URL');
  }
  return data.data;
};

export const deletePhoto = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/photos/${id}`, {
    method: 'DELETE',
  });

  const data: ApiResponse<null> = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete photo');
  }
};

export const updatePhotoVisibility = async (id: number, isPublic: boolean): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/photos/${id}/visibility`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_public: isPublic }),
  });

  const data: ApiResponse<null> = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to update photo visibility');
  }
};
