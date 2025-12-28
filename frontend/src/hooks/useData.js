import { useState, useEffect } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:11451";

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

        // console.log("API : ", API_BASE_URL);
        // console.log("所有的環境變數:", import.meta.env);

        const response = await fetch(`${API_BASE_URL}/api/data`, {
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
