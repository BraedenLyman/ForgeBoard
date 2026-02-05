import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Loading, Error, Modal, Input, Table } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const Clients = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await api.clients.getAll();
      setClients(data);
    } catch (err) {
      setError(err.error?.message || 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await api.clients.create(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', company: '', notes: '' });
      loadClients();
    } catch (err) {
      setError(err.error?.message || 'Failed to create client');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this client?')) {
      try {
        await api.clients.delete(id);
        loadClients();
      } catch (err) {
        setError(err.error?.message || 'Failed to delete client');
      }
    }
  };

  if (isLoading) return <Loading />;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'company', label: 'Company' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/app/clients/${row._id}`)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Client
        </Button>
      </div>

      {error && <Error message={error} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Client">
        <form onSubmit={handleCreateClient}>
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <Button type="submit" className="w-full">
            Create Client
          </Button>
        </form>
      </Modal>

      <Card>
        <Table columns={columns} data={clients} />
      </Card>
    </div>
  );
};
