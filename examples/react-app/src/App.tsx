import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getTracer } from './tracelens-setup';
import HomePage from './components/HomePage';
import SlowPage from './components/SlowPage';
import ErrorPage from './components/ErrorPage';
import './App.css';

function App() {
  const [isTracking, setIsTracking] = useState(false);
  const navigate = useNavigate();
  const tracer = getTracer();

  useEffect(() => {
    setIsTracking(tracer?.isRunning() || false);
  }, [tracer]);

  const handleNavigation = (path: string, pageName: string) => {
    // Track navigation events
    tracer?.track('navigation', {
      from: window.location.pathname,
      to: path,
      pageName,
      timestamp: Date.now()
    });

    navigate(path);
  };

  const handleButtonClick = (buttonName: string) => {
    tracer?.track('button-click', {
      buttonName,
      page: window.location.pathname,
      timestamp: Date.now()
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TraceLens React Example</h1>
        <div className="status">
          Status: <span className={isTracking ? 'tracking' : 'not-tracking'}>
            {isTracking ? 'Tracking Active' : 'Not Tracking'}
          </span>
        </div>
      </header>

      <nav className="app-nav">
        <button 
          onClick={() => handleNavigation('/', 'Home')}
          className="nav-button"
        >
          Home
        </button>
        <button 
          onClick={() => handleNavigation('/slow', 'Slow Page')}
          className="nav-button"
        >
          Slow Page
        </button>
        <button 
          onClick={() => handleNavigation('/error', 'Error Page')}
          className="nav-button"
        >
          Error Page
        </button>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage onButtonClick={handleButtonClick} />} />
          <Route path="/slow" element={<SlowPage onButtonClick={handleButtonClick} />} />
          <Route path="/error" element={<ErrorPage onButtonClick={handleButtonClick} />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>This example demonstrates TraceLens browser SDK integration</p>
        <p>Check the browser console and network tab to see TraceLens in action</p>
      </footer>
    </div>
  );
}

export default App;
