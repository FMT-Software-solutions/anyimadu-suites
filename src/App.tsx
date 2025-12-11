import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Suites from './pages/Suites';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import { AdminPage } from './pages/AdminPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLogin } from '@/pages/AdminLogin';
import { AdminReset } from '@/pages/AdminReset';
import { CreateSuperAdmin } from '@/pages/CreateSuperAdmin';
import { AdminChangePassword } from '@/pages/AdminChangePassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="suites" element={<Suites />} />
          <Route path="contact" element={<Contact />} />
          <Route path="/booking/:suiteId" element={<Booking />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset" element={<AdminReset />} />
        <Route
          path="/admin/create-super-admin"
          element={<CreateSuperAdmin />}
        />
        <Route
          path="/admin/change-password"
          element={<AdminChangePassword />}
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
