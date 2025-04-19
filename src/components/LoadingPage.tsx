import React, { useEffect, useState } from 'react';
import '../styles/loading.css';

const LoadingPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-container">
          <div className="loading-bar"></div>
          <p className="loading-text">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingPage;
