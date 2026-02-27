import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ViewableCVPage, PrintableCVPage } from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<ViewableCVPage />} />
        <Route path='/print' element={<PrintableCVPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
