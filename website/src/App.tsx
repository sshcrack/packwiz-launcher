import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import React, { Suspense } from 'react';

const LazyIndexPage = React.lazy(() => import('./pages'));
const LazyGuide = React.lazy(() => import('./pages/guide'));

// Loading spinner component
const LoadingSpinner = ({ pageName = "Page" }: { pageName?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-900/50 dark:to-blue-900/50 rounded-lg">
      <div className="mt-8 text-center">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Loading {pageName}</h3>
        <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
          <span className="animate-pulse">●</span>
          <span className="animate-pulse-delay-1">●</span>
          <span className="animate-pulse-delay-2">●</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-md">
          {pageName === "Guide"
            ? "Preparing the comprehensive modpack creation guide for you..."
            : "Loading the modpack installer generator..."}
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<LoadingSpinner pageName="Home Page" />}>
              <LazyIndexPage />
            </Suspense>
          } />
          <Route path="/guide" element={
            <Suspense fallback={<LoadingSpinner pageName="Guide" />}>
              <LazyGuide />
            </Suspense>
          } />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
