import { useState, useEffect } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  // getting stored value
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Error parsing localStorage key:", key, error);
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing value
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}