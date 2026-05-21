import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ItemCreatePage from './pages/ItemCreatePage';
import MyPage from './pages/MyPage';
import ItemEditPage from './pages/ItemEditPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/items/new" element={
            <ProtectedRoute><ItemCreatePage /></ProtectedRoute>
          } />
          <Route path="/items/:id/edit" element={
            <ProtectedRoute><ItemEditPage /></ProtectedRoute>
          } />
          <Route path="/my" element={
            <ProtectedRoute><MyPage /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
