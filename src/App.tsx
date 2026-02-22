import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

function App() {
  const [count, setCount] = useState(0);
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className='flex justify-end p-4 gap-2'>
        <button
          onClick={() => setTheme('light')}
          className={theme === 'light' ? 'border-brand' : ''}>
          ☀️
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? 'border-brand' : ''}>
          🌙
        </button>
        <button
          onClick={() => setTheme('system')}
          className={theme === 'system' ? 'border-brand' : ''}>
          💻
        </button>
      </div>

      <div className='card'>
        <h1 className='text-brand'>Vite + React Compiler</h1>
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
        <p className='mt-4 text-gray-500'>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App;
