// Loads a value from localStorage, or returns the default value if it is not found.
export const loadFromLocalStorage = (key: string, defaultValue: unknown) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error(`Error parsing JSON for key "${key}":`, error);
          localStorage.removeItem(key);
        }
      }
    }
    return defaultValue;
  };
  

  // Loads all values from localStorage, or returns the default values if they are not found.
  export const loadAllFromLocalStorage = (config: Record<string, unknown>) => {
    return Object.fromEntries(
      Object.entries(config).map(([key, defaultValue]) => 
        [key, loadFromLocalStorage(key, defaultValue)]
      )
    );
  };
  