import { Routes, Route } from 'react-router-dom';
import PublicApp from './PublicApp';
import AdminApp from './admin/AdminApp';

function App() {
  return (
    <Routes>
      {/* Public Site Route */}
      <Route path="/*" element={<PublicApp />} />
      
      {/* Admin Dashboard Route */}
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}

export default App;
