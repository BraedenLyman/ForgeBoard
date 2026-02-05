import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Loading, Error, Modal, Input, Table } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    status: 'active',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.projects.getAll();
      setProjects(data);
    } catch (err) {
      setError(err.error?.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await api.clients.getAll();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.projects.create(formData);
      setIsModalOpen(false);
      setFormData({ clientId: '', title: '', description: '', status: 'active' });
      loadProjects();
    } catch (err) {
      setError(err.error?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      try {
        await api.projects.delete(id);
        loadProjects();
      } catch (err) {
        setError(err.error?.message || 'Failed to delete project');
      }
    }
  };

  if (isLoading) return <Loading />;

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'clientId',
      label: 'Client',
      render: (row) => row.clientId?.name || 'N/A',
    },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/app/projects/${row._id}`)}
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
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <span className="flex items-center"><Plus className="w-4 h-4 mr-2" />New Project</span>
        </Button>
      </div>

      {error && <Error message={error} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Client</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Button type="submit" className="w-full">
            Create Project
          </Button>
        </form>
      </Modal>

      <Card>
        <Table columns={columns} data={projects} />
      </Card>
    </div>
  );
};
