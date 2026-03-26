import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Import from './pages/Import';
import Scripts from './pages/Scripts';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="import" element={<Import />} />
          <Route path="scripts" element={<Scripts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
