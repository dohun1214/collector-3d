import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ItemCreatePage from './pages/ItemCreatePage';
import MyPage from './pages/MyPage';
import ItemEditPage from './pages/ItemEditPage';
import ProfilePage from './pages/ProfilePage';

function MainLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items/new" element={
          <ProtectedRoute><ItemCreatePage /></ProtectedRoute>
        } />
        <Route path="/items/:id/edit" element={
          <ProtectedRoute><ItemEditPage /></ProtectedRoute>
        } />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/my" element={
          <ProtectedRoute><MyPage /></ProtectedRoute>
        } />
        <Route path="/users/:nickname" element={<ProfilePage />} />

      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth pages use their own full-page layout (no Navbar) */}
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          {/* All other pages include the Navbar */}
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
