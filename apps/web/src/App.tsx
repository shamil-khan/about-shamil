import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  ViewableCVPage,
  PrintableCVPage,
  SystemAdminPage,
  UserAdminPage,
} from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<ViewableCVPage />} />
        <Route path='/print' element={<PrintableCVPage />} />
        <Route path='/system-admin' element={<SystemAdminPage />} />
        <Route path='/user-admin' element={<UserAdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
