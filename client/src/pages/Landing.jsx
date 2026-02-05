import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/UI.jsx';
import { TrendingUp, Zap, BarChart3, Clock } from 'lucide-react';
import iconLogo from '../assets/forgeboardicontrans.png';

export const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) navigate('/app');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="flex justify-center">
            <img src={iconLogo} alt="ForgeBoard" className="h-[170px] sm:h-[200px] w-auto max-w-full" />
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Freelancer Success Starts Here
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8">
            Track leads, manage projects, log time, and send invoices all in one simple platform.
          </p>
          <Button onClick={() => navigate('/register')} className="px-6 py-3 text-base sm:text-lg sm:px-8 w-full sm:w-auto">
            Get Started Free
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20">
          <div className="bg-white rounded-lg p-5 sm:p-6 shadow">
            <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-3 sm:mb-4" />
            <h3 className="font-bold mb-2">Lead Pipeline</h3>
            <p className="text-slate-600">Track leads from initial contact to won deals</p>
          </div>
          <div className="bg-white rounded-lg p-5 sm:p-6 shadow">
            <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-3 sm:mb-4" />
            <h3 className="font-bold mb-2">Project Management</h3>
            <p className="text-slate-600">Organize tasks, milestones, and deliverables</p>
          </div>
          <div className="bg-white rounded-lg p-5 sm:p-6 shadow">
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-3 sm:mb-4" />
            <h3 className="font-bold mb-2">Time Tracking</h3>
            <p className="text-slate-600">Log hours and calculate billable time</p>
          </div>
          <div className="bg-white rounded-lg p-5 sm:p-6 shadow">
            <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-3 sm:mb-4" />
            <h3 className="font-bold mb-2">Invoicing</h3>
            <p className="text-slate-600">Generate and export professional invoices</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 sm:p-10 lg:p-12 shadow text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Ready to grow your freelance business?
          </h2>
          <p className="text-slate-600 mb-5 sm:mb-6">
            Join hundreds of freelancers using ForgeBoard
          </p>
          <Button onClick={() => navigate('/register')} className="px-4 py-3 sm:px-8 w-full sm:w-auto">
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};
