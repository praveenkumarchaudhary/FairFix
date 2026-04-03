import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import PricePredict from './pages/PricePredict';
import ShopFinder from './pages/ShopFinder';
import ShopDetail from './pages/ShopDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Complaints from './pages/Complaints';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <main style={{ position: 'relative', zIndex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/predict" element={<PricePredict />} />
              <Route path="/shops" element={<ShopFinder />} />
              <Route path="/shop/:id" element={<ShopDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/complaints" element={<Complaints />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--card-solid)',
                color: 'var(--text)',
                border: '1px solid var(--border2)',
                borderRadius: '12px',
                fontSize: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: 'white' } },
            }}
          />
          <ChatBot />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
