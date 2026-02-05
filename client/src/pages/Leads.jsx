import { useEffect, useState } from 'react';
import { Button, Card, Loading, Error, Modal, Input, Popover } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { Plus, Trash2, Edit2, Info } from 'lucide-react';
import { useRef } from 'react';

const stages = ['lead', 'contacted', 'proposal', 'won', 'lost'];

export const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    source: '',
    notes: '',
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, leadId: null });
  const [editModal, setEditModal] = useState({ open: false, lead: null });
  const [infoPopover, setInfoPopover] = useState({ open: false, lead: null, anchor: null });

  const leadTitleRegex = /^[A-Za-z0-9 ]+$/;
  const leadSourceRegex = /^[A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=% ]+$/;
  const leadNotesRegex = /^[A-Za-z0-9 .!?$#%(),'" ]+$/;
  const sanitizeNumericInput = (raw) => {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length <= 1) return cleaned;
    return `${parts.shift()}.${parts.join('')}`;
  };
  const sanitizeSourceInput = (raw) => raw.replace(/[^A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=% ]+/g, '');
  const sanitizeNotesInput = (raw) => raw.replace(/[^A-Za-z0-9 .!?$#%(),'" ]+/g, '').slice(0, 150);

  const validateLead = (data) => {
    const errors = {};
    if (!data.title || !String(data.title).trim()) {
      errors.title = 'Title is required';
    } else if (!leadTitleRegex.test(String(data.title).trim())) {
      errors.title = 'Title may only include letters, numbers, and spaces';
    }
    if (data.value === '' || data.value === null || Number.isNaN(Number(data.value))) {
      errors.value = 'Value is required';
    }
    if (!data.source || !String(data.source).trim()) errors.source = 'Source is required';
    if (data.notes && (!leadNotesRegex.test(String(data.notes)) || String(data.notes).length > 150)) {
      errors.notes = 'Notes may only include letters, numbers, spaces, and . ! ? $ # % ( ) , \' " (max 150 chars)';
    }
    return errors;
  };

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
    const errors = validateLead(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      await api.leads.create({
        ...formData,
        valueCents: Math.round(Number(formData.value) * 100),
      });
      setIsModalOpen(false);
      setFormData({ title: '', value: '', source: '', notes: '' });
      setFormErrors({});
      loadLeads();
    } catch (err) {
      setError(err.error?.message || 'Failed to create lead');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.leads.delete(id);
      setDeleteModal({ open: false, leadId: null });
      loadLeads();
    } catch (err) {
      setError(err.error?.message || 'Failed to delete lead');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const errors = validateLead(editModal.lead);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    try {
      // Ensure value is a number
      const value = typeof editModal.lead.value === 'string' ? parseFloat(editModal.lead.value) : editModal.lead.value;
      await api.leads.update(editModal.lead._id, {
        title: editModal.lead.title,
        valueCents: Math.round(Number(value) * 100),
        source: editModal.lead.source,
        notes: editModal.lead.notes,
        stage: editModal.lead.stage,
      });
      setEditModal({ open: false, lead: null });
      setEditErrors({});
      loadLeads();
    } catch (err) {
      setError(err.error?.message || 'Failed to update lead');
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
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="text-3xl font-bold">Leads Pipeline</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <span className="flex items-center"><Plus className="w-4 h-4 mr-2" />New Lead</span>
        </Button>
      </div>

      {error && <Error message={error} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Lead">
        <form onSubmit={handleCreateLead}>
          <Input
            label="Title *"
            value={formData.title}
            error={formErrors.title}
            onChange={(e) => {
              const value = e.target.value.replace(/[^A-Za-z0-9 ]+/g, '');
              setFormData({ ...formData, title: value });
              if (formErrors.title && String(value).trim() && leadTitleRegex.test(String(value).trim())) {
                setFormErrors({ ...formErrors, title: '' });
              }
            }}
            pattern="[A-Za-z0-9 ]+"
            required
          />
          <Input
            label="Value ($) *"
            type="text"
            value={formData.value}
            min={0}
            step={0.01}
            error={formErrors.value}
            onChange={(e) => {
              const raw = sanitizeNumericInput(e.target.value);
              setFormData({ ...formData, value: raw });
              if (formErrors.value && raw !== '' && !Number.isNaN(Number(raw))) {
                setFormErrors({ ...formErrors, value: '' });
              }
            }}
            inputMode="decimal"
            pattern="[0-9]*[.]?[0-9]*"
            required
          />
          <Input
            label="Source *"
            value={formData.source}
            error={formErrors.source}
            onChange={(e) => {
              const value = sanitizeSourceInput(e.target.value);
              setFormData({ ...formData, source: value });
              if (formErrors.source && String(value).trim() && leadSourceRegex.test(String(value).trim())) {
                setFormErrors({ ...formErrors, source: '' });
              }
            }}
            pattern="[A-Za-z0-9\-._~:/?#\\[\\]@!$&'()*+,;=% ]+"
            required
          />
          <Input
            label="Notes (optional)"
            value={formData.notes}
            error={formErrors.notes}
            onChange={(e) => {
              const value = sanitizeNotesInput(e.target.value);
              setFormData({ ...formData, notes: value });
              if (formErrors.notes && leadNotesRegex.test(String(value)) && String(value).length <= 150) {
                setFormErrors({ ...formErrors, notes: '' });
              }
            }}
            maxLength={150}
          />
          <Button type="submit" className="w-full">
            Create Lead
          </Button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, leadId: null })} title="Delete Lead?">
        <div className="mb-4">Are you sure you want to delete this lead? This action cannot be undone.</div>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => handleDelete(deleteModal.leadId)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, leadId: null })}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, lead: null })} title="Edit Lead">
        {editModal.lead && (
          <form onSubmit={handleEdit}>
            <Input
              label="Title *"
              value={editModal.lead.title}
              error={editErrors.title}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z0-9 ]+/g, '');
                setEditModal({ ...editModal, lead: { ...editModal.lead, title: value } });
                if (editErrors.title && String(value).trim() && leadTitleRegex.test(String(value).trim())) {
                  setEditErrors({ ...editErrors, title: '' });
                }
              }}
              pattern="[A-Za-z0-9 ]+"
              required
            />
            <Input
              label="Value ($) *"
              type="text"
              value={editModal.lead.value}
              min={0}
              step={0.01}
              error={editErrors.value}
              onChange={(e) => {
                const raw = sanitizeNumericInput(e.target.value);
                setEditModal({ ...editModal, lead: { ...editModal.lead, value: raw } });
                if (editErrors.value && raw !== '' && !Number.isNaN(Number(raw))) {
                  setEditErrors({ ...editErrors, value: '' });
                }
              }}
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              required
            />
            <Input
              label="Source *"
              value={editModal.lead.source}
              error={editErrors.source}
              onChange={(e) => {
                const value = sanitizeSourceInput(e.target.value);
                setEditModal({ ...editModal, lead: { ...editModal.lead, source: value } });
                if (editErrors.source && String(value).trim() && leadSourceRegex.test(String(value).trim())) {
                  setEditErrors({ ...editErrors, source: '' });
                }
              }}         
              pattern="[A-Za-z0-9\-._~:/?#\\[\\]@!$&'()*+,;=% ]+"
              required
            />
            <Input
              label="Notes (optional)"
              value={editModal.lead.notes}
              error={editErrors.notes}
              onChange={(e) => {
                const value = sanitizeNotesInput(e.target.value);
                setEditModal({ ...editModal, lead: { ...editModal.lead, notes: value } });
                if (editErrors.notes && leadNotesRegex.test(String(value)) && String(value).length <= 150) {
                  setEditErrors({ ...editErrors, notes: '' });
                }
              }}
              maxLength={150}
            />
            <select
              className="w-full mb-4 px-2 py-1 border rounded text-sm"
              value={editModal.lead.stage}
              onChange={(e) => setEditModal({ ...editModal, lead: { ...editModal.lead, stage: e.target.value } })}
            >
              {stages.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        )}
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <Card key={stage} className="p-0 flex flex-col">
            <div className="bg-slate-100 px-4 py-3 rounded-t-lg border-b">
              <h2 className="font-bold text-lg capitalize text-center">{stage}</h2>
            </div>
            <div className="flex-1 divide-y">
              {leadsByStage[stage].length === 0 && (
                <div className="p-4 text-slate-400 text-center">No leads</div>
              )}
              {leadsByStage[stage].map((lead) => (
                <div key={lead._id} className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 group">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-800">{lead.title}</span>
                    <div className="flex gap-2">
                      <button
                        ref={el => {
                          if (infoPopover.open && infoPopover.lead && infoPopover.lead._id === lead._id) infoPopover.anchor = el;
                        }}
                        onClick={e => setInfoPopover({ open: true, lead, anchor: e.currentTarget })}
                        className="text-slate-500 opacity-0 group-hover:opacity-100 transition"
                        title="View Info"
                        type="button"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditModal({ open: true, lead: { ...lead, value: (lead.valueCents / 100).toFixed(2) } })}
                        className="text-blue-500 opacity-0 group-hover:opacity-100 transition"
                        title="Edit Lead"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, leadId: lead._id })}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Popover
                      open={infoPopover.open}
                      anchorRef={{ current: infoPopover.anchor }}
                      onClose={() => setInfoPopover({ open: false, lead: null, anchor: null })}
                    >
                      {infoPopover.lead && (
                        <div className="space-y-2">
                          <div><span className="font-bold">Title:</span> {infoPopover.lead.title}</div>
                          <div><span className="font-bold">Value:</span> ${ (infoPopover.lead.valueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</div>
                          <div><span className="font-bold">Source:</span> {infoPopover.lead.source}</div>
                          <div><span className="font-bold">Stage:</span> {infoPopover.lead.stage}</div>
                          <div><span className="font-bold">Notes:</span> {infoPopover.lead.notes || <span className="italic text-slate-400">None</span>}</div>
                        </div>
                      )}
                    </Popover>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Value: ${ (lead.valueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</span>
                    <span>Source: {lead.source}</span>
                  </div>
                  <select
                    className="w-full mt-2 px-2 py-1 border rounded text-sm"
                    value={lead.stage}
                    onChange={(e) => handleStageChange(lead._id, e.target.value)}
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
