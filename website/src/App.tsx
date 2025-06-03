import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import IndexPage from './pages';
import GuidePage from './pages/guide';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
