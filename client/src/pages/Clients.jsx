import { useEffect, useState } from 'react';
import { Button, Card, Loading, Error, Modal, Input, Table, Popover } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { Plus, Edit2, Trash2, Info } from 'lucide-react';

const formatPhone = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const isValidEmail = (value) => {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const Clients = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [editModal, setEditModal] = useState({ open: false, client: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, clientId: null });
  const [infoPopover, setInfoPopover] = useState({ open: false, client: null, anchor: null });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });

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
    if (!isValidEmail(formData.email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    try {
      await api.clients.create(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', company: '', notes: '' });
      setEmailError('');
      setFormError('');
      loadClients();
    } catch (err) {
      setFormError(err.error?.message || 'Failed to create client');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.clients.delete(id);
      setDeleteModal({ open: false, clientId: null });
      loadClients();
    } catch (err) {
      setError(err.error?.message || 'Failed to delete client');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(editModal.client.email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    try {
      await api.clients.update(editModal.client._id, {
        name: editModal.client.name,
        email: editModal.client.email,
        phone: editModal.client.phone,
        company: editModal.client.company,
        notes: editModal.client.notes,
      });
      setEditModal({ open: false, client: null });
      setEmailError('');
      setFormError('');
      loadClients();
    } catch (err) {
      setFormError(err.error?.message || 'Failed to update client');
    }
  };

  if (isLoading) return <Loading />;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => formatPhone(row.phone) || 'N/A',
    },
    { key: 'company', label: 'Company' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2 items-center">
          <button
            ref={el => {
              if (infoPopover.open && infoPopover.client && infoPopover.client._id === row._id) infoPopover.anchor = el;
            }}
            onClick={(e) => setInfoPopover({ open: true, client: row, anchor: e.currentTarget })}
            className="text-slate-500 hover:text-slate-700"
            title="View Info"
            type="button"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditModal({ open: true, client: { ...row, phone: formatPhone(row.phone) } })}
            className="text-blue-600 hover:text-blue-700"
            title="Edit Client"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModal({ open: true, clientId: row._id })}
            className="text-red-600 hover:text-red-700"
            title="Delete Client"
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
          <span className="flex items-center"><Plus className="w-4 h-4 mr-2" />New Client</span>
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
            error={emailError}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({ ...formData, email: value });
              if (emailError && isValidEmail(value)) setEmailError('');
            }}
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
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
          {formError && <div className="text-red-500 text-sm mb-4">{formError}</div>}
          <Button type="submit" className="w-full">
            Create Client
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, client: null })} title="Edit Client">
        {editModal.client && (
          <form onSubmit={handleEdit}>
            <Input
              label="Name"
              value={editModal.client.name}
              onChange={(e) => setEditModal({ ...editModal, client: { ...editModal.client, name: e.target.value } })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={editModal.client.email}
              error={emailError}
              onChange={(e) => {
                const value = e.target.value;
                setEditModal({ ...editModal, client: { ...editModal.client, email: value } });
                if (emailError && isValidEmail(value)) setEmailError('');
              }}
            />
            <Input
              label="Phone"
              value={editModal.client.phone}
              onChange={(e) => setEditModal({ ...editModal, client: { ...editModal.client, phone: formatPhone(e.target.value) } })}
            />
            <Input
              label="Company"
              value={editModal.client.company}
              onChange={(e) => setEditModal({ ...editModal, client: { ...editModal.client, company: e.target.value } })}
            />
            <Input
              label="Notes"
              value={editModal.client.notes}
              onChange={(e) => setEditModal({ ...editModal, client: { ...editModal.client, notes: e.target.value } })}
            />
            {formError && <div className="text-red-500 text-sm mb-4">{formError}</div>}
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, clientId: null })} title="Delete Client?">
        <div className="mb-4">Are you sure you want to delete this client? This action cannot be undone.</div>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => handleDelete(deleteModal.clientId)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, clientId: null })}>
            Cancel
          </Button>
        </div>
      </Modal>

      <Popover
        open={infoPopover.open}
        anchorRef={{ current: infoPopover.anchor }}
        onClose={() => setInfoPopover({ open: false, client: null, anchor: null })}
      >
        {infoPopover.client && (
          <div className="space-y-2">
            <div><span className="font-bold">Name:</span> {infoPopover.client.name}</div>
            <div><span className="font-bold">Email:</span> {infoPopover.client.email || 'N/A'}</div>
            <div><span className="font-bold">Phone:</span> {formatPhone(infoPopover.client.phone) || 'N/A'}</div>
            <div><span className="font-bold">Company:</span> {infoPopover.client.company || 'N/A'}</div>
            <div><span className="font-bold">Notes:</span> {infoPopover.client.notes || <span className="italic text-slate-400">None</span>}</div>
          </div>
        )}
      </Popover>

      <Card>
        <Table columns={columns} data={clients} />
      </Card>
    </div>
  );
};
