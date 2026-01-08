import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import AppRoutes from '@/routes';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="autorecon-theme">
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
