import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme/theme';
import './i18n/i18n';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import BookingPage from './pages/BookingPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminSchedulePage from './pages/admin/AdminSchedulePage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';

const PublicLayout = () => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    minHeight: '100vh',
    background: `
      radial-gradient(circle at 10% 20%, rgba(255, 235, 245, 0.9) 0%, transparent 40%),
      radial-gradient(circle at 90% 15%, rgba(225, 225, 255, 0.9) 0%, transparent 45%),
      radial-gradient(circle at 50% 80%, rgba(255, 220, 240, 0.7) 0%, transparent 50%),
      #F9FAFB
    `,
  }}>
    <Header />
    <Box sx={{ flex: 1 }}>
      <Outlet />
    </Box>
    <Footer />
  </Box>
);

// Basic auth guard for admin layout
const ProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return <AdminLayout />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="booking" element={<BookingPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="schedule" element={<AdminSchedulePage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
