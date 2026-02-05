import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute.jsx';

// Pages
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Leads } from './pages/Leads.jsx';
import { Clients } from './pages/Clients.jsx';
import { ClientDetail } from './pages/ClientDetail.jsx';
import { Projects } from './pages/Projects.jsx';
import { ProjectDetail } from './pages/ProjectDetail.jsx';
import { Invoices } from './pages/Invoices.jsx';
import { InvoiceDetail } from './pages/InvoiceDetail.jsx';
import { Settings } from './pages/Settings.jsx';
import { TimeLogs } from './pages/TimeLogs.jsx';

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/leads"
            element={
              <ProtectedRoute>
                <Leads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/clients/:id"
            element={
              <ProtectedRoute>
                <ClientDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/invoices"
            element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/invoices/:id"
            element={
              <ProtectedRoute>
                <InvoiceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/timelogs"
            element={
              <ProtectedRoute>
                <TimeLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
