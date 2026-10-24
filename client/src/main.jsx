import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/AuthContext';
import { App } from './App';
import './index.css';

// Shared providers make routing, login state, and cached API requests available to every page.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
</React.StrictMode>);



