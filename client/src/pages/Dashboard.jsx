import { useEffect, useState } from 'react';
import { Card, Loading, Error } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, FileText, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, invoicesData, leadsData] = await Promise.all([
          api.projects.getAll(),
          api.invoices.getAll(),
          api.leads.getAll(),
        ]);
        setProjects(projectsData);
        setInvoices(invoicesData);
        setLeads(leadsData);
      } catch (err) {
        setError(err.error?.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) return <Loading />;

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.totalCents, 0);
  const pendingInvoices = invoices.filter((i) => i.status !== 'paid').length;
  const wonLeads = leads.filter((l) => l.stage === 'won').length;

  // Generate chart data from invoices
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Get current year
  const currentYear = new Date().getFullYear();
  // Initialize revenue per month
  const revenueByMonth = Array(12).fill(0);
  invoices.filter(i => i.status === 'paid').forEach(inv => {
    const date = new Date(inv.paidDate || inv.issueDate);
    if (date.getFullYear() === currentYear) {
      revenueByMonth[date.getMonth()] += inv.totalCents;
    }
  });
  const chartData = monthNames.map((month, idx) => ({
    month,
    revenue: Number((revenueByMonth[idx] / 100).toFixed(2)),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {error && <Error message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600">Active Projects</p>
              <p className="text-3xl font-bold">{activeProjects}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600">Total Revenue</p>
              <p className="text-3xl font-bold">${(totalRevenue / 100).toFixed(0)}</p>
            </div>
            <FileText className="w-12 h-12 text-green-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600">Pending Invoices</p>
              <p className="text-3xl font-bold">{pendingInvoices}</p>
            </div>
            <Clock className="w-12 h-12 text-orange-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600">Deals Won</p>
              <p className="text-3xl font-bold">{wonLeads}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-purple-500" />
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <h2 className="text-xl font-bold mb-4">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-4">Recent Projects</h2>
          <div className="space-y-2">
            {projects.slice(0, 5).map((p) => (
              <div key={p._id} className="flex justify-between items-center p-2 hover:bg-slate-50">
                <span className="font-medium">{p.title}</span>
                <span className="text-sm text-slate-500">{p.status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Recent Invoices</h2>
          <div className="space-y-2">
            {invoices.slice(0, 5).map((i) => (
              <div key={i._id} className="flex justify-between items-center p-2 hover:bg-slate-50">
                <span className="font-medium">{i.number}</span>
                <span className="text-sm text-slate-500">${(i.totalCents / 100).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
