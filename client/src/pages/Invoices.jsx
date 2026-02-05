import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Loading, Error, Modal, Input, Table } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { Plus, FileDown, Trash2 } from 'lucide-react';

export const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    lineItems: [{ description: '', qty: 1, unitPriceCents: 0 }],
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
    loadClients();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await api.invoices.getAll();
      setInvoices(data);
    } catch (err) {
      setError(err.error?.message || 'Failed to load invoices');
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

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await api.invoices.create(formData);
      setIsModalOpen(false);
      setFormData({
        clientId: '',
        lineItems: [{ description: '', qty: 1, unitPriceCents: 0 }],
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      loadInvoices();
    } catch (err) {
      setError(err.error?.message || 'Failed to create invoice');
    }
  };

  const handleDownloadPDF = (id) => {
    const pdfUrl = api.invoices.getPDF(id);
    window.open(pdfUrl, '_blank');
  };

  if (isLoading) return <Loading />;

  const columns = [
    { key: 'number', label: 'Number' },
    {
      key: 'clientId',
      label: 'Client',
      render: (row) => row.clientId?.name || 'N/A',
    },
    {
      key: 'totalCents',
      label: 'Amount',
      render: (row) => `$${(row.totalCents / 100).toFixed(2)}`,
    },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/app/invoices/${row._id}`)}
            className="text-blue-600 hover:text-blue-700"
          >
            View
          </button>
          <button
            onClick={() => handleDownloadPDF(row._id)}
            className="text-green-600 hover:text-green-700"
          >
            <FileDown className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </Button>
      </div>

      {error && <Error message={error} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Invoice">
        <form onSubmit={handleCreateInvoice}>
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
            label="Issue Date"
            type="date"
            value={formData.issueDate}
            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
          />

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          <h3 className="font-bold mt-4 mb-2">Line Items</h3>
          {formData.lineItems.map((item, idx) => (
            <div key={idx} className="border-b pb-2 mb-2">
              <Input
                label="Description"
                value={item.description}
                onChange={(e) => {
                  const newItems = [...formData.lineItems];
                  newItems[idx].description = e.target.value;
                  setFormData({ ...formData, lineItems: newItems });
                }}
              />
              <Input
                label="Qty"
                type="number"
                value={item.qty}
                onChange={(e) => {
                  const newItems = [...formData.lineItems];
                  newItems[idx].qty = parseInt(e.target.value);
                  setFormData({ ...formData, lineItems: newItems });
                }}
              />
              <Input
                label="Unit Price (cents)"
                type="number"
                value={item.unitPriceCents}
                onChange={(e) => {
                  const newItems = [...formData.lineItems];
                  newItems[idx].unitPriceCents = parseInt(e.target.value);
                  setFormData({ ...formData, lineItems: newItems });
                }}
              />
            </div>
          ))}

          <Button type="submit" className="w-full">
            Create Invoice
          </Button>
        </form>
      </Modal>

      <Card>
        <Table columns={columns} data={invoices} />
      </Card>
    </div>
  );
};
