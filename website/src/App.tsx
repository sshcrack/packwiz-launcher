import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import IndexPage from './pages';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<IndexPage />} />
      </Route>
    </Routes>
  );
}

export default App;
