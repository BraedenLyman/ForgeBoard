import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from './UI.jsx';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.png';

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
    <nav className="bg-white shadow-sm sm:shadow sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 sm:py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <Link to="/" className="flex items-center gap-2 text-center sm:text-left">
            <img src={logo} alt="ForgeBoard" className="h-[48px] sm:h-[56px] w-auto max-w-full" />
          </Link>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')} className="w-full sm:w-auto">
              Login
            </Button>
            <Button onClick={() => navigate('/register')} className="w-full sm:w-auto">Sign Up</Button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm sm:shadow sticky top-0 z-50">
      <div className="container mx-auto px-4 py-5 sm:py-4">
        <div className="flex justify-between items-center">
          <Link to="/app" className="flex items-center gap-2">
            <img src={logo} alt="ForgeBoard" className="h-12 sm:h-14 w-auto max-w-full" />
          </Link>

          <button className="md:hidden p-2 -mr-2 rounded-lg bg-slate-100 text-slate-700" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>

          <div className={`${isOpen ? 'block' : 'hidden'} md:flex md:gap-4 absolute md:static top-16 left-0 right-0 md:top-auto bg-white md:bg-transparent p-6 md:p-0 shadow-md md:shadow-none border-b md:border-b-0`}>
            <Link to="/app" onClick={() => setIsOpen(false)} className="block md:inline text-slate-600 hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/app/leads" onClick={() => setIsOpen(false)} className="block md:inline text-slate-600 hover:text-blue-600">
              Leads
            </Link>
            <Link to="/app/clients" onClick={() => setIsOpen(false)} className="block md:inline text-slate-600 hover:text-blue-600">
              Clients
            </Link>
            <Link to="/app/projects" onClick={() => setIsOpen(false)} className="block md:inline text-slate-600 hover:text-blue-600">
              Projects
            </Link>
            <Link to="/app/timelogs" onClick={() => setIsOpen(false)} className="block md:inline text-slate-600 hover:text-blue-600">
              Time Logs
            </Link>
            <Link to="/app/invoices" onClick={() => setIsOpen(false)} className="block md:inline text-slate-600 hover:text-blue-600">
              Invoices
            </Link>
            <Link to="/app/settings" onClick={() => setIsOpen(false)} className="block md:inline text-slate-600 hover:text-blue-600">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
