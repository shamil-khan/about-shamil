import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  CVPrintPage_Main,
  DashboardPage_Main,
  SystemAdminPage,
  UserAdminPage,
} from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<DashboardPage_Main />} />
        <Route path='/print' element={<CVPrintPage_Main />} />
        <Route path='/system-admin' element={<SystemAdminPage />} />
        <Route path='/user-admin' element={<UserAdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
