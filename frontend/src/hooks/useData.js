import { useState, useEffect } from "react";

import { API_BASE } from '../utils/api';
export { API_BASE };

/**
 * Custom hook to fetch and cache data from backend API
 * Data is stored in backend/data/NewData.json and served via API
 * This ensures we only have one source of truth - all data comes from backend API
 */
export function useData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "無法載入資料");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
