import { useEffect, useState } from 'react';
import { Button, Card, Loading, Error, Modal, Input, Badge } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { Plus } from 'lucide-react';

const stages = ['lead', 'contacted', 'proposal', 'won', 'lost'];

export const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    valueCents: 0,
    source: 'direct',
    notes: '',
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const data = await api.leads.getAll();
      setLeads(data);
    } catch (err) {
      setError(err.error?.message || 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await api.leads.create(formData);
      setIsModalOpen(false);
      setFormData({ title: '', valueCents: 0, source: 'direct', notes: '' });
      loadLeads();
    } catch (err) {
      setError(err.error?.message || 'Failed to create lead');
    }
  };

  const handleStageChange = async (leadId, newStage) => {
    try {
      await api.leads.updateStage(leadId, newStage);
      loadLeads();
    } catch (err) {
      setError(err.error?.message || 'Failed to update lead');
    }
  };

  if (isLoading) return <Loading />;

  const leadsByStage = stages.reduce((acc, stage) => {
    acc[stage] = leads.filter((l) => l.stage === stage);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leads Pipeline</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Lead
        </Button>
      </div>

      {error && <Error message={error} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Lead">
        <form onSubmit={handleCreateLead}>
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Value (cents)"
            type="number"
            value={formData.valueCents}
            onChange={(e) => setFormData({ ...formData, valueCents: parseInt(e.target.value) })}
          />
          <Input
            label="Source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <Button type="submit" className="w-full">
            Create Lead
          </Button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <div key={stage}>
            <h2 className="font-bold text-lg mb-4 capitalize">{stage}</h2>
            <div className="space-y-2">
              {leadsByStage[stage].map((lead) => (
                <Card key={lead._id} className="cursor-pointer hover:shadow-lg transition">
                  <h3 className="font-medium mb-2">{lead.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    ${(lead.valueCents / 100).toFixed(0)}
                  </p>
                  <select
                    className="w-full px-2 py-1 border rounded text-sm"
                    value={stage}
                    onChange={(e) => handleStageChange(lead._id, e.target.value)}
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
