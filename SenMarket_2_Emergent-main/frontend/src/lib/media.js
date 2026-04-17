export const getMediaUrl = (path) => {
  if (!path || typeof path !== 'string') return '';

  // URL complète externe (Unsplash, etc.)
  if (path.startsWith('http')) return path;

  const baseUrl = process.env.REACT_APP_BACKEND_URL || '';

  // Nouveau format GridFS
  if (path.startsWith('/api/media/')) {
    return baseUrl ? `${baseUrl}${path}` : path;
  }

  // Ancien format local /uploads/
  if (path.startsWith('/uploads/')) {
    return baseUrl ? `${baseUrl}${path}` : path;
  }

  // ID brut GridFS (sans slash)
  if (path.length > 20 && !path.includes('/')) {
    return baseUrl ? `${baseUrl}/api/media/${path}` : `/api/media/${path}`;
  }

  return path;
};
