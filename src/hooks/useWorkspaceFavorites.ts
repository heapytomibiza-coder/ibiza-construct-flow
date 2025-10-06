import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'admin_workspace_favorites';

export function useWorkspaceFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (workspaceId: string) => {
    setFavorites(prev => 
      prev.includes(workspaceId)
        ? prev.filter(id => id !== workspaceId)
        : [...prev, workspaceId]
    );
  };

  const isFavorite = (workspaceId: string) => favorites.includes(workspaceId);

  return { favorites, toggleFavorite, isFavorite };
}
