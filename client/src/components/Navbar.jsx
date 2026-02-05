import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from './UI.jsx';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return (
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            ForgeBoard
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')}>Sign Up</Button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/app" className="text-2xl font-bold text-blue-600">
            ForgeBoard
          </Link>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>

          <div className={`${isOpen ? 'block' : 'hidden'} md:flex md:gap-4 absolute md:static top-16 left-0 right-0 md:top-auto bg-white md:bg-transparent p-4 md:p-0`}>
            <Link to="/app" className="block md:inline text-slate-600 hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/app/leads" className="block md:inline text-slate-600 hover:text-blue-600">
              Leads
            </Link>
            <Link to="/app/clients" className="block md:inline text-slate-600 hover:text-blue-600">
              Clients
            </Link>
            <Link to="/app/projects" className="block md:inline text-slate-600 hover:text-blue-600">
              Projects
            </Link>
            <Link to="/app/invoices" className="block md:inline text-slate-600 hover:text-blue-600">
              Invoices
            </Link>
            <Link to="/app/settings" className="block md:inline text-slate-600 hover:text-blue-600">
              Settings
            </Link>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
