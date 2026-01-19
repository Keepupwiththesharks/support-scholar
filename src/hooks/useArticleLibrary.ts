import { useState, useCallback, useEffect } from 'react';
import { SavedArticle } from '@/types';

const STORAGE_KEY = 'recap-article-library';

export const useArticleLibrary = () => {
  const [articles, setArticles] = useState<SavedArticle[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const articlesWithDates = parsed.map((a: SavedArticle) => ({
          ...a,
          createdAt: new Date(a.createdAt),
        }));
        setArticles(articlesWithDates);
      } catch (e) {
        console.error('Failed to parse stored articles:', e);
      }
    }
  }, []);

  // Save to localStorage whenever articles change
  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    }
  }, [articles]);

  const saveArticle = useCallback((article: SavedArticle) => {
    setArticles(prev => {
      const newArticles = [article, ...prev];
      return newArticles;
    });
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setArticles(prev => {
      const newArticles = prev.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newArticles));
      return newArticles;
    });
  }, []);

  const getArticlesBySession = useCallback((sessionId: string) => {
    return articles.filter(a => a.sessionId === sessionId);
  }, [articles]);

  return {
    articles,
    allArticles: articles,
    saveArticle,
    deleteArticle,
    getArticlesBySession,
  };
};
