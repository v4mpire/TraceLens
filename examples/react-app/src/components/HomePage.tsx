import React, { useState, useEffect } from 'react';
import { getTracer } from '../tracelens-setup';

interface HomePageProps {
  onButtonClick: (buttonName: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onButtonClick }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const tracer = getTracer();

  useEffect(() => {
    // Track page view
    tracer?.track('page-view', {
      page: 'home',
      timestamp: Date.now(),
      referrer: document.referrer
    });
  }, [tracer]);

  const fetchData = async () => {
    setLoading(true);
    onButtonClick('fetch-data');

    try {
      // Simulate API call
      const startTime = performance.now();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const endTime = performance.now();
      const mockData = [
        { id: 1, name: 'Item 1', value: Math.random() * 100 },
        { id: 2, name: 'Item 2', value: Math.random() * 100 },
        { id: 3, name: 'Item 3', value: Math.random() * 100 }
      ];

      setData(mockData);

      // Track API call performance
      tracer?.track('api-call', {
        endpoint: '/api/data',
        duration: endTime - startTime,
        success: true,
        itemCount: mockData.length,
        timestamp: Date.now()
      });

    } catch (error) {
      tracer?.track('api-error', {
        endpoint: '/api/data',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = (interactionType: string) => {
    onButtonClick(interactionType);
    
    tracer?.track('user-interaction', {
      type: interactionType,
      page: 'home',
      timestamp: Date.now()
    });
  };

  return (
    <div className="page">
      <h2>Home Page</h2>
      <p>This page demonstrates basic TraceLens tracking functionality.</p>

      <div className="actions">
        <button 
          onClick={fetchData} 
          disabled={loading}
          className="action-button"
        >
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>

        <button 
          onClick={() => handleInteraction('like')}
          className="action-button"
        >
          👍 Like
        </button>

        <button 
          onClick={() => handleInteraction('share')}
          className="action-button"
        >
          📤 Share
        </button>
      </div>

      {data.length > 0 && (
        <div className="data-display">
          <h3>Fetched Data:</h3>
          <ul>
            {data.map(item => (
              <li key={item.id}>
                {item.name}: {item.value.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="info-box">
        <h4>TraceLens Events Being Tracked:</h4>
        <ul>
          <li>Page view on component mount</li>
          <li>Button clicks with interaction tracking</li>
          <li>API call performance and success/failure</li>
          <li>User interactions (like, share)</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
