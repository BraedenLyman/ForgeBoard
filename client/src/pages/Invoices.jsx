import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Loading, Error, Modal, Input, Table, Badge } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { Plus, FileDown, Trash2 } from 'lucide-react';

export const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    clientId: '',
    lineItems: [{ description: '', qty: 1, unitPrice: '' }],
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const navigate = useNavigate();

  const invoiceDescriptionRegex = /^[A-Za-z0-9 .!?$#%(),'" ]+$/;
  const sanitizeDescriptionInput = (raw) => raw.replace(/[^A-Za-z0-9 .!?$#%(),'" ]+/g, '');

  const sanitizeNumericInput = (raw) => {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length <= 1) return cleaned;
    return `${parts.shift()}.${parts.join('')}`;
  };

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

  const validateInvoice = (data) => {
    const errors = {};
    if (!data.clientId || !String(data.clientId).trim()) errors.clientId = 'Client is required';
    const itemErrors = data.lineItems.map((item) => {
      const entry = {};
      if (!item.description || !String(item.description).trim()) entry.description = 'Description is required';
      if (item.qty === '' || item.qty === null || Number.isNaN(Number(item.qty))) {
        entry.qty = 'Qty is required';
      }
      if (item.unitPrice === '' || item.unitPrice === null || Number.isNaN(Number(item.unitPrice))) {
        entry.unitPrice = 'Unit price is required';
      }
      return entry;
    });
    if (itemErrors.some((entry) => Object.keys(entry).length > 0)) errors.lineItems = itemErrors;
    return errors;
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const errors = validateInvoice(formData);
    if (Object.keys(errors).length > 0) {
      setError('');
      setFormErrors(errors);
      return;
    }
    try {
      const payload = {
        ...formData,
        lineItems: formData.lineItems.map((item) => ({
          description: item.description,
          qty: Number(item.qty),
          unitPriceCents: Math.round(Number(item.unitPrice) * 100),
        })),
      };
      await api.invoices.create(payload);
      setIsModalOpen(false);
      setFormData({
        clientId: '',
        lineItems: [{ description: '', qty: 1, unitPrice: '' }],
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setFormErrors({});
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

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', qty: 1, unitPrice: '' }],
    }));
  };

  const removeLineItem = (idx) => {
    setFormData((prev) => {
      if (prev.lineItems.length <= 1) return prev;
      return {
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== idx),
      };
    });
  };

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
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge color={row.status === 'paid' ? 'green' : row.status === 'sent' ? 'yellow' : 'blue'}>
          {row.status}
        </Badge>
      ),
    },
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
      <div className="sticky top-16 z-40 -mx-4 px-4 pt-4 pb-3 bg-slate-50/95 backdrop-blur border-b flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="text-3xl font-bold text-center sm:text-left">Invoices</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <span className="flex items-center"><Plus className="w-4 h-4 mr-2" />New Invoice</span>
        </Button>
      </div>

      {error && <Error message={error} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Invoice">
        <form onSubmit={handleCreateInvoice}>
          <div className="max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">
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
              {formErrors.clientId && <span className="text-red-500 text-sm mt-1">{formErrors.clientId}</span>}
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

            <div className="flex items-center justify-between mt-4 mb-2">
              <h3 className="font-bold">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                title="Add Line Item"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </button>
            </div>
            {formData.lineItems.map((item, idx) => (
              <div key={idx} className="border-b pb-2 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Item {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeLineItem(idx)}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    disabled={formData.lineItems.length <= 1}
                    title="Remove Line Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  label="Description *"
                  value={item.description}
                  error={formErrors.lineItems?.[idx]?.description}
                  onChange={(e) => {
                    const value = sanitizeDescriptionInput(e.target.value);
                    const newItems = [...formData.lineItems];
                    newItems[idx].description = value;
                    setFormData({ ...formData, lineItems: newItems });
                    if (formErrors.lineItems?.[idx]?.description && String(value).trim()) {
                      const nextErrors = { ...formErrors };
                      nextErrors.lineItems = [...(nextErrors.lineItems || [])];
                      if (nextErrors.lineItems[idx]) delete nextErrors.lineItems[idx].description;
                      setFormErrors(nextErrors);
                    }
                  }}
                  required
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      label="Qty *"
                      type="number"
                      value={item.qty}
                      error={formErrors.lineItems?.[idx]?.qty}
                      onChange={(e) => {
                        const newItems = [...formData.lineItems];
                        newItems[idx].qty = parseInt(e.target.value);
                        setFormData({ ...formData, lineItems: newItems });
                        if (formErrors.lineItems?.[idx]?.qty && e.target.value !== '') {
                          const nextErrors = { ...formErrors };
                          nextErrors.lineItems = [...(nextErrors.lineItems || [])];
                          if (nextErrors.lineItems[idx]) delete nextErrors.lineItems[idx].qty;
                          setFormErrors(nextErrors);
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Unit Price ($) *"
                      type="text"
                      value={item.unitPrice}
                      error={formErrors.lineItems?.[idx]?.unitPrice}
                      onChange={(e) => {
                        const value = sanitizeNumericInput(e.target.value);
                        const newItems = [...formData.lineItems];
                        newItems[idx].unitPrice = value;
                        setFormData({ ...formData, lineItems: newItems });
                        if (formErrors.lineItems?.[idx]?.unitPrice && value !== '') {
                          const nextErrors = { ...formErrors };
                          nextErrors.lineItems = [...(nextErrors.lineItems || [])];
                          if (nextErrors.lineItems[idx]) delete nextErrors.lineItems[idx].unitPrice;
                          setFormErrors(nextErrors);
                        }
                      }}
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Create Invoice
          </Button>
        </form>
      </Modal>

      <div className="md:hidden space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice._id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-slate-900">{invoice.number}</div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => navigate(`/app/invoices/${invoice._id}`)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                  type="button"
                >
                  View
                </button>
                <button
                  onClick={() => handleDownloadPDF(invoice._id)}
                  className="text-green-600 hover:text-green-700"
                  title="Download PDF"
                  type="button"
                >
                  <FileDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              <div><span className="font-medium text-slate-800">Client:</span> {invoice.clientId?.name || 'N/A'}</div>
              <div><span className="font-medium text-slate-800">Amount:</span> ${(invoice.totalCents / 100).toFixed(2)}</div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">Status:</span>
                <Badge color={invoice.status === 'paid' ? 'green' : invoice.status === 'sent' ? 'yellow' : 'blue'}>
                  {invoice.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="hidden md:block">
        <Table columns={columns} data={invoices} />
      </Card>
    </div>
  );
};
