import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PricePredict from './pages/PricePredict';
import ShopFinder from './pages/ShopFinder';
import ShopDetail from './pages/ShopDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<PricePredict />} />
          <Route path="/shops" element={<ShopFinder />} />
          <Route path="/shop/:id" element={<ShopDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' },
            success: { iconTheme: { primary: 'var(--secondary)', secondary: 'white' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: 'white' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
