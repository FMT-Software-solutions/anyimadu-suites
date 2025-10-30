import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Suites from './pages/Suites';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import { AdminPage } from './pages/AdminPage';

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
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
